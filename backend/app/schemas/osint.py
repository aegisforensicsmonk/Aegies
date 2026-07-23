from pydantic import BaseModel
from typing import Dict, Any, List

class OSINTRequest(BaseModel):
    ioc: str
    ioc_type: str # ip, domain, hash, email

class OSINTResponse(BaseModel):
    ioc: str
    ioc_type: str
    reputation: str # benign, malicious, suspicious, unknown
    confidence_score: float
    tags: List[str]
    enrichment_data: Dict[str, Any]
    ai_summary: str | None = None
