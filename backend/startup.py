#!/usr/bin/env python3
"""
Startup script for JAI-Kissan Backend on Railway
Initializes the vector database and starts the FastAPI server
"""

import os
import sys
import logging
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def initialize_vector_db():
    """Initialize the vector database with agricultural data"""
    try:
        logger.info("🚀 Initializing vector database...")
        
        # Import after path setup
        from agri_vector_db import initialize_default_buckets
        
        # Initialize the vector database
        initialize_default_buckets()
        
        logger.info("✅ Vector database initialized successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize vector database: {str(e)}")
        return False

def main():
    """Main startup function"""
    logger.info("🌾 Starting JAI-Kissan Backend...")
    
    # Check if we're in production mode (Railway sets PORT environment variable)
    is_production = os.getenv("PORT") is not None
    
    if is_production:
        logger.info("🏭 Running in Railway production mode")
        
        # Initialize vector database
        if not initialize_vector_db():
            logger.error("Failed to initialize vector database. Exiting...")
            sys.exit(1)
    else:
        logger.info("🛠️ Running in development mode")
    
    logger.info("✅ Startup complete!")

if __name__ == "__main__":
    main()
