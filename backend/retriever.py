# retriever.py

import logging
from typing import Dict, List, Any
from intent_classifier import IntentResult, IntentType
from agri_vector_db import AgriculturalVectorDB

logger = logging.getLogger(__name__)

class AgriculturalRetriever:
    """
    Simple retriever that takes intent and retrieves relevant context from vector database
    """
    
    def __init__(self, db_path: str = "../agri_chromadb"):
        """Initialize retriever with vector database"""
        self.vector_db = AgriculturalVectorDB(persist_directory=db_path)
        
        # Map intent types to bucket names
        self.intent_to_bucket = {
            IntentType.MARKET_PRICES: "market_prediction_data",
            IntentType.IRRIGATION_PLANNING: "crop_guidance_data",
            IntentType.PEST_CONTROL: "pest_control_data", 
            IntentType.CROP_RECOMMENDATIONS: "crop_guidance_data",
            IntentType.WEATHER_INSIGHTS: "weather_data",
            IntentType.GOVERNMENT_SCHEMES: "government_schemes_data",
            IntentType.FERTILIZER_GUIDANCE: "soil_health_data",
            IntentType.SEASONAL_PLANNING: "crop_guidance_data",
            IntentType.GENERAL_FARMING: "crop_guidance_data",
            IntentType.UNKNOWN: "market_prediction_data"  # Default fallback
        }
        
        logger.info("Agricultural Retriever initialized")
    
    def retrieve_context(self, query: str, intent_result: IntentResult, top_k: int = 5) -> Dict[str, Any]:
        """
        Retrieve relevant context based on intent and query
        
        Args:
            query: Original user query (used as-is)
            intent_result: Result from intent classifier
            top_k: Number of documents to retrieve
            
        Returns:
            Dictionary with retrieved context and metadata
        """
        try:
            # Step 1: Map intent to bucket
            bucket_name = self.intent_to_bucket.get(intent_result.intent, "market_prediction_data")
            
            # Step 2: Check if bucket exists
            if bucket_name not in self.vector_db.list_buckets():
                logger.warning(f"Bucket '{bucket_name}' not found. Using market_prediction_data.")
                bucket_name = "market_prediction_data"
            
            # Step 3: Query vector database with raw query
            search_results = self.vector_db.query_bucket(
                bucket_name=bucket_name,
                query=query,  # Use raw query without enhancement
                n_results=top_k
            )
            
            # Step 4: Format results
            context_documents = self._format_results(search_results)
            
            return {
                "context": context_documents,
                "bucket_used": bucket_name,
                "query_used": query,
                "total_results": len(context_documents)
            }
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return {
                "context": [],
                "bucket_used": "",
                "query_used": query,
                "total_results": 0,
                "error": str(e)
            }
    
    def _format_results(self, search_results: Dict) -> List[Dict]:
        """Format search results into clean structure"""
        if not search_results or 'documents' not in search_results:
            return []
        
        documents = search_results.get('documents', [[]])[0]
        metadatas = search_results.get('metadatas', [[]])
        distances = search_results.get('distances', [[]])
        
        formatted_results = []
        
        for i, doc in enumerate(documents):
            # FIXED: Handle both nested and flat distance structures
            if i < len(distances):
                # Check if distances is nested or flat
                if isinstance(distances, list) and len(distances) > 0:
                    if isinstance(distances[0], (list, tuple)):
                        # Nested: distances = [[d1, d2, d3, ...]]
                        similarity_score = 1 - distances[0][i] if i < len(distances) else 0.0
                    else:
                        # Flat: distances = [d1, d2, d3, ...]
                        similarity_score = 1 - distances[i]
                else:
                    similarity_score = 0.0
            else:
                similarity_score = 0.0
            
            metadata = metadatas[i] if i < len(metadatas) else {}
            
            formatted_results.append({
                "document": doc,
                "similarity_score": similarity_score,
                "metadata": metadata
            })
        
        return formatted_results

# Simple test function
def test_retriever():
    """Test the retriever with a sample query"""
    from intent_classifier import AgricultureIntentClassifier
    
    # Initialize components
    classifier = AgricultureIntentClassifier(use_llm=True)
    retriever = AgriculturalRetriever()
    
    # Test query
    query = "What is the price of tomato in Karnataka?"
    
    # Get intent
    intent_result = classifier.classify_intent(query)
    print(f"Intent: {intent_result.intent.value}")
    print(f"Confidence: {intent_result.confidence:.3f}")
    print(f"Crop: {intent_result.crop}")
    print(f"Location: {intent_result.location}")
    
    # Retrieve context
    context_result = retriever.retrieve_context(query, intent_result, top_k=3)
    
    print(f"\nBucket used: {context_result['bucket_used']}")
    print(f"Query used: {context_result['query_used']}")
    print(f"Results found: {context_result['total_results']}")
    
    print("\nTop results:")
    for i, ctx in enumerate(context_result['context'], 1):
        print(f"{i}. [Score: {ctx['similarity_score']:.3f}]")
        print(f"   {ctx['document'][:150]}...")
        print()

if __name__ == "__main__":
    test_retriever()
