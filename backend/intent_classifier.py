# intent_classifier.py (UPDATED WITH NEW MODELS AND ENHANCED OUTPUT)

import json
import re
import os
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

try:
    from llm_service import get_llm_service
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    print("LLM service not available. Using keyword-only classification.")

logger = logging.getLogger(__name__)

class IntentType(Enum):
    MARKET_PRICES = "market_prices"
    IRRIGATION_PLANNING = "irrigation_planning"
    PEST_CONTROL = "pest_control"
    CROP_RECOMMENDATIONS = "crop_recommendations"
    WEATHER_INSIGHTS = "weather_insights"
    GOVERNMENT_SCHEMES = "government_schemes"
    FERTILIZER_GUIDANCE = "fertilizer_guidance"
    SEASONAL_PLANNING = "seasonal_planning"
    GENERAL_FARMING = "general_farming"
    WORKFLOW_COMPLEX = "workflow_complex"  # NEW: For complex queries requiring workflow
    UNKNOWN = "unknown"

@dataclass
class IntentResult:
    intent: IntentType
    confidence: float
    keywords_matched: List[str]
    location: str = None
    crop: str = None
    model: str = None  # NEW: Track which model was used
    provider: str = None  # NEW: Track which provider was used
    is_workflow: bool = False  # NEW: Indicates if this is a workflow query
    subtasks: List[Dict] = None  # NEW: Subtasks for workflow queries

