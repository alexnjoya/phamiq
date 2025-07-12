#!/usr/bin/env python3
"""
Test script to verify AlleAI API connection
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.services.alleai_service import AlleAIService
from app.config import settings

async def test_alleai_connection():
    """Test the AlleAI connection"""
    print("Testing AlleAI API connection...")
    print(f"API Key configured: {bool(settings.ALLEAI_API_KEY)}")
    print(f"API Key length: {len(settings.ALLEAI_API_KEY)}")
    print(f"API Key prefix: {settings.ALLEAI_API_KEY[:10]}...")
    
    # Initialize the service
    service = AlleAIService()
    
    # Test availability
    is_available = service.is_available()
    print(f"Service available: {is_available}")
    
    if not is_available:
        print("❌ Service not available - check API key configuration")
        return False
    
    # Test connection
    try:
        success = await service.test_connection()
        if success:
            print("✅ AlleAI connection test successful!")
            return True
        else:
            print("❌ AlleAI connection test failed!")
            return False
    except Exception as e:
        print(f"❌ Error during connection test: {str(e)}")
        return False

async def test_simple_chat():
    """Test a simple chat request"""
    print("\nTesting simple chat request...")
    
    service = AlleAIService()
    
    try:
        response = await service.chat_with_ai(
            user_message="Hello! Can you tell me about tomato diseases?",
            models=["gpt-4o"]
        )
        print(f"✅ Chat response received: {response[:200]}...")
        return True
    except Exception as e:
        print(f"❌ Chat test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("=== AlleAI API Connection Test ===")
    
    # Test connection
    connection_success = asyncio.run(test_alleai_connection())
    
    if connection_success:
        # Test chat
        chat_success = asyncio.run(test_simple_chat())
        
        if chat_success:
            print("\n🎉 All tests passed! AlleAI integration is working correctly.")
        else:
            print("\n⚠️ Connection works but chat failed. Check the API response format.")
    else:
        print("\n❌ Connection test failed. Check API key and network connectivity.") 