import logging
from celery import shared_task
from app.core.celery_app import celery_app
import subprocess
import json

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name="pipeline.run_reverse_engineering_task", queue="re_vm_queue")
def run_reverse_engineering_task(self, internal_task_id: str, file_path: str):
    """
    Executes Ghidra in headless mode on a separate analysis VM.
    Note: This Celery task must be routed to a specific worker queue (`re_vm_queue`).
    """
    logger.info(f"Running Reverse Engineering worker for task {internal_task_id} on file {file_path}")
    
    # In a real environment, this would call `analyzeHeadless` script.
    # For now, we mock the execution.
    try:
        # Mocking headless ghidra output
        mock_output = {
            "project_path": f"/opt/ghidra/projects/task_{internal_task_id}.gpr",
            "functions": ["start", "sub_401000", "encrypt_file", "generate_key"],
            "decompiled": {
                "encrypt_file": "void encrypt_file(char* path) { CryptEncrypt(...); }"
            },
            "crypto_constants": ["0x67452301", "0xefcdab89", "0x98badcfe", "0x10325476"], # MD5 initialization variables
            "config_blocks": ["url=http://malicious.c2/drop"]
        }
        
        # Trigger scoring engine update next
        from app.services.pipeline import process_re_results_task
        process_re_results_task.delay(internal_task_id, mock_output)
        
        return {"status": "success", "message": "RE complete"}
        
    except Exception as e:
        logger.error(f"Ghidra execution failed: {e}")
        return {"status": "failed", "error": str(e)}
