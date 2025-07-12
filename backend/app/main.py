from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager
from starlette.middleware.sessions import SessionMiddleware

from app.config import settings
from app.models.database import connect_to_mongo, close_mongo_connection
from app.routes import (
    health_router, 
    prediction_router, 
    auth_router,
    history_router,
    chat_router,
    user_router,
    discovery_router,
    ai_router
)
from app.services.prediction_service import prediction_service
from app.services.alleai_service import alleai_service

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events"""
    # Startup
    try:
        # Connect to MongoDB
        await connect_to_mongo()
        
        # Load prediction model
        prediction_service.load_model()
        
        # Initialize AlleAI service
        logger.info("Initializing AlleAI service...")
        if alleai_service.is_available():
            logger.info("✅ AlleAI service initialized successfully")
            # Test the connection
            try:
                connection_ok = await alleai_service.test_connection()
                if connection_ok:
                    logger.info("✅ AlleAI connection test successful")
                else:
                    logger.warning("⚠️ AlleAI connection test failed, but service is available")
            except Exception as e:
                logger.warning(f"⚠️ AlleAI connection test error: {str(e)}")
        else:
            logger.warning("❌ AlleAI service not available - API key may not be configured")
            logger.info(f"API Key configured: {bool(alleai_service.api_key)}")
            logger.info(f"API Key length: {len(alleai_service.api_key) if alleai_service.api_key else 0}")
        
        logger.info("API server started successfully")
        yield
    except Exception as e:
        logger.error(f"Failed to start server: {str(e)}")
        raise e
    # Shutdown
    await close_mongo_connection()
    logger.info("API server shutting down")

# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    description=settings.API_DESCRIPTION,
    version=settings.API_VERSION,
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.ALLOWED_METHODS,
    allow_headers=settings.ALLOWED_HEADERS,
)

# Add Session middleware for OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie="phamiq_session"
)

# Include routers
app.include_router(auth_router, prefix="/auth")
app.include_router(prediction_router)
app.include_router(health_router)
app.include_router(history_router)
app.include_router(chat_router)
app.include_router(user_router)
app.include_router(discovery_router)
app.include_router(ai_router)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Global exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal server error"}
    )

@app.get("/")
async def root():
    return {"message": "Phamiq Crop Disease Classification API", "version": settings.API_VERSION}

@app.get("/test-alleai")
async def test_alleai():
    """Test AlleAI connection with a simple request"""
    try:
        if not alleai_service.is_available():
            return {
                "status": "error",
                "message": "AlleAI service not available",
                "api_key_configured": bool(alleai_service.api_key),
                "api_key_preview": alleai_service.api_key[:10] + "..." if alleai_service.api_key else "None"
            }
        
        # Test with a simple request
        test_message = "Hello, this is a test. Please respond with 'Test successful' if you can read this."
        
        response = await alleai_service.chat_with_ai(
            user_message=test_message,
            conversation_history=[],
            models=["gpt-4o"]
        )
        
        return {
            "status": "success",
            "message": "AlleAI connection test successful",
            "response": response[:100] + "..." if len(response) > 100 else response,
            "api_key_configured": bool(alleai_service.api_key),
            "api_key_preview": alleai_service.api_key[:10] + "..." if alleai_service.api_key else "None"
        }
    except Exception as e:
        logger.error(f"AlleAI test error: {str(e)}")
        return {
            "status": "error",
            "message": f"AlleAI test failed: {str(e)}",
            "api_key_configured": bool(alleai_service.api_key),
            "api_key_preview": alleai_service.api_key[:10] + "..." if alleai_service.api_key else "None"
        }

@app.get("/alleai-status")
async def alleai_status():
    """Check AlleAI service status"""
    try:
        is_available = alleai_service.is_available()
        api_key_configured = bool(alleai_service.api_key)
        
        # Test the connection if available
        connection_status = "unknown"
        if is_available:
            try:
                connection_ok = await alleai_service.test_connection()
                connection_status = "connected" if connection_ok else "failed"
            except Exception as e:
                connection_status = f"error: {str(e)}"
        
        return {
            "alleai_available": is_available,
            "api_key_configured": api_key_configured,
            "api_key_length": len(alleai_service.api_key) if alleai_service.api_key else 0,
            "api_key_preview": alleai_service.api_key[:10] + "..." if alleai_service.api_key else "None",
            "connection_status": connection_status,
            "models": alleai_service.get_available_models() if is_available else [],
            "message": "AlleAI service is ready" if is_available else "AlleAI service not configured"
        }
    except Exception as e:
        logger.error(f"Error checking AlleAI status: {str(e)}")
        return {
            "alleai_available": False,
            "error": str(e),
            "message": "Error checking AlleAI service"
        }