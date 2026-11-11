"""Async Gemini transport for AI reviews."""

import asyncio
import logging
import random
from time import perf_counter
from typing import Any, Dict, Optional

from google import genai
from google.genai import errors as genai_errors
from google.genai import types as genai_types

from app.core.config import settings
from app.utils.json_parser import parse_json_object

logger = logging.getLogger(__name__)

MODEL_ID = "gemini-3.5-flash-lite"
TIMEOUT_SECONDS = 30
MAX_TRANSIENT_RETRIES = 1
TRANSIENT_API_CODES = {429, 503}
MAX_OUTPUT_TOKENS = 450


class AIServiceError(RuntimeError):
    """Base exception for Gemini communication and response errors."""


class AIConfigurationError(AIServiceError):
    """Raised when the Gemini API key is not configured."""


class AITimeoutError(AIServiceError):
    """Raised when a Gemini request exceeds its deadline."""


class AIQuotaExceededError(AIServiceError):
    """Raised when Gemini rejects a request due to quota or rate limits."""


class AIAPIError(AIServiceError):
    """Raised when Gemini reports an API error."""


class AINetworkError(AIServiceError):
    """Raised when the Gemini API cannot be reached."""


class AIResponseError(AIServiceError):
    """Raised when Gemini returns an empty or invalid JSON response."""


class AIService:
    """Call Gemini asynchronously and return a JSON object."""

    def __init__(self, client: Optional[genai.Client] = None) -> None:
        # Optional client injection keeps the service easy to substitute in callers.
        self._client = client

    def _get_client(self) -> genai.Client:
        if self._client is None:
            api_key = settings.GEMINI_API_KEY
            if not api_key or not api_key.strip():
                raise AIConfigurationError("GEMINI_API_KEY is not configured.")
            self._client = genai.Client(
                api_key=api_key,
                http_options=genai_types.HttpOptions(timeout=TIMEOUT_SECONDS * 1000),
            )
        return self._client

    @staticmethod
    def _extract_json(text: str) -> Dict[str, Any]:
        if not text or not text.strip():
            raise AIResponseError("Gemini returned an empty response.")
        parsed = parse_json_object(text)
        if parsed is None:
            raise AIResponseError("Gemini response was not a valid JSON object.")
        return parsed

    @staticmethod
    def _is_temporary_network_error(exc: Exception) -> bool:
        names = {cls.__name__.lower() for cls in type(exc).__mro__}
        temporary_types = {
            "connecterror", "networkerror", "connectionerror", "remoteprotocolerror",
            "readerror", "writeerror", "connecttimeout", "readtimeout",
        }
        return isinstance(exc, (ConnectionError, OSError)) or bool(names & temporary_types)

    @staticmethod
    def _normalize_confidence(result: Dict[str, Any]) -> None:
        confidence = result.get("confidence")
        if isinstance(confidence, bool) or not isinstance(confidence, (int, float)):
            return
        if 0.0 <= confidence <= 1.0:
            result["confidence"] = min(float(confidence), 0.99)

    async def _request_with_retries(self, client: genai.Client, prompt: str) -> Any:
        """Retry temporary Gemini server errors within the request deadline."""
        for attempt in range(MAX_TRANSIENT_RETRIES + 1):
            try:
                return await client.aio.models.generate_content(
                    model=MODEL_ID,
                    contents=prompt,
                    config=genai_types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.2,
                        top_p=0.8,
                        max_output_tokens=MAX_OUTPUT_TOKENS,
                    ),
                )
            except genai_errors.APIError as exc:
                code = getattr(exc, "code", None)
                is_transient = code in TRANSIENT_API_CODES
                if not is_transient or attempt >= MAX_TRANSIENT_RETRIES:
                    raise
                delay = 0.5 * (2**attempt) + random.uniform(0, 0.25)
                logger.warning(
                    "Gemini transient API error code=%s; retry %d/%d in %.2fs",
                    code,
                    attempt + 1,
                    MAX_TRANSIENT_RETRIES,
                    delay,
                )
                await asyncio.sleep(delay)
            except Exception as exc:
                if not self._is_temporary_network_error(exc) or attempt >= MAX_TRANSIENT_RETRIES:
                    raise
                delay = 0.5 * (2**attempt) + random.uniform(0, 0.25)
                logger.warning(
                    "Gemini temporary network error; retry %d/%d in %.2fs",
                    attempt + 1,
                    MAX_TRANSIENT_RETRIES,
                    delay,
                )
                await asyncio.sleep(delay)

    async def generate_review(self, prompt: str) -> Dict[str, Any]:
        """Request JSON from Gemini and return the parsed response dictionary."""
        started = perf_counter()
        logger.info("Gemini request started model=%s", MODEL_ID)
        logger.info("Gemini prompt_tokens_estimate=%d", max(1, len(prompt) // 4))
        logger.debug("Gemini prompt: %s", prompt)
        try:
            client = self._get_client()
            response = await asyncio.wait_for(
                self._request_with_retries(client, prompt),
                timeout=TIMEOUT_SECONDS,
            )
            logger.info("Gemini response received model=%s", MODEL_ID)
            self._log_usage(response)
            raw_response = response.text or ""
            logger.info("Gemini raw response: %s", raw_response)
            result = self._extract_json(raw_response)
            self._normalize_confidence(result)
            return result
        except asyncio.TimeoutError as exc:
            raise AITimeoutError(
                f"Gemini request timed out after {TIMEOUT_SECONDS} seconds."
            ) from exc
        except AIServiceError:
            raise
        except genai_errors.APIError as exc:
            code = getattr(exc, "code", None)
            if code == 429 or "quota" in str(exc).lower() or "resource_exhausted" in str(exc).lower():
                raise AIQuotaExceededError("Gemini quota or rate limit exceeded.") from exc
            raise AIAPIError(f"Gemini API request failed (code={code}).") from exc
        except (ConnectionError, OSError) as exc:
            raise AINetworkError("Unable to reach the Gemini API.") from exc
        except Exception as exc:
            # The SDK can surface transport failures through its HTTP dependency types.
            error_name = type(exc).__name__.lower()
            error_text = str(exc).lower()
            if "timeout" in error_name or "timed out" in error_text:
                raise AITimeoutError("Gemini request timed out.") from exc
            if "connect" in error_name or "network" in error_name:
                raise AINetworkError("Unable to reach the Gemini API.") from exc
            if "quota" in error_text or "resource_exhausted" in error_text:
                raise AIQuotaExceededError("Gemini quota or rate limit exceeded.") from exc
            raise AIAPIError("Gemini request failed unexpectedly.") from exc
        finally:
            logger.info("Gemini execution_time_ms=%.2f", (perf_counter() - started) * 1000)

    @staticmethod
    def _log_usage(response: Any) -> None:
        usage = getattr(response, "usage_metadata", None)
        if usage is None:
            logger.info("Gemini token usage unavailable")
            return
        logger.info(
            "Gemini token usage prompt_tokens=%s completion_tokens=%s total_tokens=%s",
            getattr(usage, "prompt_token_count", None),
            getattr(usage, "candidates_token_count", None),
            getattr(usage, "total_token_count", None),
        )


_default_service = AIService()


async def generate_review(prompt: str) -> Dict[str, Any]:
    """Backward-compatible module entry point used by the review orchestrator."""
    return await _default_service.generate_review(prompt)
