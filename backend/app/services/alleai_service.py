import os
import logging
import aiohttp
import json
from typing import Dict, Any, Optional, List
from app.config import settings
import asyncio
import re

logger = logging.getLogger(__name__)

OPENROUTER_API_KEY = "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"

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
        """Check if OpenRouter chat service is available (always True if OpenRouter key is set)"""
        if OPENROUTER_API_KEY:
            return True
        logger.warning("OpenRouter API key not configured for chat.")
        return False
    
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
- Focus on practical solutions that farmers can implement immediately
- Always return plain text responses, never JSON format
- For title generation, return only the title as plain text
- For description generation, return natural paragraphs as plain text"""

    def _get_disease_analysis_prompt(self, disease_name: str, confidence: float, crop_type: str) -> str:
        """Generate a specialized prompt for disease analysis"""
        return f"""You are an expert agricultural scientist specializing in crop disease management.

**Analysis Request:**
- Disease: {disease_name}
- Confidence Level: {confidence:.1%}
- Crop Type: {crop_type}

Please provide a comprehensive analysis for {disease_name} affecting {crop_type} plants. 

**IMPORTANT:** Return your response as a valid JSON object with this exact structure:

{{
    "disease_overview": "Detailed description of {disease_name}, its symptoms, and how it affects {crop_type} plants",
    "immediate_actions": "Step-by-step immediate response plan for {disease_name}",
    "treatment_protocols": {{
        "organic": "Organic treatment methods for {disease_name}",
        "chemical": "Chemical treatment options for {disease_name} if applicable",
        "application": "How and when to apply treatments for {disease_name}"
    }},
    "prevention": "Long-term prevention strategies for {disease_name}",
    "monitoring": "How to monitor progress and effectiveness of treatments for {disease_name}",
    "cost_effective": "Budget-friendly solutions for {disease_name}",
    "severity_level": "Low/Moderate/High based on {disease_name}",
    "professional_help": "When to consult agricultural experts for {disease_name}"
}}

