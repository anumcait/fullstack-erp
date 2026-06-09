from typing import List, Dict
import os

from pinecone import Pinecone, ServerlessSpec

def init_pinecone(vector_dim: int):
    """
    Initializes Pinecone index for storing precomputed embeddings.
    Uses the NEW Pinecone SDK (class-based).
    """

    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME")

    if not api_key or not index_name:
        raise ValueError("PINECONE_API_KEY or PINECONE_INDEX_NAME not set")

    # Create Pinecone client
    pc = Pinecone(api_key=api_key)

    # Create index if it does not exist
    existing_indexes = pc.list_indexes().names()

    if index_name not in existing_indexes:
        pc.create_index(
            name=index_name,
            dimension=vector_dim,
            metric="cosine",
            spec=ServerlessSpec(
                cloud="aws",
                region="us-east-1"
            )
        )

    index = pc.Index(index_name)
    return index

def add_vectors(
    index,
    records: List[Dict]
):
    """
    Stores precomputed embeddings into Pinecone (NO re-embedding).
    """

    vectors = []

    for idx, record in enumerate(records):
        vectors.append(
            (
                str(idx),                 # vector ID
                record["vector"],         # embedding
                {
                    "text": record["text"],
                    **record["metadata"]
                }
            )
        )

    index.upsert(vectors=vectors)

def load_index():
    """Connect to Pinecone vector database"""
    api_key = os.getenv("PINECONE_API_KEY")
    index_name = os.getenv("PINECONE_INDEX_NAME")
    
    if not api_key or not index_name:
        raise ValueError("Missing PINECONE_API_KEY or PINECONE_INDEX_NAME")
    
    pc = Pinecone(api_key=api_key)
    return pc.Index(index_name)

def retrieve_chunks(index, query_vector: List[float], top_k: int = 5) -> List[str]:
    """Search for relevant chunks"""
    response = index.query(
        vector=query_vector,
        top_k=top_k,
        include_metadata=True
    )
    return [match["metadata"]["text"] for match in response["matches"]]
