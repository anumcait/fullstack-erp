# Agricultural AI Agent - Simple Guide

## What is this?

An AI agent that can:
- Answer agricultural questions using RAG (knowledge search)
- Use 8 helpful tools via MCP (Model Context Protocol)
- Calculate, analyze soil, check weather, and more

## 8 Tools

1. **rag_knowledge_search** - Search farming knowledge base
2. **crop_calendar_lookup** - Planting/harvesting times
3. **soil_health_analyzer** - Analyze NPK and pH
4. **farm_calculator** - Math calculations
5. **get_current_weather** - Real-time weather for any location
6. **weather_advisory** - Seasonal farming tips
7. **irrigation_advisor** - Watering schedules
8. **market_price_lookup** - MSP prices

## Quick Start

### 1. Setup Environment

```bash
# .env file
GROQ_API_KEY=your-groq-key
PINECONE_API_KEY=your-pinecone-key
PINECONE_INDEX_NAME=your-index-name
OPENWEATHER_API_KEY=your-openweather-key  # Get free at openweathermap.org
```

**Get free OpenWeather API key:** https://openweathermap.org/api

### 2. Python Usage

```python
# Start the server first, then use the API
# See API Usage section below
```

### 3. API Usage

```bash
# Start server
uvicorn lifecycle.main:app --reload

# Test endpoint
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is rice?"}'
```

## File Structure

```
lifecycle/
├── rag_query/
│   └── query_pipeline.py    # RAG search (90 lines)
├── agent/
│   ├── agent_pipeline.py    # Agent logic (110 lines)
│   ├── mcp_server.py        # 7 tools via MCP (170 lines)
│   └── tools.py             # Tool definitions (200 lines)
└── main.py                  # FastAPI server (90 lines)
```

## How It Works

1. **RAG**: Searches Pinecone vector DB → Generates answer
2. **Agent**: Connects to MCP server → Discovers 7 tools → Picks best tool(s)
3. **FastAPI**: Routes requests to Agent (default) or RAG (if `force_rag=True`)

## Examples

```python
# Example 1: Simple question (uses RAG)
query("What is wheat?")

# Example 2: Complex question (uses multiple tools)
query("When to sow rice? Also calculate 100*50")
# Tools used: crop_calendar_lookup, farm_calculator

# Example 3: Soil analysis
query("Analyze soil: N=300, P=15, K=200, pH=7")
# Tools used: soil_health_analyzer

# Example 4: Force RAG only
query("What is maize?", force_rag=True)
```

## Beginner-Friendly Design

- ✅ **Minimal code** - Each file is small and focused
- ✅ **Clear structure** - Easy to follow logic
- ✅ **Short comments** - Only where needed
- ✅ **7 essential tools** - Not overwhelming
- ✅ **Simple API** - Single `POST /query` endpoint handles everything

## MCP (Model Context Protocol)

MCP lets the agent discover tools dynamically:
- Agent starts `mcp_server.py` as subprocess
- Agent asks "what tools exist?"
- MCP server responds with 7 tools
- Agent uses them as needed

**Why MCP?**
- ✅ Tools are modular (easy to add/remove)
- ✅ Agent discovers them automatically
- ✅ Standard protocol (can work with any MCP server)

## Code Size Summary

| File | Lines | Purpose |
|------|-------|---------|
| query_pipeline.py | 90 | RAG search |
| agent_pipeline.py | 110 | Agent logic |
| tools.py | 200 | 7 tool definitions |
| mcp_server.py | 170 | MCP server (exposes tools) |
| main.py | 90 | FastAPI server |

**Total: ~660 lines** of clean, simple code

---

Built with: Groq (llama-3.3-70b), Pinecone, LangChain, LangGraph, MCP, FastAPI
