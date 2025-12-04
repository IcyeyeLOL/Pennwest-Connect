"""Database models."""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    """User model."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    notes = relationship("Note", back_populates="author", cascade="all, delete-orphan")

class Note(Base):
    """Note model."""
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    class_name = Column(String, index=True, nullable=False)
    description = Column(String)
    file_path = Column(String, nullable=False)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    author = relationship("User", back_populates="notes")
    likes = relationship("Like", back_populates="note", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="note", cascade="all, delete-orphan")

class Like(Base):
    """Like model for notes."""
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    note = relationship("Note", back_populates="likes")
    user = relationship("User")
    
    # Ensure one like per user per note
    __table_args__ = (
        UniqueConstraint('note_id', 'user_id', name='unique_like'),
    )

class Comment(Base):
    """Comment model for notes."""
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    note_id = Column(Integer, ForeignKey("notes.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    note = relationship("Note", back_populates="comments")
    user = relationship("User")
