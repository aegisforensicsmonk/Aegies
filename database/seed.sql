-- ============================================================
-- CIIP - Seed Data
-- Realistic sample data for development and demonstration
-- ============================================================

-- ==================== Roles ====================

INSERT INTO roles (id, name, description, permissions) VALUES
    ('r-admin', 'admin', 'Full platform access', '["user_management", "system_config", "all_cases", "audit_logs", "delete_evidence", "role_management"]'),
    ('r-investigator', 'investigator', 'Lead investigations', '["create_cases", "manage_cases", "upload_evidence", "generate_reports", "ai_summarization", "osint_lookup", "ipdr_analysis"]'),
    ('r-analyst', 'analyst', 'Analysis and intelligence', '["view_assigned_cases", "upload_evidence", "osint_lookup", "ioc_matching", "generate_reports", "timeline_management"]'),
    ('r-supervisor', 'supervisor', 'Oversight and review', '["view_all_cases", "review_reports", "approve_ai_reports", "view_audit_logs", "dashboard_access", "export_reports"]');

-- ==================== Users ====================
-- Passwords: "CiipSecure2026!" (hashed with bcrypt)

INSERT INTO users (id, email, password_hash, full_name, department, badge_number, is_active, last_login) VALUES
    ('usr-001', 'sarah.chen@ciip.gov', '$2b$12$LJ3Xk7n1G2Z8R4v5W6x9OuY0z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5', 'Sarah Chen', 'Cyber Crime Division', 'CCD-1001', TRUE, '2026-07-16T14:30:00Z'),
    ('usr-002', 'marcus.wright@ciip.gov', '$2b$12$LJ3Xk7n1G2Z8R4v5W6x9OuY0z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5', 'Marcus Wright', 'Digital Forensics Lab', 'DFL-2045', TRUE, '2026-07-16T13:15:00Z'),
    ('usr-003', 'aisha.patel@ciip.gov', '$2b$12$LJ3Xk7n1G2Z8R4v5W6x9OuY0z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5', 'Aisha Patel', 'Threat Intelligence', 'TI-3012', TRUE, '2026-07-16T12:00:00Z'),
    ('usr-004', 'james.holloway@ciip.gov', '$2b$12$LJ3Xk7n1G2Z8R4v5W6x9OuY0z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5', 'James Holloway', 'Cyber Crime Division', 'CCD-0500', TRUE, '2026-07-16T11:45:00Z');

INSERT INTO user_roles (user_id, role_id) VALUES
    ('usr-001', 'r-admin'),
    ('usr-002', 'r-investigator'),
    ('usr-003', 'r-analyst'),
    ('usr-004', 'r-supervisor');

-- ==================== Cases ====================

INSERT INTO cases (id, case_number, title, description, status, severity, case_type, lead_investigator, tags) VALUES
    ('case-001', 'CIIP-2026-0147', 'Operation Dark Circuit - Corporate Espionage Investigation',
     'Investigation into sophisticated corporate espionage targeting defense contractor Meridian Systems. Advanced persistent threat (APT) group suspected of exfiltrating classified R&D data over 18-month period via compromised supply chain vendors.',
     'in_progress', 'critical', 'espionage', 'usr-002', ARRAY['APT', 'supply-chain', 'data-exfiltration', 'defense']),

    ('case-002', 'CIIP-2026-0163', 'BlackCat Ransomware - Municipal Hospital Network',
     'Critical ransomware incident affecting St. Helena Medical Center network. ALPHV/BlackCat ransomware variant deployed via compromised RDP. Patient records encrypted, surgical systems offline. Ransom demand: 4.5 BTC.',
     'in_progress', 'critical', 'ransomware', 'usr-002', ARRAY['ransomware', 'healthcare', 'BlackCat', 'ALPHV', 'critical-infrastructure']),

    ('case-003', 'CIIP-2026-0155', 'Financial Wire Fraud - Nexus Banking Platform',
     'Multi-million dollar wire fraud scheme exploiting vulnerabilities in Nexus Banking API.',
     'open', 'high', 'fraud', 'usr-002', ARRAY['fraud', 'BEC', 'wire-transfer', 'financial']),

    ('case-004', 'CIIP-2026-0171', 'Insider Threat - CloudServe Data Exfiltration',
     'Former senior engineer at CloudServe Inc. suspected of exfiltrating proprietary source code and customer data.',
     'open', 'high', 'insider_threat', 'usr-003', ARRAY['insider', 'data-theft', 'source-code', 'cloud']),

    ('case-005', 'CIIP-2026-0098', 'PhishNet Campaign - Government Agency Targeting',
     'Large-scale spear phishing campaign targeting government agency employees.',
     'closed', 'medium', 'phishing', 'usr-002', ARRAY['phishing', 'government', 'credential-harvest', 'RAT']);

