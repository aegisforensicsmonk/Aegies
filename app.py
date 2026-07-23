import os
import sys
import time
import subprocess

print("==================================================")
print("Starting CIIP on Hugging Face Spaces (Gradio SDK)...")
print("==================================================")

# Set environment variables
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:////tmp/ciip.db"
os.environ["REDIS_URL"] = "redis://localhost:6379/0"
os.environ["CELERY_BROKER_URL"] = "redis://localhost:6379/1"
os.environ["CELERY_RESULT_BACKEND"] = "redis://localhost:6379/1"
os.environ["SECRET_KEY"] = "ciip-production-secret-change-me"
os.environ["NEXT_PUBLIC_API_URL"] = "http://localhost:8000"

# 1. Start Redis Server
print("Launching Redis Server...")
try:
    subprocess.Popen(["redis-server", "--port", "6379", "--daemonize", "yes"])
    time.sleep(2)
except Exception as e:
    print(f"Warning: Failed to start Redis daemon: {e}. Attempting standard launch...")
    subprocess.Popen(["redis-server", "--port", "6379"])
    time.sleep(2)

# 2. Run Database Initializations
print("Initializing SQLite Database Schema...")
subprocess.run([sys.executable, "-m", "app.init_db"], cwd="backend")

print("Seeding Initial Data...")
subprocess.run([sys.executable, "-m", "app.seed"], cwd="backend")

# 3. Start Celery Worker
print("Launching Celery Worker...")
subprocess.Popen(["celery", "-A", "app.core.celery_app", "worker", "--loglevel=info"], cwd="backend")

# 4. Start FastAPI Backend (on port 8000)
print("Launching FastAPI Backend on port 8000...")
subprocess.Popen(["uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"], cwd="backend")

# 5. Build and Start Next.js Frontend (on HF Port 7860)
print("Installing frontend dependencies (npm ci)...")
subprocess.run(["npm", "ci"], cwd="frontend")

print("Building Next.js frontend...")
subprocess.run(["npm", "run", "build"], cwd="frontend")

print("Launching Next.js frontend on port 7860...")
os.environ["PORT"] = "7860"
os.environ["HOST"] = "0.0.0.0"
# This call is blocking, keeping the container alive and serving requests
subprocess.run(["npm", "run", "start"], cwd="frontend")
