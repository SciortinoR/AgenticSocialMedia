"""
Agent API routes
File: backend/app/api/routes/agents.py

Handles agent creation, configuration, and management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime

from app.database.connection import get_db
from app.core.dependencies import get_current_user, get_current_active_user
from app.models.user import User
from app.models.agent import Agent
from app.models.post import Post, PostType, PostStatus
from app.models.agent_action import AgentAction, ActionType, ActionStatus
from app.schemas.agent import (
    AgentCreate,
    AgentUpdate,
    AgentResponse,
    OnboardingQuestionnaireData,
)
from app.schemas.post import PostResponse
from app.services.ai_service import ai_service

router = APIRouter()


def get_user_agent(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Agent:
    """Dependency to get current user's agent"""
    agent = db.query(Agent).filter(Agent.user_id == current_user.id).first()
    if not agent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agent not found. Please complete onboarding."
        )
    return agent


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    questionnaire: OnboardingQuestionnaireData,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new agent for current user during onboarding"""
    existing_agent = db.query(Agent).filter(Agent.user_id == current_user.id).first()
    if existing_agent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Agent already exists for this user."
        )

    system_prompt = generate_system_prompt(questionnaire)

    personality_data = {
        "use_case": questionnaire.use_case,
        "communication_style": questionnaire.communication_style,
        "topics_of_interest": questionnaire.topics_of_interest,
    }

    preferences = {
        "posting_frequency": questionnaire.posting_frequency,
        "additional_context": questionnaire.additional_context,
    }

    agent = Agent(
        user_id=current_user.id,
        name="My Agent",
        system_prompt=system_prompt,
        personality_data=personality_data,
        preferences=preferences,
        autonomy_level=questionnaire.autonomy_preference,
        is_active=True,
    )

    db.add(agent)
    db.commit()
    db.refresh(agent)

    return agent


@router.get("/me", response_model=AgentResponse)
async def get_my_agent(agent: Agent = Depends(get_user_agent)):
    """Get current user's agent"""
    return agent


@router.put("/me", response_model=AgentResponse)
async def update_agent(
    agent_update: AgentUpdate,
    agent: Agent = Depends(get_user_agent),
    db: Session = Depends(get_db)
):
    """Update agent configuration"""
    update_data = agent_update.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(agent, field, value)

    db.commit()
    db.refresh(agent)

    return agent


@router.get("/me/dashboard", response_model=Dict[str, Any])
async def get_agent_dashboard(agent: Agent = Depends(get_user_agent)):
    """Get agent dashboard data (today's activity)"""
    return {
        "agent": {
            "id": agent.id,
            "name": agent.name,
            "is_active": agent.is_active,
            "autonomy_level": agent.autonomy_level,
            "actions_today": agent.actions_today,
            "last_action_at": agent.last_action_at,
        },
        "stats": {
            "total_posts": 0,
            "total_interactions": 0,
            "connections": 0,
        },
        "recent_activity": [],
    }


def generate_system_prompt(questionnaire: OnboardingQuestionnaireData) -> str:
    """Generate system prompt for AI agent based on questionnaire responses"""
    topics = ", ".join(questionnaire.topics_of_interest) if questionnaire.topics_of_interest else "general topics"

    prompt = f"""You are an AI social media agent with the following characteristics:

Use Case: {questionnaire.use_case}
Communication Style: {questionnaire.communication_style}
Topics of Interest: {topics}
Posting Frequency: {questionnaire.posting_frequency}
Autonomy Level: {questionnaire.autonomy_preference}/10

Your goal is to represent your user authentically on social media platforms. """

    if questionnaire.use_case == "productivity":
        prompt += "Focus on professional content, networking, and sharing valuable insights related to the user's interests. "
    else:
        prompt += "Focus on engaging conversations, building connections, and sharing interesting content related to the user's interests. "

    if questionnaire.communication_style == "professional":
        prompt += "Maintain a professional tone in all interactions. Be polite, respectful, and articulate."
    elif questionnaire.communication_style == "casual":
        prompt += "Use a relaxed, conversational tone. Be friendly and approachable."
    else:
        prompt += "Be warm, enthusiastic, and personable in your interactions. Show genuine interest in conversations."

    if questionnaire.additional_context:
        prompt += f"\n\nAdditional Context: {questionnaire.additional_context}"

    return prompt


