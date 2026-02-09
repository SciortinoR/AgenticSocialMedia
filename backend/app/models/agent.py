"""
Agent database model
File: backend/app/models/agent.py

SQLAlchemy model for agents table. Each user has one agent.
"""

from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base


class Agent(Base):
    """Agent model representing user's AI agent"""

    __tablename__ = "agents"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign key to user (one-to-one relationship)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Agent configuration
    name = Column(String, nullable=False, default="My Agent")
    system_prompt = Column(Text, nullable=True)
    personality_data = Column(JSON, default=dict)  # Learned personality traits
    preferences = Column(JSON, default=dict)  # User preferences from questionnaire
    autonomy_level = Column(Integer, default=5)  # 1-10 scale (how autonomous)

    # Agent status
    is_active = Column(Boolean, default=True)
    actions_today = Column(Integer, default=0)
    last_action_date = Column(DateTime, nullable=True)
    last_action_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="agent")
    # actions = relationship("AgentAction", back_populates="agent")  # Phase 3+
    # posts = relationship("Post", back_populates="agent")  # Phase 3+

    def __repr__(self):
        return f"<Agent(id={self.id}, name='{self.name}', user_id={self.user_id})>"
