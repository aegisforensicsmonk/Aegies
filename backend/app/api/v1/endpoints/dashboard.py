from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.db.session import get_db
from app.models.cases import Case
from app.models.upload import MalwareSample
from app.models.audit import AuditLog
from app.models.threat import ThreatIndicator

router = APIRouter()

class DashboardStats(BaseModel):
    active_cases: int
    total_evidence: int
    pending_analysis: int
    threats_detected: int

@router.get("/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    # Calculate active cases
    result = await db.execute(select(func.count(Case.id)).where(Case.status.notin_(["closed", "archived"])))
    active_cases = result.scalar() or 0
    
    # Calculate total evidence
    result = await db.execute(select(func.count(MalwareSample.id)))
    total_evidence = result.scalar() or 0
    
    # Calculate pending analysis (open cases + queued/analyzing evidence)
    result = await db.execute(select(func.count(Case.id)).where(Case.status == "open"))
    open_cases = result.scalar() or 0
    
    result = await db.execute(select(func.count(MalwareSample.id)).where(MalwareSample.status.in_(["QUEUED", "ANALYZING"])))
    processing_evidence = result.scalar() or 0
    pending_analysis = open_cases + processing_evidence
    
    # Calculate threats detected
    result = await db.execute(select(func.count(ThreatIndicator.id)))
    threats_detected = result.scalar() or 0
    
    return {
        "active_cases": active_cases,
        "total_evidence": total_evidence,
        "pending_analysis": pending_analysis,
        "threats_detected": threats_detected
    }

@router.get("/recent-activity")
async def get_recent_activity(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AuditLog).order_by(AuditLog.timestamp.desc()).limit(6))
    logs = result.scalars().all()
    
    # Format to match the expected JSON payload on the frontend
    return [
        {
            "id": str(log.id),
            "user_name": log.user_name,
            "action": log.action,
            "details": log.details,
            "timestamp": log.timestamp.isoformat() + "Z" if log.timestamp else None
        }
        for log in logs
    ]

@router.get("/threat-indicators")
async def get_threat_indicators(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ThreatIndicator).order_by(ThreatIndicator.created_at.desc()).limit(6))
    iocs = result.scalars().all()
    
    # Format to match the frontend expectations
    return [
        {
            "id": str(ioc.id),
            "value": ioc.value,
            "type": ioc.ioc_type, # mapping to what frontend mock-data uses
            "severity": ioc.severity,
            "description": ioc.source, # mock-data doesn't use description but fallback to source
            "created_at": ioc.created_at.isoformat() + "Z" if ioc.created_at else None
        }
        for ioc in iocs
    ]
