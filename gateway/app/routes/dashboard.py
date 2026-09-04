"""Dashboard REST route stubs."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/overview")
async def get_dashboard_overview():
    """Get dashboard overview data.
    
    TODO: Implement dashboard overview - aggregate node count, active SOS,
    volunteers, resource requests, etc.
    """
    return {
        "nodes": {"total": 0, "active": 0},
        "sos": {"active": 0, "resolved_today": 0},
        "volunteers": {"total": 0, "deployed": 0},
        "resources": {"pending": 0, "delivered_today": 0},
    }


@router.get("/map")
async def get_map_data():
    """Get map data for dashboard visualization.
    
    TODO: Implement map data - return node locations, SOS markers, 
    deployment zones, resource requests.
    """
    return {
        "nodes": [],
        "sos_reports": [],
        "missing_persons": [],
        "resource_requests": [],
        "deployment_locations": [],
    }


@router.get("/alerts")
async def get_active_alerts():
    """Get active alerts for dashboard.
    
    TODO: Implement active alerts - return unresolved SOS, 
    critical resource requests, etc.
    """
    return {"alerts": []}


@router.get("/statistics")
async def get_statistics():
    """Get dashboard statistics.
    
    TODO: Implement statistics aggregation.
    """
    return {}