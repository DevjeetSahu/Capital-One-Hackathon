# app.py

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict
import logging
import asyncio
from datetime import datetime

# Import your existing AgriculturalAssistant from main.py
from main import AgriculturalAssistant

# Initialize FastAPI
app = FastAPI(
    title="Agricultural AI Assistant API",
    description="AI-powered agricultural assistant for farmers with flexible model selection",
    version="2.0.0"
)

# Add CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global assistant instance
assistant = None

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    llm_provider: Optional[str] = "groq"  # NEW: Allow provider in request body
    llm_model: Optional[str] = None       # NEW: Allow model in request body

class QueryResponse(BaseModel):
    query: str
    response: str
    intent: str
    confidence: float
    crop: Optional[str]
    location: Optional[str]
    bucket_used: str
    context_count: int
    processing_time: float
    status: str
    # NEW: Model and provider information
    intent_model: Optional[str] = None
    intent_provider: Optional[str] = None
    llm_model: Optional[str] = None
    llm_provider: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    message: str
    service_info: Optional[Dict] = None

class ModelInfo(BaseModel):
    name: str
    description: str
    max_tokens: int
    recommended_for: str

class ProvidersResponse(BaseModel):
    providers: List[str]
    default_provider: str
    models: Dict[str, Dict[str, ModelInfo]]

# Startup event
@app.on_event("startup")
def startup_event():
    """Initialize the assistant with default settings on startup"""
    global assistant
    try:
        assistant = AgriculturalAssistant()
        logging.info("Agricultural Assistant API started successfully")
    except Exception as e:
        logging.error(f"Failed to initialize assistant: {e}")

