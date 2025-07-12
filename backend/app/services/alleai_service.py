import os
import logging
import aiohttp
import json
from typing import Dict, Any, Optional, List
from app.config import settings
import asyncio

logger = logging.getLogger(__name__)


class AlleAIService:
    """Enhanced service for handling AlleAI LLM interactions with agricultural expertise"""

    def __init__(self):
        # Get API key from environment or settings
        self.api_key = settings.ALLEAI_API_KEY
        
        # Clean and validate API key
        if self.api_key:
            self.api_key = self.api_key.strip()
            if not self.api_key.startswith("alle-"):
                logger.warning(f"API key format may be incorrect. Expected 'alle-' prefix, got: {self.api_key[:10]}...")
        
        self.api_url = "https://api.alle-ai.com/api/v1/chat/completions"
        self.default_models = ["gpt-4o", "yi-large"]
        
        # Simple in-memory cache for recommendations
        self._recommendations_cache = {}
        
        logger.info(f"Initializing AlleAI service with API key: {self.api_key[:20] if self.api_key else 'None'}...")
        
        if not self.api_key:
            logger.warning("AlleAI API key not found, service will not be available")
        else:
            logger.info("✅ AlleAI service initialized successfully")
            logger.info(f"API Key format: {self.api_key[:10]}...{self.api_key[-4:] if len(self.api_key) > 14 else ''}")
    
    def is_available(self) -> bool:
        """Check if AlleAI service is available"""
        if not self.api_key:
            logger.warning("AlleAI service disabled - no API key configured")
            return False
        
        logger.info("✅ AlleAI service is available and ready")
        return True
    
    def clear_cache(self):
        """Clear the recommendations cache"""
        self._recommendations_cache.clear()
        logger.info("Recommendations cache cleared")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        return {
            "cache_size": len(self._recommendations_cache),
            "cached_keys": list(self._recommendations_cache.keys())
        }
    
    def get_available_models(self) -> List[str]:
        """Get list of available models"""
        return self.default_models
    
    async def test_connection(self) -> bool:
        """Test the AlleAI connection with a simple request"""
        try:
            test_messages = [
                {"role": "user", "content": "Hello, this is a test message. Please respond with 'Connection successful' if you can read this."}
            ]
            
            response = await self._make_alleai_request(
                messages=test_messages,
                temperature=0.1,
                max_tokens=50,
                models=["gpt-4o"]
            )
            
            logger.info(f"AlleAI connection test successful: {response}")
            return True
        except Exception as e:
            logger.error(f"AlleAI connection test failed: {str(e)}")
            return False
    
    def _get_agricultural_system_prompt(self) -> str:
        """Get the enhanced agricultural system prompt"""
        return """You are an expert agricultural AI assistant specializing in crop disease management and agricultural best practices. You provide helpful, conversational advice for farmers and agricultural professionals.

**Your Expertise Areas:**
- Plant disease identification and management
- Soil health and fertilization
- Irrigation and watering practices
- Pest control strategies
- Crop management and rotation
- Organic farming methods
- Climate-smart agriculture

**Response Guidelines:**
1. **Provide natural, conversational responses** like ChatGPT
2. **Give practical, actionable advice** that farmers can implement
3. **Include both organic and conventional solutions** when applicable
4. **Consider local conditions** and climate factors
5. **Provide step-by-step instructions** for complex procedures
6. **Include safety warnings** for chemical treatments
7. **Suggest monitoring and follow-up actions**

**Important:**
- Respond naturally and conversationally, not in structured JSON format
- Use clear, helpful language that's easy to understand
- Provide specific, actionable advice
- Be friendly and supportive in your tone
- Focus on practical solutions that farmers can implement immediately"""

    def _get_disease_analysis_prompt(self, disease_name: str, confidence: float, crop_type: str) -> str:
        """Generate a specialized prompt for disease analysis"""
        return f"""You are an expert agricultural scientist specializing in crop disease management.

**Analysis Request:**
- Disease: {disease_name}
- Confidence Level: {confidence:.1%}
- Crop Type: {crop_type}

Please provide a comprehensive analysis with the following structure:

**1. Disease Overview**
- Brief description of the disease
- Common symptoms and identification markers
- Conditions that favor disease development

**2. Immediate Action Plan**
- First steps to take when this disease is detected
- Isolation and containment measures
- Emergency treatment options

**3. Treatment Protocols**
- Organic treatment methods
- Chemical treatment options (if applicable)
- Application timing and frequency
- Safety precautions

**4. Prevention Strategies**
- Cultural practices to prevent recurrence
- Environmental management
- Crop rotation recommendations
- Resistant variety suggestions

**5. Monitoring and Follow-up**
- Signs of improvement to watch for
- Timeline for treatment effectiveness
- When to seek professional help

**6. Cost-Effective Solutions**
- Budget-friendly treatment options
- DIY solutions for small farms
- Community resource recommendations

Format your response as a valid JSON object with these fields:
{{
    "disease_overview": "Brief disease description and key symptoms",
    "immediate_actions": "Step-by-step immediate response plan",
    "treatment_protocols": {{
        "organic": "Organic treatment methods",
        "chemical": "Chemical options if applicable",
        "application": "How and when to apply treatments"
    }},
    "prevention": "Long-term prevention strategies",
    "monitoring": "How to monitor progress and effectiveness",
    "cost_effective": "Budget-friendly solutions",
    "severity_level": "Low/Moderate/High based on disease type",
    "professional_help": "When to consult agricultural experts"
}}

**IMPORTANT:**
- Respond ONLY with a valid JSON object matching the structure above.
- Do NOT include any text, explanation, or markdown formatting before or after the JSON.
- Only output the JSON object.
"""
    
    def _get_fallback_response(self, user_message: str) -> str:
        """Get a fallback response when AlleAI is unavailable"""
        message_lower = user_message.lower()
        
        # Return natural conversational responses instead of JSON
        if "disease" in message_lower or "sick" in message_lower or "problem" in message_lower:
            return "I understand you're dealing with plant health issues. Here are some general steps you can take:\n\n1. **Isolate affected plants** to prevent the problem from spreading to healthy plants\n2. **Remove and destroy severely infected parts** - this helps stop the spread\n3. **Improve air circulation** around your plants by ensuring proper spacing\n4. **Avoid overhead watering** which can spread diseases\n5. **Use clean tools** when working with different plants\n\nFor more specific advice, I'd need to know what type of plant you're working with and what symptoms you're seeing. Could you tell me more about your specific situation?"
        
        elif "soil" in message_lower or "fertilizer" in message_lower or "nutrient" in message_lower:
            return "Soil health is crucial for plant growth! Here are some key points:\n\n• **Test your soil** to understand its current nutrient levels\n• **Add organic matter** like compost to improve soil structure\n• **Use balanced fertilizers** based on your soil test results\n• **Consider crop rotation** to maintain soil health\n• **Monitor pH levels** - most plants prefer slightly acidic to neutral soil\n\nWhat type of soil are you working with, and what are you trying to grow?"
        
        elif "water" in message_lower or "irrigation" in message_lower:
            return "Proper watering is essential for plant health! Here are some tips:\n\n• **Water deeply but less frequently** to encourage deep root growth\n• **Water early in the morning** to reduce evaporation and disease risk\n• **Check soil moisture** before watering - stick your finger in the soil\n• **Use mulch** to retain soil moisture\n• **Avoid overwatering** which can cause root rot\n\nWhat's your current watering schedule, and are you seeing any specific issues?"
        
        elif "pest" in message_lower or "insect" in message_lower or "bug" in message_lower:
            return "Pest management can be challenging! Here's a balanced approach:\n\n• **Identify the pest first** - this helps determine the best control method\n• **Start with cultural controls** like removing affected plants\n• **Use beneficial insects** when possible\n• **Consider organic options** like neem oil before chemical pesticides\n• **Monitor regularly** to catch problems early\n\nCan you describe what pests you're seeing and on what plants?"
        
        elif "treatment" in message_lower or "cure" in message_lower or "fix" in message_lower:
            return "For plant treatment, here's a systematic approach:\n\n1. **Identify the problem** - disease, pest, or environmental issue\n2. **Choose appropriate treatment** - organic or chemical options\n3. **Apply correctly** - follow label instructions and timing\n4. **Monitor results** - watch for improvement or side effects\n5. **Prevent recurrence** - address underlying causes\n\nWhat specific treatment are you considering, and what problem are you trying to solve?"
        
        elif "prevent" in message_lower or "avoid" in message_lower:
            return "Prevention is always better than cure! Here are key prevention strategies:\n\n• **Choose resistant varieties** when available\n• **Practice crop rotation** to break disease cycles\n• **Maintain good spacing** for air circulation\n• **Use clean tools and equipment**\n• **Monitor regularly** for early detection\n• **Keep garden clean** - remove debris and weeds\n\nWhat specific problem are you trying to prevent?"
        
        elif "organic" in message_lower or "natural" in message_lower:
            return "Organic solutions are great for sustainable farming! Here are some options:\n\n• **Neem oil** - effective against many pests and diseases\n• **Baking soda spray** - helps with fungal issues\n• **Beneficial insects** - ladybugs, lacewings, etc.\n• **Compost tea** - boosts plant immunity\n• **Crop rotation** - naturally breaks pest cycles\n• **Companion planting** - some plants protect others\n\nWhat specific organic solution are you interested in?"
        
        else:
            return "I'm here to help with your agricultural questions! I can assist with plant diseases, soil health, pest management, irrigation, and general farming practices.\n\nWhat specific agricultural challenge are you facing today? I'd be happy to provide some practical advice based on your situation. You can ask me about:\n\n• Disease identification and treatment\n• Soil health and fertilization\n• Pest management strategies\n• Watering and irrigation\n• Organic farming methods\n• Crop management tips"
    
    async def _make_alleai_request(self, messages: List[Dict[str, str]], temperature: float = 0.7, max_tokens: int = 1000, models: Optional[List[str]] = None) -> str:
        """Make a request to AlleAI API with enhanced error handling"""
        if not self.api_key:
            logger.error("AlleAI API key not configured")
            raise Exception("AlleAI API key not configured")
        
        models = models or self.default_models
        logger.info(f"Making AlleAI request with {len(messages)} messages, models={models}, temperature={temperature}, max_tokens={max_tokens}")
        
        try:
            async with aiohttp.ClientSession() as session:
                logger.info("Created aiohttp session")
                
                # Convert messages to AlleAI format
                alleai_messages = []
                for msg in messages:
                    if msg["role"] == "system":
                        # For system messages, we'll include them as user messages with context
                        alleai_messages.append({
                            "user": [
                                {
                                    "type": "text",
                                    "text": f"System instruction: {msg['content']}"
                                }
                            ]
                        })
                    elif msg["role"] == "user":
                        alleai_messages.append({
                            "user": [
                                {
                                    "type": "text",
                                    "text": msg["content"]
                                }
                            ]
                        })
                    elif msg["role"] == "assistant":
                        # For assistant messages, we'll include them as context in the next user message
                        # This is a simplified approach for the AlleAI format
                        pass
                
                # Use the AlleAI-specific format
                payload = {
                    "models": models,
                    "messages": alleai_messages,
                    "web_search": False,
                    "combination": False,
                    "summary": False,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "top_p": 1,
                    "frequency_penalty": 0.2,
                    "presence_penalty": 0.3,
                    "stream": False
                }
                
                logger.info(f"Sending request to AlleAI API with payload: {json.dumps(payload, indent=2)}")
                
                async with session.post(
                    url=self.api_url,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)  # Add timeout
                ) as response:
                    
                    logger.info(f"AlleAI API response status: {response.status}")
                    
                    if response.status == 402:
                        logger.warning("AlleAI API returned 402 - Payment required. Using fallback response.")
                        # Get the last user message for fallback
                        user_message = ""
                        for msg in reversed(messages):
                            if msg["role"] == "user":
                                user_message = msg["content"]
                                break
                        return self._get_fallback_response(user_message)
                    
                    if not response.ok:
                        error_text = await response.text()
                        logger.error(f"AlleAI API error: {response.status} - {error_text}")
                        
                        # Try to get more specific error information
                        try:
                            error_data = json.loads(error_text)
                            error_message = error_data.get('error', {}).get('message', error_text)
                        except:
                            error_message = error_text
                        
                        raise Exception(f"AlleAI API error: {response.status} - {error_message}")
                    
                    response_data = await response.json()
                    logger.info(f"AlleAI API response data: {json.dumps(response_data, indent=2)}")
                    
                    # Handle AlleAI response format
                    content = None
                    if response_data.get("choices") and response_data["choices"]:
                        # Standard OpenAI-like format
                        content = response_data["choices"][0]["message"]["content"]
                    elif response_data.get("message"):
                        # Direct message format
                        content = response_data["message"]
                    elif response_data.get("content"):
                        # Direct content format
                        content = response_data["content"]
                    elif response_data.get("response"):
                        # Alternative response format
                        content = response_data["response"]
                    elif response_data.get("text"):
                        # AlleAI specific format
                        content = response_data["text"]
                    elif response_data.get("data") and response_data["data"].get("text"):
                        # Nested AlleAI format
                        content = response_data["data"]["text"]
                    else:
                        logger.error("No response content found in AlleAI API response")
                        logger.error(f"Response structure: {json.dumps(response_data, indent=2)}")
                        raise Exception("No response content from AlleAI API")
                    
                    if not content:
                        logger.error("Empty response content from AlleAI API")
                        raise Exception("Empty response content from AlleAI API")
                    
                    logger.info(f"Successfully received response from AlleAI API, content length: {len(content)}")
                    return self._clean_response(content)
                    
        except aiohttp.ClientError as e:
            logger.error(f"Network error calling AlleAI API: {str(e)}")
            # Use fallback for network errors
            user_message = ""
            for msg in reversed(messages):
                if msg["role"] == "user":
                    user_message = msg["content"]
                    break
            return self._get_fallback_response(user_message)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON response from AlleAI API: {str(e)}")
            raise Exception("Invalid response from AlleAI API")
        except Exception as e:
            logger.error(f"Unexpected error calling AlleAI API: {str(e)}")
            # Use fallback for other errors
            user_message = ""
            for msg in reversed(messages):
                if msg["role"] == "user":
                    user_message = msg["content"]
                    break
            return self._get_fallback_response(user_message)
    
    @staticmethod
    def _clean_response(text: str) -> str:
        """Clean response while preserving Markdown formatting"""
        # Remove special tokens but keep newlines and Markdown symbols
        cleaned = text.replace("</s>", "").replace("<s>", "").strip()
        # Collapse multiple newlines to two (for paragraph separation)
        cleaned = "\n\n".join([line.strip() for line in cleaned.split("\n") if line.strip()])
        return cleaned

    async def get_disease_recommendations(self, disease_name: str, confidence: float, crop_type: str, models: Optional[List[str]] = None) -> Dict[str, Any]:
        """Get comprehensive treatment, prevention, and immediate action recommendations for a disease"""
        
        if not self.is_available():
            raise Exception("LLM service is required but not available. Please configure AlleAI API key.")
        
        # Create cache key
        cache_key = f"{disease_name}_{confidence}_{crop_type}"
        
        # Check cache first
        if cache_key in self._recommendations_cache:
            logger.info(f"Using cached recommendations for {disease_name}")
            return self._recommendations_cache[cache_key]
        
        import re
        try:
            # Use the specialized disease analysis prompt
            prompt = self._get_disease_analysis_prompt(disease_name, confidence, crop_type)
            
            messages = [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            response_content = await self._make_alleai_request(
                messages=messages, 
                temperature=0.3, 
                max_tokens=1200,
                models=models
            )
          
            try:
                # Try to parse as JSON first
                recommendations = json.loads(response_content)
                logger.info(f"Generated LLM recommendations for {disease_name}")
                
                # Cache the recommendations
                self._recommendations_cache[cache_key] = recommendations
                
                return recommendations
            except json.JSONDecodeError as json_error:
                logger.error(f"Failed to parse JSON response from LLM: {str(json_error)}")
                logger.error(f"Raw response: {response_content}")
                # Try to extract JSON object using regex
                match = re.search(r'\{[\s\S]*\}', response_content)
                if match:
                    json_str = match.group(0)
                    try:
                        recommendations = json.loads(json_str)
                        logger.info(f"Extracted JSON from LLM response for {disease_name}")
                        
                        # Cache the recommendations
                        self._recommendations_cache[cache_key] = recommendations
                        
                        return recommendations
                    except Exception as e2:
                        logger.error(f"Failed to parse extracted JSON: {str(e2)}")
                raise Exception(f"Invalid LLM response format: {str(json_error)}. Raw: {response_content}")
                
        except Exception as e:
            logger.error(f"Error getting LLM recommendations: {str(e)}")
            logger.warning("Using fallback recommendations due to LLM failure")
            fallback_recommendations = self._get_structured_fallback_recommendations(disease_name, confidence, crop_type)
            
            # Cache the fallback recommendations
            self._recommendations_cache[cache_key] = fallback_recommendations
            
            return fallback_recommendations

    def _get_structured_fallback_recommendations(self, disease_name: str, confidence: float, crop_type: str) -> Dict[str, Any]:
        """Get structured fallback recommendations when LLM is unavailable"""
        return {
            "disease_overview": f"General information about {disease_name} affecting {crop_type}",
            "immediate_actions": "1. Isolate affected plants\n2. Remove infected parts\n3. Improve air circulation\n4. Avoid overhead watering",
            "treatment_protocols": {
                "organic": "Apply neem oil or copper-based fungicides\nUse beneficial microbes\nImprove soil health",
                "chemical": "Consult with agricultural extension for chemical options",
                "application": "Apply treatments early morning or evening\nFollow label instructions carefully"
            },
            "prevention": "Use disease-resistant varieties\nPractice crop rotation\nMaintain proper spacing\nKeep tools clean",
            "monitoring": "Check plants daily for new symptoms\nMonitor treatment effectiveness\nDocument progress",
            "cost_effective": "Use homemade remedies like baking soda spray\nPractice good cultural methods\nJoin local farming groups for support",
            "severity_level": "Moderate",
            "professional_help": "Consult agricultural extension if symptoms worsen or spread rapidly"
        }

    async def chat_with_ai(self, user_message: str, conversation_history: Optional[List[Dict[str, str]]] = None, models: Optional[List[str]] = None) -> str:
        """Enhanced chat method with better context handling"""
        
        if not self.is_available():
            logger.warning("AlleAI service not available, using fallback response")
            return self._get_fallback_response(user_message)
        
        try:
            messages = []
            
            # Add enhanced system prompt
            messages.append({
                "role": "system",
                "content": self._get_agricultural_system_prompt()
            })
            
            # Add conversation history if provided
            if conversation_history:
                for msg in conversation_history:
                    messages.append({
                        "role": msg["role"],
                        "content": msg["content"]
                    })
            
            # Add current user message
            messages.append({
                "role": "user",
                "content": user_message
            })
            
            logger.info(f"Chat request with {len(messages)} messages")
            
            response_content = await self._make_alleai_request(
                messages=messages,
                temperature=0.7,
                max_tokens=1000,
                models=models
            )
            
            # Ensure we return clean, natural text (not JSON)
            cleaned_response = self._clean_response(response_content)
            
            # If the response looks like JSON, try to extract meaningful text
            if cleaned_response.strip().startswith('{') and cleaned_response.strip().endswith('}'):
                try:
                    # Try to parse and extract useful information
                    json_data = json.loads(cleaned_response)
                    if isinstance(json_data, dict):
                        # Extract the most relevant field or combine multiple fields
                        if 'disease_overview' in json_data:
                            return json_data['disease_overview']
                        elif 'immediate_actions' in json_data:
                            return json_data['immediate_actions']
                        elif 'treatment_protocols' in json_data:
                            protocols = json_data['treatment_protocols']
                            if isinstance(protocols, dict):
                                return protocols.get('organic', '') + '\n\n' + protocols.get('chemical', '')
                            return str(protocols)
                        else:
                            # Return the first string value found
                            for value in json_data.values():
                                if isinstance(value, str):
                                    return value
                except:
                    # If JSON parsing fails, return the original response
                    pass
            
            return cleaned_response
            
        except Exception as e:
            logger.error(f"Error in chat_with_ai: {str(e)}")
            logger.warning("Using fallback response due to AI service error")
            return self._get_fallback_response(user_message)

# Global service instance
alleai_service = AlleAIService() 