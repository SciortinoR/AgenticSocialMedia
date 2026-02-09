"""
AgentAction database model
File: backend/app/models/agent_action.py

SQLAlchemy model for agent_actions table. Logs all actions taken by agents.
"""

from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database.connection import Base


class ActionType(str, enum.Enum):
    """Enum for agent action types"""
    POST_CREATED = "post_created"
    COMMENT_CREATED = "comment_created"
    LIKE_GIVEN = "like_given"
    CONNECTION_REQUESTED = "connection_requested"
    MESSAGE_SENT = "message_sent"
    TASK_COMPLETED = "task_completed"


class ActionStatus(str, enum.Enum):
    """Enum for action status"""
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    COMPLETED = "completed"
    EDITED_BY_USER = "edited_by_user"
    REJECTED = "rejected"
    DELETED_BY_USER = "deleted_by_user"


class AgentAction(Base):
    """AgentAction model logging all agent activities"""

    __tablename__ = "agent_actions"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    agent_id = Column(Integer, ForeignKey("agents.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=True)

    # Action details
    action_type = Column(Enum(ActionType), nullable=False)
    status = Column(Enum(ActionStatus), default=ActionStatus.COMPLETED)
    description = Column(Text)
    action_metadata = Column(JSON, default=dict)

    # Learning data
    user_feedback = Column(String, nullable=True)  # positive, negative, neutral
    engagement_score = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agent = relationship("Agent", backref="actions")
    user = relationship("User", backref="agent_actions")
    post = relationship("Post", backref="agent_action")

    def __repr__(self):
        return f"<AgentAction(id={self.id}, agent_id={self.agent_id}, type={self.action_type}, status={self.status})>"
