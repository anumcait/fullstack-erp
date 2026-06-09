# Stage 07 – Vector Store
## Agricultural AI Agent (LLM Lifecycle)

This stage persists embeddings generated in **Stage 06** into a vector database.

The vector store enables:
- Semantic similarity search
- Context retrieval for RAG
- Metadata-based filtering (crop, region, season)

This stage does NOT:
- Generate text using an LLM
- Perform reasoning
- Expose APIs

---

## Input to This Stage

- Embeddings generated from cleaned, chunked documents
- LangChain `Document` metadata

---

## Output of This Stage

- A populated vector database
- Searchable embeddings
- Metadata-aware retrieval interface

---

## Vector Database Choice

Selected: **Qdrant**

Reasons:
- Open source
- High performance
- Metadata filtering support
- Native LangChain integration
- Production-ready

---

## Role in RAG Pipeline

