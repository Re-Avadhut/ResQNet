# CLAUDE.md — ResQNet Working Agreement

This file is the single source of truth for how work happens in this repo.
It is read automatically by Claude Code at the start of every session, and it is
written to be readable by every human on the team too.

**If you are a teammate reading this for the first time: start at
[Section 4 — Git for people who have never used Git](#4-git-for-people-who-have-never-used-git).**

---

## 1. Absolute rules

These are non-negotiable. They override default behaviour and any general
convention.

### R1 — Ask before acting
Do not make changes, run destructive commands, install things, commit, push, or
create/delete branches **without explicit permission from Sumanth.** Propose
first, wait for a yes, then act. Reading, searching, and explaining are always
allowed without asking.

### R2 — Scope: CSE only
Work is limited to the **software** side of the project:

| ✅ In scope | ❌ Out of scope |
| --- | --- |
| `gateway/` — FastAPI backend, API, database | `firmware/` — ESP32 / ESP-IDF C code |
| `frontend/` — PWA, UI, JavaScript, CSS | Hardware wiring, sensors, LoRa, GPS modules |
| `tests/` — backend + integration tests | Anything ECE/electronics |
| `docs/` — API specs, architecture | Board configuration, `sdkconfig` |

If something in `firmware/` genuinely blocks CSE work, **ask once**, explain why,
and wait. Do not edit hardware code on your own initiative.

### R3 — Stay on the tech stack
Do not introduce new frameworks, languages, or build tools. The stack is fixed
(see [Section 2](#2-the-tech-stack-locked)). If something seems to need a new
dependency, propose it and explain why the existing stack cannot do it.

### R4 — Assume no Git knowledge
The team is new to Git and GitHub. Every Git operation must be explained in plain
language before it runs — what it does, what it changes, and how to undo it.
Never run a Git command that rewrites history or discards work
(`reset --hard`, `push --force`, `rebase`, `clean -fd`) without explicit,
specific permission for that exact command.

### R5 — Keep this file current
Every meaningful change gets logged in [Section 7 — Change log](#7-change-log)
so the whole team can follow what happened and why, without reading diffs.

---

## 2. The tech stack (locked)

| Layer | Technology | Notes |
| --- | --- | --- |
| Backend | **Python 3.13** + **FastAPI** | Routes in `gateway/app/routes/` |
| Database | **SQLAlchemy 2.0** + **SQLite** | Postgres is the future migration path |
| Config | **pydantic-settings** | Reads `gateway/.env` |
| Server | **uvicorn** | ASGI server |
| Frontend | **Vanilla JavaScript** (ES modules) | No React, no Vue, no build step |
| Styling | **TailwindCSS** (CDN for now) | Custom colours defined in `index.html` |
| Maps | **Leaflet 1.9.4** | Offline tiles planned |
| Offline | **Service Worker + PWA manifest** | `frontend/service-worker.js` |
| Tests | **pytest** + **httpx** | `tests/` |
| Firmware | ESP-IDF 5.x (C) | **Not our scope** — see R2 |

---

## 3. How the system fits together

```
  ESP32 Rescue Nodes  ──Wi-Fi/LoRa──►  Raspberry Pi Gateway  ──serves──►  PWA (browser)
  (firmware/ — ECE)                    (gateway/ — ours)                  (frontend/ — ours)
       │                                      │                                 │
       │  capability descriptor JSON          │  SQLite database                │  works offline
       └──────────────────────────────────────┴─────────────────────────────────┘
```

**The core idea — capability-driven design.** Each ESP32 node reports a JSON
descriptor saying what hardware it has (GPS, camera, IMU…). The gateway stores
that and the dashboard is built from whatever the nodes actually report, instead
of a fixed hardcoded list of features.

**One process serves everything.** When you run the gateway it serves both the
JSON API *and* the PWA on the same port. There is no separate frontend server.

- `http://localhost:8000/` → the PWA
- `http://localhost:8000/api/v1/…` → the JSON API
- `http://localhost:8000/docs` → auto-generated interactive API docs (very useful)

### Request path, end to end

```
Browser  →  frontend/js/app.js (ApiClient)
         →  POST /api/v1/sos/report
         →  gateway/app/routes/sos.py        ← the endpoint
         →  gateway/app/models/sos.py        ← the database table
         →  SQLite (resqnet.db)
```

When you add a feature you almost always touch those same four layers in that
order.

---

## 4. Git for people who have never used Git

### The words

| Word | What it actually means |
| --- | --- |
| **repository (repo)** | The project folder, plus its full history |
| **commit** | A save point. A labelled snapshot of the project |
| **branch** | A parallel copy of the project where you can work without affecting anyone else |
| **`main`** | The official branch. Must always work |
| **push** | Upload your commits to GitHub |
| **pull** | Download other people's commits from GitHub |
| **merge** | Combine one branch's work into another |
| **fork** | A *whole separate copy of the repo* under a different GitHub account |

### Branch vs fork — the thing to understand

You asked for a "fork". In Git that word means something specific, and a
**branch** is what actually fits what you described:

- A **branch** stays inside this same repository. Everyone on the team can see it
  and push to it. This is the normal way a team works together.
- A **fork** is an entirely separate repository under a different account. It is
  what outsiders use to contribute to a project they do not have access to. For a
  small team on one project, a fork adds a lot of friction for no benefit.

**A branch was created: `dev`.** All our work happens there. `main` stays clean
and untouched until we decide to merge. If a real GitHub fork is genuinely
wanted instead, say so and it can be set up — but a branch is the right tool here.

### Our branch layout

```
main   ← official, always works, nobody commits here directly
  │
  └── dev   ← our working branch, all changes land here first
```

Later, if a change is large or risky, branch off `dev`:

```
dev
 └── feature/sos-endpoint   ← one branch per feature, merged back into dev
```

### The commands you will actually use

```bash
git status                  # What have I changed? Run this constantly. It is always safe.
git branch --show-current   # Which branch am I on right now?
git checkout dev            # Switch to the dev branch
git add .                   # Stage all your changes (mark them ready to save)
git commit -m "message"     # Create the save point
git push origin dev         # Upload dev to GitHub
git pull origin dev         # Download teammates' latest work
git log --oneline           # See the history of save points
```

### Rules of thumb

1. **Run `git status` before and after everything.** It is read-only and cannot
   break anything.
2. **Never commit directly to `main`.** Work on `dev`.
3. **Pull before you start working**, so you are not editing an old version.
4. **Commit often with real messages.** `"fixed SOS endpoint validation"`, not `"update"`.
5. **If something looks scary, stop and ask.** Almost everything in Git is
   recoverable — but only if you have not run a "destructive" command yet.
6. **Never run these without asking:** `git reset --hard`, `git push --force`,
   `git rebase`, `git clean -fd`. These are the commands that actually delete work.

### If you break something

Your work is almost never truly gone. Say what you ran and what happened —
do not run more commands trying to fix it, because that is what usually turns a
recoverable mistake into a real one.

---

## 5. How to run the project

Every command runs from the **repository root** (`ResQNet/`), *not* from inside
`gateway/`. This matters — the code imports itself as `gateway.app.…`, which only
resolves from the root.

### First-time setup

```bash
# 1. Create the virtual environment (an isolated Python install for this project)
python -m venv gateway/venv

# 2. Activate it
gateway\venv\Scripts\activate      # Windows (PowerShell)
source gateway/venv/bin/activate   # macOS / Linux / Raspberry Pi

# 3. Install dependencies
pip install -r gateway/requirements-dev.txt

# 4. Create your local config file
cp gateway/.env.example gateway/.env
```

### Every day

```bash
uvicorn gateway.app.main:app --reload    # start the server, auto-restarts on save
pytest tests -q                          # run the tests
```

Then open <http://localhost:8000/> for the app, or <http://localhost:8000/docs>
for the interactive API explorer.

### Important files

| File | What it is |
| --- | --- |
| `gateway/app/main.py` | Starts the app, wires up routes, serves the PWA |
| `gateway/app/routes/*.py` | The API endpoints — **most backend work happens here** |
| `gateway/app/models/*.py` | Database table definitions |
| `gateway/app/config.py` | Settings, read from `gateway/.env` |
| `frontend/js/app.js` | Frontend routing + the `ApiClient` used to call the API |
| `frontend/js/*/` | One folder per page (dashboard, sos, map, …) |
| `docs/api.md` | **The API contract.** Build to match this document |

### Things that will trip you up

- `gateway/.env` is **not** in Git (it is ignored on purpose, since it can hold
  secrets). Every person creates their own by copying `.env.example`.
- `resqnet.db` is also not in Git. It is created automatically on first run.
- `gateway/venv/` is not in Git either. Everyone builds their own.
- Do not open `frontend/index.html` by double-clicking it. It uses absolute paths
  and only works when served by the gateway.

---

## 6. Current status

**The project is a scaffold.** The structure is complete and the app runs, but
almost nothing is implemented yet. Every API endpoint returns hardcoded empty
data (`{"nodes": []}`) and never touches the database. There were **73 `TODO`
markers** at the point this file was written.

`docs/api.md` is the exception — it is a genuinely complete 625-line
specification of the API we intend to build. **Treat it as the contract.** When
implementing an endpoint, make it match that document rather than inventing a
new shape.

### What is real vs. what is a placeholder

| Area | Status |
| --- | --- |
| Project structure | ✅ Complete |
| App boots and serves API + PWA | ✅ Working |
| Database schema (8 tables) | ✅ Defined and creates correctly |
| Test suite runs | ✅ 11 tests pass |
| API endpoint **logic** | ❌ All stubs — return fake empty data |
| Database reads/writes from endpoints | ❌ Not connected at all |
| Frontend pages | ❌ Static HTML, no data loading |
| WebSocket `/ws/sync` | ❌ Accepts connections, does nothing |
| Service worker offline caching | ⚠️ Installs correctly now, strategy not implemented |
| True offline capability | ❌ Blocked — Tailwind + Leaflet still load from a CDN |

---

## 7. Change log

### 2026-09-04 — Session 1: repo audit + unblocking fixes

Created branch **`dev`** off `main`. All changes below are on `dev`; `main` is untouched.

**The app could not start at all before this.** Three separate bugs each
independently prevented it from running:

| # | Problem | Fix |
| --- | --- | --- |
| 1 | `config.py` imported `pydantic_settings`, which was missing from `requirements.txt` and not installed. Instant `ModuleNotFoundError`. | Added `pydantic-settings>=2.0.0` to `gateway/requirements.txt` |
| 2 | Four models declared a column literally named `metadata`. That name is **reserved** by SQLAlchemy — defining it raises `InvalidRequestError`. | Renamed the *Python* attribute to `extra_data` while keeping the *database* column named `metadata`, via `Column("metadata", JSON)`. This preserves the `"metadata"` field documented in `docs/api.md`. |
| 3 | No `models/__init__.py`, and nothing imported the models. SQLAlchemy therefore knew about **zero** tables — `create_all()` would have silently created an empty database. | Added `gateway/app/models/__init__.py` importing all 8 models. This is also why bug #2 had never surfaced. |

**Backend fixes**

- `main.py` rewritten:
  - Added a `lifespan` handler so **database tables are actually created on startup**.
  - **The PWA is now served by the gateway** via `StaticFiles`, which the README always claimed but the code never did. The mount is registered *last* so `/api/v1/*` still takes priority.
  - Added a `__main__` block so `python -m gateway.app.main` genuinely starts the server. Previously that command started nothing.
  - Fixed CORS: `allow_credentials` was `True` alongside `allow_origins=["*"]`, a combination browsers reject outright. Also removed `"WS"` from `allow_methods` — it is not an HTTP method — and added the missing `PUT`/`DELETE`.
- `node.py`: `server_default="CURRENT_TIMESTAMP"` was a plain string, which SQLAlchemy would have written as a literal quoted value rather than SQL. Now `text("CURRENT_TIMESTAMP")`.
- `config.py`: migrated from the deprecated `class Config` to `SettingsConfigDict`; removed an unused `import os`.
- Split dependencies: `requirements.txt` (runtime, for the Raspberry Pi) and `requirements-dev.txt` (adds `pytest` + `httpx`). Neither test dependency was previously declared, so the tests could not run anywhere.

**Frontend fixes**

- `service-worker.js`: the precache list contained `/css/tailwind.css`, a file that does not exist and is even in `.gitignore`. Because `cache.addAll()` is all-or-nothing, this made `install()` reject every single time — **the service worker never activated, so offline mode was silently dead.** Removed it and the two cross-origin CDN entries; added the real `/css/styles.css`.
- `index.html`: custom Tailwind colours were flat values (`emergency: '#dc2626'`), but the markup used `bg-emergency-600`. Tailwind only generates classes for keys that exist, so the header had **no background colour at all**. Gave each colour a proper 500/600/700 scale.
- `index.html`: removed the `/favicon.ico` link — the file does not exist, so it 404'd on every page load.
- `app.js`: the WebSocket URL was hardcoded to `ws://`, which fails on an HTTPS page. Now selects `wss://` automatically.

**Tests**

- `conftest.py` added `<root>/gateway` to `sys.path` but the code imports `gateway.app.main`, so the path entry was wrong. Now adds the repository root.
- Result: **11 tests pass** (they previously could not even be collected).

**Docs**

- `README.md`: corrected the run instructions. They said `cd gateway && python -m app.main`, which fails twice over — the `gateway` package is not importable from inside `gateway/`, and there was no `__main__` block. Documented the tests, the repo-root rule, and the fact that `index.html` must be opened through the gateway.
- Removed the dead link to `docs/srs.md`, which does not exist.

**Verified working:** server boots clean, `/` serves the PWA, `/api/v1/*` responds,
`/docs` loads, all 8 database tables create with correct columns, 11/11 tests pass.

**Deliberately not touched:** everything in `firmware/` (rule R2). Issues were
found there and are recorded in Section 8 for the hardware team.

---

## 8. Known issues not yet fixed

### Needs a decision from Sumanth

1. **The PWA is not actually offline-capable.** Tailwind and Leaflet load from
   `cdn.tailwindcss.com` and `unpkg.com`. In a disaster zone with no internet the
   app would render unstyled and the map would not load at all — which defeats the
   entire premise of the project. **Fix:** download both into `frontend/vendor/`
   and reference them locally. This is the highest-impact remaining issue.
   *Not done yet because it adds vendored files and edits `index.html` — needs a yes.*

2. **PWA app icons are missing.** `manifest.json` points at `/assets/icon-192.png`
   and `/assets/icon-512.png`, neither of which exists, so the app cannot be
   installed to a phone home screen. Needs either a logo from the team or a
   generated placeholder.

3. **No `LICENSE` file** even though `README.md` states MIT. That is the repo
   owner's call, not ours.

4. **No authentication anywhere**, by design for now — `docs/api.md` says so
   explicitly. Worth a conscious decision before this is ever deployed publicly.

### Flagged for the hardware/ECE team — do not fix (R2)

5. `firmware/sdkconfig.defaults` sets `CONFIG_WIFI_SSID` and
   `CONFIG_WIFI_PASSWORD`, which are not real ESP-IDF options without a
   `Kconfig.projbuild` file (missing). They will be **silently ignored**.
6. The same file uses `CONFIG_ESP32_WIFI_*` names, which are the pre-5.x spelling
   (now `CONFIG_ESP_WIFI_*`) — this contradicts the stated ESP-IDF 5.x target.
7. The Wi-Fi AP password is hardcoded as `resqnet123`.
8. `firmware/main/main.c` calls `esp_netif_init()` without including `esp_netif.h`.

### Lower priority

9. `docs/architecture.md` claims a `gateway/app/websocket/` directory exists. It
   does not — the WebSocket handler lives in `main.py`.
10. Tests only assert the shape of stub responses. They will need real assertions
    as endpoints get implemented.

---

## 9. Suggested next step

The three blocking bugs are fixed, so the app now runs and the database works.
The natural first real feature is one **complete vertical slice**, proving the
whole path from browser to database works before repeating the pattern:

> **Node registration → capability sync → dashboard overview**

Chosen because `docs/api.md` already specifies it precisely, and it is the spine
the rest of the system hangs off. It would mean:

1. Connect `routes/nodes.py` to the database (currently returns fake data)
2. Connect `routes/capabilities.py` to store descriptors
3. Make `routes/dashboard.py` count real rows instead of returning zeros
4. Make the frontend dashboard fetch and display those real numbers
5. Write tests that assert real behaviour, not stub shapes

Awaiting the go-ahead before starting.

### Available tooling worth knowing about

For frontend/UI work later there are design skills installed (Tailwind-aware
design systems, UI review, accessibility auditing) that can raise the quality of
the PWA considerably. Per **R1**, these will always be named and permission asked
before use — never invoked silently.
