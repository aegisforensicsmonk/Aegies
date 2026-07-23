from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Any, List
import hashlib
import uuid

from app.db.session import get_db
from app.models.upload import MalwareSample
from app.schemas.upload import MalwareSampleResponse
from app.services.storage import storage_service
from app.services.queue import queue_service
from app.services.static_analysis import static_analysis_service

router = APIRouter()

async def calculate_hashes(file_content: bytes):
    return {
        "md5": hashlib.md5(file_content).hexdigest(),
        "sha1": hashlib.sha1(file_content).hexdigest(),
        "sha256": hashlib.sha256(file_content).hexdigest()
    }

@router.post("/upload", response_model=MalwareSampleResponse, status_code=status.HTTP_201_CREATED)
async def upload_malware_sample(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    # current_user = Depends(get_current_user) # In a real implementation we'd check auth
) -> Any:
    """
    Secure Upload Portal endpoint.
    Uploads a file, calculates hashes, checks for duplicates, stores it, and queues for analysis.
    """
    content = await file.read()
    file_size = len(content)
    
    if file_size > 100 * 1024 * 1024:  # 100MB limit
        raise HTTPException(status_code=400, detail="File too large")
        
    hashes = await calculate_hashes(content)
    
    # Duplicate check
    result = await db.execute(select(MalwareSample).filter(MalwareSample.sha256 == hashes['sha256']))
    existing_sample = result.scalars().first()
    
    if existing_sample:
        raise HTTPException(status_code=409, detail=f"Duplicate sample detected. ID: {existing_sample.id}")
        
    # Generate unique ID and store in MinIO
    sample_id = uuid.uuid4()
    object_name = f"{sample_id}/{file.filename}"
    
    # Store in MinIO
    try:
        # Note: in async fastapi, CPU-bound or blocking I/O should be run in a threadpool
        # For simplicity in this structure, we call the sync boto3 method directly
        storage_service.upload_file(object_name, content, file.content_type or "application/octet-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Storage error: {str(e)}")

    # Run static analysis
    static_results = static_analysis_service.analyze(content, file.filename)

    # Database entry
    db_sample = MalwareSample(
        id=sample_id,
        filename=file.filename,
        file_size=file_size,
        md5=hashes['md5'],
        sha1=hashes['sha1'],
        sha256=hashes['sha256'],
        mime_type=file.content_type or "application/octet-stream",
        status="QUEUED",
        entropy=static_results['entropy'],
        pe_headers=static_results['pe_headers'],
        yara_matches=static_results['yara_matches'],
        imports=static_results['imports'],
        exports=static_results['exports'],
        uploaded_by="admin_user_id" # hardcoded for preview
    )
    db.add(db_sample)
    await db.commit()
    await db.refresh(db_sample)
    
    # Publish to RabbitMQ for Static Analysis Worker
    await queue_service.publish_message(
        "static_analysis_queue",
        {
            "sample_id": str(sample_id),
            "object_name": object_name,
            "sha256": hashes['sha256']
        }
    )
    
    return db_sample

@router.get("/uploads", response_model=List[MalwareSampleResponse])
async def list_uploads(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
) -> Any:
    result = await db.execute(select(MalwareSample).offset(skip).limit(limit))
    return result.scalars().all()
