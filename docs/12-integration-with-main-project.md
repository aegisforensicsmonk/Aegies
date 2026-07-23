# 12 - Integration with Main Project

The CIIP platform operates as a cohesive stack orchestrated via Docker Compose.

## Container Orchestration
The primary integration point for developers is the `docker-compose.yml` file located at the project root. It seamlessly binds the frontend, backend, database, and OSINT footprinting services together.

### Defined Services (Docker Compose)
* **`frontend`**: Next.js service built from `frontend/Dockerfile`. Runs on port 3000.
* **`backend`**: FastAPI Python service built from `backend/Dockerfile`. Runs on port 8000.
* **`db`**: A PostgreSQL container initialized with scripts mapped from the `database/` directory.

## Network & Proxies
To avoid CORS issues and simplify frontend data fetching, the Next.js `next.config.js` acts as an API Gateway, proxying any `/api/*` requests directly to the `backend` container on port 8000.

## Integration Diagram

```mermaid
architecture-beta
    group compose(cloud)[Docker Compose Network]

    service next(server)[Next.js Frontend :3000] in compose
    service api(server)[FastAPI Backend :8000] in compose
    service pg(database)[PostgreSQL DB :5432] in compose
    service osint(server)[OSINT Module] in compose

    next --> api
    api --> pg
    api --> osint
```
