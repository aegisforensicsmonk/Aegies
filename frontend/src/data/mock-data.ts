import { User, Case, EvidenceItem, TimelineEvent, Entity, EntityRelationship, IOC, IPDRRecord, OSINTResult, RansomwareFinding, AIReport, AuditLogEntry, ChainOfCustody, Notification, DashboardStats } from '@/types';

// ==================== Users ====================

export const mockUsers: User[] = [
  {
    id: 'usr-001',
    email: 'sarah.chen@ciip.gov',
    full_name: 'Sarah Chen',
    role: 'admin',
    department: 'Cyber Crime Division',
    badge_number: 'CCD-1001',
    is_active: true,
    last_login: '2026-07-16T14:30:00Z',
    created_at: '2024-01-15T08:00:00Z',
  },
  {
    id: 'usr-002',
    email: 'marcus.wright@ciip.gov',
    full_name: 'Marcus Wright',
    role: 'investigator',
    department: 'Digital Forensics Lab',
    badge_number: 'DFL-2045',
    is_active: true,
    last_login: '2026-07-16T13:15:00Z',
    created_at: '2024-03-20T08:00:00Z',
  },
  {
    id: 'usr-003',
    email: 'aisha.patel@ciip.gov',
    full_name: 'Aisha Patel',
    role: 'analyst',
    department: 'Threat Intelligence',
    badge_number: 'TI-3012',
    is_active: true,
    last_login: '2026-07-16T12:00:00Z',
    created_at: '2024-06-01T08:00:00Z',
  },
  {
    id: 'usr-004',
    email: 'james.holloway@ciip.gov',
    full_name: 'James Holloway',
    role: 'supervisor',
    department: 'Cyber Crime Division',
    badge_number: 'CCD-0500',
    is_active: true,
    last_login: '2026-07-16T11:45:00Z',
    created_at: '2023-09-10T08:00:00Z',
  },
];

export const currentUser: User = mockUsers[1]; // Marcus Wright - Investigator

// ==================== Cases ====================

export const mockCases: Case[] = [
  {
    id: 'case-001',
    case_number: 'CIIP-2026-0147',
    title: 'Operation Dark Circuit - Corporate Espionage Investigation',
    description: 'Investigation into sophisticated corporate espionage targeting defense contractor Meridian Systems. Advanced persistent threat (APT) group suspected of exfiltrating classified R&D data over 18-month period via compromised supply chain vendors.',
    status: 'in_progress',
    severity: 'critical',
    case_type: 'espionage',
    lead_investigator: mockUsers[1],
    assigned_analysts: [mockUsers[2], mockUsers[1]],
    created_at: '2026-05-12T08:30:00Z',
    updated_at: '2026-07-16T10:00:00Z',
    evidence_count: 47,
    entity_count: 128,
    ioc_count: 89,
    tags: ['APT', 'supply-chain', 'data-exfiltration', 'defense'],
  },
  {
    id: 'case-002',
    case_number: 'CIIP-2026-0163',
    title: 'BlackCat Ransomware - Municipal Hospital Network',
    description: 'Critical ransomware incident affecting St. Helena Medical Center network. ALPHV/BlackCat ransomware variant deployed via compromised RDP. Patient records encrypted, surgical systems offline. Ransom demand: 4.5 BTC.',
    status: 'in_progress',
    severity: 'critical',
    case_type: 'ransomware',
    lead_investigator: mockUsers[1],
    assigned_analysts: [mockUsers[2]],
    created_at: '2026-06-28T03:15:00Z',
    updated_at: '2026-07-15T16:30:00Z',
    evidence_count: 32,
    entity_count: 54,
    ioc_count: 67,
    tags: ['ransomware', 'healthcare', 'BlackCat', 'ALPHV', 'critical-infrastructure'],
  },
  {
    id: 'case-003',
    case_number: 'CIIP-2026-0155',
    title: 'Financial Wire Fraud - Nexus Banking Platform',
    description: 'Multi-million dollar wire fraud scheme exploiting vulnerabilities in Nexus Banking API. Threat actors used business email compromise (BEC) to authorize fraudulent wire transfers totaling $3.2M across 14 transactions.',
    status: 'open',
    severity: 'high',
    case_type: 'fraud',
    lead_investigator: mockUsers[1],
    assigned_analysts: [mockUsers[2]],
    created_at: '2026-06-05T11:00:00Z',
    updated_at: '2026-07-14T09:00:00Z',
    evidence_count: 23,
    entity_count: 42,
    ioc_count: 31,
    tags: ['fraud', 'BEC', 'wire-transfer', 'financial'],
  },
  {
    id: 'case-004',
    case_number: 'CIIP-2026-0171',
    title: 'Insider Threat - CloudServe Data Exfiltration',
    description: 'Former senior engineer at CloudServe Inc. suspected of exfiltrating proprietary source code and customer data before resignation. USB device usage and abnormal cloud storage access patterns detected.',
    status: 'open',
    severity: 'high',
    case_type: 'insider_threat',
    lead_investigator: mockUsers[2],
    assigned_analysts: [mockUsers[1]],
    created_at: '2026-07-02T14:00:00Z',
    updated_at: '2026-07-16T08:00:00Z',
    evidence_count: 15,
    entity_count: 28,
    ioc_count: 12,
    tags: ['insider', 'data-theft', 'source-code', 'cloud'],
  },
  {
    id: 'case-005',
    case_number: 'CIIP-2026-0098',
    title: 'PhishNet Campaign - Government Agency Targeting',
    description: 'Large-scale spear phishing campaign targeting government agency employees. Sophisticated lure documents impersonating HR department. Credential harvesting and RAT deployment confirmed on 12 workstations.',
    status: 'closed',
    severity: 'medium',
    case_type: 'phishing',
    lead_investigator: mockUsers[1],
    assigned_analysts: [mockUsers[2]],
    created_at: '2026-03-15T09:00:00Z',
    updated_at: '2026-06-20T17:00:00Z',
    closed_at: '2026-06-20T17:00:00Z',
    evidence_count: 38,
    entity_count: 67,
    ioc_count: 45,
    tags: ['phishing', 'government', 'credential-harvest', 'RAT'],
  },
  {
    id: 'case-006',
    case_number: 'CIIP-2026-0180',
    title: 'DDoS Attack - E-Commerce Platform Disruption',
    description: 'Sustained distributed denial-of-service attack against ShopMax e-commerce platform during peak sale event. Volumetric attack peaking at 2.3 Tbps using IoT botnet. Significant financial losses estimated at $850K.',
    status: 'in_progress',
    severity: 'medium',
    case_type: 'cyber_crime',
    lead_investigator: mockUsers[2],
    assigned_analysts: [mockUsers[1]],
    created_at: '2026-07-10T06:00:00Z',
    updated_at: '2026-07-16T12:00:00Z',
    evidence_count: 8,
    entity_count: 19,
    ioc_count: 34,
    tags: ['DDoS', 'botnet', 'IoT', 'e-commerce'],
  },
];

// ==================== Evidence ====================

