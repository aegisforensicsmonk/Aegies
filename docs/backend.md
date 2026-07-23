# Backend Documentation

## 1. Server Architecture

The CIIP backend is built using **FastAPI** (Python 3.12+), chosen for its high performance, native asynchronous support, and automatic OpenAPI documentation generation. 

The architecture strictly follows a separation of concerns pattern:
- **Routers/Controllers**: Handle HTTP requests, input validation (via Pydantic), and response formatting.
- **Service Layer**: Contains the core business logic, orchestrating calls to the database, external APIs, and background task queues.
- **Data Access Layer (DAL)**: Manages database interactions using SQLAlchemy and asyncpg.

## 2. Routes & Controllers

The API routes are located in `app/api/v1/endpoints/`. Key route modules include:
- **`upload.py`**: Handles evidence ingestion. Validates file types, initiates MinIO uploads, and computes SHA-256 hashes.
- **`ipdr.py`**: Manages the uploading, parsing, and querying of IP Detail Records (IPDR) and Call Data Records (CDR).
- **`osint.py`**: Exposes endpoints to trigger osintfootprints scans and retrieve intelligence on IPs, domains, and hashes.
- **`telemetry.py`**: Endpoints for collecting and analyzing behavioral telemetry from endpoints (used in Ransomware/Malware analysis).

*Note: For a full list of endpoints, refer to `api.md` or the Swagger UI at `/docs`.*

## 3. Services (Business Logic)

The `app/services/` directory contains the heavy lifting of the application. Notable services include:
- **`ai_analyst.py`**: Integrates with LLMs to generate automated case summaries and investigative suggestions.
- **`behavior_analytics.py` & `scoring.py`**: Analyzes telemetry data to identify suspicious patterns and assign threat scores.
- **`ipdr_normalizer.py`**: Parses heterogeneous CSV/Excel formats of IPDRs from various ISPs into a standard, queryable format.
- **`osint.py` (Service)**: Manages the asynchronous communication with the local osintfootprints instance via its REST API.
- **`pipeline.py` & `queue.py`**: Orchestrates Celery tasks for background processing (e.g., long-running graph traversals or large file hashing).
- **`static_analysis.py` & `cape_integration.py`**: Used in the Ransomware lab for static binary analysis and integration with external sandboxes like CAPE.
- **`storage.py`**: Abstracts the interactions with MinIO (S3-compatible storage) for uploading and retrieving evidence files.

## 4. Middleware

The FastAPI application (`app/main.py`) utilizes middleware to handle cross-cutting concerns:
- **CORS Middleware**: Configured to allow cross-origin requests from the Next.js frontend (typically running on a different port or domain during development).
- **Error Handling Middleware**: Catches unhandled exceptions and formats them into standardized JSON error responses, preventing stack trace leakage.

## 5. Authentication

Authentication is implemented using **JWT (JSON Web Tokens)**:
1. The user submits credentials to the `/api/auth/login` endpoint.
2. The backend verifies the password hash against the PostgreSQL database.
3. If valid, a short-lived Access Token (JWT) is returned containing the user's ID and Role.
4. Subsequent requests to protected routes must include the token in the `Authorization: Bearer <token>` header.
5. FastAPI dependencies (e.g., `get_current_user`, `get_current_active_admin`) enforce Role-Based Access Control (RBAC) at the route level.
