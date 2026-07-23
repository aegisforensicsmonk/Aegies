# Frontend Documentation

## 1. Overview
The frontend of the CIIP platform is a modern, responsive web application built with **Next.js 14+** using the App Router (`src/app`), **TypeScript**, and **Tailwind CSS**. It is designed to visualize complex cyber forensics data securely and efficiently.

## 2. Pages & Routing

The application uses the Next.js file-system based App Router. All major routes are nested within the `(dashboard)` route group, which likely applies a common authenticated layout.

### Main Routes
- **`/` (Dashboard)**: The central hub showing real-time investigation intelligence overviews, KPIs, and recent activity.
- **`/admin`**: User management, system configuration, and audit logs.
- **`/analysis-history`**: A record of past automated and manual analyses.
- **`/cases`**: End-to-end case tracking and management.
- **`/evidence`**: The Evidence Vault for managing uploaded forensic artifacts.
- **`/ipdr`**: IP Detail Record analysis and visualization.
- **`/osint`**: Open Source Intelligence gathering tools.
- **`/ransomware`**: Ransomware IOC analysis and kill chain visualization.
- **`/reports`**: Generation and export of case reports.
- **`/timeline`**: Chronological visualization of investigation events.
- **`/upload`**: Interface for secure evidence ingestion.

## 3. Components

UI components are organized in `src/components`, primarily segmented by feature area:
- **`layout/`**: Global layout components (Sidebars, Navbars, Headers).
- **`analysis/`**: Reusable components for displaying complex forensics data (e.g., Cytoscape.js graphs for relationships, Leaflet for maps).
- **`upload/`**: Components handling secure file uploads, drag-and-drop interfaces, and SHA-256 hash generation progress.
- **shadcn/ui style components**: The `package.json` references libraries like `class-variance-authority`, `clsx`, and `tailwind-merge`, indicating a pattern of reusable, accessible Radix/shadcn-style UI components.

## 4. State Management

- **Global State**: Managed using **Zustand** (`zustand` in package dependencies), providing a lightweight and fast approach to manage cross-component state such as active case context, user sessions, or global UI toggles.
- **Server State / API Caching**: Next.js 14's built-in `fetch` caching and Server Components are heavily utilized. 
- **Local State**: Standard React hooks (`useState`, `useReducer`) manage form states, modal visibility, and complex client-side interactions in interactive views like the Graph and Map tabs.

## 5. Forms

Forms are styled using `@tailwindcss/forms` plugin to ensure consistency. 
Data input spans several critical areas:
- **Evidence Upload Forms**: Capture metadata and files.
- **OSINT Queries**: Input fields for IPs, domains, emails, hashes.
- **Report Generation**: Selection of templates, AI prompts, and export formats.

## 6. UI Flow

```mermaid
graph TD
    Login[Login Page] --> Auth{Authenticated?}
    Auth -- Yes --> Layout[Main Layout (Sidebar + Header)]
    Auth -- No --> Login
    
    Layout --> Dashboard
    Layout --> Cases[Cases List]
    
    Cases --> CaseDetail[Case Detail View]
    CaseDetail --> OverviewTab[Overview]
    CaseDetail --> EvidenceTab[Evidence]
    CaseDetail --> GraphTab[Entity Graph]
    CaseDetail --> MapTab[Geospatial Map]
    CaseDetail --> AITab[AI Summary]
    
    Layout --> OSINT[OSINT Lab]
    Layout --> Ransomware[Ransomware Lab]
    Layout --> IPDR[IPDR Analyzer]
    Layout --> Reports[Report Generator]
```

## 7. API Integration

API calls are directed to the FastAPI backend (running on `:8000`), configured via the `NEXT_PUBLIC_API_URL` environment variable.
Client-side fetching often uses standard `fetch` wrappers or custom hooks that automatically attach JWT authorization headers obtained during the login flow. Real-time feedback, such as file upload progress or OSINT scan status, is managed asynchronously with loading states and error toasts (handled by `react-hot-toast`).
