# CIIP (Cyber Intelligence and Investigation Platform)

A comprehensive, all-in-one digital forensics platform designed for law enforcement and authorized investigators.

## 🚀 Quick Overview

*   **Practical (What it does):** Combines OSINT (public data gathering), IPDR (suspect tracking), and Ransomware analysis into one dashboard. It uses AI to write reports automatically and securely hashes all evidence to maintain a legal chain of custody. 
*   **Technical (How it's built):** Built with a modern **Next.js/React** frontend and a fast **Python FastAPI** backend. Data is secured in a **PostgreSQL** database with tamper-proof audit trails, and the whole system is easily deployed anywhere using **Docker**.

## Features

* **Dashboard**: Overview of current operations and metrics.
* **Cases**: Manage investigation cases.
* **Analysis History**: Track past analyses.
* **Evidence**: Manage evidence and artifacts.
* **IPDR Analysis**: Analyze IP Detail Records.
* **OSINT Lab**: Open Source Intelligence tools (powered by osintfootprints).
* **Ransomware**: Track and analyze ransomware threats.
* **Reports**: Generate and manage investigation reports.
* **Timeline**: Visual timeline of events.

## 🏗️ System Architecture

The platform follows a robust **3-tier architecture**:

### 1. Client Layer (The User Interface)
This is what the investigator or admin interacts with. It consists of modern web applications built with **React and Next.js** (using Tailwind and Shadcn for styling). It sends requests (via HTTP/REST APIs) down to the application layer.

### 2. Application API Layer (The Brain)
This layer processes all the logic and handles communication between the user and the databases. 
*   **Core:** A high-performance **Python FastAPI Backend** acts as the central hub.
*   **Modules:** It connects to specialized tools like the **SpiderFoot OSINT Lab** (for gathering public intelligence) and the **IPDR/CDR Analyzer** (for tracking cell tower and phone record patterns).
*   It also manages user authentication, report generation, and queues up heavy background tasks via **AMQP**.

### 3. Infrastructure & Storage Layer (The Engine Room)
This is where all data, files, and background processes are securely stored and managed. It uses a highly scalable mix of technologies:
*   **PostgreSQL 16:** The primary database for structured data.
*   **Neo4j Graph DB:** Used for mapping complex relationships (like connections between suspects or IPs).
*   **Elasticsearch 8:** Powers lightning-fast search capabilities across massive datasets.
*   **MinIO Object Storage:** A secure vault for storing large files and evidence (similar to AWS S3).
*   **Redis & RabbitMQ:** Used for caching data to speed up the app and managing queues for heavy background tasks.

## Getting Started

1. Clone the repository.
2.after open terminal use this command :  .\start.bat
3. it will start 