-- ==================== Evidence Items ====================

INSERT INTO evidence_items (id, evidence_number, case_id, file_name, file_size, file_type, evidence_type, sha256_hash, md5_hash, source, handler_id, status, description, hash_verified) VALUES
    ('ev-001', 'EV-2026-0001', 'case-001', 'meridian_server_disk.E01', 524288000000, 'application/x-encase', 'disk_image',
     'a7f1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5061728394a5b6c7d8e9', 'e3b0c44298fc1c149afbf4c8996fb924',
     'Meridian Systems - Server Room B', 'usr-002', 'verified', 'Full disk image of compromised production server PRD-SRV-07', TRUE),

    ('ev-002', 'EV-2026-0002', 'case-001', 'network_capture_may2026.pcapng', 2147483648, 'application/vnd.tcpdump.pcap', 'network_capture',
     'b8f2c3d4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2', 'f4a1b2c3d4e5f60718293a4b5c6d7e8f',
     'Network TAP - DMZ Segment', 'usr-003', 'verified', 'Network traffic capture from DMZ segment', TRUE),

    ('ev-003', 'EV-2026-0003', 'case-002', 'ransom_note.txt', 4096, 'text/plain', 'document',
     'c9a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3', 'a5b2c3d4e5f60718293a4b5c6d7e8f90',
     'Infected Workstation - WS-MED-042', 'usr-002', 'verified', 'Ransomware note dropped on encrypted systems', TRUE),

    ('ev-004', 'EV-2026-0004', 'case-002', 'blackcat_payload.dll.quarantine', 348160, 'application/x-msdownload', 'malware_sample',
     'd0b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', 'b6c3d4e5f60718293a4b5c6d7e8f9012',
     'AV Quarantine - WS-MED-042', 'usr-002', 'flagged', 'ALPHV/BlackCat ransomware payload', TRUE);

-- ==================== Chain of Custody ====================

INSERT INTO chain_of_custody (evidence_id, action, handler_id, handler_name, from_location, to_location, notes, digital_signature) VALUES
    ('ev-001', 'Acquired', 'usr-002', 'Marcus Wright', 'Meridian Server Room B', 'CIIP Forensics Lab', 'Disk imaged using FTK Imager with write blocker', 'SIG-MW-20260514'),
    ('ev-001', 'Transferred', 'usr-002', 'Marcus Wright', 'CIIP Forensics Lab', 'Evidence Vault - Locker 14B', 'Original media sealed and stored', 'SIG-MW-20260514B'),
    ('ev-001', 'Accessed', 'usr-003', 'Aisha Patel', 'Evidence Vault', 'Analysis Workstation WS-04', 'Working copy created for analysis', 'SIG-AP-20260516'),
    ('ev-003', 'Acquired', 'usr-002', 'Marcus Wright', 'WS-MED-042', 'CIIP Forensics Lab', 'Ransomware note extracted from infected system', 'SIG-MW-20260628');

-- ==================== Entities ====================

