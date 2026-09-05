# ResQNet AI Context

## Project Identity

ResQNet is an offline-first disaster communication platform under active development. It is a team project, not a finished production emergency system. Do not describe placeholder code as complete or recommend deploying it for real emergency operations without explicit verification.

## Architecture

```text
ESP32 rescue nodes -> Raspberry Pi FastAPI gateway -> browser PWA
                              |
                         SQLAlchemy / SQLite
```

- `firmware/` is an ESP-IDF 5.x C project for ESP32 nodes.
- `gateway/` is a Python FastAPI application with SQLAlchemy models and REST/WebSocket routes.
- `frontend/` is vanilla HTML/CSS/JavaScript with a service worker and Leaflet UI.
- `tests/` contains Python API tests.
- `scripts/` contains Windows/Linux setup and Raspberry Pi deployment helpers.
- `docs/` contains architecture, API, and contributor guidance.

## Current State

The gateway now initializes the registered SQLite models and serves `frontend/`, but route persistence, complete validation, and WebSocket synchronization remain incomplete. Firmware captive portal and heartbeat behavior are placeholders. The service worker has an app-shell cache, while true offline data synchronization and local CDN replacements remain incomplete. Tests mostly check response status and shape.

The verified development test command is:

```bash
python -m pytest -q
```

The verified development gateway command is:

```bash
python -m uvicorn gateway.app.main:app --reload
```

Run those from the repository root with the gateway virtual environment active. Do not recommend `python -m app.main` from `gateway/` as the primary command; it does not currently start Uvicorn and package imports expect the repository root.

## Engineering Rules

1. Inspect the owning implementation and nearby tests before editing.
2. Make the smallest focused change and preserve existing public API contracts unless the task requires a contract change.
3. Never add secrets, real emergency data, private keys, database files, virtual environments, firmware build output, or generated editor files.
4. Do not force-push or rewrite shared branches without explicit approval.
5. For backend changes, add or update tests for success, validation, and failure behavior.
6. For frontend changes, test in a browser and check both online and offline states when relevant.
7. For firmware changes, check ESP-IDF build output and state the board/flash assumptions.
8. Keep documentation synchronized with commands, endpoints, schemas, and actual implementation.
9. Flag security, data-loss, privacy, or deployment risks prominently.
10. If code is a stub, preserve the explicit TODO and describe the missing behavior rather than hiding it.

## Review Priorities

When reviewing work, prioritize in this order:

1. Data loss, unsafe defaults, secrets, privacy, and emergency-message integrity.
2. Broken startup, routing, persistence, synchronization, and API contract mismatches.
3. Tests that pass without exercising the claimed behavior.
4. Offline/PWA reliability and missing assets.
5. Maintainability and documentation accuracy.

When reporting findings, lead with concrete issues, include file paths and line references where available, explain user impact, and separate confirmed defects from follow-up ideas.
