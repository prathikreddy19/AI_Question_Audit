"""
validation_service.py — Task 4

Validates the raw dict returned by Gemini against the taxonomy.
Never modifies the AI output — only reads and annotates.
"""

import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

from app.services import taxonomy_service

logger = logging.getLogger(__name__)

VALID_ROUTES = {"auto_apply", "faculty_review", "no_change"}


# ── Result container ─────────────────────────────────────────────────────────

@dataclass
class ValidationResult:
    valid: bool
    errors: List[str] = field(default_factory=list)


# ── Validators ───────────────────────────────────────────────────────────────

def _check_structure(data: Dict[str, Any], errors: List[str]) -> None:
    """Required top-level keys must be present."""
    # `edit` is optional: Gemini may omit it when no repair/edit applies.
    required = {"verdict", "repair", "route", "confidence", "evidence", "student_reply"}
    for key in required:
        if key not in data:
            errors.append(f"Missing required field: '{key}'")
    for key in ("verdict", "route", "evidence", "student_reply"):
        if key in data and not isinstance(data[key], str):
            errors.append(f"'{key}' must be a string.")
    if "repair" in data and data["repair"] is not None and not isinstance(data["repair"], str):
        errors.append("'repair' must be a string or null.")
    if "edit" in data and data["edit"] is not None:
        edit = data["edit"]
        if not isinstance(edit, dict):
            errors.append("'edit' must be an object or null.")
        else:
            for key in ("field", "find", "replace"):
                if key not in edit:
                    errors.append(f"Missing required edit field: '{key}'.")
                elif not isinstance(edit[key], str):
                    errors.append(f"edit.{key} must be a string.")


def _check_verdict(data: Dict[str, Any], errors: List[str]) -> None:
    verdict = data.get("verdict")
    if not isinstance(verdict, str) or not taxonomy_service.is_valid_verdict(verdict):
        errors.append(
            f"verdict '{verdict}' is not in the taxonomy. "
            f"Allowed: {list(taxonomy_service.get_taxonomy().get('verdicts', {}).keys())}"
        )


def _check_repair(data: Dict[str, Any], errors: List[str]) -> None:
    repair = data.get("repair")
    if repair is not None and not taxonomy_service.is_valid_repair(repair):
        errors.append(
            f"repair '{repair}' is not in the taxonomy. "
            f"Allowed: {list(taxonomy_service.get_taxonomy().get('repairs', {}).keys())}"
        )


def _check_edit_field(data: Dict[str, Any], errors: List[str]) -> None:
    """If an edit is supplied, its field must be in the repair's allowed list."""
    repair = data.get("repair")
    edit = data.get("edit")

    if edit is None:
        return

    if not isinstance(edit, dict):
        errors.append("'edit' must be a JSON object with 'field', 'find', 'replace'.")
        return

    if not repair:
        errors.append("'edit' was provided but 'repair' is null — inconsistent.")
        return

    edit_field = edit.get("field", "")
    allowed = taxonomy_service.get_allowed_fields(repair)

    # Repairs with auto=false have empty allowed-fields — no edit permitted
    if not allowed:
        errors.append(
            f"repair '{repair}' has auto=false and no allowed fields — "
            f"'edit' must be omitted."
        )
        return

    if edit_field not in allowed:
        errors.append(
            f"edit.field '{edit_field}' is not allowed for repair '{repair}'. "
            f"Allowed fields: {allowed}"
        )


def _check_confidence(data: Dict[str, Any], errors: List[str]) -> None:
    confidence = data.get("confidence")
    if confidence is None:
        return
    try:
        if isinstance(confidence, bool) or not isinstance(confidence, (int, float)):
            raise TypeError
        val = float(confidence)
        if not (0.0 <= val <= 1.0):
            errors.append(f"confidence {val} is out of range [0.0, 1.0].")
    except (TypeError, ValueError):
        errors.append(f"confidence must be a float, got: {confidence!r}")


def _check_route(data: Dict[str, Any], errors: List[str]) -> None:
    route = data.get("route")
    if not isinstance(route, str) or route not in VALID_ROUTES:
        errors.append(
            f"route '{route}' is invalid. Allowed: {sorted(VALID_ROUTES)}"
        )


# ── Public entry point ────────────────────────────────────────────────────────

def validate_ai_output(data: Optional[Dict[str, Any]]) -> ValidationResult:
    """
    Run all checks on the raw AI output dict.
    Returns ValidationResult(valid=True/False, errors=[...]).
    Does NOT modify *data*.
    """
    if not data or not isinstance(data, dict):
        return ValidationResult(valid=False, errors=["AI output is null or not a dict."])

    errors: List[str] = []
    _check_structure(data, errors)
    _check_verdict(data, errors)
    _check_repair(data, errors)
    _check_edit_field(data, errors)
    _check_confidence(data, errors)
    _check_route(data, errors)

    if errors:
        logger.warning("AI output validation failed: %s", errors)
        return ValidationResult(valid=False, errors=errors)

    return ValidationResult(valid=True, errors=[])
