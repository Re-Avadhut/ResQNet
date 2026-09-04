"""Node ORM model."""

from sqlalchemy import Column, String, DateTime, Boolean, Integer
from sqlalchemy.orm import relationship
from gateway.app.database import Base


class Node(Base):
    """Rescue node (ESP32-WROOM)."""

    __tablename__ = "nodes"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    last_seen = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    battery_level = Column(Integer, nullable=True)  # 0-100
    signal_strength = Column(Integer, nullable=True)  # RSSI
    protocol_version = Column(String(10), default="1.0")
    created_at = Column(DateTime, server_default="CURRENT_TIMESTAMP")

    # Relationships
    capabilities = relationship("Capability", back_populates="node")
    messages = relationship("Message", back_populates="node")
    sos_reports = relationship("SOSReport", back_populates="node")

    def __repr__(self):
        return f"<Node(node_id={self.node_id}, name={self.name})>"