# Deployment Documentation

The CIIP platform is designed to be deployed using Docker and Docker Compose, ensuring a consistent and reproducible environment across development, staging, and production.

## 1. Environment Setup

### Prerequisites
- **Host System**: Linux (Ubuntu 22.04 LTS recommended) or a virtual machine.
- **Docker**: Engine version 24.0+
- **Docker Compose**: Plugin version v2.20+
- **Hardware Minimums**: 4 CPU Cores, 16GB RAM, 100GB SSD (Elasticsearch and Neo4j are resource-intensive).

## 2. Docker & Services Architecture

The platform relies on `docker-compose.yml` to orchestrate multiple interconnected containers on a single host network:
- `ciip-db` (PostgreSQL 16)
- `ciip-redis` (Redis 7)
- `ciip-rabbitmq` (RabbitMQ 3)
- `ciip-minio` (MinIO Object Storage)
- `ciip-elasticsearch` (Elasticsearch 8)
- `ciip-neo4j` (Neo4j 5 Graph DB)
- `ciip-backend` (FastAPI Server)
- `ciip-celery-worker` (Background Job Processor)
- `ciip-frontend` (Next.js/Vite Client)
- `ciip-osintfootprints` (OSINT Lab)

## 3. Environment Variables

Environment variables are passed into the containers via the docker-compose file or an `.env` file. Key variables include:

### Backend Variables
- `DATABASE_URL`: Connection string for PostgreSQL (e.g., `postgresql+asyncpg://user:pass@db:5432/ciip_db`)
- `REDIS_URL`: Connection string for Redis cache.
- `RABBITMQ_URL` & `CELERY_BROKER_URL`: Connection strings for the message queue.
- `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`: Object storage credentials.
- `ELASTICSEARCH_URL`, `NEO4J_URL`, `NEO4J_USER`, `NEO4J_PASSWORD`: Data layer connections.
- `SECRET_KEY`: **CRITICAL** - A long, random string used for signing JWT tokens. Must be changed in production.

### Frontend Variables
- `NEXT_PUBLIC_API_URL`: The URL where the frontend will send API requests (e.g., `http://localhost:8000` or the production domain).

## 4. Build & Deployment Steps

1. **Clone the Repository**:
   ```bash
   git clone <repository_url> ciip
   cd ciip
   ```

2. **Configure Environment**:
   - Review and update passwords and the `SECRET_KEY` in `docker-compose.yml` or create an `.env` file to override them.

3. **Build and Launch**:
   Execute the following command to build the custom images (Frontend, Backend, Celery, osintfootprints) and pull the standard images (Postgres, Redis, etc.), then start them in the background.
   ```bash
   docker-compose up --build -d
   ```

4. **Database Initialization**:
   The PostgreSQL container is configured to automatically run `/database/schema.sql` and `/database/seed.sql` on its first boot via volume mapping to `/docker-entrypoint-initdb.d/`.

5. **Verify Deployment**:
   - Check container status: `docker-compose ps`
   - Access the Frontend: `http://<host-ip>:3000`
   - Access the API Docs: `http://<host-ip>:8000/docs`
   - Access RabbitMQ Admin: `http://<host-ip>:15672`
   - Access MinIO Console: `http://<host-ip>:9001`

## 5. Persistent Storage

Docker Volumes are defined in the compose file to ensure that stateful data persists across container restarts or image updates:
- `postgres_data`
- `redis_data`
- `rabbitmq_data`
- `minio_data`
- `elasticsearch_data`
- `neo4j_data`
