from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, Dict, Any, List

class MalwareSampleBase(BaseModel):
    filename: str
    file_size: int
    md5: str
    sha1: str
    sha256: str
    mime_type: str

class MalwareSampleCreate(MalwareSampleBase):
    uploaded_by: str

class MalwareSampleResponse(MalwareSampleBase):
    id: UUID4
    status: str
    
    entropy: Optional[float] = None
    pe_headers: Optional[Dict[str, Any]] = None
    yara_matches: Optional[List[str]] = None
    imports: Optional[List[str]] = None
    exports: Optional[List[str]] = None

    uploaded_at: datetime
    uploaded_by: str

    class Config:
        orm_mode = True
        from_attributes = True
