"""
Voice Processing Module for JAI-Kissan Assistant

This module handles real-time speech processing including:
1. Audio transcription using ElevenLabs API
2. Hindi to English translation using ElevenLabs API
3. FastAPI endpoints for real-time processing

Author: JAI-Kissan Team
"""

import os
import logging
import asyncio
from typing import Optional, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

import requests
from fastapi import HTTPException, UploadFile, File
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def translate_to_hindi(text: str) -> str:
    """Translate English text to Hindi using Google Translate API"""
    try:
        # Using Google Translate API (free tier)
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "gtx",
            "sl": "en",
            "tl": "hi",
            "dt": "t",
            "q": text
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        # Extract translated text from response
        translated_parts = response.json()[0]
        translated_text = "".join([part[0] for part in translated_parts if part[0]])
        
        return translated_text
    except Exception as e:
        logger.error(f"Translation failed: {e}")
        return text  # Return original text if translation fails

# Pydantic models for API requests/responses
class SpeechProcessRequest(BaseModel):
    """Request model for speech processing"""
    audio_data: Optional[bytes] = None
    audio_file_path: Optional[str] = None

class SpeechProcessResponse(BaseModel):
    """Response model for speech processing"""
    success: bool
    transcribed_text: str
    translated_text: str
    confidence: Optional[float] = None
    processing_time: Optional[float] = None
    error: Optional[str] = None

