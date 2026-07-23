from sqlalchemy import Column, String, DateTime, Text, Integer, JSON

import uuid
from .base import Base
from datetime import datetime

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_number = Column(String(50), unique=True, index=True)
    title = Column(String(255), index=True) # changed from name to title
    description = Column(Text)
    status = Column(String(50), default="open")
    severity = Column(String(50), default="medium")
    case_type = Column(String(50), nullable=True)
    
    # JSON columns to mirror the mock data structure easily for now
    lead_investigator = Column(JSON, nullable=True)
    assigned_analysts = Column(JSON, default=[])
    tags = Column(JSON, default=[])
    
    evidence_count = Column(Integer, default=0)
    entity_count = Column(Integer, default=0)
    ioc_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
