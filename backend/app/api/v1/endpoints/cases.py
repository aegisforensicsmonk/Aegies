from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete

from app.db.session import get_db
from app.models.cases import Case

router = APIRouter()

# Mock Databases for fallback / seeding
cases_db = [
    {
        "id": "case-001",
        "case_number": "CIIP-2026-0147",
        "title": "Operation Dark Circuit - Corporate Espionage Investigation",
        "description": "Investigation into sophisticated corporate espionage targeting defense contractor Meridian Systems.",
        "status": "in_progress",
        "severity": "critical",
        "case_type": "espionage",
        "lead_investigator": {"id": "usr-002", "full_name": "Marcus Wright"},
        "assigned_analysts": [{"id": "usr-003", "full_name": "Aisha Patel"}],
        "created_at": "2026-05-12T08:30:00Z",
        "updated_at": "2026-07-16T10:00:00Z",
        "evidence_count": 47,
        "entity_count": 128,
        "ioc_count": 89,
        "tags": ["APT", "supply-chain"]
    },
    {
        "id": "case-002",
        "case_number": "CIIP-2026-0163",
        "title": "BlackCat Ransomware - Municipal Hospital Network",
        "description": "Critical ransomware incident affecting St. Helena Medical Center network.",
        "status": "in_progress",
        "severity": "critical",
        "case_type": "ransomware",
        "lead_investigator": {"id": "usr-002", "full_name": "Marcus Wright"},
        "assigned_analysts": [{"id": "usr-003", "full_name": "Aisha Patel"}],
        "created_at": "2026-06-28T03:15:00Z",
        "updated_at": "2026-07-15T16:30:00Z",
        "evidence_count": 32,
        "entity_count": 54,
        "ioc_count": 67,
        "tags": ["ransomware", "healthcare"]
    },
    {
        "id": "case-003",
        "case_number": "CIIP-2026-0155",
        "title": "Financial Wire Fraud - Nexus Banking Platform",
        "description": "Multi-million dollar wire fraud scheme exploiting vulnerabilities.",
        "status": "open",
        "severity": "high",
        "case_type": "fraud",
        "lead_investigator": {"id": "usr-002", "full_name": "Marcus Wright"},
        "assigned_analysts": [{"id": "usr-003", "full_name": "Aisha Patel"}],
        "created_at": "2026-06-05T11:00:00Z",
        "updated_at": "2026-07-14T09:00:00Z",
        "evidence_count": 23,
        "entity_count": 42,
        "ioc_count": 31,
        "tags": ["fraud", "BEC"]
    },
    {
        "id": "case-004",
        "case_number": "CIIP-2026-0171",
        "title": "Insider Threat - CloudServe Data Exfiltration",
        "description": "Former senior engineer at CloudServe Inc. suspected of exfiltrating proprietary source code.",
        "status": "open",
        "severity": "high",
        "case_type": "insider_threat",
        "lead_investigator": {"id": "usr-003", "full_name": "Aisha Patel"},
        "assigned_analysts": [{"id": "usr-001", "full_name": "Sarah Chen"}],
        "created_at": "2026-07-02T14:00:00Z",
        "updated_at": "2026-07-16T08:00:00Z",
        "evidence_count": 15,
        "entity_count": 28,
        "ioc_count": 12,
        "tags": ["insider", "data-theft"]
    }
]

audit_logs_db = [
    { "id": "al-001", "user_name": "Sarah Chen", "action": "CREATE", "details": "Created case CIIP-2026-0147: Operation Dark Circuit", "timestamp": "2026-05-12T08:30:00Z" },
    { "id": "al-002", "user_name": "Marcus Wright", "action": "UPLOAD", "details": "Uploaded disk image: meridian_server_disk.E01 (512 GB)", "timestamp": "2026-05-14T10:15:00Z" },
    { "id": "al-003", "user_name": "Aisha Patel", "action": "UPLOAD", "details": "Uploaded network capture: network_capture_may2026.pcapng", "timestamp": "2026-05-15T14:20:00Z" },
    { "id": "al-004", "user_name": "Aisha Patel", "action": "GENERATE", "details": "Created working copy for analysis", "timestamp": "2026-05-16T09:00:00Z" },
    { "id": "al-005", "user_name": "Aisha Patel", "action": "REVIEW", "details": "Identified C2 server: 185.220.101.42", "timestamp": "2026-05-18T11:45:00Z" },
    { "id": "al-006", "user_name": "Sarah Chen", "action": "CREATE", "details": "Created emergency case CIIP-2026-0163: BlackCat Ransomware", "timestamp": "2026-06-28T03:15:00Z" }
]

