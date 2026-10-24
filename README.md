# vcon — Brand & Regulatory Compliance Workflow Engine

**Team CON-V (FutureStack Round 2 Submission)**

## Overview
vcon is a hybrid Brand & Regulatory Compliance Workflow Engine that combines deterministic rule checks (banned lexicon, mandatory legal disclaimers, WCAG alt-text, and brand hex palette checks) with grounded claim verification and human-in-the-loop override workflows.

## Completed Features (Round 2)
- F1: 4-Role Instant Demo Switcher (JUDGE DEMO, CREATOR, REVIEWER, APPROVER) + Top Judge Quick-Start Banner.
- F2: Multi-Brand Policy Kits (ApexFin FinTech & VitalGlow Health) with live lexicon, disclaimer, and hex color swatches.
- F3: Multi-Channel Content Submission Studio with 1-Click Sample Presets.
- F4 & F9: Deterministic Lexicon, Disclaimer, Alt-Text & Brand Palette Checks (RULE-LEX-01, RULE-DISC-03, RULE-A11Y-04, RULE-BRAND-05).
- F5 & F6: Grounded Claim & Citation Verification + 1-Click Auto-Fix (RULE-AI-GROUND-02) with source citations and instant copy remediation.
- F7 & F8: Compliance Audit Queue & Human Review Decisions (Approve, Reject, Override with Mandatory Legal Justification).
- F10: Compliance Certificate Exporter (1-click copy of audit trail and approved copy).
- F11: 10-Post Automated Evaluation Benchmark (backend/eval.py — 100% violation detection, 0% false flags).

## Evaluation Benchmark (python3 backend/eval.py)
| Metric | Result |
| :--- | :--- |
| Total Sample Posts Evaluated | 10 (5 Violating, 5 Compliant) |
| Violation Detection Rate (Recall) | 100% (5/5 flagged) |
| False Positive Rate | 0% (0/5 false flags) |

## Local Setup
1. Backend (FastAPI): source venv/bin/activate && cd backend && uvicorn main:app --reload
2. Frontend (Next.js): cd frontend && npm run dev
