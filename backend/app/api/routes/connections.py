"""
Connection API routes
File: backend/app/api/routes/connections.py

Handles user connections and relationship management.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app.database.connection import get_db
from app.core.dependencies import get_current_active_user
from app.models.user import User
from app.models.connection import Connection, ConnectionStatus, ConnectionType
from app.schemas.connection import ConnectionCreate, ConnectionResponse, ConnectionUpdate

router = APIRouter()


@router.get("/", response_model=List[ConnectionResponse])
async def get_connections(
    status_filter: Optional[str] = Query(None, description="Filter by status: pending, accepted, rejected"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all connections for current user"""
    query = db.query(Connection).options(
        joinedload(Connection.user),
        joinedload(Connection.connected_user)
    ).filter(
        (Connection.user_id == current_user.id) | (Connection.connected_user_id == current_user.id)
    )

    if status_filter:
        try:
            status_enum = ConnectionStatus(status_filter)
            query = query.filter(Connection.status == status_enum)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status filter: {status_filter}"
            )

    connections = query.order_by(Connection.created_at.desc()).all()
    return connections


@router.post("/{user_id}", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
async def create_connection(
    user_id: int,
    connection_data: Optional[ConnectionCreate] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a connection request"""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot connect to yourself"
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    existing_connection = db.query(Connection).filter(
        ((Connection.user_id == current_user.id) & (Connection.connected_user_id == user_id)) |
        ((Connection.user_id == user_id) & (Connection.connected_user_id == current_user.id))
    ).first()

    if existing_connection:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Connection already exists"
        )

    connection_type = connection_data.connection_type if connection_data else ConnectionType.FRIEND

    connection = Connection(
        user_id=current_user.id,
        connected_user_id=user_id,
        connection_type=connection_type,
        status=ConnectionStatus.PENDING,
        initiated_by_agent=False
    )

    db.add(connection)
    db.commit()
    db.refresh(connection)

    return connection


@router.put("/{connection_id}/accept", response_model=ConnectionResponse)
async def accept_connection(
    connection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Accept a connection request"""
    connection = db.query(Connection).filter(Connection.id == connection_id).first()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    if connection.connected_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only accept connections sent to you"
        )

    if connection.status != ConnectionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Connection is already {connection.status.value}"
        )

    connection.status = ConnectionStatus.ACCEPTED
    db.commit()
    db.refresh(connection)

    return connection


@router.put("/{connection_id}/reject", response_model=ConnectionResponse)
async def reject_connection(
    connection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Reject a connection request"""
    connection = db.query(Connection).filter(Connection.id == connection_id).first()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    if connection.connected_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only reject connections sent to you"
        )

    if connection.status != ConnectionStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Connection is already {connection.status.value}"
        )

    connection.status = ConnectionStatus.REJECTED
    db.commit()
    db.refresh(connection)

    return connection


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_connection(
    connection_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove a connection"""
    connection = db.query(Connection).filter(Connection.id == connection_id).first()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    if connection.user_id != current_user.id and connection.connected_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only remove your own connections"
        )

    db.delete(connection)
    db.commit()

    return None


@router.put("/{connection_id}/type", response_model=ConnectionResponse)
async def update_connection_type(
    connection_id: int,
    connection_update: ConnectionUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update connection relationship type"""
    connection = db.query(Connection).filter(Connection.id == connection_id).first()

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found"
        )

    if connection.user_id != current_user.id and connection.connected_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own connections"
        )

    if connection.status != ConnectionStatus.ACCEPTED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update type of accepted connections"
        )

    if connection_update.connection_type:
        connection.connection_type = connection_update.connection_type

    db.commit()
    db.refresh(connection)

    return connection
