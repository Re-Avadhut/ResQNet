"""SQLAlchemy ORM models.

IMPORTANT: every model must be imported here. SQLAlchemy only knows about a
table if its class has actually been imported, so `Base.metadata.create_all()`
would silently create nothing if a model is missing from this list.
"""

from gateway.app.models.node import Node
from gateway.app.models.capability import Capability
from gateway.app.models.message import Message
from gateway.app.models.sos import SOSReport
from gateway.app.models.missing_person import MissingPerson
from gateway.app.models.volunteer import Volunteer
from gateway.app.models.resource_request import ResourceRequest
from gateway.app.models.deployment import DeploymentLocation

__all__ = [
    "Node",
    "Capability",
    "Message",
    "SOSReport",
    "MissingPerson",
    "Volunteer",
    "ResourceRequest",
    "DeploymentLocation",
]
