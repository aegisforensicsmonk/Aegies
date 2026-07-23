from sqlalchemy import Column, String, Integer, DateTime, Float, JSON, ForeignKey, Boolean
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.models.base import Base

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sample_id = Column(UUID(as_uuid=True), ForeignKey("malware_samples.id"), nullable=False)
    
    # Environment info
    sandbox_env = Column(String) # e.g. "cape_win10_x64", "cape_win7_x86"
    status = Column(String, default="PENDING")
    
    # Results
    behavioral_features = Column(JSON, nullable=True)
    sigma_matches = Column(JSON, nullable=True)
    run_time = Column(Float, nullable=True)
    
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    sample = relationship("MalwareSample", back_populates="runs")
    telemetry_events = relationship("TelemetryEvent", back_populates="run", cascade="all, delete-orphan")


class TelemetryEvent(Base):
    """Normalized Canonical Timeline Event"""
    __tablename__ = "telemetry_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    run_id = Column(UUID(as_uuid=True), ForeignKey("analysis_runs.id"), nullable=False)
    
    timestamp = Column(Float, nullable=False) # Offset from start of run
    event_type = Column(String, nullable=False) # ProcessCreate, FileWrite, RegKeySet, NetworkConn
    
    # Core event attributes
    process_name = Column(String, nullable=True)
    pid = Column(Integer, nullable=True)
    action = Column(String, nullable=True)
    target = Column(String, nullable=True) # File path, Registry key, IP address
    
    # Full raw JSON event from Sandbox for deep inspection
    raw_event = Column(JSON, nullable=True)

    # Relationships
    run = relationship("AnalysisRun", back_populates="telemetry_events")


class AnalystVerdict(Base):
    """Human-in-the-loop feedback"""
    __tablename__ = "analyst_verdicts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sample_id = Column(UUID(as_uuid=True), ForeignKey("malware_samples.id"), nullable=False)
    
    analyst_id = Column(String, nullable=False)
    verdict = Column(String, nullable=False) # False Positive, True Positive, Unknown
    confidence = Column(Integer, nullable=False) # 1-100
    comments = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    sample = relationship("MalwareSample", back_populates="verdicts")

# Import related models to ensure SQLAlchemy mapper can resolve string references
import app.models.upload
