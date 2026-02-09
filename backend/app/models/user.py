"""
User database model
File: backend/app/models/user.py

SQLAlchemy model for users table.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base


class User(Base):
    """User model representing platform users"""

    __tablename__ = "users"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # User information
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    bio = Column(String, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    agent = relationship("Agent", back_populates="user", uselist=False)
    # connections = relationship("Connection", back_populates="user", foreign_keys="[Connection.user_id]")  # Phase 3+
    # posts = relationship("Post", back_populates="author")  # Phase 3+
    # interactions = relationship("Interaction", back_populates="user")  # Phase 3+

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', full_name='{self.full_name}')>"
