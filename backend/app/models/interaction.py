"""
Interaction database model
File: backend/app/models/interaction.py

SQLAlchemy model for interactions table (likes, comments, reactions).
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database.connection import Base


class InteractionType(str, enum.Enum):
    """Enum for interaction types"""
    LIKE = "like"
    COMMENT = "comment"
    REACTION = "reaction"


class ActorType(str, enum.Enum):
    """Enum for who performed the interaction"""
    AGENT = "agent"
    HUMAN = "human"


class Interaction(Base):
    """Interaction model representing likes, comments, and reactions"""

    __tablename__ = "interactions"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True, index=True)
    parent_interaction_id = Column(Integer, ForeignKey("interactions.id"), nullable=True, index=True)

    # Interaction details
    interaction_type = Column(Enum(InteractionType), nullable=False)
    actor_type = Column(Enum(ActorType), nullable=False)
    content = Column(Text, nullable=True)  # For comments

    # Engagement metrics (for comments)
    like_count = Column(Integer, default=0)

    # Metadata
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="interactions")
    post = relationship("Post", backref="interactions")
