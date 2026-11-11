"""
json_parser.py — Task 8

Safely extract a JSON object from a Gemini response string.
Handles:
  - Pure JSON
  - ```json … ``` fences
  - ``` … ``` fences (no language tag)
  - Stray leading / trailing prose
"""

import json
import logging
import re
from typing import Any, Dict, Iterator, Optional

logger = logging.getLogger(__name__)

_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL | re.IGNORECASE)


def _object_candidates(text: str) -> Iterator[str]:
    """Yield balanced object slices without being confused by braces in strings."""
    for start, char in enumerate(text):
        if char != "{":
            continue
        depth, quoted, escaped = 0, False, False
        for end in range(start, len(text)):
            current = text[end]
            if quoted:
                if escaped:
                    escaped = False
                elif current == "\\":
                    escaped = True
                elif current == '"':
                    quoted = False
                continue
            if current == '"':
                quoted = True
            elif current == "{":
                depth += 1
            elif current == "}":
                depth -= 1
                if depth == 0:
                    yield text[start : end + 1]
                    break


def _remove_trailing_commas(text: str) -> str:
    """Remove commas directly before a closing bracket, excluding string contents."""
    output = []
    quoted = escaped = False
    index = 0
    while index < len(text):
        char = text[index]
        if quoted:
            output.append(char)
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                quoted = False
            index += 1
            continue
        if char == '"':
            quoted = True
            output.append(char)
        elif char == ",":
            lookahead = index + 1
            while lookahead < len(text) and text[lookahead].isspace():
                lookahead += 1
            if lookahead >= len(text) or text[lookahead] not in "]}":
                output.append(char)
        else:
            output.append(char)
        index += 1
    return "".join(output)


def parse_json_object(text: str) -> Optional[Dict[str, Any]]:
    """Parse a JSON object, tolerating whitespace and trailing commas only."""
    if not text or not text.strip():
        return None
    for candidate in (text.strip(), _remove_trailing_commas(text.strip())):
        try:
            value = json.loads(candidate)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            return value
        return None
    return None


def extract_json(text: str) -> Optional[Dict[str, Any]]:
    """
    Try multiple strategies to find and parse a JSON object from *text*.
    Returns the parsed dict, or None if all attempts fail.
    """
    if not text:
        return None

    text = text.strip()
    # Strategy 1 — direct parse (Gemini sometimes returns clean JSON)
    parsed = parse_json_object(text)
    if parsed is not None:
        return parsed

    # Strategy 2 — strip code fences
    fence_match = _FENCE_RE.search(text)
    if fence_match:
        for candidate in _object_candidates(fence_match.group(1)):
            parsed = parse_json_object(candidate)
            if parsed is not None:
                return parsed

    # Strategy 3 — find first bare {...} block
    for candidate in _object_candidates(text):
        parsed = parse_json_object(candidate)
        if parsed is not None:
            return parsed

    logger.warning("extract_json: exhausted all strategies — returning None")
    return None
