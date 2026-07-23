# Testing Documentation

Based on a thorough analysis of the current CIIP repository configuration (including `package.json`, `requirements.txt`, and the folder structure), formal automated testing frameworks have not yet been implemented in the main repository branches.

> [!WARNING]
> Testing frameworks are currently absent from the production build configurations. The following details reflect the current state and outline what is required for future implementations.

## 1. Unit Testing

Currently, there are no `tests/` directories or unit test files (e.g., `*.test.ts`, `test_*.py`) in the codebase. 
- **Backend**: `pytest` is not present in `requirements.txt`.
- **Frontend**: `jest` or `@testing-library/react` are not present in `package.json`.

*Implementation Path*: 
- Python: Introduce `pytest` and `httpx` to mock backend services.
- TypeScript: Introduce `Jest` or `Vitest` for testing individual React components.

## 2. Integration Testing

The platform relies on several complex integrations (PostgreSQL, Neo4j, Elasticsearch, MinIO, RabbitMQ, osintfootprints).
Currently, integration testing is handled manually during the deployment phase via Docker Compose (using the `mock_server.py` and `demo_ipdr.py` scripts for local manual testing).

*Implementation Path*:
- Utilize `Testcontainers` (Python) to spin up ephemeral Docker instances of Redis, Postgres, and MinIO during CI/CD pipelines to run automated integration scripts.

## 3. API Testing

The FastAPI backend automatically generates OpenAPI documentation at `/docs`. 
Currently, API testing is performed manually using this Swagger UI interface.

*Implementation Path*:
- Implement Postman collections or Newman CLI scripts for automated endpoint verification.
- Write FastAPI `TestClient` scripts to programmatically verify endpoint status codes, authentication rejection, and data serialization.

## 4. End-to-End Testing

There are no E2E testing frameworks (like Cypress, Playwright, or Selenium) configured in the frontend repository.

*Implementation Path*:
- Introduce `Playwright` to simulate full user journeys: Logging in, uploading a PCAP file, triggering an OSINT scan, and verifying the graph updates on the case dashboard.
