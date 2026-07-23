import aio_pika
from app.core.config import settings
import json

class QueueService:
    async def publish_message(self, queue_name: str, message: dict):
        connection = await aio_pika.connect_robust(settings.RABBITMQ_URL)
        async with connection:
            channel = await connection.channel()
            queue = await channel.declare_queue(queue_name, durable=True)
            await channel.default_exchange.publish(
                aio_pika.Message(body=json.dumps(message).encode()),
                routing_key=queue_name
            )

queue_service = QueueService()
