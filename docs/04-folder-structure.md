# 04 - Folder Structure

The `ciip` root directory is organized into distinct domain-specific services and modules.

## Root Directories

### `frontend/`
The Next.js 14 web application providing the UI for the platform.
* `src/app/`: Next.js App Router views, organized into logical labs (e.g., `/cases`, `/ipdr`, `/osint`).
* `src/components/`: Reusable React components for visualizations and layout.
* `src/data/`: Mock data definitions used extensively for the UI prototype.
* `src/lib/`: Client-side utilities and report generation logic.
* `src/types/`: TypeScript definitions strictly matching backend database models.

### `backend/`
The FastAPI application serving as the backend core.
* `app/api/v1/`: API route definitions (e.g., `/cases`, `/upload`, `/analysis`).
* `app/models/`: Internal data structures mapped for backend business logic.
* `app/schemas/`: Pydantic models for request/response validation.
* `app/services/`: Core logic and integration handlers.

### `database/`
Contains raw SQL scripts defining the PostgreSQL relational structure.
* `schema.sql`: Full DDL defining users, cases, evidence, IOCs, and chain of custody.
* `seed.sql`: Dummy data to populate an empty database for development.
* `ransomware_migration.sql`: Dedicated tables and structures for ransomware tracking.

### `osintfootprints/`
A Python-based Open Source Intelligence module (a customized osintfootprints variant).
* `sf.py`, `sfcli.py`, `sfwebui.py`: Core CLI and Web UI entry points for footprinting.
* `modules/`: Collection of OSINT integration scripts.
* `correlations/`: Logic for linking distinct intelligence pieces.

### Miscellaneous
* `docs/`: (This directory) Contains Markdown documentation.
* `docker-compose.yml`: Docker orchestration definitions for bringing up the entire stack seamlessly.
