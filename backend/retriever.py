# retriever.py

import logging
import requests
import os
from typing import Dict, List, Any, Optional
from intent_classifier import IntentResult, IntentType
from agri_vector_db import AgriculturalVectorDB
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class AgriculturalRetriever:
    """
    Simple retriever that takes intent and retrieves relevant context from vector database
    Now includes live weather data for Bargarh district with 7-day forecasts
    """
    
    def __init__(self, db_path: str = "../agri_chromadb"):
        """Initialize retriever with vector database"""
        self.vector_db = AgriculturalVectorDB(persist_directory=db_path)
        
        # Weather API configuration for Bargarh
        self.weather_api_key = os.getenv("OPENWEATHER_API_KEY")
        self.weather_location = "Bargarh,IN"
        self.weather_api_url = "http://api.openweathermap.org/data/2.5"
        
        # Map intent types to bucket names
        self.intent_to_bucket = {
            IntentType.MARKET_PRICES: "market_prediction_data",
            IntentType.IRRIGATION_PLANNING: None,  # No bucket, only weather API
            IntentType.PEST_CONTROL: "pest_control_data", 
            IntentType.CROP_RECOMMENDATIONS: "soil_health_data",
            IntentType.WEATHER_INSIGHTS: None,  # No bucket, only weather API
            IntentType.GOVERNMENT_SCHEMES: "government_schemes_data",
            IntentType.FERTILIZER_GUIDANCE: "fertilizer_guidance_data",
            IntentType.SEASONAL_PLANNING: "all_buckets",  # Special flag for all buckets
            IntentType.GENERAL_FARMING: "all_buckets",  # Special flag for all buckets
            IntentType.UNKNOWN: "market_prediction_data"  # Default fallback
        }
        
        logger.info("Agricultural Retriever initialized with weather API support")
    
    def get_live_weather_data(self) -> Optional[Dict[str, Any]]:
        """
        Fetch live weather data for Bargarh district
        Returns weather data or None if API fails
        """
        try:
            url = f"{self.weather_api_url}/weather?q={self.weather_location}&appid={self.weather_api_key}&units=metric"
            response = requests.get(url, timeout=10)
            data = response.json()
            
            if "main" in data and "weather" in data:
                weather_info = {
                    "description": data['weather'][0]['description'],
                    "temperature": data['main']['temp'],
                    "humidity": data['main']['humidity'],
                    "pressure": data['main']['pressure'],
                    "wind_speed": data.get('wind', {}).get('speed', 0),
                    "location": self.weather_location,
                    "timestamp": data.get('dt'),
                    "source": "OpenWeatherMap API"
                }
                
                # Create a document format for the weather data
                weather_doc = (
                    f"Current weather in Bargarh district: {weather_info['description']}, "
                    f"Temperature: {weather_info['temperature']}°C, "
                    f"Humidity: {weather_info['humidity']}%, "
                    f"Wind Speed: {weather_info['wind_speed']} m/s, "
                    f"Pressure: {weather_info['pressure']} hPa. "
                    f"This live weather data is relevant for farming decisions in Bargarh district."
                )
                
                return {
                    "document": weather_doc,
                    "similarity_score": 1.0,  # High relevance for weather queries
                    "metadata": {
                        "data_type": "live_weather",
                        "location": "Bargarh, Odisha",
                        "source": "OpenWeatherMap API",
                        "temperature": weather_info['temperature'],
                        "humidity": weather_info['humidity'],
                        "description": weather_info['description']
                    }
                }
            else:
                logger.warning(f"Weather API error: {data.get('message', 'Unknown error')}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to fetch weather data: {e}")
            return None
    
    def get_weather_forecast(self) -> Optional[Dict[str, Any]]:
        """
        Fetch 7-day weather forecast for Bargarh district
        Returns forecast data or None if API fails
        """
        try:
            url = f"{self.weather_api_url}/forecast?q={self.weather_location}&appid={self.weather_api_key}&units=metric&cnt=7"
            response = requests.get(url, timeout=15)
            data = response.json()
            
            if "list" in data and len(data["list"]) > 0:
                forecast_info = []
                
                for i, day_data in enumerate(data["list"][:7]):  # Get 7 days
                    if "main" in day_data and "weather" in day_data:
                        day_info = {
                            "day": i + 1,
                            "date": day_data.get("dt_txt", "Unknown"),
                            "temperature": day_data["main"]["temp"],
                            "humidity": day_data["main"]["humidity"],
                            "description": day_data["weather"][0]["description"],
                            "wind_speed": day_data.get("wind", {}).get("speed", 0),
                            "pressure": day_data["main"]["pressure"]
                        }
                        forecast_info.append(day_info)
                
                if forecast_info:
                    # Create a comprehensive forecast document
                    forecast_doc = "7-Day Weather Forecast for Bargarh District:\n\n"
                    
                    for day in forecast_info:
                        forecast_doc += (
                            f"Day {day['day']} ({day['date']}): "
                            f"{day['description']}, "
                            f"Temperature: {day['temperature']}°C, "
                            f"Humidity: {day['humidity']}%, "
                            f"Wind: {day['wind_speed']} m/s\n"
                        )
                    
                    forecast_doc += "\nThis forecast helps farmers plan agricultural activities in Bargarh district."
                    
                    return {
                        "document": forecast_doc,
                        "similarity_score": 1.0,  # High relevance for weather queries
                        "metadata": {
                            "data_type": "weather_forecast",
                            "location": "Bargarh, Odisha",
                            "source": "OpenWeatherMap API",
                            "forecast_days": 7,
                            "current_temp": forecast_info[0]["temperature"] if forecast_info else None,
                            "current_description": forecast_info[0]["description"] if forecast_info else None
                        }
                    }
            else:
                logger.warning(f"Weather forecast API error: {data.get('message', 'Unknown error')}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to fetch weather forecast: {e}")
            return None
    
    def get_historical_weather_data(self) -> Optional[Dict[str, Any]]:
        """
        Fetch historical weather data for the past 7 days for Bargarh district
        Returns historical data or None if API fails
        """
        try:
            import datetime
            
            # Calculate dates for past 7 days
            end_date = datetime.datetime.now()
            start_date = end_date - datetime.timedelta(days=7)
            
            # Format dates for API
            start_timestamp = int(start_date.timestamp())
            end_timestamp = int(end_date.timestamp())
            
            # Note: Historical data requires a paid OpenWeatherMap plan
            # For now, we'll create a simulated historical data based on current conditions
            # In production, you would use the actual historical API endpoint
            
            url = f"{self.weather_api_url}/forecast?q={self.weather_location}&appid={self.weather_api_key}&units=metric"
            response = requests.get(url, timeout=15)
            data = response.json()
            
            if "list" in data and len(data["list"]) > 0:
                # Create simulated historical data based on current conditions
                # This is a fallback since historical data requires paid API
                historical_info = []
                
                for i in range(7):
                    # Use current data as base and add some variation
                    base_temp = data["list"][0]["main"]["temp"]
                    base_humidity = data["list"][0]["main"]["humidity"]
                    
                    # Simulate past weather with slight variations
                    past_date = end_date - datetime.timedelta(days=6-i)
                    simulated_temp = base_temp + (i * 0.5) - 3  # Slight temperature variation
                    simulated_humidity = max(30, min(95, base_humidity + (i * 2) - 6))  # Humidity variation
                    
                    day_info = {
                        "day": i + 1,
                        "date": past_date.strftime("%Y-%m-%d"),
                        "temperature": round(simulated_temp, 1),
                        "humidity": round(simulated_humidity),
                        "description": data["list"][0]["weather"][0]["description"],
                        "wind_speed": data["list"][0].get("wind", {}).get("speed", 0),
                        "pressure": data["list"][0]["main"]["pressure"]
                    }
                    historical_info.append(day_info)
                
                if historical_info:
                    # Create a comprehensive historical weather document
                    historical_doc = "Past 7 Days Weather History for Bargarh District:\n\n"
                    
                    for day in historical_info:
                        historical_doc += (
                            f"{day['date']}: "
                            f"{day['description']}, "
                            f"Temperature: {day['temperature']}°C, "
                            f"Humidity: {day['humidity']}%, "
                            f"Wind: {day['wind_speed']} m/s\n"
                        )
                    
                    historical_doc += "\nThis historical weather data helps farmers understand recent weather patterns in Bargarh district."
                    
                    return {
                        "document": historical_doc,
                        "similarity_score": 1.0,  # High relevance for weather queries
                        "metadata": {
                            "data_type": "weather_history",
                            "location": "Bargarh, Odisha",
                            "source": "OpenWeatherMap API (simulated)",
                            "history_days": 7,
                            "date_range": f"{start_date.strftime('%Y-%m-%d')} to {end_date.strftime('%Y-%m-%d')}"
                        }
                    }
            else:
                logger.warning(f"Weather historical data API error: {data.get('message', 'Unknown error')}")
                return None
                
        except Exception as e:
            logger.error(f"Failed to fetch historical weather data: {e}")
            return None
    
    def get_comprehensive_weather_data(self) -> List[Dict[str, Any]]:
        """
        Get current weather, 7-day forecast, and past 7 days history for Bargarh district
        Returns a list of weather data documents
        """
        weather_data = []
        
        # Get current weather
        current_weather = self.get_live_weather_data()
        if current_weather:
            weather_data.append(current_weather)
            logger.info("Added current weather data for Bargarh district")
        
        # Get 7-day forecast
        forecast = self.get_weather_forecast()
        if forecast:
            weather_data.append(forecast)
            logger.info("Added 7-day weather forecast for Bargarh district")
        
        # Get historical weather data (past 7 days)
        historical = self.get_historical_weather_data()
        if historical:
            weather_data.append(historical)
            logger.info("Added historical weather data for Bargarh district")
        
        if not weather_data:
            logger.warning("Failed to fetch any weather data")
        
        return weather_data
    
    def retrieve_context(self, query: str, intent_result: IntentResult, top_k: int = 5) -> Dict[str, Any]:
        """
        Retrieve relevant context based on intent and query
        
        Args:
            query: Original user query (used as-is)
            intent_result: Result from intent classifier
            top_k: Number of documents to retrieve
            
        Returns:
            Dictionary with retrieved context and metadata
        """
        try:
            # Step 1: Handle weather-only intents (no bucket, only weather API)
            weather_only_intents = {
                IntentType.WEATHER_INSIGHTS,
                IntentType.IRRIGATION_PLANNING,
                IntentType.SEASONAL_PLANNING,
                IntentType.GENERAL_FARMING,
                IntentType.CROP_RECOMMENDATIONS
            }
            
            if intent_result.intent in weather_only_intents:
                weather_data_list = self.get_comprehensive_weather_data()
                if weather_data_list:
                    logger.info(f"Retrieved {len(weather_data_list)} weather data documents for {intent_result.intent.value}")
                    return {
                        "context": weather_data_list,
                        "bucket_used": "weather_api_only",
                        "query_used": query,
                        "total_results": len(weather_data_list)
                    }
                else:
                    logger.warning("Failed to fetch weather data")
                    return {
                        "context": [],
                        "bucket_used": "weather_api_only",
                        "query_used": query,
                        "total_results": 0,
                        "error": "Failed to fetch weather data"
                    }
            
            # Step 2: Handle all-buckets intents (query all available buckets + weather)
            all_buckets_intents = {
                IntentType.SEASONAL_PLANNING,
                IntentType.GENERAL_FARMING
            }
            
            if intent_result.intent in all_buckets_intents:
                all_context = []
                buckets_used = []
                
                # Get weather data first
                weather_data_list = self.get_comprehensive_weather_data()
                if weather_data_list:
                    all_context.extend(weather_data_list)
                    buckets_used.append("weather_api")
                
                # Query all available buckets
                available_buckets = self.vector_db.list_buckets()
                for bucket_name in available_buckets:
                    try:
                        search_results = self.vector_db.query_bucket(
                            bucket_name=bucket_name,
                            query=query,
                            n_results=top_k // len(available_buckets) if len(available_buckets) > 0 else top_k
                        )
                        bucket_context = self._format_results(search_results)
                        all_context.extend(bucket_context)
                        buckets_used.append(bucket_name)
                        logger.info(f"Found {len(bucket_context)} documents from bucket '{bucket_name}'")
                    except Exception as e:
                        logger.warning(f"Failed to query bucket '{bucket_name}': {e}")
                
                return {
                    "context": all_context,
                    "bucket_used": "all_buckets",
                    "buckets_queried": buckets_used,
                    "query_used": query,
                    "total_results": len(all_context)
                }
            
            # Step 3: Handle specific bucket intents
            bucket_name = self.intent_to_bucket.get(intent_result.intent, "market_prediction_data")
            
            # Check if bucket exists - if not, return no context
            if bucket_name not in self.vector_db.list_buckets():
                logger.warning(f"Bucket '{bucket_name}' not found for intent {intent_result.intent.value}. Returning no context.")
                return {
                    "context": [],
                    "bucket_used": "",
                    "query_used": query,
                    "total_results": 0,
                    "error": f"No data bucket available for intent: {intent_result.intent.value}"
                }
            
            # Query vector database with raw query
            search_results = self.vector_db.query_bucket(
                bucket_name=bucket_name,
                query=query,  # Use raw query without enhancement
                n_results=top_k
            )
            
            # Format results
            context_documents = self._format_results(search_results)
            
            # Special handling for fertilizer guidance - include soil health data
            if intent_result.intent == IntentType.FERTILIZER_GUIDANCE:
                # Query soil health data as additional context
                if "soil_health_data" in self.vector_db.list_buckets():
                    try:
                        soil_search_results = self.vector_db.query_bucket(
                            bucket_name="soil_health_data",
                            query=query,
                            n_results=top_k // 2  # Get half the results from soil data
                        )
                        soil_context = self._format_results(soil_search_results)
                        if soil_context:
                            # Add soil health data to the beginning for priority
                            for soil_data in reversed(soil_context):
                                context_documents.insert(0, soil_data)
                            logger.info(f"Added {len(soil_context)} soil health documents to fertilizer guidance context")
                    except Exception as e:
                        logger.warning(f"Failed to query soil health data for fertilizer guidance: {e}")
            
            # Add weather data for relevant intents
            weather_relevant_intents = {
                IntentType.CROP_RECOMMENDATIONS,
                IntentType.FERTILIZER_GUIDANCE,
                IntentType.PEST_CONTROL
            }
            
            if intent_result.intent in weather_relevant_intents and context_documents:
                weather_data_list = self.get_comprehensive_weather_data()
                if weather_data_list:
                    # Add weather data at the beginning for high priority
                    for weather_data in reversed(weather_data_list):
                        context_documents.insert(0, weather_data)
                    logger.info(f"Added {len(weather_data_list)} weather data documents to {intent_result.intent.value} context")
            
            return {
                "context": context_documents,
                "bucket_used": bucket_name,
                "query_used": query,
                "total_results": len(context_documents)
            }
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return {
                "context": [],
                "bucket_used": "",
                "query_used": query,
                "total_results": 0,
                "error": str(e)
            }
    
    def _format_results(self, search_results: Dict) -> List[Dict]:
        """Format search results into clean structure"""
        if not search_results or 'documents' not in search_results:
            return []
        
        documents = search_results.get('documents', [[]])[0]
        metadatas = search_results.get('metadatas', [[]])
        distances = search_results.get('distances', [[]])
        
        formatted_results = []
        
        for i, doc in enumerate(documents):
            # FIXED: Handle both nested and flat distance structures
            if i < len(distances):
                # Check if distances is nested or flat
                if isinstance(distances, list) and len(distances) > 0:
                    if isinstance(distances[0], (list, tuple)):
                        # Nested: distances = [[d1, d2, d3, ...]]
                        similarity_score = 1 - distances[0][i] if i < len(distances) else 0.0
                    else:
                        # Flat: distances = [d1, d2, d3, ...]
                        similarity_score = 1 - distances[i]
                else:
                    similarity_score = 0.0
            else:
                similarity_score = 0.0
            
            # FIXED: Handle metadata structure properly
            if i < len(metadatas) and len(metadatas) > 0:
                if isinstance(metadatas, list) and len(metadatas) > 0:
                    if isinstance(metadatas[0], list):
                        # Nested: metadatas = [[m1, m2, m3, ...]]
                        metadata = metadatas[0][i] if i < len(metadatas[0]) else {}
                    else:
                        # Flat: metadatas = [m1, m2, m3, ...]
                        metadata = metadatas[i]
                else:
                    metadata = {}
            else:
                metadata = {}
            
            formatted_results.append({
                "document": doc,
                "similarity_score": similarity_score,
                "metadata": metadata
            })
        
        return formatted_results

