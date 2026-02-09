"""
Interaction API routes
File: backend/app/api/routes/interactions.py

Handles likes, comments, and reactions on posts.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List

from app.database.connection import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.post import Post
from app.models.interaction import Interaction, InteractionType, ActorType
from app.schemas.interaction import LikeCreate, CommentCreate, CommentUpdate, InteractionResponse

router = APIRouter()


@router.get("/posts/{post_id}/like/status")
async def check_like_status(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked this post"""
    like = db.query(Interaction).filter(
        Interaction.post_id == post_id,
        Interaction.user_id == current_user.id,
        Interaction.interaction_type == InteractionType.LIKE,
        Interaction.parent_interaction_id == None
    ).first()

    return {"isLiked": like is not None}


@router.post("/posts/{post_id}/like", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Like a post"""
    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # Check if user already liked this post
    existing_like = db.query(Interaction).filter(
        Interaction.post_id == post_id,
        Interaction.user_id == current_user.id,
        Interaction.interaction_type == InteractionType.LIKE,
        Interaction.parent_interaction_id == None
    ).first()

    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already liked this post"
        )

    # Create like
    like = Interaction(
        user_id=current_user.id,
        post_id=post_id,
        parent_interaction_id=None,
        interaction_type=InteractionType.LIKE,
        actor_type=ActorType.HUMAN,
        content=None
    )

    db.add(like)

    # Increment like count on post
    post.like_count += 1

    db.commit()
    db.refresh(like)

    return like


@router.delete("/posts/{post_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_post(
    post_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Unlike a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # Find the like
    like = db.query(Interaction).filter(
        Interaction.post_id == post_id,
        Interaction.user_id == current_user.id,
        Interaction.interaction_type == InteractionType.LIKE,
        Interaction.parent_interaction_id == None
    ).first()

    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )

    # Delete like
    db.delete(like)

    # Decrement like count on post
    if post.like_count > 0:
        post.like_count -= 1

    db.commit()

    return None


@router.post("/posts/{post_id}/comments", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
async def comment_on_post(
    post_id: int,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Comment on a post"""
    # Check if post exists
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    # Create comment
    comment = Interaction(
        user_id=current_user.id,
        post_id=post_id,
        interaction_type=InteractionType.COMMENT,
        actor_type=ActorType.HUMAN,
        content=comment_data.content
    )

    db.add(comment)

    # Increment comment count on post
    post.comment_count += 1

    db.commit()
    db.refresh(comment)

    return comment


@router.get("/posts/{post_id}/comments", response_model=List[InteractionResponse])
async def get_comments(
    post_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get comments for a post"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )

    comments = (
        db.query(Interaction)
        .options(joinedload(Interaction.user))
        .filter(
            Interaction.post_id == post_id,
            Interaction.interaction_type == InteractionType.COMMENT,
            Interaction.is_deleted == False
        )
        .order_by(Interaction.created_at.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return comments


@router.put("/comments/{comment_id}", response_model=InteractionResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a comment"""
    comment = db.query(Interaction).filter(
        Interaction.id == comment_id,
        Interaction.interaction_type == InteractionType.COMMENT
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own comments"
        )

    comment.content = comment_update.content
    comment.is_edited = True

    db.commit()
    db.refresh(comment)

    return comment


@router.delete("/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a comment (soft delete)"""
    comment = db.query(Interaction).filter(
        Interaction.id == comment_id,
        Interaction.interaction_type == InteractionType.COMMENT
    ).first()

    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    if comment.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own comments"
        )

    # Soft delete
    comment.is_deleted = True

    # Decrement comment count on post
    post = db.query(Post).filter(Post.id == comment.post_id).first()
    if post and post.comment_count > 0:
        post.comment_count -= 1

    db.commit()

    return None


@router.get("/comments/{comment_id}/like/status")
async def check_comment_like_status(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check if current user has liked this comment"""
    like = db.query(Interaction).filter(
        Interaction.parent_interaction_id == comment_id,
        Interaction.user_id == current_user.id,
        Interaction.interaction_type == InteractionType.LIKE
    ).first()

    return {"isLiked": like is not None}


@router.post("/comments/{comment_id}/like", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
async def like_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Like a comment"""
    # Check if comment exists
    comment = db.query(Interaction).filter(
        Interaction.id == comment_id,
        Interaction.interaction_type == InteractionType.COMMENT
    ).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Check if user already liked this comment
    existing_like = db.query(Interaction).filter(
        Interaction.parent_interaction_id == comment_id,
        Interaction.user_id == current_user.id,
        Interaction.interaction_type == InteractionType.LIKE
    ).first()

    if existing_like:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already liked this comment"
        )

    # Create like
    like = Interaction(
        user_id=current_user.id,
        post_id=comment.post_id,
        parent_interaction_id=comment_id,
        interaction_type=InteractionType.LIKE,
        actor_type=ActorType.HUMAN,
        content=None
    )

    db.add(like)

    # Increment like count on comment
    comment.like_count += 1

    db.commit()
    db.refresh(like)

    return like


@router.delete("/comments/{comment_id}/like", status_code=status.HTTP_204_NO_CONTENT)
async def unlike_comment(
    comment_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Unlike a comment"""
    comment = db.query(Interaction).filter(
        Interaction.id == comment_id,
        Interaction.interaction_type == InteractionType.COMMENT
    ).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Comment not found"
        )

    # Find the like
    like = db.query(Interaction).filter(
        Interaction.parent_interaction_id == comment_id,
        Interaction.user_id == current_user.id,
        Interaction.interaction_type == InteractionType.LIKE
    ).first()

    if not like:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Like not found"
        )

    # Delete like
    db.delete(like)

    # Decrement like count on comment
    if comment.like_count > 0:
        comment.like_count -= 1

    db.commit()

    return None
