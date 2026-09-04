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
```bash
cd gateway
cp .env.example .env
pip install -r requirements.txt
python -m app.main
# Serves on http://localhost:8000 (API) and PWA at /
```

### Firmware (ESP32-WROOM)
```bash
cd firmware
idf.py build flash monitor
# Requires ESP-IDF v5.x
```

### Frontend Development
```bash
cd frontend
# No build step needed — vanilla JS + Tailwind via CDN
# Open index.html directly or via gateway
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

## Documentation

- [Architecture](docs/architecture.md) — Capability-based design
- [API Spec](docs/api.md) — REST + WebSocket endpoints (TODO)
- [SRS](docs/srs.md) — Software Requirements Specification (TODO)

## License

MIT
