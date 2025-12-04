"""Main FastAPI application."""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_allowed_origins, HOST, PORT
from database import init_db
from routes import auth, notes

# Configure logging dynamically
from config import LOG_LEVEL
log_level = getattr(logging, LOG_LEVEL, logging.INFO)
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.info(f"Logging level set to: {LOG_LEVEL}")

# Initialize database
# Run migration first if needed
try:
    from migrate_username import migrate
    migrate()
except Exception as e:
    logger.warning(f"Migration check failed: {e}. Continuing with table creation...")

try:
    init_db()
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Database initialization failed: {e}")
    logger.error("Server will start but database operations may fail.")
    logger.error("Please check your DATABASE_URL environment variable.")
    # Don't raise - allow server to start so we can see health check
    # The actual database operations will fail with clear error messages

# Create FastAPI app
app = FastAPI(
    title="Pennwest Connect API",
    description="API for Pennwest Connect - A platform for students to share notes",
    version="1.0.0"
)

# CORS middleware - get origins at startup
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

# Database health check endpoint
@app.get("/health/db")
def health_check_db():
    """Check database connection."""
    try:
        from database import engine
        from sqlalchemy import text
        
        # Try to connect to database
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }, 503

if __name__ == "__main__":
    import uvicorn
    # Railway provides PORT environment variable - use it if available
    port = int(os.getenv("PORT", PORT))
    logger.info(f"Starting server on {HOST}:{port}")
    uvicorn.run(app, host=HOST, port=port, log_level="info")
