"""Resource Request ORM model."""

from sqlalchemy import Column, String, Integer, DateTime, Float, Boolean, JSON
from gateway.app.database import Base
import datetime


class ResourceRequest(Base):
    """Resource request from field teams."""

    __tablename__ = "resource_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    requesting_node_id = Column(Integer, nullable=True)
    # water, food, medical, transport
    resource_type = Column(String(50), nullable=False)
    quantity = Column(Integer, default=1)
    # low, medium, high, critical
    urgency = Column(String(20), default="medium")
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    # pending, dispatched, delivered, cancelled
    status = Column(String(20), default="pending")
    requested_at = Column(DateTime, default=datetime.datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)
    notes = Column(String(500), nullable=True)
    extra_metadata = Column("metadata", JSON, nullable=True)

    def __repr__(self):
        return f"<ResourceRequest(type={self.resource_type}, urgency={self.urgency})>"
