-- ============================================================
-- CIIP - Ransomware Lab Migration
-- Adds tables for full static/dynamic analysis pipeline
-- ============================================================

CREATE TABLE analysis_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    sample_id UUID, -- References evidence_items(id)
    celery_task_id VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    stage VARCHAR(100) DEFAULT 'INITIALIZATION',
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sample_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES analysis_tasks(id) ON DELETE CASCADE,
    file_name VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(255),
    sha256 VARCHAR(64) NOT NULL,
    sha1 VARCHAR(40),
    md5 VARCHAR(32),
    storage_path VARCHAR(1000) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE static_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES analysis_tasks(id) ON DELETE CASCADE,
    entropy FLOAT,
    is_packed BOOLEAN DEFAULT FALSE,
    compiler VARCHAR(255),
    yara_matches JSONB DEFAULT '[]',
    suspicious_imports JSONB DEFAULT '[]',
    extracted_strings JSONB DEFAULT '[]',
    pe_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dynamic_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES analysis_tasks(id) ON DELETE CASCADE,
    sandbox_report_id VARCHAR(255),
    behavior_flags JSONB DEFAULT '[]',
    process_tree JSONB DEFAULT '[]',
    network_activity JSONB DEFAULT '[]',
    file_drops JSONB DEFAULT '[]',
    registry_changes JSONB DEFAULT '[]',
    mutexes JSONB DEFAULT '[]',
    mass_encryption_detected BOOLEAN DEFAULT FALSE,
    shadow_copy_deletion_detected BOOLEAN DEFAULT FALSE,
    ransom_note_detected BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reverse_engineering_artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES analysis_tasks(id) ON DELETE CASCADE,
    ghidra_project_path VARCHAR(1000),
    extracted_functions JSONB DEFAULT '[]',
    decompiled_snippets JSONB DEFAULT '{}',
    identified_crypto_constants JSONB DEFAULT '[]',
    config_blocks JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES analysis_tasks(id) ON DELETE CASCADE,
    case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
    executive_summary TEXT NOT NULL,
    threat_level VARCHAR(50) NOT NULL,
    confidence_score FLOAT NOT NULL,
    model_version VARCHAR(100),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ioc_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ioc_id UUID NOT NULL REFERENCES iocs(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES analysis_tasks(id) ON DELETE CASCADE,
    source_stage VARCHAR(100) NOT NULL, -- 'STATIC', 'DYNAMIC', 'RE'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER update_analysis_tasks_timestamp BEFORE UPDATE ON analysis_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update existing ransomware_findings to link to analysis_tasks
ALTER TABLE ransomware_findings ADD COLUMN analysis_task_id UUID REFERENCES analysis_tasks(id);
ALTER TABLE ransomware_findings ADD COLUMN confidence_score FLOAT DEFAULT 0.0;
