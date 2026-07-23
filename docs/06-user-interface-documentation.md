# 06 - User Interface Documentation

The CIIP Frontend utilizes Next.js App Router. The UI is secured behind a layout that ensures the `TopBar` and `Sidebar` persist across the authenticated workspace.

## Layout Components
* **`Sidebar.tsx`**: Collapsible left-hand navigation linking to specific labs.
* **`TopBar.tsx`**: Header containing global search, user context, and a notifications dropdown.

## Main Pages & Routes

### Login Screen
* **Route:** `/`
* **Purpose:** Initial entry point simulating user authentication.
* **Actions:** Accept email and password to grant access to the dashboard.

### Dashboard Overview
* **Route:** `/dashboard`
* **Purpose:** Quick glance at active metrics.
* **Key Components:** Stat cards, Recent Alerts list.

### Cases Workspace
* **Route:** `/cases`
* **Purpose:** Grid/list view of all registered FIRs.
* **Actions:** Clicking "New Case" opens a modal to register a new FIR. The form allows narrative input which includes a mock "AI Intelligence" generation button.

### IPDR Analyzer
* **Route:** `/ipdr`
* **Purpose:** Upload and analyze CSV logs of telecommunications data.
* **Key Components:** 
  * `Map` (Leaflet) for cell tower locations.
  * Tabular display for raw records.

### Evidence Vault
* **Route:** `/evidence`
* **Purpose:** Track digital artifacts (memory dumps, images).
* **Key Components:** `SecureUpload` modal. Displays chain of custody history and hash verification status.

### Ransomware Lab
* **Route:** `/ransomware`
* **Purpose:** Malware analysis interface.
* **Key Components:** `MitreMatrix` (displays TTPs visually), `ProcessTree` (hierarchical process rendering).

### OSINT Lab
* **Route:** `/osint`
* **Purpose:** Execute intelligence footprinting.
* **Actions:** Search input for IPs, emails, or domains generating a simulated comprehensive footprint report.

## Navigation Flow

```mermaid
flowchart LR
    Login[Login /] --> Dashboard[/dashboard]
    Dashboard --> Cases[/cases]
    Dashboard --> IPDR[/ipdr]
    Dashboard --> OSINT[/osint]
    Dashboard --> Vault[/evidence]
    Dashboard --> Ransomware[/ransomware]
```
