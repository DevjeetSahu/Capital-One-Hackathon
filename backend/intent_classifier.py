# intent_classifier.py (CORRECTED VERSION)
import json
import re
from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

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
    UNKNOWN = "unknown"

@dataclass
class IntentResult:
    intent: IntentType
    confidence: float
    keywords_matched: List[str]
    location: str = None
    crop: str = None

class AgricultureIntentClassifier:
    def __init__(self):
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
                'keywords': ['scheme', 'subsidy', 'government', 'policy', 'loan', 'insurance', 'benefit', 'support'],
                'phrases': ['government scheme', 'subsidy available', 'farmer scheme', 'agricultural policy'],
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
            # ADD THE MISSING GENERAL_FARMING PATTERN
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
    
    def classify_intent(self, query: str) -> IntentResult:
        """Classify the intent of the input query"""
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
            crop=crop
        )

# Test the classifier
if __name__ == "__main__":
    classifier = AgricultureIntentClassifier()
    
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
        result = classifier.classify_intent(query)
        print(f"Query: {query}")
        print(f"Intent: {result.intent.value}")
        print(f"Confidence: {result.confidence:.2f}")
        print(f"Crop: {result.crop}, Location: {result.location}")
        print(f"Keywords: {result.keywords_matched}")
        print("-" * 50)
