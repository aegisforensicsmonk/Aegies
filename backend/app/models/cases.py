from sqlalchemy import Column, String, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import Base
from datetime import datetime

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), index=True)
    description = Column(Text)
    status = Column(String(50), default="open")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
