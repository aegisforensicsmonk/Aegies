from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import Base
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String(100), index=True)
    action = Column(String(50))
    resource = Column(String(255))
    details = Column(String(255))
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