iocs_db = [
    { "id": "ioc-001", "value": "185.220.101.42", "ioc_type": "ip", "severity": "critical" },
    { "id": "ioc-002", "value": "update-service.meridian-cdn.com", "ioc_type": "domain", "severity": "critical" },
    { "id": "ioc-003", "value": "svchost_update.exe", "ioc_type": "file_name", "severity": "high" },
    { "id": "ioc-004", "value": "e3b0c44298fc1c149afbf4c8996fb924", "ioc_type": "hash_md5", "severity": "high" },
    { "id": "ioc-005", "value": "103.235.46.18", "ioc_type": "ip", "severity": "high" },
    { "id": "ioc-006", "value": "nexus-bank.com.co", "ioc_type": "domain", "severity": "high" },
]

evidence_db = [
    { "id": "ev-001", "status": "processed" },
    { "id": "ev-002", "status": "processing" },
    { "id": "ev-003", "status": "processing" },
]

@router.get("/", response_model=List[Dict[str, Any]])
async def get_cases(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Case).order_by(Case.created_at.desc()))
    cases = result.scalars().all()
    
    if not cases:
        # Seed mock data
        for c in cases_db:
            new_c = Case(
                case_number=c["case_number"],
                title=c["title"],
                description=c["description"],
                status=c["status"],
                severity=c["severity"],
                case_type=c["case_type"],
                lead_investigator=c["lead_investigator"],
                assigned_analysts=c["assigned_analysts"],
                evidence_count=c["evidence_count"],
                entity_count=c["entity_count"],
                ioc_count=c["ioc_count"],
                tags=c["tags"]
            )
            # overwrite created_at to match mock if needed
            new_c.created_at = datetime.fromisoformat(c["created_at"].replace("Z", "+00:00")).replace(tzinfo=None)
            db.add(new_c)
        await db.commit()
        
        result = await db.execute(select(Case).order_by(Case.created_at.desc()))
        cases = result.scalars().all()

    # Format for JSON response
    response = []
    for c in cases:
        response.append({
            "id": str(c.id),
            "case_number": c.case_number,
            "title": c.title,
            "description": c.description,
            "status": c.status,
            "severity": c.severity,
            "case_type": c.case_type,
            "lead_investigator": c.lead_investigator,
            "assigned_analysts": c.assigned_analysts,
            "created_at": c.created_at.isoformat() + "Z",
            "updated_at": c.updated_at.isoformat() + "Z",
            "evidence_count": c.evidence_count,
            "entity_count": c.entity_count,
            "ioc_count": c.ioc_count,
            "tags": c.tags
        })
    return response

@router.get("/{case_id}", response_model=Dict[str, Any])
async def get_case(case_id: str, db: AsyncSession = Depends(get_db)):
    # Try UUID first
    try:
        uid = uuid.UUID(case_id)
        result = await db.execute(select(Case).where(Case.id == uid))
        case = result.scalar_one_or_none()
    except ValueError:
        result = await db.execute(select(Case).where(Case.case_number == case_id))
        case = result.scalar_one_or_none()
        
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    return {
        "id": str(case.id),
        "case_number": case.case_number,
        "title": case.title,
        "description": case.description,
        "status": case.status,
        "severity": case.severity,
        "case_type": case.case_type,
        "lead_investigator": case.lead_investigator,
        "assigned_analysts": case.assigned_analysts,
        "created_at": case.created_at.isoformat() + "Z",
        "updated_at": case.updated_at.isoformat() + "Z",
        "evidence_count": case.evidence_count,
        "entity_count": case.entity_count,
        "ioc_count": case.ioc_count,
        "tags": case.tags
    }

