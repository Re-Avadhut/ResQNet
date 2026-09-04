"""Messaging REST route stubs."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class MessageCreate(BaseModel):
    """Request body for creating a message."""
    node_id: str | None = None
    sender: str
    recipient: str | None = None
    message_type: str = "text"
    content: str


@router.post("/send")
async def send_message(message: MessageCreate):
    """Send a message to a node or broadcast.
    
    TODO: Implement message sending with delivery tracking.
    """
    return {"status": "sent", "id": 0}


@router.get("/{node_id}")
async def get_messages(node_id: str, limit: int = 50):
    """Get message history for a node.
    
    TODO: Implement message retrieval with pagination.
    """
    return {"messages": []}


@router.get("/{node_id}/unread")
async def get_unread_count(node_id: str):
    """Get count of unread messages for a node.
    
    TODO: Implement unread message count.
    """
    return {"count": 0}


@router.put("/{message_id}/delivered")
async def mark_delivered(message_id: int):
    """Mark a message as delivered.
    
    TODO: Implement delivery status update.
    """
    return {"status": "delivered", "id": message_id}