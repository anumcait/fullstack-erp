import json
import pickle
from lifecycle.embeddings.embeddings import load_embedding_model

INPUT_PATH = "lifecycle/data/artifacts/cleaned_chunks.json"
OUTPUT_PATH = "lifecycle/embeddings/artifacts/embeddings.pkl"

with open(INPUT_PATH, "r", encoding="utf-8") as f:
    chunks = json.load(f)

texts = [c["text"] for c in chunks]

embedding_model = load_embedding_model()
vectors = embedding_model.embed_documents(texts)

payload = [
    {
        "vector": vectors[i],
        "metadata": chunks[i]["metadata"],
        "text": chunks[i]["text"]
    }
    for i in range(len(vectors))
]

with open(OUTPUT_PATH, "wb") as f:
    pickle.dump(payload, f)

print("✅ Stage 06 complete: embeddings.pkl saved")
