#!/usr/bin/env python3
"""
Database initialization script for JAI-KISSAN AI
This script initializes the ChromaDB with agricultural data if it hasn't been initialized yet.
"""

import os
import sys
import logging
from pathlib import Path

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_if_db_initialized():
    """Check if the database has been initialized by looking for collections"""
    try:
        from agri_vector_db import AgriculturalVectorDB
        
        # Initialize the database
        db = AgriculturalVectorDB()
        
        # Check if any collections exist
        collections = db.list_buckets()
        
        if collections:
            logger.info(f"Database already initialized with {len(collections)} collections: {collections}")
            return True
        else:
            logger.info("No collections found. Database needs initialization.")
            return False
            
    except Exception as e:
        logger.warning(f"Could not check database status: {e}")
        return False

def initialize_database():
    """Initialize the database with agricultural data"""
    try:
        from agri_vector_db import AgriculturalVectorDB
        
        logger.info("Starting database initialization...")
        
        # Initialize the database
        db = AgriculturalVectorDB()
        
        # Initialize default buckets and load data
        db.initialize_default_buckets()
        
        # Verify initialization
        collections = db.list_buckets()
        bucket_info = db.get_bucket_info()
        
        total_docs = sum(info['document_count'] for info in bucket_info.values())
        
        logger.info(f"Database initialization completed successfully!")
        logger.info(f"Created {len(collections)} collections: {collections}")
        logger.info(f"Total documents loaded: {total_docs}")
        
        return True
        
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        return False

def main():
    """Main initialization function"""
    logger.info("🚀 JAI-KISSAN AI Database Initialization")
    
    # Check if database is already initialized
    if check_if_db_initialized():
        logger.info("✅ Database is already initialized. Skipping initialization.")
        return True
    
    # Check if data sources exist
    data_sources_dir = Path("data_sources")
    if not data_sources_dir.exists():
        logger.warning("⚠️  Data sources directory not found. Creating empty database structure.")
        # Still initialize the database structure even without data
        try:
            from agri_vector_db import AgriculturalVectorDB
            db = AgriculturalVectorDB()
            db.initialize_default_buckets()
            logger.info("✅ Database structure created successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to create database structure: {e}")
            return False
    
    # Initialize database with data
    success = initialize_database()
    
    if success:
        logger.info("🎉 Database initialization completed successfully!")
        return True
    else:
        logger.error("❌ Database initialization failed!")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