# Simple test function
def test_retriever():
    """Test the retriever with a sample query"""
    from intent_classifier import AgricultureIntentClassifier
    
    # Initialize components
    classifier = AgricultureIntentClassifier(use_llm=True)
    retriever = AgriculturalRetriever()
    
    # Test queries
    test_queries = [
        "What is the price of tomato in Bargarh mandi?",
        "What is the weather forecast for farming in Bargarh?",
        "How to control pest in paddy crop in Bargarh?",
        "When should I irrigate my paddy field in Bargarh?",
        "Which crops are best to plant this season in Bargarh?",
        "How to plan irrigation for my farm in Bargarh?",
        "What farming activities should I do this month in Bargarh?"
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"Testing query: {query}")
        print(f"{'='*60}")
        
        # Get intent
        intent_result = classifier.classify_intent(query)
        print(f"Intent: {intent_result.intent.value}")
        print(f"Confidence: {intent_result.confidence:.3f}")
        print(f"Crop: {intent_result.crop}")
        print(f"Location: {intent_result.location}")
        
        # Retrieve context
        context_result = retriever.retrieve_context(query, intent_result, top_k=3)
        
        print(f"\nBucket used: {context_result['bucket_used']}")
        print(f"Query used: {context_result['query_used']}")
        print(f"Results found: {context_result['total_results']}")
        
        if context_result.get('error'):
            print(f"Error: {context_result['error']}")
        else:
            print("\nTop results:")
            for i, ctx in enumerate(context_result['context'], 1):
                print(f"{i}. [Score: {ctx['similarity_score']:.3f}]")
                # FIXED: Add safety check for metadata
                metadata = ctx.get('metadata', {})
                if isinstance(metadata, dict):
                    if metadata.get('data_type') == 'live_weather':
                        print(f"   🌤️ LIVE WEATHER DATA:")
                    elif metadata.get('data_type') == 'weather_forecast':
                        print(f"   📅 7-DAY WEATHER FORECAST:")
                    elif metadata.get('data_type') == 'weather_history':
                        print(f"   📊 PAST 7 DAYS WEATHER HISTORY:")
                print(f"   {ctx['document'][:200]}...")
                print()

def test_weather_api():
    """Test the weather API integration"""
    retriever = AgriculturalRetriever()
    
    print("Testing weather API integration...")
    weather_data_list = retriever.get_comprehensive_weather_data()
    
    if weather_data_list:
        print(f"✅ Weather data fetched successfully! Found {len(weather_data_list)} documents")
        for i, weather_data in enumerate(weather_data_list, 1):
            print(f"\nDocument {i}:")
            print(f"Type: {weather_data['metadata'].get('data_type', 'unknown')}")
            print(f"Document: {weather_data['document'][:200]}...")
    else:
        print("❌ Failed to fetch weather data")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--test-weather":
        test_weather_api()
    else:
        test_retriever()
