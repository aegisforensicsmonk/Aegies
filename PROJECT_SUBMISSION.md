# Project Submission: CIIP (Cyber Investigation Intelligence Platform)

## 1. Project Overview
**CIIP** is a professional digital forensics, OSINT, IPDR analysis, ransomware investigation, evidence management, and AI-assisted reporting platform. Designed for authorized law enforcement and investigation personnel, CIIP aims to streamline digital investigations while preserving the integrity and chain of custody for all evidence.

## 2. Core Modules & Features
- **Dashboard & Case Management:** Real-time intelligence overview, active case tracking, and comprehensive case details containing evidence, timelines, graphs, maps, and AI summaries.
- **OSINT Lab:** Open Source Intelligence gathering with lookups for IPs, domains, emails, and hashes, complete with confidence scoring.
- **IPDR Analyzer:** In-depth IP Detail Records analysis featuring pattern detection and communication frequency charts.
- **Ransomware Lab & Evidence Vault:** Ransomware IOC analysis paired with a secure evidence repository that automatically computes SHA-256 hashes and maintains a strict chain of custody.
- **AI-Assisted Reporting:** Automated, template-based report drafting and summarization using an OpenAI-compatible API or Local LLM.

## 3. Technology Stack
The platform employs a robust and scalable modern architecture:
- **Frontend:** Next.js 14+ (TypeScript, Tailwind CSS) with shadcn/ui components, Cytoscape.js for entity graphs, and Leaflet for geolocation.
- **Backend:** FastAPI running on Python 3.12+, providing high-performance RESTful API endpoints.
- **Database:** PostgreSQL 16 serving as the primary datastore with strict constraints and triggers for immutable audit logging.
- **Authentication:** Secure JWT with Role-Based Access Control (Admin, Investigator, Analyst, Supervisor).
- **Deployment:** Containerized deployment using Docker Compose for simplified environment setup and scaling.

## 4. Security & Forensics Standards
Ensuring evidence admissibility and system security is paramount in CIIP:
- **Immutable Evidence:** SHA-256 hashing is enforced upon upload. Evidence is never overwritten (soft delete only), and the chain of custody is meticulously logged.
- **Audit Trails:** Database-level triggers ensure audit logs are immutable and cannot be tampered with, even by application-level errors.
- **Access Control:** Strict role-based permissions and JWT authentication prevent unauthorized access to sensitive investigation data.
- **Data Safety:** AI outputs are marked strictly as advisory, and comprehensive input validation is applied across all endpoints to prevent injection attacks.

## 5. Getting Started
The project can be effortlessly launched using Docker:
```bash
docker-compose up -d
```
- **Frontend UI:** `http://localhost:3000`
- **Backend API Docs:** `http://localhost:8000/docs`
