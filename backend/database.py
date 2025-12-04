"""Database configuration and session management."""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database setup
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./pennwest_connect.db"
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
    # PostgreSQL or other production database
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
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

