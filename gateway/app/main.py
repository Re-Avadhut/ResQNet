"""ResQNet Gateway Application."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from gateway.app.config import Settings
from gateway.app.database import create_tables
from gateway.app import routes
from gateway.app import models  # noqa: F401  # Register ORM models before startup.

FRONTEND_DIR = Path(__file__).resolve().parents[2] / "frontend"


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Initialize local persistence before serving requests."""
    create_tables()
    yield

# Create database tables on startup
# Base.metadata.create_all(bind=engine)  # In production, use migrations

app = FastAPI(
    title="ResQNet Gateway",
    description="Disaster operating platform - Raspberry Pi gateway for emergency communications",
    version="0.1.0",
    lifespan=lifespan,
)

# Middleware
app.add_middleware(CORSMiddleware,
                   allow_origins=["*"],
                   allow_credentials=True,
                   allow_methods=["GET", "POST", "WS", "OPTIONS"],
                   )

# Routes
app.include_router(routes.nodes.router, prefix="/api/v1/nodes", tags=["nodes"])
app.include_router(routes.capabilities.router,
                   prefix="/api/v1/capabilities", tags=["capabilities"])
app.include_router(routes.sos.router, prefix="/api/v1/sos", tags=["sos"])
app.include_router(routes.messaging.router,
                   prefix="/api/v1/messages", tags=["messaging"])
app.include_router(routes.dashboard.router,
                   prefix="/api/v1/dashboard", tags=["dashboard"])

# WebSocket for real-time sync


@app.websocket("/ws/sync")
async def websocket_sync(websocket: WebSocket):
    """WebSocket endpoint for heartbeat and sync with rescue nodes."""
    await websocket.accept()
    # Handle connection lifecycle
    try:
        while True:
            data = await websocket.receive_text()
            # Process sync events
            pass
    except Exception:
        pass
    finally:
        await websocket.close()


if FRONTEND_DIR.is_dir():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR,
              html=True), name="frontend")
