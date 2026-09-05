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
- **Frontend**: HTML5 + TailwindCSS + vanilla JS PWA (served by the gateway or a static dev server)
- **Capability-based**: Gateway builds dashboard from whatever capabilities nodes report

## Quick Start

### Gateway (Raspberry Pi 4)

```bash
python3 -m venv gateway/venv
. gateway/venv/bin/activate
pip install -r gateway/requirements-dev.txt
cp gateway/.env.example gateway/.env
python -m uvicorn gateway.app.main:app --reload
# API: http://localhost:8000/docs
```

On Windows PowerShell, use `gateway\\venv\\Scripts\\Activate.ps1` and
`python -m uvicorn gateway.app.main:app --reload` from the repository root.

### Firmware (ESP32-WROOM)

```bash
cd firmware
idf.py build flash monitor
# Requires ESP-IDF v5.x
```

### Frontend Development

```bash
cd frontend
# No build step needed — vanilla JS
python3 -m http.server 5500
```

Open `http://localhost:5500` when using the separate static server. The gateway
also serves the same frontend at `http://localhost:8000/`.

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

## Documentation

- [Architecture](docs/architecture.md) — Capability-based design
- [API Spec](docs/api.md) — REST + WebSocket endpoints (TODO)
- [Beginner Guide](docs/beginner-guide.md) — Setup and project walkthrough
- [Team Ground Rules](docs/team-ground-rules.md) — Shared contribution rules
- [AI Context](.github/copilot-instructions.md) — Repository context for coding assistants

## License

MIT
