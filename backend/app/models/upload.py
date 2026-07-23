from sqlalchemy import Column, String, Integer, DateTime, Float, JSON
from sqlalchemy.sql import func

from sqlalchemy.orm import relationship
import uuid
from app.models.base import Base

class MalwareSample(Base):
    __tablename__ = "malware_samples"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    filename = Column(String, index=True)
    file_size = Column(Integer)
    md5 = Column(String, unique=True, index=True)
    sha1 = Column(String, unique=True, index=True)
    sha256 = Column(String, unique=True, index=True)
    mime_type = Column(String)
    status = Column(String, default="QUEUED")  # QUEUED, ANALYZING, COMPLETED, FAILED
    
    # Scoring & Verdict
    confidence_score = Column(Float, nullable=True) # 0.0 to 1.0
    threat_level = Column(String, nullable=True) # Benign, Suspicious, Malicious
    ai_summary = Column(String, nullable=True)
    
    # Static Analysis Telemetry
    entropy = Column(Float, nullable=True)
    pe_headers = Column(JSON, nullable=True)
    yara_matches = Column(JSON, nullable=True)
    imports = Column(JSON, nullable=True)
    exports = Column(JSON, nullable=True)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    uploaded_by = Column(String) # User ID

    # Relationships (Using string references to avoid circular imports)
    runs = relationship("AnalysisRun", back_populates="sample", cascade="all, delete-orphan")
    verdicts = relationship("AnalystVerdict", back_populates="sample", cascade="all, delete-orphan")

# Import related models to ensure SQLAlchemy mapper can resolve string references
import app.models.analysis
