# agri_vector_db.py

import os
import json
import argparse
import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging
import pandas as pd
from tqdm import tqdm

try:
    import chromadb
    from chromadb.config import Settings
    from sentence_transformers import SentenceTransformer
except ImportError as e:
    print(f"Required packages not installed: {e}")
    print("Install with: pip install chromadb sentence-transformers")
    exit(1)

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def load_and_clean_csv(path: str) -> pd.DataFrame:
    """Load CSV and clean columns."""
    df = pd.read_csv(path)
    df = df[df['Arrival_Date'] != '########']
    df = df.dropna(subset=["Commodity", "Market", "Modal_Price"])
    return df

def create_documents_metadata(df: pd.DataFrame):
    """Generate Chroma-ready triples from dataframe."""
    documents, metadatas, ids = [], [], []

    for i, row in tqdm(df.iterrows(), total=len(df), desc="Preparing data"):
        doc = (
            f"On {row['Arrival_Date']}, the modal price of {row['Commodity']} "
            f"({row['Variety']}, {row['Grade']}) in {row['Market']} market, {row['District']}, "
            f"{row['State']} was ₹{row['Modal_Price']}. "
            f"Min: ₹{row['Min_Price']}, Max: ₹{row['Max_Price']}."
        )
        metadata = {
            "state": row["State"],
            "district": row["District"],
            "market": row["Market"],
            "commodity": row["Commodity"],
            "variety": row["Variety"],
            "grade": row["Grade"],
            "arrival_date": row["Arrival_Date"],
        }

        documents.append(doc)
        metadatas.append(metadata)
        ids.append(f"mandi_{i}")

    return documents, metadatas, ids

def load_and_clean_schemes_csv(path: str) -> pd.DataFrame:
    """Load government schemes CSV and clean columns."""
    df = pd.read_csv(path)
    # Remove rows with missing essential data
    df = df.dropna(subset=["Scheme Name", "Focus / Description", "Benefits"])
    # Clean up any empty strings
    df = df[df['Scheme Name'].str.strip() != '']
    df = df[df['Focus / Description'].str.strip() != '']
    return df

def create_schemes_documents_metadata(df: pd.DataFrame):
    """Generate Chroma-ready documents from government schemes dataframe."""
    documents, metadatas, ids = [], [], []

    for i, row in tqdm(df.iterrows(), total=len(df), desc="Preparing schemes data"):
        # Create a comprehensive document description
        doc = (
            f"Government Scheme: {row['Scheme Name']}. "
            f"Sector: {row['Sector']}. "
            f"Description: {row['Focus / Description']}. "
            f"Benefits: {row['Benefits']}. "
            f"Eligibility: {row['Eligibility Criteria']}. "
            f"How to Apply: {row['How to Apply']}. "
            f"Launched: {row['Launched On & By Whom']}. "
            f"More information available at: {row['URL']}."
        )
        
        metadata = {
            "scheme_name": row["Scheme Name"],
            "sector": row["Sector"],
            "focus_description": row["Focus / Description"],
            "benefits": row["Benefits"],
            "how_to_apply": row["How to Apply"],
            "eligibility_criteria": row["Eligibility Criteria"],
            "launched_info": row["Launched On & By Whom"],
            "url": row["URL"],
            "data_type": "government_scheme"
        }

        documents.append(doc)
        metadatas.append(metadata)
        ids.append(f"scheme_{i}")

    return documents, metadatas, ids