class AgricultureIntentClassifier:
    def __init__(self, use_llm: bool = True, preferred_provider: str = "groq", preferred_model: str = None):
        """
        Initialize classifier with optional LLM support
        
        Args:
            use_llm: Whether to use LLM as primary method
            preferred_provider: Preferred LLM provider ("groq" or "perplexity")
            preferred_model: Specific model to use (optional)
        """
        self.use_llm = use_llm and LLM_AVAILABLE
        self.preferred_provider = preferred_provider
        self.preferred_model = preferred_model
        
        # Initialize LLM service if available
        self.llm_service = None
        if self.use_llm:
            try:
                # Try preferred provider first
                self.llm_service = get_llm_service(preferred_provider)
                if not self.llm_service.is_available():
                    fallback_provider = "perplexity" if preferred_provider == "groq" else "groq"
                    logger.info(f"{preferred_provider} not available, trying {fallback_provider}...")
                    self.llm_service = get_llm_service(fallback_provider)
                
                if self.llm_service.is_available():
                    # Validate preferred model if specified
                    if self.preferred_model and not self.llm_service.validate_model(self.preferred_model):
                        logger.warning(f"Model {self.preferred_model} not available for {self.llm_service.provider}, using default")
                        self.preferred_model = None
                    
                    model_info = f" with model {self.preferred_model}" if self.preferred_model else ""
                    logger.info(f"LLM service initialized with {self.llm_service.provider}{model_info} for intent classification")
                else:
                    logger.warning("No LLM service available")
                    self.llm_service = None
            except Exception as e:
                logger.warning(f"Failed to initialize LLM service: {e}")
                self.llm_service = None
        
        self.intent_patterns = {
            IntentType.MARKET_PRICES: {
                'keywords': ['price', 'rate', 'cost', 'selling', 'buying', 'market', 'mandi', 'wholesale', 'retail', 'value', 'worth'],
                'phrases': ['market price', 'current rate', 'today price', 'selling price', 'market rate', 'price today'],
                'weight': 1.0
            },
            IntentType.IRRIGATION_PLANNING: {
                'keywords': ['water', 'irrigation', 'watering', 'drip', 'sprinkler', 'flood irrigation', 'schedule', 'timing'],
                'phrases': ['water schedule', 'irrigation plan', 'watering time', 'water management', 'irrigation system'],
                'weight': 1.0
            },
            IntentType.PEST_CONTROL: {
                'keywords': ['pest', 'insect', 'disease', 'fungus', 'virus', 'control', 'spray', 'pesticide', 'treatment', 'infection'],
                'phrases': ['pest control', 'disease management', 'insect attack', 'plant disease', 'crop protection'],
                'weight': 1.0
            },
            IntentType.CROP_RECOMMENDATIONS: {
                'keywords': ['crop', 'variety', 'seed', 'cultivar', 'recommend', 'suggest', 'best', 'suitable', 'grow'],
                'phrases': ['which crop', 'best variety', 'crop suggestion', 'what to grow', 'suitable crop'],
                'weight': 1.0
            },
            IntentType.WEATHER_INSIGHTS: {
                'keywords': ['weather', 'rain', 'temperature', 'humidity', 'wind', 'forecast', 'climate', 'season'],
                'phrases': ['weather forecast', 'rain prediction', 'weather update', 'climate condition'],
                'weight': 1.0
            },
            IntentType.GOVERNMENT_SCHEMES: {
                'keywords': ['scheme', 'subsidy', 'government', 'policy', 'loan', 'insurance', 'benefit', 'support', 'pm-kisan', 'kalia', 'pmfby', 'pm-kusum', 'bkky', 'kamadhenu', 'ffda', 'dbt', 'agab', 'kcc'],
                'phrases': ['government scheme', 'subsidy available', 'farmer scheme', 'agricultural policy', 'pm kisan', 'kalia scheme', 'crop insurance', 'solar pump', 'health insurance', 'dairy scheme', 'fishery subsidy', 'farm implements', 'rural infrastructure', 'crop loan'],
                'weight': 1.0
            },
            IntentType.FERTILIZER_GUIDANCE: {
                'keywords': ['fertilizer', 'nutrient', 'nitrogen', 'phosphorus', 'potassium', 'urea', 'compost', 'manure'],
                'phrases': ['fertilizer recommendation', 'nutrient management', 'soil nutrition', 'fertilizer schedule'],
                'weight': 1.0
            },
            IntentType.SEASONAL_PLANNING: {
                'keywords': ['season', 'timing', 'calendar', 'schedule', 'planting', 'harvesting', 'sowing', 'kharif', 'rabi'],
                'phrases': ['planting time', 'harvest season', 'crop calendar', 'seasonal plan', 'farming schedule'],
                'weight': 1.0
            },
            IntentType.GENERAL_FARMING: {
                'keywords': ['farming', 'agriculture', 'cultivation', 'farm', 'field', 'soil', 'harvest', 'produce', 'yield'],
                'phrases': ['farming advice', 'agricultural help', 'general farming', 'crop cultivation', 'farm management'],
                'weight': 1.0
            }
        }

        # Common crop and location patterns for extraction
        self.crop_patterns = [
            'tomato', 'potato', 'onion', 'wheat', 'rice', 'maize', 'sugarcane', 'cotton',
            'soybean', 'mustard', 'groundnut', 'chilli', 'brinjal', 'cauliflower', 'cabbage'
        ]

        self.location_patterns = [
            'karnataka', 'maharashtra', 'uttar pradesh', 'punjab', 'haryana', 'gujarat',
            'rajasthan', 'madhya pradesh', 'andhra pradesh', 'telangana', 'tamil nadu'
        ]

    def preprocess_query(self, query: str) -> str:
        """Clean and normalize the input query"""
        query = query.lower().strip()
        query = re.sub(r'[^\w\s]', ' ', query)
        query = re.sub(r'\s+', ' ', query)
        return query

    def extract_entities(self, query: str) -> Tuple[str, str]:
        """Extract crop and location from query"""
        query_lower = query.lower()
        
        # Extract crop
        crop = None
        for crop_name in self.crop_patterns:
            if crop_name in query_lower:
                crop = crop_name
                break
        
        # Extract location
        location = None
        for loc in self.location_patterns:
            if loc in query_lower:
                location = loc
                break
        
        return crop, location

    def calculate_intent_score(self, query: str, intent_type: IntentType) -> Tuple[float, List[str]]:
        """Calculate confidence score for a specific intent"""
        
        # Check if intent_type exists in patterns
        if intent_type not in self.intent_patterns:
            return 0.0, []
        
        patterns = self.intent_patterns[intent_type]
        keywords = patterns['keywords']
        phrases = patterns['phrases']
        weight = patterns['weight']
        
        query_words = query.split()
        matched_keywords = []
        score = 0.0
        
        # Check for exact phrase matches (higher weight)
        for phrase in phrases:
            if phrase in query:
                score += 0.3 * weight
                matched_keywords.append(phrase)
        
        # Check for keyword matches
        for keyword in keywords:
            if keyword in query:
                score += 0.1 * weight
                matched_keywords.append(keyword)
        
        # Normalize score based on query length
        if len(query_words) > 0:
            score = min(score / len(query_words) * 10, 1.0)
        
        return score, matched_keywords

    def _classify_with_llm(self, query: str) -> Optional[IntentResult]:
        """
        Classify intent using LLM service
        """
        if not self.llm_service or not self.llm_service.is_available():
            return None
        
        try:
            system_prompt = """You are an expert agricultural assistant specializing in Bargarh district of Odisha, India. Classify the user's query into one of these categories:

- market_prices: Questions about crop prices, rates, market values, buying/selling prices in Bargarh mandis (Attabira, Bargarh, Godabhaga, Sohela, Padampur)
- irrigation_planning: Questions about watering, irrigation systems, water management, scheduling for Bargarh's climate and river systems
- pest_control: Questions about pests, diseases, insects, plant protection, spraying, treatment for Bargarh's common crops
- crop_recommendations: Questions about which crops to grow, varieties, seed selection, suitability for Bargarh's soil and climate
- weather_insights: Questions about weather, rainfall, temperature, climate, forecasts specific to Bargarh district
- government_schemes: Questions about subsidies, policies, loans, insurance, government support, PM-Kisan, KALIA, PMFBY, PM-Kusum, BKKY, Kamadhenu, FFDA, DBT schemes, AGAB, crop loans, farm implements, rural infrastructure available in Bargarh district
- fertilizer_guidance: Questions about fertilizers, nutrients, soil nutrition, compost, manure for Bargarh's soil types
- seasonal_planning: Questions about planting time, harvest season, crop calendar, timing for Bargarh's agricultural seasons
- general_farming: General farming advice, cultivation practices, farm management for Bargarh district
- unknown: Queries not related to agriculture or unclear intent

Rules:
1. Return only the category name (e.g., "market_prices")
2. If the query is not agricultural or unclear, return "unknown"
3. Be precise and confident in your classification
4. Consider local context and farming practices specific to Bargarh district"""

            user_prompt = f'Classify this agricultural query: "{query}"\n\nReturn only the category name from the list above.'
            
            result = self.llm_service.call_llm(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                model=self.preferred_model,  # Use preferred model if specified
                temperature=0.1,  # Low temperature for consistent classification
                max_tokens=20     # Short response needed
            )
            
            if result['status'] != 'success':
                logger.warning(f"LLM classification failed: {result.get('error', 'Unknown error')}")
                return None
            
            intent_str = result['response'].strip().lower().replace("-", "_")
            
            # Map to IntentType
            for intent_type in IntentType:
                if intent_type.value == intent_str:
                    # Extract entities using existing logic
                    crop, location = self.extract_entities(query)
                    
                    return IntentResult(
                        intent=intent_type,
                        confidence=0.9,  # High confidence for LLM
                        keywords_matched=[intent_str],
                        location=location,
                        crop=crop,
                        model=result.get('model', 'unknown'),  # NEW: Capture model info
                        provider=result.get('provider', self.llm_service.provider)  # NEW: Capture provider info
                    )
            
            logger.warning(f"LLM returned unrecognized intent: {intent_str}")
            return None
            
        except Exception as e:
            logger.error(f"Error in LLM classification: {e}")
            return None

    def _classify_with_keywords(self, query: str) -> IntentResult:
        """
        Original keyword-based classification method (fallback)
        """
        processed_query = self.preprocess_query(query)
        crop, location = self.extract_entities(processed_query)

        best_intent = IntentType.UNKNOWN
        best_score = 0.0
        best_keywords = []

        # Calculate scores for all intents (excluding UNKNOWN)
        for intent_type in IntentType:
            if intent_type == IntentType.UNKNOWN:
                continue

            score, keywords = self.calculate_intent_score(processed_query, intent_type)

            if score > best_score:
                best_score = score
                best_intent = intent_type
                best_keywords = keywords

        # Set minimum confidence threshold
        if best_score < 0.1:
            best_intent = IntentType.GENERAL_FARMING

        return IntentResult(
            intent=best_intent,
            confidence=best_score,
            keywords_matched=best_keywords,
            location=location,
            crop=crop,
            model="keyword_based",  # NEW: Mark as keyword-based
            provider="local"        # NEW: Mark as local processing
        )

    def classify_intent(self, query: str) -> IntentResult:
        """
        Classify the intent of the input query
        Uses complexity analysis first, then LLM, falls back to keyword matching
        """
        try:
            # Step 1: Check if this is a complex workflow query
            complexity_score = self._analyze_query_complexity(query)
            if complexity_score >= 0.7:  # Threshold for complex queries
                logger.info(f"Query complexity score {complexity_score:.2f} - treating as workflow query")
                return self._handle_workflow_query(query, complexity_score)
            
            # Step 2: Regular intent classification for simple queries
            # Try LLM classification first if available
            if self.use_llm and self.llm_service and self.llm_service.is_available():
                logger.debug("Attempting LLM classification")
                llm_result = self._classify_with_llm(query)
                
                if llm_result and llm_result.confidence > 0.7:
                    logger.debug(f"LLM classification successful: {llm_result.intent.value}")
                    return llm_result
                else:
                    logger.debug("LLM classification failed or low confidence, falling back to keywords")
            
            # Fallback to keyword-based classification
            logger.debug("Using keyword-based classification")
            return self._classify_with_keywords(query)
            
        except Exception as e:
            logger.error(f"Error in intent classification: {e}")
            # Ultimate fallback
            return self._classify_with_keywords(query)

    def get_service_info(self) -> Dict[str, str]:
        """Get information about the current LLM service"""
        if not self.llm_service or not self.llm_service.is_available():
            return {
                "provider": "local",
                "model": "keyword_based",
                "status": "keyword_only"
            }
        
        # Get available models for current provider
        available_models = list(self.llm_service.get_available_models().keys())
        current_model = self.preferred_model or self.llm_service.DEFAULT_MODELS.get(self.llm_service.provider)
        
        return {
            "provider": self.llm_service.provider,
            "model": current_model,
            "status": "llm_enabled",
            "available_models": available_models
        }

    def _analyze_query_complexity(self, query: str) -> float:
        """
        Analyze query complexity using LLM
        Returns score between 0-1 (higher = more complex)
        """
        if not self.llm_service or not self.llm_service.is_available():
            # Fallback complexity analysis using keywords
            return self._analyze_complexity_with_keywords(query)
        
        system_prompt = "You are an expert at analyzing the complexity of agricultural queries. Return only a numeric score between 0-1."
        
        user_prompt = f"""
        Analyze the complexity of this agricultural query and return a score between 0-1.
        
        Query: "{query}"
        
        Consider these factors:
        - Multiple intents or topics
        - Temporal aspects (seasons, planning)
        - Multiple crops or activities
        - Requires coordination of different data sources
        - Planning or strategic nature
        
        Return only a number between 0-1 (e.g., 0.85):
        """
        
        try:
            result = self.llm_service.call_llm(system_prompt, user_prompt, max_tokens=50)
            if result['status'] == 'success':
                response = result['response']
                # Extract numeric score from response
                import re
                score_match = re.search(r'0\.\d+', response)
                if score_match:
                    return float(score_match.group())
            return 0.5  # Default score
        except Exception as e:
            logger.warning(f"Failed to analyze complexity with LLM: {e}")
            return self._analyze_complexity_with_keywords(query)

    def _analyze_complexity_with_keywords(self, query: str) -> float:
        """
        Fallback complexity analysis using keyword patterns
        """
        query_lower = query.lower()
        
        # Complexity indicators
        complexity_keywords = [
            'plan', 'planning', 'strategy', 'comprehensive', 'overall', 'complete',
            'multiple', 'various', 'different', 'several', 'both', 'and', 'also',
            'considering', 'including', 'along with', 'as well as', 'together',
            'season', 'month', 'year', 'timeline', 'schedule', 'timing',
            'market', 'weather', 'soil', 'fertilizer', 'pest', 'crop'
        ]
        
        # Count complexity indicators
        complexity_count = sum(1 for keyword in complexity_keywords if keyword in query_lower)
        
        # Length factor
        length_factor = min(len(query.split()) / 20, 1.0)  # Normalize by 20 words
        
        # Calculate complexity score
        complexity_score = min((complexity_count * 0.1) + (length_factor * 0.3), 1.0)
        
        return complexity_score

    def _handle_workflow_query(self, query: str, complexity_score: float) -> IntentResult:
        """
        Handle complex queries by creating subtasks
        """
        subtasks = self._decompose_query_into_subtasks(query)
        
        return IntentResult(
            intent=IntentType.WORKFLOW_COMPLEX,
            confidence=complexity_score,
            keywords_matched=[],
            location=None,
            crop=None,
            model=self.llm_service.provider if self.llm_service else "keyword_based",
            provider=self.llm_service.provider if self.llm_service else "local",
            is_workflow=True,
            subtasks=subtasks
        )

    def _decompose_query_into_subtasks(self, query: str) -> List[Dict]:
        """
        Decompose complex query into manageable subtasks
        """
        if not self.llm_service or not self.llm_service.is_available():
            # Fallback subtasks
            return self._create_fallback_subtasks(query)
        
        system_prompt = "You are an expert at breaking down complex agricultural queries into specific, actionable subtasks. Return only valid JSON."
        
        user_prompt = f"""
        Break down this complex agricultural query into 3-5 specific subtasks.
        
        Complex Query: "{query}"
        
        For each subtask, provide:
        1. A clear, specific description
        2. The primary intent type (from: MARKET_PRICES, CROP_RECOMMENDATIONS, FERTILIZER_GUIDANCE, PEST_CONTROL, GOVERNMENT_SCHEMES, WEATHER_INSIGHTS, SEASONAL_PLANNING)
        3. A specific query for that subtask
        4. Priority (1-5, where 1 is highest)
        
        Format your response as JSON:
        {{
            "subtasks": [
                {{
                    "description": "Analyze current market prices for specific crops",
                    "intent_type": "MARKET_PRICES",
                    "query": "What are the current prices for paddy and wheat in Bargarh mandi?",
                    "priority": 1
                }}
            ]
        }}
        
        Focus on making each subtask specific and actionable.
        """
        
        try:
            result = self.llm_service.call_llm(system_prompt, user_prompt, max_tokens=500)
            
            if result['status'] == 'success':
                response = result['response']
                
                # Parse JSON response
                import json
                import re
                
                # Extract JSON from response
                json_match = re.search(r'\{.*\}', response, re.DOTALL)
                if json_match:
                    data = json.loads(json_match.group())
                    subtasks = data.get("subtasks", [])
                    
                    # Sort by priority
                    subtasks.sort(key=lambda x: x.get("priority", 3))
                    return subtasks
                    
        except Exception as e:
            logger.error(f"Failed to decompose query with LLM: {e}")
        
        # Fallback: create basic subtasks
        return self._create_fallback_subtasks(query)

    def _create_fallback_subtasks(self, query: str) -> List[Dict]:
        """Create basic subtasks as fallback"""
        return [
            {
                "description": "Analyze current market conditions",
                "intent_type": "MARKET_PRICES",
                "query": f"market prices {query}",
                "priority": 1
            },
            {
                "description": "Check weather conditions",
                "intent_type": "WEATHER_INSIGHTS",
                "query": f"weather forecast {query}",
                "priority": 2
            },
            {
                "description": "Get crop recommendations",
                "intent_type": "CROP_RECOMMENDATIONS",
                "query": f"crop recommendations {query}",
                "priority": 3
            }
        ]


