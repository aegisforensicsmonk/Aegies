from fastapi import APIRouter
from app.schemas.osint import OSINTRequest, OSINTResponse
from app.services.osint import osint_service

router = APIRouter()

@router.post("/lookup", response_model=OSINTResponse)
async def lookup_ioc(request: OSINTRequest):
    """
    Enrich an IOC using open-source threat intelligence.
    """
    return await osint_service.enrich(request)
