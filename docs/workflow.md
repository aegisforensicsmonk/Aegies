# Workflow Documentation

This document outlines the end-to-end workflow of a typical cyber investigation within the CIIP platform, illustrating how the various modules and backend services interact.

## 1. Complete Investigation Workflow

The standard lifecycle of an investigation involves Intake, Analysis, Enrichment, and Reporting.

```mermaid
graph TD
    Start((Start Investigation)) --> Login[1. Authenticate (JWT)]
    Login --> CreateCase[2. Create New Case]
    
    CreateCase --> UploadEvidence[3. Upload Evidence]
    UploadEvidence --> HashGen[Backend: SHA-256 Hash Gen]
    HashGen --> Custody[Backend: Init Chain of Custody]
    Custody --> Queue[RabbitMQ: Enqueue Analysis]
    
    Queue --> CeleryWorker[Celery: Parse/Analyze Evidence]
    
    CeleryWorker -- If IPDR --> IPDR_Mod[IPDR Analyzer]
    CeleryWorker -- If Malware --> Ransom_Mod[Ransomware Lab]
    
    IPDR_Mod --> DBUpdate[Update DB Entities]
    Ransom_Mod --> DBUpdate
    
    DBUpdate --> Enrichment[4. Analyst Review & OSINT]
    Enrichment --> osintfootprints[osintfootprints API Scan]
    osintfootprints --> DBUpdate
    
    DBUpdate --> Visualization[5. Visualizations]
    Visualization --> Graph[Neo4j Entity Graph]
    Visualization --> Timeline[Chronological Timeline]
    
    Graph --> AI[6. AI Summarization]
    Timeline --> AI
    
    AI --> ReportGen[7. Generate Final Report]
    ReportGen --> MinIO[Save PDF to MinIO]
    MinIO --> End((Close Case))
```

## 2. Step-by-Step Breakdown

### Step 1 & 2: Authentication & Intake
1. The Investigator authenticates via the Next.js frontend, receiving a JWT from the FastAPI backend.
2. The Investigator navigates to the Dashboard and creates a new Case, assigning a Severity, Type, and Lead Investigator. The PostgreSQL `cases` table is updated.

### Step 3: Evidence Upload & Hashing
1. The user navigates to the Evidence Vault and uploads a disk image or PCAP file.
2. The file is streamed to the backend `/api/evidence/upload` endpoint.
3. The backend calculates the SHA-256 hash on-the-fly and streams the file into **MinIO** object storage.
4. An entry is created in `evidence_items` and the first `chain_of_custody` log is generated.

### Step 4: Background Processing
1. A task is dispatched to **RabbitMQ**.
2. A **Celery Worker** picks up the task, retrieves the file from MinIO, and parses it.
3. If it's an IPDR, `ipdr_normalizer.py` extracts IP addresses and timestamps, writing new nodes to **Neo4j** and entries to PostgreSQL.

### Step 5: Enrichment (OSINT)
1. The Analyst identifies a suspicious IP address in the Graph view.
2. They trigger an OSINT lookup. The backend calls the `ciip-osintfootprints` container's REST API.
3. osintfootprints scans for dark web mentions and threat intel feeds. Results are pushed back to the frontend asynchronously and saved to `osint_results`.

### Step 6: AI Analysis & Reporting
1. Nearing case completion, the Lead Investigator requests an AI Summary.
2. The `ai_analyst.py` service gathers the timeline events, OSINT results, and entity graphs, constructing a prompt for the LLM.
3. The LLM generates a cohesive summary.
4. Finally, the user exports a PDF Report containing the AI summary, the visual charts, and the full Chain of Custody ledger, concluding the investigation workflow.
