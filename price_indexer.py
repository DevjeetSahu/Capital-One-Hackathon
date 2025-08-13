# price_indexer.py
import os
import pandas as pd
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings
from chromadb.utils.embedding_functions import SentenceTransformerEmbeddingFunction
from tqdm import tqdm

# Constants
DATA_PATH = "mandi_prices.csv"
CHROMA_PATH = "chroma_data/"
COLLECTION_NAME = "mandi_prices"
MODEL_NAME = "all-MiniLM-L6-v2"
BATCH_SIZE = 5000  # must be <= 5461


def load_and_clean_csv(path):
    df = pd.read_csv(path)
    df.columns = df.columns.str.replace("_x0020_", "_")
    df = df.dropna(subset=["Commodity", "Market", "Modal_Price"])
    return df


def create_embedding_function(model_name):
    return SentenceTransformerEmbeddingFunction(model_name=model_name)


def prepare_chroma_collection(path, collection_name, embedding_function):
    client = chromadb.PersistentClient(path=path)
    return client.get_or_create_collection(
        name=collection_name,
        embedding_function=embedding_function
    )


def create_documents_metadata(df):
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


def insert_into_chroma(collection, documents, metadatas, ids, model):
    for start in tqdm(range(0, len(documents), BATCH_SIZE), desc="Inserting into ChromaDB"):
        end = start + BATCH_SIZE
        batch_docs = documents[start:end]
        batch_metas = metadatas[start:end]
        batch_ids = ids[start:end]

        batch_embeddings = model.encode(batch_docs, show_progress_bar=False)

        collection.add(
            documents=batch_docs,
            metadatas=batch_metas,
            embeddings=batch_embeddings,
            ids=batch_ids
        )


def query_chroma(collection, query, n_results=5):
    results = collection.query(query_texts=[query], n_results=n_results)
    for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
        print(doc)
        print(meta)
        print("-" * 50)


# ================================
# ========== MAIN ===============
# ================================

if __name__ == "__main__":
    # Step 1: Load and clean CSV
    df = load_and_clean_csv(DATA_PATH)

    # Step 2: Load model for embedding
    model = SentenceTransformer(MODEL_NAME)

    # Step 3: Create ChromaDB collection with local embedding function
    embedding_function = create_embedding_function(MODEL_NAME)
    collection = prepare_chroma_collection(CHROMA_PATH, COLLECTION_NAME, embedding_function)

    # Step 4: Build documents and metadata
    documents, metadatas, ids = create_documents_metadata(df)

    # Step 5: Insert into ChromaDB
    insert_into_chroma(collection, documents, metadatas, ids, model)

    # Step 6: Query example
    print("\nTop 5 results for: 'Tomato prices in Karnataka'\n")
    query_chroma(collection, "Tomato prices in Karnataka", n_results=5)
