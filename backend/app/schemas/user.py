"""
User Pydantic schemas for API requests/responses
File: backend/app/schemas/user.py
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional


def datetime_serializer(dt: datetime) -> str:
    """Serialize datetime to ISO 8601 string with UTC timezone"""
    if not dt:
        return None
    return dt.isoformat() + 'Z' if not dt.tzinfo else dt.isoformat()


class UserCreate(BaseModel):
    """Schema for user registration"""
    email: EmailStr
    password: str
    full_name: str = Field(..., alias='fullName')

    model_config = ConfigDict(populate_by_name=True)


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = Field(None, alias='fullName')
    bio: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True)


class UserResponse(BaseModel):
    """Schema for user response (without sensitive data)"""
    id: int
    email: str
    full_name: str = Field(..., serialization_alias='fullName')
    bio: Optional[str] = None
    profile_picture_url: Optional[str] = Field(None, serialization_alias='profilePictureUrl')
    is_active: bool = Field(..., serialization_alias='isActive')
    is_verified: bool = Field(..., serialization_alias='isVerified')
    created_at: datetime = Field(..., serialization_alias='createdAt')
    updated_at: datetime = Field(..., serialization_alias='updatedAt')

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_encoders={datetime: datetime_serializer}
    )


class TokenResponse(BaseModel):
    """Schema for authentication token response"""
    access_token: str
    token_type: str = "bearer"


class UserWithToken(BaseModel):
    """Schema for user response with token"""
    user: UserResponse
    access_token: str
    token_type: str = "bearer"
