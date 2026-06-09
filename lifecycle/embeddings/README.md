# Stage 06 – Embeddings
## Agricultural AI Agent (LLM Lifecycle)

This stage converts **cleaned and chunked documents** into **vector embeddings**.

Embeddings enable:
- Semantic search
- Retrieval-Augmented Generation (RAG)
- Knowledge reuse across LLMs

This stage does NOT:
- Call an LLM for generation
- Perform reasoning
- Serve APIs

---

## Input to This Stage

- LangChain `Document` objects produced by:
  - Stage 02: Data Strategy & Ingestion

Each document contains:
- `page_content` (clean text chunk)
- `metadata` (crop, region, season, source)

---

## Output of This Stage

- Numerical vector embeddings
- Metadata-preserving vector records
- Ready for storage in a vector database (Stage 07)

---

## Model Choice

Embedding Model:
- `intfloat/e5-large-v2`

Reasons:
- High retrieval quality
- Industry-standard for RAG
- Supports cosine similarity
- Performs well on domain text

---

## Why This Stage Matters

Poor embeddings lead to:
- Irrelevant retrieval
- Hallucinated answers
- Wasted context window
- Higher inference cost

Good embeddings:
- Improve factual accuracy
- Reduce hallucinations
- Improve latency and cost efficiency
