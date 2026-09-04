"""Deployment Location ORM model."""

from sqlalchemy import Column, String, Integer, DateTime, Float, Boolean
from gateway.app.database import Base
import datetime


class DeploymentLocation(Base):
    """Deployment location / base camp."""

    __tablename__ = "deployment_locations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    location_type = Column(String(50), default="base_camp")  # base_camp, field_hospital, staging_area
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String(255), nullable=True)
    capacity = Column(Integer, nullable=True)
    is_active = Column(Boolean, default=True)
    established_at = Column(DateTime, default=datetime.datetime.utcnow)
    decommissioned_at = Column(DateTime, nullable=True)
    notes = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<DeploymentLocation(name={self.name}, type={self.location_type})>"