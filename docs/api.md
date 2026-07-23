# API Documentation

All API endpoints are prefixed with `/api/v1` (as configured in the FastAPI settings). The API follows RESTful principles and returns JSON responses.

*Note: All endpoints (except `/health` and `/auth/login`) require a valid JWT Access Token passed in the `Authorization: Bearer <token>` header.*

## Authentication

### Authenticate User
- **Method**: `POST`
- **URL**: `/api/auth/login`
- **Description**: Authenticates a user and returns a JWT token.
- **Request Body**:
  ```json
  {
    "email": "user@ciip.gov",
    "password": "secure_password"
  }
  ```
- **Response**: 
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer"
  }
  ```
- **Status Codes**: `200 OK`, `401 Unauthorized`

### Get Current User
- **Method**: `GET`
- **URL**: `/api/auth/me`
- **Description**: Returns the profile of the currently authenticated user based on the JWT.
- **Response**: User object containing ID, email, name, and role.
- **Status Codes**: `200 OK`, `401 Unauthorized`

## Cases

### List Cases
- **Method**: `GET`
- **URL**: `/api/cases`
- **Description**: Retrieves a paginated list of cases the user has access to.
- **Request Parameters**: `skip` (int, default=0), `limit` (int, default=100)
- **Response**: Array of Case objects.
- **Status Codes**: `200 OK`

### Create Case
- **Method**: `POST`
- **URL**: `/api/cases`
- **Description**: Creates a new investigation case.
- **Request Body**:
  ```json
  {
    "title": "Operation Alpha",
    "description": "Ransomware investigation...",
    "severity": "high",
    "case_type": "ransomware"
  }
  ```
- **Response**: The created Case object.
- **Status Codes**: `201 Created`, `422 Validation Error`

### Get Case Details
- **Method**: `GET`
- **URL**: `/api/cases/{id}`
- **Description**: Retrieves full details for a specific case by its UUID.
- **Request Parameters**: `id` (UUID in path)
- **Response**: Detailed Case object including related evidence and timeline events.
- **Status Codes**: `200 OK`, `404 Not Found`

## Evidence & Modules

### Upload Evidence
- **Method**: `POST`
- **URL**: `/api/evidence/upload`
- **Description**: Uploads an evidence file, computes SHA-256 hash, stores it in MinIO, and creates a database record.
- **Request Body**: `multipart/form-data` containing `file` and `case_id`.
- **Response**: 
  ```json
  {
    "evidence_id": "uuid",
    "sha256_hash": "a1b2c3...",
    "status": "processing"
  }
  ```
- **Status Codes**: `202 Accepted`, `413 Payload Too Large`

### OSINT Lookup
- **Method**: `POST`
- **URL**: `/api/osint/lookup`
- **Description**: Triggers a osintfootprints intelligence scan on a specific target.
- **Request Body**:
  ```json
  {
    "target": "192.168.1.1",
    "type": "IP_ADDRESS"
  }
  ```
- **Response**: OSINT results or a scan task ID.
- **Status Codes**: `200 OK`

### Import IPDR
- **Method**: `POST`
- **URL**: `/api/ipdr/import`
- **Description**: Ingests an IP Detail Record file for parsing and analysis.
- **Request Body**: `multipart/form-data` containing the CSV/Excel file.
- **Response**: Import status and record count.
- **Status Codes**: `202 Accepted`

### Scan Ransomware IOCs
- **Method**: `POST`
- **URL**: `/api/ransomware/scan`
- **Description**: Analyzes provided IOCs against known ransomware signatures.
- **Request Body**: Array of IOC strings.
- **Response**: Match results and family identification.
- **Status Codes**: `200 OK`

## System & AI

### System Health Check
- **Method**: `GET`
- **URL**: `/health`
- **Description**: Verifies that the backend API is running.
- **Authentication**: None required.
- **Response**: `{"status": "ok", "service": "CIIP Backend Architecture Active"}`
- **Status Codes**: `200 OK`

### AI Summarize Case
- **Method**: `POST`
- **URL**: `/api/ai/summarize`
- **Description**: Generates an LLM-powered summary of the specified case.
- **Request Body**: `{"case_id": "uuid"}`
- **Response**: Markdown-formatted text summary.
- **Status Codes**: `200 OK`

### Generate Report
- **Method**: `POST`
- **URL**: `/api/reports/generate`
- **Description**: Generates an exportable report (PDF/CSV/JSON) for a case.
- **Request Body**: Case ID and requested format.
- **Response**: File download URL or blob.
- **Status Codes**: `200 OK`
