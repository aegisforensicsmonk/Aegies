import boto3
from botocore.client import Config
from app.core.config import settings
import io

class StorageService:
    def __init__(self):
        # In a real environment, you'd wrap this in try-except for robust initialization
        self.s3 = boto3.client(
            's3',
            endpoint_url=f"http://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            config=Config(signature_version='s3v4'),
            region_name='us-east-1'
        )

    def _ensure_bucket(self):
        try:
            self.s3.head_bucket(Bucket=settings.MINIO_BUCKET)
        except:
            try:
                self.s3.create_bucket(Bucket=settings.MINIO_BUCKET)
            except Exception as e:
                print(f"Failed to create bucket: {e}")

    def upload_file(self, object_name: str, data: bytes, content_type: str):
        self._ensure_bucket()
        self.s3.upload_fileobj(
            io.BytesIO(data),
            settings.MINIO_BUCKET,
            object_name,
            ExtraArgs={'ContentType': content_type}
        )
        return True
        
storage_service = StorageService()
