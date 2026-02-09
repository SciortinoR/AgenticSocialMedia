"""
Post Pydantic schemas for API requests/responses
File: backend/app/schemas/post.py
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional
from app.models.post import PostType, PostStatus


class AuthorInfo(BaseModel):
    """Schema for author information"""
    id: int
    full_name: str = Field(..., serialization_alias='fullName')
    profile_picture_url: Optional[str] = Field(None, serialization_alias='profilePictureUrl')

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


def datetime_serializer(dt: datetime) -> str:
    """Serialize datetime to ISO 8601 string with UTC timezone"""
    if not dt:
        return None
    # Ensure the datetime is treated as UTC by adding 'Z' suffix
    return dt.isoformat() + 'Z' if not dt.tzinfo else dt.isoformat()


class PostCreate(BaseModel):
    """Schema for creating a post"""
    content: str = Field(..., min_length=1, max_length=5000)
    status: PostStatus = Field(default=PostStatus.PUBLISHED)


class PostUpdate(BaseModel):
    """Schema for updating a post"""
    content: Optional[str] = Field(None, min_length=1, max_length=5000)
    status: Optional[PostStatus] = None


class PostResponse(BaseModel):
    """Schema for post response"""
    id: int
    user_id: int = Field(..., alias='userId', serialization_alias='userId')
    agent_id: Optional[int] = Field(None, alias='agentId', serialization_alias='agentId')
    content: str
    post_type: PostType = Field(..., alias='postType', serialization_alias='postType')
    status: PostStatus
    is_edited: bool = Field(..., alias='isEdited', serialization_alias='isEdited')
    edited_by_user: bool = Field(..., alias='editedByUser', serialization_alias='editedByUser')
    is_deleted: bool = Field(..., alias='isDeleted', serialization_alias='isDeleted')
    like_count: int = Field(..., alias='likeCount', serialization_alias='likeCount')
    comment_count: int = Field(..., alias='commentCount', serialization_alias='commentCount')
    created_at: datetime = Field(..., alias='createdAt', serialization_alias='createdAt')
    updated_at: datetime = Field(..., alias='updatedAt', serialization_alias='updatedAt')
    author: Optional[AuthorInfo] = None

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_encoders={datetime: datetime_serializer}
    )


class PostWithAuthor(PostResponse):
    """Schema for post with author information"""
    author_name: str
    author_email: str

    model_config = ConfigDict(from_attributes=True)
