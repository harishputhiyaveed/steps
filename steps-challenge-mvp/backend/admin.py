from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import models
import schemas
from database import get_db
from auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["admin"])


def require_admin(current_user: models.User = Depends(get_current_user)):
    """Dependency to check if user is admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/users", response_model=List[schemas.AdminUserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Get all users with their total steps (admin only)"""
    users = db.query(
        models.User,
        func.coalesce(func.sum(models.StepEntry.steps), 0).label("total_steps")
    ).outerjoin(models.StepEntry).group_by(models.User.id).all()

    return [
        {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "team_name": user.team_name,
            "is_admin": user.is_admin,
            "is_approved": user.is_approved,
            "created_at": user.created_at,
            "total_steps": total_steps
        }
        for user, total_steps in users
    ]


@router.post("/users/{user_id}/approve")
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Approve a user registration (admin only)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    user.is_approved = True
    db.commit()
    return {"message": f"User {user.full_name} approved successfully"}


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Delete a user (admin only)"""
    if user_id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own admin account"
        )
    
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return {"message": f"User {user.full_name} deleted successfully"}


@router.get("/steps", response_model=List[schemas.StepEntryResponse])
def get_all_steps(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Get all step entries (admin only)"""
    entries = db.query(models.StepEntry).order_by(models.StepEntry.date.desc()).all()
    return entries


@router.get("/users/{user_id}/steps", response_model=List[schemas.StepEntryResponse])
def get_user_steps(
    user_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Get all step entries for a specific user (admin only)"""
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    entries = db.query(models.StepEntry).filter(
        models.StepEntry.user_id == user_id
    ).order_by(models.StepEntry.date.desc()).all()
    return entries


@router.delete("/steps/{entry_id}")
def delete_step_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Delete a step entry (admin only)"""
    entry = db.query(models.StepEntry).filter(models.StepEntry.id == entry_id).first()
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Step entry not found"
        )
    
    db.delete(entry)
    db.commit()
    return {"message": "Step entry deleted successfully"}


@router.get("/stats")
def get_admin_stats(
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Get overall statistics (admin only)"""
    total_users = db.query(func.count(models.User.id)).scalar()
    total_steps = db.query(func.sum(models.StepEntry.steps)).scalar() or 0
    total_entries = db.query(func.count(models.StepEntry.id)).scalar()
    
    return {
        "total_users": total_users,
        "total_steps": total_steps,
        "total_entries": total_entries,
        "teams": [
            "Overarching", "Release and DevOps", "Notifications",
            "Cloud Hosting", "Shared Services", "ECNS", "PAWHP",
            "Data", "CSP Legacy", "Not Listed",
        ]
    }

# Made with Bob