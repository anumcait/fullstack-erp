import os
import sys
import asyncio
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

# AI Libraries
from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from rag_system import rag_system
from dotenv import load_dotenv

load_dotenv()

# --- LIFECYCLE MANAGMENT ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    This matches the 'Lifecycle' project pattern:
    Setup tools and agent ONCE at startup.
    """
    print("\n🚀 Initializing ERP Lifecycle Agent...")
    
    # 0. Initialize RAG Knowledge DB
    rag_system.initialize_db()
    
    # 1. Setup LLM
    api_key = os.getenv("GROQ_API_KEY", "PASTE_YOUR_GROQ_KEY_HERE")
    llm = ChatGroq(model="llama-3.3-70b-versatile", api_key=api_key)
    
    # 2. Discover Tools (via MCP)
    mcp_server_path = os.path.join(os.path.dirname(__file__), "mcp_server.py")
    try:
        mcp_client = MultiServerMCPClient({
            "erp_tools": {
                "command": sys.executable,
                "args": [mcp_server_path],
                "transport": "stdio",
            }
        })
        tools = await mcp_client.get_tools()
        print(f"✅ Discovered {len(tools)} tools via MCP")
        
        # 3. Create Agent
        app.state.agent = create_react_agent(model=llm, tools=tools)
        app.state.mcp_client = mcp_client
        print("✅ Lifecycle Agent Build Complete!")
        
    except Exception as e:
        print(f"⚠️ MCP Initialization failed: {e}. Falling back to manual tool mode.")
        from tools import ALL_TOOLS
        app.state.agent = create_react_agent(model=llm, tools=ALL_TOOLS)

    yield
    
    # Shutdown
    if hasattr(app.state, 'mcp_client'):
        await app.state.mcp_client.__aexit__(None, None, None)

app = FastAPI(title="ERP Lifecycle Agent", lifespan=lifespan)

class ChatQuery(BaseModel):
    query: str
    user_context: dict = {}

@app.post("/process")
async def process_query(chat: ChatQuery):
    """
    Uses the persistent agent from app.state
    """
    if not hasattr(app.state, 'agent'):
        raise HTTPException(status_code=503, detail="Agent not ready")
        
    try:
        # Construct message with context
        user_msg = f"User: {chat.query}\nContext: {chat.user_context}"
        
        # Run the professional ReAct agent
        response = await app.state.agent.ainvoke({"messages": [("user", user_msg)]})
        
        # Extract the last message from the agent
        last_message = response["messages"][-1].content
        
        return {
            "result": last_message,
            "options": ["Check Leaves", "Attendance Trends", "Go Back"]
        }
    except Exception as e:
        return {"result": f"Agent processing error: {str(e)}"}
