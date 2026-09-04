"""Node REST route stubs."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


class NodeRegistration(BaseModel):
    """Request body for node registration."""
    node_id: str
    name: str | None = None
    location: str | None = None
    protocol_version: str = "1.0"


class NodeUpdate(BaseModel):
    """Request body for node update."""
    name: str | None = None
    location: str | None = None
    battery_level: int | None = None
    signal_strength: int | None = None


@router.post("/register")
async def register_node(node: NodeRegistration):
    """Register a new rescue node.
    
    TODO: Implement node registration with validation and DB insertion.
    """
    return {"status": "registered", "node_id": node.node_id}


@router.get("/{node_id}")
async def get_node(node_id: str):
    """Get node details by ID.
    
    TODO: Implement node lookup with capability summary.
    """
    return {"node_id": node_id, "status": "not_found"}


@router.get("/")
async def list_nodes():
    """List all registered nodes.
    
    TODO: Implement node listing with filtering and pagination.
    """
    return {"nodes": []}


@router.put("/{node_id}")
async def update_node(node_id: str, update: NodeUpdate):
    """Update node properties.
    
    TODO: Implement node update with validation.
    """
    return {"status": "updated", "node_id": node_id}


@router.delete("/{node_id}")
async def delete_node(node_id: str):
    """Delete a node from registry.
    
    TODO: Implement soft delete with audit trail.
    """
    return {"status": "deleted", "node_id": node_id}