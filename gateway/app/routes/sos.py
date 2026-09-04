"""SOS REST route stubs."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class SOSCreate(BaseModel):
    """Request body for creating an SOS report."""
    node_id: str | None = None
    reporter_name: str | None = None
    reporter_contact: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    severity: str = "medium"
    description: str | None = None
    photo_url: str | None = None


@router.post("/report")
async def create_sos(sos: SOSCreate):
    """Create a new SOS report.
    
    TODO: Implement SOS report creation with validation and alert dispatch.
    """
    return {"status": "created", "id": 0}


@router.get("", include_in_schema=False)
@router.get("/")
async def list_sos(status: str | None = None):
    """List SOS reports, optionally filtered by status.
    
    TODO: Implement SOS listing with filtering and pagination.
    """
    return {"reports": []}


@router.get("/{sos_id}")
async def get_sos(sos_id: int):
    """Get a specific SOS report.
    
    TODO: Implement SOS report lookup.
    """
    return {"id": sos_id, "status": "not_found"}


@router.put("/{sos_id}/status")
async def update_sos_status(sos_id: int, status: str):
    """Update SOS report status.
    
    TODO: Implement status update with audit trail.
    """
    return {"status": "updated", "id": sos_id}


@router.delete("/{sos_id}")
async def delete_sos(sos_id: int):
    """Delete an SOS report.
    
    TODO: Implement soft delete with audit trail.
    """
    return {"status": "deleted", "id": sos_id}