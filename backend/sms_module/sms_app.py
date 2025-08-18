"""
Simple SMS Webhook for Agricultural Assistant
Receives SMS queries, hits backend endpoint, and sends responses via SMS
"""

import os
import logging
import requests
from typing import Dict, Any
from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import Response
from twilio.twiml.messaging_response import MessagingResponse
from twilio.rest import Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="SMS Agricultural Assistant", version="1.0.0")

# Twilio configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# Backend configuration
BACKEND_URL = os.getenv("BACKEND_URL")
BACKEND_QUERY_ENDPOINT = f"{BACKEND_URL}/query"

# Initialize Twilio client
twilio_client = None
if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
    try:
        twilio_client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        logger.info("Twilio client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Twilio client: {e}")

def format_sms_response(response_text: str) -> str:
    """Format response for SMS (limit to 1000 characters)"""
    if not response_text:
        return "Sorry, I couldn't process your request. Please try again."
    
    # Clean and truncate response
    cleaned = response_text.strip()
    
    # Remove Twilio trial account message
    import re
    cleaned = re.sub(r'^Sent from your Twilio trial account\s*-\s*', '', cleaned)
    
    # Remove URLs (not useful in SMS)
    cleaned = re.sub(r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+', '', cleaned)
    
    # Remove extra whitespace
    cleaned = re.sub(r'\s+', ' ', cleaned)
    
    # Only truncate if REALLY long (over 1000 chars)
    if len(cleaned) > 1000:
        # Try to truncate at sentence boundary
        for i in range(1000, max(0, 1000 - 100), -1):
            if cleaned[i] in '.!?':
                cleaned = cleaned[:i+1]
                break
        else:
            # Fallback to word boundary
            for i in range(1000, max(0, 1000 - 50), -1):
                if cleaned[i] == ' ':
                    cleaned = cleaned[:i]
                    break
            else:
                cleaned = cleaned[:1000]
        
        cleaned += "..."
    
    return cleaned

def send_sms(to_number: str, message: str) -> bool:
    """Send SMS via Twilio"""
    if not twilio_client:
        logger.error("Twilio client not available")
        return False
    
    try:
        twilio_message = twilio_client.messages.create(
            body=message,
            from_=TWILIO_PHONE_NUMBER,
            to=to_number
        )
        logger.info(f"SMS sent successfully to {to_number}: {twilio_message.sid}")
        return True
    except Exception as e:
        logger.error(f"Failed to send SMS to {to_number}: {e}")
        return False

def query_backend(query: str) -> Dict[str, Any]:
    """Query the backend agricultural assistant with brief response prompt"""
    try:
        # Add brief response prompt for SMS - keep it very concise
        sms_query = f"Provide a very brief, direct answer for SMS (max 300 characters, no fluff): {query}"
        
        response = requests.post(
            BACKEND_QUERY_ENDPOINT,
            json={"query": sms_query},
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        
        # Add Hindi translation if response exists
        if 'response' in result and result['response']:
            from voice import translate_to_hindi
            result['response_hindi'] = translate_to_hindi(result['response'])
        
        return result
    except requests.exceptions.RequestException as e:
        logger.error(f"Backend query failed: {e}")
        return {"error": "Backend service unavailable"}

@app.post("/sms-webhook")
async def sms_webhook(
    Body: str = Form(...),
    From: str = Form(...),
    To: str = Form(...)
):
    """
    Handle incoming SMS webhook from Twilio
    
    Args:
        Body: User's message content
        From: User's phone number
        To: Twilio phone number
    """
    try:
        # Log incoming SMS
        logger.info(f"Received SMS from {From}: {Body}")
        
        # Validate input
        if not Body or not Body.strip():
            return Response(
                content=str(MessagingResponse().message("Please send a question about farming in Bargarh district.")),
                media_type="text/xml"
            )
        
        if not From:
            logger.error("No sender number provided")
            return Response(
                content=str(MessagingResponse().message("Error: No sender number.")),
                media_type="text/xml"
            )
        
        # Query backend
        logger.info(f"Querying backend: {Body}")
        backend_response = query_backend(Body.strip())
        
        # Extract response text
        if "error" in backend_response:
            response_text = "Sorry, the agricultural assistant is currently unavailable. Please try again later."
        else:
            response_text = backend_response.get("response", "Sorry, I couldn't process your request.")
        
        # Format for SMS
        sms_message = format_sms_response(response_text)
        
        # Send SMS response
        if send_sms(From, sms_message):
            # Return minimal TwiML response (actual response sent via SMS)
            return Response(
                content=str(MessagingResponse().message("Processing your query...")),
                media_type="text/xml"
            )
        else:
            # Fallback to TwiML response if SMS sending fails
            return Response(
                content=str(MessagingResponse().message(sms_message)),
                media_type="text/xml"
            )
        
    except Exception as e:
        logger.error(f"Error processing SMS webhook: {e}")
        return Response(
            content=str(MessagingResponse().message("Sorry, I encountered an error. Please try again.")),
            media_type="text/xml"
        )

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    status = {
        "status": "healthy",
        "twilio_configured": bool(twilio_client),
        "backend_url": BACKEND_QUERY_ENDPOINT
    }
    
    # Test backend connectivity
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        status["backend_healthy"] = response.status_code == 200
    except:
        status["backend_healthy"] = False
        status["status"] = "unhealthy"
    
    return status

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "SMS Agricultural Assistant",
        "endpoints": {
            "sms_webhook": "/sms-webhook",
            "health": "/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    
    # Validate configuration
    if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
        logger.error("Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.")
        exit(1)
    
    if not twilio_client:
        logger.error("Failed to initialize Twilio client")
        exit(1)
    
    logger.info(f"Starting SMS Agricultural Assistant")
    logger.info(f"Backend URL: {BACKEND_URL}")
    logger.info(f"Twilio Phone: {TWILIO_PHONE_NUMBER}")
    
    # Run the app
    port = int(os.getenv("PORT", 3000))
    uvicorn.run(app, host="0.0.0.0", port=port)
