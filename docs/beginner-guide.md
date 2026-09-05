# ResQNet Beginner Guide

This guide is for teammates who know basic HTML, CSS, and JavaScript but are new to Python, FastAPI, SQLAlchemy, ESP32 firmware, and Git collaboration.

## 1. What ResQNet Is

ResQNet is intended to be an offline-first emergency communication platform:

```text
ESP32 rescue nodes -> Raspberry Pi gateway -> browser PWA
                              |
                         SQLite database
```

The gateway is the central Python service. It should receive node and SOS data, store it, expose REST/WebSocket APIs, and serve or coordinate with the browser interface. The ESP32 firmware is a separate C project. The frontend is plain HTML, CSS, and JavaScript without a bundler.

Important: the repository is currently a scaffold. Several routes, database operations, WebSocket behaviors, firmware features, and offline workflows are placeholders. A passing test currently proves that the scaffold responds, not that the complete emergency workflow is finished.

## 2. Install Prerequisites

For gateway and frontend work:

- Git
- Python 3.10 or newer
- PowerShell on Windows, or Bash on Linux/macOS
- A code editor such as VS Code

For firmware work:

- ESP-IDF 5.x
- CMake and the ESP32 toolchain
- A supported ESP32 board and USB cable

For Raspberry Pi deployment:

- Raspberry Pi OS
- SSH access
- `rsync`
- A configured Wi-Fi interface and serial/network access to the nodes

## 3. First-Time Gateway Setup

Run these commands from the repository root.

### Windows PowerShell

```powershell
python -m venv gateway\venv
gateway\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r gateway\requirements-dev.txt
Copy-Item gateway\.env.example gateway\.env
```

If PowerShell blocks activation, use the virtual-environment Python directly:

```powershell
gateway\venv\Scripts\python.exe -m pip install -r gateway\requirements-dev.txt
```

### Linux or Raspberry Pi

```bash
python3 -m venv gateway/venv
. gateway/venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r gateway/requirements-dev.txt
cp gateway/.env.example gateway/.env
```

Never commit `gateway/.env`. Replace the example `SECRET_KEY` before any shared or deployed use.

## 4. Run the Gateway

The reliable development command from the repository root is:

```powershell
# Windows, after activating gateway\venv
python -m uvicorn gateway.app.main:app --reload
```

```bash
# Linux/macOS, after activating gateway/venv
python -m uvicorn gateway.app.main:app --reload
```

Open `http://127.0.0.1:8000/docs` for FastAPI's generated API page and `http://127.0.0.1:8000/` for the frontend served by the gateway.

The older `cd gateway; python -m app.main` command is not currently reliable: `app.main` does not start Uvicorn and imports expect the repository root on `PYTHONPATH`.

## 5. Run the Frontend

The frontend needs HTTP rather than opening `index.html` directly, especially for modules and service workers:

```powershell
python -m http.server 5500 --directory frontend
```

Open `http://127.0.0.1:5500/` when using the separate static server. The page still loads Tailwind and Leaflet assets from public CDNs, so it is not fully offline when first loaded. API integration and true offline synchronization are still work items.

## 6. Run Tests

From the repository root, with `gateway/venv` active:

```powershell
python -m pytest -q
```

The current baseline is 12 passing tests. Tests mainly verify response shapes and status codes. They do not yet prove database persistence, frontend behavior, firmware behavior, WebSocket synchronization, or true offline operation.

If `pytest` reports `ModuleNotFoundError`, activate the gateway virtual environment or install the development requirements in the interpreter being used.

## 7. Understand the Folders

- `gateway/app/main.py`: FastAPI application and WebSocket entry point.
- `gateway/app/config.py`: environment-backed settings.
- `gateway/app/database.py`: SQLAlchemy engine, model base, and session dependency.
- `gateway/app/models/`: database model definitions.
- `gateway/app/routes/`: REST route modules.
- `frontend/index.html`: PWA shell and page layout.
- `frontend/js/`: browser modules for dashboard, map, SOS, missing persons, and volunteers.
- `frontend/service-worker.js`: intended offline cache and synchronization layer.
- `firmware/main/main.c`: ESP-IDF application entry point.
- `firmware/main/captive_portal.*`: intended node configuration portal.
- `firmware/main/heartbeat.*`: intended gateway heartbeat logic.
- `tests/`: FastAPI unit and integration tests.
- `scripts/`: setup and Raspberry Pi deployment helpers.
- `docs/`: architecture, API, and contributor documentation.

## 8. Build the Firmware

With ESP-IDF configured in the current shell:

```bash
cd firmware
idf.py set-target esp32
idf.py build
idf.py -p YOUR_SERIAL_PORT flash monitor
```

Use the correct serial port for the board. Do not flash an unknown device. The current firmware contains initialization and TODO logging, so a successful build does not mean the rescue-node protocol is complete.

## 9. A Safe Beginner Workflow

1. Pull the latest branch before starting.
2. Read `docs/architecture.md` and the relevant route/model file.
3. Make one small change with one focused test.
4. Run `python -m pytest -q`.
5. Test the browser manually when touching frontend code.
6. Review the diff for secrets, generated files, and unrelated changes.
7. Commit with a clear message and push your feature branch.

## 10. Current Known Gaps

Treat these as planned engineering work, not mysterious setup failures:

- The gateway serves `frontend/`, but the frontend is not yet fully integrated with the API.
- Database table creation and route persistence are not wired end to end.
- The `/ws/sync` handler does not process or broadcast messages.
- Service-worker caching references missing local assets and has TODO fallback/sync behavior.
- Several frontend screens are static and do not submit data to the API.
- Firmware captive portal and heartbeat logic are placeholders.
- `scripts/deploy.sh` does not install services, configure an access point, or set firewall rules.
- The API documentation is ahead of some route implementations.

When implementing one of these areas, update the matching tests and documentation in the same change.
