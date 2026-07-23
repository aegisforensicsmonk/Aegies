# 02 - Module Architecture

## High-Level Architecture
CIIP utilizes a decoupled, modern web application architecture running primarily on Python and Node.js. It features a Next.js frontend serving dynamic React views, communicating over HTTP with a Python FastAPI backend server. Data persistence is managed via a PostgreSQL database, while a specialized Python OSINT tool operates alongside it for intelligence gathering.

### Components Present in Codebase
* **Frontend UI (Next.js):** Handles client-side routing, state management (Zustand), and visualization (Chart.js, Leaflet). It proxies API requests to the backend server.
* **Backend Service (FastAPI):** Exposes RESTful endpoints for case management, telecom data processing, upload handling, and mock analysis simulation.
* **Database (PostgreSQL):** Stores cases, users, chain of custody, and evidence metadata securely using UUIDs and strong relational constraints.
* **OSINT Footprints Module (osintfootprints Fork):** An isolated Python module capable of executing complex web intelligence gathering, correlating data, and managing local scan logs.

## Architecture Diagram

```mermaid
architecture-beta
    group ciip(cloud)[CIIP Ecosystem]
    
    service ui(server)[Frontend Next.js App] in ciip
    service api(server)[FastAPI Backend Service] in ciip
    service osint(server)[OSINT Footprints Tool] in ciip
    service db(database)[PostgreSQL Database] in ciip

    ui --> api
    api --> db
    api --> osint
```
*(Note: Integration between the FastAPI backend and OSINT footprints exists conceptually through external scripts; OSINT also acts as a standalone tool.)*
