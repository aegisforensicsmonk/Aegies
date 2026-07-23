from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CIIP Malware Analysis Platform"
    API_V1_STR: str = "/api/v1"
    DATABASE_URL: str = "postgresql+asyncpg://ciip:ciip_secure_password@db:5432/ciip_db"
    REDIS_URL: str = "redis://redis:6379/0"
    RABBITMQ_URL: str = "amqp://ciip:ciip_secure_password@rabbitmq:5672/"
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "ciip_admin"
    MINIO_SECRET_KEY: str = "ciip_secure_password"
    MINIO_SECURE: bool = False
    MINIO_BUCKET: str = "malware-samples"
    SECRET_KEY: str = "ciip-production-secret-change-me"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
