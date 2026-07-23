@echo off
echo ==================================================
echo Starting CIIP - Cyber Investigation Intelligence Platform
echo ==================================================

echo.
echo [1/3] Starting Backend API Server (Port 8000)...
start "CIIP Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo [2/3] Starting Frontend Dashboard (Port 3000)...
start "CIIP Frontend" cmd /k "cd frontend && npm run dev"

echo [3/3] Starting OSINT Lab Server (Port 5001)...
start "OSINT Lab" cmd /k "cd osintfootprints && venv\Scripts\activate && python sf.py -l 127.0.0.1:5001"

echo.
echo All services have been launched in separate windows!
echo - Dashboard: http://localhost:3000
echo - API Docs: http://localhost:8000/docs
echo - OSINT Lab: http://localhost:5001
echo.
pause
