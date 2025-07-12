#!/usr/bin/env python3
"""
Simple test script for AlleAI service
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.alleai_service import alleai_service

async def test_alleai_service():
    """Test the AlleAI service functionality"""
    print("🧪 Testing AlleAI Service...")
    
    # Test 1: Check if service is available
    print("\n1. Testing service availability...")
    is_available = alleai_service.is_available()
    print(f"   Service available: {is_available}")
    
    if not is_available:
        print("   ❌ Service not available - check API key configuration")
        return False
    
    # Test 2: Test connection
    print("\n2. Testing connection...")
    try:
        connection_ok = await alleai_service.test_connection()
        print(f"   Connection test: {'✅ Success' if connection_ok else '❌ Failed'}")
    except Exception as e:
        print(f"   ❌ Connection test failed: {str(e)}")
        return False
    
    # Test 3: Test simple chat
    print("\n3. Testing simple chat...")
    try:
        response = await alleai_service.chat_with_ai(
            user_message="Hello, can you help me with plant diseases?",
            conversation_history=[],
            models=["gpt-4o"]
        )
        print(f"   ✅ Chat response received (length: {len(response)})")
        print(f"   Response preview: {response[:100]}...")
    except Exception as e:
        print(f"   ❌ Chat test failed: {str(e)}")
        return False
    
    # Test 4: Test disease recommendations
    print("\n4. Testing disease recommendations...")
    try:
        recommendations = await alleai_service.get_disease_recommendations(
            disease_name="tomato_leaf_blight",
            confidence=0.85,
            crop_type="tomato",
            models=["gpt-4o"]
        )
        print(f"   ✅ Disease recommendations received")
        print(f"   Recommendations keys: {list(recommendations.keys())}")
    except Exception as e:
        print(f"   ❌ Disease recommendations test failed: {str(e)}")
        return False
    
    print("\n🎉 All tests passed! AlleAI service is working correctly.")
    return True

if __name__ == "__main__":
    try:
        result = asyncio.run(test_alleai_service())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n⏹️ Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n💥 Test failed with error: {str(e)}")
        sys.exit(1) 