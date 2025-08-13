# crop_indexer.py
import pandas as pd
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from tqdm import tqdm

class CropRecommendationIndexer:
    def __init__(self):
        self.CHROMA_PATH = "chroma_data/"
        self.COLLECTION_NAME = "crop_recommendation"
        self.MODEL_NAME = "all-MiniLM-L6-v2"
        
    def create_crop_knowledge_base(self):
        """Create comprehensive crop recommendation knowledge base"""
        
        crop_data = [
            # Soil-based recommendations
            {
                "content": "For black soil (high clay content, good water retention): Recommended crops are cotton, sugarcane, wheat, gram, jowar, tobacco. pH range 7.0-8.5 is ideal. Rich in calcium and magnesium.",
                "soil_type": "black_soil",
                "crops": ["cotton", "sugarcane", "wheat", "gram", "jowar"],
                "ph_range": "7.0-8.5",
                "nutrient_status": "high_calcium_magnesium"
            },
            {
                "content": "For red soil (well-drained, low fertility): Suitable crops include millets, groundnut, cotton, wheat, pulses. Requires organic matter addition. pH range 6.0-7.0. Deficient in nitrogen and phosphorus.",
                "soil_type": "red_soil", 
                "crops": ["millets", "groundnut", "cotton", "wheat", "pulses"],
                "ph_range": "6.0-7.0",
                "nutrient_status": "low_nitrogen_phosphorus"
            },
            {
                "content": "For alluvial soil (fertile, high organic matter): Ideal for rice, wheat, sugarcane, cotton, jute, maize. pH range 6.0-7.5. Rich in potash but may lack phosphorus.",
                "soil_type": "alluvial_soil",
                "crops": ["rice", "wheat", "sugarcane", "cotton", "jute", "maize"],
                "ph_range": "6.0-7.5", 
                "nutrient_status": "high_potash_low_phosphorus"
            },
            {
                "content": "For laterite soil (acidic, low fertility): Suitable for coconut, cashew, tea, coffee, rubber, tapioca. pH range 5.0-6.5. Rich in iron and aluminum, poor in calcium and magnesium.",
                "soil_type": "laterite_soil",
                "crops": ["coconut", "cashew", "tea", "coffee", "rubber", "tapioca"],
                "ph_range": "5.0-6.5",
                "nutrient_status": "high_iron_aluminum_low_calcium"
            },
            # Climate-based recommendations  
            {
                "content": "For tropical climate (high temperature 25-35°C, high humidity >70%): Recommended crops are rice, sugarcane, coconut, banana, spices, rubber. Annual rainfall 150-250 cm required.",
                "climate": "tropical",
                "temperature": "25-35°C",
                "humidity": ">70%",
                "crops": ["rice", "sugarcane", "coconut", "banana", "spices", "rubber"],
                "rainfall": "150-250cm"
            },
            {
                "content": "For semi-arid climate (temperature 20-35°C, low rainfall 50-75 cm): Suitable crops include millets, sorghum, groundnut, cotton, pulses. Drought-resistant varieties preferred.",
                "climate": "semi-arid",
                "temperature": "20-35°C", 
                "crops": ["millets", "sorghum", "groundnut", "cotton", "pulses"],
                "rainfall": "50-75cm",
                "special_requirement": "drought_resistant"
            },
            {
                "content": "For temperate climate (temperature 15-25°C, moderate rainfall 75-125 cm): Ideal for wheat, barley, oats, potatoes, apples, stone fruits. Cool winters essential for vernalization.",
                "climate": "temperate",
                "temperature": "15-25°C",
                "crops": ["wheat", "barley", "oats", "potatoes", "apples", "stone_fruits"],
                "rainfall": "75-125cm",
                "special_requirement": "cool_winters"
            },
            # Nutrient-based recommendations
            {
                "content": "High nitrogen soil (>280 kg/ha): Suitable for leafy vegetables, sugarcane, maize, wheat. Monitor for over-fertilization symptoms. May require potassium supplementation.",
                "nutrient_level": "high_nitrogen",
                "nitrogen": ">280kg/ha",
                "crops": ["leafy_vegetables", "sugarcane", "maize", "wheat"],
                "caution": "over_fertilization_risk"
            },
            {
                "content": "Low nitrogen soil (<200 kg/ha): Plant legumes like groundnut, soybean, gram, peas for natural nitrogen fixation. Follow with nitrogen-demanding crops in rotation.",
                "nutrient_level": "low_nitrogen", 
                "nitrogen": "<200kg/ha",
                "crops": ["groundnut", "soybean", "gram", "peas"],
                "strategy": "nitrogen_fixation_rotation"
            },
            {
                "content": "High phosphorus soil (>25 kg/ha): Suitable for root crops like potato, carrot, radish, onion. Good for fruit crops and oil seeds. May reduce zinc availability.",
                "nutrient_level": "high_phosphorus",
                "phosphorus": ">25kg/ha", 
                "crops": ["potato", "carrot", "radish", "onion", "fruit_crops", "oil_seeds"],
                "caution": "zinc_deficiency_risk"
            },
            # Regional recommendations
            {
                "content": "For Punjab region: Wheat-rice rotation is traditional. Consider diversification with maize, cotton, sugarcane, pulses to reduce soil degradation and water consumption.",
                "region": "punjab",
                "traditional": "wheat_rice_rotation",
                "alternative_crops": ["maize", "cotton", "sugarcane", "pulses"],
                "benefits": "soil_health_water_conservation"
            },
            {
                "content": "For Maharashtra region: Cotton, sugarcane, soybean are major crops. In drought-prone areas, grow millets, sorghum, pulses. Drip irrigation recommended for sugarcane and cotton.",
                "region": "maharashtra",
                "major_crops": ["cotton", "sugarcane", "soybean"],
                "drought_resistant": ["millets", "sorghum", "pulses"],
                "irrigation": "drip_irrigation"
            }
        ]
        
        return crop_data
        
    def load_kaggle_crop_data(self):
        """Load and process Kaggle crop recommendation dataset if available"""
        try:
            # This would load the actual Kaggle dataset
            # df = pd.read_csv("crop_recommendation.csv")
            # For now, creating sample data structure
            sample_data = [
                {
                    "content": "For soil with N=90, P=42, K=43, pH=6.5, temperature=20.9°C, humidity=82%, rainfall=202mm: Recommended crop is rice. These conditions favor rice cultivation with adequate water availability.",
                    "N": 90, "P": 42, "K": 43, "ph": 6.5, "temperature": 20.9, 
                    "humidity": 82, "rainfall": 202, "recommended_crop": "rice"
                },
                {
                    "content": "For soil with N=85, P=58, K=41, pH=7.0, temperature=21.8°C, humidity=80%, rainfall=226mm: Recommended crop is maize. Good nutrient balance for cereal production.",
                    "N": 85, "P": 58, "K": 41, "ph": 7.0, "temperature": 21.8,
                    "humidity": 80, "rainfall": 226, "recommended_crop": "maize"
                }
            ]
            return sample_data
        except Exception as e:
            print(f"Could not load Kaggle data: {e}")
            return []
    
    def index_crop_data(self):
        """Index crop recommendation data"""
        print("🌱 Starting Crop Recommendation Data Indexing...")
        
        # Create embedding function
        embedding_function = SentenceTransformerEmbeddingFunction(model_name=self.MODEL_NAME)
        
        # Initialize ChromaDB client  
        client = chromadb.PersistentClient(path=self.CHROMA_PATH)
        
        # Create collection
        collection = client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            embedding_function=embedding_function
        )
        
        # Get all crop data
        knowledge_base = self.create_crop_knowledge_base()
        kaggle_data = self.load_kaggle_crop_data()
        all_data = knowledge_base + kaggle_data
        
        # Prepare for indexing
        documents = []
        metadatas = []  
        ids = []
        
        for i, item in enumerate(tqdm(all_data, desc="Preparing crop data")):
            documents.append(item["content"])
            metadatas.append({k: v for k, v in item.items() if k != "content"})
            ids.append(f"crop_rec_{i}")
        
        # Add to collection
        collection.add(
            documents=documents,
            metadatas=metadatas,
            ids=ids
        )
        
        print(f"✅ Crop recommendation indexing completed! Added {len(documents)} documents.")

if __name__ == "__main__":
    indexer = CropRecommendationIndexer()
    indexer.index_crop_data()
