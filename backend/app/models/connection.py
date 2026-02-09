"""
Connection database model
File: backend/app/models/connection.py

SQLAlchemy model for connections table representing relationships between users.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database.connection import Base


class ConnectionType(str, enum.Enum):
    """Enum for connection relationship types"""
    CLOSE_FRIEND = "close_friend"
    FRIEND = "friend"
    ACQUAINTANCE = "acquaintance"
    PROFESSIONAL = "professional"


class ConnectionStatus(str, enum.Enum):
    """Enum for connection status"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"


class Connection(Base):
    """Connection model representing relationships between users"""

    __tablename__ = "connections"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    connected_user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Connection details
    connection_type = Column(Enum(ConnectionType), default=ConnectionType.FRIEND)
    status = Column(Enum(ConnectionStatus), default=ConnectionStatus.PENDING)

    # Connection metadata
    initiated_by_agent = Column(Boolean, default=False)
    interaction_frequency = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="connections_initiated")
    connected_user = relationship("User", foreign_keys=[connected_user_id])
