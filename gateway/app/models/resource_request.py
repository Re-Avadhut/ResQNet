"""Resource Request ORM model."""

from sqlalchemy import Column, String, Integer, DateTime, Float, Boolean, JSON
from gateway.app.database import Base
import datetime


class ResourceRequest(Base):
    """Resource request from field teams."""

    __tablename__ = "resource_requests"

    id = Column(Integer, primary_key=True, autoincrement=True)
    requesting_node_id = Column(Integer, nullable=True)
    resource_type = Column(String(50), nullable=False)  # water, food, medical, transport
    quantity = Column(Integer, default=1)
    urgency = Column(String(20), default="medium")  # low, medium, high, critical
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    status = Column(String(20), default="pending")  # pending, dispatched, delivered, cancelled
    requested_at = Column(DateTime, default=datetime.datetime.utcnow)
    delivered_at = Column(DateTime, nullable=True)
    notes = Column(String(500), nullable=True)
    metadata = Column(JSON, nullable=True)

    def __repr__(self):
        return f"<ResourceRequest(type={self.resource_type}, urgency={self.urgency})>"