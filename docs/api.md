# ResQNet API Specification

## Overview
This document describes the REST and WebSocket APIs provided by the ResQNet gateway.

## Base URL
```
http://<gateway-host>:8000/api/v1
```

## Authentication
Currently no authentication is implemented (for offline-first disaster scenarios).
In production, consider API keys or JWT tokens.

## Endpoints

### Nodes

#### Register a Node
```
POST /nodes/register
```
Register a new rescue node with the gateway.

**Request Body:**
```json
{
  "node_id": "string (required, unique)",
  "name": "string (optional)",
  "location": "string (optional)",
  "protocol_version": "string (default: \"1.0\")"
}
```

**Response:**
```json
{
  "status": "registered",
  "node_id": "string"
}
```

#### Get Node Details
```
GET /nodes/{node_id}
```
Get details for a specific node.

**Response:**
```json
{
  "node_id": "string",
  "name": "string",
  "location": "string",
  "last_seen": "timestamp",
  "is_active": "boolean",
  "battery_level": "integer",
  "signal_strength": "integer"
}
```

#### List Nodes
```
GET /nodes
```
List all registered nodes.

**Query Parameters:**
- `active_only` (boolean): Filter to only active nodes
- `limit` (integer): Limit results (default: 50)
- `offset` (integer): Offset for pagination

**Response:**
```json
{
  "nodes": [
    {
      "node_id": "string",
      "name": "string",
      "location": "string",
      "last_seen": "timestamp",
      "is_active": "boolean",
      "battery_level": "integer",
      "signal_strength": "integer"
    }
  ],
  "total": "integer"
}
```

#### Update Node
```
PUT /nodes/{node_id}
```
Update node properties.

**Request Body:**
```json
{
  "name": "string (optional)",
  "location": "string (optional)",
  "battery_level": "integer (optional, 0-100)",
  "signal_strength": "integer (optional, RSSI)"
}
```

**Response:**
```json
{
  "status": "updated",
  "node_id": "string"
}
```

#### Delete Node
```
DELETE /nodes/{node_id}
```
Remove a node from the registry (soft delete).

**Response:**
```json
{
  "status": "deleted",
  "node_id": "string"
}
```

### Capabilities

#### Sync Capability Descriptor
```
POST /capabilities/sync
```
Receive capability descriptor from a node and update the database.

**Request Body:**
```json
{
  "protocol_version": "string (required)",
  "node_id": "string (required)",
  "modules": [
    {
      "module": "string (e.g., \"GPS\", \"Camera\")",
      "capabilities": ["list of strings"]
    }
  ]
}
```

**Response:**
```json
{
  "status": "synced",
  "node_id": "string"
}
```

#### Get Node Capabilities
```
GET /capabilities/{node_id}
```
Get all capabilities for a specific node.

**Response:**
```json
{
  "node_id": "string",
  "modules": [
    {
      "module": "string",
      "capabilities": ["list"],
      "metadata": "object (optional)"
    }
  ]
}
```

#### Get Capability Summary
```
GET /capabilities/{node_id}/summary
```
Get a summary of what a node can do (aggregated capabilities).

**Response:**
```json
{
  "node_id": "string",
  "summary": {
    "location": true,
    "communication": true,
    "sensing": true,
    "navigation": false
    // ... etc
  }
}
```

### SOS Reports

#### Create SOS Report
```
POST /sos/report
```
Submit a new SOS emergency report.

**Request Body:**
```json
{
  "node_id": "string (optional, if reported by node)",
  "reporter_name": "string (optional)",
  "reporter_contact": "string (optional)",
  "latitude": "float (optional)",
  "longitude": "float (optional)",
  "severity": "string (low|medium|high|critical, default: medium)",
  "description": "string (optional)",
  "photo_url": "string (optional, path to uploaded photo)"
}
```

**Response:**
```json
{
  "status": "created",
  "id": "integer"
}
```

#### List SOS Reports
```
GET /sos
```
List SOS reports with optional filtering.

**Query Parameters:**
- `status` (string): Filter by status (active, acknowledged, resolved)
- `severity` (string): Filter by severity
- `limit` (integer): Limit results (default: 50)
- `offset` (integer): Offset for pagination
- `since` (timestamp): Only reports after this time

**Response:**
```json
{
  "reports": [
    {
      "id": "integer",
      "node_id": "string",
      "reporter_name": "string",
      "reporter_contact": "string",
      "latitude": "float",
      "longitude": "float",
      "severity": "string",
      "description": "string",
      "status": "string",
      "created_at": "timestamp",
      "resolved_at": "timestamp (optional)"
    }
  ],
  "total": "integer"
}
```

#### Get SOS Report
```
GET /sos/{sos_id}
```
Get a specific SOS report.

**Response:** Same as item in list above.

#### Update SOS Status
```
PUT /sos/{sos_id}/status
```
Update the status of an SOS report.

**Request Body:**
```json
{
  "status": "string (active|acknowledged|resolved)"
}
```

**Response:**
```json
{
  "status": "updated",
  "id": "integer"
}
```

#### Delete SOS Report
```
DELETE /sos/{sos_id}
```
Soft delete an SOS report.

**Response:**
```json
{
  "status": "deleted",
  "id": "integer"
}
```

### Messaging

#### Send Message
```
POST /messages/send
```
Send a message to a specific node or broadcast.

**Request Body:**
```json
{
  "node_id": "string (optional, if broadcast)",
  "sender": "string (required)",
  "recipient": "string (optional, null = broadcast)",
  "message_type": "string (text|alert|status, default: text)",
  "content": "string (required)"
}
```

