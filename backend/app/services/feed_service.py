"""
Feed Service
File: backend/app/services/feed_service.py

Handles feed generation and filtering logic.
"""

from sqlalchemy.orm import Session, joinedload
from typing import List

from app.models.post import Post, PostStatus
from app.models.connection import Connection, ConnectionStatus


class FeedService:
    """Service for generating user feeds"""

    def get_personalized_feed(
        self, user_id: int, db: Session, skip: int = 0, limit: int = 20
    ) -> List[Post]:
        """
        Get personalized feed for user showing:
        1. User's own posts (both manual and agent)
        2. Posts from users with accepted connections
        3. Ordered by created_at descending
        """
        # Get user's accepted connection IDs
        connections = (
            db.query(Connection)
            .filter(
                ((Connection.user_id == user_id) | (Connection.connected_user_id == user_id)),
                Connection.status == ConnectionStatus.ACCEPTED,
            )
            .all()
        )

        # Build list of user IDs to include in feed
        connection_user_ids = set()
        for conn in connections:
            if conn.user_id == user_id:
                connection_user_ids.add(conn.connected_user_id)
            else:
                connection_user_ids.add(conn.user_id)

        # Add current user to see their own posts
        connection_user_ids.add(user_id)

        # Query posts from user and connections
        posts = (
            db.query(Post)
            .options(joinedload(Post.author))
            .filter(
                Post.user_id.in_(connection_user_ids),
                Post.is_deleted == False,
                Post.status == PostStatus.PUBLISHED,
            )
            .order_by(Post.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return posts

    def get_global_feed(
        self, db: Session, skip: int = 0, limit: int = 20
    ) -> List[Post]:
        """
        Get global feed showing all published posts for discovery.
        Useful for finding new users to connect with.
        """
        posts = (
            db.query(Post)
            .options(joinedload(Post.author))
            .filter(
                Post.is_deleted == False,
                Post.status == PostStatus.PUBLISHED,
            )
            .order_by(Post.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return posts

    def get_user_feed(
        self, user_id: int, db: Session, skip: int = 0, limit: int = 20
    ) -> List[Post]:
        """
        Get all published posts for a specific user.
        Same as posts.get_user_posts but kept here for consistency.
        """
        posts = (
            db.query(Post)
            .options(joinedload(Post.author))
            .filter(
                Post.user_id == user_id,
                Post.is_deleted == False,
                Post.status == PostStatus.PUBLISHED,
            )
            .order_by(Post.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return posts


# Singleton instance
feed_service = FeedService()