@router.post("/me/generate-content", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def generate_agent_content(
    agent: Agent = Depends(get_user_agent),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Generate content for the agent to post"""
    # Prepare agent configuration for AI service
    agent_config = {
        "system_prompt": agent.system_prompt,
        "personality_data": agent.personality_data,
        "preferences": agent.preferences,
        "autonomy_level": agent.autonomy_level,
    }

    # Generate content using AI service
    content = await ai_service.generate_post_content(agent_config)

    # Determine if content needs approval based on autonomy level
    needs_approval = agent.autonomy_level < 7

    # Create post with appropriate status
    post = Post(
        user_id=current_user.id,
        agent_id=agent.id,
        content=content,
        post_type=PostType.AGENT,
        status=PostStatus.DRAFT if needs_approval else PostStatus.PUBLISHED,
    )

    db.add(post)
    db.flush()  # Get post.id before creating action

    # Create agent action record
    action = AgentAction(
        agent_id=agent.id,
        user_id=current_user.id,
        post_id=post.id,
        action_type=ActionType.POST_CREATED,
        status=ActionStatus.PENDING_APPROVAL if needs_approval else ActionStatus.COMPLETED,
        description=f"Generated post: {content[:50]}...",
        action_metadata={"content_length": len(content)},
    )

    db.add(action)
    db.commit()
    db.refresh(post)

    # Update agent's actions_today counter
    now = datetime.utcnow()
    today = now.date()

    # Reset counter if it's a new day
    if agent.last_action_date is None or agent.last_action_date.date() != today:
        agent.actions_today = 0

    agent.actions_today += 1
    agent.last_action_date = now
    agent.last_action_at = now
    db.commit()

    return post


@router.post("/me/actions/{action_id}/approve", response_model=PostResponse)
async def approve_agent_action(
    action_id: int,
    agent: Agent = Depends(get_user_agent),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Approve a pending agent action"""
    action = db.query(AgentAction).filter(
        AgentAction.id == action_id,
        AgentAction.agent_id == agent.id,
        AgentAction.user_id == current_user.id
    ).first()

    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action not found"
        )

    if action.status != ActionStatus.PENDING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action is not pending approval"
        )

    # Update action status
    action.status = ActionStatus.APPROVED
    action.user_feedback = "positive"

    # If it's a post action, publish the post
    if action.post_id:
        post = db.query(Post).filter(Post.id == action.post_id).first()
        if post:
            post.status = PostStatus.PUBLISHED

    db.commit()

    if action.post_id:
        db.refresh(post)
        return post

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="No post associated with this action"
    )


@router.post("/me/actions/{action_id}/reject")
async def reject_agent_action(
    action_id: int,
    agent: Agent = Depends(get_user_agent),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Reject a pending agent action"""
    action = db.query(AgentAction).filter(
        AgentAction.id == action_id,
        AgentAction.agent_id == agent.id,
        AgentAction.user_id == current_user.id
    ).first()

    if not action:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Action not found"
        )

    if action.status != ActionStatus.PENDING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action is not pending approval"
        )

    # Update action status
    action.status = ActionStatus.REJECTED
    action.user_feedback = "negative"

    # If it's a post action, delete the draft post
    if action.post_id:
        post = db.query(Post).filter(Post.id == action.post_id).first()
        if post:
            post.is_deleted = True

    db.commit()

    return {"message": "Action rejected successfully"}


@router.get("/me/actions")
async def get_agent_actions():
    """Get agent action history"""
    # TODO: Fetch agent actions with pagination
    # TODO: Return action list
    pass

@router.post("/me/directives")
async def add_agent_directive():
    """Add a directive for the agent"""
    # TODO: Parse directive
    # TODO: Store directive
    # TODO: Update agent configuration
    pass

@router.delete("/me/actions/{action_id}")
async def delete_agent_action():
    """Delete an action taken by agent (for learning)"""
    # TODO: Mark action as deleted
    # TODO: Log for learning
    # TODO: Undo action if possible (delete post, unlike, etc.)
    pass

@router.put("/me/actions/{action_id}")
async def edit_agent_action():
    """Edit an action taken by agent (for learning)"""
    # TODO: Update action content
    # TODO: Log edit for learning
    # TODO: Update actual content (post, comment, etc.)
    pass
