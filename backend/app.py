#!/usr/bin/env python3
"""
FastAPI application for Agricultural Assistant with Integrated Workflow Engine
"""

import logging
from fastapi import FastAPI, HTTPException, Query, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import asyncio
import json
from datetime import datetime
import requests

# Import your existing AgriculturalAssistant from main.py
from main import AgriculturalAssistant

# Import voice processing module
from voice import process_speech_endpoint, SpeechProcessResponse, translate_to_hindi

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI
app = FastAPI(
    title="Bargarh Agricultural AI Assistant API",
    description="AI-powered agricultural assistant specifically designed for farmers in Bargarh district of Odisha, India with integrated workflow engine for complex queries",
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

# Pydantic models for request/response
class WeatherRequest(BaseModel):
    location: Optional[str] = "Bargarh,IN"

class ContextRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    include_weather: Optional[bool] = True

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5
    llm_provider: Optional[str] = "groq"  # NEW: Allow provider in request body
    llm_model: Optional[str] = None       # NEW: Allow model in request body

class QueryResponse(BaseModel):
    query: str
    response: str
    response_hindi: Optional[str] = None  # NEW: Hindi translation
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
    # NEW: Workflow information
    is_workflow: bool = False
    workflow_id: Optional[str] = None
    subtasks: Optional[List[Dict[str, Any]]] = None
    # NEW: Redirect flag for workflow queries
    redirect_to_workflow: bool = False

class WorkflowExecuteRequest(BaseModel):
    workflow_id: str
    subtask_index: int

class SubtaskResult(BaseModel):
    subtask_id: int
    completed: bool
    result: Dict[str, Any]
    error: Optional[str] = None

class WorkflowSummaryRequest(BaseModel):
    workflow_id: str

class WorkflowSummary(BaseModel):
    workflow_id: str
    summary: str
    summary_hindi: Optional[str] = None
    completed: bool
    error: Optional[str] = None

class WorkflowStatusResponse(BaseModel):
    workflow_id: str
    original_query: str
    status: str
    progress: int
    total_subtasks: int
    current_subtask: Optional[int]
    completed_subtasks: List[Dict[str, Any]]
    processing_time: float
    summary: Optional[str]
    error: Optional[str]

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
        "message": "Bargarh Agricultural AI Assistant API",
        "version": "2.0.0",
        "description": "Specialized AI assistant for farmers in Bargarh district, Odisha with integrated workflow engine",
        "docs": "/docs",
        "endpoints": {
            "query": "/query",
            "workflow": "/workflow",
            "workflow_stream": "/workflow/stream/{workflow_id}",
            "health": "/health",
            "intents": "/intents",
            "providers": "/providers",
            "models": "/models",
            "weather": "/weather/comprehensive",
            "workflow_status": "/workflow/{workflow_id}/status",
            "workflow_result": "/workflow/{workflow_id}/result",
            "workflow_cleanup": "/workflow/{workflow_id}"
        },
        "features": {
            "workflow_support": True,
            "sse_streaming": True
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
            message = "Bargarh Agricultural AI Assistant is running"
            # Get service information
            classifier_info = assistant.classifier.get_service_info()
            service_info = {
                "intent_classification": classifier_info,
                "retriever_available": hasattr(assistant, 'retriever'),
                "llm_client_available": hasattr(assistant, 'llm_client'),
                "workflow_engine": "integrated"
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
    Process agricultural query through AI pipeline with integrated workflow support
    
    Model selection priority:
    1. Query parameters (llm_provider, llm_model)
    2. Request body fields (llm_provider, llm_model)
    3. Default values
    
    Workflow detection is automatic based on query complexity.
    """
    try:
        global assistant
        
        # Determine final provider and model (query params override request body)
        final_provider = llm_provider or request.llm_provider or "groq"
        final_model = llm_model or request.llm_model or "gemma2-9b-it"
        
        # Use the global assistant instance for workflow state management
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        # Update the global assistant's LLM settings if different from current
        current_provider = assistant.llm_client.llm_service.provider if assistant.llm_client.llm_service else None
        if (current_provider != final_provider or 
            assistant.llm_client.model != final_model):
            # Create new assistant with updated settings
            assistant = AgriculturalAssistant(
                llm_provider=final_provider,
                llm_model=final_model
            )
        
        # First, classify the intent to check if it's a workflow query
        intent_result = await asyncio.to_thread(
            assistant.classifier.classify_intent,
            request.query
        )
        
        # If it's a workflow query, return subtasks immediately
        if intent_result.is_workflow:
            import uuid
            workflow_id = str(uuid.uuid4())
            
            # Store workflow state for later execution
            workflow_state = {
                "workflow_id": workflow_id,
                "original_query": request.query,
                "subtasks": intent_result.subtasks,
                "status": "initialized",
                "start_time": datetime.now(),
                "completed_subtasks": [],
                "current_subtask": 0,
                "summary": None,
                "completion_time": None
            }
            
            # Store in workflow manager
            assistant.workflow_manager.active_workflows[workflow_id] = workflow_state
            
            logger.info(f"Workflow {workflow_id} initialized with {len(intent_result.subtasks)} subtasks")
            
            # Translate response to Hindi
            response_text = "Complex query detected. Subtasks have been generated and are ready for execution."
            response_hindi = translate_to_hindi(response_text)
            
            return QueryResponse(
                query=request.query,
                response=response_text,
                response_hindi=response_hindi,
                intent=intent_result.intent.value,
                confidence=intent_result.confidence,
                crop=None,
                location=None,
                bucket_used="",
                context_count=0,
                processing_time=0.0,
                status="workflow_ready",
                is_workflow=True,
                workflow_id=workflow_id,
                subtasks=intent_result.subtasks,
                redirect_to_workflow=False
            )
        
        # Process regular query (only if not a workflow)
        result = await asyncio.to_thread(
            assistant.process_query, 
            request.query, 
            request.top_k
        )
        
        # Check for errors
        if result.get('status') == 'error':
            raise HTTPException(
                status_code=500, 
                detail=result.get('error', 'Unknown error')
            )
        
        # Check if no context was available (but allow weather API responses)
        if result.get('context_count', 0) == 0 and result.get('bucket_used') == '' and result.get('intent') != 'weather_insights':
            # This is not an error, just no data available for this intent
            result['response'] = f"I don't have specific data available for {result.get('intent', 'this type of query')} in Bargarh district. Please consult with local agricultural experts or visit the nearest Krishi Vigyan Kendra in Bargarh for assistance."
        
        # Add Hindi translation to the response
        response_text = result.get('response', '')
        if response_text:
            result['response_hindi'] = translate_to_hindi(response_text)
        
        return QueryResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in /query endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

@app.post("/workflow", response_model=QueryResponse)
async def start_workflow_endpoint(request: QueryRequest):
    """
    Start a new workflow for complex queries with real-time progress tracking
    """
    global assistant
    
    try:
        # Determine final provider and model
        final_provider = request.llm_provider or "groq"
        final_model = request.llm_model or "gemma2-9b-it"
        
        # Initialize assistant if needed
        if assistant is None:
            assistant = AgriculturalAssistant(
                llm_provider=final_provider,
                llm_model=final_model
            )
        
        # Update assistant settings if different
        current_provider = assistant.llm_client.llm_service.provider if assistant.llm_client.llm_service else None
        if (current_provider != final_provider or 
            assistant.llm_client.model != final_model):
            assistant = AgriculturalAssistant(
                llm_provider=final_provider,
                llm_model=final_model
            )
        
        # Classify intent to get subtasks
        intent_result = await asyncio.to_thread(
            assistant.classifier.classify_intent,
            request.query
        )
        
        if not intent_result.is_workflow:
            raise HTTPException(
                status_code=400,
                detail="This query is not complex enough for workflow processing"
            )
        
        # Generate workflow ID
        import uuid
        workflow_id = str(uuid.uuid4())
        
        # Initialize workflow state to match the expected structure
        workflow_state = {
            "original_query": request.query,
            "subtasks": intent_result.subtasks,
            "completed_subtasks": [],
            "current_subtask": None,
            "status": "processing",
            "progress": 0,
            "total_subtasks": len(intent_result.subtasks),
            "start_time": datetime.now(),
            "summary": None,
            "error": None,
            "completion_time": None
        }
        
        # Store workflow state
        assistant.workflow_manager.active_workflows[workflow_id] = workflow_state
        
        logger.info(f"Workflow {workflow_id} initialized with {len(intent_result.subtasks)} subtasks")
        logger.info(f"Active workflows after initialization: {list(assistant.workflow_manager.active_workflows.keys())}")
        logger.info(f"Connect to /workflow/stream/{workflow_id} to start processing")
        
        logger.info(f"Workflow {workflow_id} started with {len(intent_result.subtasks)} subtasks")
        
        return QueryResponse(
            query=request.query,
            response=f"Workflow started with {len(intent_result.subtasks)} subtasks. Use /workflow/{workflow_id}/status to track progress.",
            intent=intent_result.intent.value,
            confidence=intent_result.confidence,
            crop=None,
            location=None,
            bucket_used="",
            context_count=0,
            processing_time=0.0,
            status="workflow_started",
            is_workflow=True,
            workflow_id=workflow_id,
            subtasks=intent_result.subtasks,
            redirect_to_workflow=False
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in workflow endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error starting workflow: {str(e)}"
        )



@app.get("/workflow/{workflow_id}/status", response_model=WorkflowStatusResponse)
async def get_workflow_status(workflow_id: str):
    """
    Get current status of a workflow
    """
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        logger.info(f"Checking status for workflow {workflow_id}")
        logger.info(f"Active workflows: {list(assistant.workflow_manager.active_workflows.keys())}")
        
        # Check if workflow exists in active workflows
        if workflow_id not in assistant.workflow_manager.active_workflows:
            logger.error(f"Workflow {workflow_id} not found in active workflows")
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        status = assistant.workflow_manager.get_workflow_status(workflow_id)
        
        logger.info(f"Workflow {workflow_id} status response: {status}")
        
        if "error" in status:
            logger.error(f"Workflow {workflow_id} error: {status['error']}")
            raise HTTPException(status_code=404, detail=status["error"])
        
        logger.info(f"Workflow {workflow_id} status: {status['status']}, progress: {status['progress']}/{status['total_subtasks']}")
        return WorkflowStatusResponse(**status)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow status: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting workflow status: {str(e)}"
        )

@app.get("/workflow/{workflow_id}/result", response_model=QueryResponse)
async def get_workflow_result(workflow_id: str):
    """
    Get final result of a completed workflow
    """
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        result = assistant.workflow_manager.get_workflow_result(workflow_id)
        
        if "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        
        return QueryResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting workflow result: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error getting workflow result: {str(e)}"
        )

@app.delete("/workflow/{workflow_id}")
async def cleanup_workflow(workflow_id: str):
    """
    Clean up a completed workflow from memory
    """
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        # Check if workflow exists
        if workflow_id not in assistant.workflow_manager.active_workflows:
            return {"message": "Workflow not found or already cleaned up"}
        
        success = assistant.workflow_manager.cleanup_workflow(workflow_id)
        
        if success:
            return {"message": "Workflow cleaned up successfully"}
        else:
            return {"message": "Workflow not ready for cleanup yet (wait a few seconds)"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cleaning up workflow: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error cleaning up workflow: {str(e)}"
        )

@app.get("/workflow/stream/{workflow_id}")
async def stream_workflow_progress(workflow_id: str):
    """
    Stream workflow progress in real-time using Server-Sent Events (SSE)
    """
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        logger.info(f"SSE connection requested for workflow {workflow_id}")
        logger.info(f"Active workflows: {list(assistant.workflow_manager.active_workflows.keys())}")
        
        # Check if workflow exists
        if workflow_id not in assistant.workflow_manager.active_workflows:
            logger.error(f"Workflow {workflow_id} not found in active workflows")
            logger.error(f"Available workflows: {list(assistant.workflow_manager.active_workflows.keys())}")
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow = assistant.workflow_manager.active_workflows[workflow_id]
        logger.info(f"Found workflow {workflow_id}, starting SSE stream")
        
        async def event_stream():
            try:
                # Send initial subtask list
                yield f"data: {json.dumps({'type': 'subtasks', 'subtasks': workflow['subtasks']})}\n\n"
                
                # Process subtasks one by one and stream results
                subtask_results = []
                for i, subtask in enumerate(workflow['subtasks']):
                    logger.info(f"Processing subtask {i+1}/{len(workflow['subtasks'])}: {subtask['description']}")
                    
                    # Update current subtask
                    workflow["current_subtask"] = i + 1
                    
                    # Process subtask using the workflow manager
                    subtask_result = await asyncio.to_thread(
                        assistant.workflow_manager._process_subtask,
                        subtask, workflow['original_query'], 5  # top_k=5
                    )
                    subtask_results.append(subtask_result)
                    
                    # Update workflow state
                    workflow["completed_subtasks"].append(subtask_result)
                    workflow["progress"] = i + 1
                    
                    # Stream subtask completion
                    yield f"data: {json.dumps({'type': 'subtask_complete', 'subtask_id': i, 'result': subtask_result})}\n\n"
                    
                    # Add delay to make progress visible
                    await asyncio.sleep(3)
                
                # Generate final summary
                logger.info("Generating workflow summary...")
                summary = await asyncio.to_thread(
                    assistant.workflow_manager._generate_workflow_summary,
                    workflow['original_query'], subtask_results
                )
                
                # Update workflow state
                workflow["summary"] = summary
                workflow["status"] = "completed"
                workflow["completion_time"] = datetime.now()
                
                # Stream final summary
                yield f"data: {json.dumps({'type': 'summary', 'summary': summary})}\n\n"
                
                # Stream completion
                yield f"data: {json.dumps({'type': 'complete'})}\n\n"
                
                logger.info(f"Workflow {workflow_id} completed successfully")
                
            except Exception as e:
                logger.error(f"Error in workflow stream: {e}")
                # Update workflow state with error
                workflow["error"] = str(e)
                workflow["status"] = "error"
                
                # Stream error
                yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
        
        return StreamingResponse(event_stream(), media_type="text/plain")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting up workflow stream: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error setting up workflow stream: {str(e)}"
        )

@app.get("/intents")
async def get_supported_intents():
    """Get list of supported agricultural intents including workflow support"""
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
            "workflow_complex": "Complex queries requiring multi-step processing",
            "unknown": "Unrecognized or non-agricultural queries"
        }
        
        return {
            "intents": [
                {
                    "name": intent.value,
                    "description": intent_descriptions.get(intent.value, "No description available"),
                    "is_workflow": intent.value == "workflow_complex"
                }
                for intent in IntentType
            ],
            "total": len(IntentType),
            "workflow_support": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving intents: {str(e)}")

@app.get("/intent/{query}")
async def classify_intent(query: str):
    """Classify intent for a query with workflow detection"""
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        intent_result = assistant.classifier.classify_intent(query)
        return {
            "query": query,
            "intent": intent_result.intent.value,
            "confidence": intent_result.confidence,
            "crop": intent_result.crop,
            "location": intent_result.location,
            "model": intent_result.model,
            "provider": intent_result.provider,
            "is_workflow": intent_result.is_workflow,
            "subtasks": intent_result.subtasks
        }
    except Exception as e:
        logger.error(f"Error classifying intent: {e}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error classifying intent: {str(e)}"
        )

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
    """Process multiple queries in batch with workflow support"""
    try:
        global assistant
        
        if len(queries) > 10:  # Limit batch size
            raise HTTPException(status_code=400, detail="Maximum 10 queries per batch")
        
        # Use the global assistant instance
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        # Update the global assistant's LLM settings if different from current
        current_provider = assistant.llm_client.llm_service.provider if assistant.llm_client.llm_service else None
        if (current_provider != llm_provider or 
            assistant.llm_client.model != llm_model):
            # Create new assistant with updated settings
            assistant = AgriculturalAssistant(
                llm_provider=llm_provider,
                llm_model=llm_model
            )
        
        results = []
        for query in queries:
            try:
                result = await asyncio.to_thread(
                    assistant.process_query,
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

# Weather endpoints
@app.get("/weather/comprehensive")
async def get_comprehensive_weather():
    """
    Get comprehensive weather data for Bargarh district
    Includes: Current weather, 7-day forecast, and past 7 days history
    """
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        weather_data = assistant.retriever.get_comprehensive_weather_data()
        
        if not weather_data:
            raise HTTPException(
                status_code=404, 
                detail="No weather data available at the moment"
            )
        
        # Organize data by type
        organized_data = {
            "current_weather": None,
            "forecast": None,
            "historical": None,
            "total_documents": len(weather_data)
        }
        
        for data in weather_data:
            data_type = data.get('metadata', {}).get('data_type', 'unknown')
            
            if data_type == 'live_weather':
                organized_data['current_weather'] = data
            elif data_type == 'weather_forecast':
                organized_data['forecast'] = data
            elif data_type == 'weather_history':
                organized_data['historical'] = data
        
        return {
            "status": "success",
            "location": "Bargarh, Odisha",
            "data": organized_data,
            "message": "Comprehensive weather data retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error fetching comprehensive weather data: {e}")
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

@app.get("/weather/current")
async def get_current_weather():
    """Get current weather data for Bargarh district"""
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        current_weather = assistant.retriever.get_live_weather_data()
        
        if not current_weather:
            raise HTTPException(
                status_code=404, 
                detail="Current weather data not available"
            )
        
        return {
            "status": "success",
            "location": "Bargarh, Odisha",
            "data": current_weather,
            "message": "Current weather data retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error fetching current weather: {e}")
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

@app.get("/weather/forecast")
async def get_weather_forecast():
    """Get 7-day weather forecast for Bargarh district"""
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        forecast = assistant.retriever.get_weather_forecast()
        
        if not forecast:
            raise HTTPException(
                status_code=404, 
                detail="Weather forecast data not available"
            )
        
        return {
            "status": "success",
            "location": "Bargarh, Odisha",
            "data": forecast,
            "message": "7-day weather forecast retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error fetching weather forecast: {e}")
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

@app.get("/weather/historical")
async def get_historical_weather():
    """Get past 7 days weather history for Bargarh district"""
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        historical = assistant.retriever.get_historical_weather_data()
        
        if not historical:
            raise HTTPException(
                status_code=404, 
                detail="Historical weather data not available"
            )
        
        return {
            "status": "success",
            "location": "Bargarh, Odisha",
            "data": historical,
            "message": "Historical weather data retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error fetching historical weather: {e}")
        raise HTTPException(status_code=500, detail=f"Weather service error: {str(e)}")

# Context retrieval endpoint
@app.post("/query/context")
async def get_query_context(request: ContextRequest):
    """
    Get relevant context for a farming query
    Includes intent classification and context retrieval with optional weather data
    """
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        query = request.query.strip()
        if not query:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        # Classify intent
        intent_result = assistant.classifier.classify_intent(query)
        
        # Retrieve context
        context_result = assistant.retriever.retrieve_context(
            query=query,
            intent_result=intent_result,
            top_k=request.top_k
        )
        
        # Format response
        response = {
            "status": "success",
            "query": query,
            "intent": {
                "type": intent_result.intent.value,
                "confidence": intent_result.confidence,
                "crop": intent_result.crop,
                "location": intent_result.location,
                "is_workflow": intent_result.is_workflow,
                "subtasks": intent_result.subtasks
            },
            "context": {
                "total_results": context_result['total_results'],
                "bucket_used": context_result['bucket_used'],
                "documents": context_result['context']
            },
            "message": "Context retrieved successfully"
        }
        
        if context_result.get('error'):
            response['warning'] = context_result['error']
        
        return response
        
    except Exception as e:
        logger.error(f"Error getting query context: {e}")
        raise HTTPException(status_code=500, detail=f"Context retrieval error: {str(e)}")

# New workflow execution endpoints
@app.post("/workflow/execute", response_model=SubtaskResult)
async def execute_subtask(request: WorkflowExecuteRequest):
    """
    Execute a single subtask in a workflow
    """
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        workflow_id = request.workflow_id
        subtask_index = request.subtask_index
        
        # Check if workflow exists
        if workflow_id not in assistant.workflow_manager.active_workflows:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow = assistant.workflow_manager.active_workflows[workflow_id]
        
        # Check if subtask index is valid
        if subtask_index >= len(workflow["subtasks"]):
            raise HTTPException(status_code=400, detail="Invalid subtask index")
        
        # Execute the subtask
        logger.info(f"Executing subtask {subtask_index} for workflow {workflow_id}")
        
        # Get the subtask data
        subtask = workflow["subtasks"][subtask_index]
        original_query = workflow["original_query"]
        
        result = await asyncio.to_thread(
            assistant.workflow_manager._process_subtask,
            subtask,
            original_query,
            5  # top_k value
        )
        
        # Update workflow state
        workflow["completed_subtasks"].append(result)
        workflow["current_subtask"] = subtask_index + 1
        workflow["progress"] = (len(workflow["completed_subtasks"]) / len(workflow["subtasks"])) * 100
        
        logger.info(f"Subtask {subtask_index} completed for workflow {workflow_id}")
        
        return SubtaskResult(
            subtask_id=subtask_index,
            completed=True,
            result=result
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error executing subtask: {e}")
        raise HTTPException(status_code=500, detail=f"Error executing subtask: {str(e)}")

@app.post("/workflow/summary", response_model=WorkflowSummary)
async def generate_workflow_summary(request: WorkflowSummaryRequest):
    """
    Generate final summary for a completed workflow
    """
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        workflow_id = request.workflow_id
        
        # Check if workflow exists
        if workflow_id not in assistant.workflow_manager.active_workflows:
            raise HTTPException(status_code=404, detail="Workflow not found")
        
        workflow = assistant.workflow_manager.active_workflows[workflow_id]
        
        # Check if all subtasks are completed
        if len(workflow["completed_subtasks"]) != len(workflow["subtasks"]):
            raise HTTPException(status_code=400, detail="Not all subtasks are completed")
        
        # Generate summary
        logger.info(f"Generating summary for workflow {workflow_id}")
        
        original_query = workflow["original_query"]
        completed_subtasks = workflow["completed_subtasks"]
        
        summary = await asyncio.to_thread(
            assistant.workflow_manager._generate_workflow_summary,
            original_query,
            completed_subtasks
        )
        
        # Update workflow state
        workflow["summary"] = summary
        workflow["status"] = "completed"
        workflow["completion_time"] = datetime.now()
        
        # Translate summary to Hindi
        summary_hindi = translate_to_hindi(summary)
        
        logger.info(f"Summary generated for workflow {workflow_id}")
        
        return WorkflowSummary(
            workflow_id=workflow_id,
            summary=summary,
            summary_hindi=summary_hindi,
            completed=True
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating summary: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}")

@app.get("/weather/status")
async def check_weather_service_status():
    """Check if weather API service is working"""
    try:
        if assistant is None:
            raise HTTPException(status_code=503, detail="Assistant not initialized")
        
        # Try to fetch a small amount of data to test the service
        current_weather = assistant.retriever.get_live_weather_data()
        
        if current_weather:
            return {
                "status": "online",
                "service": "OpenWeatherMap API",
                "location": "Bargarh, Odisha", 
                "last_updated": current_weather.get('metadata', {}).get('timestamp'),
                "message": "Weather service is operational"
            }
        else:
            return {
                "status": "offline",
                "service": "OpenWeatherMap API",
                "message": "Weather service is currently unavailable"
            }
            
    except Exception as e:
        logger.error(f"Weather service check failed: {e}")
        return {
            "status": "error",
            "service": "OpenWeatherMap API",
            "error": str(e),
            "message": "Weather service check failed"
        }

# ============================================================================
# VOICE PROCESSING ENDPOINTS
# ============================================================================

@app.post("/voice/process", response_model=SpeechProcessResponse)
async def process_speech(audio_file: UploadFile = File(...)):
    """
    Process speech audio: Hindi speech → Hindi text → English text
    
    This endpoint accepts an audio file and returns:
    - Transcribed Hindi text
    - Translated English text
    - Processing time and confidence metrics
    
    Supported audio formats: WAV, MP3, M4A (WAV recommended for best results)
    """
    try:
        logger.info(f"Processing speech audio: {audio_file.filename}")
        
        # Use the imported endpoint function
        result = await process_speech_endpoint(audio_file)
        
        logger.info(f"Speech processing completed successfully")
        return result
        
    except Exception as e:
        logger.error(f"Speech processing failed: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Speech processing failed: {str(e)}"
        )



@app.get("/voice/status")
async def check_voice_service_status():
    """Check if voice processing services are working"""
    try:
        from voice import get_voice_processor
        
        # Try to get the voice processor (this will test API key loading)
        voice_processor = get_voice_processor()
        
        return {
            "status": "online",
            "services": {
                "transcription": "ElevenLabs API",
                "translation": "Google Translate API",
                "api_key_configured": bool(voice_processor.elevenlabs_api_key)
            },
            "message": "Voice processing services are operational"
        }
        
    except Exception as e:
        logger.error(f"Voice service check failed: {e}")
        return {
            "status": "error",
            "error": str(e),
            "message": "Voice processing services are unavailable"
        }

# ============================================================================
# END VOICE PROCESSING ENDPOINTS
# ============================================================================

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )