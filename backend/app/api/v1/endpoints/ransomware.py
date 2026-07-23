from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import uuid
import os

from app.db.session import get_db
from app.core.schema_models import TaskStatusResponse, AggregatedFindingsResponse
from app.services.pipeline import start_analysis_pipeline

router = APIRouter()

# In a real app, this would be a MinIO or S3 client
UPLOAD_DIR = "/tmp/ransomware_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/scan", response_model=TaskStatusResponse)
async def scan_sample(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Upload a sample for ransomware/malware analysis.
    Triggers the static, dynamic, and RE pipeline.
    """
    # 1. Basic Validation
    if file.size > 50 * 1024 * 1024:  # 50MB limit
        raise HTTPException(status_code=400, detail="File too large. Limit is 50MB.")
        
    # 2. Save file temporarily (normally to MinIO)
    internal_task_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{internal_task_id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        f.write(await file.read())
        
    # 3. Create DB Task Record (mocked here, assume it's created)
    # db_task = AnalysisTask(id=internal_task_id, status="PENDING")
    # db.add(db_task)
    # await db.commit()
    
    # 4. Trigger Pipeline
    start_analysis_pipeline.delay(internal_task_id, file_path, file.filename)
    
    return TaskStatusResponse(
        task_id=internal_task_id,
        status="PENDING",
        stage="INITIALIZATION",
        error_message=None,
        created_at="2026-07-21T00:00:00Z",
        updated_at="2026-07-21T00:00:00Z"
    )

@router.get("/task/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(
    task_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Check the status of an ongoing analysis pipeline.
    """
    # Mock response
    return TaskStatusResponse(
        task_id=task_id,
        status="RUNNING",
        stage="DYNAMIC_ANALYSIS",
        error_message=None,
        created_at="2026-07-21T00:00:00Z",
        updated_at="2026-07-21T00:05:00Z"
    )

@router.get("/findings/{case_id}", response_model=AggregatedFindingsResponse)
async def get_findings(
    case_id: UUID,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """
    Retrieve the aggregated findings and AI summary for a completed analysis.
    """
    # Mock response
    return AggregatedFindingsResponse(
        task_id=uuid.uuid4(),
        case_id=case_id,
        static_findings=None,
        dynamic_findings=None,
        reverse_engineering=None,
        ai_summary=None,
        overall_score=None
    )
