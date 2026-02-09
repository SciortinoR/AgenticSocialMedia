"""
Database connection and session management
File: backend/app/database/connection.py

Handles SQLAlchemy engine, session creation, and database initialization.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

# Base class for models - must be defined before importing models
Base = declarative_base()

# These will be initialized in init_db_engine
engine = None
SessionLocal = None


def init_db_engine(database_url: str, echo: bool = False):
    """Initialize database engine and session factory"""
    global engine, SessionLocal

    engine = create_engine(database_url, echo=echo)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Initialize database tables - creates all tables defined in models"""
    # Import all models to ensure they're registered with Base.metadata
    from app.models import user, agent, post, agent_action, connection, interaction

    # Create all tables
    Base.metadata.create_all(bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Get database session for dependency injection

    Usage in FastAPI:
        @app.get("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
