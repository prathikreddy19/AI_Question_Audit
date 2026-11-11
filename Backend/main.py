import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import connect_to_mongo, close_mongo_connection
from app.api.questions import router as questions_router
from app.api.reports import router as reports_router
from app.api.ai import router as ai_router
from app.api.faculty import router as faculty_router
from app.api.audit import router as audit_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Handle application startup and shutdown events cleanly.
    Connects to Motor MongoDB on startup and closes connection on shutdown.
    """
    logger.info("Application startup: Initializing database connection...")
    await connect_to_mongo()
    yield
    logger.info("Application shutdown: Closing database connection...")
    await close_mongo_connection()


app = FastAPI(
    title="Acadza Question Audit API",
    description="AI Question Audit Backend - Database & CRUD Foundation (Phase 2)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    # Credentialed CORS requests cannot use a wildcard origin. Keep the local
    # frontend development origins explicit so browsers can complete preflight.
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-question-audit-1.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API routers
app.include_router(questions_router)
app.include_router(reports_router)
app.include_router(ai_router)
app.include_router(faculty_router)
app.include_router(audit_router)


@app.get("/", tags=["Health"])
async def root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "Acadza AI Question Audit Backend",
        "phase": "Phase 2 - Database & CRUD Foundation",
        "version": "1.0.0",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
