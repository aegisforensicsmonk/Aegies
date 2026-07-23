# 10 - Security

The security posture of the CIIP module currently reflects a development/prototype state.

## Implemented Security Features

* **Database RBAC Definitions:** The PostgreSQL schema natively defines `roles` and `users` tables, linking them through `user_roles`. Roles have a `permissions` JSONB column.
* **Schema Validation:** The FastAPI backend utilizes Pydantic for strong input validation and type checking on incoming payloads, mitigating injection vectors at the application layer.
* **Database Constraints:** Strong referential integrity (foreign keys) prevents orphaned records across cases and evidence. `ON DELETE CASCADE` is explicitly defined for role mappings.

## Frontend Security (Mocked)
* **Authentication Gate:** The `page.tsx` login screen currently mocks the authentication flow. While it visually restricts access to the `(dashboard)` route group, no JWT or session cookie verification is strictly enforced in the current Next.js middleware implementation.

## Areas Planned for Improvement
* **Authentication/Authorization:** Implementing a robust OAuth2 / JWT strategy between the Next.js frontend and FastAPI backend is required.
* **OSINT Security:** The `osintfootprints` tool lacks explicit UI authentication when run standalone; it requires network-level access control.
* **Input Sanitization:** While Pydantic handles type safety, explicit sanitization of narrative fields (XSS prevention) before rendering in the React frontend should be hardened.
