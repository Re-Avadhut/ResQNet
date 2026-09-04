"""ResQNet Gateway Application.

Run from the REPOSITORY ROOT (not from inside gateway/):

    python -m gateway.app.main              # simple run
    uvicorn gateway.app.main:app --reload   # dev run with auto-reload
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from gateway.app.config import get_settings
from gateway.app.database import create_tables
from gateway.app import models  # noqa: F401 - registers all tables on Base
from gateway.app import routes

settings = get_settings()

# Repository root -> gateway/app/main.py has parents: [0]=app, [1]=gateway, [2]=repo root
FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup.

    Fine while the schema is still moving. Once the schema stabilises this
    should be replaced with real migrations (Alembic).
    """
    create_tables()
    yield


app = FastAPI(
    title="ResQNet Gateway",
    description="Disaster operating platform - Raspberry Pi gateway for emergency communications",
    version="0.1.0",
    lifespan=lifespan,
)

# Middleware
# NOTE: allow_credentials must stay False while allow_origins is ["*"] —
# browsers reject that combination outright.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Routes
app.include_router(routes.nodes.router, prefix="/api/v1/nodes", tags=["nodes"])
app.include_router(routes.capabilities.router, prefix="/api/v1/capabilities", tags=["capabilities"])
app.include_router(routes.sos.router, prefix="/api/v1/sos", tags=["sos"])
app.include_router(routes.messaging.router, prefix="/api/v1/messages", tags=["messaging"])
app.include_router(routes.dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])


@app.get("/api/v1/health", tags=["health"])
async def health():
    """Liveness probe used by the PWA to detect whether the gateway is up.

    The browser's navigator.onLine only reports whether the device has *a*
    network connection. A phone can be joined to the node's Wi-Fi with the Pi
    powered off and still report "online", so the PWA checks this instead.
    Keep it cheap: it is polled every 20 seconds by every connected client.
    """
    return {
        "status": "ok",
        "service": "resqnet-gateway",
        "version": app.version,
        # Lets the map decide whether to add a tile layer at all. Probing
        # for a tile directly would log a 404 in the console on every
        # deployment that has no pack installed, which is most of them.
        "tiles_available": (FRONTEND_DIR / "assets" / "tiles").is_dir(),
    }


# WebSocket for real-time sync
@app.websocket("/ws/sync")
async def websocket_sync(websocket: WebSocket):
    """WebSocket endpoint for heartbeat and sync with rescue nodes.

    TODO: Implement heartbeat / sync_request handling (see docs/api.md).
    """
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Process sync events
            pass
    except Exception:
        pass
    finally:
        await websocket.close()


# Serve the PWA. This mount is LAST on purpose: FastAPI matches routes in the
# order they were added, so /api/v1/* and /ws/sync still win over the catch-all.
if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")


def main() -> None:
    """Entry point for `python -m gateway.app.main`."""
    import uvicorn

    uvicorn.run(app, host=settings.host, port=settings.port)


if __name__ == "__main__":
    main()
