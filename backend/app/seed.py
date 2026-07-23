import asyncio
import logging
from app.db.session import engine, get_db
from app.models.upload import MalwareSample
from app.models.threat import ThreatIndicator
from app.models.audit import AuditLog
from sqlalchemy.future import select
from datetime import datetime
from app.api.v1.endpoints.cases import iocs_db, evidence_db, audit_logs_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def seed_data():
    async for db in get_db():
        logger.info("Seeding Evidence...")
        # Evidence
        result = await db.execute(select(MalwareSample))
        if not result.scalars().first():
            for e in evidence_db:
                ms = MalwareSample(
                    status="COMPLETED" if e["status"] == "processed" else "ANALYZING"
                )
                db.add(ms)
                
        # Threats
        logger.info("Seeding Threats...")
        result = await db.execute(select(ThreatIndicator))
        if not result.scalars().first():
            for t in iocs_db:
                ti = ThreatIndicator(
                    value=t["value"],
                    ioc_type=t["ioc_type"],
                    severity=t["severity"],
                    source="Identified during initial triage",
                )
                db.add(ti)

        # Audit Logs
        logger.info("Seeding Audit Logs...")
        result = await db.execute(select(AuditLog))
        if not result.scalars().first():
            for a in audit_logs_db:
                al = AuditLog(
                    user_name=a["user_name"],
                    action=a["action"],
                    details=a["details"],
                    timestamp=datetime.fromisoformat(a["timestamp"].replace("Z", "+00:00")).replace(tzinfo=None)
                )
                db.add(al)
                
        await db.commit()
        logger.info("Seeding complete.")

if __name__ == "__main__":
    asyncio.run(seed_data())
