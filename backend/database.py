"""Database configuration and session management."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Import config for pool settings
try:
    from config import DB_POOL_SIZE, DB_MAX_OVERFLOW, DB_POOL_TIMEOUT
except ImportError:
    # Fallback if config not available
    DB_POOL_SIZE = int(os.getenv("DB_POOL_SIZE", "10"))
    DB_MAX_OVERFLOW = int(os.getenv("DB_MAX_OVERFLOW", "20"))
    DB_POOL_TIMEOUT = int(os.getenv("DB_POOL_TIMEOUT", "30"))

# Database setup
# Railway provides DATABASE_URL, but also check DATABASE_PUBLIC_URL as fallback
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    os.getenv("DATABASE_PUBLIC_URL", "sqlite:///./pennwest_connect.db")
)

# Create database engine with appropriate settings
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    # SQLite configuration for development
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True
    )
else:
    # PostgreSQL or other production database with configurable pool
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,  # Verify connections before using
        pool_size=DB_POOL_SIZE,
        max_overflow=DB_MAX_OVERFLOW,
        pool_timeout=DB_POOL_TIMEOUT,
        pool_recycle=3600,  # Recycle connections after 1 hour
        echo=False  # Set to True for SQL query logging
    )

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

def get_db():
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables."""
    # Import all models to ensure they're registered with Base
    from models import User, Note, Like, Comment
    Base.metadata.create_all(bind=engine)

