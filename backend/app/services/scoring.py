from typing import Dict, Any, List, Tuple
import logging

logger = logging.getLogger(__name__)

class ScoringService:
    """
    Calculates a hybrid confidence score (0.0 to 1.0) and a threat level
    based on Static Analysis, Dynamic Analysis, and Rule matching.
    """
    def __init__(self):
        # Weights for the hybrid scoring engine
        self.STATIC_WEIGHT = 0.3
        self.DYNAMIC_WEIGHT = 0.5
        self.RULE_WEIGHT = 0.2

    def calculate_score(
        self, 
        static_features: Dict[str, Any], 
        dynamic_features: Dict[str, Any], 
        rule_matches: List[Dict[str, Any]]
    ) -> Tuple[float, str]:
        
        static_score = self._score_static(static_features)
        dynamic_score = self._score_dynamic(dynamic_features)
        rule_score = self._score_rules(rule_matches)
        
        final_score = (
            (static_score * self.STATIC_WEIGHT) + 
            (dynamic_score * self.DYNAMIC_WEIGHT) + 
            (rule_score * self.RULE_WEIGHT)
        )
        
        # Ensure bounds
        final_score = min(max(final_score, 0.0), 1.0)
        
        if final_score >= 0.75:
            threat_level = "Malicious"
        elif final_score >= 0.40:
            threat_level = "Suspicious"
        else:
            threat_level = "Benign"
            
        logger.info(f"Calculated Hybrid Score: {final_score:.2f} ({threat_level})")
        return final_score, threat_level
        
    def _score_static(self, features: Dict[str, Any]) -> float:
        score = 0.0
        entropy = features.get("entropy", 0.0)
        if entropy > 7.2: # High entropy implies packed/encrypted
            score += 0.6
        if features.get("suspicious_imports"):
            score += 0.4
        return min(score, 1.0)
        
    def _score_dynamic(self, features: Dict[str, Any]) -> float:
        score = 0.0
        if features.get("mass_file_encryption"):
            score += 1.0 # Immediate max score
        if features.get("shadow_copy_deletion"):
            score += 0.8
        if features.get("process_injection"):
            score += 0.6
        if features.get("ransom_note_dropped"):
            score += 0.8
        return min(score, 1.0)
        
    def _score_rules(self, matches: List[Dict[str, Any]]) -> float:
        score = 0.0
        for match in matches:
            severity = match.get("severity", "LOW")
            if severity == "CRITICAL":
                score += 1.0
            elif severity == "HIGH":
                score += 0.5
            elif severity == "MEDIUM":
                score += 0.2
        return min(score, 1.0)

scoring_service = ScoringService()
