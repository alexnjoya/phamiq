from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import logging

from app.services.alleai_service import alleai_service
from app.utils.auth import get_current_active_user
from app.models.database import User, ChatHistoryModel

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = logging.getLogger(__name__)

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []
    models: Optional[List[str]] = None  # Add model selection

class ChatResponse(BaseModel):
    success: bool
    message: str
    chat_id: Optional[str] = None

class ChatHistoryResponse(BaseModel):
    id: str
    title: str
    messages: List[dict]
    created_at: str
    updated_at: str



@router.get("/status")
async def get_chat_status():
    """Get detailed chat service status"""
    try:
        logger.info("Chat status endpoint called")
        
        # Check if AlleAI service is available
        is_available = alleai_service.is_available()
        
        # Test connection if available
        connection_status = "unknown"
        if is_available:
            try:
                connection_ok = await alleai_service.test_connection()
                connection_status = "connected" if connection_ok else "failed"
            except Exception as e:
                connection_status = f"error: {str(e)}"
        
        return {
            "status": "success",
            "service": "Phamiq AI Chat",
            "alleai_available": is_available,
            "connection_status": connection_status,
            "models": alleai_service.get_available_models() if is_available else [],
            "api_key_configured": bool(alleai_service.api_key),
            "message": "Chat service is ready" if is_available else "Chat service not configured"
        }
    except Exception as e:
        logger.error(f"Error in chat status endpoint: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get chat status: {str(e)}"
        )

@router.get("/models")
async def get_available_models():
    """Get list of available AI models"""
    try:
        models = alleai_service.get_available_models()
        return {
            "status": "success",
            "models": models,
            "default_models": alleai_service.default_models
        }
    except Exception as e:
        logger.error(f"Error getting available models: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get available models: {str(e)}"
        )

@router.get("/test")
async def test_chat_connection(current_user: User = Depends(get_current_active_user)):
    """Test chat connection"""
    try:
        logger.info(f"Testing chat connection for user: {current_user.email}")
        if not alleai_service.is_available():
            logger.warning("AlleAI service not available")
            raise HTTPException(
                status_code=503,
                detail="Chat service is not available. Please configure AlleAI API key."
            )
        
        # Test the actual connection
        connection_ok = await alleai_service.test_connection()
        if not connection_ok:
            raise HTTPException(
                status_code=503,
                detail="AlleAI API connection failed. Please check your API key and network connection."
            )
        
        logger.info("Chat service test successful")
        return {"status": "success", "message": "Chat service is available and working"}
    except Exception as e:
        logger.error(f"Chat test error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Chat service error: {str(e)}"
        )

@router.get("/test-simple")
async def test_simple_chat():
    """Simple test endpoint without authentication"""
    try:
        logger.info("Testing simple chat connection")
        if not alleai_service.is_available():
            logger.warning("AlleAI service not available")
            raise HTTPException(
                status_code=503,
                detail="Chat service is not available. Please configure AlleAI API key."
            )
        
        # Test the actual connection
        connection_ok = await alleai_service.test_connection()
        if not connection_ok:
            raise HTTPException(
                status_code=503,
                detail="AlleAI API connection failed. Please check your API key and network connection."
            )
        
        logger.info("Simple chat service test successful")
        return {"status": "success", "message": "Chat service is available and working"}
    except Exception as e:
        logger.error(f"Simple chat test error: {str(e)}")
        raise HTTPException(
            status_code=503,
            detail=f"Chat service error: {str(e)}"
        )

@router.post("/", response_model=ChatResponse)
async def chat_with_ai(
    request: ChatRequest
    # current_user: User = Depends(get_current_active_user)  # REMOVE auth for open chat
):
    """Chat with AI assistant using enhanced AlleAI service"""
    try:
        logger.info(f"Chat request (unauthenticated), message: {request.message[:50]}...")
        if not alleai_service.is_available():
            logger.warning("AlleAI service not available for chat")
            raise HTTPException(
                status_code=503,
                detail="Chat service is not available. Please configure AlleAI API key."
            )
        # Convert conversation history to the format expected by the service
        conversation_history = []
        for msg in request.conversation_history:
            conversation_history.append({
                "role": msg.role,
                "content": msg.content
            })
        logger.info(f"Sending request to enhanced AlleAI service with {len(conversation_history)} history messages")
        # Use the enhanced chat_with_ai method with model selection
        response_content = await alleai_service.chat_with_ai(
            user_message=request.message,
            conversation_history=conversation_history,
            models=request.models
        )
        if not response_content:
            logger.error("No response content received from AlleAI")
            raise Exception("No response received from AI")
        logger.info(f"Chat response generated (unauthenticated), response length: {len(response_content)}")
        return ChatResponse(
            success=True,
            message=response_content,
            chat_id=None
        )
    except HTTPException as e:
        logger.error(f"HTTP exception in chat: {str(e)}")
        raise e
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get AI response: {str(e)}"
        )

@router.post("/test-chat")
async def test_chat_functionality():
    """Test chat functionality with a simple message"""
    try:
        logger.info("Testing chat functionality")
        
        # Test with a simple agricultural question
        test_message = "How do I treat plant diseases?"
        
        response_content = await alleai_service.chat_with_ai(
            user_message=test_message,
            conversation_history=[],
            models=["gpt-4o"]
        )
        
        logger.info(f"Chat test successful, response length: {len(response_content)}")
        return {
            "status": "success",
            "message": "Chat functionality is working",
            "test_response": response_content[:200] + "..." if len(response_content) > 200 else response_content
        }
    except Exception as e:
        logger.error(f"Chat test error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Chat test failed: {str(e)}"
        )

@router.get("/history", response_model=List[ChatHistoryResponse])
async def get_chat_history(
    current_user: User = Depends(get_current_active_user),
    limit: int = 20
):
    """Get user's chat history"""
    try:
        chats = await ChatHistoryModel.find_by_user_id(str(current_user.id), limit=limit)
        return [
            ChatHistoryResponse(
                id=str(chat.id),
                title=chat.title,
                messages=chat.messages,
                created_at=chat.created_at.isoformat(),
                updated_at=chat.updated_at.isoformat()
            )
            for chat in chats
        ]
    except Exception as e:
        logger.error(f"Error getting chat history: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get chat history"
        )

@router.get("/history/{chat_id}", response_model=ChatHistoryResponse)
async def get_chat_by_id(
    chat_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Get specific chat by ID"""
    try:
        chat = await ChatHistoryModel.find_by_id(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        if str(chat.user_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        return ChatHistoryResponse(
            id=str(chat.id),
            title=chat.title,
            messages=chat.messages,
            created_at=chat.created_at.isoformat(),
            updated_at=chat.updated_at.isoformat()
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting chat by ID: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to get chat"
        )

@router.delete("/history/{chat_id}")
async def delete_chat(
    chat_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Delete a chat"""
    try:
        chat = await ChatHistoryModel.find_by_id(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        if str(chat.user_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        await chat.delete()
        return {"success": True, "message": "Chat deleted successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error deleting chat: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to delete chat"
        )

@router.put("/history/{chat_id}/title")
async def update_chat_title(
    chat_id: str,
    title: str,
    current_user: User = Depends(get_current_active_user)
):
    """Update chat title"""
    try:
        chat = await ChatHistoryModel.find_by_id(chat_id)
        if not chat:
            raise HTTPException(status_code=404, detail="Chat not found")
        
        if str(chat.user_id) != str(current_user.id):
            raise HTTPException(status_code=403, detail="Access denied")
        
        await chat.update_title(title)
        return {"success": True, "message": "Chat title updated successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating chat title: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update chat title"
        ) 