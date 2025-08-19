# Use Python 3.12 slim image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create directory for ChromaDB persistence
RUN mkdir -p /app/agri_chromadb

# Create directory for data sources
RUN mkdir -p /app/data_sources

# Copy data sources (if they exist)
COPY data_sources/ /app/data_sources/

# Set environment variables
ENV PYTHONPATH=/app

# Create startup scripts
COPY init_db.py .
COPY startup.sh .
RUN chmod +x init_db.py startup.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the application with database initialization
CMD ["./startup.sh"]
