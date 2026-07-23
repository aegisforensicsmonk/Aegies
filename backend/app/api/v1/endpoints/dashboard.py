from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Dict, Any
from .cases import cases_db, evidence_db, iocs_db, audit_logs_db

router = APIRouter()

class DashboardStats(BaseModel):
    active_cases: int
    total_evidence: int
    pending_analysis: int
    threats_detected: int

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats():
    active_cases = len([c for c in cases_db if c["status"] not in ["closed", "archived"]])
    pending_analysis = len([c for c in cases_db if c["status"] == "open"]) + len([e for e in evidence_db if e.get("status") == "processing"])
    
    return {
        "active_cases": active_cases,
        "total_evidence": len(evidence_db),
        "pending_analysis": pending_analysis,
        "threats_detected": len(iocs_db)
    }

@router.get("/recent-activity")
async def get_recent_activity():
    return audit_logs_db[:6]

@router.get("/threat-indicators")
async def get_threat_indicators():
    return iocs_db[:6]
