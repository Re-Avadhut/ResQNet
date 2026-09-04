"""Pytest configuration and fixtures."""

import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add the REPOSITORY ROOT to sys.path so `import gateway.app...` resolves
# no matter which directory pytest was launched from.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from gateway.app.main import app


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
def sample_node_data():
    """Sample node registration data."""
    return {
        "node_id": "TEST-NODE-01",
        "name": "Test Node",
        "location": "Test Location",
        "protocol_version": "1.0"
    }


@pytest.fixture
def sample_capability_descriptor():
    """Sample capability descriptor."""
    return {
        "protocol_version": "1.0",
        "node_id": "TEST-NODE-01",
        "modules": [
            {"module": "GPS", "capabilities": ["location", "speed"]}
        ]
    }


@pytest.fixture
def sample_sos_report():
    """Sample SOS report data."""
    return {
        "node_id": "TEST-NODE-01",
        "reporter_name": "Test User",
        "reporter_contact": "+1234567890",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "severity": "high",
        "description": "Test SOS report"
    }