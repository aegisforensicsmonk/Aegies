-- ============================================================
-- CIIP - Cyber Investigation Intelligence Platform
-- PostgreSQL Database Schema
-- Version: 2.1.0
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ROLES & USERS
-- ============================================================

CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name     VARCHAR(255) NOT NULL,
    department    VARCHAR(255),
    badge_number  VARCHAR(50) UNIQUE,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_login    TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_badge ON users(badge_number);

-- ============================================================
-- CASES
-- ============================================================

CREATE TYPE case_status AS ENUM ('open', 'in_progress', 'closed', 'archived');
CREATE TYPE case_severity AS ENUM ('critical', 'high', 'medium', 'low');

CREATE TABLE cases (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number       VARCHAR(50) NOT NULL UNIQUE,
    title             VARCHAR(500) NOT NULL,
    description       TEXT,
    status            case_status NOT NULL DEFAULT 'open',
    severity          case_severity NOT NULL DEFAULT 'medium',
    case_type         VARCHAR(100) NOT NULL,
    lead_investigator UUID REFERENCES users(id),
    tags              TEXT[] DEFAULT '{}',
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    closed_at         TIMESTAMPTZ
);

CREATE TABLE case_assignments (
    case_id     UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(50) NOT NULL DEFAULT 'analyst',
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (case_id, user_id)
);

CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_severity ON cases(severity);
CREATE INDEX idx_cases_number ON cases(case_number);
CREATE INDEX idx_cases_lead ON cases(lead_investigator);
CREATE INDEX idx_cases_created ON cases(created_at DESC);

-- ============================================================
-- EVIDENCE
-- ============================================================

CREATE TYPE evidence_status AS ENUM ('uploaded', 'processing', 'verified', 'flagged', 'archived');
CREATE TYPE evidence_type AS ENUM ('document', 'image', 'disk_image', 'memory_dump', 'network_capture', 'log_file', 'email', 'malware_sample', 'mobile_data', 'other');

CREATE TABLE evidence_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_number VARCHAR(50) NOT NULL UNIQUE,
    case_id         UUID NOT NULL REFERENCES cases(id),
    file_name       VARCHAR(500) NOT NULL,
    file_size       BIGINT NOT NULL,
    file_type       VARCHAR(255),
    evidence_type   evidence_type NOT NULL DEFAULT 'other',
    sha256_hash     VARCHAR(64) NOT NULL,
    md5_hash        VARCHAR(32),
    sha1_hash       VARCHAR(40),
    source          VARCHAR(500),
    handler_id      UUID REFERENCES users(id),
    status          evidence_status NOT NULL DEFAULT 'uploaded',
    description     TEXT,
    storage_path    VARCHAR(1000),
    metadata        JSONB DEFAULT '{}',
    tags            TEXT[] DEFAULT '{}',
    hash_verified   BOOLEAN DEFAULT FALSE,
    is_deleted      BOOLEAN DEFAULT FALSE,  -- Soft delete, never physically remove
    upload_date     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    verified_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_case ON evidence_items(case_id);
CREATE INDEX idx_evidence_hash ON evidence_items(sha256_hash);
CREATE INDEX idx_evidence_status ON evidence_items(status);
CREATE INDEX idx_evidence_number ON evidence_items(evidence_number);

-- ============================================================
-- CHAIN OF CUSTODY
-- ============================================================

