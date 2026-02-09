"""
Connection Pydantic schemas for API requests/responses
File: backend/app/schemas/connection.py
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.connection import ConnectionType, ConnectionStatus


class UserInfo(BaseModel):
    """Minimal user info for connections"""
    id: int
    email: str
    full_name: str = Field(..., serialization_alias='fullName')
    profile_picture_url: Optional[str] = Field(None, serialization_alias='profilePictureUrl')

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class ConnectionCreate(BaseModel):
    """Schema for creating a connection request"""
    connected_user_id: int = Field(..., serialization_alias='connectedUserId')
    connection_type: ConnectionType = Field(default=ConnectionType.FRIEND, serialization_alias='connectionType')

    model_config = ConfigDict(populate_by_name=True)


class ConnectionUpdate(BaseModel):
    """Schema for updating a connection"""
    connection_type: Optional[ConnectionType] = Field(None, serialization_alias='connectionType')
    status: Optional[ConnectionStatus] = None

    model_config = ConfigDict(populate_by_name=True)


class ConnectionResponse(BaseModel):
    """Schema for connection response"""
    id: int
    user_id: int = Field(..., serialization_alias='userId')
    connected_user_id: int = Field(..., serialization_alias='connectedUserId')
    connection_type: ConnectionType = Field(..., serialization_alias='connectionType')
    status: ConnectionStatus
    initiated_by_agent: bool = Field(..., serialization_alias='initiatedByAgent')
    interaction_frequency: int = Field(..., serialization_alias='interactionFrequency')
    created_at: datetime = Field(..., serialization_alias='createdAt')
    updated_at: datetime = Field(..., serialization_alias='updatedAt')
    user: Optional[UserInfo] = None
    connected_user: Optional[UserInfo] = Field(None, serialization_alias='connectedUser')

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
