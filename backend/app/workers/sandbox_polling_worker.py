import asyncio
import logging
from celery import shared_task
from app.core.celery_app import celery_app
from app.services.sandbox_client import sandbox_client
from app.db.session import async_session
from app.models.analysis import AnalysisRun # Example import, adjust based on actual model structure
# Assuming analysis_tasks is mapped to a SQLAlchemy model, e.g. AnalysisTask

logger = logging.getLogger(__name__)

# Note: In a real environment with async SQLAlchemy and Celery, 
# you often need an event loop to run async functions within sync Celery workers.
def _run_async(coro):
    return asyncio.get_event_loop().run_until_complete(coro)

@celery_app.task(bind=True, name="pipeline.poll_sandbox_task", max_retries=10)
def poll_sandbox_task(self, internal_task_id: str, sandbox_task_id: int):
    """
    Polls the external sandbox for completion. 
    If not complete, retries with exponential backoff.
    If complete, fetches the report and triggers dynamic behavior parsing.
    """
    logger.info(f"Polling sandbox for internal task {internal_task_id}, sandbox ID {sandbox_task_id}")
    
    status = _run_async(sandbox_client.get_task_status(sandbox_task_id))
    
    if status in ["pending", "running"]:
        # Retry in (2 ^ attempt) * 10 seconds (e.g. 10s, 20s, 40s, 80s...)
        retry_delay = (2 ** self.request.retries) * 10 
        logger.info(f"Sandbox task {sandbox_task_id} is {status}. Retrying in {retry_delay}s...")
        raise self.retry(countdown=retry_delay)
        
    elif status == "failed":
        logger.error(f"Sandbox task {sandbox_task_id} failed.")
        # Trigger failure state update in DB
        return {"status": "failed", "error": "Sandbox execution failed."}
        
    elif status == "completed":
        logger.info(f"Sandbox task {sandbox_task_id} completed. Fetching report...")
        report = _run_async(sandbox_client.get_report(sandbox_task_id))
        
        if not report:
            logger.error("Sandbox report was empty.")
            return {"status": "failed", "error": "Empty report from sandbox."}
            
        # Trigger next step: Dynamic Analysis Parsing
        from app.services.pipeline import parse_dynamic_report_task
        parse_dynamic_report_task.delay(internal_task_id, report)
        
        return {"status": "success", "message": "Report fetched and parsing triggered."}
    
    return {"status": "unknown"}
