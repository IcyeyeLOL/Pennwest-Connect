"""Configuration settings for the application."""
import os
from typing import List

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days

# Database
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite:///./pennwest_connect.db"
)

# CORS - Support multiple origins
def get_allowed_origins() -> List[str]:
    """Get allowed CORS origins from environment."""
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Add frontend URL from environment
    frontend_url = os.getenv("FRONTEND_URL", "")
    if frontend_url:
        origins.append(frontend_url)
        # Also add without trailing slash
        if frontend_url.endswith("/"):
            origins.append(frontend_url[:-1])
    
    # Support multiple frontend URLs (comma-separated)
    additional_origins = os.getenv("FRONTEND_URLS", "")
    if additional_origins:
        origins.extend([url.strip() for url in additional_origins.split(",")])
    
    # Remove empty strings and duplicates
    return list(set(filter(None, origins)))

ALLOWED_ORIGINS = get_allowed_origins()

# File Upload
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"}

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

