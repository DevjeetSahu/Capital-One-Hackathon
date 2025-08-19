#!/bin/bash

# JAI-KISSAN AI Startup Script
# This script initializes the database and starts the FastAPI application

set -e  # Exit on any error

echo "🚀 Starting JAI-KISSAN AI..."

# Function to print colored output
print_status() {
    echo -e "\033[0;32m[INFO]\033[0m $1"
}

print_warning() {
    echo -e "\033[1;33m[WARNING]\033[0m $1"
}

print_error() {
    echo -e "\033[0;31m[ERROR]\033[0m $1"
}

# Check if we're in the correct directory
if [ ! -f "app.py" ]; then
    print_error "app.py not found. Please run this script from the backend directory."
    exit 1
fi

# Initialize database
print_status "Initializing database..."
if python init_db.py; then
    print_status "✅ Database initialization completed successfully!"
else
    print_warning "⚠️  Database initialization had issues, but continuing..."
fi

# Check if database is accessible
print_status "Verifying database connectivity..."
if python -c "from agri_vector_db import AgriculturalVectorDB; db = AgriculturalVectorDB(); print(f'Database accessible. Collections: {db.list_buckets()}')"; then
    print_status "✅ Database connectivity verified!"
else
    print_warning "⚠️  Database connectivity check failed, but continuing..."
fi

# Start the FastAPI application
print_status "Starting FastAPI application..."
exec uvicorn app:app --host 0.0.0.0 --port 8080
