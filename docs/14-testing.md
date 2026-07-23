# 14 - Testing

## Current Testing Posture

* **Frontend:** There is currently no active testing suite (such as Jest or Cypress) configured in the `frontend` module. No tests exist under `frontend/src`.
* **Backend:** A placeholder `tests/` directory exists under `backend/`, and `pytest` logic appears to be intended given the presence of `.pytest_cache`. However, comprehensive integration testing is not yet mature.
* **OSINT Module:** Contains a `test/` directory, reflecting the heritage of the underlying osintfootprints project, validating various OSINT modules and correlation logic.

## How to Run Tests (Where Implemented)

### Backend (Python)
If tests are populated in `backend/tests`:
```bash
cd backend
pytest
```

## Critical Scenarios Required for Future Coverage
* **E2E Testing (Cypress/Playwright):** Required for the Next.js frontend to validate FIR creation, Evidence file upload workflows, and OSINT footprint execution.
* **API Integration Tests (Pytest):** Required to ensure database states (Cases, Evidence Items) change correctly when FastAPI endpoints are hit.
