# Module Documentation

The CIIP platform is highly modularized, with specific sub-systems addressing distinct facets of a cyber investigation.

## 1. Dashboard
- **Purpose**: Provides a high-level operational overview of active investigations and system intelligence.
- **Functionality**: Displays Key Performance Indicators (KPIs), an active activity feed, recent cases, and visual distributions of case types/severities using Chart.js.
- **Dependencies**: React-ChartJS-2, Frontend Zustand state.
- **Inputs**: None (automated from API).
- **Outputs**: Visual charts, lists of active cases.

## 2. Case Management (Cases)
- **Purpose**: The central organizing container for any investigation.
- **Functionality**: Full CRUD (Create, Read, Update, Delete - via soft-deletion) for cases. Features 8 nested tabs (Overview, Evidence, Entities, Timeline, Graph, Map, AI Summary, Audit Log) to manage all aspects of the investigation.
- **Dependencies**: PostgreSQL (`cases` and `case_assignments` tables), FastAPI Case Routers.
- **Inputs**: Case Title, Description, Type, Severity.
- **Outputs**: Structured Case Objects containing nested relationships.

## 3. OSINT Lab
- **Purpose**: To gather Open Source Intelligence on suspicious artifacts.
- **Functionality**: Triggers automated intelligence gathering scans on targets (IPs, domains, emails, usernames, hashes) to find associated vulnerabilities, reputation scores, or dark web mentions.
- **Dependencies**: osintfootprints (external service on port 5001), Celery (for async waiting).
- **Inputs**: Target string (e.g., `8.8.8.8`) and Target Type (e.g., `IP_ADDRESS`).
- **Outputs**: Formatted intelligence reports, confidence scores, and new discovered entities.

## 4. IPDR Analyzer
- **Purpose**: To parse, normalize, and visualize Internet Protocol Detail Records and Call Data Records.
- **Functionality**: Ingests massive CSV/Excel files from ISPs, normalizes the data, detects suspicious communication patterns (e.g., beaconing), and tracks cell tower geolocation movement.
- **Dependencies**: Celery (parsing), Leaflet (mapping), PostgreSQL (`ipdr_records`), `ipdr_normalizer.py`.
- **Inputs**: `.csv` or `.xlsx` IPDR files.
- **Outputs**: Normalized data tables, geolocation paths on a map, communication frequency charts.

## 5. Ransomware Lab
- **Purpose**: To analyze malware artifacts and map them to known ransomware families.
- **Functionality**: Performs static analysis on Indicators of Compromise (IOCs), maps behaviors to the MITRE ATT&CK kill chain, and queries databases for available decryptors.
- **Dependencies**: `behavior_analytics.py`, `static_analysis.py`, `cape_integration.py` (if configured).
- **Inputs**: Hashes (MD5, SHA1, SHA256), IP addresses, or binary files.
- **Outputs**: Threat scoring, family identification (e.g., LockBit, Ryuk), and kill chain visualizations.

## 6. Evidence Vault
- **Purpose**: Secure, immutable storage for all digital artifacts.
- **Functionality**: Handles drag-and-drop file uploads, automatically generates SHA-256 hashes on the backend, and maintains a strict, cryptographically backed chain of custody log.
- **Dependencies**: MinIO (Object Storage), PostgreSQL (`evidence_items`, `chain_of_custody`), `upload.py`.
- **Inputs**: Binary files of any type (PCAP, E01, JPEG).
- **Outputs**: S3 Object URLs, generated cryptographic hashes, Chain of Custody entries.

## 7. AI-Assisted Reports
- **Purpose**: To alleviate the administrative burden of writing final investigation reports.
- **Functionality**: Utilizes Language Models to ingest case metadata, timeline events, and entity relationships to draft natural-language summaries and suggest next investigative steps. Also handles templated export to PDF/CSV.
- **Dependencies**: LLM API (OpenAI or Local Ollama via Langchain), `ai_analyst.py`.
- **Inputs**: Case UUID, User prompt/template selection.
- **Outputs**: Markdown summaries, downloadable PDF/JSON files.
