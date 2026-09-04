"""Capability REST route stubs."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class CapabilityDescriptor(BaseModel):
    """Capability descriptor from a rescue node."""
    protocol_version: str
    node_id: str
    modules: list[dict]


@router.post("/sync")
async def sync_capabilities(descriptor: CapabilityDescriptor):
    """Sync capability descriptor from a node.
    
    TODO: Implement capability sync - parse descriptor, update DB, 
    trigger dashboard refresh.
    """
    return {"status": "synced", "node_id": descriptor.node_id}


@router.get("/{node_id}")
async def get_capabilities(node_id: str):
    """Get capabilities for a specific node.
    
    TODO: Implement capability lookup.
    """
    return {"node_id": node_id, "modules": []}


@router.get("/{node_id}/summary")
async def get_capability_summary(node_id: str):
    """Get a summary of node capabilities (what it can do).
    
    TODO: Implement capability summary generation.
    """
    return {"node_id": node_id, "summary": {}}