import csv
import io
import asyncio
from celery import shared_task
from app.core.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from app.models.ipdr import IPDRRecord
from app.services.ipdr_normalizer import IPDRNormalizer
import os

@celery_app.task(bind=True, name="app.workers.ipdr_tasks.process_ipdr_file")
def process_ipdr_file(self, file_path: str, case_id: str, user_id: str):
    """
    Background task to process a large IPDR CSV file in chunks.
    Updates task state with progress for the frontend to poll.
    """
    chunk_size = 1000
    total_ingested = 0
    total_rows = 0

    # First pass: count lines for progress reporting (efficiently)
    if os.path.exists(file_path):
        with open(file_path, 'rb') as f:
            total_rows = sum(1 for _ in f) - 1 # minus header
            
    if total_rows <= 0:
        total_rows = 1 # Avoid division by zero
        
    db_records = []
    
    async def process_chunks():
        nonlocal total_ingested
        async with AsyncSessionLocal() as db:
            with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                csv_reader = csv.DictReader(f)
                for row in csv_reader:
                    try:
                        validated_record = IPDRNormalizer.normalize_record(row)
                        record_data = validated_record.model_dump()
                        if case_id:
                            record_data['case_id'] = case_id
                        db_records.append(IPDRRecord(**record_data))
                    except Exception as e:
                        # Log validation errors, skip or mark bad row
                        continue
                        
                    if len(db_records) >= chunk_size:
                        db.add_all(db_records)
                        await db.commit()
                        total_ingested += len(db_records)
                        db_records.clear()
                        
                        # Update progress
                        self.update_state(state='PROGRESS',
                                          meta={'current': total_ingested, 'total': total_rows, 'status': 'Processing records...'})
                
                # Commit remainder
                if db_records:
                    db.add_all(db_records)
                    await db.commit()
                    total_ingested += len(db_records)
                    
            return total_ingested

    # Execute async function in Celery's sync context
    loop = asyncio.get_event_loop()
    if loop.is_closed():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
    
    result = loop.run_until_complete(process_chunks())
    
    # Cleanup temp file
    try:
        os.remove(file_path)
    except OSError:
        pass

    return {'current': result, 'total': total_rows, 'status': 'Completed successfully'}
