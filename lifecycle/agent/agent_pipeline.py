"""
agent_pipeline.py — Runs the agent using a pre-built agent from app.state.

HOW IT WORKS (Production pattern):
  - The agent is created ONCE at FastAPI startup (see main.py)
  - This file just runs queries against that pre-built agent
  - Falls back to RAG if anything fails

BEGINNER NOTE:
  Before: Every HTTP request created a new MCP client + new agent (slow!)
  After:  Agent created once at startup, reused for all requests (fast!)
"""

async def run_agent(agent, question: str) -> dict:
    """
    Run a query against the pre-built agent.
    
    Args:
        agent: The ReAct agent created at startup (from app.state.agent)
        question: The user's question
    
    Returns:
        dict: {"answer": str, "tools_used": list[str], "contexts": list[str]}
    """
    result = await agent.ainvoke(
        {"messages": [("user", question)]},
        config={"metadata": {"question": question}},
    )
    
    messages   = result.get("messages", [])
    answer     = ""
    tools_used = []
    contexts   = []
    
    for msg in messages:
        # Collect which tools were called
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            for tc in msg.tool_calls:
                tools_used.append(tc["name"])
        
        # Collect contexts from ToolMessages (especially rag_knowledge_search)
        if msg.type == "tool":
            try:
                # content can be a string (json-encoded) or a dict
                import json
                content = msg.content
                if isinstance(content, str):
                    try:
                        content = json.loads(content)
                    except:
                        pass
                
                if isinstance(content, dict) and "contexts" in content:
                    contexts.extend(content["contexts"])
            except:
                pass

        # Get the final AI answer (AI message with no tool calls = final answer)
        if hasattr(msg, "content") and msg.type == "ai" and not getattr(msg, "tool_calls", None):
            answer = msg.content
    
    if not answer:
        answer = messages[-1].content if messages else "No response"
    
    return {
        "answer": answer.strip(),
        "tools_used": list(dict.fromkeys(tools_used)),  # remove duplicates, keep order
        "contexts": list(dict.fromkeys(contexts)),      # remove duplicates
    }
