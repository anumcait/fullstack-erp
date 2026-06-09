import json
from lifecycle.data.ingestion import load_documents, clean_documents, chunk_documents, enrich_metadata

FILE_PATH = "lifecycle/data/raw/agri_guide.txt"
OUTPUT_PATH = "lifecycle/data/artifacts/cleaned_chunks.json"

DOMAIN_METADATA = {
    "crop": "rice",
    "region": "telangana",
    "season": "kharif"
}

documents = load_documents(FILE_PATH)
documents = clean_documents(documents)
chunks = chunk_documents(documents)
chunks = enrich_metadata(chunks, DOMAIN_METADATA)

# Serialize
serialized = [
    {"text": c.page_content, "metadata": c.metadata}
    for c in chunks
]

with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(serialized, f, indent=2)

print("✅ Stage 02 complete: cleaned_chunks.json saved")
