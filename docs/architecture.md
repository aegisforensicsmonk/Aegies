# System Architecture

## 1. High-Level Architecture

The CIIP platform is designed as a modern, decoupled web application featuring a frontend client, a backend API server, and a robust suite of data storage and processing services. 

```mermaid
graph TD
    Client[Web Browser / User]
    Frontend[Frontend - Next.js/Vite]
    Backend[Backend - FastAPI]
    
    DB[(PostgreSQL)]
    Redis[(Redis Cache)]
    MQ[(RabbitMQ)]
    Celery[Celery Workers]
    MinIO[(MinIO Object Storage)]
    ES[(Elasticsearch)]
    Neo4j[(Neo4j Graph DB)]
    osintfootprints[osintfootprints OSINT]

    Client <-->|HTTP/HTTPS| Frontend
    Frontend <-->|REST API| Backend
    
    Backend <-->|SQLAlchemy/asyncpg| DB
    Backend <-->|Redis Protocol| Redis
    Backend <-->|AMQP| MQ
    Backend <-->|S3 API| MinIO
    Backend <-->|REST API| ES
    Backend <-->|Bolt Protocol| Neo4j
    Backend <-->|REST API| osintfootprints
    
    MQ -->|Tasks| Celery
    Celery <-->|State/Results| Redis
    Celery <-->|DB Access| DB
```

## 2. Component Architecture

### Frontend Components (Port 3000 / 7860)
The codebase includes two separate frontend implementations:
- **Next.js 14 Frontend** (located in `/frontend`): Running on **Port 3000** locally (`start.bat`) or **Port 7860** in production/Hugging Face (`start.sh`). Written in TypeScript and styled with Tailwind CSS.
- **Vite React Frontend** (located in `/frontend-vite`): Running on **Port 3000** via Docker Compose (`docker-compose.yml`). Built with React 19, Vite 8, Tailwind CSS, and TypeScript.
- **Key UI Packages**: Uses shadcn/ui components, Cytoscape.js for entity relationship visualization, and Leaflet for geographical mapping.

### Backend Component (Port 8000)
- **Framework**: FastAPI
- **Language**: Python 3.12+
- **Purpose**: Handles all core business logic, API requests, authentication, and orchestrates interactions between data stores.

### Background Processing
- **Queue**: RabbitMQ (Port 5672)
- **Workers**: Celery
- **Purpose**: Handles asynchronous and long-running tasks such as OSINT lookups, data ingestion, and report generation without blocking the main API thread.

### Data Storage Layer
- **Relational DB**: PostgreSQL 16 (Port 5432) for structured data (Users, Cases, Evidences, Audit Logs).
- **Cache**: Redis 7 (Port 6379) for caching and Celery results.
- **Object Storage**: MinIO (Port 9000) for storing large evidence files and generated reports in an S3-compatible manner.
- **Search Engine**: Elasticsearch 8 (Port 9200) for full-text search capabilities across cases and evidence.
- **Graph DB**: Neo4j 5 (Port 7474/7687) for complex entity relationship mapping and traversal.

### Specialized Services
- **OSINT Lab**: osintfootprints (Port 5001) for performing open-source intelligence gathering.

## 3. Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Postgres
    participant RabbitMQ
    participant Celery
    participant MinIO
    
    User->>Frontend: Upload Evidence (e.g. PCAP file)
    Frontend->>Backend: POST /api/evidence/upload (File chunk)
    Backend->>MinIO: Save File Object
    MinIO-->>Backend: OK (Object URL)
    Backend->>Postgres: Create Evidence Record with SHA-256 & Chain of Custody
    Postgres-->>Backend: Record Created
    Backend->>RabbitMQ: Enqueue Analysis Task (e.g. IPDR parsing)
    Backend-->>Frontend: 202 Accepted (Processing)
    
    RabbitMQ->>Celery: Deliver Task
    Celery->>MinIO: Fetch File for Analysis
    Celery->>Celery: Process Data / Extract Entities
    Celery->>Postgres: Update Evidence Status & Add Entities
    Celery->>RabbitMQ: Send Completion Event
```

## 4. Request/Response Flow

A typical API request follows a standard middleware pipeline in FastAPI:

```mermaid
graph LR
    Request[Incoming HTTP Request] --> CORS[CORS Middleware]
    CORS --> Auth[Auth Middleware / Dependency]
    Auth --> Router[API Router]
    Router --> Controller[Controller Logic]
    Controller --> Service[Service Layer]
    Service --> DAL[Data Access Layer]
    DAL --> DB[(Database)]
    
    DB --> DAL
    DAL --> Service
    Service --> Controller
    Controller --> Router
    Router --> Response[HTTP Response]
```

## 5. Deployment Architecture

The application is deployed using Docker Compose, encapsulating all services within isolated containers on a single host machine or virtual machine.

```mermaid
graph TD
    subgraph Docker Host
        subgraph ciip-network [Docker Bridge Network]
            FE(ciip-frontend)
            BE(ciip-backend)
            CeleryWorker(ciip-celery-worker)
            DB(ciip-db)
            Cache(ciip-redis)
            Queue(ciip-rabbitmq)
            Storage(ciip-minio)
            Search(ciip-elasticsearch)
            Graph(ciip-neo4j)
            OSINT(ciip-osintfootprints)
        end
    end
    
    Internet -->|Port 3000| FE
    Internet -->|Port 8000| BE
    Admin -->|Port 15672| Queue
    Admin -->|Port 9001| Storage
```

### Key Deployment Characteristics:
- All services communicate via a shared internal Docker network.
- Environment variables are heavily utilized to inject configuration (e.g., `DATABASE_URL`, `MINIO_ACCESS_KEY`).
- Volumes are mapped for persistent storage for all stateful services (Postgres, Redis, MinIO, etc.) to ensure data survives container restarts.