# API Endpoints
@app.get("/", response_model=dict)
async def root():
    """Welcome endpoint with API information"""
    return {
        "message": "Agricultural AI Assistant API",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": {
            "query": "/query",
            "health": "/health",
            "intents": "/intents",
            "providers": "/providers",
            "models": "/models"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        # Test assistant availability
        if assistant is None:
            status = "degraded"
            message = "Assistant not initialized"
            service_info = None
        else:
            status = "healthy"
            message = "Agricultural AI Assistant is running"
            # Get service information
            classifier_info = assistant.classifier.get_service_info()
            service_info = {
                "intent_classification": classifier_info,
                "retriever_available": hasattr(assistant, 'retriever'),
                "llm_client_available": hasattr(assistant, 'llm_client')
            }
        
        return HealthResponse(
            status=status,
            timestamp=datetime.now().isoformat(),
            message=message,
            service_info=service_info
        )
    except Exception as e:
        return HealthResponse(
            status="error",
            timestamp=datetime.now().isoformat(),
            message=f"Health check failed: {str(e)}"
        )

@app.post("/query", response_model=QueryResponse)
async def process_query_endpoint(
    request: QueryRequest,
    # Query parameters (alternative to request body)
    llm_provider: Optional[str] = Query(None, description="LLM provider (groq or perplexity)"),
    llm_model: Optional[str] = Query(None, description="Specific LLM model to use")
):
    """
    Process agricultural query through AI pipeline with flexible model selection
    
    Model selection priority:
    1. Query parameters (llm_provider, llm_model)
    2. Request body fields (llm_provider, llm_model)
    3. Default values
    """
    try:
        # Determine final provider and model (query params override request body)
        final_provider = llm_provider or request.llm_provider or "groq"
        final_model = llm_model or request.llm_model or "llama-3.1-8b-instant"
        
        # Initialize assistant with selected provider and model
        temp_assistant = AgriculturalAssistant(
            llm_provider=final_provider,
            llm_model=final_model
        )
        
        # Use asyncio.to_thread to run synchronous function asynchronously
        result = await asyncio.to_thread(
            temp_assistant.process_query, 
            request.query, 
            request.top_k
        )
        
        # Check for errors
        if result.get('status') == 'error':
            raise HTTPException(
                status_code=500, 
                detail=result.get('error', 'Unknown error')
            )
        
        return QueryResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in /query endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

@app.get("/intents")
async def get_supported_intents():
    """Get list of supported agricultural intents"""
    try:
        from intent_classifier import IntentType
        
        intent_descriptions = {
            "market_prices": "Questions about crop prices, rates, market values",
            "irrigation_planning": "Questions about watering and irrigation systems",
            "pest_control": "Questions about pests, diseases, and plant protection",
            "crop_recommendations": "Questions about crop selection and varieties",
            "weather_insights": "Questions about weather and climate conditions",
            "government_schemes": "Questions about subsidies and government support",
            "fertilizer_guidance": "Questions about fertilizers and soil nutrition",
            "seasonal_planning": "Questions about planting and harvest timing",
            "general_farming": "General farming advice and cultivation practices",
            "unknown": "Unrecognized or non-agricultural queries"
        }
        
        return {
            "intents": [
                {
                    "name": intent.value,
                    "description": intent_descriptions.get(intent.value, "No description available")
                }
                for intent in IntentType
            ],
            "total": len(IntentType)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving intents: {str(e)}")

@app.get("/providers", response_model=ProvidersResponse)
async def get_providers_and_models():
    """Get available LLM providers and their models"""
    try:
        from llm_service import LLMService
        
        # Get Groq models
        groq_service = LLMService(provider="groq")
        groq_models = groq_service.get_available_models()
        
        # Get Perplexity models  
        perplexity_service = LLMService(provider="perplexity")
        perplexity_models = perplexity_service.get_available_models()
        
        # Format model information
        formatted_models = {
            "groq": {
                model_id: ModelInfo(
                    name=info["name"],
                    description=info["description"],
                    max_tokens=info["max_tokens"],
                    recommended_for=info["recommended_for"]
                )
                for model_id, info in groq_models.items()
            },
            "perplexity": {
                model_id: ModelInfo(
                    name=info["name"],
                    description=info["description"],
                    max_tokens=info["max_tokens"],
                    recommended_for=info["recommended_for"]
                )
                for model_id, info in perplexity_models.items()
            }
        }
        
        return ProvidersResponse(
            providers=["groq", "perplexity"],
            default_provider="groq",
            models=formatted_models
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving providers: {str(e)}")

@app.get("/models/{provider}")
async def get_models_for_provider(provider: str):
    """Get available models for a specific provider"""
    try:
        if provider not in ["groq", "perplexity"]:
            raise HTTPException(status_code=400, detail="Provider must be 'groq' or 'perplexity'")
        
        from llm_service import LLMService
        service = LLMService(provider=provider)
        models = service.get_available_models()
        
        return {
            "provider": provider,
            "models": models,
            "total": len(models)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving models for {provider}: {str(e)}")

@app.post("/query/batch")
async def process_batch_queries(
    queries: List[str],
    llm_provider: Optional[str] = Query("groq", description="LLM provider"),
    llm_model: Optional[str] = Query("llama-3.1-8b-instant", description="Specific LLM model"),
    top_k: Optional[int] = Query(5, description="Number of context documents")
):
    """Process multiple queries in batch"""
    try:
        if len(queries) > 10:  # Limit batch size
            raise HTTPException(status_code=400, detail="Maximum 10 queries per batch")
        
        # Initialize assistant with selected provider and model
        temp_assistant = AgriculturalAssistant(
            llm_provider=llm_provider,
            llm_model=llm_model
        )
        
        results = []
        for query in queries:
            try:
                result = await asyncio.to_thread(
                    temp_assistant.process_query,
                    query,
                    top_k
                )
                results.append(result)
            except Exception as e:
                results.append({
                    "query": query,
                    "status": "error",
                    "error": str(e)
                })
        
        return {
            "results": results,
            "total_processed": len(results),
            "provider_used": llm_provider,
            "model_used": llm_model
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch processing error: {str(e)}")

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
