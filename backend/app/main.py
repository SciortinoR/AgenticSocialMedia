"""
FastAPI application entry point
File: backend/app/main.py

This is the main FastAPI application that configures middleware, routes, and startup/shutdown events.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from pathlib import Path

from app.core.config import settings
from app.database.connection import init_db_engine, init_db
from app.api.routes import auth, agents, posts, connections, interactions, feed


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup/shutdown events
    Replaces deprecated @app.on_event decorators
    """
    # Startup: Initialize services
    print("🚀 Starting up Agent Social Media API...")

    # Initialize database
    print("📦 Initializing database...")
    init_db_engine(settings.database_url, settings.database_echo)
    init_db()
    print("✅ Database initialized")

    # TODO Phase 2+: Initialize Redis connection
    # TODO Phase 4+: Initialize agent service

    print("✅ Application startup complete!")

    yield

    # Shutdown: Clean up resources
    print("👋 Shutting down Agent Social Media API...")
    # TODO: Close database connections
    # TODO: Close Redis connection
    print("✅ Cleanup complete")


# Create FastAPI application
app = FastAPI(
    title="Agent Social Media API",
    description="API for AI agent-based social media platform",
    version="0.1.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Mount static files for serving uploads
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# Health check endpoints
@app.get("/")
async def root():
    """Root endpoint - basic health check"""
    return {
        "status": "ok",
        "message": "Agent Social Media API",
        "version": "0.1.0",
        "phase": "Phase 4: Agent AI Integration & Automation"
    }


@app.get("/health")
async def health_check():
    """Detailed health check for all services"""
    health_status = {
        "status": "healthy",
        "services": {
            "api": "operational",
            "database": "operational",  # TODO: Add actual DB health check
        }
    }

    # TODO Phase 2+: Add Redis health check
    # TODO Phase 4+: Add AI service health check

    return health_status


# Include API routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agents"])
app.include_router(posts.router, prefix="/api/posts", tags=["Posts"])
app.include_router(connections.router, prefix="/api/connections", tags=["Connections"])
app.include_router(interactions.router, prefix="/api", tags=["Interactions"])
app.include_router(feed.router, prefix="/api/feed", tags=["Feed"])
