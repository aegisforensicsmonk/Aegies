from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Boolean, JSON, Enum

from sqlalchemy.orm import relationship
import uuid
import datetime
from .base import Base

class Subscriber(Base):
    __tablename__ = "subscribers"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    phone_number = Column(String(50), unique=True, index=True, nullable=False)
    imsi = Column(String(50), index=True)
    name = Column(String(255))
    address = Column(String(500))
    provider = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    calls_made = relationship("Call", foreign_keys="[Call.source_number_id]", back_populates="source")
    calls_received = relationship("Call", foreign_keys="[Call.destination_number_id]", back_populates="destination")

class CellTower(Base):
    __tablename__ = "cell_towers"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cell_id = Column(String(100), unique=True, index=True, nullable=False)
    location_name = Column(String(500))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    azimuth = Column(Float)
    provider = Column(String(100))
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Call(Base):
    __tablename__ = "calls"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    case_id = Column(String, ForeignKey('cases.id'))
    source_number_id = Column(String, ForeignKey('subscribers.id'))
    destination_number_id = Column(String, ForeignKey('subscribers.id'))
    cell_tower_id = Column(String, ForeignKey('cell_towers.id'))
    imei = Column(String(50), index=True)
    
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime)
    duration_seconds = Column(Integer, default=0)
    call_type = Column(String(20)) # Voice, SMS
    
    source = relationship("Subscriber", foreign_keys=[source_number_id])
    destination = relationship("Subscriber", foreign_keys=[destination_number_id])
    tower = relationship("CellTower", foreign_keys=[cell_tower_id])

class InternetSession(Base):
    __tablename__ = "internet_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    subscriber_id = Column(String, ForeignKey('subscribers.id'))
    cell_tower_id = Column(String, ForeignKey('cell_towers.id'))
    
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    data_usage_bytes = Column(Integer)
    ip_address = Column(String(50), index=True)
    
    subscriber = relationship("Subscriber", foreign_keys=[subscriber_id])
    tower = relationship("CellTower", foreign_keys=[cell_tower_id])

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    imei = Column(String(50), unique=True, index=True, nullable=False)
    model = Column(String(255))
    manufacturer = Column(String(255))
    first_seen = Column(DateTime)
    last_seen = Column(DateTime)
