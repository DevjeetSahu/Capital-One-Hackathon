# llm_client.py

import logging
from typing import Dict, Any, List, Optional
from intent_classifier import IntentResult, IntentType
from llm_service import get_llm_service

logger = logging.getLogger(__name__)

class LLMClient:
    """
    Simple LLM client for agricultural responses using Groq or Perplexity API
    """
    
    def __init__(self, provider: str = "groq", model: Optional[str] = None):
        """
        Initialize LLM client with LLM service
        
        Args:
            provider: LLM provider ("groq" or "perplexity")
            model: Specific model to use (optional, will use default if not specified)
        """
        self.model = model
        try:
            # Try specified provider first, fallback to other if not available
            self.llm_service = get_llm_service(provider)
            if not self.llm_service.is_available():
                fallback_provider = "perplexity" if provider == "groq" else "groq"
                logger.info(f"{provider} not available, trying {fallback_provider}...")
                self.llm_service = get_llm_service(fallback_provider)
            
            if self.llm_service.is_available():
                # Validate model if specified
                if self.model and not self.llm_service.validate_model(self.model):
                    logger.warning(f"Model {self.model} not available for {self.llm_service.provider}, using default")
                    self.model = None
                
                logger.info(f"LLM Client initialized with {self.llm_service.provider} service")
                if self.model:
                    logger.info(f"Using model: {self.model}")
            else:
                logger.warning("No LLM service available")
                self.llm_service = None
        except Exception as e:
            logger.warning(f"Failed to initialize LLM service: {e}")
            self.llm_service = None
    
    def generate_response(self, query: str, intent_result: IntentResult, context_data: List[Dict]) -> Dict[str, Any]:
        """
        Generate response using query, intent, and retrieved context
        
        Args:
            query: User's original query
            intent_result: Result from intent classifier
            context_data: Retrieved context from vector database
            
        Returns:
            Dictionary with response and metadata
        """
        try:
            if not self.llm_service or not self.llm_service.is_available():
                return self._fallback_response(query, context_data)
            
            # Build context text from retrieval results
            context_text = self._build_context_text(context_data)
            
            # Create system prompt
            system_prompt = self._get_system_prompt(intent_result.intent)
            
            # Create user prompt
            user_prompt = self._build_user_prompt(query, context_text, intent_result)
            
            # Call LLM service
            result = self.llm_service.call_llm(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=self.model,  # Use specified model or default
                temperature=0.3,
                max_tokens=500
            )
            
            if result['status'] == 'success':
                return {
                    "status": "success",
                    "response": result['response'],
                    "context_used": len(context_data),
                    "intent": intent_result.intent.value,
                    "model": result['model'],
                    "provider": result.get('provider', 'unknown')
                }
            else:
                logger.warning(f"LLM call failed: {result.get('error', 'Unknown error')}")
                return self._fallback_response(query, context_data)
            
        except Exception as e:
            logger.error(f"Error generating LLM response: {e}")
            return {
                "status": "error",
                "response": "I apologize, but I'm having trouble processing your request. Please try again.",
                "error": str(e)
            }

    def call_llm(self, system_prompt: str, user_prompt: str, max_tokens: int = 500) -> Dict[str, Any]:
        """
        Direct LLM call for workflow processing
        
        Args:
            system_prompt: System prompt for the LLM
            user_prompt: User prompt/message
            max_tokens: Maximum tokens in response
            
        Returns:
            Dictionary with response and metadata
        """
        try:
            if not self.llm_service or not self.llm_service.is_available():
                return {
                    "status": "error",
                    "response": "LLM service not available",
                    "error": "No LLM service available"
                }
            
            # Call LLM service
            result = self.llm_service.call_llm(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=self.model,
                temperature=0.3,
                max_tokens=max_tokens
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Error in direct LLM call: {e}")
            return {
                "status": "error",
                "response": "LLM call failed",
                "error": str(e)
            }
            
    
    def _build_context_text(self, context_data: List[Dict]) -> str:
        """Build context string from retrieved documents"""
        if not context_data:
            return "No specific context available for this query type in Bargarh district."
        
        context_parts = []
        for i, ctx in enumerate(context_data[:3], 1):  # Use top 3 results
            doc = ctx.get("document", "")
            score = ctx.get("similarity_score", 0)
            
            # Special handling for weather data
            metadata = ctx.get("metadata", {})
            if isinstance(metadata, dict):
                if metadata.get("data_type") == "live_weather":
                    context_parts.append(f"🌤️ LIVE WEATHER DATA: {doc}")
                elif metadata.get("data_type") == "weather_forecast":
                    context_parts.append(f"📅 7-DAY WEATHER FORECAST: {doc}")
                elif metadata.get("data_type") == "weather_history":
                    context_parts.append(f"📊 PAST 7 DAYS WEATHER HISTORY: {doc}")
                elif score > 0.1:  # Only include relevant results
                    context_parts.append(f"Reference {i}: {doc}")
            elif score > 0.1:  # Only include relevant results
                context_parts.append(f"Reference {i}: {doc}")
        
        return "\n\n".join(context_parts) if context_parts else "No relevant context found for this query type."
    
    def _build_user_prompt(self, query: str, context_text: str, intent_result: IntentResult) -> str:
        """Build user prompt with query and context"""
        prompt_parts = [
            f"Question: {query}",
            "",
            f"Intent: {intent_result.intent.value}",
        ]
        
        # Add detected entities if available
        if intent_result.crop:
            prompt_parts.append(f"Crop: {intent_result.crop}")
        if intent_result.location:
            prompt_parts.append(f"Location: {intent_result.location}")
        
        prompt_parts.extend([
            "",
            "Available Context:",
            context_text,
            "",
            "Please provide a helpful response based on the context above."
        ])
        
        return "\n".join(prompt_parts)
    
    def _get_system_prompt(self, intent_type: IntentType) -> str:
        """Get appropriate system prompt based on intent"""
        
        base_prompt = "You are an expert agricultural assistant specifically designed for farmers in Bargarh district of Odisha, India. You have deep knowledge of local farming practices, market conditions, and agricultural challenges unique to this region."
        
        intent_specific = {
            IntentType.MARKET_PRICES: "Focus on providing current market prices from Bargarh mandis (Attabira, Bargarh, Godabhaga, Sohela, Padampur), price trends, and buying/selling advice specific to Bargarh district. Include specific price figures from local markets when available.",
            
            IntentType.PEST_CONTROL: "Provide practical pest and disease management advice tailored to Bargarh's climate and common crops (paddy, maize, cotton, vegetables). Include both prevention and treatment options suitable for local conditions.",
            
            IntentType.CROP_RECOMMENDATIONS: "Give crop selection and farming technique recommendations based on Bargarh's soil types, climate, and water availability. Consider local market demand and traditional farming practices.",
            
            IntentType.IRRIGATION_PLANNING: "Provide water management and irrigation scheduling advice considering Bargarh's rainfall patterns, river systems (Mahanadi, Jira), and local irrigation infrastructure.",
            
            IntentType.WEATHER_INSIGHTS: "Offer weather-related farming guidance and crop protection advice specific to Bargarh's tropical climate, monsoon patterns, and seasonal variations.",
            
            IntentType.GOVERNMENT_SCHEMES: "Explain government agricultural schemes, subsidies, and application processes available to farmers in Bargarh district, including Odisha-specific programs.",
            
            IntentType.FERTILIZER_GUIDANCE: "Provide soil nutrition and fertilizer application guidance based on Bargarh's soil characteristics and common crop requirements in the region.",
            
            IntentType.SEASONAL_PLANNING: "Give seasonal farming advice and crop calendar guidance specific to Bargarh's agricultural seasons and local farming traditions."
        }
        
        specific_instruction = intent_specific.get(intent_type, "Provide general agricultural advice relevant to Bargarh district of Odisha.")
        
        return f"""{base_prompt}

{specific_instruction}

Instructions:
- Use simple, clear language that Bargarh farmers can understand.
- Provide practical, actionable advice specific to Bargarh district conditions
- Include specific details from local context when available
- Reference local markets, mandis, and agricultural practices in Bargarh
- If context is insufficient, acknowledge limitations but try to provide general guidance for the region
- Keep responses concise but informative
- Consider local farming traditions and practices of Bargarh district"""
    
    def _fallback_response(self, query: str, context_data: List[Dict]) -> Dict[str, Any]:
        """Fallback response when LLM API is not available"""
        if context_data:
            # Use the best context document as fallback
            best_doc = context_data[0].get("document", "")
            response = f"Based on available information for Bargarh district: {best_doc[:300]}..."
        else:
            response = "I don't have specific information for your query about Bargarh district. This type of query doesn't have available data in our system. Please consult with local agricultural experts or visit the nearest Krishi Vigyan Kendra in Bargarh for assistance."
        
        return {
            "status": "fallback",
            "response": response,
            "context_used": len(context_data),
            "model": "fallback"
        }


# Test function
def test_llm_client():
    """Test the LLM client with sample data"""
    from intent_classifier import AgricultureIntentClassifier
    
    # Sample data
    classifier = AgricultureIntentClassifier(use_llm=True)
    
    # Updated to use one of the new Groq models
    llm_client = LLMClient(provider="groq", model="llama-3.1-8b-instant")  # Fast and efficient
    
    query = "What is the price of tomato in Bargarh mandi?"
    intent_result = classifier.classify_intent(query)
    
    # Sample context (in the format your retriever returns)
    sample_context = [
        {
            "document": "On 07/08/2025, the modal price of Tomato (Other, FAQ) in Bargarh market, Bargarh, Odisha was ₹4400.0. Min: ₹4300.0, Max: ₹4500.0.",
            "similarity_score": 0.85,
            "metadata": {"state": "Odisha", "district": "Bargarh", "commodity": "Tomato"}
        },
        {
            "document": "On 06/08/2025, the modal price of Tomato (Other, Non-FAQ) in Sohela market, Bargarh, Odisha was ₹4500.0. Min: ₹4400.0, Max: ₹4600.0.",
            "similarity_score": 0.82,
            "metadata": {"state": "Odisha", "district": "Bargarh", "commodity": "Tomato"}
        }
    ]
    
    # Generate response
    result = llm_client.generate_response(query, intent_result, sample_context)
    
    print(f"Status: {result['status']}")
    print(f"Response: {result['response']}")
    print(f"Context used: {result['context_used']}")
    print(f"Model: {result.get('model', 'unknown')}")
    print(f"Provider: {result.get('provider', 'unknown')}")


def test_different_models():
    """Test different Groq models"""
    from intent_classifier import AgricultureIntentClassifier
    
    classifier = AgricultureIntentClassifier(use_llm=True)
    query = "How to control pest in paddy crop in Bargarh?"
    intent_result = classifier.classify_intent(query)
    
    sample_context = [{
        "document": "For wheat pest control, use integrated pest management. Apply neem oil spray every 7-10 days during early infestation.",
        "similarity_score": 0.9,
        "metadata": {"crop": "wheat", "topic": "pest_control"}
    }]
    
    # Test different models
    models_to_test = [
        "llama-3.1-8b-instant",      # Fast default
        "gemma2-9b-it",              # Efficient Google model
        "openai/gpt-oss-120b",       # Large reasoning model
        "deepseek-r1-distill-llama-70b",  # High-quality distilled model
        "compound-beta"              # Experimental model
    ]
    
    for model in models_to_test:
        print(f"\n--- Testing {model} ---")
        try:
            llm_client = LLMClient(provider="groq", model=model)
            result = llm_client.generate_response(query, intent_result, sample_context)
            
            print(f"Status: {result['status']}")
            print(f"Response: {result['response'][:150]}...")
            print(f"Model: {result.get('model', 'unknown')}")
            
        except Exception as e:
            print(f"Error with {model}: {e}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test-models":
        test_different_models()
    else:
        test_llm_client()