class AgriculturalVectorDB:
    """
    Agricultural Vector Database Manager using ChromaDB
    Supports persistent storage and multiple buckets for different data types
    """

    # Default bucket names mapping to intent types
    DEFAULT_BUCKETS = {
        'market_prediction_data': 'Market prices and prediction data',
        'government_schemes_data': 'Government agricultural schemes and subsidies'
    }
    
    # Maximum batch size for ChromaDB (set to 5000 to be safe)
    MAX_BATCH_SIZE = 5000

    def __init__(self, persist_directory: str = '../agri_chromadb'):
        """Initialize the vector database with persistent storage"""
        self.persist_directory = persist_directory
        
        # Create directory if it doesn't exist
        os.makedirs(persist_directory, exist_ok=True)
        
        # Initialize ChromaDB client with persistence
        self.client = chromadb.PersistentClient(path=persist_directory)
        
        # Initialize embedding model
        try:
            self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("Loaded embedding model: all-MiniLM-L6-v2")
        except Exception as e:
            logger.error(f"Failed to load embedding model: {e}")
            self.embedding_model = None

    def list_buckets(self) -> List[str]:
        """List all bucket names (collection names) in the vector DB"""
        collections = self.client.list_collections()
        return [col.name for col in collections]

    def get_bucket_info(self) -> Dict[str, Dict]:
        """Get detailed information about all buckets"""
        collections = self.client.list_collections()
        bucket_info = {}
        
        for col in collections:
            collection = self.client.get_collection(col.name)
            count = collection.count()
            bucket_info[col.name] = {
                'document_count': count,
                'metadata': col.metadata or {},
                'created_date': col.metadata.get('created_date', 'Unknown') if col.metadata else 'Unknown'
            }
        
        return bucket_info

    def add_bucket(self, bucket_name: str, description: str = None):
        """Add a new bucket (collection) if it doesn't already exist"""
        existing_buckets = self.list_buckets()
        
        if bucket_name in existing_buckets:
            logger.warning(f"Bucket '{bucket_name}' already exists.")
            return False
        
        metadata = {
            'description': description or f"Agricultural data bucket: {bucket_name}",
            'created_date': datetime.now().isoformat()
        }
        
        try:
            self.client.create_collection(
                name=bucket_name,
                metadata=metadata
            )
            logger.info(f"Bucket '{bucket_name}' created successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to create bucket '{bucket_name}': {e}")
            return False

    def remove_bucket(self, bucket_name: str, force: bool = False):
        """Remove an existing bucket (collection)"""
        existing_buckets = self.list_buckets()
        
        if bucket_name not in existing_buckets:
            logger.warning(f"Bucket '{bucket_name}' does not exist.")
            return False
        
        if not force:
            confirmation = input(f"Are you sure you want to delete bucket '{bucket_name}'? (y/N): ")
            if confirmation.lower() != 'y':
                logger.info("Bucket deletion cancelled.")
                return False
        
        try:
            self.client.delete_collection(bucket_name)
            logger.info(f"Bucket '{bucket_name}' deleted successfully.")
            return True
        except Exception as e:
            logger.error(f"Failed to delete bucket '{bucket_name}': {e}")
            return False

    def add_documents_to_bucket(self, bucket_name: str, documents: List[str],
                               metadatas: Optional[List[Dict]] = None,
                               ids: Optional[List[str]] = None) -> bool:
        """Add documents to a bucket with embeddings using batch processing"""
        
        # Check if bucket exists, create if not
        if bucket_name not in self.list_buckets():
            logger.info(f"Bucket '{bucket_name}' does not exist. Creating it.")
            self.add_bucket(bucket_name)
        
        try:
            collection = self.client.get_collection(bucket_name)
            
            # Generate IDs if not provided
            if ids is None:
                ids = [str(uuid.uuid4()) for _ in documents]
            
            # Prepare metadata
            if metadatas is None:
                metadatas = [{'added_date': datetime.now().isoformat()} for _ in documents]
            else:
                # Add timestamp to existing metadata
                for metadata in metadatas:
                    if 'added_date' not in metadata:
                        metadata['added_date'] = datetime.now().isoformat()
            
            # Process in batches to avoid exceeding max batch size
            total_docs = len(documents)
            batch_size = self.MAX_BATCH_SIZE
            num_batches = (total_docs + batch_size - 1) // batch_size
            
            logger.info(f"Processing {total_docs} documents in {num_batches} batches...")
            
            for i in tqdm(range(0, total_docs, batch_size), desc="Adding documents to ChromaDB"):
                batch_end = min(i + batch_size, total_docs)
                batch_docs = documents[i:batch_end]
                batch_metas = metadatas[i:batch_end]
                batch_ids = ids[i:batch_end]
                
                # Generate embeddings for this batch if model is available
                embeddings = None
                if self.embedding_model:
                    try:
                        embeddings = self.embedding_model.encode(batch_docs, show_progress_bar=False).tolist()
                    except Exception as e:
                        logger.warning(f"Failed to generate embeddings for batch {i//batch_size + 1}: {e}")
                
                # Add batch to collection
                if embeddings:
                    collection.add(
                        ids=batch_ids,
                        documents=batch_docs,
                        metadatas=batch_metas,
                        embeddings=embeddings
                    )
                else:
                    collection.add(
                        ids=batch_ids,
                        documents=batch_docs,
                        metadatas=batch_metas
                    )
            
            logger.info(f"Successfully added {total_docs} documents to bucket '{bucket_name}' in {num_batches} batches.")
            return True
            
        except Exception as e:
            logger.error(f"Failed to add documents to bucket '{bucket_name}': {e}")
            return False

    def load_dataset_from_file(self, file_path: str, bucket_name: str,
                              file_type: str = 'auto') -> bool:
        """Load dataset from file and add to bucket"""
        
        if not os.path.exists(file_path):
            logger.error(f"File '{file_path}' does not exist.")
            return False
        
        try:
            documents = []
            metadatas = []
            ids = []
            
            if file_type == 'txt':
                with open(file_path, 'r', encoding='utf-8') as f:
                    documents = [line.strip() for line in f if line.strip()]
                metadatas = [{'source_file': file_path, 'line_number': i+1}
                           for i in range(len(documents))]
                ids = [f"txt_{i}" for i in range(len(documents))]
                
            elif file_type == 'csv':
                # Check if this is government schemes data by looking at column names
                df_temp = pd.read_csv(file_path, nrows=1)
                if 'Scheme Name' in df_temp.columns:
                    # This is government schemes data
                    df = load_and_clean_schemes_csv(file_path)
                    documents, metadatas, ids = create_schemes_documents_metadata(df)
                else:
                    # This is mandi prices data (default)
                    df = load_and_clean_csv(file_path)
                    documents, metadatas, ids = create_documents_metadata(df)
            
            if documents:
                success = self.add_documents_to_bucket(bucket_name, documents, metadatas, ids)
                if success:
                    logger.info(f"Successfully loaded {len(documents)} documents from '{file_path}' to bucket '{bucket_name}'")
                return success
            else:
                logger.warning(f"No documents found in file '{file_path}'")
                return False
                
        except Exception as e:
            logger.error(f"Failed to load dataset from '{file_path}': {e}")
            return False

    def query_bucket(self, bucket_name: str, query: str, n_results: int = 5) -> Dict:
        """Query a specific bucket for similar documents"""
        
        if bucket_name not in self.list_buckets():
            logger.error(f"Bucket '{bucket_name}' does not exist.")
            return {}
        
        try:
            collection = self.client.get_collection(bucket_name)
            
            # Generate query embedding if model is available
            if self.embedding_model:
                query_embedding = self.embedding_model.encode([query]).tolist()
                results = collection.query(
                    query_embeddings=query_embedding,
                    n_results=n_results
                )
            else:
                # Fallback to text-based search
                results = collection.query(
                    query_texts=[query],
                    n_results=n_results
                )
            
            return results
            
        except Exception as e:
            logger.error(f"Failed to query bucket '{bucket_name}': {e}")
            return {}

    def initialize_default_buckets(self):
        """Initialize the database with default buckets and load market data"""
        logger.info("Initializing database with default buckets...")
        
        for bucket_name, description in self.DEFAULT_BUCKETS.items():
            self.add_bucket(bucket_name, description)
            
            # Load market data if bucket is market_prediction_data
            if bucket_name == 'market_prediction_data':
                csv_path = "../data_sources/bargarh_mandi_prices.csv"
                if os.path.exists(csv_path):
                    logger.info(f"Loading market data from {csv_path}...")
                    self.load_dataset_from_file(csv_path, bucket_name, 'csv')
                else:
                    logger.warning(f"Market data file {csv_path} not found.")
            
            # Load government schemes data if bucket is government_schemes_data
            elif bucket_name == 'government_schemes_data':
                csv_path = "../data_sources/bargarh_government_schemes.csv"
                if os.path.exists(csv_path):
                    logger.info(f"Loading government schemes data from {csv_path}...")
                    self.load_dataset_from_file(csv_path, bucket_name, 'csv')
                else:
                    logger.warning(f"Government schemes data file {csv_path} not found.")
        
        logger.info("Default buckets initialization completed.")

    def backup_database(self, backup_path: str = None):
        """Create a backup of the database"""
        if backup_path is None:
            backup_path = f"agri_db_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        try:
            import shutil
            shutil.copytree(self.persist_directory, backup_path)
            logger.info(f"Database backed up to '{backup_path}'")
            return True
        except Exception as e:
            logger.error(f"Failed to backup database: {e}")
            return False

