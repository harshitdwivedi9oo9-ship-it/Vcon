from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
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

# --- Preset Brand Kits & Rules ---
BRAND_KITS = [
    {
        "id": "fintech-pro",
        "name": "ApexFin (FinTech & Crypto)",
        "banned_terms": ["guaranteed returns", "risk-free", "100% safe", "instant wealth", "no risk"],
        "required_disclaimer": "Investments are subject to market risks.",
        "unverified_triggers": ["#1 in india", "zero fees forever", "rbi approved returns"]
    },
    {
        "id": "health-glow",
        "name": "VitalGlow (Health & Wellness)",
        "banned_terms": ["cures all", "miracle pill", "fda guaranteed", "instant weight loss"],
        "required_disclaimer": "Consult a physician before use.",
        "unverified_triggers": ["clinically proven 100%", "doctors #1 secret", "permanent cure"]
    }
]

SAMPLE_POSTS = [
    {
        "title": "Failing Ad (Multiple Violations)",
        "brand_id": "fintech-pro",
        "channel": "Instagram / LinkedIn",
        "content": "Start investing with ApexFin today for guaranteed returns and risk-free growth! We are #1 in India with zero fees forever."
    },
    {
        "title": "Compliant Ad (Passes Cleanly)",
        "brand_id": "fintech-pro",
        "channel": "Twitter / X",
        "content": "Track your portfolio smarter with ApexFin's automated analytics dashboard. Investments are subject to market risks."
    }
]

SUBMISSIONS = []

class SubmissionCreate(BaseModel):
    brand_id: str
    creator: str
    channel: str
    content: str

class DecisionUpdate(BaseModel):
    status: str  # "APPROVED" | "REJECTED" | "OVERRIDDEN"
    reviewer_note: Optional[str] = ""

def run_compliance_scan(brand_id: str, content: str):
    brand = next((b for b in BRAND_KITS if b["id"] == brand_id), BRAND_KITS[0])
    lower_text = content.lower()
    findings = []

    # 1. Deterministic Banned Terms Check
    for term in brand["banned_terms"]:
        if term in lower_text:
            findings.append({
                "type": "BANNED_TERM",
                "severity": "HIGH",
                "matched": term,
                "message": f"Prohibited regulatory phrase detected: '{term}'."
            })

    # 2. Required Legal Disclaimer Check
    if brand["required_disclaimer"].lower() not in lower_text:
        findings.append({
            "type": "MISSING_DISCLAIMER",
            "severity": "MEDIUM",
            "matched": "Missing Footer",
            "message": f"Required legal disclaimer missing: '{brand['required_disclaimer']}'"
        })

    # 3. Grounded Claim Verification Check
    for claim in brand["unverified_triggers"]:
        if claim in lower_text:
            findings.append({
                "type": "UNVERIFIED_CLAIM",
                "severity": "HIGH",
                "matched": claim,
                "message": f"Unverified superlative/regulatory claim: '{claim}' requires citation."
            })

    score = max(0, 100 - (len(findings) * 30))
    status = "APPROVED" if len(findings) == 0 else "FLAGGED"
    return findings, score, status

@app.get("/")
def read_root():
    return {"message": "vcon backend is live!"}

@app.get("/api/state")
def get_state():
    return {
        "brand_kits": BRAND_KITS,
        "sample_posts": SAMPLE_POSTS,
        "submissions": SUBMISSIONS
    }

@app.post("/api/submissions")
def create_submission(payload: SubmissionCreate):
    findings, score, status = run_compliance_scan(payload.brand_id, payload.content)
    new_sub = {
        "id": str(uuid.uuid4())[:8],
        "brand_id": payload.brand_id,
        "creator": payload.creator,
        "channel": payload.channel,
        "content": payload.content,
        "findings": findings,
        "compliance_score": score,
        "status": status,
        "reviewer_note": "",
        "created_at": datetime.now().strftime("%H:%M:%S")
    }
    SUBMISSIONS.insert(0, new_sub)
    return new_sub

@app.post("/api/submissions/{sub_id}/decision")
def update_decision(sub_id: str, decision: DecisionUpdate):
    for sub in SUBMISSIONS:
        if sub["id"] == sub_id:
            sub["status"] = decision.status
            sub["reviewer_note"] = decision.reviewer_note or "Reviewed by Compliance Officer"
            return sub
    raise HTTPException(status_code=404, detail="Submission not found")