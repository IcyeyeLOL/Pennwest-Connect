"""Configuration settings for the application."""
import os
from typing import List

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080  # 7 days

# Database
# Railway provides DATABASE_URL, but also check DATABASE_PUBLIC_URL as fallback
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    os.getenv("DATABASE_PUBLIC_URL", "sqlite:///./pennwest_connect.db")
)

# CORS - Support multiple origins
def get_allowed_origins() -> List[str]:
    """Get allowed CORS origins from environment."""
    import logging
    logger = logging.getLogger(__name__)
    
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]
    
    # Add frontend URL from environment
    frontend_url = os.getenv("FRONTEND_URL", "")
    if frontend_url:
        # Remove trailing slash for consistency
        frontend_url_clean = frontend_url.rstrip("/")
        origins.append(frontend_url_clean)
        logger.info(f"Added FRONTEND_URL to CORS origins: {frontend_url_clean}")
    else:
        logger.warning("FRONTEND_URL not set! CORS may not work for production frontend.")
    
    # Support multiple frontend URLs (comma-separated)
    additional_origins = os.getenv("FRONTEND_URLS", "")
    if additional_origins:
        for url in additional_origins.split(","):
            clean_url = url.strip().rstrip("/")
            if clean_url:
                origins.append(clean_url)
                logger.info(f"Added additional origin to CORS: {clean_url}")
    
    # Remove empty strings and duplicates
    final_origins = list(set(filter(None, origins)))
    logger.info(f"CORS allowed origins: {final_origins}")
    return final_origins

ALLOWED_ORIGINS = get_allowed_origins()

# File Upload
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt", ".png", ".jpg", ".jpeg"}

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

