"""Message ORM model."""

from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from gateway.app.database import Base
import datetime


class Message(Base):
    """Communication message between nodes."""

    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=True)
    sender = Column(String(50), nullable=False)
    recipient = Column(String(50), nullable=True)  # null = broadcast
    message_type = Column(String(20), default="text")  # text, alert, status
    content = Column(String(1000), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    is_delivered = Column(Integer, default=0)  # 0 = pending, 1 = delivered

    # Relationships
    node = relationship("Node", back_populates="messages")

    def __repr__(self):
        return f"<Message(sender={self.sender}, content={self.content[:20]})>"