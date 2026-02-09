"""
Authentication API routes
File: backend/app/api/routes/auth.py

Handles user registration, login, and OAuth flows.
"""

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import os
import uuid
from pathlib import Path

from app.database.connection import get_db
from app.services.storage_service import storage_service
from app.models.user import User
from app.schemas import UserCreate, UserResponse, TokenResponse, UserWithToken, UserUpdate
from app.core.security import hash_password, verify_password, create_access_token
from app.core.dependencies import get_current_active_user

router = APIRouter()


@router.post("/register", response_model=UserWithToken, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        User object and authentication token

    Raises:
        HTTPException: If email is already registered
    """
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Hash password
    hashed_password = hash_password(user_data.password)

    # Create new user
    new_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT token (sub must be a string per JWT spec)
    access_token = create_access_token(data={"sub": str(new_user.id)})

    return {
        "user": new_user,
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/login", response_model=TokenResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    Login with email and password

    Args:
        form_data: OAuth2 form with username (email) and password
        db: Database session

    Returns:
        JWT access token

    Raises:
        HTTPException: If credentials are invalid
    """
    # Get user by email (username field in OAuth2PasswordRequestForm)
    user = db.query(User).filter(User.email == form_data.username).first()

    # Verify user exists and password is correct
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Generate JWT token (sub must be a string per JWT spec)
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_active_user)):
    """
    Logout current user

    Note: For stateless JWT tokens, logout is handled client-side by removing the token.
    This endpoint exists for consistency and can be extended with token blacklisting if needed.

    Args:
        current_user: Current authenticated user

    Returns:
        Success message
    """
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
async def get_current_user(current_user: User = Depends(get_current_active_user)):
    """
    Get current authenticated user

    Args:
        current_user: Current authenticated user from JWT token

    Returns:
        Current user data
    """
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_profile(
    profile_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's profile

    Args:
        profile_data: Profile update data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated user data
    """
    if profile_data.full_name is not None:
        current_user.full_name = profile_data.full_name
    if profile_data.bio is not None:
        current_user.bio = profile_data.bio

    db.commit()
    db.refresh(current_user)

    return current_user


@router.post("/profile-picture", response_model=UserResponse)
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload profile picture for current user

    Args:
        file: Image file to upload
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated user data with new profile picture URL
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
        )

    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds 5MB limit"
        )

    # Upload to Supabase Storage
    try:
        public_url = await storage_service.upload_profile_picture(
            user_id=current_user.id,
            file_content=contents,
            content_type=file.content_type
        )

        # Update user profile picture URL
        current_user.profile_picture_url = public_url
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

    db.commit()
    db.refresh(current_user)

    return current_user


# OAuth routes (Phase 1: Return placeholder responses - full implementation in Phase 5)

@router.get("/google")
async def google_oauth_init():
    """
    Initialize Google OAuth flow

    Note: Full implementation in Phase 5
    """
    return {
        "message": "Google OAuth not yet implemented",
        "phase": "Will be implemented in Phase 5"
    }


@router.get("/google/callback")
async def google_oauth_callback():
    """
    Handle Google OAuth callback

    Note: Full implementation in Phase 5
    """
    return {
        "message": "Google OAuth callback not yet implemented",
        "phase": "Will be implemented in Phase 5"
    }


@router.get("/instagram")
async def instagram_oauth_init():
    """
    Initialize Instagram OAuth flow

    Note: Full implementation in Phase 5
    """
    return {
        "message": "Instagram OAuth not yet implemented",
        "phase": "Will be implemented in Phase 5"
    }


@router.get("/instagram/callback")
async def instagram_oauth_callback():
    """
    Handle Instagram OAuth callback

    Note: Full implementation in Phase 5
    """
    return {
        "message": "Instagram OAuth callback not yet implemented",
        "phase": "Will be implemented in Phase 5"
    }


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get list of all users (for browsing and connecting)

    Returns:
        List of users excluding the current user
    """
    users = db.query(User).filter(User.id != current_user.id).all()
    return users
