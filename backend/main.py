"""Main FastAPI application."""
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

init_db()
logger.info("Database initialized")

# Create FastAPI app
app = FastAPI(
    title="Pennwest Connect API",
    description="API for Pennwest Connect - A platform for students to share notes",
    version="1.0.0"
)

# CORS middleware - dynamically get origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
    logger.info(f"Starting server on {HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT)
