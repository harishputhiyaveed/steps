from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from contextlib import asynccontextmanager
from datetime import timedelta
from typing import List
import time
import models
import schemas
import auth
import admin
from database import engine, get_db


def init_db():
    # Retry DB connection up to 5 times (Railway PostgreSQL can take a moment to be ready)
    for attempt in range(5):
        try:
            models.Base.metadata.create_all(bind=engine)
            with engine.connect() as conn:
                conn.execute(text(
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE"
                ))
                conn.execute(text(
                    "UPDATE users SET is_approved = TRUE WHERE is_admin = TRUE AND is_approved = FALSE"
                ))
                conn.commit()
            print("DB init and migrations completed successfully")
            return
        except Exception as e:
            print(f"DB init attempt {attempt + 1} failed: {e}")
            if attempt < 4:
                time.sleep(3)
    print("DB init failed after 5 attempts — continuing anyway")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# Initialize FastAPI app
app = FastAPI(title="Steps Challenge API", version="1.0.0", lifespan=lifespan)


# ONE-TIME TEAM FIX — remove after use
@app.post("/api/fix-admin-team")
def fix_admin_team(db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == "admin@test.ibm.com").first()
    if not user:
        return {"message": "User not found"}
    user.team_name = "Overarching"
    db.commit()
    return {"message": f"Team updated to {user.team_name}"}


# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        "https://steps-tan-ten.vercel.app",
        "https://steps-hs23.vercel.app",
        "https://charirty-steps.vercel.app",
        "https://charity-steps.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include admin router