# Enhanced test function with model information
def test_with_different_models():
    """Test with different Groq models"""
    
    # Models to test
    models_to_test = [
        ("groq", "llama-3.1-8b-instant"),      # Fast default
        ("groq", "gemma2-9b-it"),              # Efficient Google model
        ("groq", "openai/gpt-oss-120b"),       # Large reasoning model
        ("groq", "deepseek-r1-distill-llama-70b"),  # High-quality distilled
        ("groq", "compound-beta"),             # Experimental
        ("perplexity", None),                  # Perplexity default
    ]
    
    test_query = "What is the price of tomato in Karnataka today?"
    
    print(f"=== Testing Different Models with Query: '{test_query}' ===\n")
    
    for provider, model in models_to_test:
        print(f"--- Testing {provider} - {model or 'default'} ---")
        try:
            classifier = AgricultureIntentClassifier(
                use_llm=True, 
                preferred_provider=provider,
                preferred_model=model
            )
            
            service_info = classifier.get_service_info()
            print(f"Service Info: {service_info}")
            
            result = classifier.classify_intent(test_query)
            print(f"Intent: {result.intent.value}")
            print(f"Confidence: {result.confidence:.2f}")
            print(f"Model Used: {result.model}")
            print(f"Provider Used: {result.provider}")
            print(f"Crop: {result.crop}, Location: {result.location}")
            
        except Exception as e:
            print(f"Error with {provider} - {model}: {e}")
        
        print("-" * 50)


