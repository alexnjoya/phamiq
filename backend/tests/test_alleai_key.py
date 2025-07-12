#!/usr/bin/env python3
"""
Simple test script to verify AlleAI API key
"""
import os
import asyncio
import aiohttp
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_alleai_api():
    """Test AlleAI API with the configured key"""
    
    # Get API key from environment
    api_key = os.getenv("ALLEAI_API_KEY")
    if not api_key:
        print("❌ No API key found in environment variables")
        print("Please set ALLEAI_API_KEY in your .env file or environment")
        return
    
    print(f"🔑 API Key found: {api_key[:10]}...")
    
    # Test request
    url = "https://api.alle-ai.com/api/v1/chat/completions"
    
    payload = {
        "models": ["gpt-4o"],
        "messages": [
            {
                "user": [
                    {
                        "type": "text",
                        "text": "Hello, this is a test. Please respond with 'Test successful' if you can read this."
                    }
                ]
            }
        ],
        "web_search": False,
        "combination": False,
        "summary": False,
        "temperature": 0.7,
        "max_tokens": 100,
        "top_p": 1,
        "frequency_penalty": 0.2,
        "presence_penalty": 0.3,
        "stream": False
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, headers=headers, json=payload) as response:
                print(f"📡 Response status: {response.status}")
                print(f"📋 Response headers: {dict(response.headers)}")
                
                response_text = await response.text()
                print(f"📄 Response body: {response_text}")
                
                if response.status == 200:
                    print("✅ API key is working!")
                    try:
                        data = json.loads(response_text)
                        if "choices" in data and data["choices"]:
                            content = data["choices"][0]["message"]["content"]
                            print(f"🤖 AI Response: {content}")
                    except Exception as e:
                        print(f"⚠️ Could not parse response: {e}")
                else:
                    print("❌ API key is not working")
                    try:
                        error_data = json.loads(response_text)
                        print(f"🔍 Error details: {error_data}")
                    except:
                        print(f"🔍 Error text: {response_text}")
                        
    except Exception as e:
        print(f"❌ Network error: {e}")

if __name__ == "__main__":
    print("🧪 Testing AlleAI API Key...")
    asyncio.run(test_alleai_api()) 