# 15 - Future Enhancements

The CIIP module serves as a robust foundation but contains areas requiring implementation to reach production readiness.

## Short-Term Improvements (Next 1-2 Releases)

* **Enforce Authentication:** Replace the mocked frontend authentication with real JWT token parsing and middleware validation linked to the FastAPI backend.
* **Connect Frontend State to Real APIs:** Several UI components still rely on `src/data/mock-data.ts`. These need to be rewired to execute `fetch()` requests to the `app.main` FastAPI routes.
* **Formalize Testing:** Implement Playwright/Cypress for frontend E2E and expand Pytest coverage for the backend schemas.

## Medium/Long-Term Improvements

* **OSINT Footprints Automated Webhooks:** The OSINT python scripts run locally and log to stdout. Long-term, they should be orchestrated via a message queue (e.g., Celery/Redis) with WebSockets pushing results live to the Next.js UI.
* **Global State Management Enforcement:** Transitioning all prop-drilled contextual data to the installed `zustand` store for better performance.
* **Backend PDF Generation:** Offload the client-side HTML report generation (`lib/report-generator.ts`) to a secure backend microservice to enforce digital signatures and strict audit logging.
