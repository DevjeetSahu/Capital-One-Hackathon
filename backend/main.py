# main.py

import sys
import logging
from datetime import datetime
from typing import Optional

# Import our components
from intent_classifier import AgricultureIntentClassifier
from retriever import AgriculturalRetriever
from llm_client import LLMClient

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AgriculturalAssistant:
    """Simple Agricultural AI Assistant Pipeline"""
    
    def __init__(self, db_path: str = "../agri_chromadb", llm_provider: str = "groq", llm_model: Optional[str] = None):
        """
        Initialize all components
        
        Args:
            db_path: Path to the vector database
            llm_provider: LLM provider ("groq" or "perplexity")
            llm_model: Specific model to use (optional, will use default if not specified)
        """
        logger.info("Initializing Agricultural Assistant...")
        
        # Initialize classifier with LLM preferences
        self.classifier = AgricultureIntentClassifier(
            use_llm=True, 
            preferred_provider=llm_provider,
            preferred_model=llm_model
        )
        self.retriever = AgriculturalRetriever(db_path=db_path)
        self.llm_client = LLMClient(provider=llm_provider, model=llm_model)
        
        # Get service information for logging
        classifier_info = self.classifier.get_service_info()
        logger.info(f"Intent Classification: {classifier_info}")
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
                "status": llm_result['status'],
                # NEW: Add model and provider information
                "intent_model": intent_result.model,
                "intent_provider": intent_result.provider,
                "llm_model": llm_result.get('model', 'unknown'),
                "llm_provider": llm_result.get('provider', 'unknown')
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
        print("  python main.py 'Your agricultural question here' [provider] [model]")
        print("\nExamples:")
        print("  python main.py 'What is the price of tomato in Karnataka?'")
        print("  python main.py 'How to control pest in wheat crop?' groq")
        print("  python main.py 'Which variety of rice is best for Punjab?' groq llama-3.1-8b-instant")
        print("  python main.py 'Weather forecast for farming' perplexity")
        print("\nAvailable providers: groq, perplexity")
        print("\nAvailable Groq models:")
        print("  • llama-3.1-8b-instant (default - fast and efficient)")
        print("  • gemma2-9b-it (Google's efficient model)")
        print("  • openai/gpt-oss-120b (large reasoning model)")
        print("  • deepseek-r1-distill-llama-70b (high-quality distilled)")
        print("  • compound-beta (experimental ensemble)")
        return
    
    # Get query and optional parameters from command line
    query = sys.argv[1]
    llm_provider = sys.argv[1] if len(sys.argv) > 2 else "groq"
    llm_model = sys.argv[2] if len(sys.argv) > 3 else None
    
    # Initialize assistant
    print("🔄 Starting Agricultural Assistant...")
    print(f"Provider: {llm_provider}")
    if llm_model:
        print(f"Model: {llm_model}")
    
    assistant = AgriculturalAssistant(llm_provider=llm_provider, llm_model=llm_model)
    
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
        
        # NEW: Show model and provider information
        print(f"\n{'='*60}")
        print(f"🔧 MODEL DETAILS:")
        print(f"{'='*60}")
        print(f"Intent Classification Model: {result['intent_model']}")
        print(f"Intent Classification Provider: {result['intent_provider']}")
        print(f"Response Generation Model: {result['llm_model']}")
        print(f"Response Generation Provider: {result['llm_provider']}")

def run_interactive():
    """Interactive mode for multiple queries"""
    print("\n🌾 Agricultural AI Assistant - Interactive Mode 🌾")
    print("Ask me anything about agriculture! Type 'quit' to exit.\n")
    
    # Get provider and model preferences
    print("Choose your LLM provider:")
    print("1. groq (default)")
    print("2. perplexity")
    provider_choice = input("Enter choice (1 or 2, default=1): ").strip()
    llm_provider = "perplexity" if provider_choice == "2" else "groq"
    
    llm_model = None
    if llm_provider == "groq":
        print("\nChoose your Groq model:")
        print("1. llama-3.1-8b-instant (default - fast and efficient)")
        print("2. gemma2-9b-it (Google's efficient model)")
        print("3. openai/gpt-oss-120b (large reasoning model)")
        print("4. deepseek-r1-distill-llama-70b (high-quality distilled)")
        print("5. compound-beta (experimental ensemble)")
        print("6. Use default")
        model_choice = input("Enter choice (1-6, default=6): ").strip()
        
        model_map = {
            "1": "llama-3.1-8b-instant",
            "2": "gemma2-9b-it",
            "3": "openai/gpt-oss-120b",
            "4": "deepseek-r1-distill-llama-70b",
            "5": "compound-beta"
        }
        llm_model = model_map.get(model_choice)
    
    print(f"\nUsing provider: {llm_provider}")
    if llm_model:
        print(f"Using model: {llm_model}")
    
    # Initialize assistant
    assistant = AgriculturalAssistant(llm_provider=llm_provider, llm_model=llm_model)
    
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
                print(f"🔧 Models: Intent({result['intent_model']}) | Response({result['llm_model']})")
            
            print("-" * 50)
            
        except KeyboardInterrupt:
            print("\nGoodbye! Happy farming! 🚜")
            break
        except Exception as e:
            print(f"Error: {e}")

def run_benchmark():
    """Benchmark different models with the same query"""
    print("\n🌾 Agricultural AI Assistant - Model Benchmark 🌾\n")
    
    test_query = input("Enter a query to test across all models: ").strip()
    if not test_query:
        test_query = "What is the price of tomato in Karnataka?"
    
    # Models to benchmark
    models_to_test = [
        ("groq", "llama-3.1-8b-instant"),
        ("groq", "gemma2-9b-it"),
        ("groq", "openai/gpt-oss-120b"),
        ("groq", "deepseek-r1-distill-llama-70b"),
        ("groq", "compound-beta"),
        ("perplexity", None)
    ]
    
    print(f"\nBenchmarking query: '{test_query}'\n")
    
    for provider, model in models_to_test:
        model_name = model or "default"
        print(f"--- Testing {provider} - {model_name} ---")
        
        try:
            assistant = AgriculturalAssistant(llm_provider=provider, llm_model=model)
            start_time = datetime.now()
            result = assistant.process_query(test_query)
            
            print(f"Response: {result['response'][:150]}...")
            print(f"Intent: {result['intent']} (confidence: {result['confidence']:.2f})")
            print(f"Processing Time: {result['processing_time']:.2f}s")
            print(f"Models Used: Intent({result['intent_model']}) | Response({result['llm_model']})")
            
        except Exception as e:
            print(f"Error: {e}")
        
        print("-" * 50)

if __name__ == "__main__":
    # Check for different modes
    if len(sys.argv) > 1:
        if sys.argv[1] == "--interactive":
            run_interactive()
        elif sys.argv[1] == "--benchmark":
            run_benchmark()
        elif sys.argv[1] == "--help":
            print("\n🌾 Agricultural AI Assistant 🌾")
            print("\nAvailable modes:")
            print("  python main.py 'query' [provider] [model]  # Single query")
            print("  python main.py --interactive              # Interactive chat")
            print("  python main.py --benchmark                # Model benchmark")
            print("  python main.py --help                     # Show this help")
            print("\nProviders: groq, perplexity")
            print("Groq Models: llama-3.1-8b-instant, gemma2-9b-it, openai/gpt-oss-120b, deepseek-r1-distill-llama-70b, compound-beta")
        else:
            main()
    else:
        main()
