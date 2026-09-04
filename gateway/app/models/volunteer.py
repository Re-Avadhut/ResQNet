"""Volunteer ORM model."""

from sqlalchemy import Column, String, Integer, DateTime, Float, Boolean, JSON
from gateway.app.database import Base
import datetime


class Volunteer(Base):
    """Registered volunteer."""

    __tablename__ = "volunteers"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=True)
    phone = Column(String(50), nullable=True)
    skills = Column(JSON, nullable=True)  # List of skills
    certifications = Column(JSON, nullable=True)  # List of certifications
    availability = Column(String(20), default="available")  # available, deployed, offline
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    deployment_location_id = Column(Integer, nullable=True)  # FK to DeploymentLocation
    registered_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)
    notes = Column(String(500), nullable=True)

    def __repr__(self):
        return f"<Volunteer(name={self.name}, availability={self.availability})>"