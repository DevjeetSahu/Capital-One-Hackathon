# enhanced_llm_client.py
from openai import OpenAI
import os
from dotenv import load_dotenv
from typing import List, Dict, Any
from intent_classifier import IntentResult, IntentType
from enhanced_retriever import RetrievalResult
import json
import logging

load_dotenv()
logger = logging.getLogger(__name__)

API_KEY = os.getenv("PERPLEXITY_API_KEY")
client = OpenAI(api_key=API_KEY, base_url="https://api.perplexity.ai")

class EnhancedLLMClient:
    def __init__(self):
        self.response_templates = {
            IntentType.MARKET_PRICES: self._get_market_price_template(),
            IntentType.IRRIGATION_PLANNING: self._get_irrigation_template(),
            IntentType.PEST_CONTROL: self._get_pest_control_template(),
            # Add more templates as needed
        }
    
    def _get_market_price_template(self) -> str:
        return """You are an agricultural market expert helping farmers with price information.

Instructions:
- Provide current market prices with specific details
- Include price ranges (min, max, modal) when available
- Mention the market location and date
- Compare with recent trends if possible
- Give practical advice for buying/selling decisions
- Use simple, farmer-friendly language
- Structure your response clearly with key prices highlighted

If the context doesn't contain current price information, clearly state that and suggest alternatives."""

    def _get_irrigation_template(self) -> str:
        return """You are an irrigation specialist helping farmers with water management.

Instructions:
- Provide specific watering schedules based on crop and season
- Consider local weather conditions
- Suggest efficient irrigation methods
- Include water conservation tips
- Give practical timing advice
- Use clear, actionable language"""

    def _get_pest_control_template(self) -> str:
        return """You are a plant protection expert helping farmers with pest and disease management.

Instructions:
- Identify the pest or disease based on symptoms
- Provide integrated pest management solutions
- Suggest both organic and chemical options
- Include prevention strategies
- Give application timing and methods
- Emphasize safety precautions"""

    def generate_enhanced_response(self, 
                                  query: str, 
                                  intent_result: IntentResult,
                                  retrieval_result: RetrievalResult) -> Dict[str, Any]:
        """Generate enhanced response using intent-specific templates"""
        
        try:
            # Get intent-specific system prompt
            system_prompt = self.response_templates.get(
                intent_result.intent,
                self._get_default_template()
            )
            
            # Build context from retrieval results
            context_text = self._build_context_text(retrieval_result, intent_result)
            
            # Create user prompt with metadata
            user_prompt = self._build_user_prompt(query, context_text, intent_result)
            
            # Call LLM
            response = client.chat.completions.create(
                model="sonar-pro",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3,  # Lower temperature for more factual responses
                max_tokens=800
            )
            
            response_text = response.choices[0].message.content.strip()
            
            return {
                'status': 'success',
                'response': response_text,
                'context_used': len(retrieval_result.documents),
                'response_type': 'enhanced',
                'template_used': intent_result.intent.value
            }
            
        except Exception as e:
            logger.error(f"Error generating enhanced response: {str(e)}")
            return {
                'status': 'error',
                'response': "I apologize, but I'm having trouble processing your request right now. Please try again.",
                'error': str(e)
            }
    
    def _build_context_text(self, retrieval_result: RetrievalResult, intent_result: IntentResult) -> str:
        """Build formatted context text from retrieval results"""
        if not retrieval_result.documents:
            return "No specific context found for this query."
        
        context_parts = []
        
        for i, (doc, metadata, score) in enumerate(zip(
            retrieval_result.documents[:5],  # Limit to top 5
            retrieval_result.metadatas[:5],
            retrieval_result.scores[:5]
        ), 1):
            if score > 0.1:  # Only include relevant results
                context_part = f"Context {i} (Relevance: {score:.2f}):\n{doc}\n"
                if metadata:
                    context_part += f"Source: {metadata}\n"
                context_parts.append(context_part)
        
        return "\n".join(context_parts)
    
    def _build_user_prompt(self, query: str, context_text: str, intent_result: IntentResult) -> str:
        """Build comprehensive user prompt with all available information"""
        
        prompt_parts = [
            f"User Question: {query}",
            "",
            f"Detected Intent: {intent_result.intent.value}",
            f"Confidence: {intent_result.confidence:.2f}",
        ]
        
        if intent_result.crop:
            prompt_parts.append(f"Detected Crop: {intent_result.crop}")
        
        if intent_result.location:
            prompt_parts.append(f"Detected Location: {intent_result.location}")
        
        if intent_result.keywords_matched:
            prompt_parts.append(f"Key Terms: {', '.join(intent_result.keywords_matched)}")
        
        prompt_parts.extend([
            "",
            "Available Context:",
            context_text,
            "",
            "Please provide a helpful, accurate response based on the context above."
        ])
        
        return "\n".join(prompt_parts)
    
    def _get_default_template(self) -> str:
        return """You are an expert agricultural assistant helping farmers with their questions.

Instructions:
- Provide accurate, practical advice based on the given context
- Use simple, clear language that farmers can easily understand
- If the context doesn't fully answer the question, be honest about limitations
- Suggest next steps or additional resources when helpful
- Focus on actionable advice that farmers can implement"""

# Test the enhanced system
if __name__ == "__main__":
    # This would typically be integrated with the router
    pass
