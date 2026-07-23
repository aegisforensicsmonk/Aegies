from sqlalchemy import Column, String, DateTime

import uuid
from .base import Base
from datetime import datetime

class ThreatIndicator(Base):
    __tablename__ = "threat_indicators"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    ioc_type = Column(String(50), index=True) # e.g., 'ip', 'domain', 'hash_sha256'
    value = Column(String(255), index=True)
    severity = Column(String(50)) # 'critical', 'high', 'medium', 'low'
    source = Column(String(255))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
