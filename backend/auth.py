"""Authentication utilities."""
import os
import hashlib
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, Tuple
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

def _preprocess_password(password: str) -> Tuple[str, bool]:
    """
    Preprocess password to handle bcrypt's 72-byte limit.
    Returns: (processed_password, was_prehashed)
    """
    password_bytes = password.encode('utf-8')
    
    # Bcrypt has a hard 72-byte limit
    if len(password_bytes) > 72:
        # Hash with SHA256 first (produces 64-byte hex string)
        # This ensures we never exceed bcrypt's limit
        return hashlib.sha256(password_bytes).hexdigest(), True
    
    return password, False

def get_password_hash(password: str) -> str:
    """Hash a password, handling bcrypt's 72-byte limit."""
    processed_password, was_prehashed = _preprocess_password(password)
    
    # Hash with bcrypt directly
    password_bytes = processed_password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    
    # Store a prefix to indicate if password was prehashed
    # Format: "$2b$prehashed$" + actual_hash
    if was_prehashed:
        return "$2b$prehashed$" + hashed.decode('utf-8')
    
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    # Check if password was prehashed
    if hashed_password.startswith("$2b$prehashed$"):
        # Remove prefix and get actual hash
        actual_hash = hashed_password[14:]  # Remove "$2b$prehashed$"
        processed_password, _ = _preprocess_password(plain_password)
        password_bytes = processed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, actual_hash.encode('utf-8'))
    else:
        # Normal verification for passwords <= 72 bytes
        password_bytes = plain_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_password.encode('utf-8'))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(lambda: None)
):
    """Get the current authenticated user."""
    from database import get_db
    from models import User
    
    # Get database session using dependency injection
    db_dep = get_db()
    db = next(db_dep)
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    
    return user
