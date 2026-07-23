# 13 - Installation and Configuration

The CIIP platform can be run either locally for development or orchestrated via Docker Compose.

## Prerequisites
* Node.js v20+
* Python 3.10+
* Docker & Docker Compose (for orchestrated setup)

## Running the Entire Stack via Docker
The easiest way to stand up the CIIP environment is using the root `docker-compose.yml`.

1. **Start the stack:**
   ```bash
   docker-compose up --build
   ```
   *(This brings up the PostgreSQL database, FastAPI backend on port 8000, and Next.js frontend on port 3000).*

## Running Locally for Development

### Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # Or venv\Scripts\activate on Windows
   ```
3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Uvicorn server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Configuration (Environment Variables)
* **Frontend:** `.env.local` contains variables for the Next.js app.
* **Backend:** `.env` located in the `backend/` directory handles database credentials and secret keys.
