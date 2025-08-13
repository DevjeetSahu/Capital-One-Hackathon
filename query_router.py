# query_router.py (UPDATED VERSION)
from typing import Dict, Any, List
from intent_classifier import AgricultureIntentClassifier, IntentType, IntentResult
from enhanced_retriever import EnhancedContextRetriever, RetrievalResult
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class QueryRouter:
    def __init__(self):
        self.intent_classifier = AgricultureIntentClassifier()
        self.enhanced_retriever = EnhancedContextRetriever()  # Use enhanced retriever
        self.pipeline_map = {
            IntentType.MARKET_PRICES: self._handle_market_prices,
            IntentType.IRRIGATION_PLANNING: self._handle_irrigation_planning,
            IntentType.PEST_CONTROL: self._handle_pest_control,
            IntentType.CROP_RECOMMENDATIONS: self._handle_crop_recommendations,
            IntentType.WEATHER_INSIGHTS: self._handle_weather_insights,
            IntentType.GOVERNMENT_SCHEMES: self._handle_government_schemes,
            IntentType.FERTILIZER_GUIDANCE: self._handle_fertilizer_guidance,
            IntentType.SEASONAL_PLANNING: self._handle_seasonal_planning,
            IntentType.GENERAL_FARMING: self._handle_general_farming,
            IntentType.UNKNOWN: self._handle_unknown
        }
    
    def route_query(self, query: str) -> Dict[str, Any]:
        """Route query to appropriate pipeline based on intent classification"""
        logger.info(f"Processing query: {query}")
        
        # Step 1: Classify intent
        intent_result = self.intent_classifier.classify_intent(query)
        logger.info(f"Classified intent: {intent_result.intent.value} (confidence: {intent_result.confidence:.2f})")
        
        # Step 2: Route to appropriate pipeline
        pipeline_handler = self.pipeline_map.get(intent_result.intent, self._handle_unknown)
        
        try:
            response_data = pipeline_handler(query, intent_result)
            
            return {
                'status': 'success',
                'intent': intent_result.intent.value,
                'confidence': intent_result.confidence,
                'entities': {
                    'crop': intent_result.crop,
                    'location': intent_result.location
                },
                'keywords_matched': intent_result.keywords_matched,
                'response': response_data
            }
        
        except Exception as e:
            logger.error(f"Error in pipeline handler: {str(e)}")
            return {
                'status': 'error',
                'intent': intent_result.intent.value,
                'error': str(e),
                'response': "I'm sorry, I encountered an error processing your request. Please try again."
            }
    
    def _handle_market_prices(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle market price queries using ENHANCED retrieval system"""
        try:
            # Use enhanced context retriever
            retrieval_result = self.enhanced_retriever.retrieve_enhanced_context(
                query, intent_result, n_results=5
            )
            
            # Apply relevance ranking
            ranked_results = self.enhanced_retriever.rank_by_relevance(
                retrieval_result, intent_result
            )
            
            return {
                'pipeline': 'market_prices',
                'context_retrieved': ranked_results.total_results,
                'context_docs': ranked_results.documents,
                'context_metadata': ranked_results.metadatas,
                'relevance_scores': ranked_results.scores,
                'filters_applied': ranked_results.filters_applied,
                'specialized_processing': 'Applied enhanced market-specific filters and ranking'
            }
            
        except Exception as e:
            logger.error(f"Error in enhanced market retrieval: {str(e)}")
            # Fallback to basic retrieval if enhanced fails
            return self._fallback_retrieval(query, intent_result)
    
    def _handle_irrigation_planning(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle irrigation planning queries - placeholder for Phase 2"""
        return {
            'pipeline': 'irrigation_planning',
            'message': 'Irrigation planning pipeline will be implemented in Phase 2',
            'crop_detected': intent_result.crop,
            'location_detected': intent_result.location,
            'suggested_context': ['Weather data needed', 'Soil moisture requirements', 'Crop-specific water needs']
        }
    
    def _handle_pest_control(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle pest control queries - placeholder for Phase 2"""
        return {
            'pipeline': 'pest_control',
            'message': 'Pest control pipeline will be implemented in Phase 2',
            'crop_detected': intent_result.crop,
            'suggested_context': ['Disease identification', 'Treatment options', 'Prevention strategies']
        }
    
    def _handle_crop_recommendations(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle crop recommendation queries - placeholder for Phase 2"""
        return {
            'pipeline': 'crop_recommendations',
            'message': 'Crop recommendation pipeline will be implemented in Phase 2',
            'location_detected': intent_result.location,
            'suggested_context': ['Soil suitability', 'Climate requirements', 'Market demand']
        }
    
    def _handle_weather_insights(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle weather queries - placeholder for Phase 2"""
        return {
            'pipeline': 'weather_insights',
            'message': 'Weather insights pipeline will be implemented in Phase 2',
            'location_detected': intent_result.location,
            'suggested_context': ['Weather forecast API integration needed']
        }
    
    def _handle_government_schemes(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle government scheme queries - placeholder for Phase 2"""
        return {
            'pipeline': 'government_schemes',
            'message': 'Government schemes pipeline will be implemented in Phase 2',
            'suggested_context': ['Eligibility criteria', 'Application process', 'Required documents']
        }
    
    def _handle_fertilizer_guidance(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle fertilizer guidance queries - placeholder for Phase 2"""
        return {
            'pipeline': 'fertilizer_guidance',
            'message': 'Fertilizer guidance pipeline will be implemented in Phase 2',
            'crop_detected': intent_result.crop,
            'suggested_context': ['Nutrient requirements', 'Soil testing', 'Application schedule']
        }
    
    def _handle_seasonal_planning(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle seasonal planning queries - placeholder for Phase 2"""
        return {
            'pipeline': 'seasonal_planning',
            'message': 'Seasonal planning pipeline will be implemented in Phase 2',
            'crop_detected': intent_result.crop,
            'location_detected': intent_result.location,
            'suggested_context': ['Crop calendar', 'Weather patterns', 'Market timing']
        }
    
    def _handle_general_farming(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle general farming queries"""
        try:
            # Use enhanced retrieval for general queries too
            retrieval_result = self.enhanced_retriever._retrieve_generic_context(
                query, intent_result, n_results=3
            )
            
            return {
                'pipeline': 'general_farming',
                'message': 'This appears to be a general farming question. Here is some related information.',
                'context_docs': retrieval_result.documents,
                'context_metadata': retrieval_result.metadatas,
                'suggested_context': ['General farming practices', 'Agricultural knowledge base']
            }
        except Exception as e:
            logger.error(f"Error in general farming retrieval: {str(e)}")
            return self._fallback_basic_response(query, intent_result, 'general_farming')
    
    def _handle_unknown(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Handle unknown or unclear queries"""
        return {
            'pipeline': 'unknown',
            'message': 'I could not understand your question clearly. Please provide more specific information about prices, irrigation, pest control, or other farming topics.',
            'suggestion': 'Try asking about specific topics like "tomato prices", "irrigation schedule", or "pest control"'
        }
    
    def _fallback_retrieval(self, query: str, intent_result: IntentResult) -> Dict[str, Any]:
        """Fallback to basic retrieval if enhanced retrieval fails"""
        try:
            # Use the generic method from enhanced retriever
            retrieval_result = self.enhanced_retriever._retrieve_generic_context(
                query, intent_result, n_results=5
            )
            
            return {
                'pipeline': 'fallback',
                'context_retrieved': retrieval_result.total_results,
                'context_docs': retrieval_result.documents,
                'context_metadata': retrieval_result.metadatas,
                'note': 'Used fallback retrieval method'
            }
        except Exception as e:
            logger.error(f"Even fallback retrieval failed: {str(e)}")
            return self._fallback_basic_response(query, intent_result, 'fallback_error')
    
    def _fallback_basic_response(self, query: str, intent_result: IntentResult, pipeline_type: str) -> Dict[str, Any]:
        """Ultimate fallback when all retrieval methods fail"""
        return {
            'pipeline': pipeline_type,
            'message': 'I apologize, but I am having trouble accessing the data right now. Please try again later or contact support.',
            'context_docs': [],
            'error_info': 'All retrieval methods failed'
        }

# Test the updated router
if __name__ == "__main__":
    router = QueryRouter()
    
    test_queries = [
        "What is the price of tomato in Karnataka today?",
        "How to control pest in wheat crop?",
        "When should I water my cotton field?",
        "Which variety of rice is suitable for Punjab?"
    ]
    
    for query in test_queries:
        result = router.route_query(query)
        print(f"Query: {query}")
        print(f"Result: {result}")
        print("-" * 80)