INSERT INTO entities (id, case_id, entity_type, value, label, risk_score, first_seen, last_seen, metadata, tags) VALUES
    ('ent-001', 'case-001', 'ip_address', '185.220.101.42', 'C2 Server IP', 95, '2026-04-10', '2026-05-12', '{"country": "Russia", "asn": "AS57523"}', ARRAY['C2', 'APT']),
    ('ent-002', 'case-001', 'domain', 'update-service.meridian-cdn.com', 'Spoofed Update Domain', 92, '2026-03-15', '2026-05-12', '{"registrar": "NameCheap"}', ARRAY['spoofed', 'C2']),
    ('ent-003', 'case-001', 'email', 'admin@meridian-cdn.com', 'Attacker Email', 88, '2026-03-01', '2026-05-10', '{"provider": "ProtonMail"}', ARRAY['attacker']),
    ('ent-004', 'case-001', 'person', 'Viktor Petrov', 'Suspected Operator', 75, '2026-04-20', '2026-05-12', '{"alias": "darkCircuit_v"}', ARRAY['suspect', 'APT']),
    ('ent-005', 'case-002', 'ip_address', '103.235.46.18', 'RDP Brute Force Source', 90, '2026-06-25', '2026-06-28', '{"country": "China"}', ARRAY['brute-force', 'RDP']);

-- ==================== Entity Relationships ====================

INSERT INTO entity_relationships (source_entity_id, target_entity_id, relationship_type, weight) VALUES
    ('ent-001', 'ent-002', 'resolves_to', 0.95),
    ('ent-002', 'ent-003', 'registered_by', 0.90),
    ('ent-003', 'ent-004', 'associated_with', 0.70),
    ('ent-001', 'ent-001', 'communicates_with', 0.85);

-- ==================== IOCs ====================

INSERT INTO iocs (case_id, ioc_type, value, source, threat_level, description, tags, matched) VALUES
    ('case-001', 'ip', '185.220.101.42', 'Network Analysis', 'critical', 'Primary C2 server', ARRAY['C2'], TRUE),
    ('case-001', 'domain', 'update-service.meridian-cdn.com', 'DNS Analysis', 'critical', 'Spoofed update domain', ARRAY['C2', 'DGA'], TRUE),
    ('case-002', 'hash_sha256', 'd0b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', 'AV Quarantine', 'critical', 'BlackCat ransomware payload', ARRAY['ransomware'], TRUE),
    ('case-002', 'ip', '103.235.46.18', 'RDP Logs', 'high', 'RDP brute force origin', ARRAY['brute-force'], TRUE),
    ('case-003', 'email', 'cfo@nexus-bank.com.co', 'Email Headers', 'high', 'Spoofed CFO email address', ARRAY['BEC'], TRUE);

-- ==================== Audit Logs ====================

INSERT INTO audit_logs (user_id, user_name, action, resource_type, resource_id, details, ip_address) VALUES
    ('usr-001', 'Sarah Chen', 'CREATE', 'case', 'case-001', 'Created case CIIP-2026-0147: Operation Dark Circuit', '10.0.1.15'),
    ('usr-002', 'Marcus Wright', 'UPLOAD', 'evidence', 'ev-001', 'Uploaded disk image: meridian_server_disk.E01 (512 GB)', '10.0.1.22'),
    ('usr-003', 'Aisha Patel', 'UPLOAD', 'evidence', 'ev-002', 'Uploaded network capture: network_capture_may2026.pcapng', '10.0.1.30'),
    ('usr-001', 'Sarah Chen', 'CREATE', 'case', 'case-002', 'Created emergency case CIIP-2026-0163: BlackCat Ransomware', '10.0.1.15'),
    ('usr-002', 'Marcus Wright', 'UPLOAD', 'evidence', 'ev-003', 'Uploaded ransom note: ransom_note.txt', '10.0.1.22'),
    ('usr-002', 'Marcus Wright', 'GENERATE', 'ai_report', 'case-001', 'Generated AI case summary for Operation Dark Circuit', '10.0.1.22');
