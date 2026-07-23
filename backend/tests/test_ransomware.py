import pytest
from app.core.schema_models import StaticAnalysisResult, NormalizedBehavior, ReverseEngineeringResult
from app.core.scoring import scoring_engine
from app.services.static_analysis import static_analysis_service

def test_scoring_engine_critical():
    static = StaticAnalysisResult(entropy=7.8, is_packed=True, yara_matches=["Ransomware_Generic"])
    dynamic = NormalizedBehavior(ransomware_signals={"mass_encryption_detected": True, "ransom_note_detected": True})
    
    result = scoring_engine.calculate_score(static=static, dynamic=dynamic)
    
    assert result.confidence_score == 100.0
    assert result.threat_level == "Critical"
    assert "Mass file encryption" in result.explanation

def test_scoring_engine_low():
    static = StaticAnalysisResult(entropy=4.2, is_packed=False)
    dynamic = NormalizedBehavior()
    
    result = scoring_engine.calculate_score(static=static, dynamic=dynamic)
    
    assert result.confidence_score == 0.0
    assert result.threat_level == "Low"

def test_static_analysis_service_entropy():
    # Provide highly entropic random bytes
    import os
    random_bytes = os.urandom(1024)
    result = static_analysis_service.analyze(random_bytes, "test.bin")
    
    # Random bytes should have entropy close to 8.0
    assert result.entropy > 7.5
    assert result.is_packed == True

def test_static_analysis_service_strings():
    test_data = b'This is a normal string block with no encrypt or ransom words.'
    result = static_analysis_service.analyze(test_data, "test.txt")
    
    assert len(result.yara_matches) == 0
    
def test_static_analysis_service_ransomware_strings():
    test_data = b'This string block contains the word EnCrYpT and RaNsOm!'
    result = static_analysis_service.analyze(test_data, "test.txt")
    
    assert 'Ransomware_Generic' in result.yara_matches
