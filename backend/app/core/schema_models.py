from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime
from uuid import UUID

# ---------------------------------------------------------
# Dynamic Sandbox Report Models
# ---------------------------------------------------------

class ProcessNode(BaseModel):
    pid: int
    parent_pid: Optional[int]
    process_name: str
    command_line: str
    is_malicious_candidate: bool = False

class FileActivity(BaseModel):
    action: str  # e.g., 'created', 'deleted', 'modified'
    file_path: str
    sha256: Optional[str]

class NetworkActivity(BaseModel):
    protocol: str
    destination_ip: str
    destination_port: int
    domain: Optional[str]

class NormalizedBehavior(BaseModel):
    behavior_flags: List[str] = Field(default_factory=list)
    processes: List[ProcessNode] = Field(default_factory=list)
    file_activity: List[FileActivity] = Field(default_factory=list)
    network_activity: List[NetworkActivity] = Field(default_factory=list)
    ransomware_signals: Dict[str, bool] = Field(default_factory=dict)
    score: int = Field(ge=0, le=100, default=0)

# ---------------------------------------------------------
# Static Analysis Models
# ---------------------------------------------------------

class StaticAnalysisResult(BaseModel):
    entropy: float
    is_packed: bool = False
    compiler: Optional[str]
    yara_matches: List[str] = Field(default_factory=list)
    suspicious_imports: List[str] = Field(default_factory=list)
    extracted_strings: List[str] = Field(default_factory=list)
    pe_metadata: Dict[str, Any] = Field(default_factory=dict)

# ---------------------------------------------------------
# Reverse Engineering Models
# ---------------------------------------------------------

class ReverseEngineeringResult(BaseModel):
    ghidra_project_path: Optional[str]
    extracted_functions: List[str] = Field(default_factory=list)
    decompiled_snippets: Dict[str, str] = Field(default_factory=dict)
    identified_crypto_constants: List[str] = Field(default_factory=list)
    config_blocks: List[str] = Field(default_factory=list)

# ---------------------------------------------------------
# Scoring & AI Summary Models
# ---------------------------------------------------------

class ScoringResult(BaseModel):
    threat_level: str  # 'Low', 'Medium', 'High', 'Critical'
    confidence_score: float = Field(ge=0.0, le=100.0)
    explanation: str

class AISummaryResult(BaseModel):
    executive_summary: str
    threat_level: str
    confidence_score: float
    model_version: str

# ---------------------------------------------------------
# API Response Models
# ---------------------------------------------------------

class TaskStatusResponse(BaseModel):
    task_id: UUID
    status: str
    stage: str
    error_message: Optional[str]
    created_at: datetime
    updated_at: datetime

class AggregatedFindingsResponse(BaseModel):
    task_id: UUID
    case_id: UUID
    static_findings: Optional[StaticAnalysisResult]
    dynamic_findings: Optional[NormalizedBehavior]
    reverse_engineering: Optional[ReverseEngineeringResult]
    ai_summary: Optional[AISummaryResult]
    overall_score: Optional[ScoringResult]
