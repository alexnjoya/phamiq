from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import traceback
import re
import json
from fastapi.responses import StreamingResponse, Response
import requests

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
def generate_title(request: PromptRequest):
    try:
        # Rephrase the entered prompt and return as the title
        # For now, just return the prompt as-is (or you can implement a simple rephrase logic)
        result = request.prompt.strip()
        return {"result": result}
    except Exception as e:
        print("Error in /ai/generate-title:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-description", response_model=ChatResponse)
def generate_description(request: PromptRequest):
    try:
        print("AlleAI service is currently disabled.")
        # Placeholder for actual description generation logic
        result = "Description generation is currently unavailable."
        return {"result": result}
    except Exception as e:
        print("Error in /ai/generate-description:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-image", response_model=ImageResponse)
def generate_image(request: PromptRequest):
    try:
        print("AlleAI service is currently disabled.")
        # Placeholder for actual image generation logic
        result = "Image generation is currently unavailable."
        return {"url": result}
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