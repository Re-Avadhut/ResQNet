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

- **Python version**: 3.9+ supported; developed and tested on 3.13
- **ESP-IDF version**: 5.x (supports modern CMake and SDK)
- **Raspberry Pi OS**: 64-bit Lite (for headless operation)
- **Database**: SQLite 3.39+ with **synchronous** SQLAlchemy. `database.py` has an
  async branch for PostgreSQL, but it currently raises `NotImplementedError` -
  async is a migration path, not the current state.
- **Frontend**: Vanilla JS, no heavy frameworks (React/Vue)
- **Deployment**: Docker not assumed initially; direct binary execution

### Files Created

- `gateway/app/models/` — SQLAlchemy ORM models (Node, Capability, Message, SOSReport, MissingPerson, Volunteer, ResourceRequest, DeploymentLocation)
- `gateway/app/routes/` — REST endpoints for node management, capability sync, SOS reporting, messaging, dashboard data
- `gateway/app/main.py` — App setup, static PWA hosting, health check, and the
  `/ws/sync` WebSocket handler (there is no separate `websocket/` package)
- `firmware/main/` — ESP-IDF project skeleton with capability descriptor generation
- `frontend/` — PWA structure with dashboard, SOS form, missing-persons, volunteer registry, map views
- `docs/architecture.md` — This document
- `scripts/` — Setup and deployment automation
- `tests/` — Unit and integration test scaffolds

### Next Steps

Status as of 2026-09-04 (see CLAUDE.md for the running log):

1. ~~Define SQLAlchemy models~~ - done, 8 models in `gateway/app/models/`
2. ~~Create ESP-IDF project skeleton~~ - done (hardware team owns it from here)
3. ~~Build PWA frontend~~ - done and fully offline-capable
4. ~~Write API specifications~~ - done, `docs/api.md`
5. **Implement the endpoints in `gateway/app/routes/`** - NOT started. Every
   route is still a stub returning hardcoded empty data. This is the critical path.
6. **Add route modules for the four models that have none**: MissingPerson,
   Volunteer, ResourceRequest, DeploymentLocation. These are not in `docs/api.md`
   either, so the spec needs extending first.
7. Implement the `/ws/sync` WebSocket message handling described in `docs/api.md`
8. Add CI and finish the deployment scripts

---

*Version 1.0 — Initial Scaffold*