def main():
    """Command line interface for the vector database"""
    parser = argparse.ArgumentParser(description="Manage agricultural vector database")
    parser.add_argument('--persist_dir', type=str, default='../agri_chromadb',
                       help='Directory to persist database')
    
    # Operations
    parser.add_argument('--init', action='store_true',
                       help='Initialize database with default buckets')
    parser.add_argument('--init_custom', nargs='+',
                       help='Initialize database with custom bucket names')
    parser.add_argument('--list', action='store_true',
                       help='List all buckets and their info')
    parser.add_argument('--add_bucket', type=str,
                       help='Add a single bucket')
    parser.add_argument('--remove_bucket', type=str,
                       help='Remove a single bucket')
    parser.add_argument('--force', action='store_true',
                       help='Force operation without confirmation')
    
    # Data operations
    parser.add_argument('--add_data', nargs=3,
                       metavar=('bucket_name', 'file_path', 'file_type'),
                       help='Add dataset from file to bucket (file_type: txt/csv)')
    parser.add_argument('--query', nargs=3,
                       metavar=('bucket_name', 'query_text', 'num_results'),
                       help='Query a bucket for similar documents')
    
    # Utility operations
    parser.add_argument('--backup', type=str, nargs='?', const=None,
                       help='Backup database to specified path')
    
    args = parser.parse_args()
    
    # Initialize database
    db = AgriculturalVectorDB(persist_directory=args.persist_dir)
    
    # Execute operations
    if args.init:
        db.initialize_default_buckets()
    
    if args.init_custom:
        for bucket_name in args.init_custom:
            db.add_bucket(bucket_name)
    
    if args.list:
        buckets = db.get_bucket_info()
        print("\n=== Agricultural Vector Database Buckets ===")
        for bucket_name, info in buckets.items():
            print(f"\nBucket: {bucket_name}")
            print(f"  Documents: {info['document_count']}")
            print(f"  Created: {info['created_date']}")
            print(f"  Description: {info['metadata'].get('description', 'No description')}")
    
    if args.add_bucket:
        db.add_bucket(args.add_bucket)
    
    if args.remove_bucket:
        db.remove_bucket(args.remove_bucket, force=args.force)
    
    if args.add_data:
        bucket_name, file_path, file_type = args.add_data
        db.load_dataset_from_file(file_path, bucket_name, file_type)
    
    if args.query:
        bucket_name, query_text, num_results = args.query
        results = db.query_bucket(bucket_name, query_text, int(num_results))
        print(f"\n=== Query Results for '{query_text}' in bucket '{bucket_name}' ===")
        if results and 'documents' in results:
            for i, doc in enumerate(results['documents'][0]):
                print(f"\n{i+1}. {doc[:200]}...")
                if 'distances' in results and len(results['distances']) > 0:
                    similarity_score = 1 - results['distances'][0][i]
                    print(f"   Similarity: {similarity_score:.3f}")
    
    if args.backup is not None:
        db.backup_database(args.backup)

if __name__ == '__main__':
    main()
