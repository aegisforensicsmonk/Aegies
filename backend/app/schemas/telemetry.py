from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List, Dict, Any

class TelemetryEvent(BaseModel):
    event_type: str # process_creation, registry_modification, network_connection, file_write
    timestamp: datetime
    process_name: str
    process_id: int
    parent_process_id: Optional[int] = None
    details: Dict[str, Any]

class TelemetryIngestRequest(BaseModel):
    sample_id: UUID4
    events: List[TelemetryEvent]

class TelemetryIngestResponse(BaseModel):
    status: str
    events_processed: int
