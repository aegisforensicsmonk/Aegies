import httpx
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class CAPESandboxService:
    def __init__(self, api_url: str = "http://cape:8000/apiv2", api_token: str = "cape_token"):
        self.api_url = api_url
        self.headers = {"Authorization": f"Token {api_token}"}
        
    async def submit_sample(self, file_path: str, filename: str) -> Optional[int]:
        """Submits a file to CAPE Sandbox via API v2"""
        url = f"{self.api_url}/tasks/create/file/"
        try:
            with open(file_path, "rb") as f:
                files = {"file": (filename, f)}
                async with httpx.AsyncClient() as client:
                    response = await client.post(url, headers=self.headers, files=files, timeout=30.0)
                    response.raise_for_status()
                    data = response.json()
                    task_id = data.get("data", {}).get("task_id")
                    logger.info(f"Successfully submitted to CAPE. Task ID: {task_id}")
                    return task_id
        except Exception as e:
            logger.error(f"Failed to submit sample to CAPE: {e}")
            return None

    async def get_report(self, task_id: int) -> Dict[str, Any]:
        """Retrieves the full JSON report from CAPE Sandbox"""
        url = f"{self.api_url}/tasks/get/report/{task_id}/"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=60.0)
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"Failed to get report for task {task_id}: {e}")
            return {}

cape_service = CAPESandboxService()
