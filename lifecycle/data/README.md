# 2. Data Strategy & Knowledge Mapping
## Agricultural AI Agent (LLM Lifecycle – Stage 02)

---

## 2.1 Role of Data in a Generative AI System

In a Generative AI system, data is **not used for training the LLM** initially.
Instead, it is used to:

- Ground LLM responses (RAG)
- Reduce hallucinations
- Inject domain and regional knowledge
- Enable explainable answers

This stage prepares **retrievable knowledge**, not labels.

---

## 2.2 Data Types

### Unstructured Data
- Government agricultural advisories (PDF)
- Research papers
- Crop cultivation guides

### Semi-Structured Data
- JSON/CSV datasets (soil reports, crop yields)
- Weather summaries

### Structured Metadata
- Crop name
- Region
- Season
- Source authority

---

## 2.3 Knowledge Mapping Strategy

Each document chunk must be enriched with metadata:

```json
{
  "crop": "rice",
  "region": "telangana",
  "season": "kharif",
  "source": "govt_advisory"
}
"""ingestion.py – Document Loading & Chunking (Library)

Role in LLM Lifecycle

Implements framework-level ingestion logic.

Uses LangChain loaders and text splitters.

Responsibilities

Load raw documents (PDF, TXT, CSV)

Convert files into LangChain Document objects

Chunk documents into overlapping segments

Preserve and propagate metadata

What it does NOT do

No cleaning rules

No filtering decisions

No execution logic

This file is reusable, stateless, and library-like.

cleaning.py – Data Strategy & Filtering Rules

Role in LLM Lifecycle

Encodes the data strategy for the GenAI system.

Responsibilities

Remove noise (headers, footers, references)

Remove irrelevant lines (URLs, contacts, boilerplate)

Apply domain-specific heuristics

Improve signal-to-noise ratio before chunking

Why this is important

Reduces hallucinations

Improves retrieval quality

Lowers embedding and inference cost

This file represents human decisions translated into code.

run_ingestion.py – Execution Pipeline (Orchestration)

Role in LLM Lifecycle

Executes the ingestion pipeline end-to-end.

Wires together ingestion.py and cleaning.py.

Responsibilities

Load raw documents

Apply data strategy (cleaning)

Chunk documents

Enrich metadata

Produce final chunked documents

Important

This file contains execution logic, not reusable utilities.

Safe to re-run multiple times.

Useful for testing and debugging ingestion.

End-to-End Flow (Conceptual)
raw documents
      ↓
LangChain loaders (ingestion.py)
      ↓
data cleaning & filtering (cleaning.py)
      ↓
text chunking (ingestion.py)
      ↓
metadata enrichment
      ↓
READY FOR EMBEDDINGS"""