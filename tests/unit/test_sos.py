"""Unit tests for SOS endpoints."""


def test_create_sos(client, sample_sos_report):
    """Test SOS report creation."""
    response = client.post("/api/v1/sos/report", json=sample_sos_report)
    assert response.status_code == 200
    assert "status" in response.json()


def test_list_sos(client):
    """Test SOS listing."""
    response = client.get("/api/v1/sos/")
    assert response.status_code == 200
    assert "reports" in response.json()


def test_get_sos(client):
    """Test get specific SOS."""
    response = client.get("/api/v1/sos/1")
    assert response.status_code == 200
    assert "id" in response.json()

def test_list_sos_without_trailing_slash(client):
    """`GET /sos` (the URL in docs/api.md) must not 404. See test_nodes.py."""
    response = client.get("/api/v1/sos")
    assert response.status_code == 200
    assert "reports" in response.json()
