# fastapi_app.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import logging
import asyncio
from datetime import datetime

# Import your existing AgriculturalAssistant from main.py
from main import AgriculturalAssistant

# Initialize FastAPI
app = FastAPI(
    title="Agricultural AI Assistant API",
    description="AI-powered agricultural assistant for farmers",
    version="1.0.0"
)

# Add CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize your assistant
assistant = AgriculturalAssistant()

# Pydantic models
class QueryRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

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

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    message: str

# API Endpoints
@app.get("/", response_model=dict)
async def root():
    """Welcome endpoint"""
    return {
        "message": "Agricultural AI Assistant API",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        message="Agricultural AI Assistant is running"
    )

@app.post("/query", response_model=QueryResponse)
async def process_query_endpoint(request: QueryRequest):
    """
    Process agricultural query through AI pipeline
    """
    try:
        # Use asyncio.to_thread to run synchronous function asynchronously
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
        
        return QueryResponse(**result)
        
    except Exception as e:
        logging.error(f"Error in /query endpoint: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )

@app.get("/intents")
async def get_supported_intents():
    """Get list of supported intents"""
    from intent_classifier import IntentType
    return {
        "intents": [intent.value for intent in IntentType],
        "total": len(IntentType)
    }

# Run the server
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
