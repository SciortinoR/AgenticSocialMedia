"""
Agent Pydantic schemas for API requests/responses
File: backend/app/schemas/agent.py
"""

from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, Dict, Any


def datetime_serializer(dt: datetime) -> str:
    """Serialize datetime to ISO 8601 string with UTC timezone"""
    if not dt:
        return None
    # Ensure the datetime is treated as UTC by adding 'Z' suffix
    return dt.isoformat() + 'Z' if not dt.tzinfo else dt.isoformat()


class AgentCreate(BaseModel):
    """Schema for creating an agent during onboarding"""
    name: str = Field(default="My Agent", min_length=1, max_length=100)
    system_prompt: Optional[str] = None
    preferences: Dict[str, Any] = Field(default_factory=dict)
    autonomy_level: int = Field(default=5, ge=1, le=10)


class AgentUpdate(BaseModel):
    """Schema for updating agent configuration"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    system_prompt: Optional[str] = None
    personality_data: Optional[Dict[str, Any]] = None
    preferences: Optional[Dict[str, Any]] = None
    autonomy_level: Optional[int] = Field(None, ge=1, le=10)
    is_active: Optional[bool] = None


class AgentResponse(BaseModel):
    """Schema for agent response"""
    id: int
    user_id: int = Field(..., serialization_alias='userId')
    name: str
    system_prompt: Optional[str] = Field(None, serialization_alias='systemPrompt')
    personality_data: Dict[str, Any] = Field(..., serialization_alias='personalityData')
    preferences: Dict[str, Any]
    autonomy_level: int = Field(..., serialization_alias='autonomyLevel')
    is_active: bool = Field(..., serialization_alias='isActive')
    actions_today: int = Field(..., serialization_alias='actionsToday')
    last_action_at: Optional[datetime] = Field(None, serialization_alias='lastActionAt')
    created_at: datetime = Field(..., serialization_alias='createdAt')
    updated_at: datetime = Field(..., serialization_alias='updatedAt')

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        json_encoders={datetime: datetime_serializer}
    )


class OnboardingQuestionnaireData(BaseModel):
    """Schema for onboarding questionnaire responses"""
    use_case: str = Field(..., description="productivity or social")
    posting_frequency: str = Field(..., description="daily, weekly, rarely")
    topics_of_interest: list[str] = Field(default_factory=list)
    communication_style: str = Field(..., description="professional, casual, friendly")
    autonomy_preference: int = Field(..., ge=1, le=10)
    additional_context: Optional[str] = None
