from typing import Dict, Any, List
from app.core.schema_models import NormalizedBehavior, ProcessNode, FileActivity, NetworkActivity

class BehaviorAnalyticsService:
    def parse_sandbox_report(self, raw_report: Dict[str, Any]) -> NormalizedBehavior:
        """
        Parses a CAPE-like JSON sandbox report and extracts normalized behavior indicators.
        """
        behavior = NormalizedBehavior()
        
        if not raw_report:
            return behavior

        # Extract behavioral signatures (e.g. CAPE signatures)
        signatures = raw_report.get("signatures", [])
        for sig in signatures:
            sig_name = sig.get("name", "")
            desc = sig.get("description", "")
            
            # Map known sandbox signatures to our flags
            if "ransomware" in sig_name.lower() or "encrypt" in desc.lower():
                behavior.ransomware_signals["mass_encryption_detected"] = True
            if "vssadmin" in sig_name.lower() or "shadow copy" in desc.lower():
                behavior.ransomware_signals["shadow_copy_deletion_detected"] = True
            
            behavior.behavior_flags.append(sig_name)

        # Extract Process Tree
        behavior_data = raw_report.get("behavior", {})
        processes = behavior_data.get("processes", [])
        for proc in processes:
            p_name = proc.get("process_name", "")
            cmd = proc.get("command_line", "")
            
            # Look for ransom note dropped via notepad or echo
            if "read_me" in cmd.lower() or "decrypt" in cmd.lower():
                behavior.ransomware_signals["ransom_note_detected"] = True
                
            behavior.processes.append(ProcessNode(
                pid=proc.get("process_id", 0),
                parent_pid=proc.get("parent_id"),
                process_name=p_name,
                command_line=cmd,
                is_malicious_candidate=True if "powershell" in p_name.lower() or "vssadmin" in p_name.lower() else False
            ))

        # Extract File Activity
        summary = behavior_data.get("summary", {})
        for file_created in summary.get("file_created", []):
            behavior.file_activity.append(FileActivity(
                action="created",
                file_path=file_created,
                sha256=None
            ))
            
        # Extract Network Activity
        network = raw_report.get("network", {})
        for tcp in network.get("tcp", []):
            behavior.network_activity.append(NetworkActivity(
                protocol="TCP",
                destination_ip=tcp.get("dst", ""),
                destination_port=tcp.get("dport", 0),
                domain=None
            ))
        for dns in network.get("dns", []):
            behavior.network_activity.append(NetworkActivity(
                protocol="DNS",
                destination_ip=dns.get("answers", [{"data": ""}])[0].get("data", ""),
                destination_port=53,
                domain=dns.get("request", "")
            ))

        return behavior

behavior_analytics = BehaviorAnalyticsService()
