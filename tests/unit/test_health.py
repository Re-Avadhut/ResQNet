"""Unit tests for the health endpoint.

The PWA polls this every 20 seconds to decide whether to show its offline
banner, so a regression here silently breaks offline detection for every
client. Worth guarding.
"""


def test_health_returns_ok(client):
    """Health check responds and identifies the service."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "resqnet-gateway"


def test_health_reports_tile_availability(client):
    """The map uses this flag to decide whether to add a tile layer."""
    response = client.get("/api/v1/health")
    data = response.json()
    assert "tiles_available" in data
    assert isinstance(data["tiles_available"], bool)
