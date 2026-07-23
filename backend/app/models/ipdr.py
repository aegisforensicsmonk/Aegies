from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, BigInteger
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import Base
from datetime import datetime

class IPDRRecord(Base):
    __tablename__ = "ipdr_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_id = Column(UUID(as_uuid=True), ForeignKey('cases.id'), index=True)
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    
    source_identifier = Column(String(255), index=True)
    destination_identifier = Column(String(255), index=True)
    
    protocol_type = Column(String(50)) # Voice, SMS, Data
    
    duration_seconds = Column(Integer, default=0)
    
    cell_id = Column(String(100), index=True)
    location_lat = Column(Float)
    location_lon = Column(Float)
    
    bytes_up = Column(BigInteger, default=0)
    bytes_down = Column(BigInteger, default=0)

    imei = Column(String(100), index=True)
    imsi = Column(String(100), index=True)
