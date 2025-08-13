# pest_indexer.py
import pandas as pd
import chromadb
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from tqdm import tqdm

class PestControlIndexer:
    def __init__(self):
        self.CHROMA_PATH = "chroma_data/"
        self.COLLECTION_NAME = "pest_control"
        self.MODEL_NAME = "all-MiniLM-L6-v2"
        
    def create_pest_knowledge_base(self):
        """Create comprehensive pest control knowledge base"""
        
        pest_data = [
            # Rice pests
            {
                "content": "Brown Planthopper (BPH) in rice: Symptoms include yellowing and drying of plants (hopperburn). Control: Use resistant varieties like TN1, spray imidacloprid 17.8 SL @ 0.3ml/l or thiamethoxam 25 WG @ 0.3g/l.",
                "pest": "brown_planthopper",
                "crop": "rice", 
                "symptoms": ["yellowing", "drying", "hopperburn"],
                "control": ["resistant_varieties", "imidacloprid", "thiamethoxam"],
                "severity": "high"
            },
            {
                "content": "Rice Stem Borer: Causes dead heart in vegetative stage and white head during reproductive stage. Control: Use pheromone traps @ 8/ha, spray chlorantraniliprole 18.5 SC @ 0.3ml/l or cartap hydrochloride 75 SP @ 1g/l.",
                "pest": "stem_borer",
                "crop": "rice",
                "symptoms": ["dead_heart", "white_head"],
                "control": ["pheromone_traps", "chlorantraniliprole", "cartap_hydrochloride"],
                "severity": "high"
            },
            # Cotton pests  
            {
                "content": "Pink Bollworm in cotton: Larvae bore into cotton bolls causing flower and boll drop. Control: Use Bt cotton varieties, pheromone traps @ 4-5/acre, spray emamectin benzoate 5 SG @ 0.5g/l or indoxacarb 14.5 SC @ 1ml/l.",
                "pest": "pink_bollworm",
                "crop": "cotton",
                "symptoms": ["flower_drop", "boll_drop", "larval_bore"],
                "control": ["bt_varieties", "pheromone_traps", "emamectin_benzoate", "indoxacarb"],
                "severity": "very_high"
            },
            {
                "content": "American Bollworm in cotton: Caterpillar feeds on squares, flowers and bolls. Control: Monitor using pheromone traps, spray HaNPV @ 500 LE/ha or spinosad 45 SC @ 0.3ml/l. Use IPM approach.",
                "pest": "american_bollworm", 
                "crop": "cotton",
                "symptoms": ["square_damage", "flower_damage", "boll_damage"],
                "control": ["pheromone_monitoring", "hanpv", "spinosad", "ipm"],
                "severity": "high"
            },
            # Tomato pests
            {
                "content": "Tomato Fruit Borer (Helicoverpa): Larvae bore into fruits making them unmarketable. Control: Use sex pheromone traps, spray Bacillus thuringiensis @ 2g/l or lambda cyhalothrin 5 EC @ 1ml/l.",
                "pest": "fruit_borer",
                "crop": "tomato",
                "symptoms": ["fruit_boring", "unmarketable_fruits"],
                "control": ["sex_pheromone_traps", "bacillus_thuringiensis", "lambda_cyhalothrin"],
                "severity": "high"
            },
            {
                "content": "Whitefly in tomato: Causes leaf yellowing, honeydew secretion and transmits viral diseases. Control: Use reflective mulch, spray imidacloprid 17.8 SL @ 0.3ml/l or acetamiprid 20 SP @ 0.2g/l.",
                "pest": "whitefly",
                "crop": "tomato", 
                "symptoms": ["leaf_yellowing", "honeydew", "viral_transmission"],
                "control": ["reflective_mulch", "imidacloprid", "acetamiprid"],
                "severity": "medium"
            },
            # Wheat pests
            {
                "content": "Aphids in wheat: Cause yellowing and curling of leaves, secrete honeydew. Peak infestation during grain filling stage. Control: Spray dimethoate 30 EC @ 1ml/l or imidacloprid 17.8 SL @ 0.3ml/l.",
                "pest": "aphids",
                "crop": "wheat",
                "symptoms": ["leaf_yellowing", "leaf_curling", "honeydew"],
                "stage": "grain_filling",
                "control": ["dimethoate", "imidacloprid"],
                "severity": "medium"
            },
            # Disease management
            {
                "content": "Late Blight in tomato: Water-soaked spots on leaves, white mold on underside during humid conditions. Control: Spray mancozeb 75 WP @ 2g/l or copper oxychloride 50 WP @ 2.5g/l. Ensure good ventilation.",
                "disease": "late_blight",
                "crop": "tomato",
                "symptoms": ["water_soaked_spots", "white_mold", "humid_conditions"],
                "control": ["mancozeb", "copper_oxychloride", "ventilation"],
                "type": "fungal"
            },
            {
                "content": "Blast disease in rice: Causes diamond-shaped lesions on leaves, neck blast at panicle stage. Control: Spray tricyclazole 75 WP @ 0.6g/l or isoprothiolane 40 EC @ 1.5ml/l. Use resistant varieties.",
                "disease": "blast",
                "crop": "rice", 
                "symptoms": ["diamond_lesions", "neck_blast"],
                "stage": "panicle",
                "control": ["tricyclazole", "isoprothiolane", "resistant_varieties"],
                "type": "fungal"
            },
            # Integrated Pest Management
            {
                "content": "IPM for cotton: Use trap crops like marigold, install pheromone traps, release Trichogramma @ 1.5 lakh/ha, spray neem oil 0.5% or NSKE 5%. Monitor ETL levels regularly.",
                "ipm_crop": "cotton",
                "components": ["trap_crops", "pheromone_traps", "biocontrol", "botanicals"],
                "bioagents": ["trichogramma"],
                "monitoring": "etl_levels"
            },
            {
                "content": "Organic pest control: Use neem-based products, install yellow sticky traps, encourage beneficial insects, apply compost and organic amendments. Avoid broad-spectrum pesticides.",
                "approach": "organic",
                "methods": ["neem_products", "sticky_traps", "beneficial_insects", "compost"],
                "avoid": "broad_spectrum_pesticides"
            }
        ]
        
        return pest_data
    
    def index_pest_data(self):
        """Index pest control data"""
        print("🐛 Starting Pest Control Data Indexing...")
        
        # Create embedding function
        embedding_function = SentenceTransformerEmbeddingFunction(model_name=self.MODEL_NAME)
        
        # Initialize ChromaDB client
        client = chromadb.PersistentClient(path=self.CHROMA_PATH)
        
        # Create collection
        collection = client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            embedding_function=embedding_function
        )
        
        # Get pest knowledge base
        pest_data = self.create_pest_knowledge_base()
        
        # Prepare for indexing
        documents = []
        metadatas = []
        ids = []
        
        for i, item in enumerate(tqdm(pest_data, desc="Preparing pest data")):
            documents.append(item["content"])
            metadatas.append({k: v for k, v in item.items() if k != "content"})
            ids.append(f"pest_{i}")
        
        # Add to collection
        collection.add(
            documents=documents,
            metadatas=metadatas, 
            ids=ids
        )
        
        print(f"✅ Pest control indexing completed! Added {len(documents)} documents.")

if __name__ == "__main__":
    indexer = PestControlIndexer()
    indexer.index_pest_data()
