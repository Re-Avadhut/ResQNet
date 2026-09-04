# ResQNet — Disaster Operating Platform

An offline-first emergency communication system for disaster zones, built on Raspberry Pi 4 (gateway) + ESP32-WROOM (rescue nodes).

## Architecture Overview

```
┌─────────────────┐     Wi-Fi AP / LoRa     ┌──────────────────┐
│  ESP32 Nodes    │ ◄─────────────────────► │  Raspberry Pi 4  │
│  (Rescue Nodes) │   Capability Discovery  │    (Gateway)     │
└─────────────────┘                         └────────┬─────────┘
                                                     │
                                              ┌──────▼──────┐
                                              │   PWA UI    │
                                              │ (Offline)   │
                                              └─────────────┘
```

- **Gateway**: FastAPI + SQLite, hosts offline PWA
- **Firmware**: ESP-IDF (C), Wi-Fi captive portal + dynamic capability descriptor
- **Frontend**: HTML5 + TailwindCSS + vanilla JS PWA (served by gateway)
- **Capability-based**: Gateway builds dashboard from whatever capabilities nodes report

## Quick Start

### Gateway (Raspberry Pi 4)

Run every command from the **repository root**, not from inside `gateway/`:

```bash
cp gateway/.env.example gateway/.env
pip install -r gateway/requirements.txt
python -m gateway.app.main
# API  -> http://localhost:8000/api/v1
# PWA  -> http://localhost:8000/
# Docs -> http://localhost:8000/docs
```

For development with auto-reload:

```bash
uvicorn gateway.app.main:app --reload
```

### Firmware (ESP32-WROOM)

```bash
cd firmware
idf.py build flash monitor
# Requires ESP-IDF v5.x
```

### Frontend Development

No build step — vanilla JS + Tailwind via CDN.

The frontend uses **absolute paths** (`/js/app.js`, `/manifest.json`), so it must be
opened through the gateway at `http://localhost:8000/`. Opening `frontend/index.html`
directly from the filesystem will not load correctly.

### Tests

```bash
pip install -r gateway/requirements-dev.txt   # dev + test dependencies
pytest tests -q                               # run the test suite
```

## Project Structure

```
ResQNet/
├── gateway/          # FastAPI backend
├── firmware/         # ESP-IDF firmware (C)
├── frontend/         # PWA (vanilla JS + Tailwind)
├── docs/             # Architecture, API specs, SRS
├── scripts/          # Setup/deployment scripts
└── tests/            # Backend + integration tests
```

## Team Working Agreement

See **[CLAUDE.md](CLAUDE.md)** for the branch workflow, project ground rules, and a
running log of what has changed. Read it before your first commit.

## Documentation

- [Architecture](docs/architecture.md) — Capability-based design
- [API Spec](docs/api.md) — REST + WebSocket endpoints (TODO)
- SRS — Software Requirements Specification (not written yet)

## License

MIT