@router.delete("/{case_id}")
async def delete_case(case_id: str, db: AsyncSession = Depends(get_db)):
    try:
        uid = uuid.UUID(case_id)
        result = await db.execute(select(Case).where(Case.id == uid))
    except ValueError:
        result = await db.execute(select(Case).where(Case.case_number == case_id))
        
    case = result.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    await db.delete(case)
    await db.commit()
    
    return {"status": "success", "message": f"Case {case_id} deleted permanently"}

class CaseCreate(BaseModel):
    title: str
    description: str
    severity: str
    case_type: str
    tags: Optional[List[str]] = []

@router.post("/", response_model=Dict[str, Any])
async def create_case(case: CaseCreate, db: AsyncSession = Depends(get_db)):
    # Calculate case number based on count
    result = await db.execute(select(Case))
    count = len(result.scalars().all())
    
    new_case = Case(
        case_number=f"FIR/{datetime.utcnow().year}/0{count + 1}",
        title=case.title,
        description=case.description,
        status="open",
        severity=case.severity,
        case_type=case.case_type,
        lead_investigator={"id": "usr-001", "full_name": "Current User"},
        assigned_analysts=[],
        tags=case.tags
    )
    
    db.add(new_case)
    await db.commit()
    await db.refresh(new_case)
    
    # Import audit here to avoid circular imports if needed, or just insert
    from app.models.audit import AuditLog
    audit = AuditLog(
        user_name="Current User",
        action="CREATE",
        details=f"Created case {new_case.case_number}: {new_case.title}"
    )
    db.add(audit)
    await db.commit()
    
    # Also publish to Redis for WebSockets
    try:
        from app.core.redis import redis_client
        import json
        payload = {
            "id": str(new_case.id),
            "case_number": new_case.case_number,
            "title": new_case.title,
            "description": new_case.description,
            "status": new_case.status,
            "severity": new_case.severity,
            "case_type": new_case.case_type,
            "lead_investigator": new_case.lead_investigator,
            "assigned_analysts": new_case.assigned_analysts,
            "created_at": new_case.created_at.isoformat() + "Z",
            "updated_at": new_case.updated_at.isoformat() + "Z",
            "evidence_count": new_case.evidence_count,
            "entity_count": new_case.entity_count,
            "ioc_count": new_case.ioc_count,
            "tags": new_case.tags
        }
        await redis_client.publish("dashboard_updates", json.dumps({"event_type": "CASE_UPDATED", "data": payload}))
    except Exception as e:
        print(f"Failed to publish to redis: {e}")

    return payload

class AnalyzeRequest(BaseModel):
    narrative: str

