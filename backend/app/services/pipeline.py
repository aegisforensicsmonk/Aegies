import asyncio
from celery import shared_task
from app.core.celery_app import celery_app
from app.db.session import AsyncSessionLocal
from app.models.upload import MalwareSample
from app.models.analysis import AnalysisRun, TelemetryEvent
from sqlalchemy.future import select
import logging
from app.services.static_analysis import static_analysis_service
from app.services.sandbox_client import sandbox_client
from app.services.behavior_analytics import behavior_analytics
from app.core.scoring import scoring_engine
from app.services.ai_analyst import ai_analyst
import json

logger = logging.getLogger(__name__)

def sync_run(coroutine):
    """Helper to run async code in a synchronous Celery task"""
    return asyncio.get_event_loop().run_until_complete(coroutine)

@celery_app.task(bind=True, name="pipeline.start_analysis_pipeline")
def start_analysis_pipeline(self, task_id: str, file_path: str, filename: str):
    """
    Entry point for the analysis DAG.
    This routes the sample through Static Analysis -> Dynamic Analysis -> RE -> Scoring.
    """
    logger.info(f"Starting analysis pipeline for internal task: {task_id}")
    
    # 1. Trigger Static Analysis
    static_analysis_task.delay(task_id, file_path, filename)
    
    # 2. Trigger Dynamic Sandbox Execution
    submit_to_sandbox_task.delay(task_id, file_path, filename)
    
    # 3. Trigger RE if it's an executable
    if filename.lower().endswith(('.exe', '.dll', '.elf')):
        from app.workers.reverse_engineering_worker import run_reverse_engineering_task
        run_reverse_engineering_task.delay(task_id, file_path)

@celery_app.task(bind=True, name="pipeline.static_analysis_task")
def static_analysis_task(self, task_id: str, file_path: str, filename: str):
    logger.info(f"Running static analysis for {task_id}")
    
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            
        result = static_analysis_service.analyze(content, filename)
        logger.info(f"Static Analysis complete for {task_id}")
        
        # Save to DB (Skipped for brevity in this mock update)
        
    except Exception as e:
        logger.error(f"Static analysis failed: {e}")
        
    return {"status": "success", "stage": "static_analysis"}


@celery_app.task(bind=True, name="pipeline.submit_to_sandbox_task")
def submit_to_sandbox_task(self, task_id: str, file_path: str, filename: str):
    logger.info(f"Submitting {task_id} to external Sandbox")
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
            
        sandbox_task_id = sync_run(sandbox_client.submit_file(content, filename))
        
        if sandbox_task_id:
            from app.workers.sandbox_polling_worker import poll_sandbox_task
            poll_sandbox_task.delay(task_id, sandbox_task_id)
        else:
            logger.error("Failed to get sandbox task ID.")
            
    except Exception as e:
        logger.error(f"Submission to sandbox failed: {e}")
        
    return {"status": "success"}

@celery_app.task(bind=True, name="pipeline.parse_dynamic_report_task")
def parse_dynamic_report_task(self, task_id: str, raw_report: dict):
    logger.info(f"Parsing sandbox report for {task_id}")
    behavior = behavior_analytics.parse_sandbox_report(raw_report)
    logger.info(f"Dynamic Analysis parsed. {len(behavior.processes)} processes found.")
    
    # Normally we would save to DB and trigger scoring here 
    # if this was the final task in the chord. For now, we mock the trigger.
    hybrid_scoring_task.delay(task_id)
    return {"status": "success"}

@celery_app.task(bind=True, name="pipeline.process_re_results_task")
def process_re_results_task(self, task_id: str, raw_output: dict):
    logger.info(f"Processing RE output for {task_id}")
    from app.services.reverse_engineering import re_service
    result = re_service.parse_worker_results(raw_output)
    logger.info(f"RE Parsing complete.")
    return {"status": "success"}


@celery_app.task(bind=True, name="pipeline.hybrid_scoring_task")
def hybrid_scoring_task(self, task_id: str):
    logger.info(f"Calculating hybrid score and generating AI summary for {task_id}")
    
    # Normally we would fetch the static, dynamic, and RE results from the DB here.
    # We mock them for this flow.
    from app.core.schema_models import StaticAnalysisResult, NormalizedBehavior, ReverseEngineeringResult
    
    static_mock = StaticAnalysisResult(entropy=7.5, is_packed=True)
    dynamic_mock = NormalizedBehavior(ransomware_signals={"mass_encryption_detected": True})
    
    score_result = scoring_engine.calculate_score(static=static_mock, dynamic=dynamic_mock)
    
    summary = ai_analyst.generate_summary(
        static=static_mock,
        dynamic=dynamic_mock,
        score_data=score_result.model_dump()
    )
    logger.info(f"Final Threat Level: {score_result.threat_level}")
    logger.info(f"AI Summary: {summary.executive_summary}")
    
    return {"status": "success", "stage": "scoring"}
