from sqlalchemy import Column, String, DateTime

import uuid
from .base import Base
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_name = Column(String(100), index=True)
    action = Column(String(50))
    resource = Column(String(255))
    details = Column(String(255))
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