**Response:**
```json
{
  "status": "sent",
  "id": "integer"
}
```

#### Get Message History
```
GET /messages/{node_id}
```
Get message history for a specific node.

**Query Parameters:**
- `limit` (integer): Limit results (default: 50)
- `offset` (integer): Offset for pagination
- `unread_only` (boolean): Only unread messages

**Response:**
```json
{
  "messages": [
    {
      "id": "integer",
      "node_id": "string",
      "sender": "string",
      "recipient": "string",
      "message_type": "string",
      "content": "string",
      "sent_at": "timestamp",
      "is_delivered": "boolean"
    }
  ],
  "total": "integer"
}
```

#### Mark Message as Delivered
```
PUT /messages/{id}/delivered
```
Mark a message as delivered.

**Response:**
```json
{
  "status": "delivered",
  "id": "integer"
}
```

### Dashboard

#### Get Overview
```
GET /dashboard/overview
```
Get aggregated statistics for dashboard display.

**Response:**
```json
{
  "nodes": {
    "total": "integer",
    "active": "integer",
    "offline": "integer",
    "low_battery": "integer"
  },
  "sos": {
    "active": "integer",
    "acknowledged": "integer",
    "resolved_today": "integer",
    "critical": "integer"
  },
  "volunteers": {
    "total": "integer",
    "available": "integer",
    "deployed": "integer",
    "offline": "integer"
  },
  "resources": {
    "pending": "integer",
    "dispatched": "integer",
    "delivered_today": "integer",
    "cancelled": "integer"
  }
}
```

#### Get Map Data
```
GET /dashboard/map
```
Get data for map visualization.

**Response:**
```json
{
  "nodes": [
    {
      "node_id": "string",
      "latitude": "float",
      "longitude": "float",
      "battery_level": "integer",
      "signal_strength": "integer"
    }
  ],
  "sos_reports": [
    {
      "id": "integer",
      "latitude": "float",
      "longitude": "float",
      "severity": "string",
      "status": "string"
    }
  ],
  "missing_persons": [
    {
      "id": "integer",
      "latitude": "float",
      "longitude": "float",
      "status": "string"
    }
  ],
  "resource_requests": [
    {
      "id": "integer",
      "latitude": "float",
      "longitude": "float",
      "resource_type": "string",
      "urgency": "string"
    }
  ],
  "deployment_locations": [
    {
      "id": "integer",
      "name": "string",
      "latitude": "float",
      "longitude": "float",
      "location_type": "string"
    }
  ]
}
```

#### Get Active Alerts
```
GET /dashboard/alerts
```
Get active alerts requiring attention.

**Response:**
```json
{
  "alerts": [
    {
      "type": "string (sos|resource|node_offline|low_battery)",
      "priority": "string (low|medium|high|critical)",
      "title": "string",
      "description": "string",
      "timestamp": "timestamp",
      "related_id": "integer (optional)"
    }
  ]
}
```

#### Get Statistics
```
GET /dashboard/statistics
```
Get historical statistics and trends.

**Response:**
```json
{
  "daily_sos": [{"date": "string", "count": "integer"}],
  "hourly_nodes": [{"hour": "string", "count": "integer"}],
  "resource_fulfillment_rate": "float",
  "average_response_time": "float (minutes)"
}
```

### WebSocket Endpoint

#### Real-time Sync
```
WS /ws/sync
```
WebSocket connection for real-time heartbeat and data synchronization.

**Client → Server Messages:**
```json
{
  "type": "heartbeat",
  "node_id": "string",
  "battery_level": "integer",
  "signal_strength": "integer"
}
```

```json
{
  "type": "sync_request",
  "node_id": "string",
  "last_sync": "timestamp"
}
```

**Server → Client Messages:**
```json
{
  "type": "heartbeat_ack",
  "timestamp": "timestamp",
  "server_time": "timestamp"
}
```

```json
{
  "type": "sync_response",
  "node_id": "string",
  "updates": {
    "nodes": [...],
    "sos_reports": [...],
    "messages": [...]
  }
}
```

```json
{
  "type": "alert",
  "alert": { ... } // Same as /dashboard/alerts format
}
```

**Connection Handling:**
- Clients should implement exponential backoff reconnection
- Heartbeat interval: 10 seconds (configurable)
- Connection timeout: 30 seconds (configurable)

## Data Types

### Timestamp
ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ` (UTC)

### Error Responses
All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 404: Not Found
- 500: Internal Server Error

Error response format:
```json
{
  "detail": "string (error description)"
}
```

## Rate Limiting
Currently no rate limiting is implemented.
In production, consider implementing rate limits per node or IP.

## CORS
The API allows all origins (`Access-Control-Allow-Origin: *`) for ease of use in disaster scenarios.
In production, restrict to trusted origins.

## Versioning
API version is included in the URL path (`/api/v1/`).
Breaking changes will increment the version number.

## Extensibility
New endpoints should follow the same patterns:
- RESTful resource naming
- Consistent error handling
- Proper HTTP status codes
- Clear request/response schemas

## Offline Behavior
The API is designed for intermittent connectivity:
- Clients should queue requests when offline
- Implement retry with exponential backoff
- Use WebSocket for real-time when available
- Fall back to polling when WebSocket unavailable

## Security Considerations
For production deployments:
1. Enable HTTPS/TLS
2. Implement authentication (API keys or JWT)
3. Add rate limiting and DDoS protection
4. Sanitize all inputs to prevent injection
5. Implement proper CORS policies
6. Log all access attempts
7. Regular security audits

## Change Log
- v1.0.0: Initial API specification