# Performance & Scalability Documentation

The CIIP platform handles large volumes of forensic data (PCAPs, memory dumps, IPDRs). As such, performance and scalability are fundamental to its architecture.

## 1. Optimization Techniques

- **Asynchronous I/O**: The FastAPI backend utilizes Python's `asyncio` ecosystem natively. It uses `asyncpg` for non-blocking PostgreSQL queries and `aio-pika` for asynchronous RabbitMQ communication. This prevents the server from locking up during slow network or database calls.
- **Background Processing**: Heavy computational tasks (like parsing million-row IPDR files, generating SHA-256 hashes for gigabyte-sized disk images, or waiting for osintfootprints OSINT scans) are offloaded to **Celery Workers**. The API immediately returns a `202 Accepted` status, and the client polls or receives websockets for progress updates.
- **Frontend Rendering**: Next.js 14 leverages React Server Components (RSC) to render non-interactive UI on the server, drastically reducing the JavaScript bundle size sent to the client and improving First Contentful Paint (FCP) metrics.

## 2. Caching

- **Redis Cache**: Redis 7 is deployed as an in-memory data structure store. 
  - It acts as the message broker backend for Celery (storing task results and state).
  - It can be utilized by FastAPI to cache expensive API responses (like complex Neo4j graph queries or dashboard aggregations) to reduce database load.
- **Next.js Caching**: The frontend leverages the Next.js App Router's advanced caching mechanisms to memoize `fetch` requests and statically generate pages where data does not change frequently.

## 3. Database Optimization

- **Indexing**: The PostgreSQL schema (`database/schema.sql`) heavily implements B-Tree indexes on frequently queried columns. For example:
  - `CREATE INDEX idx_evidence_hash ON evidence_items(sha256_hash);` (Speeds up IOC matching)
  - `CREATE INDEX idx_cases_created ON cases(created_at DESC);` (Speeds up dashboard recent activity feeds)
- **JSONB Optimization**: Flexible metadata is stored in `JSONB` columns rather than plain text, allowing for optimized indexing and querying of JSON structures directly within PostgreSQL.
- **Graph Traversal**: Complex relationship queries (e.g., "Find all IP addresses that communicated with a domain registered by this email") are executed in **Neo4j** rather than writing slow, deeply nested `JOIN` statements in PostgreSQL.

## 4. Scalability

- **Horizontal Scaling (Stateless API)**: The FastAPI backend is entirely stateless (sessions are managed via JWTs and Redis). This allows for horizontal scaling by simply adding more backend containers behind a load balancer.
- **Worker Scaling**: Celery workers can be scaled independently of the web API. In a heavy forensics environment, admins can scale workers via Docker Compose: `docker-compose up --scale celery_worker=5 -d`.
- **Object Storage**: By utilizing **MinIO** instead of storing files on the local filesystem or directly in PostgreSQL, the platform can handle petabytes of evidence. MinIO scales horizontally and provides an S3-compatible API, allowing a seamless transition to AWS S3 or GCP Cloud Storage if the platform migrates to the cloud.
