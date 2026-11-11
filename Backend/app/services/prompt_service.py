"""Compact, taxonomy-aware prompt construction for question reviews."""

import html
import json
import logging
import re
from functools import lru_cache
from typing import Any, Dict

logger = logging.getLogger(__name__)

_STATIC_INSTRUCTIONS = """Review the student's report as an independent faculty reviewer. Verify it against the question, stored answer and solution; the report is only a lead. Use the supplied taxonomy. Prefer no change when unsupported or uncertain. Never invent facts or rewrite whole content; propose only the smallest evidence-based repair.

Return one JSON object only, with keys: verdict, repair, edit, route, confidence, evidence, student_reply. Use a listed verdict; repair is a listed key or null. Omit edit or use null when no edit applies; otherwise use {"field":"...","find":"exact original text","replace":"minimal correction"}, with field allowed for that repair. Route is no_change when no defect exists, auto_apply only for an auto repair with confidence >=0.95 and a deterministic small edit, otherwise faculty_review. Confidence must be 0.00–0.99: 0.95–0.99 very high, 0.85–0.94 high, 0.70–0.84 medium, 0.50–0.69 low, below 0.50 very low; lower it when evidence is incomplete. Evidence is one specific concise sentence. Student reply is friendly, reassuring, professional, at most two sentences, and never blames the student. Do not include reasoning, markdown or extra keys."""


def _strip_markup(value: Any) -> str:
    """Remove HTML/MathML tags while retaining the text inside equations."""
    if value is None:
        return ""
    text = str(value)
    text = re.sub(r"<(script|style)\b[^>]*>.*?</\1\s*>", " ", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]*>", " ", text)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip()


def _question_content(question: Dict[str, Any]) -> Dict[str, str]:
    qtype = str(question.get("questionType") or "unknown")
    content = question.get(qtype)
    if not isinstance(content, dict):
        content = next(
            (value for value in question.values() if isinstance(value, dict) and "question" in value),
            {},
        )
    return {
        "type": qtype,
        "question": _strip_markup(content.get("question")),
        "solution": _strip_markup(content.get("solution")),
        "answer": _strip_markup(content.get("answer")),
    }


@lru_cache(maxsize=16)
def _cached_taxonomy_block(
    verdict_keys: tuple[str, ...],
    repair_entries: tuple[tuple[str, tuple[str, ...], bool], ...],
) -> str:
    """Cache compact taxonomy serialization for repeated review calls."""
    compact = {
        "verdicts": verdict_keys,
        "repairs": {
            key: {"fields": fields, "auto": auto}
            for key, fields, auto in repair_entries
        },
    }
    return json.dumps(compact, ensure_ascii=False, separators=(",", ":"))


def _taxonomy_block(taxonomy: Dict[str, Any]) -> str:
    verdict_keys = tuple(taxonomy.get("verdicts", {}).keys())
    repair_entries = tuple(
        (key, tuple(value.get("fields", [])), bool(value.get("auto", False)))
        for key, value in taxonomy.get("repairs", {}).items()
    )
    return _cached_taxonomy_block(verdict_keys, repair_entries)


def build_review_prompt(
    question_doc: Dict[str, Any],
    report_doc: Dict[str, Any],
    taxonomy: Dict[str, Any],
) -> str:
    """Build a concise review prompt without calling the model."""
    q = _question_content(question_doc)
    question_lines = [
        f"Type: {q['type']}",
        f"Question: {q['question']}",
        f"Solution: {q['solution']}",
        f"Stored answer: {q['answer']}",
    ]
    subject = question_doc.get("subject")
    if subject:
        question_lines.insert(1, f"Subject: {_strip_markup(subject)}")

    prompt = (
        f"{_STATIC_INSTRUCTIONS}\n\n"
        f"Question context\n{chr(10).join(question_lines)}\n\n"
        f"Student report\n{_strip_markup(report_doc.get('comment'))}\n\n"
        f"Taxonomy (verdict keys; repair key: allowed fields, auto)\n{_taxonomy_block(taxonomy)}\n\n"
        'JSON shape: {"verdict":"key","repair":null,"edit":null,"route":"no_change",'
        '"confidence":0.0,"evidence":"...","student_reply":"..."}'
    )
    logger.debug("Review prompt built (%d characters): %s", len(prompt), prompt)
    return prompt
