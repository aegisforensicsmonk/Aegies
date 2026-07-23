from app.core.schema_models import StaticAnalysisResult, NormalizedBehavior, ReverseEngineeringResult, ScoringResult

class ScoringEngine:
    def calculate_score(self, 
                        static: StaticAnalysisResult = None, 
                        dynamic: NormalizedBehavior = None, 
                        re: ReverseEngineeringResult = None) -> ScoringResult:
        """
        Calculates a hybrid confidence score and threat level based on the findings
        from all analysis stages.
        """
        score = 0.0
        explanations = []

        # 1. Static Evaluation
        if static:
            if static.is_packed or (static.entropy and static.entropy > 7.2):
                score += 15.0
                explanations.append("High entropy/packed file detected.")
            if "Ransomware_Generic" in static.yara_matches:
                score += 30.0
                explanations.append("YARA rule matched generic ransomware signatures.")
            if any("Crypt" in imp for imp in static.suspicious_imports):
                score += 10.0
                explanations.append("Suspicious cryptographic API imports detected.")

        # 2. Dynamic Evaluation
        if dynamic:
            if dynamic.ransomware_signals.get("mass_encryption_detected"):
                score += 40.0
                explanations.append("Mass file encryption behavior observed.")
            if dynamic.ransomware_signals.get("shadow_copy_deletion_detected"):
                score += 30.0
                explanations.append("Volume shadow copy deletion attempted (classic ransomware behavior).")
            if dynamic.ransomware_signals.get("ransom_note_detected"):
                score += 20.0
                explanations.append("Ransom note dropped on filesystem.")
                
            # Cap dynamic contribution to avoid overscoring
            score = min(score, 100.0)

        # 3. Reverse Engineering Evaluation
        if re:
            if re.identified_crypto_constants:
                score += 15.0
                explanations.append(f"Identified known crypto constants: {', '.join(re.identified_crypto_constants)}.")
            if re.config_blocks:
                score += 10.0
                explanations.append("Extracted embedded malware configuration blocks.")

        # Normalize score
        final_score = min(score, 100.0)

        # Determine Threat Level
        if final_score >= 80.0:
            threat_level = "Critical"
        elif final_score >= 60.0:
            threat_level = "High"
        elif final_score >= 30.0:
            threat_level = "Medium"
        else:
            threat_level = "Low"

        if not explanations:
            explanation_text = "No significant malicious indicators detected."
        else:
            explanation_text = " Indicators found: " + " ".join(explanations)

        return ScoringResult(
            threat_level=threat_level,
            confidence_score=final_score,
            explanation=explanation_text
        )

scoring_engine = ScoringEngine()
