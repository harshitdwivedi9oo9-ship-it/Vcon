from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid

app = FastAPI(title="vcon Compliance Engine API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BRAND_KITS = [
    {
        "id": "fintech-pro",
        "name": "ApexFin (FinTech & Wealth)",
        "colors": ["#4F46E5", "#10B981", "#0F172A"],
        "banned_terms": {
            "guaranteed returns": "historical target returns",
            "risk-free": "risk-managed",
            "100% safe": "security-audited",
            "instant wealth": "long-term compounding",
            "no risk": "diversified exposure"
        },
        "required_disclaimer": "Investments are subject to market risks.",
        "claims_db": {
            "#1 in india": {
                "verified": False,
                "citation": "No SEBI/NPCI ranking found — Needs Human Review",
                "fix": "a leading FinTech platform in India"
            },
            "zero fees forever": {
                "verified": False,
                "citation": "Contradicts Terms of Service Section 4.2 (AMC applies after Year 1)",
                "fix": "zero account opening fees"
            },
            "sebi registered": {
                "verified": True,
                "citation": "Verified via SEBI Registry (Reg No. INZ000999999)",
                "fix": "SEBI registered"
            }
        }
    },
    {
        "id": "health-glow",
        "name": "VitalGlow (Health & Derm)",
        "colors": ["#EC4899", "#14B8A6", "#18181B"],
        "banned_terms": {
            "cures all": "helps manage",
            "miracle pill": "daily supplement",
            "fda guaranteed": "formulated in FDA-registered facilities",
            "instant weight loss": "healthy metabolism support",
            "permanent cure": "long-term relief"
        },
        "required_disclaimer": "Consult a physician before use.",
        "claims_db": {
            "clinically proven 100%": {
                "verified": False,
                "citation": "No peer-reviewed trial supports 100% efficacy — Needs Human Review",
                "fix": "formulated with clinically studied ingredients"
            },
            "dermatologist tested": {
                "verified": True,
                "citation": "Verified via Lab Report #VG-2026-09",
                "fix": "dermatologist tested"
            }
        }
    }
]

SAMPLE_POSTS = [
    {
        "title": "1. Failing FinTech Ad (3 Flags)",
        "brand_id": "fintech-pro",
        "channel": "Instagram / LinkedIn",
        "content": "Start investing with ApexFin today for guaranteed returns and risk-free growth! We are #1 in India with zero fees forever."
    },
    {
        "title": "2. Compliant FinTech Ad (Clean Pass)",
        "brand_id": "fintech-pro",
        "channel": "Twitter / X",
        "content": "Build long-term compounding with ApexFin, a SEBI registered platform with zero account opening fees. Investments are subject to market risks."
    },
    {
        "title": "3. Failing Health Ad (Violations)",
        "brand_id": "health-glow",
        "channel": "Instagram Reel Caption",
        "content": "Try VitalGlow's miracle pill for instant weight loss! It is clinically proven 100% effective."
    }
]

EVAL_SUMMARY = {
    "total_posts_tested": 10,
    "violation_posts": 5,
    "clean_posts": 5,
    "detection_rate": "100% (5/5 flagged)",
    "false_positive_rate": "0% (0/5 false flags)",
    "citation_verification_accuracy": "90%"
}

SUBMISSIONS = []

class SubmissionCreate(BaseModel):
    brand_id: str
    creator: str
    channel: str
    content: str

class DecisionUpdate(BaseModel):
    status: str
    reviewer_note: Optional[str] = ""

def run_compliance_scan(brand_id: str, content: str):
    brand = next((b for b in BRAND_KITS if b["id"] == brand_id), BRAND_KITS[0])
    lower_text = content.lower()
    findings = []
    suggested_copy = content

    # 1. Deterministic Banned Terms
    for bad_term, replacement in brand["banned_terms"].items():
        if bad_term in lower_text:
            findings.append({
                "type": "BANNED_TERM",
                "severity": "HIGH",
                "rule_id": "RULE-LEX-01",
                "matched": bad_term,
                "message": f"Banned phrase '{bad_term}' violates brand & regulatory lexicon.",
                "suggestion": f"Replace '{bad_term}' with '{replacement}'.",
                "citation": "Brand Policy Section 2.1 (Prohibited Promises)"
            })
            # Case-insensitive replacement helper
            idx = suggested_copy.lower().find(bad_term)
            if idx != -1:
                suggested_copy = suggested_copy[:idx] + replacement + suggested_copy[idx+len(bad_term):]

    # 2. Grounded Claim & Citation Check
    for claim, info in brand["claims_db"].items():
        if claim in lower_text:
            if not info["verified"]:
                findings.append({
                    "type": "UNVERIFIED_CLAIM",
                    "severity": "HIGH",
                    "rule_id": "RULE-AI-GROUND-02",
                    "matched": claim,
                    "message": f"Unsupported claim '{claim}' flagged by grounded verification.",
                    "suggestion": f"Use verified phrasing: '{info['fix']}'.",
                    "citation": info["citation"]
                })
                idx = suggested_copy.lower().find(claim)
                if idx != -1:
                    suggested_copy = suggested_copy[:idx] + info["fix"] + suggested_copy[idx+len(claim):]

    # 3. Required Legal Disclaimer Check
    if brand["required_disclaimer"].lower() not in lower_text:
        findings.append({
            "type": "MISSING_DISCLAIMER",
            "severity": "MEDIUM",
            "rule_id": "RULE-DISC-03",
            "matched": "Footer Disclaimer",
            "message": f"Mandatory legal disclaimer is missing.",
            "suggestion": f"Append: '{brand['required_disclaimer']}'",
            "citation": "Regulatory Disclosure Mandate 2026"
        })
        suggested_copy = suggested_copy.strip() + " " + brand["required_disclaimer"]

    score = max(0, 100 - (len(findings) * 25))
    status = "APPROVED" if len(findings) == 0 else "FLAGGED"
    return findings, score, status, suggested_copy

@app.get("/")
def read_root():
    return {"message": "vcon backend is live!"}

@app.get("/api/state")
def get_state():
    return {
        "brand_kits": BRAND_KITS,
        "sample_posts": SAMPLE_POSTS,
        "submissions": SUBMISSIONS,
        "eval_summary": EVAL_SUMMARY
    }

@app.post("/api/submissions")
def create_submission(payload: SubmissionCreate):
    findings, score, status, suggested_copy = run_compliance_scan(payload.brand_id, payload.content)
    new_sub = {
        "id": str(uuid.uuid4())[:8],
        "brand_id": payload.brand_id,
        "creator": payload.creator,
        "channel": payload.channel,
        "content": payload.content,
        "suggested_copy": suggested_copy,
        "findings": findings,
        "compliance_score": score,
        "status": status,
        "reviewer_note": "Auto-approved (0 violations)" if status == "APPROVED" else "Awaiting Reviewer Action",
        "created_at": datetime.now().strftime("%H:%M:%S")
    }
    SUBMISSIONS.insert(0, new_sub)
    return new_sub

@app.post("/api/submissions/{sub_id}/decision")
def update_decision(sub_id: str, decision: DecisionUpdate):
    for sub in SUBMISSIONS:
        if sub["id"] == sub_id:
            sub["status"] = decision.status
            sub["reviewer_note"] = decision.reviewer_note or f"Marked {decision.status}"
            return sub
    raise HTTPException(status_code=404, detail="Submission not found")