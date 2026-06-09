import os
from langsmith import traceable

def init_langsmith():
    """
    Check LangSmith tracing status and apply tracing to core functions.
    This keeps logic files clean of monitoring-specific code.
    """
    tracing_enabled = os.getenv("LANGCHAIN_TRACING_V2", "").lower() == "true"
    langsmith_key = os.getenv("LANGCHAIN_API_KEY", "")
    langsmith_project = os.getenv("LANGCHAIN_PROJECT", "default")
    
    if tracing_enabled and langsmith_key and langsmith_key != "your-langsmith-api-key-here":
        print(f"✅ LangSmith tracing enabled → project: {langsmith_project}")
        
        # Apply tracing dynamically to decouple logic files
        try:
            from lifecycle.rag_query import query_pipeline
            from lifecycle.agent import agent_pipeline
            from lifecycle.vectorstore import vector_store
            from lifecycle.prompts import rag_prompts
            
            # Trace RAG functions
            vector_store.retrieve_chunks = traceable(name="retrieve_chunks", run_type="retriever")(vector_store.retrieve_chunks)
            rag_prompts.build_prompt = traceable(name="build_prompt", run_type="prompt")(rag_prompts.build_prompt)
            query_pipeline.rag_query = traceable(name="rag_query", run_type="chain")(query_pipeline.rag_query)
            
            # Trace Agent functions
            agent_pipeline.run_agent = traceable(name="run_agent", run_type="chain")(agent_pipeline.run_agent)
            
            print("🔍 Applied granular tracing to RAG and Agent pipelines")
            
        except ImportError as e:
            print(f"⚠️ Could not apply granular tracing: {e}")
            
    elif tracing_enabled and (not langsmith_key or langsmith_key == "your-langsmith-api-key-here"):
        print("⚠️  LangSmith tracing ON but LANGCHAIN_API_KEY not set — traces won't be sent")
    else:
        print("ℹ️  LangSmith tracing disabled (set LANGCHAIN_TRACING_V2=true to enable)")
