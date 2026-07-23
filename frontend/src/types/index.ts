// ==================== Core Types ====================

export type UserRole = 'admin' | 'investigator' | 'analyst' | 'supervisor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar?: string;
  department: string;
  badge_number: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
}

export type CaseStatus = 'open' | 'in_progress' | 'closed' | 'archived';
export type CaseSeverity = 'critical' | 'high' | 'medium' | 'low';
export type CaseType = 'cyber_crime' | 'fraud' | 'ransomware' | 'data_breach' | 'insider_threat' | 'phishing' | 'espionage' | 'other';

export interface Case {
  id: string;
  case_number: string;
  title: string;
  description: string;
  status: CaseStatus;
  severity: CaseSeverity;
  case_type: CaseType;
  lead_investigator: User;
  assigned_analysts: User[];
  created_at: string;
  updated_at: string;
  closed_at?: string;
  evidence_count: number;
  entity_count: number;
  ioc_count: number;
  tags: string[];
}

// ==================== Evidence ====================

export type EvidenceStatus = 'uploaded' | 'processing' | 'verified' | 'flagged' | 'archived';
export type EvidenceType = 'document' | 'image' | 'disk_image' | 'memory_dump' | 'network_capture' | 'log_file' | 'email' | 'malware_sample' | 'mobile_data' | 'other';

export interface EvidenceItem {
  id: string;
  evidence_number: string;
  case_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  evidence_type: EvidenceType;
  sha256_hash: string;
  md5_hash: string;
  source: string;
  handler: string;
  status: EvidenceStatus;
  description: string;
  upload_date: string;
  metadata: Record<string, string>;
  hash_verified: boolean;
  tags: string[];
}

export interface ChainOfCustody {
  id: string;
  evidence_id: string;
  action: string;
  handler: string;
  from_location: string;
  to_location: string;
  timestamp: string;
  notes: string;
  digital_signature: string;
}

// ==================== Entities ====================

export type EntityType = 'person' | 'ip_address' | 'domain' | 'email' | 'phone' | 'username' | 'organization' | 'file_hash' | 'url' | 'cryptocurrency';

export interface Entity {
  id: string;
  case_id: string;
  entity_type: EntityType;
  value: string;
  label: string;
  risk_score: number;
  first_seen: string;
  last_seen: string;
  metadata: Record<string, string>;
  tags: string[];
}

export interface EntityRelationship {
  id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  weight: number;
  metadata: Record<string, string>;
}

// ==================== Timeline ====================

export type TimelineEventType = 'evidence_added' | 'entity_discovered' | 'analysis_complete' | 'ioc_matched' | 'note_added' | 'status_change' | 'report_generated' | 'custom';

export interface TimelineEvent {
  id: string;
  case_id: string;
  event_type: TimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  severity?: CaseSeverity;
  metadata: Record<string, string>;
}

// ==================== IOCs ====================

export type IOCType = 'ip' | 'domain' | 'hash_md5' | 'hash_sha256' | 'hash_sha1' | 'url' | 'email' | 'file_name' | 'registry_key' | 'mutex';

export interface IOC {
  id: string;
  case_id?: string;
  ioc_type: IOCType;
  value: string;
  source: string;
  threat_level: CaseSeverity;
  first_seen: string;
  last_seen: string;
  description: string;
  tags: string[];
  matched: boolean;
}

// ==================== IPDR ====================

export interface IPDRRecord {
  id: string;
  case_id: string;
  source_number: string;
  destination_number: string;
  call_type: 'voice' | 'sms' | 'data';
  start_time: string;
  end_time: string;
  duration_seconds: number;
  cell_id: string;
  cell_location: string;
  imei: string;
  imsi: string;
  latitude?: number;
  longitude?: number;
}

// ==================== OSINT ====================

export interface OSINTResult {
  id: string;
  case_id?: string;
  query: string;
  query_type: EntityType;
  source: string;
  confidence: number;
  data: Record<string, any>;
  timestamp: string;
  tags: string[];
}

// ==================== Ransomware ====================

export interface RansomwareFinding {
  id: string;
  case_id: string;
  family_name: string;
  variant: string;
  encryption_type: string;
  ransom_amount?: string;
  bitcoin_address?: string;
  iocs: IOC[];
  kill_chain_stage: string;
  decryptor_available: boolean;
  first_seen: string;
  notes: string;
}

// ==================== AI Reports ====================

export interface AIReport {
  id: string;
  case_id: string;
  report_type: 'summary' | 'investigation_report' | 'next_steps' | 'missing_artifacts' | 'supervisor_brief';
  content: string;
  confidence: number;
  generated_at: string;
  model: string;
  status: 'draft' | 'reviewed' | 'approved';
}

// ==================== Audit ====================

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  timestamp: string;
}

// ==================== Dashboard Stats ====================

export interface DashboardStats {
  active_cases: number;
  total_evidence: number;
  pending_analysis: number;
  threats_detected: number;
  cases_this_month: number;
  resolved_this_month: number;
}

// ==================== Notifications ====================

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: string;
  link?: string;
}

// ==================== Graph ====================

export interface GraphNode {
  id: string;
  label: string;
  type: EntityType;
  risk_score: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  weight: number;
}
