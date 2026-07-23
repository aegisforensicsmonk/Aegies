# 11 - Report Generation

CIIP implements a dynamic, client-side report generation mechanism to export findings from the AI Sandbox and OSINT labs.

## Current Implementation

* **Mechanism:** Report generation is currently handled in the frontend via `frontend/src/lib/report-generator.ts`.
* **Flow:** 
  1. The user initiates a report generation from an analysis component (e.g., `ReportGenerator.tsx`).
  2. The utility constructs an HTML blob containing the AEGIS branding, AI confidence scores, and raw findings injected dynamically.
  3. The browser generates a downloadable URL `ObjectURL` triggering a direct file download.
* **Output Format:** Downloadable `.html` (with a stubbed concept for PDF rendering).

## Report Types Present
1. **Sandbox Analysis Report:** Generates a summary of malware analysis, displaying threat levels, file hashes, and behavioral narratives (Safe, Suspicious, Malicious).
2. **OSINT Footprint Summary:** (Conceptually triggered via the OSINT lab view to export query results).

## Planned Implementations
* **Backend PDF Generation:** Offloading report generation to a FastAPI background worker (e.g., using Celery or background tasks) to generate strict, immutable PDF documents with digital signatures.
* **Scheduled Exports:** Planned feature to email weekly case summary exports to supervisors.
