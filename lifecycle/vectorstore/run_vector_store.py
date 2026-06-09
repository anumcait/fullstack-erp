import pickle

from lifecycle.vectorstore.vector_store import init_pinecone, add_vectors

INPUT_PATH = "lifecycle/embeddings/artifacts/embeddings.pkl"

with open(INPUT_PATH, "rb") as f:
    records = pickle.load(f)

vector_dim = len(records[0]["vector"])

index = init_pinecone(vector_dim)
add_vectors(index, records)

print("✅ Stage 07 complete: embeddings stored in Pinecone")
