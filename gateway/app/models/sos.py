"""SOS Report ORM model."""

from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Float, JSON
from sqlalchemy.orm import relationship
from gateway.app.database import Base
import datetime


class SOSReport(Base):
    """SOS emergency report from nodes or volunteers."""

    __tablename__ = "sos_reports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    node_id = Column(Integer, ForeignKey("nodes.id"), nullable=True)
    reporter_name = Column(String(100), nullable=True)
    reporter_contact = Column(String(50), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    # low, medium, high, critical
    severity = Column(String(20), default="medium")
    # active, acknowledged, resolved
    status = Column(String(20), default="active")
    description = Column(String(500), nullable=True)
    photo_url = Column(String(255), nullable=True)  # Path to uploaded photo
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    extra_metadata = Column(
        "metadata", JSON, nullable=True)  # Additional context

    # Relationships
    node = relationship("Node", back_populates="sos_reports")

    def __repr__(self):
        return f"<SOSReport(id={self.id}, severity={self.severity}, status={self.status})>"
