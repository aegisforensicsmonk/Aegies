import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Any
from datetime import datetime

from app.core.redis import redis_client

router = APIRouter()

class IngestionPayload(BaseModel):
    source: str
    event_type: str
    data: dict[str, Any]

@router.post("/webhook", status_code=status.HTTP_202_ACCEPTED)
async def receive_webhook(
    payload: IngestionPayload,
    # db: Session = Depends(deps.get_db)  # Normally we'd save to DB here
):
    """
    Receive webhook events from SIEM/EDR, save to database, and publish to Redis.
    """
    # 1. Process and save to DB (mocking this step for now to focus on the pipeline)
    # 2. Publish the event to Redis for the dashboard
    
    redis_payload = {
        "event_type": payload.event_type,
        "data": payload.data
    }
    
    await redis_client.publish("dashboard_updates", json.dumps(redis_payload))
    
    return {"message": "Event processed and broadcasted"}
