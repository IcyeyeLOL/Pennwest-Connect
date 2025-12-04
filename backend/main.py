"""Main FastAPI application."""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_allowed_origins, HOST, PORT
from database import init_db
from routes import auth, notes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize database
# Run migration first if needed
try:
    from migrate_username import migrate
    migrate()
except Exception as e:
    logger.warning(f"Migration check failed: {e}. Continuing with table creation...")

try:
    init_db()
    logger.info("Database initialized")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")
    raise

# Create FastAPI app
app = FastAPI(
    title="Pennwest Connect API",
    description="API for Pennwest Connect - A platform for students to share notes",
    version="1.0.0"
)

# CORS middleware - dynamically get origins
allowed_origins = get_allowed_origins()
logger.info(f"Configuring CORS with origins: {allowed_origins}")

# Allow Vercel preview deployments (all *.vercel.app domains)
vercel_regex = r"https://.*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=vercel_regex,  # Allow all Vercel preview deployments
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(notes.router)

# Root endpoint
@app.get("/")
def read_root():
    """Root endpoint."""
    return {
        "message": "Pennwest Connect API",
        "version": "1.0.0",
        "status": "running"
    }

# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    # Railway provides PORT environment variable - use it if available
    port = int(os.getenv("PORT", PORT))
    logger.info(f"Starting server on {HOST}:{port}")
    uvicorn.run(app, host=HOST, port=port, log_level="info")
