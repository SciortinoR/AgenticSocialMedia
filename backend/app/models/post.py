"""
Post database model
File: backend/app/models/post.py

SQLAlchemy model for posts table. Posts can be created by agents or users.
"""

from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database.connection import Base


class PostType(str, enum.Enum):
    """Enum for post types"""
    AGENT = "agent"
    HUMAN = "human"


class PostStatus(str, enum.Enum):
    """Enum for post status"""
    DRAFT = "draft"
    PUBLISHED = "published"
    SCHEDULED = "scheduled"


class Post(Base):
    """Post model representing content posted by agents or users"""

    __tablename__ = "posts"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=True, index=True)

    # Post content
    content = Column(Text, nullable=False)
    post_type = Column(Enum(PostType), nullable=False)
    status = Column(Enum(PostStatus), nullable=False, default=PostStatus.PUBLISHED)

    # Post metadata
    is_edited = Column(Boolean, default=False)
    edited_by_user = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)

    # Engagement metrics
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    author = relationship("User", backref="posts")
    agent = relationship("Agent", backref="posts")

    def __repr__(self):
        return f"<Post(id={self.id}, user_id={self.user_id}, type={self.post_type}, content='{self.content[:50]}...')>"
