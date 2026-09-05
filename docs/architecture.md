# Architecture Design — ResQNet

## Capability-Based Design

ResQNet follows a **capability-driven architecture** where the gateway (Raspberry Pi) discovers and manages resources dynamically through a standardized capability descriptor protocol.

### Core Components

1. **ESP32 Rescue Nodes (Edge)**
   - Run ESP-IDF firmware
   - Report capabilities via JSON descriptor
   - Support: GPS, Camera, IMU, LoRa, Sensors, etc.
   - Dynamic module discovery

2. **Raspberry Pi Gateway (Central)**
   - Hosts FastAPI backend (Python)
   - Manages SQLite database (with PostgreSQL migration path)
   - Serves offline PWA frontend
   - Exposes REST APIs and WebSocket connections

3. **Frontend (PWA)**
   - HTML5 + TailwindCSS + vanilla JavaScript
   - Offline-first with Service Worker
   - Dashboard, SOS forms, missing-person tracking, volunteer registry
   - Leaflet maps with offline OSM tiles

### Data Flow

```
Node → Capability Descriptor (JSON) → Gateway → Database → PWA Dashboard
                              ↓
                        WebSocket (real-time sync)
```

### Key Assumptions

- **Python version**: 3.9+ (FastAPI 0.100+, SQLAlchemy 2.0+)
- **ESP-IDF version**: 5.x (supports modern CMake and SDK)
- **Raspberry Pi OS**: 64-bit Lite (for headless operation)
- **Database**: SQLite 3.39+ with async SQLAlchemy (dialect-swappable)
- **Frontend**: Vanilla JS, no heavy frameworks (React/Vue)
- **Deployment**: Docker not assumed initially; direct binary execution

### Files Created

- `gateway/app/models/` — SQLAlchemy ORM models (Node, Capability, Message, SOSReport, MissingPerson, Volunteer, ResourceRequest, DeploymentLocation)
- `gateway/app/routes/` — REST endpoints for node management, capability sync, SOS reporting, messaging, dashboard data
- `gateway/app/websocket/` — Heartbeat and sync WebSocket handler
- `firmware/main/` — ESP-IDF project skeleton with capability descriptor generation
- `frontend/` — PWA structure with dashboard, SOS form, missing-persons, volunteer registry, map views
- `docs/architecture.md` — This document
- `scripts/` — Setup and deployment automation
- `tests/` — Unit and integration test scaffolds

### Next Steps

1. Implement FastAPI endpoints in `gateway/app/routes/`
2. Define SQLAlchemy models in `gateway/app/models/`
3. Create ESP-IDF project skeleton in `firmware/`
4. Build PWA frontend in `frontend/`
5. Add CI/CD and deployment scripts in `scripts/`
6. Write API specifications in `docs/`

---

*Version 1.0 — Initial Scaffold*