app.include_router(admin.router)


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/api/auth/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check email domain is Merative or IBM
    email_lower = user_data.email.lower()
    if 'merative' not in email_lower and 'ibm' not in email_lower:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid email address"
        )

    # Check if email already exists
    existing_user = auth.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This email address is already registered. Please log in."
        )
    
    # Create new user
    hashed_password = auth.get_password_hash(user_data.password)
    db_user = models.User(
        full_name=user_data.full_name,
        email=user_data.email,
        team_name=user_data.team_name,
        password_hash=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login and get access token"""
    user = auth.authenticate_user(db, user_credentials.email, user_credentials.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please try again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Block unapproved non-admin users
    if not user.is_admin and not user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is pending admin approval. Please check back soon.",
        )

    # Create access token
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_info(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    """Get current user information"""
    db.refresh(current_user)
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "team_name": current_user.team_name,
        "is_admin": current_user.is_admin,
        "is_approved": current_user.is_approved,
        "created_at": current_user.created_at
    }


# ============================================================================
# STEP ENTRY ENDPOINTS
# ============================================================================

@app.post("/api/steps", response_model=schemas.StepEntryResponse, status_code=status.HTTP_201_CREATED)
def create_step_entry(
    step_data: schemas.StepEntryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Submit a new step entry"""
    db_step = models.StepEntry(
        user_id=current_user.id,
        date=step_data.date,
        steps=step_data.steps
    )
    db.add(db_step)
    db.commit()
    db.refresh(db_step)
    return db_step


@app.get("/api/steps/me", response_model=List[schemas.StepEntryResponse])
def get_my_steps(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's step entries"""
    steps = db.query(models.StepEntry)\
        .filter(models.StepEntry.user_id == current_user.id)\
        .order_by(models.StepEntry.date.desc())\
        .all()
    return steps


@app.put("/api/steps/{entry_id}", response_model=schemas.StepEntryResponse)
def update_step_entry(
    entry_id: int,
    step_data: schemas.StepEntryCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Update a step entry (users can only update their own entries)"""
    entry = db.query(models.StepEntry).filter(models.StepEntry.id == entry_id).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Check if the entry belongs to the current user
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this entry")
    
    # Update the entry
    entry.date = step_data.date
    entry.steps = step_data.steps
    db.commit()
    db.refresh(entry)
    return entry


@app.delete("/api/steps/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_step_entry(
    entry_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a step entry (users can only delete their own entries)"""
    entry = db.query(models.StepEntry).filter(models.StepEntry.id == entry_id).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    
    # Check if the entry belongs to the current user
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this entry")
    
    db.delete(entry)
    db.commit()
    return None


# ============================================================================
# LEADERBOARD ENDPOINTS
# ============================================================================

@app.get("/api/leaderboards/users", response_model=List[schemas.UserLeaderboardEntry])
def get_user_leaderboard(db: Session = Depends(get_db)):
    """Get individual user leaderboard"""
    # Calculate total steps per user
    user_totals = db.query(
        models.User.id,
        models.User.full_name,
        models.User.team_name,
        func.coalesce(func.sum(models.StepEntry.steps), 0).label('total_steps')
    ).outerjoin(models.StepEntry)\
     .group_by(models.User.id, models.User.full_name, models.User.team_name)\
     .order_by(func.coalesce(func.sum(models.StepEntry.steps), 0).desc())\
     .all()
    
    # Add rank
    leaderboard = []
    for rank, (user_id, full_name, team_name, total_steps) in enumerate(user_totals, start=1):
        leaderboard.append(schemas.UserLeaderboardEntry(
            rank=rank,
            user_id=user_id,
            full_name=full_name,
            team_name=team_name,
            total_steps=total_steps
        ))
    
    return leaderboard


@app.get("/api/leaderboards/teams", response_model=List[schemas.TeamLeaderboardEntry])
def get_team_leaderboard(db: Session = Depends(get_db)):
    """Get team leaderboard"""
    team_totals = db.query(
        models.User.team_name,
        func.coalesce(func.sum(models.StepEntry.steps), 0).label('total_steps'),
        func.count(func.distinct(models.StepEntry.user_id)).label('active_members')
    ).outerjoin(models.StepEntry)\
     .group_by(models.User.team_name)\
     .order_by(func.coalesce(func.sum(models.StepEntry.steps), 0).desc())\
     .all()

    leaderboard = []
    for rank, (team_name, total_steps, active_members) in enumerate(team_totals, start=1):
        leaderboard.append(schemas.TeamLeaderboardEntry(
            rank=rank,
            team_name=team_name,
            total_steps=total_steps,
            active_members=active_members
        ))

    return leaderboard


@app.get("/api/users/me/stats", response_model=schemas.UserStats)
def get_user_stats(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's statistics including ranks"""
    # Get user's total steps
    user_total = db.query(func.coalesce(func.sum(models.StepEntry.steps), 0))\
        .filter(models.StepEntry.user_id == current_user.id)\
        .scalar()
    
    # Get user rank
    user_totals = db.query(
        models.User.id,
        func.coalesce(func.sum(models.StepEntry.steps), 0).label('total_steps')
    ).outerjoin(models.StepEntry)\
     .group_by(models.User.id)\
     .order_by(func.coalesce(func.sum(models.StepEntry.steps), 0).desc())\
     .all()
    
    user_rank = next((rank for rank, (uid, _) in enumerate(user_totals, start=1) if uid == current_user.id), 0)
    
    # Get team rank
    team_totals = db.query(
        models.User.team_name,
        func.coalesce(func.sum(models.StepEntry.steps), 0).label('total_steps')
    ).outerjoin(models.StepEntry)\
     .group_by(models.User.team_name)\
     .order_by(func.coalesce(func.sum(models.StepEntry.steps), 0).desc())\
     .all()
    
    team_rank = next((rank for rank, (tname, _) in enumerate(team_totals, start=1) if tname == current_user.team_name), 0)
    
    return schemas.UserStats(
        full_name=current_user.full_name,
        team_name=current_user.team_name,
        total_steps=user_total,
        user_rank=user_rank,
        team_rank=team_rank
    )


# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Steps Challenge API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/teams")
def get_available_teams():
    """Get list of available teams (hardcoded for MVP)"""
    return {
        "teams": [
            "Overarching",
            "Release and DevOps",
            "Notifications",
            "Cloud Hosting",
            "Shared Services",
            "ECNS",
            "PAWHP",
            "Data",
            "CSP Legacy",
            "Not Listed",
        ]
    }


# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

# Made with Bob
