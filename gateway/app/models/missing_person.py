"""Missing Person ORM model."""

from sqlalchemy import Column, String, Integer, DateTime, Float, Integer, JSON
from gateway.app.database import Base
import datetime


class MissingPerson(Base):
    """Missing person report."""

    __tablename__ = "missing_persons"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    age = Column(Integer, nullable=True)
    gender = Column(String(20), nullable=True)
    last_seen_location = Column(String(255), nullable=True)
    last_seen_lat = Column(Float, nullable=True)
    last_seen_lng = Column(Float, nullable=True)
    last_seen_time = Column(DateTime, nullable=True)
    description = Column(String(500), nullable=True)
    photo_url = Column(String(255), nullable=True)
    contact_name = Column(String(100), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    status = Column(String(20), default="missing")  # missing, found, deceased
    reported_at = Column(DateTime, default=datetime.datetime.utcnow)
    found_at = Column(DateTime, nullable=True)
    extra_metadata = Column("metadata", JSON, nullable=True)

    def __repr__(self):
        return f"<MissingPerson(name={self.name}, status={self.status})>"