export const mockEvidence: EvidenceItem[] = [
  {
    id: 'ev-001', evidence_number: 'EV-2026-0001', case_id: 'case-001',
    file_name: 'meridian_server_disk.E01', file_size: 524288000000, file_type: 'application/x-encase',
    evidence_type: 'disk_image', sha256_hash: 'a7f1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5061728394a5b6c7d8e9',
    md5_hash: 'e3b0c44298fc1c149afbf4c8996fb924', source: 'Meridian Systems - Server Room B',
    handler: 'Marcus Wright', status: 'verified', description: 'Full disk image of compromised production server PRD-SRV-07',
    upload_date: '2026-05-14T10:00:00Z', metadata: { 'Acquisition Tool': 'FTK Imager 4.7', 'Block Size': '512 bytes' },
    hash_verified: true, tags: ['disk-image', 'server', 'production'],
  },
  {
    id: 'ev-002', evidence_number: 'EV-2026-0002', case_id: 'case-001',
    file_name: 'network_capture_may2026.pcapng', file_size: 2147483648, file_type: 'application/vnd.tcpdump.pcap',
    evidence_type: 'network_capture', sha256_hash: 'b8f2c3d4e5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
    md5_hash: 'f4a1b2c3d4e5f60718293a4b5c6d7e8f', source: 'Network TAP - DMZ Segment',
    handler: 'Aisha Patel', status: 'verified', description: 'Network traffic capture from DMZ segment during suspected exfiltration window',
    upload_date: '2026-05-15T14:30:00Z', metadata: { 'Capture Duration': '72 hours', 'Interface': 'eth0' },
    hash_verified: true, tags: ['pcap', 'network', 'DMZ'],
  },
  {
    id: 'ev-003', evidence_number: 'EV-2026-0003', case_id: 'case-002',
    file_name: 'ransom_note.txt', file_size: 4096, file_type: 'text/plain',
    evidence_type: 'document', sha256_hash: 'c9a3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    md5_hash: 'a5b2c3d4e5f60718293a4b5c6d7e8f90', source: 'Infected Workstation - WS-MED-042',
    handler: 'Marcus Wright', status: 'verified', description: 'Ransomware note dropped on encrypted systems',
    upload_date: '2026-06-28T06:00:00Z', metadata: { 'Encoding': 'UTF-8', 'BTC Address': 'bc1q9h5yjqr...' },
    hash_verified: true, tags: ['ransomware', 'ransom-note', 'BlackCat'],
  },
  {
    id: 'ev-004', evidence_number: 'EV-2026-0004', case_id: 'case-002',
    file_name: 'blackcat_payload.dll.quarantine', file_size: 348160, file_type: 'application/x-msdownload',
    evidence_type: 'malware_sample', sha256_hash: 'd0b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    md5_hash: 'b6c3d4e5f60718293a4b5c6d7e8f9012', source: 'AV Quarantine - WS-MED-042',
    handler: 'Marcus Wright', status: 'flagged', description: 'ALPHV/BlackCat ransomware payload extracted from quarantine',
    upload_date: '2026-06-28T08:30:00Z', metadata: { 'AV Detection': 'Ransom.Win64.BlackCat', 'PE Compile Time': '2026-06-25T12:00:00Z' },
    hash_verified: true, tags: ['malware', 'ransomware', 'BlackCat', 'payload'],
  },
  {
    id: 'ev-005', evidence_number: 'EV-2026-0005', case_id: 'case-003',
    file_name: 'email_headers_export.eml', file_size: 65536, file_type: 'message/rfc822',
    evidence_type: 'email', sha256_hash: 'e1c5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    md5_hash: 'c7d4e5f60718293a4b5c6d7e8f901234', source: 'Exchange Server - mail.nexusbank.com',
    handler: 'Aisha Patel', status: 'verified', description: 'BEC email headers with spoofed CFO authorization',
    upload_date: '2026-06-07T09:00:00Z', metadata: { 'Sender IP': '185.220.101.42', 'SPF': 'fail' },
    hash_verified: true, tags: ['email', 'BEC', 'spoofed'],
  },
  {
    id: 'ev-006', evidence_number: 'EV-2026-0006', case_id: 'case-001',
    file_name: 'memory_dump_PRD-SRV-07.raw', file_size: 17179869184, file_type: 'application/octet-stream',
    evidence_type: 'memory_dump', sha256_hash: 'f2d6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
    md5_hash: 'd8e5f60718293a4b5c6d7e8f90123456', source: 'Meridian Systems - Server Room B',
    handler: 'Marcus Wright', status: 'processing', description: 'RAM dump from compromised server for volatility analysis',
    upload_date: '2026-05-14T11:30:00Z', metadata: { 'RAM Size': '16 GB', 'OS': 'Windows Server 2022' },
    hash_verified: true, tags: ['memory', 'volatility', 'server'],
  },
  {
    id: 'ev-007', evidence_number: 'EV-2026-0007', case_id: 'case-004',
    file_name: 'usb_activity_logs.csv', file_size: 2097152, file_type: 'text/csv',
    evidence_type: 'log_file', sha256_hash: 'a3e7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
    md5_hash: 'e9f60718293a4b5c6d7e8f9012345678', source: 'CloudServe DLP System',
    handler: 'Aisha Patel', status: 'verified', description: 'USB device connection and file transfer activity logs',
    upload_date: '2026-07-03T10:00:00Z', metadata: { 'Date Range': '2026-03-01 to 2026-07-01', 'Records': '1,247' },
    hash_verified: true, tags: ['USB', 'DLP', 'logs'],
  },
  {
    id: 'ev-008', evidence_number: 'EV-2026-0008', case_id: 'case-002',
    file_name: 'hospital_ad_logs.evtx', file_size: 104857600, file_type: 'application/x-evtx',
    evidence_type: 'log_file', sha256_hash: 'b4f8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8',
    md5_hash: 'f0a718293a4b5c6d7e8f901234567890', source: 'AD Domain Controller - DC-MED-01',
    handler: 'Marcus Wright', status: 'processing', description: 'Active Directory security event logs showing lateral movement',
    upload_date: '2026-06-29T07:00:00Z', metadata: { 'Event Count': '245,891', 'Period': '30 days' },
    hash_verified: true, tags: ['AD', 'event-logs', 'lateral-movement'],
  },
];

// ==================== Chain of Custody ====================

export const mockCustody: ChainOfCustody[] = [
  { id: 'coc-001', evidence_id: 'ev-001', action: 'Acquired', handler: 'Marcus Wright', from_location: 'Meridian Server Room B', to_location: 'CIIP Forensics Lab', timestamp: '2026-05-14T09:00:00Z', notes: 'Disk imaged using FTK Imager with write blocker', digital_signature: 'SIG-MW-20260514' },
  { id: 'coc-002', evidence_id: 'ev-001', action: 'Transferred', handler: 'Marcus Wright', from_location: 'CIIP Forensics Lab', to_location: 'Evidence Vault - Locker 14B', timestamp: '2026-05-14T11:00:00Z', notes: 'Original media sealed and stored', digital_signature: 'SIG-MW-20260514B' },
  { id: 'coc-003', evidence_id: 'ev-001', action: 'Accessed', handler: 'Aisha Patel', from_location: 'Evidence Vault', to_location: 'Analysis Workstation WS-04', timestamp: '2026-05-16T08:00:00Z', notes: 'Working copy created for analysis', digital_signature: 'SIG-AP-20260516' },
  { id: 'coc-004', evidence_id: 'ev-003', action: 'Acquired', handler: 'Marcus Wright', from_location: 'WS-MED-042', to_location: 'CIIP Forensics Lab', timestamp: '2026-06-28T05:30:00Z', notes: 'Ransomware note extracted from infected system', digital_signature: 'SIG-MW-20260628' },
  { id: 'coc-005', evidence_id: 'ev-004', action: 'Acquired', handler: 'Marcus Wright', from_location: 'AV Quarantine', to_location: 'Malware Analysis Sandbox', timestamp: '2026-06-28T08:00:00Z', notes: 'Malware sample extracted under controlled conditions', digital_signature: 'SIG-MW-20260628B' },
];

// ==================== Entities ====================

export const mockEntities: Entity[] = [
  { id: 'ent-001', case_id: 'case-001', entity_type: 'ip_address', value: '185.220.101.42', label: 'C2 Server IP', risk_score: 95, first_seen: '2026-04-10T00:00:00Z', last_seen: '2026-05-12T00:00:00Z', metadata: { country: 'Russia', asn: 'AS57523' }, tags: ['C2', 'APT'] },
  { id: 'ent-002', case_id: 'case-001', entity_type: 'domain', value: 'update-service.meridian-cdn.com', label: 'Spoofed Update Domain', risk_score: 92, first_seen: '2026-03-15T00:00:00Z', last_seen: '2026-05-12T00:00:00Z', metadata: { registrar: 'NameCheap', created: '2026-02-28' }, tags: ['spoofed', 'C2'] },
  { id: 'ent-003', case_id: 'case-001', entity_type: 'email', value: 'admin@meridian-cdn.com', label: 'Attacker Email', risk_score: 88, first_seen: '2026-03-01T00:00:00Z', last_seen: '2026-05-10T00:00:00Z', metadata: { provider: 'ProtonMail' }, tags: ['attacker'] },
  { id: 'ent-004', case_id: 'case-001', entity_type: 'person', value: 'Viktor Petrov', label: 'Suspected Operator', risk_score: 75, first_seen: '2026-04-20T00:00:00Z', last_seen: '2026-05-12T00:00:00Z', metadata: { alias: 'darkCircuit_v', nationality: 'Unknown' }, tags: ['suspect', 'APT'] },
  { id: 'ent-005', case_id: 'case-002', entity_type: 'ip_address', value: '103.235.46.18', label: 'RDP Brute Force Source', risk_score: 90, first_seen: '2026-06-25T00:00:00Z', last_seen: '2026-06-28T00:00:00Z', metadata: { country: 'China', asn: 'AS4808' }, tags: ['brute-force', 'RDP'] },
  { id: 'ent-006', case_id: 'case-002', entity_type: 'cryptocurrency', value: 'bc1q9h5yjqr3kfm4ld8v9xyz', label: 'Ransom BTC Address', risk_score: 98, first_seen: '2026-06-28T00:00:00Z', last_seen: '2026-06-28T00:00:00Z', metadata: { balance: '0 BTC', transactions: '0' }, tags: ['ransom', 'bitcoin'] },
  { id: 'ent-007', case_id: 'case-003', entity_type: 'email', value: 'cfo@nexus-bank.com.co', label: 'Spoofed CFO Email', risk_score: 85, first_seen: '2026-05-20T00:00:00Z', last_seen: '2026-06-04T00:00:00Z', metadata: { real_domain: 'nexusbank.com' }, tags: ['BEC', 'spoofed'] },
  { id: 'ent-008', case_id: 'case-004', entity_type: 'person', value: 'Daniel Reeves', label: 'Former Engineer (Suspect)', risk_score: 80, first_seen: '2026-03-01T00:00:00Z', last_seen: '2026-07-01T00:00:00Z', metadata: { employee_id: 'CS-4521', position: 'Sr. Engineer' }, tags: ['insider', 'suspect'] },
  { id: 'ent-009', case_id: 'case-001', entity_type: 'file_hash', value: 'a7f1b2c3d4e5f607...', label: 'Backdoor Binary Hash', risk_score: 96, first_seen: '2026-04-15T00:00:00Z', last_seen: '2026-05-12T00:00:00Z', metadata: { file_name: 'svchost_update.exe' }, tags: ['backdoor', 'malware'] },
  { id: 'ent-010', case_id: 'case-001', entity_type: 'ip_address', value: '45.77.65.211', label: 'Exfiltration Endpoint', risk_score: 87, first_seen: '2026-04-22T00:00:00Z', last_seen: '2026-05-11T00:00:00Z', metadata: { country: 'Netherlands', hosting: 'Vultr' }, tags: ['exfiltration'] },
];

