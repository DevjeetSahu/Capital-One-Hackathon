# llm_client.py

import os
import logging
from typing import Dict, Any, List
from dotenv import load_dotenv
from openai import OpenAI
from intent_classifier import IntentResult, IntentType

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class LLMClient:
    """
    Simple LLM client for agricultural responses using Perplexity API
    """
    
    def __init__(self):
        """Initialize LLM client with Perplexity API"""
        self.api_key = os.getenv("PERPLEXITY_API_KEY")
        
        if not self.api_key:
            logger.warning("PERPLEXITY_API_KEY not found in environment variables")
            self.client = None
        else:
            self.client = OpenAI(
                api_key=self.api_key, 
                base_url="https://api.perplexity.ai"
            )
            logger.info("LLM Client initialized with Perplexity API")
    
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
            if not self.client:
                return self._fallback_response(query, context_data)
            
            # Build context text from retrieval results
            context_text = self._build_context_text(context_data)
            
            # Create system prompt
            system_prompt = self._get_system_prompt(intent_result.intent)
            
            # Create user prompt
            user_prompt = self._build_user_prompt(query, context_text, intent_result)
            
            # Call Perplexity API
            response = self.client.chat.completions.create(
                model="sonar-pro",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            response_text = response.choices[0].message.content.strip()
            
            return {
                "status": "success",
                "response": response_text,
                "context_used": len(context_data),
                "intent": intent_result.intent.value,
                "model": "sonar-pro"
            }
            
        except Exception as e:
            logger.error(f"Error generating LLM response: {e}")
            return {
                "status": "error",
                "response": "I apologize, but I'm having trouble processing your request. Please try again.",
                "error": str(e)
            }
    
    def _build_context_text(self, context_data: List[Dict]) -> str:
        """Build context string from retrieved documents"""
        if not context_data:
            return "No specific context available."
        
        context_parts = []
        for i, ctx in enumerate(context_data[:3], 1):  # Use top 3 results
            doc = ctx.get("document", "")
            score = ctx.get("similarity_score", 0)
            
            if score > 0.1:  # Only include relevant results
                context_parts.append(f"Reference {i}: {doc}")
        
        return "\n\n".join(context_parts) if context_parts else "No relevant context found."
    
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
        
        base_prompt = "You are an expert agricultural assistant helping farmers."
        
        intent_specific = {
            IntentType.MARKET_PRICES: "Focus on providing current market prices, trends, and buying/selling advice. Include specific price figures when available.",
            
            IntentType.PEST_CONTROL: "Provide practical pest and disease management advice. Include both prevention and treatment options.",
            
            IntentType.CROP_RECOMMENDATIONS: "Give crop selection and farming technique recommendations based on local conditions.",
            
            IntentType.IRRIGATION_PLANNING: "Provide water management and irrigation scheduling advice.",
            
            IntentType.WEATHER_INSIGHTS: "Offer weather-related farming guidance and crop protection advice.",
            
            IntentType.GOVERNMENT_SCHEMES: "Explain government agricultural schemes, subsidies, and application processes clearly.",
            
            IntentType.FERTILIZER_GUIDANCE: "Provide soil nutrition and fertilizer application guidance.",
            
            IntentType.SEASONAL_PLANNING: "Give seasonal farming advice and crop calendar guidance."
        }
        
        specific_instruction = intent_specific.get(intent_type, "Provide general agricultural advice.")
        
        return f"""{base_prompt}

{specific_instruction}

Instructions:
- Use simple, clear language that farmers can understand
- Provide practical, actionable advice
- Include specific details from the context when available
- If context is insufficient, acknowledge limitations
- Keep responses concise but informative"""
    
    def _fallback_response(self, query: str, context_data: List[Dict]) -> Dict[str, Any]:
        """Fallback response when LLM API is not available"""
        if context_data:
            # Use the best context document as fallback
            best_doc = context_data[0].get("document", "")
            response = f"Based on available information: {best_doc[:300]}..."
        else:
            response = "I don't have specific information for your query. Please consult with agricultural experts."
        
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
    classifier = AgricultureIntentClassifier()
    llm_client = LLMClient()
    
    query = "What is the price of tomato in Karnataka?"
    intent_result = classifier.classify_intent(query)
    
    # Sample context (in the format your retriever returns)
    sample_context = [
        {
            "document": "On 07/08/2025, the modal price of Tomato (Tomato, Non-FAQ) in Baripada market, Mayurbhanja, Odisha was ₹6500.0. Min: ₹6000.0, Max: ₹7000.0.",
            "similarity_score": 0.85,
            "metadata": {"state": "Odisha", "commodity": "Tomato"}
        },
        {
            "document": "On 06/08/2025, the modal price of Tomato (Tomato, Non-FAQ) in Bangalore market, Bangalore, Karnataka was ₹4200.0. Min: ₹4000.0, Max: ₹4500.0.",
            "similarity_score": 0.82,
            "metadata": {"state": "Karnataka", "commodity": "Tomato"}
        }
    ]
    
    # Generate response
    result = llm_client.generate_response(query, intent_result, sample_context)
    
    print(f"Status: {result['status']}")
    print(f"Response: {result['response']}")
    print(f"Context used: {result['context_used']}")

if __name__ == "__main__":
    test_llm_client()
