# irrigation_indexer.py
import pandas as pd
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
import requests
from datetime import datetime, timedelta
import json
from tqdm import tqdm

class IrrigationIndexer:
    def __init__(self):
        self.CHROMA_PATH = "chroma_data/"
        self.COLLECTION_NAME = "irrigation_data"
        self.MODEL_NAME = "all-MiniLM-L6-v2"
        
    def create_irrigation_knowledge_base(self):
        """Create comprehensive irrigation knowledge base"""
        
        # Base irrigation knowledge
        irrigation_data = [
            {
                "content": "Rice irrigation: Maintain 2-3 inches of standing water during vegetative stage. Reduce to 1 inch during flowering. Stop irrigation 2 weeks before harvest.",
                "crop": "rice",
                "stage": "all_stages",
                "water_requirement": "high",
                "season": "kharif",
                "irrigation_type": "flood"
            },
            {
                "content": "Wheat irrigation: First irrigation 20-25 days after sowing (crown root initiation). Second at tillering (45-60 DAS). Third at jointing stage (75-90 DAS). Fourth at flowering (100-110 DAS). Fifth at grain filling (120-130 DAS).",
                "crop": "wheat",
                "stage": "all_stages", 
                "water_requirement": "medium",
                "season": "rabi",
                "irrigation_type": "surface"
            },
            {
                "content": "Cotton drip irrigation: Apply 4-6mm daily water during initial stage (0-45 days). Increase to 8-10mm during flowering and boll formation (45-120 days). Reduce to 6-8mm during boll opening (120-180 days).",
                "crop": "cotton",
                "stage": "flowering",
                "water_requirement": "high", 
                "season": "kharif",
                "irrigation_type": "drip"
            },
            {
                "content": "Tomato irrigation schedule: Water daily 200-250ml per plant for first 30 days. Increase to 500-750ml during flowering and fruiting. Maintain soil moisture at 80-90% field capacity.",
                "crop": "tomato",
                "stage": "flowering",
                "water_requirement": "high",
                "season": "all_season",
                "irrigation_type": "drip"
            },
            {
                "content": "Sugarcane irrigation: First irrigation immediately after planting. Second after 15 days. Then irrigate at 20-25 day intervals during tillering. Weekly irrigation during grand growth phase.",
                "crop": "sugarcane",
                "stage": "tillering",
                "water_requirement": "very_high",
                "season": "annual",
                "irrigation_type": "furrow"
            },
            {
                "content": "Maize irrigation: Critical stages are tasseling and silking (50-70 DAS) and grain filling (70-100 DAS). Irrigation at these stages can increase yield by 40-50%. Water stress during tasseling reduces yield significantly.",
                "crop": "maize",
                "stage": "flowering",
                "water_requirement": "medium",
                "season": "kharif_rabi",
                "irrigation_type": "surface"
            },
            {
                "content": "Soybean irrigation: Generally rainfed crop. If rainfall is inadequate, irrigate at flowering (45-50 DAS) and pod filling (70-80 DAS) stages. Avoid water logging.",
                "crop": "soybean",
                "stage": "flowering",
                "water_requirement": "low",
                "season": "kharif",
                "irrigation_type": "surface"
            },
            {
                "content": "Onion irrigation: Light and frequent irrigation required. Irrigate every 5-7 days during initial stage. During bulb formation, irrigate every 10-15 days. Stop irrigation 15 days before harvest.",
                "crop": "onion", 
                "stage": "bulb_formation",
                "water_requirement": "medium",
                "season": "rabi",
                "irrigation_type": "surface"
            },
            {
                "content": "Potato irrigation: First irrigation 15-20 days after planting. Critical irrigation at tuber initiation (30-40 DAS) and tuber bulking (60-80 DAS). Maintain 70-80% soil moisture.",
                "crop": "potato",
                "stage": "tuber_formation",
                "water_requirement": "medium",
                "season": "rabi",
                "irrigation_type": "surface"
            }
        ]
        
        # Weather-based irrigation guidelines
        weather_guidelines = [
            {
                "content": "During high temperature (>35°C), increase irrigation frequency by 25-30%. Early morning irrigation (5-8 AM) is most effective to reduce water loss through evaporation.",
                "weather_condition": "high_temperature",
                "adjustment": "increase_frequency",
                "timing": "early_morning"
            },
            {
                "content": "In high humidity (>80%) conditions, reduce irrigation frequency to prevent fungal diseases. Ensure proper drainage to avoid water logging.",
                "weather_condition": "high_humidity", 
                "adjustment": "reduce_frequency",
                "disease_risk": "fungal"
            },
            {
                "content": "During monsoon, stop regular irrigation. Resume only if rainfall is less than 25mm per week. Check soil moisture before irrigating.",
                "weather_condition": "monsoon",
                "adjustment": "stop_regular",
                "rain_threshold": "25mm_per_week"
            },
            {
                "content": "In drought conditions, adopt deficit irrigation strategy. Apply water at critical growth stages only. Use mulching to conserve soil moisture.",
                "weather_condition": "drought",
                "strategy": "deficit_irrigation", 
                "water_conservation": "mulching"
            }
        ]
        
        # Combine all data
        all_data = irrigation_data + weather_guidelines
        
        return all_data
    
    def index_irrigation_data(self):
        """Index irrigation data into ChromaDB"""
        print("🌊 Starting Irrigation Data Indexing...")
        
        # Create embedding function
        embedding_function = SentenceTransformerEmbeddingFunction(model_name=self.MODEL_NAME)
        
        # Initialize ChromaDB client
        client = chromadb.PersistentClient(path=self.CHROMA_PATH)
        
        # Create or get collection
        collection = client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            embedding_function=embedding_function
        )
        
        # Get irrigation knowledge base
        irrigation_data = self.create_irrigation_knowledge_base()
        
        # Prepare data for indexing
        documents = []
        metadatas = []
        ids = []
        
        for i, item in enumerate(tqdm(irrigation_data, desc="Preparing irrigation data")):
            # Create searchable document text
            content = item["content"]
            
            # Add to lists
            documents.append(content)
            metadatas.append({k: v for k, v in item.items() if k != "content"})
            ids.append(f"irrigation_{i}")
        
        # Add to collection
        print(f"Adding {len(documents)} irrigation documents to ChromaDB...")
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"✅ Irrigation indexing completed! Added {len(documents)} documents.")

if __name__ == "__main__":
    indexer = IrrigationIndexer()
    indexer.index_irrigation_data()
