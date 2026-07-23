import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1.api import api_router
from app.api.websockets import dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the redis listener as a background task
    redis_task = asyncio.create_task(dashboard.redis_listener())
    yield
    # Cancel task on shutdown
    redis_task.cancel()
    try:
        await redis_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/ws")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CIIP Backend Architecture Active"}
