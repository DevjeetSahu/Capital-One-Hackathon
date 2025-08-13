# enhanced_main.py (FIXED VERSION)
import logging
from query_router import QueryRouter
from enhanced_llm_client import EnhancedLLMClient
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AgricultureAIAgent:
    def __init__(self):
        # Only initialize router (which contains the working retriever)
        self.router = QueryRouter()
        self.llm_client = EnhancedLLMClient()
        
        # Use router's retriever instead of creating a new one
        self.retriever = self.router.enhanced_retriever
        
        logger.info("Agriculture AI Agent initialized successfully")
    
    def process_query(self, query: str) -> dict:
        """Main method to process user queries end-to-end"""
        logger.info(f"Processing query: {query}")
        
        try:
            # Step 1: Route query and classify intent (this includes retrieval)
            routing_result = self.router.route_query(query)
            
            if routing_result['status'] != 'success':
                return routing_result
            
            # Step 2: For market prices, get enhanced response
            if routing_result['intent'] == 'market_prices':
                intent_result = self.router.intent_classifier.classify_intent(query)
                
                # Get context from router's response (already retrieved)
                context_docs = routing_result['response'].get('context_docs', [])
                context_metadata = routing_result['response'].get('context_metadata', [])
                relevance_scores = routing_result['response'].get('relevance_scores', [])
                
                if context_docs:
                    # Create retrieval result from router data
                    from enhanced_retriever import RetrievalResult
                    
                    retrieval_result = RetrievalResult(
                        documents=context_docs,
                        metadatas=context_metadata if context_metadata else [{}] * len(context_docs),
                        scores=relevance_scores if relevance_scores else [0.8] * len(context_docs),
                        total_results=len(context_docs),
                        filters_applied=routing_result['response'].get('filters_applied', {})
                    )
                    
                    logger.info(f"Using {retrieval_result.total_results} documents from router")
                    
                    # Generate enhanced response
                    llm_response = self.llm_client.generate_enhanced_response(
                        query, intent_result, retrieval_result
                    )
                    
                    # Combine all results
                    final_result = {
                        **routing_result,
                        'retrieval_stats': {
                            'documents_found': retrieval_result.total_results,
                            'filters_applied': retrieval_result.filters_applied,
                            'top_relevance_score': retrieval_result.scores[0] if retrieval_result.scores else 0
                        },
                        'llm_response': llm_response
                    }
                else:
                    logger.warning("No context documents found in router response")
                    final_result = routing_result
                
            else:
                # For other intents, return the routing result
                final_result = routing_result
            
            return final_result
            
        except Exception as e:
            logger.error(f"Error processing query: {str(e)}")
            return {
                'status': 'error',
                'error': str(e),
                'message': 'Sorry, I encountered an error processing your request.'
            }
    
    def debug_query(self, query: str):
        """Debug version that shows retrieved documents"""
        try:
            routing_result = self.router.route_query(query)
            
            print(f"\n🔍 **DEBUG: Raw Retrieval Results**")
            print("=" * 60)
            print(f"Intent: {routing_result['intent']} (Confidence: {routing_result['confidence']:.2f})")
            print(f"Entities: {routing_result['entities']}")
            
            if routing_result['response'].get('context_docs'):
                docs = routing_result['response']['context_docs']
                metadata = routing_result['response'].get('context_metadata', [])
                scores = routing_result['response'].get('relevance_scores', [])
                
                print(f"\n📄 **Retrieved Documents ({len(docs)} found):**")
                
                for i, doc in enumerate(docs, 1):
                    print(f"\n--- Document {i} ---")
                    print(doc)
                    
                    if i <= len(metadata):
                        print(f"Metadata: {metadata[i-1]}")
                    
                    if i <= len(scores):
                        print(f"Relevance Score: {scores[i-1]:.3f}")
                    print()
            else:
                print("\n⚠️ No documents retrieved!")
                
        except Exception as e:
            print(f"Debug error: {str(e)}")
    
    def run_interactive_session(self):
        """Run an interactive session for testing"""
        print("🌾 Agriculture AI Agent - Phase 1 Implementation")
        print("=" * 50)
        print("Ask questions about:")
        print("- Market prices (fully implemented)")
        print("- Irrigation, pest control, crop recommendations (coming in Phase 2)")
        print("\nCommands:")
        print("- Normal question: Gets full AI response")
        print("- 'debug [question]': Shows retrieved documents")
        print("- 'quit': Exit")
        print("=" * 50)
        
        while True:
            try:
                user_input = input("\n📝 Ask your question: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'bye']:
                    print("Thank you for using Agriculture AI Agent! 🙏")
                    break
                
                if not user_input:
                    continue
                
                # Check for debug command
                if user_input.lower().startswith('debug '):
                    query = user_input[6:].strip()
                    if query:
                        self.debug_query(query)
                    continue
                
                print("\n⏳ Processing your query...")
                result = self.process_query(user_input)
                
                print("\n" + "="*60)
                print("📊 ANALYSIS RESULTS")
                print("="*60)
                print(f"Intent Detected: {result.get('intent', 'unknown')}")
                print(f"Confidence: {result.get('confidence', 0):.2f}")
                
                if result.get('entities'):
                    entities = result['entities']
                    if entities.get('crop'):
                        print(f"Crop Detected: {entities['crop']}")
                    if entities.get('location'):
                        print(f"Location Detected: {entities['location']}")
                
                if result.get('retrieval_stats'):
                    stats = result['retrieval_stats']
                    print(f"Documents Retrieved: {stats.get('documents_found', 0)}")
                    print(f"Top Relevance Score: {stats.get('top_relevance_score', 0):.2f}")
                
                print("\n" + "="*60)
                print("🤖 AI RESPONSE")
                print("="*60)
                
                if result.get('llm_response') and result['llm_response'].get('response'):
                    print(result['llm_response']['response'])
                else:
                    print(result.get('response', result.get('message', 'No response available')))
                
                print("\n" + "="*60)
                
            except KeyboardInterrupt:
                print("\n\nGoodbye! 👋")
                break
            except Exception as e:
                print(f"\n❌ Error: {str(e)}")

if __name__ == "__main__":
    agent = AgricultureAIAgent()
    agent.run_interactive_session()
