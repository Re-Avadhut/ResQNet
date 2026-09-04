"""Database configuration and session management."""

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from gateway.app.config import get_settings

settings = get_settings()

# Determine if using async database URL (for PostgreSQL+asyncpg) or sync (for SQLite)
DATABASE_URL = settings.database_url
if DATABASE_URL.startswith("sqlite"):
    # SQLite with sync engine
    engine = create_engine(
        DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    AsyncSessionLocal = None
else:
    # PostgreSQL or other async database
    engine = create_async_engine(DATABASE_URL, echo=False)
    AsyncSessionLocal = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    SessionLocal = None  # Not used for async engines

# Base class for declarative models
Base = declarative_base()


def get_db():
    """Dependency for getting DB session."""
    if SessionLocal:
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
    else:
        # Async case - for FastAPI dependencies, you'd need async generator
        # This is a simplified sync version for scaffolding
        raise NotImplementedError("Async DB session dependency not implemented yet")


def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)