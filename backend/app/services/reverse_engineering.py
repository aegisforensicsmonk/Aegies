import logging
from app.core.schema_models import ReverseEngineeringResult
import uuid

logger = logging.getLogger(__name__)

class ReverseEngineeringService:
    def parse_worker_results(self, raw_ghidra_output: dict) -> ReverseEngineeringResult:
        """
        Parses the JSON output returned by the headless Ghidra worker.
        """
        logger.info("Parsing reverse engineering worker results.")
        
        if not raw_ghidra_output:
            return ReverseEngineeringResult(ghidra_project_path=None)
            
        return ReverseEngineeringResult(
            ghidra_project_path=raw_ghidra_output.get("project_path"),
            extracted_functions=raw_ghidra_output.get("functions", []),
            decompiled_snippets=raw_ghidra_output.get("decompiled", {}),
            identified_crypto_constants=raw_ghidra_output.get("crypto_constants", []),
            config_blocks=raw_ghidra_output.get("config_blocks", [])
        )

re_service = ReverseEngineeringService()