**CRITICAL:** 
- Respond ONLY with the JSON object above
- Do NOT include any text before or after the JSON
- Make the response specific to {disease_name} and {crop_type}
- Provide practical, actionable advice for farmers
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
                
                # Convert messages to AlleAI format - FIXED for AlleAI
                alleai_messages = []
                
                # Combine system and user messages properly
                system_content = ""
                user_content = ""
                
                for msg in messages:
                    if msg["role"] == "system":
                        system_content += msg["content"] + "\n\n"
                    elif msg["role"] == "user":
                        user_content += msg["content"] + "\n"
                    elif msg["role"] == "assistant":
                        # For assistant messages, we'll include them as context
                        user_content += f"Previous response: {msg['content']}\n"
                
                # Create the final user message with system context
                final_user_content = system_content + user_content

                alleai_messages.append({
                    "user": [
                        {
                            "type": "text",
                            "text": final_user_content.strip()
                        }
                    ]
                })
                
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
                logger.info(f"API Key (first 10 chars): {self.api_key[:10] if self.api_key else 'None'}...")
                logger.info(f"API URL: {self.api_url}")
                
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
                        logger.error(f"Request headers: {dict(response.request_info.headers)}")
                        logger.error(f"API Key used: {self.api_key[:10] if self.api_key else 'None'}...")
                        
                        # Try to get more specific error information
                        try:
                            error_data = json.loads(error_text)
                            error_message = error_data.get('error', {}).get('message', error_text)
                            logger.error(f"Parsed error message: {error_message}")
                        except:
                            error_message = error_text
                        
                        raise Exception(f"AlleAI API error: {response.status} - {error_message}")
                    
                    response_data = await response.json()
                    logger.info(f"AlleAI API response data: {json.dumps(response_data, indent=2)}")
                    
                    # Handle AlleAI response format - FIXED extraction
                    content = None
                    
                    # AlleAI typically returns in this format:
                    # {"responses": {"responses": {"model_name": "response_text"}}}
                    if isinstance(response_data, dict):
                        if "responses" in response_data:
                            responses_obj = response_data["responses"]
                            if isinstance(responses_obj, dict) and "responses" in responses_obj:
                                model_responses = responses_obj["responses"]
                                if isinstance(model_responses, dict):
                                    # Get the first model's response
                                    for model_name, response_text in model_responses.items():
                                        if isinstance(response_text, str) and response_text.strip():
                                            content = response_text
                                            break
                    
                    # Fallback to other possible formats
                    if not content:
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
                    
                    if not content:
                        logger.error("No response content found in AlleAI API response")
                        logger.error(f"Response structure: {json.dumps(response_data, indent=2)}")
                        raise Exception("No response content from AlleAI API")
                    
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
        """Ensure all AI responses are professional, human-readable, and never raw JSON."""
        import json
        import re
        if not text:
            return ""
        text = text.strip()
        # Remove code block markers
        text = text.replace('```json', '').replace('```', '').strip()
        # If the response is JSON, format it professionally
        if text.startswith('{') and text.endswith('}'):
            try:
                data = json.loads(text)
                if isinstance(data, dict):
                    lines = []
                    for key, value in data.items():
                        pretty_key = key.replace('_', ' ').title()
                        if isinstance(value, dict):
                            lines.append(f"**{pretty_key}:**")
                            for subkey, subval in value.items():
                                lines.append(f"  - {subkey.replace('_', ' ').title()}: {subval}")
                        elif isinstance(value, list):
                            lines.append(f"**{pretty_key}:**")
                            for item in value:
                                lines.append(f"  - {item}")
                        else:
                            lines.append(f"**{pretty_key}:** {value}")
                    return "\n".join(lines)
            except Exception:
                pass  # If JSON parsing fails, fall through to plain text
        # Remove any remaining JSON-like artifacts
        text = re.sub(r'\{[^}]*\}', '', text)
        text = re.sub(r'\[[^\]]*\]', '', text)
        text = re.sub(r'"[^"]*":\s*"[^"]*"', '', text)
        text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)
        text = re.sub(r'^\s+|\s+$', '', text, flags=re.MULTILINE)
        # Capitalize first letter, ensure professional tone
        if text and text[0].islower():
            text = text[0].upper() + text[1:]
        return text

    async def get_disease_recommendations(self, disease_name: str, confidence: float, crop_type: str, models: Optional[List[str]] = None) -> Dict[str, Any]:
        """Get comprehensive treatment, prevention, and immediate action recommendations for a disease"""
        
        logger.info(f"Getting disease recommendations for {disease_name} ({confidence:.1%} confidence) on {crop_type}")
        
        if not self.is_available():
            logger.warning("LLM service not available, using fallback recommendations")
            fallback_recommendations = self._get_structured_fallback_recommendations(disease_name, confidence, crop_type)
            return fallback_recommendations
        
        # Create cache key
        cache_key = f"{disease_name}_{confidence}_{crop_type}"
        
        # Check cache first
        if cache_key in self._recommendations_cache:
            logger.info(f"Using cached recommendations for {disease_name}")
            return self._recommendations_cache[cache_key]
        
        try:
            # Use the specialized disease analysis prompt
            prompt = self._get_disease_analysis_prompt(disease_name, confidence, crop_type)
            
            messages = [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
            
            logger.info(f"Making AlleAI request for disease analysis: {disease_name}")
            response_content = await self._make_alleai_request(
                messages=messages, 
                temperature=0.3, 
                max_tokens=1200,
                models=models
            )
            
            logger.info(f"Received response from AlleAI for {disease_name}")
            logger.debug(f"Raw response: {response_content[:200]}...")
          
            try:
                # Try to parse as JSON first
                recommendations = json.loads(response_content)
                logger.info(f"Successfully parsed JSON recommendations for {disease_name}")
                
                # Validate the recommendations structure
                required_fields = ["disease_overview", "immediate_actions", "treatment_protocols", "prevention", "monitoring", "cost_effective", "severity_level", "professional_help"]
                missing_fields = [field for field in required_fields if field not in recommendations]
                
                if missing_fields:
                    logger.warning(f"Missing fields in LLM response: {missing_fields}")
                    # Use fallback for missing fields
                    fallback = self._get_structured_fallback_recommendations(disease_name, confidence, crop_type)
                    for field in missing_fields:
                        if field in fallback:
                            recommendations[field] = fallback[field]
                
                # Cache the recommendations
                self._recommendations_cache[cache_key] = recommendations
                logger.info(f"Cached recommendations for {disease_name}")
                
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
                        
                        # Validate and fill missing fields
                        fallback = self._get_structured_fallback_recommendations(disease_name, confidence, crop_type)
                        for field in fallback:
                            if field not in recommendations:
                                recommendations[field] = fallback[field]
                        
                        # Cache the recommendations
                        self._recommendations_cache[cache_key] = recommendations
                        
                        return recommendations
                    except Exception as e2:
                        logger.error(f"Failed to parse extracted JSON: {str(e2)}")
                
                # If all JSON parsing fails, use fallback
                logger.warning(f"Using fallback recommendations for {disease_name} due to JSON parsing failure")
                fallback_recommendations = self._get_structured_fallback_recommendations(disease_name, confidence, crop_type)
                self._recommendations_cache[cache_key] = fallback_recommendations
                return fallback_recommendations
                
        except Exception as e:
            logger.error(f"Error getting LLM recommendations for {disease_name}: {str(e)}")
            logger.warning(f"Using fallback recommendations for {disease_name} due to LLM failure")
            fallback_recommendations = self._get_structured_fallback_recommendations(disease_name, confidence, crop_type)
            
            # Cache the fallback recommendations
            self._recommendations_cache[cache_key] = fallback_recommendations
            
            return fallback_recommendations

    def _get_structured_fallback_recommendations(self, disease_name: str, confidence: float, crop_type: str) -> Dict[str, Any]:
        """Get structured fallback recommendations when LLM is unavailable"""
        
        # Provide specific recommendations for common diseases
        if "cashew_leafminer" in disease_name.lower():
            return {
                "disease_overview": f"{disease_name} is a serious pest that affects cashew trees by mining into the leaves, causing significant damage to the foliage and reducing photosynthesis. The larvae create serpentine mines in the leaves, which can lead to defoliation and reduced nut production.",
                "immediate_actions": "1. Inspect all cashew trees for leafminer damage\n2. Remove and destroy heavily infested leaves\n3. Apply neem oil or insecticidal soap to affected areas\n4. Monitor surrounding trees for spread\n5. Consider introducing natural predators",
                "treatment_protocols": {
                    "organic": "Apply neem oil (2-3% solution) every 7-10 days\nUse Bacillus thuringiensis (Bt) spray\nIntroduce beneficial insects like parasitic wasps\nApply garlic or chili pepper spray as deterrent",
                    "chemical": "Use spinosad-based insecticides\nApply abamectin if severe infestation\nUse systemic insecticides as last resort\nAlways follow label instructions",
                    "application": "Apply treatments early morning or evening\nCover both sides of leaves thoroughly\nRepeat applications every 7-10 days\nAvoid spraying during flowering"
                },
                "prevention": "Plant cashew trees with adequate spacing\nMaintain good air circulation\nUse resistant cashew varieties when available\nPractice regular monitoring\nKeep area clean of fallen leaves\nApply preventive neem treatments",
                "monitoring": "Check leaves weekly for mining damage\nMonitor for new leaf mines\nTrack treatment effectiveness\nDocument infestation levels\nWatch for natural predators",
                "cost_effective": "Use homemade neem oil solutions\nPractice good cultural methods\nJoin local cashew farmer groups\nShare monitoring responsibilities with neighbors\nUse integrated pest management",
                "severity_level": "High",
                "professional_help": "Consult agricultural extension if more than 30% of leaves are affected or if treatments are not working after 2-3 applications"
            }
        elif "leaf" in disease_name.lower() and "miner" in disease_name.lower():
            return {
                "disease_overview": f"{disease_name} is a leaf-mining pest that creates tunnels in plant leaves, reducing photosynthesis and plant health. The larvae feed between the upper and lower leaf surfaces, creating visible serpentine mines.",
                "immediate_actions": "1. Remove and destroy heavily mined leaves\n2. Apply neem oil or insecticidal soap\n3. Monitor for new mines\n4. Consider introducing natural predators\n5. Isolate severely affected plants",
                "treatment_protocols": {
                    "organic": "Apply neem oil (2-3% solution)\nUse Bacillus thuringiensis (Bt)\nIntroduce parasitic wasps\nApply garlic or chili pepper spray",
                    "chemical": "Use spinosad-based products\nApply abamectin if needed\nUse systemic insecticides as last resort",
                    "application": "Apply early morning or evening\nCover both leaf surfaces\nRepeat every 7-10 days\nAvoid flowering periods"
                },
                "prevention": "Maintain good plant spacing\nEnsure proper air circulation\nUse resistant varieties\nRegular monitoring\nClean up fallen leaves",
                "monitoring": "Check leaves weekly for mines\nMonitor treatment effectiveness\nTrack natural predator presence\nDocument damage levels",
                "cost_effective": "Use homemade neem solutions\nPractice cultural controls\nJoin farmer groups\nShare monitoring with neighbors",
                "severity_level": "Moderate",
                "professional_help": "Seek help if more than 25% of leaves are affected or treatments fail after 2-3 applications"
            }
        else:
            return {
                "disease_overview": f"General information about {disease_name} affecting {crop_type} plants. This disease can impact plant health and productivity.",
                "immediate_actions": "1. Isolate affected plants\n2. Remove infected parts\n3. Improve air circulation\n4. Avoid overhead watering\n5. Use clean tools",
                "treatment_protocols": {
                    "organic": "Apply neem oil or copper-based fungicides\nUse beneficial microbes\nImprove soil health\nApply garlic or chili pepper spray",
                    "chemical": "Consult with agricultural extension for chemical options\nUse appropriate fungicides or insecticides\nFollow label instructions carefully",
                    "application": "Apply treatments early morning or evening\nCover all affected areas thoroughly\nRepeat as needed\nAvoid flowering periods"
                },
                "prevention": "Use disease-resistant varieties\nPractice crop rotation\nMaintain proper spacing\nKeep tools clean\nMonitor regularly",
                "monitoring": "Check plants daily for new symptoms\nMonitor treatment effectiveness\nDocument progress\nWatch for natural predators",
                "cost_effective": "Use homemade remedies like baking soda spray\nPractice good cultural methods\nJoin local farming groups\nShare monitoring responsibilities",
                "severity_level": "Moderate",
                "professional_help": "Consult agricultural extension if symptoms worsen or spread rapidly"
            }

    async def chat_with_ai(self, user_message: str, conversation_history: Optional[List[dict]] = None, models: Optional[list] = None) -> str:
        """Chat method using OpenRouter's OpenAI-compatible API for chat completions only, with extra_headers for referer and title."""
        import asyncio
        from openai import OpenAI

        # Use OpenRouter API key and endpoint
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )

        # Build messages array: system prompt, conversation history, user message
        messages = []
        messages.append({
            "role": "system",
            "content": self._get_agricultural_system_prompt()
        })
        if conversation_history:
            messages.extend(conversation_history)
        messages.append({
            "role": "user",
            "content": user_message
        })

        try:
            # OpenRouter expects synchronous calls, so run in thread pool
            loop = asyncio.get_event_loop()
            completion = await loop.run_in_executor(
                None,
                lambda: client.chat.completions.create(
                    extra_headers={
                        "HTTP-Referer": "https://phamiq.ai/",
                        "X-Title": "Phamiq AI"
                    },
                    model="openai/gpt-4o",
                    messages=messages,
                )
            )
            # Extract the assistant's response
            content = completion.choices[0].message.content
            return content
        except Exception as e:
            logger.error(f"Error in OpenRouter chat_with_ai: {str(e)}")
            return self._get_fallback_response(user_message)

    async def generate_image(self, prompt: str, models: Optional[List[str]] = None) -> str:
        """Generate image using AlleAI image generation endpoint"""
        
        logger.info("=== NEW CODE VERSION - generate_image method called ===")
        
        if not self.is_available():
            logger.warning("AlleAI service not available for image generation")
            return "https://placehold.co/400x250/png?text=Image+Generation+Unavailable"
        
        try:
            from alleai.core import AlleAIClient
            import json
            
            # Initialize AlleAI client
            client = AlleAIClient(api_key=self.api_key)
            
            # Set default models if none provided
            if not models:
                models = ["dall-e-3"]
            
            logger.info(f"Starting image generation with prompt: {prompt}")
            logger.info(f"Using models: {models}")
            
            # Generate image
            image_response = client.image.generate({
                "models": models,
                "prompt": prompt,
                "n": 1,
                "height": 1024,
                "width": 1024,
                "seed": 42,
                "model_specific_params": {}
            })
            
            logger.info(f"Image generation response type: {type(image_response)}")
            logger.info(f"Image generation response: {image_response}")
            
            # Parse response if it's a string
            if isinstance(image_response, str):
                logger.info("✓ Response is a string, parsing as JSON")
                try:
                    image_response = json.loads(image_response)
                    logger.info("✓ Successfully parsed JSON response")
                except json.JSONDecodeError as e:
                    logger.error(f"✗ Failed to parse JSON response: {e}")
                    return "https://placehold.co/400x250/png?text=Invalid+Response+Format"
            
            # Direct extraction based on the JSON structure
            try:
                # Access the URL directly: responses.responses["dall-e-3"]
                url = image_response["responses"]["responses"]["dall-e-3"]
                if isinstance(url, str) and url.startswith("http"):
                    logger.info(f"✓ SUCCESS: Direct extraction - Found image URL: {url}")
                    return url
                else:
                    logger.warning(f"✗ Direct extraction failed - URL is not valid: {url}")
            except (KeyError, TypeError) as e:
                logger.warning(f"✗ Direct extraction failed with error: {e}")
            
            # Fallback: try the detailed extraction
            if isinstance(image_response, dict):
                logger.info("✓ Response is a dict")
                if "responses" in image_response:
                    logger.info("✓ Found 'responses' key in main response")
                    responses_obj = image_response["responses"]
                    logger.info(f"Responses object: {responses_obj}")
                    
                    if isinstance(responses_obj, dict) and "responses" in responses_obj:
                        logger.info("✓ Found nested 'responses' key")
                        model_responses = responses_obj["responses"]
                        logger.info(f"Model responses: {model_responses}")
                        
                        if isinstance(model_responses, dict):
                            logger.info("✓ Model responses is a dict")
                            for model_name, url in model_responses.items():
                                logger.info(f"Checking model '{model_name}': {url}")
                                if isinstance(url, str) and url.startswith("http"):
                                    logger.info(f"✓ SUCCESS: Found image URL for {model_name}: {url}")
                                    return url
                                else:
                                    logger.warning(f"✗ URL for {model_name} is not valid: {url} (type: {type(url)})")
                        else:
                            logger.warning(f"✗ Model responses is not a dict: {type(model_responses)}")
                    else:
                        logger.warning(f"✗ No nested 'responses' key found in responses_obj: {list(responses_obj.keys()) if isinstance(responses_obj, dict) else 'Not a dict'}")
                else:
                    logger.warning(f"✗ No 'responses' key found in main response: {list(image_response.keys())}")
            else:
                logger.warning(f"✗ Response is not a dict: {type(image_response)}")
            
            logger.warning("FAILED: No image URL found in response")
            logger.warning(f"Full response structure: {image_response}")
            return "https://placehold.co/400x250/png?text=No+Image+Generated"
            
        except Exception as e:
            logger.error(f"Error generating image: {str(e)}")
            return "https://placehold.co/400x250/png?text=Image+Generation+Failed" 

# Global service instance
alleai_service = AlleAIService()