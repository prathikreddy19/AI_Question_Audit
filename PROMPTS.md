# PROMPTS.md

## Overview

This project uses Google's Gemini AI to assist faculty in reviewing student-reported issues in JEE/NEET questions.

The AI does **not** directly modify questions. Instead, it analyzes the reported issue, classifies it using a predefined taxonomy, and recommends the appropriate action. Faculty members retain final approval before any changes are applied.

---

# AI Review Pipeline

```
Student Report
        │
        ▼
Question + Report
        │
        ▼
Prompt Builder
        │
        ▼
Gemini AI
        │
        ▼
JSON Validation
        │
        ▼
AI Review Record
        │
        ▼
Faculty Approval
```

---

# Prompt Design Goals

The prompt was designed with the following objectives:

- Produce deterministic JSON output
- Minimize token usage
- Reduce hallucinations
- Prevent unnecessary explanations
- Generate structured responses suitable for backend processing
- Keep the AI output easy to validate before storing in MongoDB

---

# Input to Gemini

Each AI request contains only the minimum information required:

## Question

- Question Type
- Question Text
- Solution
- Correct Answer
- Subject (optional)

## Student Report

- Student comment
- Report identifier

## Taxonomy

- Valid verdicts
- Valid repair actions
- Allowed editable fields

---

# Expected Output

Gemini returns a JSON object in the following format:

```json
{
  "verdict": "...",
  "repair": "...",
  "edit": {
    "field": "...",
    "find": "...",
    "replace": "..."
  },
  "route": "...",
  "confidence": 0.95,
  "evidence": "...",
  "student_reply": "..."
}
```

Only valid JSON responses are accepted.

---

# Validation

Before storing the response:

- Required fields are verified
- Verdict must exist in the taxonomy
- Repair action must be valid
- Confidence must be between 0 and 1
- Edit instructions are validated
- Invalid responses are rejected

---

# Error Handling

If Gemini fails due to:

- Timeout
- Invalid JSON
- Empty response
- API error
- Rate limit
- Network issue

the system automatically creates a manual faculty review instead of applying AI suggestions.

---

# Prompt Optimization

To reduce latency and API cost:

- Static instructions are cached
- Taxonomy is compacted
- HTML is removed before sending
- Only relevant question fields are included
- Maximum output tokens are limited
- Temperature is kept low for deterministic responses

---

# Safety

The AI never directly updates the database.

Every suggestion passes through:

1. JSON validation
2. Backend validation
3. Faculty approval

This ensures AI recommendations cannot modify production data without human review.

---

# AI Model

- Google Gemini
- JSON Response Mode
- Low Temperature
- Async API Calls

---

# Design Philosophy

The AI acts as an **assistant**, not a decision-maker.

Faculty members remain responsible for reviewing and approving any suggested modifications before they are applied to the question bank.
