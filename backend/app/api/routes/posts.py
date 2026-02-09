"""
Post API routes
File: backend/app/api/routes/posts.py

Handles post creation, retrieval, and interactions.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database.connection import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.post import Post, PostType
from app.schemas.post import PostCreate, PostUpdate, PostResponse

router = APIRouter()


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new post (by user, not agent)"""
    post = Post(
        user_id=current_user.id,
        agent_id=None,
        content=post_data.content,
        post_type=PostType.HUMAN,
        status=post_data.status,
    )

    db.add(post)
    db.commit()
    db.refresh(post)

    return post


@router.get("/", response_model=List[PostResponse])
async def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all posts for current user (from user and their agent)"""
    posts = (
        db.query(Post)
        .options(joinedload(Post.author))
        .filter(
            Post.user_id == current_user.id,
            Post.is_deleted == False
        )
        .order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return posts


@router.get("/user/{user_id}", response_model=List[PostResponse])
async def get_user_posts(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all published posts for a specific user"""
    posts = (
        db.query(Post)
        .options(joinedload(Post.author))
        .filter(
            Post.user_id == user_id,
            Post.is_deleted == False,
            Post.status == "published"
        )
        .order_by(Post.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return posts


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific post"""
    post = db.query(Post).options(joinedload(Post.author)).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this post"
        )

    return post


@router.put("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: int,
    post_update: PostUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a post"""
    post = db.query(Post).options(joinedload(Post.author)).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to edit this post"
        )

    update_data = post_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(post, field, value)

    post.is_edited = True
    if post.post_type == PostType.AGENT:
        post.edited_by_user = True

    db.commit()
    db.refresh(post)

    return post


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a post (soft delete)"""
    post = db.query(Post).options(joinedload(Post.author)).filter(Post.id == post_id).first()

    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this post"
        )

    post.is_deleted = True
    db.commit()

    return None
