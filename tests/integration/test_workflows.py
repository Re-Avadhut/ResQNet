"""Integration tests for end-to-end workflows."""


def test_node_capability_sync_flow(client, sample_node_data, sample_capability_descriptor):
    """Test full flow: register node -> sync capabilities -> get summary."""
    # Register node
    reg_response = client.post("/api/v1/nodes/register", json=sample_node_data)
    assert reg_response.status_code == 200

    # Sync capabilities
    sync_response = client.post("/api/v1/capabilities/sync", json=sample_capability_descriptor)
    assert sync_response.status_code == 200

    # Get capabilities
    cap_response = client.get(f"/api/v1/capabilities/{sample_node_data['node_id']}")
    assert cap_response.status_code == 200


def test_dashboard_overview(client):
    """Test dashboard overview endpoint."""
    response = client.get("/api/v1/dashboard/overview")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "sos" in data
    assert "volunteers" in data
    assert "resources" in data


def test_sos_workflow(client, sample_sos_report):
    """Test SOS workflow: create -> list -> update status."""
    # Create
    create_response = client.post("/api/v1/sos/report", json=sample_sos_report)
    assert create_response.status_code == 200

    # List
    list_response = client.get("/api/v1/sos/?status=active")
    assert list_response.status_code == 200


def test_messaging_flow(client):
    """Test message send and retrieve."""
    message = {
        "node_id": "TEST-NODE-01",
        "sender": "gateway",
        "recipient": "TEST-NODE-01",
        "content": "Test message"
    }
    response = client.post("/api/v1/messages/send", json=message)
    assert response.status_code == 200


def test_websocket_connection():
    """Test WebSocket connection (skeleton)."""
    # TODO: Implement WebSocket integration test
    pass