class VoiceProcessor:
    """Main voice processing class for handling speech-to-text and translation"""
    
    def __init__(self, elevenlabs_api_key: str):
        """
        Initialize the voice processor
        
        Args:
            elevenlabs_api_key: API key for ElevenLabs services
        """
        self.elevenlabs_api_key = elevenlabs_api_key
        self.elevenlabs_stt_endpoint = "https://api.elevenlabs.io/v1/speech-to-text"
        # Note: ElevenLabs doesn't have a direct translation API, we'll use a fallback approach
        
        # Add session management to prevent caching issues
        self.session = requests.Session()
        self.session.headers.update({
            "xi-api-key": self.elevenlabs_api_key,
            "User-Agent": "JAI-Kissan-Voice-Processor/1.0"
        })
        
        logger.info("Initializing VoiceProcessor with ElevenLabs API")
        logger.info("✅ Voice processor initialized successfully!")
    
    def transcribe_audio(self, audio_data: bytes) -> tuple[str, str]:
        """
        Transcribe audio data using ElevenLabs API
        
        Args:
            audio_data: Raw audio bytes (WAV format recommended)
            
        Returns:
            Tuple of (transcribed_text, detected_language)
            
        Raises:
            RuntimeError: If transcription fails
            
        Note:
            ElevenLabs will auto-detect the language. We let it detect whatever language
            it finds and then use Google Translate to convert to English.
        """
        try:
            # Add cache-busting parameter to prevent API from using cached results
            import time
            cache_buster = int(time.time() * 1000)
            
            files = {
                "file": ("audio.wav", audio_data, "audio/wav")
            }
            
            data = {
                "model_id": "scribe_v1",
                "detect_language": True,  # Let ElevenLabs auto-detect language
                "timestamp": cache_buster  # Cache buster
            }

            logger.info("Sending audio to ElevenLabs for transcription...")
            logger.info(f"Request data: {data}")
            
            # Use session to prevent caching issues
            response = self.session.post(
                self.elevenlabs_stt_endpoint, 
                files=files, 
                data=data,
                timeout=30
            )

            logger.info(f"Response status: {response.status_code}")
            logger.info(f"Response headers: {dict(response.headers)}")

            if response.status_code == 200:
                json_response = response.json()
                logger.info(f"Full response: {json_response}")
                transcribed_text = json_response.get("text", "")
                detected_language = json_response.get("language", "unknown")
                logger.info(f"✅ Transcription successful: {transcribed_text[:50]}...")
                logger.info(f"🔍 Detected language: {detected_language}")
                
                # Return both transcribed text and detected language
                return transcribed_text, detected_language
            else:
                error_msg = f"ElevenLabs API error: {response.status_code} - {response.text}"
                logger.error(f"❌ {error_msg}")
                raise RuntimeError(error_msg)
                
        except requests.exceptions.Timeout:
            error_msg = "Transcription request timed out"
            logger.error(f"❌ {error_msg}")
            raise RuntimeError(error_msg)
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error during transcription: {str(e)}"
            logger.error(f"❌ {error_msg}")
            raise RuntimeError(error_msg)
        except Exception as e:
            error_msg = f"Unexpected error during transcription: {str(e)}"
            logger.error(f"❌ {error_msg}")
            raise RuntimeError(error_msg)
    
    def translate_to_english(self, text: str, detected_language: str = None) -> str:
        """
        Translate text to English using Google Translate API with auto-detection
        
        Args:
            text: Text to translate (can be in any language)
            detected_language: Optional detected language from transcription API
            
        Returns:
            Translated text in English
        """
        try:
            if not text.strip():
                logger.warning("Empty text provided for translation")
                return ""
            
            logger.info(f"Translating text: {text[:50]}...")
            logger.info(f"Detected language from transcription: {detected_language}")
            
            # Use Google Translate API (free and reliable)
            url = "https://translate.googleapis.com/translate_a/single"
            
            # Auto-detect source language if not provided or if we want to be safe
            source_lang = "auto"  # Let Google Translate auto-detect
            
            # If we have a detected language from transcription, we can use it as hint
            if detected_language and detected_language.lower() in ['hi', 'hindi', 'hi-in', 'ur', 'urdu', 'ur-pk']:
                # For Hindi/Urdu, we can be more specific
                if detected_language.lower() in ['hi', 'hindi', 'hi-in']:
                    source_lang = "hi"
                elif detected_language.lower() in ['ur', 'urdu', 'ur-pk']:
                    source_lang = "ur"
                logger.info(f"Using detected language: {source_lang}")
            else:
                logger.info("Using auto-detection for translation")
            
            params = {
                "client": "gtx",
                "sl": source_lang,  # Source language: auto-detect or detected
                "tl": "en",  # Target language: English
                "dt": "t",   # Translation type
                "q": text
            }
            
            logger.info("Sending text to Google Translate...")
            response = requests.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                # Parse the response (Google Translate returns a complex nested structure)
                translation_data = response.json()
                english_text = ""
                
                # Extract the translated text from the response
                if translation_data and len(translation_data) > 0:
                    for sentence_data in translation_data[0]:
                        if sentence_data[0]:  # The translated text
                            english_text += sentence_data[0]
                
                english_text = english_text.strip()
                logger.info(f"✅ Translation successful: {english_text[:50]}...")
                return english_text
            else:
                error_msg = f"Google Translate API error: {response.status_code} - {response.text}"
                logger.error(f"❌ {error_msg}")
                raise RuntimeError(error_msg)
                
        except requests.exceptions.Timeout:
            error_msg = "Translation request timed out"
            logger.error(f"❌ {error_msg}")
            raise RuntimeError(error_msg)
        except requests.exceptions.RequestException as e:
            error_msg = f"Network error during translation: {str(e)}"
            logger.error(f"❌ {error_msg}")
            raise RuntimeError(error_msg)
        except Exception as e:
            error_msg = f"Translation failed: {str(e)}"
            logger.error(f"❌ {error_msg}")
            raise RuntimeError(error_msg)
    
    def process_speech(self, audio_data: bytes) -> SpeechProcessResponse:
        """
        Complete speech processing pipeline: audio → Hindi text → English text
        
        Args:
            audio_data: Raw audio bytes
            
        Returns:
            SpeechProcessResponse with results
        """
        import time
        start_time = time.time()
        
        try:
            # Step 1: Transcribe audio to text (any language)
            transcribed_text, detected_language = self.transcribe_audio(audio_data)
            
            # Step 2: Translate to English (auto-detect source language)
            english_text = self.translate_to_english(transcribed_text, detected_language)
            
            processing_time = time.time() - start_time
            
            logger.info(f"🎉 Speech processing completed in {processing_time:.2f}s")
            
            return SpeechProcessResponse(
                success=True,
                transcribed_text=transcribed_text,
                translated_text=english_text,
                processing_time=processing_time
            )
            
        except Exception as e:
            processing_time = time.time() - start_time
            logger.error(f"❌ Speech processing failed after {processing_time:.2f}s: {str(e)}")
            
            return SpeechProcessResponse(
                success=False,
                transcribed_text="",
                translated_text="",
                processing_time=processing_time,
                error=str(e)
            )

