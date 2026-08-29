"""
ORACLE Trading System - Master FastAPI Application Entrypoint
Mounts API v1 routers, WebSocket streams, CORS middleware, and lifecycle management.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import datetime
import uvicorn

from backend.core.config import settings
from backend.core.logging import logger
from backend.api.v1.api_router import api_v1_router
from backend.websockets.stream_router import router as websocket_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application Lifespan Events (Startup & Shutdown)
    """
    logger.info("=" * 60)
    logger.info(f"🚀 Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"📡 API Documentation available at: http://localhost:{settings.PORT}/docs")
    logger.info("=" * 60)
    yield
    logger.info("🛑 Shutting down ORACLE FastAPI Backend.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error_code": "INTERNAL_SERVER_ERROR",
            "detail": str(exc),
            "path": request.url.path,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }
    )


# Mount Versioned API & WebSockets
app.include_router(api_v1_router, prefix=settings.API_V1_STR)
app.include_router(websocket_router)


from fastapi.staticfiles import StaticFiles
from pathlib import Path

# Health Check Endpoint
@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "HEALTHY",
        "version": settings.VERSION,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# Mount Frontend Static Web Application
FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")



if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
