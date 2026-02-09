"""
Interaction Pydantic schemas for API requests/responses
File: backend/app/schemas/interaction.py
"""

from pydantic import BaseModel, Field, ConfigDict, field_serializer
from datetime import datetime
from typing import Optional
from app.models.interaction import InteractionType, ActorType


class LikeCreate(BaseModel):
    """Schema for creating a like (no body needed)"""
    pass


class CommentCreate(BaseModel):
    """Schema for creating a comment"""
    content: str = Field(..., min_length=1, max_length=5000)


class CommentUpdate(BaseModel):
    """Schema for updating a comment"""
    content: str = Field(..., min_length=1, max_length=5000)


class UserInfo(BaseModel):
    """Schema for user information in interactions"""
    id: int
    full_name: str = Field(..., serialization_alias='fullName')
    email: str
    profile_picture_url: Optional[str] = Field(None, serialization_alias='profilePictureUrl')

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class InteractionResponse(BaseModel):
    """Schema for interaction response"""
    id: int
    user_id: int = Field(..., serialization_alias='userId')
    post_id: Optional[int] = Field(None, serialization_alias='postId')
    parent_interaction_id: Optional[int] = Field(None, serialization_alias='parentInteractionId')
    interaction_type: InteractionType = Field(..., serialization_alias='interactionType')
    actor_type: ActorType = Field(..., serialization_alias='actorType')
    content: Optional[str] = None
    like_count: int = Field(default=0, serialization_alias='likeCount')
    is_edited: bool = Field(..., serialization_alias='isEdited')
    is_deleted: bool = Field(..., serialization_alias='isDeleted')
    created_at: datetime = Field(..., serialization_alias='createdAt')
    updated_at: datetime = Field(..., serialization_alias='updatedAt')
    user: Optional[UserInfo] = None

    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, dt: datetime, _info):
        """Serialize datetime as ISO 8601 string with UTC timezone"""
        if dt:
            # Ensure datetime is treated as UTC and formatted with 'Z' suffix
            return dt.strftime('%Y-%m-%dT%H:%M:%S.%f')[:-3] + 'Z'
        return None

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