# Test the classifier
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test-models":
        test_with_different_models()
    else:
        # Standard test with enhanced output
        print("=== Testing with Multi-Modal LLM (Enhanced Output) ===")
        classifier_llm = AgricultureIntentClassifier(use_llm=True, preferred_provider="groq")
        
        # Show service info
        service_info = classifier_llm.get_service_info()
        print(f"Service Configuration: {service_info}\n")
        
        test_queries = [
            "What is the price of tomato in Karnataka today?",
            "How to control pest in wheat crop?",
            "When should I water my cotton field?",
            "Which variety of rice is suitable for Punjab?",
            "Is there any government subsidy for drip irrigation?",
            "Weather forecast for next week in Maharashtra",
            "NPK fertilizer schedule for potato crop",
            "General farming advice for beginners"
        ]

        for query in test_queries:
            result = classifier_llm.classify_intent(query)
            print(f"Query: {query}")
            print(f"Intent: {result.intent.value}")
            print(f"Confidence: {result.confidence:.2f}")
            print(f"Crop: {result.crop}, Location: {result.location}")
            print(f"Keywords: {result.keywords_matched}")
            print(f"Model: {result.model}")  # NEW: Show model used
            print(f"Provider: {result.provider}")  # NEW: Show provider used
            print("-" * 50)
        
        print("\n=== Testing without LLM (Keywords only) ===")
        classifier_keywords = AgricultureIntentClassifier(use_llm=False)
        
        # Show service info
        service_info = classifier_keywords.get_service_info()
        print(f"Service Configuration: {service_info}\n")
        
        for query in test_queries:
            result = classifier_keywords.classify_intent(query)
            print(f"Query: {query}")
            print(f"Intent: {result.intent.value}")
            print(f"Confidence: {result.confidence:.2f}")
            print(f"Crop: {result.crop}, Location: {result.location}")
            print(f"Keywords: {result.keywords_matched}")
            print(f"Model: {result.model}")  # NEW: Show "keyword_based"
            print(f"Provider: {result.provider}")  # NEW: Show "local"
            print("-" * 50)
