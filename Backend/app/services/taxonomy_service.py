"""
taxonomy_service.py — Task 1

Loads taxonomy.json once (singleton) and exposes read-only helpers.
No business logic lives here.
"""

import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

_TAXONOMY_PATH = Path(__file__).resolve().parent.parent / "data" / "taxonomy.json"

# ── Singleton cache ──────────────────────────────────────────────────────────
_taxonomy_cache: Optional[Dict[str, Any]] = None


def _load_taxonomy() -> Dict[str, Any]:
    """Read taxonomy.json from disk exactly once."""
    global _taxonomy_cache
    if _taxonomy_cache is None:
        logger.info("Loading taxonomy from %s", _TAXONOMY_PATH)
        with open(_TAXONOMY_PATH, "r", encoding="utf-8") as fh:
            _taxonomy_cache = json.load(fh)
        logger.info(
            "Taxonomy loaded — %d verdicts, %d repairs",
            len(_taxonomy_cache.get("verdicts", {})),
            len(_taxonomy_cache.get("repairs", {})),
        )
    return _taxonomy_cache


# ── Public API ───────────────────────────────────────────────────────────────

def get_taxonomy() -> Dict[str, Any]:
    """Return the full taxonomy dict."""
    return _load_taxonomy()


def get_verdict(verdict_key: str) -> Optional[str]:
    """Return description for a verdict key, or None if unknown."""
    return _load_taxonomy().get("verdicts", {}).get(verdict_key)


def get_repair(repair_key: str) -> Optional[Dict[str, Any]]:
    """Return full repair object for a repair key, or None if unknown."""
    return _load_taxonomy().get("repairs", {}).get(repair_key)


def is_valid_verdict(verdict_key: str) -> bool:
    """True if the verdict key exists in the taxonomy."""
    return verdict_key in _load_taxonomy().get("verdicts", {})


def is_valid_repair(repair_key: Optional[str]) -> bool:
    """True if repair_key is None (no repair needed) or exists in taxonomy."""
    if repair_key is None:
        return True
    return repair_key in _load_taxonomy().get("repairs", {})


def get_allowed_fields(repair_key: str) -> List[str]:
    """Return the list of fields a repair is allowed to touch."""
    repair = get_repair(repair_key)
    if repair is None:
        return []
    return repair.get("fields", [])


def is_auto_apply(repair_key: str) -> bool:
    """True if the repair can be applied automatically without faculty approval."""
    repair = get_repair(repair_key)
    if repair is None:
        return False
    return bool(repair.get("auto", False))
