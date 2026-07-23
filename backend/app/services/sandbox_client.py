from typing import Dict, Any, Optional
import httpx
import logging
import asyncio
from app.core.config import settings

logger = logging.getLogger(__name__)

class SandboxClient:
    def __init__(self):
        # We assume CAPE-like REST API structure
        # URL and API Key would be in settings, defaulting to mock paths here
        self.base_url = getattr(settings, 'SANDBOX_API_URL', 'http://localhost:8090/apiv2')
        self.api_key = getattr(settings, 'SANDBOX_API_KEY', 'mock-sandbox-key')
        self.headers = {"Authorization": f"Bearer {self.api_key}"}

    async def submit_file(self, file_content: bytes, filename: str) -> Optional[int]:
        """
        Submits a file to the external sandbox for analysis.
        Returns the task ID provided by the sandbox.
        """
        url = f"{self.base_url}/tasks/create/file/"
        files = {'file': (filename, file_content)}
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, files=files, headers=self.headers, timeout=10.0)
                if response.status_code == 200:
                    data = response.json()
                    task_id = data.get("data", {}).get("task_id")
                    logger.info(f"Submitted {filename} to sandbox. Task ID: {task_id}")
                    return task_id
                else:
                    logger.error(f"Sandbox submission failed: {response.text}")
                    return None
        except Exception as e:
            logger.error(f"Error communicating with sandbox: {e}")
            return None

    async def get_task_status(self, task_id: int) -> str:
        """
        Returns 'pending', 'running', 'completed', or 'failed'.
        """
        url = f"{self.base_url}/tasks/status/{task_id}/"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    return data.get("data", {}).get("status", "failed")
                return "failed"
        except Exception:
            return "failed"

    async def get_report(self, task_id: int) -> Optional[Dict[str, Any]]:
        """
        Fetches the complete JSON analysis report for a completed task.
        """
        url = f"{self.base_url}/tasks/get/report/{task_id}/"
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, headers=self.headers, timeout=30.0)
                if response.status_code == 200:
                    return response.json()
                return None
        except Exception as e:
            logger.error(f"Error fetching sandbox report for task {task_id}: {e}")
            return None

sandbox_client = SandboxClient()
