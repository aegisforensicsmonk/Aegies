# Project Documentation

## 1. Project Overview

### Project Name
CIIP — Cyber Investigation Intelligence Platform

### Description
CIIP is a professional full-stack platform designed for digital forensics, Open Source Intelligence (OSINT) gathering, IP Detail Record (IPDR) analysis, ransomware investigation, evidence management, and AI-assisted reporting.

### Purpose
The purpose of CIIP is to provide a comprehensive, secure, and centralized environment for investigators to manage cases, analyze digital evidence, visualize entity relationships, and generate actionable intelligence reports, leveraging both traditional forensics and AI-assisted insights.

### Objectives
- Centralize digital forensics and case management workflows.
- Provide real-time intelligence gathering and OSINT lookups.
- Enable complex data visualization (graphs, maps, charts) for IPDR and entity analysis.
- Ensure strict chain of custody and data integrity for all uploaded evidence.
- Streamline the reporting process through AI summarization and template-based exports.

### Key Features
- **Dashboard**: Real-time investigation intelligence overview with KPIs, activity feeds, and threat indicators.
- **Case Management**: End-to-end case tracking with tabs for Overview, Evidence, Entities, Timeline, Graphs, Maps, and AI Summaries.
- **OSINT Lab**: Open Source Intelligence gathering supporting IP, domain, email, username, and hash lookups.
- **IPDR Analyzer**: Pattern detection, suspicious activity highlighting, and movement tracking from IP and Call Data Records.
- **Ransomware Lab**: IOC analysis, kill chain visualization, and family identification.
- **Evidence Vault**: Secure repository with automatic SHA-256 hashing, chain of custody tracking, and immutable audit logging.
- **AI-Assisted Reporting**: Automated case summaries, next step suggestions, and report generation in multiple formats (PDF, CSV, JSON).
- **Admin & Role-Based Access Control (RBAC)**: Fine-grained permissions for Admins, Investigators, Analysts, and Supervisors.

### Target Users
The platform is designed exclusively for authorized law enforcement, digital forensics experts, and professional investigation personnel.

### Project Scope
The scope includes the frontend Next.js web application, a FastAPI backend, a PostgreSQL database for persistent storage of case data, integration with external tools (osintfootprints for OSINT), and deployment orchestration using Docker Compose. It covers the full lifecycle of a digital investigation from evidence intake to final report generation.
