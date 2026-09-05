"""Import all ORM models so SQLAlchemy registers their tables."""

from gateway.app.models.capability import Capability
from gateway.app.models.deployment import DeploymentLocation
from gateway.app.models.message import Message
from gateway.app.models.missing_person import MissingPerson
from gateway.app.models.node import Node
from gateway.app.models.resource_request import ResourceRequest
from gateway.app.models.sos import SOSReport
from gateway.app.models.volunteer import Volunteer

__all__ = [
    "Capability",
    "DeploymentLocation",
    "Message",
    "MissingPerson",
    "Node",
    "ResourceRequest",
    "SOSReport",
    "Volunteer",
]
