import json

FILE_PATH = "lifecycle/data/artifacts/cleaned_chunks.json"

with open(FILE_PATH, "r", encoding="utf-8") as f:
    chunks = json.load(f)

print("Total chunks:", len(chunks))

lengths = [len(c["text"]) for c in chunks]

print("Min chunk length:", min(lengths))
print("Max chunk length:", max(lengths))
print("Average chunk length:", sum(lengths) // len(lengths))

missing_metadata = []

for i, c in enumerate(chunks):
    if not c.get("metadata"):
        missing_metadata.append(i)

print("Chunks missing metadata:", len(missing_metadata))

