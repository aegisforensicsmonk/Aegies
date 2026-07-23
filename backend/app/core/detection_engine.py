from typing import Dict, Any, List
import logging
import json
import os
from app.core.schema_models import NormalizedBehavior

logger = logging.getLogger(__name__)

class DetectionEngine:
    def __init__(self):
        # In a real environment, you would use python-yara: import yara
        # and compile rules on init: self.rules = yara.compile(filepaths=...)
        self.yara_rules_path = "/rules/yara"
        self.sigma_rules_path = "/rules/sigma"
        
    def scan_file_yara(self, file_content: bytes) -> List[str]:
        """Mock YARA scanning. In production, this uses python-yara."""
        matches = []
        
        # Super simplified mock logic based on strings
        content_str = str(file_content)[:1000] # Only check first 1000 bytes for mock
        if b"IsDebuggerPresent" in file_content:
            matches.append("AntiDebug_IsDebuggerPresent")
        if b"VirtualAllocEx" in file_content or b"CreateRemoteThread" in file_content:
            matches.append("ProcessInjection_API")
        if b"WannaCry" in file_content or b"LockBit" in file_content:
            matches.append("Ransomware_String_Indicator")
            
        return matches

    def match_sigma_rules(self, dynamic_behavior: NormalizedBehavior) -> List[Dict[str, Any]]:
        """
        Mock Sigma rule matching against normalized telemetry events.
        Sigma rules usually translate to SIEM queries, but we evaluate them directly against the JSON timeline.
        """
        triggered_rules = []
        
        for process in dynamic_behavior.processes:
            process_name = process.process_name.lower()
            command_line = process.command_line.lower()
            
            # Rule: Suspicious Vssadmin Usage (Shadow Copy Deletion)
            if "vssadmin" in process_name and "delete shadows" in command_line:
                triggered_rules.append({
                    "rule_name": "Ransomware_Shadow_Copy_Deletion",
                    "severity": "CRITICAL",
                    "description": "Adversary attempted to delete volume shadow copies to prevent recovery.",
                    "evidence": process.model_dump()
                })
                
            # Rule: Suspicious PowerShell Download
            if "powershell" in process_name and "downloadstring" in command_line:
                triggered_rules.append({
                    "rule_name": "Suspicious_PowerShell_Download",
                    "severity": "HIGH",
                    "description": "PowerShell used to download external payload.",
                    "evidence": process.model_dump()
                })

        return triggered_rules

detection_engine = DetectionEngine()
