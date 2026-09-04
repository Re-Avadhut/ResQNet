"""Capability ORM model."""

from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from gateway.app.database import Base


class Capability(Base):
    """Node capability descriptor."""

    __tablename__ = "capabilities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=False)
    module = Column(String(50), nullable=False)  # e.g., "GPS", "Camera"
    capabilities = Column(JSON, nullable=False)  # List of capabilities
    metadata = Column(JSON, nullable=True)  # Additional module metadata

    # Relationships
    node = relationship("Node", back_populates="capabilities")

    def __repr__(self):
        return f"<Capability(module={self.module}, capabilities={self.capabilities})>"