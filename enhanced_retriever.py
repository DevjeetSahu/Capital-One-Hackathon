# enhanced_retriever.py
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
import logging
from intent_classifier import IntentResult, IntentType

logger = logging.getLogger(__name__)

@dataclass
class RetrievalResult:
    documents: List[str]
    metadatas: List[Dict]
    scores: List[float]
    total_results: int
    filters_applied: Dict
    collection_used: str

class EnhancedContextRetriever:
    def __init__(self):
        self.CHROMA_PATH = "chroma_data/"
        self.MODEL_NAME = "all-MiniLM-L6-v2"
        
        # Collection mapping for different intents
        self.collection_map = {
            IntentType.MARKET_PRICES: "mandi_prices",
            IntentType.IRRIGATION_PLANNING: "irrigation_data", 
            IntentType.PEST_CONTROL: "pest_control",
            IntentType.CROP_RECOMMENDATIONS: "crop_recommendation",
            IntentType.WEATHER_INSIGHTS: "irrigation_data",  # Weather info in irrigation data
            IntentType.GOVERNMENT_SCHEMES: "mandi_prices",   # For now, use market data
            IntentType.FERTILIZER_GUIDANCE: "crop_recommendation",  # Soil/nutrient info
            IntentType.SEASONAL_PLANNING: "crop_recommendation"
        }
        
        # Pipeline-specific retrievers
        self.pipeline_retrievers = {
            IntentType.MARKET_PRICES: self._retrieve_market_context,
            IntentType.IRRIGATION_PLANNING: self._retrieve_irrigation_context,
            IntentType.PEST_CONTROL: self._retrieve_pest_context,
            IntentType.CROP_RECOMMENDATIONS: self._retrieve_crop_context,
            IntentType.WEATHER_INSIGHTS: self._retrieve_weather_context,
            IntentType.FERTILIZER_GUIDANCE: self._retrieve_fertilizer_context,
            IntentType.SEASONAL_PLANNING: self._retrieve_seasonal_context
        }
    
    def get_chroma_collection(self, collection_name: str):
        """Get ChromaDB collection with error handling"""
        try:
            embedding_function = SentenceTransformerEmbeddingFunction(model_name=self.MODEL_NAME)
            client = chromadb.PersistentClient(path=self.CHROMA_PATH)
            
            collection = client.get_collection(name=collection_name)
            return collection
        except Exception as e:
            logger.error(f"Error accessing collection {collection_name}: {str(e)}")
            # Fallback to market prices collection
            try:
                collection = client.get_collection(name="mandi_prices")
                logger.info(f"Falling back to mandi_prices collection")
                return collection
            except:
                raise Exception(f"No available collections found")
    
    def retrieve_enhanced_context(self, query: str, intent_result: IntentResult, n_results: int = 5) -> RetrievalResult:
        """Enhanced context retrieval for multiple domains"""
        
        # Route to appropriate pipeline retriever
        pipeline_retriever = self.pipeline_retrievers.get(
            intent_result.intent,
            self._retrieve_generic_context
        )
        
        return pipeline_retriever(query, intent_result, n_results)
    
    def _retrieve_irrigation_context(self, query: str, intent_result: IntentResult, n_results: int) -> RetrievalResult:
        """Retrieve irrigation-specific context"""
        collection = self.get_chroma_collection("irrigation_data")
        
        try:
            # Build query with crop-specific filtering
            query_text = query
            if intent_result.crop:
                query_text += f" {intent_result.crop} irrigation schedule water management"
            
            results = collection.query(query_texts=[query_text], n_results=n_results)
            
            documents = results["documents"][0] if results["documents"] else []
            metadatas = results["metadatas"][0] if results["metadatas"] else []
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(documents)
            
            scores = [max(0, 1 - dist) for dist in distances]
            
            return RetrievalResult(
                documents=documents,
                metadatas=metadatas,
                scores=scores,
                total_results=len(documents),
                filters_applied={"crop": intent_result.crop},
                collection_used="irrigation_data"
            )
            
        except Exception as e:
            logger.error(f"Error in irrigation retrieval: {str(e)}")
            return self._retrieve_generic_context(query, intent_result, n_results)
    
    def _retrieve_pest_context(self, query: str, intent_result: IntentResult, n_results: int) -> RetrievalResult:
        """Retrieve pest control context"""
        collection = self.get_chroma_collection("pest_control")
        
        try:
            # Enhanced query for pest control
            query_text = query
            if intent_result.crop:
                query_text += f" {intent_result.crop} pest disease control management"
            
            results = collection.query(query_texts=[query_text], n_results=n_results)
            
            documents = results["documents"][0] if results["documents"] else []
            metadatas = results["metadatas"][0] if results["metadatas"] else []
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(documents)
            
            scores = [max(0, 1 - dist) for dist in distances]
            
            return RetrievalResult(
                documents=documents,
                metadatas=metadatas,
                scores=scores,
                total_results=len(documents),
                filters_applied={"crop": intent_result.crop},
                collection_used="pest_control"
            )
            
        except Exception as e:
            logger.error(f"Error in pest control retrieval: {str(e)}")
            return self._retrieve_generic_context(query, intent_result, n_results)
    
    def _retrieve_crop_context(self, query: str, intent_result: IntentResult, n_results: int) -> RetrievalResult:
        """Retrieve crop recommendation context"""
        collection = self.get_chroma_collection("crop_recommendation")
        
        try:
            # Enhanced query for crop recommendation
            query_text = query
            if intent_result.location:
                query_text += f" {intent_result.location} soil climate suitable crops"
            
            results = collection.query(query_texts=[query_text], n_results=n_results)
            
            documents = results["documents"][0] if results["documents"] else []
            metadatas = results["metadatas"][0] if results["metadatas"] else []
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(documents)
            
            scores = [max(0, 1 - dist) for dist in distances]
            
            return RetrievalResult(
                documents=documents,
                metadatas=metadatas,
                scores=scores,
                total_results=len(documents),
                filters_applied={"location": intent_result.location},
                collection_used="crop_recommendation"
            )
            
        except Exception as e:
            logger.error(f"Error in crop recommendation retrieval: {str(e)}")
            return self._retrieve_generic_context(query, intent_result, n_results)
    
    def _retrieve_market_context(self, query: str, intent_result: IntentResult, n_results: int) -> RetrievalResult:
        """Retrieve market price context (existing implementation)"""
        collection = self.get_chroma_collection("mandi_prices")
        
        try:
            results = collection.query(query_texts=[query], n_results=n_results)
            
            documents = results["documents"][0] if results["documents"] else []
            metadatas = results["metadatas"][0] if results["metadatas"] else []
            distances = results["distances"][0] if results.get("distances") else [0.0] * len(documents)
            
            scores = [max(0, 1 - dist) for dist in distances]
            
            return RetrievalResult(
                documents=documents,
                metadatas=metadatas,
                scores=scores,
                total_results=len(documents),
                filters_applied={},
                collection_used="mandi_prices"
            )
            
        except Exception as e:
            logger.error(f"Error in market context retrieval: {str(e)}")
            return RetrievalResult(
                documents=[], metadatas=[], scores=[], total_results=0, 
                filters_applied={}, collection_used="none"
            )
    
    def _retrieve_weather_context(self, query: str, intent_result: IntentResult, n_results: int) -> RetrievalResult:
        """Retrieve weather-related context from irrigation data"""
        return self._retrieve_irrigation_context(query, intent_result, n_results)
    
    def _retrieve_fertilizer_context(self, query: str, intent_result: IntentResult, n_results: int) -> RetrievalResult:
        """Retrieve fertilizer guidance from crop recommendation data"""
        return self._retrieve_crop_context(query, intent_result, n_results)
    
    def _retrieve_seasonal_context(self, query: str, intent_result: IntentResult, n_results: int) -> RetrievalResult:
        """Retrieve seasonal planning context"""
        return self._retrieve_crop_context(query, intent_result, n_results)
    
    def _retrieve_generic_context(self, query: str, intent_result: IntentResult, n_results: int) -> RetrievalResult:
        """Fallback generic retrieval"""
        return self._retrieve_market_context(query, intent_result, n_results)
    
    def rank_by_relevance(self, retrieval_result: RetrievalResult, intent_result: IntentResult) -> RetrievalResult:
        """Apply additional relevance scoring based on intent"""
        if not retrieval_result.documents:
            return retrieval_result
        
        # Enhanced relevance scoring for different domains
        enhanced_scores = []
        
        for i, (doc, metadata, score) in enumerate(zip(
            retrieval_result.documents, 
            retrieval_result.metadatas, 
            retrieval_result.scores
        )):
            enhanced_score = score
            
            # Intent-specific boost
            if intent_result.intent == IntentType.MARKET_PRICES:
                # Boost if location/crop matches
                if intent_result.location and metadata.get('state', '').lower().find(intent_result.location.lower()) >= 0:
                    enhanced_score += 0.2
                if intent_result.crop and metadata.get('commodity', '').lower().find(intent_result.crop.lower()) >= 0:
                    enhanced_score += 0.2
                    
            elif intent_result.intent == IntentType.IRRIGATION_PLANNING:
                # Boost if crop matches
                if intent_result.crop and metadata.get('crop', '').lower().find(intent_result.crop.lower()) >= 0:
                    enhanced_score += 0.3
                    
            elif intent_result.intent == IntentType.PEST_CONTROL:
                # Boost if crop/pest matches
                if intent_result.crop and metadata.get('crop', '').lower().find(intent_result.crop.lower()) >= 0:
                    enhanced_score += 0.3
                    
            elif intent_result.intent == IntentType.CROP_RECOMMENDATIONS:
                # Boost if location matches
                if intent_result.location and metadata.get('region', '').lower().find(intent_result.location.lower()) >= 0:
                    enhanced_score += 0.2
            
            enhanced_scores.append(enhanced_score)
        
        # Re-sort by enhanced scores
        sorted_indices = sorted(range(len(enhanced_scores)), key=lambda i: enhanced_scores[i], reverse=True)
        
        return RetrievalResult(
            documents=[retrieval_result.documents[i] for i in sorted_indices],
            metadatas=[retrieval_result.metadatas[i] for i in sorted_indices],
            scores=[enhanced_scores[i] for i in sorted_indices],
            total_results=retrieval_result.total_results,
            filters_applied=retrieval_result.filters_applied,
            collection_used=retrieval_result.collection_used
        )

if __name__ == "__main__":
    # Test the enhanced retriever
    from intent_classifier import AgricultureIntentClassifier
    
    classifier = AgricultureIntentClassifier()
    retriever = EnhancedContextRetriever()
    
    test_queries = [
        "When should I water my cotton crop?",
        "How to control aphids in wheat?", 
        "Which crop is suitable for black soil in Maharashtra?",
        "What is the price of tomato today?"
    ]
    
    for query in test_queries:
        intent_result = classifier.classify_intent(query)
        retrieval_result = retriever.retrieve_enhanced_context(query, intent_result)
        
        print(f"\nQuery: {query}")
        print(f"Intent: {intent_result.intent.value}")
        print(f"Collection: {retrieval_result.collection_used}")
        print(f"Documents found: {retrieval_result.total_results}")
        if retrieval_result.documents:
            print(f"Sample doc: {retrieval_result.documents[0][:200]}...")
        print("-" * 80)
