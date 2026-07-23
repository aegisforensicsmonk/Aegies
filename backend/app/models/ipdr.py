from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, BigInteger

import uuid
from .base import Base
from datetime import datetime

class IPDRRecord(Base):
    __tablename__ = "ipdr_records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String, ForeignKey('cases.id'), index=True)
    
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