# Global voice processor instance
_voice_processor: Optional[VoiceProcessor] = None

def get_voice_processor() -> VoiceProcessor:
    """Get or create the global voice processor instance"""
    global _voice_processor
    
    if _voice_processor is None:
        # Get API key from .env file
        elevenlabs_api_key = os.getenv("ELEVENLABS_API_KEY")
        if not elevenlabs_api_key:
            raise RuntimeError("ELEVENLABS_API_KEY not found in .env file. Please add ELEVENLABS_API_KEY=your_api_key to your .env file")
        
        _voice_processor = VoiceProcessor(elevenlabs_api_key)
    
    return _voice_processor

# FastAPI endpoint functions
async def process_speech_endpoint(audio_file: UploadFile = File(...)) -> SpeechProcessResponse:
    """
    FastAPI endpoint for processing speech audio
    
    Args:
        audio_file: Uploaded audio file (WAV format recommended)
        
    Returns:
        SpeechProcessResponse with transcription and translation results
    """
    try:
        # Validate file type
        if not audio_file.content_type.startswith('audio/'):
            raise HTTPException(
                status_code=400, 
                detail="File must be an audio file"
            )
        
        # Read audio data
        audio_data = await audio_file.read()
        
        if len(audio_data) == 0:
            raise HTTPException(
                status_code=400, 
                detail="Empty audio file"
            )
        
        # Process speech
        voice_processor = get_voice_processor()
        result = voice_processor.process_speech(audio_data)
        
        if not result.success:
            raise HTTPException(
                status_code=500, 
                detail=f"Speech processing failed: {result.error}"
            )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in speech endpoint: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Internal server error: {str(e)}"
        )

# Utility functions for testing
def test_voice_processing(audio_file_path: str) -> Dict[str, Any]:
    """
    Test function for voice processing pipeline
    
    Args:
        audio_file_path: Path to audio file for testing
        
    Returns:
        Dictionary with test results
    """
    try:
        # Read audio file
        with open(audio_file_path, "rb") as f:
            audio_data = f.read()
        
        # Process speech
        voice_processor = get_voice_processor()
        result = voice_processor.process_speech(audio_data)
        
        return {
            "success": result.success,
            "transcribed_text": result.transcribed_text,
            "translated_text": result.translated_text,
            "processing_time": result.processing_time,
            "error": result.error
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

if __name__ == '__main__':
    # Test the voice processing pipeline
    import sys
    
    if len(sys.argv) > 1:
        audio_file = sys.argv[1]
        print(f"Testing voice processing with file: {audio_file}")
        
        result = test_voice_processing(audio_file)
        
        if result["success"]:
            print(f"✅ Transcribed: {result['transcribed_text']}")
            print(f"✅ Translated: {result['translated_text']}")
            print(f"⏱️ Processing time: {result['processing_time']:.2f}s")
        else:
            print(f"❌ Error: {result['error']}")
    else:
        print("Usage: python voice.py <audio_file_path>")
        print("Example: python voice.py Processed_rec4.wav")


