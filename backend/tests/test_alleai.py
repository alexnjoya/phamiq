#!/usr/bin/env python3
"""
Test script for AlleAI integration
"""

import asyncio
import aiohttp
import json
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_alleai_connection():
    """Test AlleAI API connection directly"""
    
    # Test API keys
    api_keys = [
        "alle-lAk4nhrUAHlKnAXKSBCHhwuP1KMsIrmlkkRW",
        "alle-lAk4nhrUAHlKnAXKSBCHhwuP1KMsIrmlkkRW"  # Same for now
    ]
    
    api_url = "https://api.alle-ai.com/api/v1/chat/completions"
    
    for i, api_key in enumerate(api_keys):
        logger.info(f"Testing API key {i+1}: {api_key[:20]}...")
        
        try:
            async with aiohttp.ClientSession() as session:
                payload = {
                    "model": "gpt-4o",
                    "messages": [
                        {
                            "role": "user",
                            "content": "Hello, this is a test. Please respond with 'Test successful' if you can read this."
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 50,
                    "stream": False
                }
                
                logger.info(f"Sending test request to AlleAI...")
                
                async with session.post(
                    url=api_url,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    
                    logger.info(f"Response status: {response.status}")
                    
                    if response.ok:
                        response_data = await response.json()
                        logger.info(f"Response data: {json.dumps(response_data, indent=2)}")
                        
                        # Extract content
                        content = None
                        if response_data.get("choices") and response_data["choices"]:
                            content = response_data["choices"][0]["message"]["content"]
                        elif response_data.get("message"):
                            content = response_data["message"]
                        elif response_data.get("content"):
                            content = response_data["content"]
                        elif response_data.get("response"):
                            content = response_data["response"]
                        
                        if content:
                            logger.info(f"✅ SUCCESS: API key {i+1} works! Response: {content}")
                            return api_key
                        else:
                            logger.error(f"❌ No content in response for API key {i+1}")
                    else:
                        error_text = await response.text()
                        logger.error(f"❌ API key {i+1} failed: {response.status} - {error_text}")
                        
        except Exception as e:
            logger.error(f"❌ Error testing API key {i+1}: {str(e)}")
    
    logger.error("❌ All API keys failed")
    return None

if __name__ == "__main__":
    working_key = asyncio.run(test_alleai_connection())
    if working_key:
        print(f"\n✅ Found working API key: {working_key}")
    else:
        print("\n❌ No working API keys found") 