#!/bin/bash
set -e

echo "Starting CIIP Services..."

# Create directory for runtime logs/configs
mkdir -p /tmp/postgres_data /tmp/redis_data
chmod 700 /tmp/postgres_data

# 1. Initialize PostgreSQL if not already done
if [ ! -f /tmp/postgres_data/PG_VERSION ]; then
    echo "Initializing database..."
    initdb -D /tmp/postgres_data
fi

# 2. Start PostgreSQL with socket directory in /tmp (to avoid permission errors in /var/run/postgresql)
echo "Starting PostgreSQL..."
pg_ctl -D /tmp/postgres_data -o "-c unix_socket_directories=/tmp -p 5432" start

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
until pg_isready -h localhost -p 5432; do
  sleep 1
done

# 3. Start Redis Server
echo "Starting Redis..."
redis-server --dir /tmp/redis_data --port 6379 --daemonize yes

# Wait for Redis
echo "Waiting for Redis..."
until redis-cli -p 6379 ping; do
  sleep 1
done

# 4. Initialize Database Schema and Seed Data
echo "Initializing and seeding database..."
export DATABASE_URL="postgresql+asyncpg://$(whoami):@localhost:5432/postgres"
export REDIS_URL="redis://localhost:6379/0"
export CELERY_BROKER_URL="redis://localhost:6379/1"
export CELERY_RESULT_BACKEND="redis://localhost:6379/1"
export SECRET_KEY="ciip-production-secret-change-me"

cd /app/backend
python -m app.init_db
python -m app.seed

# 5. Start Celery Worker
echo "Starting Celery Worker..."
celery -A app.core.celery_app worker --loglevel=info &

# 6. Start FastAPI Backend
echo "Starting FastAPI backend..."
uvicorn app.main:app --host 127.0.0.1 --port 8000 &

# 7. Start Next.js Frontend (listening on port 7860 for Hugging Face)
echo "Starting Next.js frontend..."
cd /app/frontend
export NEXT_PUBLIC_API_URL="http://localhost:8000"
export PORT=7860
export HOST=0.0.0.0
npm run start
