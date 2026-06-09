"""
main.py — FastAPI server with persistent MCP client and agent.

KEY PRODUCTION PATTERNS IMPLEMENTED:
  1. MCP client started ONCE at startup (not per request)
  2. Tools discovered ONCE at startup
  3. Agent created ONCE at startup
  4. All requests reuse app.state.agent (much faster!)

BEGINNER NOTE:
  Before: Every POST /query → create MCP client → discover tools → create agent → run
  After:  startup() → create MCP client → discover tools → create agent
          Every POST /query → just run agent (fast!)
"""

import sys
import asyncio
import os

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal

from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq

from lifecycle.agent.agent_pipeline import run_agent
from lifecycle.rag_query.query_pipeline import rag_query
from lifecycle.prompts.agent_prompts import AGENT_SYSTEM_PROMPT
from lifecycle.monitoring.langsmith_config import init_langsmith

# Path to MCP server script (runs as subprocess)
MCP_SERVER_PATH = os.path.join(os.path.dirname(__file__), "agent", "mcp_server.py")

app = FastAPI(
    title="Agricultural AI API",
    description="Unified endpoint for agricultural queries with RAG + Agent + MCP",
    version="6.0.0",
)

# CORS middleware — allows Swagger UI and browser clients to work
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── STARTUP: Build MCP client + agent ONCE ──────────────────────────────────

@app.on_event("startup")
async def startup():
    """
    Called once when FastAPI starts.
    
    We do all the expensive setup here:
      - Start MCP server subprocess
      - Discover all 8 tools via MCP protocol
      - Create the ReAct agent
      - Store everything in app.state so routes can access it
    """
    print("\n🚀 Starting Agricultural AI API...")
    
    # Step 0: Check LangSmith tracing status
    init_langsmith()
    
    # Step 1: Create LLM (used by agent)
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GROQ_API_KEY in .env file")
    
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        api_key=api_key,
    )
    print("✅ LLM loaded")
    
    # Step 2: Start MCP client and discover tools
    tools = None
    mcp_client = None
    
    try:
        mcp_client = MultiServerMCPClient({
            "agri_tools": {
                "command": sys.executable,          # python.exe
                "args": [MCP_SERVER_PATH],          # runs mcp_server.py as subprocess
                "transport": "stdio",               # communicate via stdin/stdout
            }
        })
        
        print("🔧 Connecting to MCP server...")
        tools = await asyncio.wait_for(mcp_client.get_tools(), timeout=15.0)
        print(f"✅ MCP connected! Discovered {len(tools)} tools")
        app.state.mcp_mode = "mcp"
    
    except asyncio.TimeoutError:
        print("⚠️ MCP timeout — falling back to direct LangChain tools")
        from lifecycle.agent.tools import ALL_TOOLS
        tools = ALL_TOOLS
        app.state.mcp_mode = "direct"
    
    except Exception as e:
        print(f"⚠️ MCP failed ({type(e).__name__}) — falling back to direct LangChain tools")
        from lifecycle.agent.tools import ALL_TOOLS
        tools = ALL_TOOLS
        app.state.mcp_mode = "direct"
    
    # Step 3: Create the ReAct agent with discovered tools
    agent = create_react_agent(
        model=llm,
        tools=tools,
        prompt=AGENT_SYSTEM_PROMPT,
    )
    print(f"✅ Agent ready! Mode: {app.state.mcp_mode}, Tools: {len(tools)}")
    
    # Step 4: Store in app.state so all routes can use the SAME agent
    app.state.agent = agent
    app.state.mcp_client = mcp_client
    print("✅ API is ready to serve requests!\n")


@app.on_event("shutdown")
async def shutdown():
    """Clean up MCP client subprocess when shutting down"""
    print("👋 Shutting down API...")
    if hasattr(app.state, "mcp_client") and app.state.mcp_client:
        try:
            await app.state.mcp_client.__aexit__(None, None, None)
        except Exception:
            pass


# ─── Request/Response Models ──────────────────────────────────────────────────

class QueryRequest(BaseModel):
    question: str
    force_rag: Optional[bool] = False


class UnifiedResponse(BaseModel):
    question: str
    answer: str
    method: Literal["agent", "rag"]
    tools_used: List[str]
    contexts: List[str]


# ─── Endpoints ────────────────────────────────────────────────────────────────

@app.post("/query", response_model=UnifiedResponse)
async def unified_endpoint(request: QueryRequest) -> dict:
    """
    Unified endpoint — uses the pre-built agent from app.state.
    """
    if request.force_rag:
        res = rag_query(request.question)
        return {
            "question": request.question,
            "answer": res["answer"],
            "method": "rag",
            "tools_used": ["rag_only"],
            "contexts": res["contexts"],
        }
    
    # Run agent using the pre-built instance
    result = await run_agent(app.state.agent, request.question)
    method = "rag" if result["tools_used"] == ["rag_knowledge_search"] else "agent"
    
    return {
        "question": request.question,
        "answer": result["answer"],
        "method": method,
        "tools_used": result["tools_used"],
        "contexts": result.get("contexts", []),
    }


@app.get("/")
def root():
    """Health check"""
    mcp_mode = getattr(app.state, "mcp_mode", "not started")
    return {
        "status": "healthy",
        "message": "Agricultural AI API",
        "version": "6.0.0",
        "mcp_mode": mcp_mode,
        "endpoints": {
            "unified_query": "POST /query",
        },
        "docs": "/docs",
    }
