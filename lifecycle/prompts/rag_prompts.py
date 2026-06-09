from typing import List

def build_prompt(question: str, chunks: List[str]) -> str:
    """Build LLM prompt with context"""
    if not chunks:
        return f"You are an agricultural AI.\nQuestion: {question}\nAnswer: I don't know."
    
    context = "\n\n".join(chunks)
    return f"""You are an agricultural AI assistant.
Answer using ONLY the context below. If not present, say "I don't know".

Context:
{context}

Question: {question}

Answer:"""
