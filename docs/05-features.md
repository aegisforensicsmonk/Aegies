# 05 - Features

The CIIP platform implements several distinct investigative features. Features listed are present in the frontend UI routing and supported by backend definitions unless noted otherwise.

## Core Features

### Dashboard Analytics
* **Description:** High-level metrics view detailing active cases, pending analysis, and recent activity.
* **Implementation:** `frontend/src/app/(dashboard)/dashboard/page.tsx`

### Cases Management
* **Description:** Interface to view, filter, and register new FIRs (First Information Reports). Includes AI-assisted narrative analysis for extracting IOCs from text.
* **Implementation:** `frontend/src/app/(dashboard)/cases/page.tsx`, mapped to DB `cases` table.

### Evidence Vault
* **Description:** Centralized secure evidence management with file upload capabilities and metadata display (e.g., SHA-256/MD5 hashing visualization).
* **Implementation:** `frontend/src/app/(dashboard)/evidence/page.tsx`, mapped to DB `evidence_items` and `chain_of_custody` tables.

### OSINT Lab
* **Description:** Interface for running Open Source Intelligence queries.
* **Implementation:** `frontend/src/app/(dashboard)/osint/page.tsx`. *(Note: The frontend currently simulates queries, but integration with the `osintfootprints/` backend Python module is intended)*.

### IPDR Analyzer
* **Description:** Visualizes Internet Protocol Detail Records (Call Detail Records) using heatmaps, connection graphs, and data grids.
* **Implementation:** `frontend/src/app/(dashboard)/ipdr/page.tsx` (using Leaflet and Chart.js).

### Ransomware Lab
* **Description:** Specialized view for analyzing malware outbreaks, tracking specific variants, identifying kill chain stages, and tracking ransom demands.
* **Implementation:** `frontend/src/app/(dashboard)/ransomware/page.tsx`, backend SQL schema `ransomware_migration.sql`.

### Timeline Tracking
* **Description:** Chronological tracking of case actions, evidence acquisitions, and findings.
* **Implementation:** `frontend/src/app/(dashboard)/timeline/page.tsx`.

## Planned / Partially Implemented Features
* **Real-time Backend Integration:** Frontend API calls in many components currently utilize local state or `mock-data.ts`. The FastAPI backend is structurally complete but not deeply linked to all UI state hooks.
* **OSINT Footprints Integration:** The robust `osintfootprints` command-line tool exists in the codebase but lacks a direct automated web-hook interface to the Next.js frontend.
