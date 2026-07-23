# 01 - Module Overview

## Overview
The CIIP (Cyber Investigation Intelligence Platform) is an advanced digital forensics and incident response platform designed to streamline the workflow of cybersecurity analysts and investigators. Its primary business goal is to aggregate, analyze, and visualize forensic evidence and threat intelligence across incidents (such as ransomware, insider threats, and malware outbreaks) in a centralized, AI-assisted dashboard.

## Key Users
* **Investigators:** Track cases, manage digital evidence securely, and generate comprehensive incident reports.
* **Analysts:** Perform detailed analysis on IPDR data, OSINT footprints, and malware behaviors using dedicated lab workspaces.
* **Supervisors:** Oversee case progression, monitor active threats, and generate intelligence briefs.

## High-Level Scope
The CIIP module acts as a monolithic multi-service application encompassing:
1. **Frontend Web UI:** A Next.js (React) single-page application for interacting with cases, evidence, and analytical tools.
2. **Backend API:** A Python FastAPI service handling business logic, authentication schemas, and data operations.
3. **OSINT Footprinting:** A Python-based integration tool (osintfootprints fork) for gathering Open Source Intelligence.
4. **Relational Data Storage:** A PostgreSQL database persisting all case tracking, entity relationships, and evidence hashes.

## Existing Entry Points
* **Web User Interface:** Accessed via Next.js at `http://localhost:3000` (e.g., `/dashboard`, `/cases`, `/evidence`).
* **Backend API Server:** Fast API routes accessible natively on `http://localhost:8000/api/v1/`.
* **OSINT CLI/Web UI:** Direct access to osintfootprints footprints via `osintfootprints-local-server.cmd` or Python CLI `python sfcli.py`.
