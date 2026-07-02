from sqlalchemy import Column, Integer, String, DateTime, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    team_name = Column(String, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    is_approved = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    step_entries = relationship("StepEntry", back_populates="user", cascade="all, delete-orphan")
    photo_entries = relationship("PhotoEntry", back_populates="user", cascade="all, delete-orphan")


class PhotoEntry(Base):
    __tablename__ = "photo_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    image_url = Column(String, nullable=False)
    public_id = Column(String, nullable=False)  # Cloudinary public_id for deletion
    caption = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="photo_entries")


class StepEntry(Base):
    __tablename__ = "step_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    steps = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship to user
    user = relationship("User", back_populates="step_entries")

# Made with Bob
