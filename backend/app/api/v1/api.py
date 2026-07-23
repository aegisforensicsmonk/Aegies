from fastapi import APIRouter
from app.api.v1.endpoints import upload, telemetry, osint, ipdr, ransomware, cases, dashboard

api_router = APIRouter()
api_router.include_router(upload.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(telemetry.router, prefix="/telemetry", tags=["telemetry"])
api_router.include_router(osint.router, prefix="/osint", tags=["osint"])
api_router.include_router(ipdr.router, prefix="/ipdr", tags=["ipdr"])
api_router.include_router(ransomware.router, prefix="/ransomware", tags=["ransomware"])
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
