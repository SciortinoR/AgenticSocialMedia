"""
Feed API routes
File: backend/app/api/routes/feed.py

Handles feed generation and retrieval.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.schemas.post import PostResponse
from app.services.feed_service import feed_service

router = APIRouter()

@router.get("/", response_model=List[PostResponse])
async def get_feed(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get personalized feed for current user (own posts + connections' posts)"""
    posts = feed_service.get_personalized_feed(
        user_id=current_user.id, db=db, skip=skip, limit=limit
    )
    return posts

@router.get("/all", response_model=List[PostResponse])
async def get_global_feed(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get global feed showing all published posts for discovery"""
    posts = feed_service.get_global_feed(db=db, skip=skip, limit=limit)
    return posts

@router.get("/user/{user_id}", response_model=List[PostResponse])
async def get_user_feed(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get all published posts for a specific user"""
    posts = feed_service.get_user_feed(
        user_id=user_id, db=db, skip=skip, limit=limit
    )
    return posts