export const mockRelationships: EntityRelationship[] = [
  { id: 'rel-001', source_entity_id: 'ent-001', target_entity_id: 'ent-002', relationship_type: 'resolves_to', weight: 0.95, metadata: {} },
  { id: 'rel-002', source_entity_id: 'ent-002', target_entity_id: 'ent-003', relationship_type: 'registered_by', weight: 0.90, metadata: {} },
  { id: 'rel-003', source_entity_id: 'ent-003', target_entity_id: 'ent-004', relationship_type: 'associated_with', weight: 0.70, metadata: {} },
  { id: 'rel-004', source_entity_id: 'ent-001', target_entity_id: 'ent-010', relationship_type: 'communicates_with', weight: 0.85, metadata: {} },
  { id: 'rel-005', source_entity_id: 'ent-009', target_entity_id: 'ent-001', relationship_type: 'connects_to', weight: 0.92, metadata: {} },
  { id: 'rel-006', source_entity_id: 'ent-004', target_entity_id: 'ent-010', relationship_type: 'operates', weight: 0.65, metadata: {} },
];

// ==================== Timeline Events ====================

export const mockTimeline: TimelineEvent[] = [
  { id: 'tl-001', case_id: 'case-001', event_type: 'status_change', title: 'Case Opened', description: 'Investigation initiated based on Meridian Systems security incident report', timestamp: '2026-05-12T08:30:00Z', actor: 'Sarah Chen', severity: 'critical', metadata: {} },
  { id: 'tl-002', case_id: 'case-001', event_type: 'evidence_added', title: 'Server Disk Image Acquired', description: 'Full disk image of PRD-SRV-07 acquired using FTK Imager with hardware write blocker', timestamp: '2026-05-14T10:00:00Z', actor: 'Marcus Wright', metadata: { evidence_id: 'ev-001' } },
  { id: 'tl-003', case_id: 'case-001', event_type: 'evidence_added', title: 'Network Capture Collected', description: 'PCAP from DMZ network tap spanning 72-hour window', timestamp: '2026-05-15T14:30:00Z', actor: 'Aisha Patel', metadata: { evidence_id: 'ev-002' } },
  { id: 'tl-004', case_id: 'case-001', event_type: 'entity_discovered', title: 'C2 Infrastructure Identified', description: 'Command and control server at 185.220.101.42 identified through network analysis', timestamp: '2026-05-18T09:15:00Z', actor: 'Aisha Patel', severity: 'critical', metadata: {} },
  { id: 'tl-005', case_id: 'case-001', event_type: 'ioc_matched', title: 'APT Indicators Matched', description: '12 IOCs matched known APT-41 indicators from threat intelligence feeds', timestamp: '2026-05-20T11:00:00Z', actor: 'Aisha Patel', severity: 'high', metadata: {} },
  { id: 'tl-006', case_id: 'case-001', event_type: 'analysis_complete', title: 'Memory Analysis Complete', description: 'Volatility analysis of RAM dump reveals injected DLL and credential harvesting tools', timestamp: '2026-05-22T16:00:00Z', actor: 'Marcus Wright', metadata: {} },
  { id: 'tl-007', case_id: 'case-002', event_type: 'status_change', title: 'Emergency Case Opened', description: 'Critical ransomware incident at St. Helena Medical Center', timestamp: '2026-06-28T03:15:00Z', actor: 'Sarah Chen', severity: 'critical', metadata: {} },
  { id: 'tl-008', case_id: 'case-002', event_type: 'evidence_added', title: 'Ransom Note Collected', description: 'Ransomware note extracted from infected workstation', timestamp: '2026-06-28T06:00:00Z', actor: 'Marcus Wright', metadata: { evidence_id: 'ev-003' } },
  { id: 'tl-009', case_id: 'case-002', event_type: 'ioc_matched', title: 'BlackCat Variant Confirmed', description: 'Payload confirmed as ALPHV/BlackCat ransomware variant v2.1', timestamp: '2026-06-28T10:00:00Z', actor: 'Aisha Patel', severity: 'critical', metadata: {} },
  { id: 'tl-010', case_id: 'case-003', event_type: 'note_added', title: 'Wire Transfer Pattern Identified', description: 'Pattern analysis shows 14 transactions between 2-4 AM, bypassing dual authorization controls', timestamp: '2026-06-10T14:00:00Z', actor: 'Aisha Patel', severity: 'high', metadata: {} },
  { id: 'tl-011', case_id: 'case-001', event_type: 'report_generated', title: 'Interim Report Generated', description: 'AI-assisted interim investigation report generated for supervisor review', timestamp: '2026-06-15T09:00:00Z', actor: 'Marcus Wright', metadata: {} },
  { id: 'tl-012', case_id: 'case-004', event_type: 'status_change', title: 'Case Opened', description: 'Insider threat investigation initiated following DLP alerts', timestamp: '2026-07-02T14:00:00Z', actor: 'Sarah Chen', severity: 'high', metadata: {} },
];

// ==================== IOCs ====================

export const mockIOCs: IOC[] = [
  { id: 'ioc-001', case_id: 'case-001', ioc_type: 'ip', value: '185.220.101.42', source: 'Network Analysis', threat_level: 'critical', first_seen: '2026-04-10T00:00:00Z', last_seen: '2026-05-12T00:00:00Z', description: 'Primary C2 server', tags: ['C2'], matched: true },
  { id: 'ioc-002', case_id: 'case-001', ioc_type: 'domain', value: 'update-service.meridian-cdn.com', source: 'DNS Analysis', threat_level: 'critical', first_seen: '2026-03-15T00:00:00Z', last_seen: '2026-05-12T00:00:00Z', description: 'Spoofed update domain', tags: ['C2', 'DGA'], matched: true },
  { id: 'ioc-003', case_id: 'case-001', ioc_type: 'hash_sha256', value: 'a7f1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5061728394a5b6c7d8e9', source: 'Malware Analysis', threat_level: 'critical', first_seen: '2026-04-15T00:00:00Z', last_seen: '2026-05-12T00:00:00Z', description: 'Backdoor binary', tags: ['backdoor'], matched: true },
  { id: 'ioc-004', case_id: 'case-002', ioc_type: 'hash_sha256', value: 'd0b4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4', source: 'AV Quarantine', threat_level: 'critical', first_seen: '2026-06-28T00:00:00Z', last_seen: '2026-06-28T00:00:00Z', description: 'BlackCat ransomware payload', tags: ['ransomware'], matched: true },
  { id: 'ioc-005', case_id: 'case-002', ioc_type: 'ip', value: '103.235.46.18', source: 'RDP Logs', threat_level: 'high', first_seen: '2026-06-25T00:00:00Z', last_seen: '2026-06-28T00:00:00Z', description: 'RDP brute force origin', tags: ['brute-force'], matched: true },
  { id: 'ioc-006', case_id: 'case-002', ioc_type: 'file_name', value: 'svchost_update.exe', source: 'File System Analysis', threat_level: 'critical', first_seen: '2026-06-27T00:00:00Z', last_seen: '2026-06-28T00:00:00Z', description: 'Disguised ransomware loader', tags: ['loader'], matched: true },
  { id: 'ioc-007', case_id: 'case-003', ioc_type: 'email', value: 'cfo@nexus-bank.com.co', source: 'Email Headers', threat_level: 'high', first_seen: '2026-05-20T00:00:00Z', last_seen: '2026-06-04T00:00:00Z', description: 'Spoofed CFO email address', tags: ['BEC'], matched: true },
  { id: 'ioc-008', case_id: 'case-001', ioc_type: 'ip', value: '45.77.65.211', source: 'Proxy Logs', threat_level: 'high', first_seen: '2026-04-22T00:00:00Z', last_seen: '2026-05-11T00:00:00Z', description: 'Data exfiltration endpoint', tags: ['exfil'], matched: true },
  { id: 'ioc-009', case_id: 'case-002', ioc_type: 'registry_key', value: 'HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\SvcHostUpdate', source: 'Registry Analysis', threat_level: 'high', first_seen: '2026-06-27T00:00:00Z', last_seen: '2026-06-28T00:00:00Z', description: 'Persistence mechanism', tags: ['persistence'], matched: true },
  { id: 'ioc-010', case_id: 'case-001', ioc_type: 'mutex', value: 'Global\\DarkCircuit_MTX_2026', source: 'Memory Analysis', threat_level: 'critical', first_seen: '2026-05-22T00:00:00Z', last_seen: '2026-05-22T00:00:00Z', description: 'Backdoor mutex name', tags: ['backdoor', 'APT'], matched: true },
];

// ==================== IPDR Records ====================

