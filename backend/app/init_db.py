import asyncio
import logging

from app.db.session import engine
from app.models.base import Base

# Import all models so Base knows about them
from app.models.cases import Case
from app.models.upload import MalwareSample
from app.models.audit import AuditLog
from app.models.threat import ThreatIndicator
from app.models.analysis import AnalysisRun, AnalystVerdict
from app.models.ipdr import IPDRRecord
from app.models.telecom import Subscriber, CellTower, Call, InternetSession, Device

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def init_db():
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        # Drop all tables and recreate them to ensure schema matches current models
        # Warning: This deletes all data!
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully.")

if __name__ == "__main__":
    asyncio.run(init_db())