@router.post("/analyze-legal", response_model=Dict[str, Any])
async def analyze_legal_narrative(request: AnalyzeRequest):
    text = request.narrative.lower()
    
    report = {
        "fact_extraction": [],
        "core_issues": [],
        "core_provisions": [],
        "conditional_provisions": [],
        "excluded_categories": [],
        "fir_paragraph": ""
    }

    # Keyword rules
    is_crypto = any(word in text for word in ["crypto", "bitcoin", "investment", "return", "profit", "trading"])
    is_bank = any(word in text for word in ["bank", "account", "otp", "phishing", "password", "₹", "rupees", "transfer"])
    is_harassment = any(word in text for word in ["harass", "stalk", "follow", "message", "threat", "photo", "blackmail"])
    
    if is_crypto:
        report["fact_extraction"] = [
            "Victim engaged with an online investment scheme.",
            "Victim transferred funds to the suspect's designated accounts/wallets.",
            "Suspect failed to provide promised returns and cut off communication."
        ]
        report["core_issues"] = [
            "Investment fraud and cheating.",
            "Criminal breach of trust regarding invested funds."
        ]
        report["core_provisions"] = [
            {"name": "BNS: Section 318 - Cheating and dishonestly inducing delivery of property", "confidence": "High", "reason": "Induced victim to part with money under false promises of high returns.", "role": "Primary"},
            {"name": "BNS: Section 316 - Criminal breach of trust", "confidence": "Medium", "reason": "Misappropriation of funds entrusted for investment.", "role": "Primary"}
        ]
        report["fir_paragraph"] = "Unknown persons fraudulently induced me to invest money in a fake investment/crypto scheme. After receiving the funds, they misappropriated the money and ceased all communications, causing wrongful financial loss."
        
    elif is_harassment:
        report["fact_extraction"] = [
            "Victim received repeated, unwanted communications.",
            "Suspect engaged in threatening or coercive behavior."
        ]
        report["core_issues"] = [
            "Online harassment and stalking.",
            "Criminal intimidation."
        ]
        report["core_provisions"] = [
            {"name": "BNS: Section 354D - Stalking (Equivalent to old IPC 354D)", "confidence": "High", "reason": "Repeatedly contacting the victim despite clear disinterest.", "role": "Primary"},
            {"name": "BNS: Section 351 - Criminal Intimidation", "confidence": "High", "reason": "Threats to harm the victim's reputation or person.", "role": "Primary"}
        ]
        if any(word in text for word in ["photo", "nude", "explicit", "sexual"]):
            report["core_provisions"].append({"name": "IT Act: Section 67A - Sexually explicit material", "confidence": "High", "reason": "Transmission or threat of transmission of explicit images.", "role": "Primary"})
        report["fir_paragraph"] = "The accused has been repeatedly harassing and stalking me online, sending threatening communications and attempting to intimidate me, causing severe mental distress and fear for my safety."

    elif is_bank:
        report["fact_extraction"] = [
            "Victim received a deceptive communication mimicking a trusted entity.",
            "Victim was induced to share sensitive credentials or transfer funds.",
            "Unauthorized access or financial loss occurred."
        ]
        report["core_issues"] = [
            "Financial fraud via phishing or deception.",
            "Identity theft and impersonation.",
            "Unauthorized access to computer systems."
        ]
        report["core_provisions"] = [
            {"name": "BNS: Section 318 - Cheating and dishonestly inducing delivery of property", "confidence": "High", "reason": "Deception induced the victim to share credentials or funds.", "role": "Primary"},
            {"name": "IT Act: Section 43 - Unauthorized access to computer resource", "confidence": "High", "reason": "Unauthorized access to victim accounts.", "role": "Primary"},
            {"name": "IT Act: Section 66C - Identity theft", "confidence": "High", "reason": "Fraudulent use of victim's digital identity/passwords.", "role": "Primary"},
            {"name": "IT Act: Section 66D - Cheating by personation using computer resource", "confidence": "High", "reason": "Impersonation of trusted entity via digital means.", "role": "Primary"}
        ]
        report["fir_paragraph"] = "Unknown persons used electronic means to impersonate a trusted entity, deceiving me into sharing sensitive information. This led to unauthorized access to my accounts and financial loss."
        
    else:
        # Generic Fallback for simple narratives without keywords
        report["fact_extraction"] = [
            "Victim reported an incident involving potential cybercrime or criminal conduct.",
            "Details provided in the narrative require further investigation."
        ]
        report["core_issues"] = [
            "Potential cheating, theft, or unauthorized access.",
            "Further forensic analysis required to determine exact nature of offense."
        ]
        report["core_provisions"] = [
            {"name": "BNS: Section 318 - Cheating (General)", "confidence": "Medium", "reason": "Based on the general narrative of deception or fraud.", "role": "Primary"}
        ]
        report["conditional_provisions"] = [
            {"name": "IT Act: Section 66 - Computer Related Offences", "confidence": "Medium", "reason": "If any computer resource or communication device was used."},
            {"name": "BNS: Section 303 - Theft", "confidence": "Medium", "reason": "If physical or digital property was stolen without consent."}
        ]
        report["fir_paragraph"] = f"An incident has occurred where unknown persons engaged in unlawful activities resulting in harm/loss. The specific details are: '{request.narrative[:100]}...'. Requesting a detailed cyber investigation."

    # General conditionals and exclusions for all cases (except generic which sets its own conditional)
    if is_crypto or is_harassment or is_bank:
        report["conditional_provisions"] = [
            {"name": "BNS: Section 336 - Forgery of electronic record", "confidence": "Medium", "reason": "If forged electronic documents or websites were used."},
            {"name": "BNS: Section 308 - Extortion", "confidence": "Low", "reason": "If explicit threats of harm were made to extract money."}
        ]
        
    report["excluded_categories"] = [
        {"name": "Cyber Terrorism (IT Act Sec 66F)", "reason": "No intent to threaten the security of India."},
        {"name": "Child Sexual Abuse Material (IT Act Sec 67B)", "reason": "No facts suggesting involvement of minors."}
    ]

    return report
