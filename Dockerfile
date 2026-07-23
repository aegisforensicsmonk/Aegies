FROM python:3.12-slim-bookworm

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    postgresql \
    postgresql-contrib \
    redis-server \
    build-essential \
    libmagic1 \
    git \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create Hugging Face Space user (UID 1000)
RUN useradd -m -u 1000 user

WORKDIR /app

# Install Python backend requirements
COPY backend/requirements.txt /app/backend/
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

# Install Node.js frontend requirements
COPY frontend/package.json frontend/package-lock.json /app/frontend/
RUN cd /app/frontend && npm ci

# Copy application files and set ownership
COPY --chown=user:user . /app

# Build Next.js frontend
RUN cd /app/frontend && NEXT_PUBLIC_API_URL=http://localhost:8000 npm run build

# Make start.sh executable
RUN chmod +x /app/start.sh

# Run as non-root user (UID 1000)
USER user

# Set environment variables for running services locally as non-root
ENV PATH="/home/user/.local/bin:${PATH}"
ENV PGDATA="/tmp/postgres_data"

EXPOSE 7860

CMD ["/bin/bash", "/app/start.sh"]
