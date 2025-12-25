"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    """User registration schema."""
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=200)
    username: str = Field(..., min_length=3, max_length=30)
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters long')
        # Warn if password is very long (bcrypt limit is 72 bytes)
        if len(v.encode('utf-8')) > 72:
            # We'll handle this in the hashing function, but warn the user
            pass
        return v
    
    @field_validator('username')
    @classmethod
    def validate_username(cls, v: str) -> str:
        import re
        v = v.strip()
        if not v:
            raise ValueError('Username cannot be empty')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 30:
            raise ValueError('Username must be less than 30 characters')
        # Allow alphanumeric, underscore, and hyphen
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v

class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    """User response schema."""
    id: int
    email: str
    username: str
    
    class Config:
        from_attributes = True

class NoteCreate(BaseModel):
    """Note creation schema."""
    title: str = Field(..., min_length=1, max_length=200)
    class_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validate title for inappropriate language."""
        if not v:
            return v
        
        # Import here to avoid circular imports
        from content_filter import validate_content
        
        is_valid, error_msg = validate_content(v, "title")
        
        if not is_valid:
            raise ValueError(error_msg)
        
        return v
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Validate description for inappropriate language."""
        if not v:
            return v
        
        # Import here to avoid circular imports
        from content_filter import validate_content
        
        is_valid, error_msg = validate_content(v, "description")
        
        if not is_valid:
            raise ValueError(error_msg)
        
        return v

class CommentCreate(BaseModel):
    """Comment creation schema."""
    content: str = Field(..., min_length=1, max_length=1000)
    
    @field_validator('content')
    @classmethod
    def validate_content(cls, v: str) -> str:
        """Validate comment content for inappropriate language."""
        if not v:
            return v
        
        # Import here to avoid circular imports
        from content_filter import validate_content
        
        is_valid, error_msg = validate_content(v, "comment")
        
        if not is_valid:
            raise ValueError(error_msg)
        
        return v

class CommentResponse(BaseModel):
    """Comment response schema."""
    id: int
    content: str
    author_email: str
    author_username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class NoteResponse(BaseModel):
    """Note response schema."""
    id: int
    title: str
    class_name: str
    description: Optional[str]
    file_path: str
    author_email: str
    author_username: str
    created_at: datetime
    like_count: int = 0
    is_liked: bool = False
    comment_count: int = 0
    
    class Config:
        from_attributes = True

class NoteDetailResponse(NoteResponse):
    """Detailed note response with comments."""
    comments: list[CommentResponse] = []

class TokenResponse(BaseModel):
    """Token response schema."""
    access_token: str
    token_type: str = "bearer"

