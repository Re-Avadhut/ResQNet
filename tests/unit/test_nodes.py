"""Unit tests for node endpoints."""


def test_register_node(client, sample_node_data):
    """Test node registration endpoint."""
    response = client.post("/api/v1/nodes/register", json=sample_node_data)
    assert response.status_code == 200
    data = response.json()
    assert data["node_id"] == sample_node_data["node_id"]


def test_list_nodes(client):
    """Test node listing endpoint."""
    response = client.get("/api/v1/nodes/")
    assert response.status_code == 200
    assert "nodes" in response.json()


def test_get_node(client):
    """Test get node endpoint."""
    response = client.get("/api/v1/nodes/TEST-NODE-01")
    assert response.status_code == 200
    assert "node_id" in response.json()