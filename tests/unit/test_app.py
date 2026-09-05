"""Tests for the application shell and startup contract."""

from fastapi.testclient import TestClient

from gateway.app.database import Base
from gateway.app.main import app


def test_frontend_is_served_and_database_models_are_registered():
    """The gateway should serve the app shell and know every ORM table."""
    expected_tables = {
        "capabilities",
        "deployment_locations",
        "messages",
        "missing_persons",
        "nodes",
        "resource_requests",
        "sos_reports",
        "volunteers",
    }

    with TestClient(app) as client:
        response = client.get("/")

    assert response.status_code == 200
    assert "ResQNet" in response.text
    assert expected_tables.issubset(Base.metadata.tables)
