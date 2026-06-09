from langchain_huggingface import HuggingFaceEmbeddings


def load_embedding_model():
    """
    Loads the embedding model used for vectorization.
    """
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        encode_kwargs={"normalize_embeddings": True}
    )

def embed_query(query: str, embedding_model) -> list[float]:
    """Convert text to vector"""
    return embedding_model.embed_query(query)
