from pydantic import BaseModel, Field, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
import re

def luhn_checksum(imei: str) -> bool:
    if not imei.isdigit():
        return False
    digits = [int(d) for d in imei]
    if len(digits) != 15:
        return False
    checksum = 0
    for i, digit in enumerate(reversed(digits)):
        if i % 2 != 0:
            digit *= 2
            if digit > 9:
                digit -= 9
        checksum += digit
    return checksum % 10 == 0

class IPDRBase(BaseModel):
    case_id: Optional[str] = None
    timestamp: datetime
    source_identifier: str = Field(..., description="Source IP, Phone, or MAC")
    destination_identifier: Optional[str] = Field(None, description="Destination IP, Phone, or MAC")
    protocol_type: Optional[str] = Field(None, description="Voice, SMS, Data, TCP, UDP")
    duration_seconds: Optional[int] = Field(0, ge=0)
    cell_id: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    bytes_up: Optional[int] = Field(0, ge=0)
    bytes_down: Optional[int] = Field(0, ge=0)
    imei: Optional[str] = None
    imsi: Optional[str] = None

    @field_validator('imei')
    @classmethod
    def validate_imei(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        v = re.sub(r'\D', '', v)
        if len(v) != 15 or not luhn_checksum(v):
            # In forensic contexts, we log invalid IMEIs instead of rejecting the whole record
            # but we can return the cleaned up version or None if entirely malformed.
            return v if len(v) > 0 else None
        return v

    @field_validator('imsi')
    @classmethod
    def validate_imsi(cls, v: Optional[str]) -> Optional[str]:
        if not v:
            return v
        v = re.sub(r'\D', '', v)
        return v if len(v) >= 14 and len(v) <= 15 else None

    @field_validator('location_lat')
    @classmethod
    def validate_lat(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < -90 or v > 90):
            return None
        return v

    @field_validator('location_lon')
    @classmethod
    def validate_lon(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and (v < -180 or v > 180):
            return None
        return v

class IPDRCreate(IPDRBase):
    pass

class IPDRResponse(IPDRBase):
    id: UUID

    class Config:
        from_attributes = True
