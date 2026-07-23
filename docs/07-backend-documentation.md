# 07 - Backend Documentation

The backend service is built with Python and FastAPI, designed to process requests from the Next.js frontend. It lives under `backend/app`.

## Core Structure
* **`api/v1/`**: Defines router modules for logical separation of concerns.
* **`models/`**: (If using ORM) Python class mappings.
* **`schemas/`**: Pydantic models utilized to validate incoming payloads and structure outgoing JSON.

## Key APIs & Modules

*(Note: The following modules are documented based on the `backend/app/api` and `backend/app/models` file structure found in the codebase. Actual API mounting might be minimal if fully relying on the mock server).*

### `cases.py`
* **Purpose:** Manage FIR and Case lifecycle.
* **Key Operations:** Creating cases, updating severity, fetching case details, and assigning investigators.

### `upload.py` / `evidence.py`
* **Purpose:** Securely handle binary streams and large file uploads for digital evidence.
* **Validations:** File type checking, size limitations, and hash generation (SHA-256).

### `ipdr.py` & `telecom.py`
* **Purpose:** Parse and ingest telecommunications records (CSV/JSON formats) for Call Detail Records.
* **Validations:** Schema mapping for cell tower locations and timestamp sequences.

### `analysis.py`
* **Purpose:** Central processing for triggering OSINT jobs or AI narrative generation.

## Backend Startup
The application is generally instantiated via `main.py` using Uvicorn:
`uvicorn app.main:app --host 0.0.0.0 --port 8000`
