# main.py

import sys
import logging
from datetime import datetime

# Import our components
from intent_classifier import AgricultureIntentClassifier
from retriever import AgriculturalRetriever
from llm_client import LLMClient

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AgriculturalAssistant:
    """Simple Agricultural AI Assistant Pipeline"""
    
    def __init__(self, db_path: str = "agri_chromadb"):
        """Initialize all components"""
        logger.info("Initializing Agricultural Assistant...")
        
        self.classifier = AgricultureIntentClassifier()
        self.retriever = AgriculturalRetriever(db_path=db_path)
        self.llm_client = LLMClient()
        
        logger.info("Agricultural Assistant ready!")
    
    def process_query(self, query: str, top_k: int = 5) -> dict:
        """
        Process agricultural query through complete pipeline
        
        Args:
            query: User's question
            top_k: Number of context documents to retrieve
            
        Returns:
            Dictionary with response and metadata
        """
        start_time = datetime.now()
        logger.info(f"Processing query: '{query}'")
        
        try:
            # Step 1: Classify Intent
            logger.info("Step 1: Classifying intent...")
            intent_result = self.classifier.classify_intent(query)
            
            # Step 2: Retrieve Context
            logger.info("Step 2: Retrieving context...")
            context_result = self.retriever.retrieve_context(query, intent_result, top_k)
            
            # Step 3: Generate Response
            logger.info("Step 3: Generating response...")
            llm_result = self.llm_client.generate_response(
                query, intent_result, context_result['context']
            )
            
            # Step 4: Format Final Result
            processing_time = (datetime.now() - start_time).total_seconds()
            
            return {
                "query": query,
                "response": llm_result['response'],
                "intent": intent_result.intent.value,
                "confidence": intent_result.confidence,
                "crop": intent_result.crop,
                "location": intent_result.location,
                "bucket_used": context_result['bucket_used'],
                "context_count": context_result['total_results'],
                "processing_time": processing_time,
                "status": llm_result['status']
            }
            
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return {
                "query": query,
                "response": "Sorry, I encountered an error processing your question. Please try again.",
                "error": str(e),
                "status": "error"
            }

def main():
    """Simple command line interface"""
    
    # Check if query provided
    if len(sys.argv) < 2:
        print("\n🌾 Agricultural AI Assistant 🌾")
        print("\nUsage:")
        print("  python main.py 'Your agricultural question here'")
        print("\nExamples:")
        print("  python main.py 'What is the price of tomato in Karnataka?'")
        print("  python main.py 'How to control pest in wheat crop?'")
        print("  python main.py 'Which variety of rice is best for Punjab?'")
        return
    
    # Get query from command line
    query = sys.argv[1]
    
    # Initialize assistant
    print("🔄 Starting Agricultural Assistant...")
    assistant = AgriculturalAssistant()
    
    # Process query
    print(f"🌱 Processing: {query}")
    result = assistant.process_query(query)
    
    # Display results
    print(f"\n{'='*60}")
    print(f"🤖 RESPONSE:")
    print(f"{'='*60}")
    print(result['response'])
    
    # Show metadata if successful
    if result['status'] != 'error':
        print(f"\n{'='*60}")
        print(f"📊 DETAILS:")
        print(f"{'='*60}")
        print(f"Intent: {result['intent']} (confidence: {result['confidence']:.2f})")
        print(f"Crop: {result['crop'] or 'Not detected'}")
        print(f"Location: {result['location'] or 'Not detected'}")
        print(f"Data Source: {result['bucket_used']}")
        print(f"Context Documents: {result['context_count']}")
        print(f"Processing Time: {result['processing_time']:.2f} seconds")

def run_interactive():
    """Interactive mode for multiple queries"""
    print("\n🌾 Agricultural AI Assistant - Interactive Mode 🌾")
    print("Ask me anything about agriculture! Type 'quit' to exit.\n")
    
    # Initialize assistant
    assistant = AgriculturalAssistant()
    
    while True:
        try:
            # Get user input
            query = input("🌱 Your question: ").strip()
            
            # Check for exit
            if query.lower() in ['quit', 'exit', 'q', 'bye']:
                print("Goodbye! Happy farming! 🚜")
                break
            
            if not query:
                continue
            
            # Process query
            print("🔍 Processing...")
            result = assistant.process_query(query)
            
            # Show response
            print(f"\n🤖 {result['response']}")
            
            # Show brief metadata
            if result['status'] != 'error':
                print(f"\n📊 Intent: {result['intent']} | Time: {result['processing_time']:.1f}s")
            
            print("-" * 50)
            
        except KeyboardInterrupt:
            print("\nGoodbye! Happy farming! 🚜")
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    # Check if interactive mode requested
    if len(sys.argv) > 1 and sys.argv[1] == "--interactive":
        run_interactive()
    else:
        main()
