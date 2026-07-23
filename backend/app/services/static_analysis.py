import hashlib
import os
import math
from typing import Dict, Any, List
from app.core.schema_models import StaticAnalysisResult

# Optional dependencies for real static analysis
try:
    import pefile
    PEFILE_AVAILABLE = True
except ImportError:
    PEFILE_AVAILABLE = False

try:
    import yara
    YARA_AVAILABLE = True
except ImportError:
    YARA_AVAILABLE = False


class StaticAnalysisService:
    
    def _calculate_entropy(self, data: bytes) -> float:
        if not data:
            return 0.0
        entropy = 0
        for x in range(256):
            p_x = float(data.count(x)) / len(data)
            if p_x > 0:
                entropy += - p_x * math.log(p_x, 2)
        return round(entropy, 2)

    def _extract_hashes(self, data: bytes) -> Dict[str, str]:
        return {
            "md5": hashlib.md5(data).hexdigest(),
            "sha1": hashlib.sha1(data).hexdigest(),
            "sha256": hashlib.sha256(data).hexdigest()
        }

    def _extract_strings(self, data: bytes, min_length: int = 5) -> List[str]:
        # Simplified ascii string extraction
        result = []
        current_str = ""
        for byte in data:
            if 32 <= byte <= 126:
                current_str += chr(byte)
            else:
                if len(current_str) >= min_length:
                    result.append(current_str)
                current_str = ""
        return result[:100]  # Limit to first 100 for brevity

    def _analyze_pe(self, data: bytes) -> Dict[str, Any]:
        result = {"is_pe": False, "imports": [], "metadata": {}}
        if not PEFILE_AVAILABLE:
            return result
            
        try:
            pe = pefile.PE(data=data)
            result["is_pe"] = True
            result["metadata"] = {
                "machine": hex(pe.FILE_HEADER.Machine),
                "sections": pe.FILE_HEADER.NumberOfSections,
                "timestamp": pe.FILE_HEADER.TimeDateStamp
            }
            if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
                for entry in pe.DIRECTORY_ENTRY_IMPORT:
                    dll_name = entry.dll.decode('utf-8', 'ignore') if entry.dll else "unknown"
                    for imp in entry.imports:
                        func_name = imp.name.decode('utf-8', 'ignore') if imp.name else str(imp.ordinal)
                        result["imports"].append(f"{dll_name}!{func_name}")
        except Exception:
            pass
        return result

    def analyze(self, file_content: bytes, filename: str) -> StaticAnalysisResult:
        """
        Performs static analysis extracting hashes, entropy, strings, and PE details.
        """
        entropy = self._calculate_entropy(file_content)
        is_packed = entropy > 7.2
        
        strings = self._extract_strings(file_content)
        pe_info = self._analyze_pe(file_content)
        
        suspicious_imports = [imp for imp in pe_info.get("imports", []) if "Crypt" in imp or "VirtualAlloc" in imp]
        
        # Simulated YARA matches
        yara_matches = []
        content_lower = file_content.lower()
        if b'encrypt' in content_lower or b'ransom' in content_lower:
            yara_matches.append('Ransomware_Generic')
            
        return StaticAnalysisResult(
            entropy=entropy,
            is_packed=is_packed,
            compiler=None,
            yara_matches=yara_matches,
            suspicious_imports=suspicious_imports,
            extracted_strings=strings,
            pe_metadata=pe_info.get("metadata", {})
        )

static_analysis_service = StaticAnalysisService()