export const mockIPDR: IPDRRecord[] = [
  { id: 'ipdr-000', case_id: 'case-001', source_number: '+1-555-0119', destination_number: '+1-555-0285', call_type: 'voice', start_time: '2026-07-19T08:00:00Z', end_time: '2026-07-19T08:00:00Z', duration_seconds: 843, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123457449', imsi: '310410123453726', latitude: 40.718911893146476, longitude: -74.01914367600556 },
  { id: 'ipdr-001', case_id: 'case-001', source_number: '+1-555-0127', destination_number: '+1-555-0278', call_type: 'sms', start_time: '2026-07-19T08:10:00Z', end_time: '2026-07-19T08:10:00Z', duration_seconds: 3361, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123453048', imsi: '310410123458549', latitude: 40.76574249322829, longitude: -74.01579471829476 },
  { id: 'ipdr-002', case_id: 'case-001', source_number: '+1-555-0160', destination_number: '+1-555-0290', call_type: 'voice', start_time: '2026-07-19T08:20:00Z', end_time: '2026-07-19T08:20:00Z', duration_seconds: 831, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123455106', imsi: '310410123455432', latitude: 40.660518471796394, longitude: -74.01486061280251 },
  { id: 'ipdr-003', case_id: 'case-001', source_number: '+1-555-0123', destination_number: '+1-555-0234', call_type: 'sms', start_time: '2026-07-19T08:30:00Z', end_time: '2026-07-19T08:30:00Z', duration_seconds: 889, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123451779', imsi: '310410123457110', latitude: 40.74450567296122, longitude: -74.05346512009586 },
  { id: 'ipdr-004', case_id: 'case-001', source_number: '+1-555-0143', destination_number: '+1-555-0210', call_type: 'voice', start_time: '2026-07-19T08:40:00Z', end_time: '2026-07-19T08:40:00Z', duration_seconds: 886, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123459479', imsi: '310410123454309', latitude: 40.62534629161316, longitude: -74.07635164762891 },
  { id: 'ipdr-005', case_id: 'case-001', source_number: '+1-555-0164', destination_number: '+1-555-0233', call_type: 'data', start_time: '2026-07-19T08:50:00Z', end_time: '2026-07-19T08:50:00Z', duration_seconds: 837, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123455023', imsi: '310410123456369', latitude: 40.675827646652714, longitude: -73.95729048631357 },
  { id: 'ipdr-006', case_id: 'case-001', source_number: '+1-555-0151', destination_number: '+1-555-0242', call_type: 'voice', start_time: '2026-07-19T09:00:00Z', end_time: '2026-07-19T09:00:00Z', duration_seconds: 2011, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123456567', imsi: '310410123456218', latitude: 40.63329861348968, longitude: -74.09605324448655 },
  { id: 'ipdr-007', case_id: 'case-001', source_number: '+1-555-0184', destination_number: '+1-555-0247', call_type: 'voice', start_time: '2026-07-19T09:10:00Z', end_time: '2026-07-19T09:10:00Z', duration_seconds: 57, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123456756', imsi: '310410123452842', latitude: 40.655313702817736, longitude: -74.07936696753175 },
  { id: 'ipdr-008', case_id: 'case-001', source_number: '+1-555-0188', destination_number: '+1-555-0251', call_type: 'data', start_time: '2026-07-19T09:20:00Z', end_time: '2026-07-19T09:20:00Z', duration_seconds: 200, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123455357', imsi: '310410123455808', latitude: 40.70590744354484, longitude: -74.00225569180839 },
  { id: 'ipdr-009', case_id: 'case-001', source_number: '+1-555-0168', destination_number: '+1-555-0253', call_type: 'data', start_time: '2026-07-19T09:30:00Z', end_time: '2026-07-19T09:30:00Z', duration_seconds: 455, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123455723', imsi: '310410123459167', latitude: 40.66291008463905, longitude: -73.97839182146353 },
  { id: 'ipdr-010', case_id: 'case-001', source_number: '+1-555-0148', destination_number: '+1-555-0274', call_type: 'voice', start_time: '2026-07-19T09:40:00Z', end_time: '2026-07-19T09:40:00Z', duration_seconds: 598, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123454789', imsi: '310410123453035', latitude: 40.68717569272701, longitude: -74.04298154141566 },
  { id: 'ipdr-011', case_id: 'case-001', source_number: '+1-555-0155', destination_number: '+1-555-0211', call_type: 'data', start_time: '2026-07-19T09:50:00Z', end_time: '2026-07-19T09:50:00Z', duration_seconds: 745, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123452651', imsi: '310410123455797', latitude: 40.76732973870012, longitude: -73.93182772497782 },
  { id: 'ipdr-012', case_id: 'case-001', source_number: '+1-555-0149', destination_number: '+1-555-0234', call_type: 'sms', start_time: '2026-07-19T10:00:00Z', end_time: '2026-07-19T10:00:00Z', duration_seconds: 171, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123453019', imsi: '310410123457715', latitude: 40.62321640716781, longitude: -73.99940297871613 },
  { id: 'ipdr-013', case_id: 'case-001', source_number: '+1-555-0157', destination_number: '+1-555-0274', call_type: 'data', start_time: '2026-07-19T10:10:00Z', end_time: '2026-07-19T10:10:00Z', duration_seconds: 74, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123458611', imsi: '310410123459083', latitude: 40.78824528880032, longitude: -74.04418973939582 },
  { id: 'ipdr-014', case_id: 'case-001', source_number: '+1-555-0165', destination_number: '+1-555-0226', call_type: 'voice', start_time: '2026-07-19T10:20:00Z', end_time: '2026-07-19T10:20:00Z', duration_seconds: 157, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123455161', imsi: '310410123453745', latitude: 40.6693305771054, longitude: -74.02733589745868 },
  { id: 'ipdr-015', case_id: 'case-001', source_number: '+1-555-0162', destination_number: '+1-555-0213', call_type: 'voice', start_time: '2026-07-19T10:30:00Z', end_time: '2026-07-19T10:30:00Z', duration_seconds: 820, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123454051', imsi: '310410123452110', latitude: 40.72976201085296, longitude: -74.09948451818168 },
  { id: 'ipdr-016', case_id: 'case-001', source_number: '+1-555-0198', destination_number: '+1-555-0290', call_type: 'sms', start_time: '2026-07-19T10:40:00Z', end_time: '2026-07-19T10:40:00Z', duration_seconds: 483, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123453786', imsi: '310410123452080', latitude: 40.801212603528896, longitude: -73.94808362179145 },
  { id: 'ipdr-017', case_id: 'case-001', source_number: '+1-555-0141', destination_number: '+1-555-0243', call_type: 'sms', start_time: '2026-07-19T10:50:00Z', end_time: '2026-07-19T10:50:00Z', duration_seconds: 900, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123453909', imsi: '310410123455456', latitude: 40.7437886432906, longitude: -73.9282733384871 },
  { id: 'ipdr-018', case_id: 'case-001', source_number: '+1-555-0146', destination_number: '+1-555-0269', call_type: 'data', start_time: '2026-07-19T11:00:00Z', end_time: '2026-07-19T11:00:00Z', duration_seconds: 79, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123452400', imsi: '310410123459800', latitude: 40.61666857671957, longitude: -73.91004245713552 },
  { id: 'ipdr-019', case_id: 'case-001', source_number: '+1-555-0190', destination_number: '+1-555-0237', call_type: 'voice', start_time: '2026-07-19T04:19:00Z', end_time: '2026-07-19T04:19:00Z', duration_seconds: 585, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123451669', imsi: '310410123455370', latitude: 40.63053674787734, longitude: -73.98674263361828 },
  { id: 'ipdr-020', case_id: 'case-001', source_number: '+1-555-0164', destination_number: '+1-555-0255', call_type: 'voice', start_time: '2026-07-19T11:20:00Z', end_time: '2026-07-19T11:20:00Z', duration_seconds: 645, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123452919', imsi: '310410123457586', latitude: 40.66130878940139, longitude: -73.96976143366695 },
  { id: 'ipdr-021', case_id: 'case-001', source_number: '+1-555-0161', destination_number: '+1-555-0216', call_type: 'voice', start_time: '2026-07-19T11:30:00Z', end_time: '2026-07-19T11:30:00Z', duration_seconds: 696, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123455223', imsi: '310410123457069', latitude: 40.766663964495564, longitude: -74.01622039347649 },
  { id: 'ipdr-022', case_id: 'case-001', source_number: '+1-555-0123', destination_number: '+1-555-0224', call_type: 'voice', start_time: '2026-07-19T11:40:00Z', end_time: '2026-07-19T11:40:00Z', duration_seconds: 220, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123454540', imsi: '310410123454515', latitude: 40.79133577268398, longitude: -74.02803283535702 },
  { id: 'ipdr-023', case_id: 'case-001', source_number: '+1-555-0187', destination_number: '+1-555-0273', call_type: 'voice', start_time: '2026-07-19T11:50:00Z', end_time: '2026-07-19T11:50:00Z', duration_seconds: 2624, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123459849', imsi: '310410123458185', latitude: 40.79460736330978, longitude: -74.01707182427326 },
  { id: 'ipdr-024', case_id: 'case-001', source_number: '+1-555-0138', destination_number: '+1-555-0286', call_type: 'voice', start_time: '2026-07-19T12:00:00Z', end_time: '2026-07-19T12:00:00Z', duration_seconds: 880, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123453607', imsi: '310410123454955', latitude: 40.63604272873807, longitude: -73.97055891078357 },
  { id: 'ipdr-025', case_id: 'case-001', source_number: '+1-555-0142', destination_number: '+1-555-0228', call_type: 'sms', start_time: '2026-07-19T12:10:00Z', end_time: '2026-07-19T12:10:00Z', duration_seconds: 2982, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123455033', imsi: '310410123455415', latitude: 40.7037346265103, longitude: -74.04473955513274 },
  { id: 'ipdr-026', case_id: 'case-001', source_number: '+1-555-0112', destination_number: '+1-555-0219', call_type: 'voice', start_time: '2026-07-19T12:20:00Z', end_time: '2026-07-19T12:20:00Z', duration_seconds: 777, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123457771', imsi: '310410123459877', latitude: 40.690483198419074, longitude: -74.04561067483108 },
  { id: 'ipdr-027', case_id: 'case-001', source_number: '+1-555-0116', destination_number: '+1-555-0223', call_type: 'voice', start_time: '2026-07-19T22:10:00Z', end_time: '2026-07-19T22:10:00Z', duration_seconds: 489, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123459049', imsi: '310410123452197', latitude: 40.76638833138997, longitude: -73.95829475261007 },
  { id: 'ipdr-028', case_id: 'case-001', source_number: '+1-555-0146', destination_number: '+1-555-0274', call_type: 'voice', start_time: '2026-07-19T12:40:00Z', end_time: '2026-07-19T12:40:00Z', duration_seconds: 172, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123451763', imsi: '310410123451590', latitude: 40.63412593476575, longitude: -74.01741218463096 },
  { id: 'ipdr-029', case_id: 'case-001', source_number: '+1-555-0138', destination_number: '+1-555-0280', call_type: 'data', start_time: '2026-07-19T12:50:00Z', end_time: '2026-07-19T12:50:00Z', duration_seconds: 189, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123458934', imsi: '310410123458231', latitude: 40.76839634725008, longitude: -74.10016556114704 },
  { id: 'ipdr-030', case_id: 'case-001', source_number: '+1-555-0116', destination_number: '+1-555-0292', call_type: 'data', start_time: '2026-07-19T13:00:00Z', end_time: '2026-07-19T13:00:00Z', duration_seconds: 3580, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123456187', imsi: '310410123458198', latitude: 40.70300660029829, longitude: -73.94846081654447 },
  { id: 'ipdr-031', case_id: 'case-001', source_number: '+1-555-0121', destination_number: '+1-555-0211', call_type: 'voice', start_time: '2026-07-19T13:10:00Z', end_time: '2026-07-19T13:10:00Z', duration_seconds: 660, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123458583', imsi: '310410123456789', latitude: 40.77137321928238, longitude: -73.96138687012282 },
  { id: 'ipdr-032', case_id: 'case-001', source_number: '+1-555-0128', destination_number: '+1-555-0253', call_type: 'data', start_time: '2026-07-19T13:20:00Z', end_time: '2026-07-19T13:20:00Z', duration_seconds: 374, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123456205', imsi: '310410123456256', latitude: 40.76874351474367, longitude: -74.09624943440107 },
  { id: 'ipdr-033', case_id: 'case-001', source_number: '+1-555-0132', destination_number: '+1-555-0253', call_type: 'sms', start_time: '2026-07-19T22:12:00Z', end_time: '2026-07-19T22:12:00Z', duration_seconds: 254, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123452653', imsi: '310410123456766', latitude: 40.64753134280172, longitude: -74.08923155141437 },
  { id: 'ipdr-034', case_id: 'case-001', source_number: '+1-555-0125', destination_number: '+1-555-0287', call_type: 'voice', start_time: '2026-07-19T03:54:00Z', end_time: '2026-07-19T03:54:00Z', duration_seconds: 430, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123455331', imsi: '310410123452253', latitude: 40.79588144995694, longitude: -74.03891559450528 },
  { id: 'ipdr-035', case_id: 'case-001', source_number: '+1-555-0142', destination_number: '+1-555-0241', call_type: 'voice', start_time: '2026-07-19T13:50:00Z', end_time: '2026-07-19T13:50:00Z', duration_seconds: 1936, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123457403', imsi: '310410123452501', latitude: 40.61722931059444, longitude: -73.98941396287314 },
  { id: 'ipdr-036', case_id: 'case-001', source_number: '+1-555-0128', destination_number: '+1-555-0260', call_type: 'data', start_time: '2026-07-19T14:00:00Z', end_time: '2026-07-19T14:00:00Z', duration_seconds: 81, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123452124', imsi: '310410123456384', latitude: 40.68847191954059, longitude: -73.94651238791619 },
  { id: 'ipdr-037', case_id: 'case-001', source_number: '+1-555-0171', destination_number: '+1-555-0291', call_type: 'data', start_time: '2026-07-19T14:10:00Z', end_time: '2026-07-19T14:10:00Z', duration_seconds: 590, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123457056', imsi: '310410123455834', latitude: 40.71888024012584, longitude: -73.94966386754524 },
  { id: 'ipdr-038', case_id: 'case-001', source_number: '+1-555-0182', destination_number: '+1-555-0269', call_type: 'data', start_time: '2026-07-19T14:20:00Z', end_time: '2026-07-19T14:20:00Z', duration_seconds: 2342, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123459305', imsi: '310410123454830', latitude: 40.70753183738746, longitude: -73.96609662436394 },
  { id: 'ipdr-039', case_id: 'case-001', source_number: '+1-555-0130', destination_number: '+1-555-0298', call_type: 'sms', start_time: '2026-07-19T14:30:00Z', end_time: '2026-07-19T14:30:00Z', duration_seconds: 2101, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123454147', imsi: '310410123453329', latitude: 40.672289642506634, longitude: -74.09856446586129 },
  { id: 'ipdr-040', case_id: 'case-001', source_number: '+1-555-0183', destination_number: '+1-555-0263', call_type: 'sms', start_time: '2026-07-19T14:40:00Z', end_time: '2026-07-19T14:40:00Z', duration_seconds: 3320, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123459180', imsi: '310410123457604', latitude: 40.72437857152242, longitude: -73.93036651626531 },
  { id: 'ipdr-041', case_id: 'case-001', source_number: '+1-555-0142', destination_number: '+1-555-0236', call_type: 'voice', start_time: '2026-07-19T00:12:00Z', end_time: '2026-07-19T00:12:00Z', duration_seconds: 529, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123455559', imsi: '310410123452065', latitude: 40.67337670710666, longitude: -73.95398536579643 },
  { id: 'ipdr-042', case_id: 'case-001', source_number: '+1-555-0191', destination_number: '+1-555-0259', call_type: 'voice', start_time: '2026-07-19T15:00:00Z', end_time: '2026-07-19T15:00:00Z', duration_seconds: 649, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123458652', imsi: '310410123454173', latitude: 40.62340867227474, longitude: -74.06818868107452 },
  { id: 'ipdr-043', case_id: 'case-001', source_number: '+1-555-0190', destination_number: '+1-555-0266', call_type: 'voice', start_time: '2026-07-19T15:10:00Z', end_time: '2026-07-19T15:10:00Z', duration_seconds: 3037, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123457215', imsi: '310410123452230', latitude: 40.633689108687186, longitude: -74.04708721923471 },
  { id: 'ipdr-044', case_id: 'case-001', source_number: '+1-555-0111', destination_number: '+1-555-0297', call_type: 'sms', start_time: '2026-07-19T15:20:00Z', end_time: '2026-07-19T15:20:00Z', duration_seconds: 306, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123457060', imsi: '310410123456114', latitude: 40.77282265599326, longitude: -74.04095894563073 },
  { id: 'ipdr-045', case_id: 'case-001', source_number: '+1-555-0146', destination_number: '+1-555-0226', call_type: 'voice', start_time: '2026-07-19T15:30:00Z', end_time: '2026-07-19T15:30:00Z', duration_seconds: 270, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123454393', imsi: '310410123458200', latitude: 40.74338365714383, longitude: -73.98234157379257 },
  { id: 'ipdr-046', case_id: 'case-001', source_number: '+1-555-0110', destination_number: '+1-555-0245', call_type: 'voice', start_time: '2026-07-19T00:20:00Z', end_time: '2026-07-19T00:20:00Z', duration_seconds: 418, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123457505', imsi: '310410123458892', latitude: 40.638996437115225, longitude: -73.95478668762468 },
  { id: 'ipdr-047', case_id: 'case-001', source_number: '+1-555-0157', destination_number: '+1-555-0291', call_type: 'voice', start_time: '2026-07-19T15:50:00Z', end_time: '2026-07-19T15:50:00Z', duration_seconds: 463, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123455653', imsi: '310410123451722', latitude: 40.772114913105135, longitude: -74.07779586598951 },
  { id: 'ipdr-048', case_id: 'case-001', source_number: '+1-555-0191', destination_number: '+1-555-0220', call_type: 'voice', start_time: '2026-07-19T16:00:00Z', end_time: '2026-07-19T16:00:00Z', duration_seconds: 1994, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123457062', imsi: '310410123458838', latitude: 40.64524585058793, longitude: -74.06661947959685 },
  { id: 'ipdr-049', case_id: 'case-001', source_number: '+1-555-0167', destination_number: '+1-555-0291', call_type: 'sms', start_time: '2026-07-19T01:49:00Z', end_time: '2026-07-19T01:49:00Z', duration_seconds: 402, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123454961', imsi: '310410123459241', latitude: 40.676619723985254, longitude: -73.99816090641 },
  { id: 'ipdr-050', case_id: 'case-001', source_number: '+1-555-0114', destination_number: '+1-555-0248', call_type: 'sms', start_time: '2026-07-19T16:20:00Z', end_time: '2026-07-19T16:20:00Z', duration_seconds: 142, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123455747', imsi: '310410123452470', latitude: 40.80561781228185, longitude: -74.00862068077693 },
  { id: 'ipdr-051', case_id: 'case-001', source_number: '+1-555-0151', destination_number: '+1-555-0298', call_type: 'sms', start_time: '2026-07-19T16:30:00Z', end_time: '2026-07-19T16:30:00Z', duration_seconds: 251, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123452179', imsi: '310410123456109', latitude: 40.71985367437015, longitude: -74.05442745871983 },
  { id: 'ipdr-052', case_id: 'case-001', source_number: '+1-555-0180', destination_number: '+1-555-0258', call_type: 'voice', start_time: '2026-07-19T16:40:00Z', end_time: '2026-07-19T16:40:00Z', duration_seconds: 372, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123452613', imsi: '310410123452843', latitude: 40.702754392609805, longitude: -74.0002504660142 },
  { id: 'ipdr-053', case_id: 'case-001', source_number: '+1-555-0178', destination_number: '+1-555-0221', call_type: 'voice', start_time: '2026-07-19T16:50:00Z', end_time: '2026-07-19T16:50:00Z', duration_seconds: 2274, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123453844', imsi: '310410123451831', latitude: 40.76914558403174, longitude: -73.97054333357408 },
  { id: 'ipdr-054', case_id: 'case-001', source_number: '+1-555-0151', destination_number: '+1-555-0215', call_type: 'voice', start_time: '2026-07-19T04:24:00Z', end_time: '2026-07-19T04:24:00Z', duration_seconds: 303, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123457636', imsi: '310410123451200', latitude: 40.7926200868051, longitude: -73.98293617401924 },
  { id: 'ipdr-055', case_id: 'case-001', source_number: '+1-555-0113', destination_number: '+1-555-0284', call_type: 'voice', start_time: '2026-07-19T17:10:00Z', end_time: '2026-07-19T17:10:00Z', duration_seconds: 307, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123458107', imsi: '310410123459071', latitude: 40.740109649325916, longitude: -74.0108352932769 },
  { id: 'ipdr-056', case_id: 'case-001', source_number: '+1-555-0121', destination_number: '+1-555-0241', call_type: 'sms', start_time: '2026-07-19T17:20:00Z', end_time: '2026-07-19T17:20:00Z', duration_seconds: 254, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123456792', imsi: '310410123458398', latitude: 40.77799008200373, longitude: -73.95623625491831 },
  { id: 'ipdr-057', case_id: 'case-001', source_number: '+1-555-0181', destination_number: '+1-555-0233', call_type: 'voice', start_time: '2026-07-19T17:30:00Z', end_time: '2026-07-19T17:30:00Z', duration_seconds: 88, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123453444', imsi: '310410123455767', latitude: 40.79488852258874, longitude: -74.05594111673062 },
  { id: 'ipdr-058', case_id: 'case-001', source_number: '+1-555-0145', destination_number: '+1-555-0218', call_type: 'voice', start_time: '2026-07-19T17:40:00Z', end_time: '2026-07-19T17:40:00Z', duration_seconds: 273, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123458669', imsi: '310410123454689', latitude: 40.67252112236958, longitude: -74.0891521546045 },
  { id: 'ipdr-059', case_id: 'case-001', source_number: '+1-555-0114', destination_number: '+1-555-0214', call_type: 'sms', start_time: '2026-07-19T17:50:00Z', end_time: '2026-07-19T17:50:00Z', duration_seconds: 167, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123454301', imsi: '310410123456986', latitude: 40.78455126962434, longitude: -73.9264199814977 },
  { id: 'ipdr-060', case_id: 'case-001', source_number: '+1-555-0136', destination_number: '+1-555-0214', call_type: 'data', start_time: '2026-07-19T18:00:00Z', end_time: '2026-07-19T18:00:00Z', duration_seconds: 621, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123458101', imsi: '310410123451526', latitude: 40.76619634431976, longitude: -74.04399276088628 },
  { id: 'ipdr-061', case_id: 'case-001', source_number: '+1-555-0173', destination_number: '+1-555-0285', call_type: 'voice', start_time: '2026-07-19T18:10:00Z', end_time: '2026-07-19T18:10:00Z', duration_seconds: 79, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123455173', imsi: '310410123454235', latitude: 40.777454255905525, longitude: -74.07448907621746 },
  { id: 'ipdr-062', case_id: 'case-001', source_number: '+1-555-0192', destination_number: '+1-555-0295', call_type: 'sms', start_time: '2026-07-19T18:20:00Z', end_time: '2026-07-19T18:20:00Z', duration_seconds: 634, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123451172', imsi: '310410123459177', latitude: 40.71652528086258, longitude: -73.98058138036795 },
  { id: 'ipdr-063', case_id: 'case-001', source_number: '+1-555-0117', destination_number: '+1-555-0222', call_type: 'voice', start_time: '2026-07-19T18:30:00Z', end_time: '2026-07-19T18:30:00Z', duration_seconds: 2024, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123455319', imsi: '310410123452496', latitude: 40.67007540892923, longitude: -73.91459284360198 },
  { id: 'ipdr-064', case_id: 'case-001', source_number: '+1-555-0165', destination_number: '+1-555-0268', call_type: 'sms', start_time: '2026-07-19T18:40:00Z', end_time: '2026-07-19T18:40:00Z', duration_seconds: 499, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123454231', imsi: '310410123455032', latitude: 40.6628261266199, longitude: -73.96554945619873 },
  { id: 'ipdr-065', case_id: 'case-001', source_number: '+1-555-0169', destination_number: '+1-555-0279', call_type: 'voice', start_time: '2026-07-19T23:46:00Z', end_time: '2026-07-19T23:46:00Z', duration_seconds: 297, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123455772', imsi: '310410123456772', latitude: 40.7102350035381, longitude: -73.97508444988486 },
  { id: 'ipdr-066', case_id: 'case-001', source_number: '+1-555-0190', destination_number: '+1-555-0223', call_type: 'voice', start_time: '2026-07-19T19:00:00Z', end_time: '2026-07-19T19:00:00Z', duration_seconds: 463, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123455634', imsi: '310410123457082', latitude: 40.624259738372174, longitude: -74.09005471743711 },
  { id: 'ipdr-067', case_id: 'case-001', source_number: '+1-555-0149', destination_number: '+1-555-0298', call_type: 'sms', start_time: '2026-07-19T19:10:00Z', end_time: '2026-07-19T19:10:00Z', duration_seconds: 2001, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123451839', imsi: '310410123455282', latitude: 40.73717844937541, longitude: -74.01248130912 },
  { id: 'ipdr-068', case_id: 'case-001', source_number: '+1-555-0146', destination_number: '+1-555-0245', call_type: 'sms', start_time: '2026-07-19T19:20:00Z', end_time: '2026-07-19T19:20:00Z', duration_seconds: 415, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123457054', imsi: '310410123452374', latitude: 40.808976557374876, longitude: -73.97064996185141 },
  { id: 'ipdr-069', case_id: 'case-001', source_number: '+1-555-0152', destination_number: '+1-555-0228', call_type: 'sms', start_time: '2026-07-19T19:30:00Z', end_time: '2026-07-19T19:30:00Z', duration_seconds: 2577, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123456167', imsi: '310410123457049', latitude: 40.61749481476095, longitude: -73.9223698987386 },
  { id: 'ipdr-070', case_id: 'case-001', source_number: '+1-555-0163', destination_number: '+1-555-0224', call_type: 'voice', start_time: '2026-07-19T19:40:00Z', end_time: '2026-07-19T19:40:00Z', duration_seconds: 173, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123456225', imsi: '310410123451771', latitude: 40.62783628769753, longitude: -73.96392528270813 },
  { id: 'ipdr-071', case_id: 'case-001', source_number: '+1-555-0127', destination_number: '+1-555-0243', call_type: 'voice', start_time: '2026-07-19T19:50:00Z', end_time: '2026-07-19T19:50:00Z', duration_seconds: 2262, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123455399', imsi: '310410123453719', latitude: 40.66428783508427, longitude: -74.03155088236139 },
  { id: 'ipdr-072', case_id: 'case-001', source_number: '+1-555-0121', destination_number: '+1-555-0229', call_type: 'voice', start_time: '2026-07-19T20:00:00Z', end_time: '2026-07-19T20:00:00Z', duration_seconds: 872, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123458515', imsi: '310410123458466', latitude: 40.756512040663345, longitude: -74.0714920734993 },
  { id: 'ipdr-073', case_id: 'case-001', source_number: '+1-555-0158', destination_number: '+1-555-0247', call_type: 'sms', start_time: '2026-07-19T20:10:00Z', end_time: '2026-07-19T20:10:00Z', duration_seconds: 670, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123452145', imsi: '310410123454767', latitude: 40.808889845315065, longitude: -73.96700300144246 },
  { id: 'ipdr-074', case_id: 'case-001', source_number: '+1-555-0179', destination_number: '+1-555-0250', call_type: 'voice', start_time: '2026-07-19T20:20:00Z', end_time: '2026-07-19T20:20:00Z', duration_seconds: 432, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123451887', imsi: '310410123455413', latitude: 40.73978895572349, longitude: -74.01902307645966 },
  { id: 'ipdr-075', case_id: 'case-001', source_number: '+1-555-0150', destination_number: '+1-555-0222', call_type: 'data', start_time: '2026-07-19T20:30:00Z', end_time: '2026-07-19T20:30:00Z', duration_seconds: 714, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123457966', imsi: '310410123459319', latitude: 40.72370807051488, longitude: -73.94190132386976 },
  { id: 'ipdr-076', case_id: 'case-001', source_number: '+1-555-0116', destination_number: '+1-555-0236', call_type: 'voice', start_time: '2026-07-19T20:40:00Z', end_time: '2026-07-19T20:40:00Z', duration_seconds: 2160, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123455614', imsi: '310410123451280', latitude: 40.652599054110105, longitude: -74.0465689338143 },
  { id: 'ipdr-077', case_id: 'case-001', source_number: '+1-555-0171', destination_number: '+1-555-0229', call_type: 'data', start_time: '2026-07-19T20:50:00Z', end_time: '2026-07-19T20:50:00Z', duration_seconds: 271, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123452550', imsi: '310410123455512', latitude: 40.72014527593004, longitude: -73.9189196789328 },
  { id: 'ipdr-078', case_id: 'case-001', source_number: '+1-555-0169', destination_number: '+1-555-0244', call_type: 'data', start_time: '2026-07-19T21:00:00Z', end_time: '2026-07-19T21:00:00Z', duration_seconds: 2152, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123451270', imsi: '310410123458322', latitude: 40.801003103831725, longitude: -73.97570239233333 },
  { id: 'ipdr-079', case_id: 'case-001', source_number: '+1-555-0147', destination_number: '+1-555-0254', call_type: 'sms', start_time: '2026-07-19T21:10:00Z', end_time: '2026-07-19T21:10:00Z', duration_seconds: 383, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123452363', imsi: '310410123451850', latitude: 40.80577767627978, longitude: -73.97886156214042 },
  { id: 'ipdr-080', case_id: 'case-001', source_number: '+1-555-0178', destination_number: '+1-555-0286', call_type: 'sms', start_time: '2026-07-19T21:20:00Z', end_time: '2026-07-19T21:20:00Z', duration_seconds: 844, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123459393', imsi: '310410123454801', latitude: 40.68547226027168, longitude: -74.00003541807364 },
  { id: 'ipdr-081', case_id: 'case-001', source_number: '+1-555-0139', destination_number: '+1-555-0227', call_type: 'sms', start_time: '2026-07-19T21:30:00Z', end_time: '2026-07-19T21:30:00Z', duration_seconds: 3518, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123453736', imsi: '310410123457187', latitude: 40.66718160342308, longitude: -73.98689780956038 },
  { id: 'ipdr-082', case_id: 'case-001', source_number: '+1-555-0171', destination_number: '+1-555-0245', call_type: 'data', start_time: '2026-07-19T21:40:00Z', end_time: '2026-07-19T21:40:00Z', duration_seconds: 175, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123454664', imsi: '310410123458939', latitude: 40.771791369284614, longitude: -73.9147184717751 },
  { id: 'ipdr-083', case_id: 'case-001', source_number: '+1-555-0186', destination_number: '+1-555-0284', call_type: 'data', start_time: '2026-07-19T21:50:00Z', end_time: '2026-07-19T21:50:00Z', duration_seconds: 493, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123453692', imsi: '310410123458043', latitude: 40.75147908951229, longitude: -74.06077632134638 },
  { id: 'ipdr-084', case_id: 'case-001', source_number: '+1-555-0112', destination_number: '+1-555-0258', call_type: 'data', start_time: '2026-07-19T22:00:00Z', end_time: '2026-07-19T22:00:00Z', duration_seconds: 3265, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123455066', imsi: '310410123457271', latitude: 40.62807269815067, longitude: -73.94881090560072 },
  { id: 'ipdr-085', case_id: 'case-001', source_number: '+1-555-0156', destination_number: '+1-555-0262', call_type: 'data', start_time: '2026-07-19T22:10:00Z', end_time: '2026-07-19T22:10:00Z', duration_seconds: 480, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123452645', imsi: '310410123454005', latitude: 40.724829531236885, longitude: -74.0446763274287 },
  { id: 'ipdr-086', case_id: 'case-001', source_number: '+1-555-0126', destination_number: '+1-555-0213', call_type: 'voice', start_time: '2026-07-19T22:20:00Z', end_time: '2026-07-19T22:20:00Z', duration_seconds: 3065, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123455868', imsi: '310410123457996', latitude: 40.71525972002193, longitude: -73.90757054008908 },
  { id: 'ipdr-087', case_id: 'case-001', source_number: '+1-555-0131', destination_number: '+1-555-0247', call_type: 'voice', start_time: '2026-07-19T22:30:00Z', end_time: '2026-07-19T22:30:00Z', duration_seconds: 3133, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123454778', imsi: '310410123453896', latitude: 40.74985756095396, longitude: -73.931153477837 },
  { id: 'ipdr-088', case_id: 'case-001', source_number: '+1-555-0187', destination_number: '+1-555-0224', call_type: 'sms', start_time: '2026-07-19T22:40:00Z', end_time: '2026-07-19T22:40:00Z', duration_seconds: 177, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123453244', imsi: '310410123459787', latitude: 40.76597120766868, longitude: -74.03227067310549 },
  { id: 'ipdr-089', case_id: 'case-001', source_number: '+1-555-0118', destination_number: '+1-555-0232', call_type: 'voice', start_time: '2026-07-19T22:50:00Z', end_time: '2026-07-19T22:50:00Z', duration_seconds: 2064, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123455281', imsi: '310410123456175', latitude: 40.74030417488829, longitude: -74.06125648243064 },
  { id: 'ipdr-090', case_id: 'case-001', source_number: '+1-555-0148', destination_number: '+1-555-0218', call_type: 'data', start_time: '2026-07-19T22:20:00Z', end_time: '2026-07-19T22:20:00Z', duration_seconds: 545, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123455358', imsi: '310410123455579', latitude: 40.629024043991684, longitude: -74.06678782257002 },
  { id: 'ipdr-091', case_id: 'case-001', source_number: '+1-555-0168', destination_number: '+1-555-0241', call_type: 'voice', start_time: '2026-07-19T23:10:00Z', end_time: '2026-07-19T23:10:00Z', duration_seconds: 363, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123454752', imsi: '310410123453205', latitude: 40.65551669176765, longitude: -73.90727512579966 },
  { id: 'ipdr-092', case_id: 'case-001', source_number: '+1-555-0195', destination_number: '+1-555-0263', call_type: 'sms', start_time: '2026-07-19T23:20:00Z', end_time: '2026-07-19T23:20:00Z', duration_seconds: 333, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123458065', imsi: '310410123455628', latitude: 40.77551209630099, longitude: -74.00934628370702 },
  { id: 'ipdr-093', case_id: 'case-001', source_number: '+1-555-0157', destination_number: '+1-555-0286', call_type: 'voice', start_time: '2026-07-19T00:30:00Z', end_time: '2026-07-19T00:30:00Z', duration_seconds: 324, cell_id: 'TWR102', cell_location: 'Unknown', imei: '356789123454606', imsi: '310410123454417', latitude: 40.72209842240765, longitude: -73.97492112067178 },
  { id: 'ipdr-094', case_id: 'case-001', source_number: '+1-555-0146', destination_number: '+1-555-0288', call_type: 'sms', start_time: '2026-07-19T23:40:00Z', end_time: '2026-07-19T23:40:00Z', duration_seconds: 123, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123455095', imsi: '310410123452768', latitude: 40.74992649649594, longitude: -74.01751881833985 },
  { id: 'ipdr-095', case_id: 'case-001', source_number: '+1-555-0199', destination_number: '+1-555-0256', call_type: 'data', start_time: '2026-07-19T23:50:00Z', end_time: '2026-07-19T23:50:00Z', duration_seconds: 269, cell_id: 'TWR101', cell_location: 'Unknown', imei: '356789123456357', imsi: '310410123456531', latitude: 40.71326649526127, longitude: -74.0432922968065 },
  { id: 'ipdr-096', case_id: 'case-001', source_number: '+1-555-0128', destination_number: '+1-555-0284', call_type: 'sms', start_time: '2026-07-20T00:00:00Z', end_time: '2026-07-20T00:00:00Z', duration_seconds: 695, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123454169', imsi: '310410123453790', latitude: 40.65096107347057, longitude: -74.04183692236849 },
  { id: 'ipdr-097', case_id: 'case-001', source_number: '+1-555-0193', destination_number: '+1-555-0265', call_type: 'voice', start_time: '2026-07-20T00:10:00Z', end_time: '2026-07-20T00:10:00Z', duration_seconds: 260, cell_id: 'TWR104', cell_location: 'Unknown', imei: '356789123454742', imsi: '310410123453234', latitude: 40.78886770893829, longitude: -74.0429302656659 },
  { id: 'ipdr-098', case_id: 'case-001', source_number: '+1-555-0183', destination_number: '+1-555-0260', call_type: 'voice', start_time: '2026-07-20T00:20:00Z', end_time: '2026-07-20T00:20:00Z', duration_seconds: 1924, cell_id: 'TWR100', cell_location: 'Unknown', imei: '356789123451998', imsi: '310410123456597', latitude: 40.69450450324803, longitude: -74.09332638847818 },
  { id: 'ipdr-099', case_id: 'case-001', source_number: '+1-555-0194', destination_number: '+1-555-0245', call_type: 'voice', start_time: '2026-07-19T23:13:00Z', end_time: '2026-07-19T23:13:00Z', duration_seconds: 392, cell_id: 'TWR103', cell_location: 'Unknown', imei: '356789123452461', imsi: '310410123456830', latitude: 40.73975967922601, longitude: -74.05783139059523 },
];

// ==================== OSINT Results ====================

export const mockOSINT: OSINTResult[] = [
  { id: 'osint-001', case_id: 'case-001', query: '185.220.101.42', query_type: 'ip_address', source: 'VirusTotal', confidence: 0.95, data: { malicious: 42, suspicious: 8, clean: 12, country: 'Russia', asn: 'AS57523', last_analysis: '2026-05-10' }, timestamp: '2026-05-13T10:00:00Z', tags: ['malicious'] },
  { id: 'osint-002', case_id: 'case-001', query: 'update-service.meridian-cdn.com', query_type: 'domain', source: 'WHOIS', confidence: 0.90, data: { registrar: 'NameCheap', created: '2026-02-28', expires: '2027-02-28', registrant: 'Privacy Protected', nameservers: ['ns1.anonhost.org'] }, timestamp: '2026-05-13T10:05:00Z', tags: ['suspicious'] },
  { id: 'osint-003', case_id: 'case-001', query: 'darkCircuit_v', query_type: 'username', source: 'Social Media Intel', confidence: 0.72, data: { platforms: ['GitHub', 'Telegram', 'XSS.is'], accounts_found: 3, activity: 'Active on cybercrime forums' }, timestamp: '2026-05-14T08:00:00Z', tags: ['suspect'] },
  { id: 'osint-004', case_id: 'case-003', query: 'nexus-bank.com.co', query_type: 'domain', source: 'WHOIS', confidence: 0.88, data: { registrar: 'GoDaddy', created: '2026-05-18', registrant: 'John Smith', country: 'Colombia', similar_domains: ['nexusbank.com', 'nexus-banking.com'] }, timestamp: '2026-06-06T09:00:00Z', tags: ['typosquat'] },
  { id: 'osint-005', case_id: 'case-002', query: '103.235.46.18', query_type: 'ip_address', source: 'AbuseIPDB', confidence: 0.92, data: { abuse_score: 100, reports: 847, categories: ['Brute-Force', 'SSH', 'RDP'], country: 'China', isp: 'China Telecom' }, timestamp: '2026-06-28T07:00:00Z', tags: ['malicious'] },
];

// ==================== Ransomware Findings ====================

export const mockRansomware: RansomwareFinding[] = [
  {
    id: 'rw-001', case_id: 'case-002', family_name: 'ALPHV/BlackCat', variant: 'v2.1',
    encryption_type: 'AES-256 + RSA-4096', ransom_amount: '4.5 BTC (~$315,000)',
    bitcoin_address: 'bc1q9h5yjqr3kfm4ld8v9xyz', kill_chain_stage: 'Actions on Objectives',
    decryptor_available: false, first_seen: '2026-06-28T03:00:00Z',
    notes: 'Rust-based ransomware. Uses intermittent encryption for speed. Exfiltrates data before encryption. Double extortion model.',
    iocs: mockIOCs.filter(i => i.case_id === 'case-002'),
  },
];

// ==================== AI Reports ====================

export const mockAIReports: AIReport[] = [
  {
    id: 'air-001', case_id: 'case-001', report_type: 'summary',
    content: `## Case Summary: Operation Dark Circuit

**Investigation Status**: Active — In Progress

### Key Findings
This investigation has uncovered a sophisticated Advanced Persistent Threat (APT) campaign targeting Meridian Systems, a defense contractor. The threat actor, operating under the alias "darkCircuit_v," established a command-and-control infrastructure using spoofed CDN domains to mimic legitimate Meridian update services.

### Attack Vector
The initial access was achieved through a compromised third-party vendor in Meridian's supply chain. The attacker leveraged a trojanized software update to deploy a custom backdoor (svchost_update.exe) on the production server PRD-SRV-07.

### Data Exfiltration
Network analysis confirms data exfiltration to two endpoints:
- **185.220.101.42** (Russia, AS57523) — Primary C2 server
- **45.77.65.211** (Netherlands, Vultr) — Data staging server

Approximately 2.3 TB of data was exfiltrated over an 18-month period, including classified R&D documents and proprietary source code.

### Threat Assessment
- **Confidence Level**: High (87%)
- **Attribution**: APT-41 affiliated group (moderate confidence)
- **Risk Level**: Critical — Ongoing national security implications

### Missing Artifacts
- Vendor access logs from supply chain partner
- Complete email communications of compromised accounts
- Cloud storage access audit logs`,
    confidence: 0.87, generated_at: '2026-06-15T09:00:00Z', model: 'CIIP-AI v2.1', status: 'reviewed',
  },
  {
    id: 'air-002', case_id: 'case-002', report_type: 'next_steps',
    content: `## Recommended Next Steps: BlackCat Ransomware Investigation

1. **Immediate Actions**
   - Complete forensic imaging of all affected workstations (12 remaining)
   - Preserve RDP gateway logs before rotation
   - Contact FBI IC3 for federal coordination

2. **Analysis Tasks**
   - Complete Volatility analysis of memory dumps
   - Reverse engineer the BlackCat payload to identify unique variant markers
   - Map complete lateral movement path from initial RDP compromise

3. **Recovery Planning**
   - Assess backup integrity for encrypted systems
   - Coordinate with hospital IT for phased system restoration
   - Document all patient data potentially exposed for HIPAA notification

4. **Intelligence Sharing**
   - Submit IOCs to CISA and MS-ISAC
   - Update internal threat intelligence platform
   - Prepare advisory for healthcare sector partners`,
    confidence: 0.82, generated_at: '2026-07-01T14:00:00Z', model: 'CIIP-AI v2.1', status: 'draft',
  },
];

// ==================== Audit Logs ====================

export const mockAuditLogs: AuditLogEntry[] = [
  { id: 'al-001', user_id: 'usr-001', user_name: 'Sarah Chen', action: 'CREATE', resource_type: 'case', resource_id: 'case-001', details: 'Created case CIIP-2026-0147: Operation Dark Circuit', ip_address: '10.0.1.15', timestamp: '2026-05-12T08:30:00Z' },
  { id: 'al-002', user_id: 'usr-002', user_name: 'Marcus Wright', action: 'UPLOAD', resource_type: 'evidence', resource_id: 'ev-001', details: 'Uploaded disk image: meridian_server_disk.E01 (512 GB)', ip_address: '10.0.1.22', timestamp: '2026-05-14T10:00:00Z' },
  { id: 'al-003', user_id: 'usr-003', user_name: 'Aisha Patel', action: 'UPLOAD', resource_type: 'evidence', resource_id: 'ev-002', details: 'Uploaded network capture: network_capture_may2026.pcapng', ip_address: '10.0.1.30', timestamp: '2026-05-15T14:30:00Z' },
  { id: 'al-004', user_id: 'usr-003', user_name: 'Aisha Patel', action: 'ACCESS', resource_type: 'evidence', resource_id: 'ev-001', details: 'Created working copy for analysis', ip_address: '10.0.1.30', timestamp: '2026-05-16T08:00:00Z' },
  { id: 'al-005', user_id: 'usr-003', user_name: 'Aisha Patel', action: 'CREATE', resource_type: 'entity', resource_id: 'ent-001', details: 'Identified C2 server: 185.220.101.42', ip_address: '10.0.1.30', timestamp: '2026-05-18T09:15:00Z' },
  { id: 'al-006', user_id: 'usr-001', user_name: 'Sarah Chen', action: 'CREATE', resource_type: 'case', resource_id: 'case-002', details: 'Created emergency case CIIP-2026-0163: BlackCat Ransomware', ip_address: '10.0.1.15', timestamp: '2026-06-28T03:15:00Z' },
  { id: 'al-007', user_id: 'usr-002', user_name: 'Marcus Wright', action: 'UPLOAD', resource_type: 'evidence', resource_id: 'ev-003', details: 'Uploaded ransom note: ransom_note.txt', ip_address: '10.0.1.22', timestamp: '2026-06-28T06:00:00Z' },
  { id: 'al-008', user_id: 'usr-002', user_name: 'Marcus Wright', action: 'UPLOAD', resource_type: 'evidence', resource_id: 'ev-004', details: 'Uploaded malware sample: blackcat_payload.dll.quarantine', ip_address: '10.0.1.22', timestamp: '2026-06-28T08:30:00Z' },
  { id: 'al-009', user_id: 'usr-002', user_name: 'Marcus Wright', action: 'GENERATE', resource_type: 'ai_report', resource_id: 'air-001', details: 'Generated AI case summary for Operation Dark Circuit', ip_address: '10.0.1.22', timestamp: '2026-06-15T09:00:00Z' },
  { id: 'al-010', user_id: 'usr-004', user_name: 'James Holloway', action: 'REVIEW', resource_type: 'ai_report', resource_id: 'air-001', details: 'Reviewed and approved AI case summary', ip_address: '10.0.1.10', timestamp: '2026-06-16T11:00:00Z' },
  { id: 'al-011', user_id: 'usr-002', user_name: 'Marcus Wright', action: 'LOGIN', resource_type: 'session', resource_id: 'sess-042', details: 'User logged in successfully', ip_address: '10.0.1.22', timestamp: '2026-07-16T13:15:00Z' },
  { id: 'al-012', user_id: 'usr-003', user_name: 'Aisha Patel', action: 'EXPORT', resource_type: 'report', resource_id: 'rpt-005', details: 'Exported case report as PDF', ip_address: '10.0.1.30', timestamp: '2026-07-15T16:00:00Z' },
];

// ==================== Notifications ====================

export const mockNotifications: Notification[] = [
  { id: 'notif-001', title: 'Evidence Processing Complete', message: 'Memory dump analysis for case CIIP-2026-0147 has completed', type: 'success', read: false, timestamp: '2026-07-16T14:00:00Z', link: '/cases/case-001' },
  { id: 'notif-002', title: 'New IOC Match', message: '3 new IOCs matched against threat intelligence feeds', type: 'warning', read: false, timestamp: '2026-07-16T13:30:00Z', link: '/cases/case-002' },
  { id: 'notif-003', title: 'AI Report Ready', message: 'Investigation report draft for Operation Dark Circuit is ready for review', type: 'info', read: false, timestamp: '2026-07-16T12:00:00Z', link: '/reports' },
  { id: 'notif-004', title: 'Suspicious Activity', message: 'Unusual IPDR pattern detected in case CIIP-2026-0147', type: 'error', read: true, timestamp: '2026-07-16T10:00:00Z', link: '/ipdr' },
  { id: 'notif-005', title: 'Case Updated', message: 'Supervisor James Holloway added comments to case CIIP-2026-0163', type: 'info', read: true, timestamp: '2026-07-15T16:30:00Z', link: '/cases/case-002' },
];

// ==================== Dashboard Stats ====================

export const mockDashboardStats: DashboardStats = {
  active_cases: 4,
  total_evidence: 163,
  pending_analysis: 12,
  threats_detected: 89,
  cases_this_month: 3,
  resolved_this_month: 1,
};
