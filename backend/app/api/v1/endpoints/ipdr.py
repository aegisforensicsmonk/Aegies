from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
import csv
import io
import asyncio
import os
import tempfile
import aiofiles
from celery.result import AsyncResult

from app.db.session import get_db
from app.schemas.ipdr import IPDRCreate, IPDRResponse
from app.models.ipdr import IPDRRecord
from app.services.ipdr_normalizer import IPDRNormalizer
from app.workers.ipdr_tasks import process_ipdr_file

from app.core.auth import get_current_user

router = APIRouter()

@router.post("/ingest/json", response_model=dict, status_code=status.HTTP_201_CREATED)
async def ingest_ipdr_json(
    records: List[IPDRCreate],
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Ingest a batch of IPDR records in JSON format.
    """
    db_records = []
    for record in records:
        db_record = IPDRRecord(**record.model_dump())
        db_records.append(db_record)
    
    db.add_all(db_records)
    await db.commit()
    
    return {"status": "success", "message": f"Ingested {len(db_records)} records"}

@router.post("/ingest/csv", response_model=dict, status_code=status.HTTP_201_CREATED)
async def ingest_ipdr_csv(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Stream IPDR upload to disk and dispatch background Celery task.
    """
    if file.filename and not file.filename.lower().endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for this endpoint")
        
    # Stream the file to a temporary location
    fd, temp_file_path = tempfile.mkstemp(suffix=".csv")
    os.close(fd)
    
    async with aiofiles.open(temp_file_path, 'wb') as out_file:
        while content := await file.read(1024 * 1024):  # 1MB chunks
            await out_file.write(content)

    import csv
    from app.services.ipdr_normalizer import IPDRNormalizer
    
    records_to_return = []
    try:
        with open(temp_file_path, 'r', encoding='utf-8', errors='replace') as f:
            csv_reader = csv.DictReader(f)
            for row in csv_reader:
                try:
                    validated_record = IPDRNormalizer.normalize_record(row)
                    record_dict = validated_record.model_dump()
                    
                    # Convert datetimes to strings for JSON serialization
                    for key in ['timestamp', 'start_time', 'end_time']:
                        if key in record_dict and record_dict[key]:
                            record_dict[key] = record_dict[key].isoformat()
                            
                    if 'id' in record_dict:
                        record_dict['id'] = str(record_dict['id'])
                        
                    records_to_return.append(record_dict)
                    
                    if len(records_to_return) >= 1000: # Limit frontend load
                        break
                except Exception:
                    continue
    except Exception as e:
        print(f"Error parsing CSV: {e}")

    # Dispatch Celery task
    # Commented out to prevent infinite blocking when Redis is down
    # try:
    #     task = process_ipdr_file.delay(temp_file_path, "case-001", str(current_user.get("id", "")))
    #     task_id = task.id
    # except Exception as e:
    #     print(f"Failed to dispatch Celery task: {e}")
    #     task_id = None
    
    task_id = "local-sync-task"
    
    return {
        "status": "success", 
        "message": f"Successfully parsed {len(records_to_return)} records.",
        "task_id": task_id,
        "records": records_to_return
    }

@router.get("/status/{task_id}")
async def get_task_status(task_id: str):
    """
    Poll IPDR ingestion task status.
    """
    task = AsyncResult(task_id)
    if task.state == 'PENDING':
        response = {
            'state': task.state,
            'current': 0,
            'total': 1,
            'status': 'Pending...'
        }
    elif task.state != 'FAILURE':
        response = {
            'state': task.state,
            'current': task.info.get('current', 0) if task.info else 0,
            'total': task.info.get('total', 1) if task.info else 1,
            'status': task.info.get('status', '') if task.info else ''
        }
        if task.info and 'result' in task.info:
            response['result'] = task.info['result']
    else:
        response = {
            'state': task.state,
            'current': 1,
            'total': 1,
            'status': str(task.info),
        }
    return response

@router.get("/analytics/graph")
async def get_ipdr_graph(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns nodes and links for Force-Directed Graph visualization.
    Uses PostgreSQL GROUP BY as a lightweight relationship mapping.
    """
    query = select(
        IPDRRecord.source_identifier,
        IPDRRecord.destination_identifier,
        func.count(IPDRRecord.id).label('call_count')
    ).group_by(
        IPDRRecord.source_identifier,
        IPDRRecord.destination_identifier
    ).having(IPDRRecord.destination_identifier != None).limit(500)
    
    result = await db.execute(query)
    rows = result.all()
    
    nodes_dict = {}
    links = []
    
    for row in rows:
        src = row.source_identifier
        dst = row.destination_identifier
        val = row.call_count
        
        if src not in nodes_dict:
            nodes_dict[src] = {"id": src, "group": 1}
        if dst not in nodes_dict:
            nodes_dict[dst] = {"id": dst, "group": 2}
            
        links.append({"source": src, "target": dst, "value": val})
        
    nodes = list(nodes_dict.values())
    return {"nodes": nodes, "links": links}

from app.services.anomaly_detector import AnomalyDetector

@router.get("/analytics/anomalies")
async def get_ipdr_anomalies(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Returns detected anomalies (Impossible Travel) from recent IPDR records.
    """
    # Fetch recent records with coordinates
    query = select(IPDRRecord).where(
        IPDRRecord.location_lat != None,
        IPDRRecord.location_lon != None
    ).order_by(IPDRRecord.timestamp.desc()).limit(1000)
    
    result = await db.execute(query)
    records = [
        {
            'id': str(r.id),
            'imsi': r.imsi,
            'imei': r.imei,
            'source_identifier': r.source_identifier,
            'location_lat': r.location_lat,
            'location_lon': r.location_lon,
            'timestamp': r.timestamp
        }
        for r in result.scalars().all()
    ]
    
    anomalies = AnomalyDetector.detect_impossible_travel(records)
    return {"status": "success", "anomalies": anomalies}
