from pydantic import BaseModel, EmailStr, Field
from datetime import date, datetime
from typing import Optional


# User Schemas
class UserRegister(BaseModel):
    full_name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    team_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    team_name: str
    is_admin: bool
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True


class AdminUserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    team_name: str
    is_admin: bool
    is_approved: bool
    created_at: datetime
    total_steps: int

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


# Step Entry Schemas
class StepEntryCreate(BaseModel):
    date: date
    steps: int = Field(..., gt=0)


class StepEntryResponse(BaseModel):
    id: int
    user_id: int
    date: date
    steps: int
    created_at: datetime

    class Config:
        from_attributes = True


# Leaderboard Schemas
class UserLeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    full_name: str
    team_name: str
    total_steps: int


class TeamLeaderboardEntry(BaseModel):
    rank: int
    team_name: str
    total_steps: int
    active_members: int


class UserStats(BaseModel):
    full_name: str
    team_name: str
    total_steps: int
    user_rank: int
    team_rank: int

# Photo Schemas
class PhotoEntryResponse(BaseModel):
    id: int
    user_id: int
    image_url: str
    caption: Optional[str]
    full_name: str
    created_at: datetime

    class Config:
        from_attributes = True

# Made with Bob
