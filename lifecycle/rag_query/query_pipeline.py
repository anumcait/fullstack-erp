"""RAG Pipeline - Retrieves documents and generates answers"""

from lifecycle.embeddings.embeddings import load_embedding_model, embed_query
from lifecycle.vectorstore.vector_store import load_index, retrieve_chunks
from lifecycle.prompts.rag_prompts import build_prompt
from lifecycle.model.llm_config import get_llm


def rag_query(question: str) -> dict:
    """Main RAG function returning answer + contexts"""
    # Load tools
    embedding_model = load_embedding_model()
    index = load_index()
    
    # Search
    query_vector = embed_query(question, embedding_model)
    chunks = retrieve_chunks(index, query_vector)
    
    # Generate answer
    prompt = build_prompt(question, chunks)
    llm = get_llm()
    response = llm.invoke(prompt)
    
    return {
        "answer": response.content.strip(),
        "contexts": chunks,
    }
