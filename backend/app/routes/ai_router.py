from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import traceback
import re
import json
from fastapi.responses import StreamingResponse, Response
import requests
from app.services.alleai_service import alleai_service

router = APIRouter(prefix="/ai", tags=["ai"])

class PromptRequest(BaseModel):
    prompt: str
    models: Optional[List[str]] = None

class ChatResponse(BaseModel):
    result: str

class ImageResponse(BaseModel):
    url: str

def extract_main_text(text: str) -> str:
    # Remove lines that look like metadata (e.g., 'Created at:', 'Date:', etc.)
    lines = text.splitlines()
    filtered = [line for line in lines if not (line.lower().startswith('created at') or line.lower().startswith('date:') or line.lower().startswith('created:'))]
    # Remove lines that look like JSON metadata or cost info
    filtered = [line for line in filtered if not re.search(r'(tokens_used|usage|cost|finish_reason|prompt_tokens|completion_tokens|total_tokens|total_cost|input_cost|output_cost)', line)]
    return '\n'.join(filtered).strip()

def summarize_text(text: str, max_sentences: int = 3) -> str:
    # Simple summarization: return the first max_sentences sentences
    sentences = re.split(r'(?<=[.!?]) +', text)
    return ' '.join(sentences[:max_sentences]).strip()

def format_as_blog_post(topic: str, content: str) -> str:
    # Format the content as a professional blog post
    heading = f"# {topic.strip().capitalize()}"
    intro = f"As a professional blog writer, here is a concise and informative post about {topic.strip().lower()}:"
    body = content.strip()
    return f"{heading}\n\n{intro}\n\n{body}"

def is_valid_image_url(url: str) -> bool:
    # Basic check for image URL (http/https and ends with image extension or is a data URL)
    return (
        url.startswith('http://') or url.startswith('https://') or url.startswith('data:image/')
    )

def extract_image_url(response) -> str:
    print("Type of response:", type(response))
    print("Response repr:", repr(response))
    print("Response dir:", dir(response))
    # Try dict-style access
    outer = None
    if isinstance(response, dict):
        outer = response.get("responses")
    else:
        # Try attribute access
        outer = getattr(response, "responses", None)
    if outer:
        inner = None
        if isinstance(outer, dict):
            inner = outer.get("responses")
        else:
            inner = getattr(outer, "responses", None)
        if inner:
            if isinstance(inner, dict):
                for url in inner.values():
                    if isinstance(url, str) and url.startswith("http"):
                        print("Extracted image URL:", url)
                        return url
            else:
                # If it's not a dict, try attribute access
                for attr in dir(inner):
                    value = getattr(inner, attr)
                    if isinstance(value, str) and value.startswith("http"):
                        print("Extracted image URL:", value)
                        return value
    print("Extracted image URL: (placeholder)")
    return "https://placehold.co/400x250/png?text=No+Image+Available"

@router.post("/generate-title", response_model=ChatResponse)
async def generate_title(request: PromptRequest):
    try:
        if not alleai_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="AI service is not available. Please configure AlleAI API key."
            )
        
        # Create a prompt for title generation
        title_prompt = f"Generate a concise, professional title for this topic: {request.prompt}. The title should be clear, descriptive, and suitable for agricultural content. Return only the title, no additional text."
        
        models = request.models or ["gpt-4o"]
        result = await alleai_service.chat_with_ai(
            user_message=title_prompt,
            conversation_history=[],
            models=models
        )
        
        # Clean the response to get just the title
        title = result.strip()
        if title.startswith('"') and title.endswith('"'):
            title = title[1:-1]
        
        return {"result": title}
    except Exception as e:
        print("Error in /ai/generate-title:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-description", response_model=ChatResponse)
async def generate_description(request: PromptRequest):
    try:
        if not alleai_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="AI service is not available. Please configure AlleAI API key."
            )
        
        # Create a prompt for description generation
        description_prompt = f"Write a comprehensive, informative description for this agricultural topic: {request.prompt}. The description should be 2-3 paragraphs long, include practical information, and be written in a professional but accessible tone suitable for farmers and agricultural professionals. Focus on practical applications and benefits."
        
        models = request.models or ["gpt-4o"]
        result = await alleai_service.chat_with_ai(
            user_message=description_prompt,
            conversation_history=[],
            models=models
        )
        
        return {"result": result}
    except Exception as e:
        print("Error in /ai/generate-description:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-image", response_model=ImageResponse)
async def generate_image(request: PromptRequest):
    try:
        if not alleai_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="AI service is not available. Please configure AlleAI API key."
            )
        
        # Create a prompt for image generation
        image_prompt = f"Generate a high-quality, realistic image of: {request.prompt}. The image should be suitable for agricultural content, professional, and visually appealing. Focus on clarity and realism."
        
        models = request.models or ["dall-e-3"]
        
        # For now, return a placeholder since AlleAI might not support image generation
        # In the future, this could be connected to an image generation service
        placeholder_url = "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400"
        
        return {"url": placeholder_url}
    except Exception as e:
        print("Error in /ai/generate-image:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/proxy-image")
def proxy_image(url: str):
    try:
        r = requests.get(url, stream=True)
        # Guess content type from headers, fallback to image/png
        content_type = r.headers.get('content-type', 'image/png')
        headers = {"Access-Control-Allow-Origin": "*"}
        return StreamingResponse(r.raw, media_type=content_type, headers=headers)
    except Exception as e:
        print("Error proxying image:", e)
        return Response(content="Failed to fetch image", status_code=500)

@router.post("/chat")
async def ai_chat(request: PromptRequest):
    """General AI chat endpoint"""
    try:
        if not alleai_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="AI service is not available. Please configure AlleAI API key."
            )
        
        models = request.models or ["gpt-4o"]
        result = await alleai_service.chat_with_ai(
            user_message=request.prompt,
            conversation_history=[],
            models=models
        )
        
        return {"result": result}
    except Exception as e:
        print("Error in /ai/chat:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/disease-analysis")
async def disease_analysis(request: PromptRequest):
    """Specialized endpoint for disease analysis"""
    try:
        if not alleai_service.is_available():
            raise HTTPException(
                status_code=503,
                detail="AI service is not available. Please configure AlleAI API key."
            )
        
        # Parse the prompt to extract disease information
        # Expected format: "disease_name|confidence|crop_type"
        parts = request.prompt.split('|')
        if len(parts) >= 3:
            disease_name = parts[0].strip()
            confidence = float(parts[1].strip())
            crop_type = parts[2].strip()
            
            models = request.models or ["gpt-4o"]
            result = await alleai_service.get_disease_recommendations(
                disease_name=disease_name,
                confidence=confidence,
                crop_type=crop_type,
                models=models
            )
            
            return {"result": result}
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid format. Expected: disease_name|confidence|crop_type"
            )
    except Exception as e:
        print("Error in /ai/disease-analysis:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status")
async def ai_status():
    """Get AI service status"""
    try:
        is_available = alleai_service.is_available()
        models = alleai_service.get_available_models()
        
        return {
            "status": "available" if is_available else "unavailable",
            "models": models,
            "service": "AlleAI"
        }
    except Exception as e:
        print("Error in /ai/status:", e)
        return {
            "status": "error",
            "error": str(e),
            "service": "AlleAI"
        } 