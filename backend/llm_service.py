# llm_service.py

import os
import logging
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None
    print("OpenAI package not installed. Perplexity functionality will be limited.")

try:
    from groq import Groq
except ImportError:
    Groq = None
    print("Groq package not installed. Groq functionality will be limited.")

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class LLMService:
    """
    Centralized LLM service for making API calls to multiple providers
    Supports Perplexity and Groq with configurable parameters
    """
    
    # Updated Groq models with the new ones you requested
    GROQ_MODELS = {
        "llama-3.1-8b-instant": {
            "name": "Llama 3.1 8B Instant",
            "description": "Fast, instruction-tuned version of Llama 3.1 8B",
            "max_tokens": 4096,
            "recommended_for": "Fast inference with good accuracy"
        },
        "gemma2-9b-it": {
            "name": "Gemma2 9B IT",
            "description": "Google's efficient model",
            "max_tokens": 8192,
            "recommended_for": "General tasks, good performance/cost ratio"
        },
        "openai/gpt-oss-120b": {
            "name": "OpenAI GPT OSS 120B",
            "description": "Open source GPT-style 120B parameter model",
            "max_tokens": 10240,
            "recommended_for": "Large context, deep reasoning tasks"
        },
        "deepseek-r1-distill-llama-70b": {
            "name": "DeepSeek R1 Distilled Llama 70B",
            "description": "Distilled, efficient 70B Llama variant from DeepSeek",
            "max_tokens": 8192,
            "recommended_for": "High quality reasoning with fewer resources"
        },
        "compound-beta": {
            "name": "Compound Beta",
            "description": "Experimental multi-model ensemble system",
            "max_tokens": 4096,
            "recommended_for": "Research and experimental applications"
        }
    }
    
    # Default models for each provider
    DEFAULT_MODELS = {
        "perplexity": "sonar-pro",
        "groq": "llama-3.1-8b-instant"  # Updated default to the fast instant model
    }
    
    def __init__(self, provider: str = "perplexity", api_key: Optional[str] = None, base_url: Optional[str] = None):
        """
        Initialize LLM service
        
        Args:
            provider: LLM provider ("perplexity" or "groq")
            api_key: API key (if not provided, will try to get from env)
            base_url: Base URL for the API (only needed for Perplexity)
        """
        self.provider = provider.lower()
        self.client = None
        self.api_key = None
        self.base_url = None
        
        if self.provider == "perplexity":
            self._init_perplexity(api_key, base_url)
        elif self.provider == "groq":
            self._init_groq(api_key)
        else:
            logger.error(f"Unsupported provider: {provider}. Supported providers: perplexity, groq")
    
    def _init_perplexity(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """Initialize Perplexity client"""
        self.api_key = api_key or os.getenv("PERPLEXITY_API_KEY")
        self.base_url = base_url or "https://api.perplexity.ai"
        
        if not self.api_key:
            logger.warning("PERPLEXITY_API_KEY not found in environment variables")
        elif OpenAI is None:
            logger.warning("OpenAI package not installed. Perplexity functionality disabled.")
        else:
            try:
                self.client = OpenAI(
                    api_key=self.api_key,
                    base_url=self.base_url
                )
                logger.info("LLM Service initialized with Perplexity API")
            except Exception as e:
                logger.error(f"Failed to initialize Perplexity client: {e}")
                self.client = None
    
    def _init_groq(self, api_key: Optional[str] = None):
        """Initialize Groq client"""
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        
        if not self.api_key:
            logger.warning("GROQ_API_KEY not found in environment variables")
        elif Groq is None:
            logger.warning("Groq package not installed. Groq functionality disabled.")
        else:
            try:
                self.client = Groq(api_key=self.api_key)
                logger.info("LLM Service initialized with Groq API")
            except Exception as e:
                logger.error(f"Failed to initialize Groq client: {e}")
                self.client = None
    
    def call_llm(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 500,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Make a call to the LLM API
        
        Args:
            system_prompt: System prompt for the LLM
            user_prompt: User prompt/message
            model: Model to use (provider-specific defaults)
            temperature: Temperature for response generation (0.0-1.0)
            max_tokens: Maximum tokens in response
            **kwargs: Additional parameters to pass to the API
            
        Returns:
            Dictionary with response and metadata
        """
        if not self.client:
            return {
                "status": "error",
                "response": "LLM service not available",
                "error": "No API key or client not initialized",
                "model": "none"
            }
        
        # Set default model based on provider
        if model is None:
            model = self.DEFAULT_MODELS.get(self.provider, "sonar-pro")
        
        try:
            if self.provider == "perplexity":
                return self._call_perplexity(system_prompt, user_prompt, model, temperature, max_tokens, **kwargs)
            elif self.provider == "groq":
                return self._call_groq(system_prompt, user_prompt, model, temperature, max_tokens, **kwargs)
            else:
                return {
                    "status": "error",
                    "response": "Unsupported provider",
                    "error": f"Provider {self.provider} not supported",
                    "model": model
                }
            
        except Exception as e:
            logger.error(f"Error calling LLM API: {e}")
            return {
                "status": "error",
                "response": "I apologize, but I'm having trouble processing your request.",
                "error": str(e),
                "model": model
            }
    
    def _call_perplexity(self, system_prompt: str, user_prompt: str, model: str, temperature: float, max_tokens: int, **kwargs) -> Dict[str, Any]:
        """Make a call to Perplexity API"""
        # Prepare messages
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # Prepare parameters
        params = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        # Add any additional parameters
        params.update(kwargs)
        
        # Make API call
        response = self.client.chat.completions.create(**params)
        
        response_text = response.choices[0].message.content.strip()
        
        return {
            "status": "success",
            "response": response_text,
            "model": model,
            "provider": "perplexity",
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else None,
                "completion_tokens": response.usage.completion_tokens if response.usage else None,
                "total_tokens": response.usage.total_tokens if response.usage else None
            }
        }
    
    def _call_groq(self, system_prompt: str, user_prompt: str, model: str, temperature: float, max_tokens: int, **kwargs) -> Dict[str, Any]:
        """Make a call to Groq API"""
        # Prepare messages
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # Prepare parameters
        params = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        # Add any additional parameters
        params.update(kwargs)
        
        # Make API call
        response = self.client.chat.completions.create(**params)
        
        response_text = response.choices[0].message.content.strip()
        
        return {
            "status": "success",
            "response": response_text,
            "model": model,
            "provider": "groq",
            "usage": {
                "prompt_tokens": response.usage.prompt_tokens if response.usage else None,
                "completion_tokens": response.usage.completion_tokens if response.usage else None,
                "total_tokens": response.usage.total_tokens if response.usage else None
            }
        }
    
    def call_llm_simple(
        self,
        prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 100
    ) -> Dict[str, Any]:
        """
        Simplified LLM call with just a single prompt (no system message)
        
        Args:
            prompt: The prompt to send to the LLM
            model: Model to use (provider-specific defaults)
            temperature: Temperature for response generation
            max_tokens: Maximum tokens in response
            
        Returns:
            Dictionary with response and metadata
        """
        return self.call_llm(
            system_prompt="You are a helpful assistant.",
            user_prompt=prompt,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens
        )
    
    def is_available(self) -> bool:
        """Check if LLM service is available"""
        return self.client is not None
    
    def get_status(self) -> Dict[str, Any]:
        """Get service status"""
        return {
            "available": self.is_available(),
            "provider": self.provider,
            "api_key_configured": bool(self.api_key),
            "client_initialized": self.client is not None,
            "base_url": self.base_url,
            "available_models": self.get_available_models()
        }
    
    def get_available_models(self) -> Dict[str, Any]:
        """Get available models for the current provider"""
        if self.provider == "groq":
            return self.GROQ_MODELS
        elif self.provider == "perplexity":
            return {
                "sonar-pro": {
                    "name": "Sonar Pro",
                    "description": "Perplexity's most capable model",
                    "max_tokens": 4096,
                    "recommended_for": "General purpose, high quality responses"
                },
                "sonar-small-online": {
                    "name": "Sonar Small Online",
                    "description": "Fast and efficient model",
                    "max_tokens": 4096,
                    "recommended_for": "Quick responses, real-time information"
                }
            }
        return {}
    
    def list_models(self) -> None:
        """Print available models for the current provider"""
        models = self.get_available_models()
        if not models:
            print(f"No models available for provider: {self.provider}")
            return
        
        print(f"\n=== Available {self.provider.title()} Models ===")
        for model_id, info in models.items():
            default_marker = " (DEFAULT)" if model_id == self.DEFAULT_MODELS.get(self.provider) else ""
            print(f"\n{model_id}{default_marker}:")
            print(f"  Name: {info['name']}")
            print(f"  Description: {info['description']}")
            print(f"  Max Tokens: {info['max_tokens']:,}")
            print(f"  Recommended for: {info['recommended_for']}")
        print()
    
    def validate_model(self, model: str) -> bool:
        """Validate if a model is available for the current provider"""
        models = self.get_available_models()
        return model in models


# Global instances for easy access
_perplexity_service = None
_groq_service = None


def get_llm_service(provider: str = "groq") -> LLMService:
    """
    Get the global LLM service instance
    
    Args:
        provider: LLM provider ("perplexity" or "groq")
        
    Returns:
        LLMService instance for the specified provider
    """
    global _perplexity_service, _groq_service
    
    if provider.lower() == "perplexity":
        if _perplexity_service is None:
            _perplexity_service = LLMService(provider="perplexity")
        return _perplexity_service
    elif provider.lower() == "groq":
        if _groq_service is None:
            _groq_service = LLMService(provider="groq")
        return _groq_service
    else:
        raise ValueError(f"Unsupported provider: {provider}. Supported providers: perplexity, groq")


def call_llm(
    system_prompt: str,
    user_prompt: str,
    provider: str = "groq",
    model: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: Optional[int] = None,
    **kwargs
) -> Dict[str, Any]:
    """
    Convenience function to call LLM directly
    
    Args:
        system_prompt: System prompt for the LLM
        user_prompt: User prompt/message
        provider: LLM provider ("perplexity" or "groq")
        model: Model to use (provider-specific defaults)
        temperature: Temperature for response generation
        max_tokens: Maximum tokens in response
        **kwargs: Additional parameters
        
    Returns:
        Dictionary with response and metadata
    """
    service = get_llm_service(provider)
    
    # Set default max_tokens based on model if not provided
    if max_tokens is None:
        models = service.get_available_models()
        if model and model in models:
            max_tokens = min(500, models[model]["max_tokens"])  # Use model's max or 500, whichever is smaller
        else:
            max_tokens = 500
    
    return service.call_llm(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
        **kwargs
    )


# Test function
def test_llm_service():
    """Test the LLM service"""
    print("=== Testing Multi-Modal LLM Service ===\n")
    
    # Test Groq
    print("--- Testing Groq ---")
    groq_service = LLMService(provider="groq")
    status = groq_service.get_status()
    print(f"Status: {status}")
    
    # List available Groq models
    groq_service.list_models()
    
    if groq_service.is_available():
        # Test with the new models
        test_models = ["llama-3.1-8b-instant", "gemma2-9b-it", "openai/gpt-oss-120b", "deepseek-r1-distill-llama-70b", "compound-beta"]
        
        for model in test_models:
            if groq_service.validate_model(model):
                print(f"\n--- Testing {model} ---")
                result = groq_service.call_llm_simple(
                    "What is 2+2?",
                    model=model,
                    temperature=0.1,
                    max_tokens=50
                )
                print(f"Response: {result['response']}")
                print(f"Model: {result['model']}")
                print(f"Provider: {result.get('provider', 'unknown')}")
            else:
                print(f"Model {model} not available")
    else:
        print("Groq service not available")
    
    print("\n--- Testing Perplexity ---")
    perplexity_service = LLMService(provider="perplexity")
    status = perplexity_service.get_status()
    print(f"Status: {status}")
    
    # List available Perplexity models
    perplexity_service.list_models()
    
    if perplexity_service.is_available():
        result = perplexity_service.call_llm_simple(
            "What is 2+2?",
            temperature=0.1,
            max_tokens=50
        )
        print(f"Response: {result['response']}")
        print(f"Model: {result['model']}")
        print(f"Provider: {result.get('provider', 'unknown')}")
    else:
        print("Perplexity service not available")
    
    print("\n--- Testing Convenience Functions ---")
    # Test convenience function with different Groq models
    for model in ["llama-3.1-8b-instant", "gemma2-9b-it"]:
        result = call_llm(
            system_prompt="You are a helpful assistant.",
            user_prompt="What is 2+2?",
            provider="groq",
            model=model,
            temperature=0.1,
            max_tokens=50
        )
        print(f"Groq {model} via convenience: {result['response']}")
    
    # Test convenience function with Perplexity
    result = call_llm(
        system_prompt="You are a helpful assistant.",
        user_prompt="What is 2+2?",
        provider="perplexity",
        temperature=0.1,
        max_tokens=50
    )
    print(f"Perplexity via convenience: {result['response']}")


def list_all_models():
    """List all available models for all providers"""
    print("=== All Available Models ===\n")
    
    # Test Groq models
    print("--- Groq Models ---")
    groq_service = LLMService(provider="groq")
    groq_service.list_models()
    
    # Test Perplexity models
    print("--- Perplexity Models ---")
    perplexity_service = LLMService(provider="perplexity")
    perplexity_service.list_models()


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--list-models":
        list_all_models()
    else:
        test_llm_service()
