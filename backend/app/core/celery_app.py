from celery import Celery
from app.core.config import settings

# Initialize Celery app
# Using RabbitMQ as the broker and Redis as the result backend (best practice for Celery)
celery_app = Celery(
    "aegis_tasks",
    broker=settings.RABBITMQ_URL,
    backend=settings.REDIS_URL,
    include=[
        "app.services.pipeline",
        "app.workers.ipdr_tasks"
    ]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_prefetch_multiplier=1, # Fair dispatching for long-running tasks like sandbox analysis
)
