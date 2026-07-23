import logging
from typing import Dict, Any
from app.core.schema_models import AISummaryResult, StaticAnalysisResult, NormalizedBehavior, ReverseEngineeringResult

# Mock import for local LLM (e.g. Ollama/Llama3)
# In production, this would use a proper client library like `ollama` or `langchain`
try:
    import ollama
    OLLAMA_AVAILABLE = True
except ImportError:
    OLLAMA_AVAILABLE = False

logger = logging.getLogger(__name__)

class AIAnalystService:
    def __init__(self):
        self.model = "llama3"

    def generate_summary(self, 
                         static: StaticAnalysisResult = None, 
                         dynamic: NormalizedBehavior = None, 
                         re_data: ReverseEngineeringResult = None,
                         score_data: Dict[str, Any] = None) -> AISummaryResult:
        """
        Generates an evidence-based executive summary of the ransomware analysis.
        Strictly prevents hallucination by only passing structured data.
        """
        prompt = self._build_prompt(static, dynamic, re_data, score_data)
        
        try:
            if OLLAMA_AVAILABLE:
                response = ollama.chat(model=self.model, messages=[
                    {
                        'role': 'system',
                        'content': 'You are a senior cybersecurity analyst. Write a concise, executive summary of the provided malware analysis data. State the threat level, explain the specific indicators that triggered this conclusion, and NEVER invent or assume facts not present in the data. Do not provide recommendations, only summarize the evidence.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ])
                summary_text = response['message']['content']
            else:
                summary_text = self._fallback_summary(score_data)
                
        except Exception as e:
            logger.error(f"AI generation failed: {e}")
            summary_text = self._fallback_summary(score_data)

        return AISummaryResult(
            executive_summary=summary_text,
            threat_level=score_data.get('threat_level', 'Unknown') if score_data else 'Unknown',
            confidence_score=score_data.get('confidence_score', 0.0) if score_data else 0.0,
            model_version=self.model if OLLAMA_AVAILABLE else "fallback-rules-v1"
        )

    def _build_prompt(self, static, dynamic, re_data, score_data) -> str:
        prompt_parts = ["Analyze the following malware analysis evidence:\n"]
        
        if score_data:
            prompt_parts.append(f"CALCULATED SCORE: {score_data.get('confidence_score', 0)}")
            prompt_parts.append(f"THREAT LEVEL: {score_data.get('threat_level', 'Unknown')}")
            
        if static:
            prompt_parts.append(f"\nSTATIC EVIDENCE:\nEntropy: {static.entropy}, Packed: {static.is_packed}")
            prompt_parts.append(f"YARA Matches: {', '.join(static.yara_matches)}")
            
        if dynamic:
            signals = [k for k, v in dynamic.ransomware_signals.items() if v]
            prompt_parts.append(f"\nDYNAMIC EVIDENCE:\nRansomware Signals: {', '.join(signals)}")
            
        if re_data and re_data.identified_crypto_constants:
            prompt_parts.append(f"\nREVERSE ENGINEERING:\nCrypto Constants: {', '.join(re_data.identified_crypto_constants)}")
            
        return "\n".join(prompt_parts)

    def _fallback_summary(self, score_data) -> str:
        if not score_data:
            return "Analysis completed. Evidence insufficient to determine threat level."
        return f"Analysis completed. Calculated threat level is {score_data.get('threat_level')} (Score: {score_data.get('confidence_score')}). Model unavailable for detailed summary generation."

    def generate_osint_summary(self, osint_data: dict) -> str:
        """
        Generates an executive summary of OSINT findings.
        """
        prompt = self._build_osint_prompt(osint_data)
        
        try:
            if OLLAMA_AVAILABLE:
                response = ollama.chat(model=self.model, messages=[
                    {
                        'role': 'system',
                        'content': 'You are a senior threat intelligence analyst. Write a concise, one-paragraph executive summary of the provided open-source intelligence (OSINT) data. State the reputation, explain the specific indicators that led to this conclusion based ONLY on the provided data, and highlight any key enrichment data (like WHOIS or DNS records). Do NOT invent or assume facts.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ])
                return response['message']['content']
            else:
                return self._fallback_osint_summary(osint_data)
                
        except Exception as e:
            logger.error(f"AI OSINT generation failed: {e}")
            return self._fallback_osint_summary(osint_data)

    def _build_osint_prompt(self, osint_data: dict) -> str:
        prompt_parts = [f"Analyze the following OSINT evidence for {osint_data.get('ioc_type', 'indicator')} '{osint_data.get('ioc', 'Unknown')}':\n"]
        prompt_parts.append(f"REPUTATION: {osint_data.get('reputation', 'Unknown')} (Score: {osint_data.get('confidence_score', 0)})")
        
        tags = osint_data.get('tags', [])
        if tags:
            prompt_parts.append(f"TAGS: {', '.join(tags)}")
            
        enrichment = osint_data.get('enrichment_data', {})
        if enrichment:
            prompt_parts.append("\nENRICHMENT DATA:")
            for key, value in enrichment.items():
                # Truncate value if it's too long to avoid huge prompts
                val_str = str(value)
                if len(val_str) > 200:
                    val_str = val_str[:197] + "..."
                prompt_parts.append(f"- {key.upper()}: {val_str}")
                
        return "\n".join(prompt_parts)

    def _fallback_osint_summary(self, osint_data: dict) -> str:
        reputation = osint_data.get('reputation', 'unknown')
        tags = ', '.join(osint_data.get('tags', []))
        return f"OSINT scan completed. The indicator was classified as '{reputation}' with tags: {tags}. AI model unavailable for detailed summary generation."

ai_analyst = AIAnalystService()