CREATE TABLE chain_of_custody (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_id     UUID NOT NULL REFERENCES evidence_items(id),
    action          VARCHAR(100) NOT NULL,
    handler_id      UUID REFERENCES users(id),
    handler_name    VARCHAR(255) NOT NULL,
    from_location   VARCHAR(500),
    to_location     VARCHAR(500),
    notes           TEXT,
    digital_signature VARCHAR(255),
    timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_custody_evidence ON chain_of_custody(evidence_id);
CREATE INDEX idx_custody_timestamp ON chain_of_custody(timestamp DESC);

-- ============================================================
-- TIMELINE EVENTS
-- ============================================================

CREATE TYPE timeline_event_type AS ENUM (
    'evidence_added', 'entity_discovered', 'analysis_complete',
    'ioc_matched', 'note_added', 'status_change', 'report_generated', 'custom'
);

CREATE TABLE timeline_events (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id     UUID NOT NULL REFERENCES cases(id),
    event_type  timeline_event_type NOT NULL,
    title       VARCHAR(500) NOT NULL,
    description TEXT,
    actor_id    UUID REFERENCES users(id),
    actor_name  VARCHAR(255),
    severity    case_severity,
    metadata    JSONB DEFAULT '{}',
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_timeline_case ON timeline_events(case_id);
CREATE INDEX idx_timeline_type ON timeline_events(event_type);
CREATE INDEX idx_timeline_timestamp ON timeline_events(timestamp DESC);

-- ============================================================
-- ENTITIES & RELATIONSHIPS
-- ============================================================

CREATE TYPE entity_type AS ENUM (
    'person', 'ip_address', 'domain', 'email', 'phone',
    'username', 'organization', 'file_hash', 'url', 'cryptocurrency'
);

CREATE TABLE entities (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id     UUID NOT NULL REFERENCES cases(id),
    entity_type entity_type NOT NULL,
    value       VARCHAR(1000) NOT NULL,
    label       VARCHAR(500),
    risk_score  INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    first_seen  TIMESTAMPTZ,
    last_seen   TIMESTAMPTZ,
    metadata    JSONB DEFAULT '{}',
    tags        TEXT[] DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE entity_relationships (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_entity_id  UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    target_entity_id  UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL,
    weight            FLOAT DEFAULT 1.0,
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_entities_case ON entities(case_id);
CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_value ON entities(value);
CREATE INDEX idx_entity_rel_source ON entity_relationships(source_entity_id);
CREATE INDEX idx_entity_rel_target ON entity_relationships(target_entity_id);

-- ============================================================
-- IOCs (Indicators of Compromise)
-- ============================================================

CREATE TYPE ioc_type AS ENUM (
    'ip', 'domain', 'hash_md5', 'hash_sha256', 'hash_sha1',
    'url', 'email', 'file_name', 'registry_key', 'mutex'
);

CREATE TABLE iocs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id     UUID REFERENCES cases(id),
    ioc_type    ioc_type NOT NULL,
    value       VARCHAR(1000) NOT NULL,
    source      VARCHAR(500),
    threat_level case_severity NOT NULL DEFAULT 'medium',
    description TEXT,
    tags        TEXT[] DEFAULT '{}',
    matched     BOOLEAN DEFAULT FALSE,
    first_seen  TIMESTAMPTZ,
    last_seen   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_iocs_case ON iocs(case_id);
CREATE INDEX idx_iocs_type ON iocs(ioc_type);
CREATE INDEX idx_iocs_value ON iocs(value);
CREATE INDEX idx_iocs_threat ON iocs(threat_level);

-- ============================================================
-- IPDR RECORDS
-- ============================================================

CREATE TABLE ipdr_records (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id            UUID NOT NULL REFERENCES cases(id),
    source_number      VARCHAR(50) NOT NULL,
    destination_number VARCHAR(50) NOT NULL,
    call_type          VARCHAR(20) NOT NULL,  -- voice, sms, data
    start_time         TIMESTAMPTZ NOT NULL,
    end_time           TIMESTAMPTZ,
    duration_seconds   INTEGER DEFAULT 0,
    cell_id            VARCHAR(100),
    cell_location      VARCHAR(500),
    imei               VARCHAR(20),
    imsi               VARCHAR(20),
    latitude           DOUBLE PRECISION,
    longitude          DOUBLE PRECISION,
    metadata           JSONB DEFAULT '{}',
    imported_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ipdr_case ON ipdr_records(case_id);
CREATE INDEX idx_ipdr_source ON ipdr_records(source_number);
CREATE INDEX idx_ipdr_dest ON ipdr_records(destination_number);
CREATE INDEX idx_ipdr_time ON ipdr_records(start_time);

-- ============================================================
-- OSINT RESULTS
-- ============================================================

CREATE TABLE osint_results (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id     UUID REFERENCES cases(id),
    query       VARCHAR(1000) NOT NULL,
    query_type  entity_type NOT NULL,
    source      VARCHAR(255) NOT NULL,
    confidence  FLOAT DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
    data        JSONB NOT NULL DEFAULT '{}',
    tags        TEXT[] DEFAULT '{}',
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_osint_case ON osint_results(case_id);
CREATE INDEX idx_osint_query ON osint_results(query);

-- ============================================================
-- RANSOMWARE FINDINGS
-- ============================================================

CREATE TABLE ransomware_findings (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id             UUID NOT NULL REFERENCES cases(id),
    family_name         VARCHAR(255) NOT NULL,
    variant             VARCHAR(100),
    encryption_type     VARCHAR(255),
    ransom_amount       VARCHAR(255),
    bitcoin_address     VARCHAR(255),
    kill_chain_stage    VARCHAR(100),
    decryptor_available BOOLEAN DEFAULT FALSE,
    notes               TEXT,
    ioc_ids             UUID[] DEFAULT '{}',
    first_seen          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ransomware_case ON ransomware_findings(case_id);
CREATE INDEX idx_ransomware_family ON ransomware_findings(family_name);

-- ============================================================
-- AI REPORTS
-- ============================================================

CREATE TYPE ai_report_type AS ENUM ('summary', 'investigation_report', 'next_steps', 'missing_artifacts', 'supervisor_brief');
CREATE TYPE ai_report_status AS ENUM ('draft', 'reviewed', 'approved');

CREATE TABLE ai_reports (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id     UUID NOT NULL REFERENCES cases(id),
    report_type ai_report_type NOT NULL,
    content     TEXT NOT NULL,
    confidence  FLOAT DEFAULT 0.0 CHECK (confidence >= 0 AND confidence <= 1),
    model       VARCHAR(100),
    status      ai_report_status NOT NULL DEFAULT 'draft',
    reviewed_by UUID REFERENCES users(id),
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_reports_case ON ai_reports(case_id);
CREATE INDEX idx_ai_reports_type ON ai_reports(report_type);

-- ============================================================
-- AUDIT LOGS (Immutable)
-- ============================================================

CREATE TABLE audit_logs (
    id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id       UUID REFERENCES users(id),
    user_name     VARCHAR(255) NOT NULL,
    action        VARCHAR(50) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id   VARCHAR(255),
    details       TEXT,
    ip_address    INET,
    user_agent    TEXT,
    timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Make audit_logs append-only (no updates or deletes)
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Audit logs are immutable. Updates and deletes are not permitted.';
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_immutable_update
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER audit_immutable_delete
    BEFORE DELETE ON audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION prevent_audit_modification();

CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp DESC);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Auto-generate case numbers
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SPLIT_PART(case_number, '-', 3) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM cases
    WHERE case_number LIKE 'CIIP-' || EXTRACT(YEAR FROM NOW())::TEXT || '-%';

    NEW.case_number := 'CIIP-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_case_number
    BEFORE INSERT ON cases
    FOR EACH ROW
    WHEN (NEW.case_number IS NULL)
    EXECUTE FUNCTION generate_case_number();

-- Auto-generate evidence numbers
CREATE OR REPLACE FUNCTION generate_evidence_number()
RETURNS TRIGGER AS $$
DECLARE
    seq_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SPLIT_PART(evidence_number, '-', 3) AS INTEGER)), 0) + 1
    INTO seq_num
    FROM evidence_items
    WHERE evidence_number LIKE 'EV-' || EXTRACT(YEAR FROM NOW())::TEXT || '-%';

    NEW.evidence_number := 'EV-' || EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(seq_num::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_evidence_number
    BEFORE INSERT ON evidence_items
    FOR EACH ROW
    WHEN (NEW.evidence_number IS NULL)
    EXECUTE FUNCTION generate_evidence_number();

-- Auto-update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cases_timestamp BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_evidence_timestamp BEFORE UPDATE ON evidence_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_entities_timestamp BEFORE UPDATE ON entities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_iocs_timestamp BEFORE UPDATE ON iocs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_ransomware_timestamp BEFORE UPDATE ON ransomware_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_roles_timestamp BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
