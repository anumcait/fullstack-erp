# Agricultural AI Agent Application - Complete Notes

## 📋 Application Overview

This is an Agricultural AI Assistant that helps farmers with crop-related questions using:
- **RAG (Retrieval-Augmented Generation)** for knowledge-based queries
- **8 specialized tools** for calculations, weather, soil analysis, etc.
- **Agent architecture** with MCP (Model Context Protocol) for dynamic tool discovery
- **FastAPI** backend for serving requests

The application intelligently chooses between:
1. Using RAG for general knowledge questions
2. Using specialized tools for specific calculations/data needs
3. Combining both approaches for complex queries

## 🏗️ File Structure

```
lifecycle/
├── agent/                 # Agent logic and MCP server
│   ├── agent_pipeline.py  # Runs queries against pre-built agent
│   ├── mcp_server.py      # Exposes 8 tools via MCP protocol
│   └── tools.py           # Core logic for all 8 tools
├── main.py                # FastAPI server (entry point)
├── rag_query/             # RAG (Retrieval-Augmented Generation) system
│   └── query_pipeline.py  # Main RAG search function
├── embeddings/            # Text embedding functionality
│   └── embeddings.py      # Loads and uses HuggingFace embeddings
├── vectorstore/           # Pinecone vector database operations
│   └── vector_store.py    # Index management and retrieval
├── model/                 # LLM configuration
│   └── llm_config.py      # Groq LLM setup
├── prompts/               # Prompt templates
├── monitoring/            # LangSmith tracing
├── data/                  # Data storage
├── architecture/          # System design docs
└── problem_definition/    # Problem statement docs
```

## ▶️ Where to Start

**Entry Point**: `lifecycle/main.py`

To run the application:
1. Set up environment variables in `.env`:
   ```
   GROQ_API_KEY=your-groq-key
   PINECONE_API_KEY=your-pinecone-key
   PINECONE_INDEX_NAME=your-index-name
   OPENWEATHER_API_KEY=your-openweather-key
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   uvicorn lifecycle.main:app --reload
   ```

4. Test the API:
   ```bash
   curl -X POST http://localhost:8000/query \
     -H "Content-Type: application/json" \
     -d '{"question": "What is rice?"}'
   ```

## 🔧 Component Breakdown

### 1. Main Application (`main.py`)
- **Purpose**: FastAPI server with persistent MCP client and agent
- **Key Features**:
  - Startup event creates MCP client, discovers tools, builds agent ONCE
  - All requests reuse the same agent instance (performance optimization)
  - Graceful shutdown cleans up MCP subprocess
  - Unified `/query` endpoint handles both agent and RAG modes
  - CORS middleware for browser/Swagger UI access

### 2. Agent System (`agent/`)
#### Agent Pipeline (`agent_pipeline.py`)
- Runs queries against the pre-built agent from `app.state.agent`
- Extracts tool usage and contexts from agent responses
- Falls back to RAG if anything fails

#### MCP Server (`mcp_server.py`)
- Exposes 8 agricultural tools via MCP (Model Context Protocol) stdio
- Runs as subprocess when FastAPI starts
- Uses `@mcp.tool()` decorators to wrap tool functions
- **No business logic here** - just protocol wrapping

#### Tools (`tools.py`)
- **Single source of truth** for all 8 tool implementations
- Contains:
  1. Shared data (crop calendars, weather advice, etc.)
  2. Core tool functions (the actual logic)
  3. LangChain tool wrappers (for fallback when MCP unavailable)

##### The 8 Tools:
1. **rag_knowledge_search** - Searches Pinecone vector DB for farming knowledge
2. **crop_calendar_lookup** - Planting/harvesting times for rice, wheat, maize, cotton
3. **soil_health_analyzer** - Analyzes NPK (kg/ha) and pH levels
4. **farm_calculator** - Safe math expression evaluation (area, yield, costs)
5. **get_current_weather** - Real-time weather via OpenWeatherMap API
6. **weather_advisory** - Seasonal farming advice (summer/monsoon/winter)
7. **irrigation_advisor** - Watering schedules for specific crops
8. **market_price_lookup** - Minimum Support Price (MSP) for crops

### 3. RAG System (`rag_query/`)
#### Query Pipeline (`query_pipeline.py`)
- Main RAG function returning answer + source contexts
- Steps:
  1. Load embedding model and Pinecone index
  2. Embed the question into a vector
  3. Retrieve top-k similar chunks from vector DB
  4. Build prompt with question + retrieved contexts
  5. Generate answer using Groq LLM
  6. Return answer and source contexts

### 4. Supporting Systems

#### Embeddings (`embeddings/`)
- Uses `sentence-transformers/all-MiniLM-L6-v2` for text vectorization
- Normalizes embeddings for better cosine similarity

#### Vector Store (`vectorstore/`)
- Manages Pinecone vector database operations
- Initializes index with proper dimensions (384 for MiniLM-L6-v2)
- Stores precomputed embeddings (no re-embedding during search)
- Retrieves relevant text chunks based on vector similarity

#### Model (`model/`)
- Configures Groq LLM (`llama-3.3-70b-versatile`)
- Temperature set to 0 for deterministic outputs
- Shared between RAG and Agent systems

#### Prompts (`prompts/`)
- Contains system prompts for both agent and RAG pipelines
- `AGENT_SYSTEM_PROMPT`: Guides agent tool selection and usage
- `RAG_PROMPTS`: Templates for augmenting questions with retrieved context

## 🔄 Data Flow

### For RAG Queries (`force_rag=True` or agent selects RAG):
1. User question → `/query` endpoint
2. Direct call to `rag_query()` in `query_pipeline.py`
3. Embed question → Search Pinecone → Get contexts
4. Build LLM prompt with question + contexts
5. Generate answer → Return to user

### For Tool/Agent Queries:
1. User question → `/query` endpoint
2. Uses pre-built agent from `app.state.agent`
3. Agent reasons about which tools to use
4. Executes selected tools via MCP (or direct fallback)
5. Combines results into final answer
6. Returns answer + list of tools used + any contexts

### MCP Communication Pattern:
1. FastAPI startup → Launch `mcp_server.py` as subprocess
2. Connect via `MultiServerMCPClient` (stdio transport)
3. Discover available tools once at startup
4. Create ReAct agent with discovered tools
5. All requests reuse this agent (no reconnection overhead)

## ⚙️ Key Design Patterns

### 1. **Persistent Connections**
- MCP client/agent created once at startup
- Eliminates per-request connection overhead
- Critical for production performance

### 2. **Single Source of Truth**
- All tool logic in `tools.py`
- MCP server only wraps functions with decorators
- Easy to maintain and test

### 3. **Graceful Fallbacks**
- If MCP fails → falls back to direct LangChain tools
- If agent fails → falls back to RAG-only mode
- System remains functional under partial failures

### 4. **Separation of Concerns**
- Clear boundaries: networking (main), logic (tools), data (embeddings/vectorstore)
- Each module has single responsibility
- Easy to test components in isolation

### 5. **Production-Ready Patterns**
- Proper error handling and logging
- Environment configuration via `.env`
- Resource cleanup on shutdown
- Health check endpoints
- CORS for web integration

## 📊 Performance Characteristics

- **Startup Time**: ~2-3 seconds (MCP connection, tool discovery, agent creation)
- **Per-Request Latency**: 
  - RAG-only: ~1-2 seconds (vector search + LLM generation)
  - Tool-based: ~0.5-1.5 seconds (depends on tool complexity)
  - Mixed queries: ~1-2.5 seconds
- **Memory Usage**: Moderate (LLM + embedding model + vector cache)
- **Scalability**: Horizontal scaling possible with multiple API instances

## 🛠️ Extending the System

### Adding New Tools:
1. Add function to `tools.py` with clear docstring
2. Add import and registration in `mcp_server.py`
3. Add LangChain wrapper in `tools.py` (auto-included in `ALL_TOOLS`)
4. No changes needed to agent or main.py (auto-discovered)

### Modifying RAG Behavior:
- Adjust `top_k` in `retrieve_chunks()` for more/fewer contexts
- Change embedding model in `embeddings.py`
- Modify prompt templates in `prompts/rag_prompts.py`

### Configuration:
- All API keys and settings via `.env` file
- Pinecone index name configurable
- Model selection in `llm_config.py` and `main.py`

## 🧪 Testing & Validation

### Unit Testing:
- Test individual tool functions in `tools.py`
- Test embedding and vector store operations
- Test RAG pipeline with known questions

### Integration Testing:
- Test full query flow through `/query` endpoint
- Validate tool selection logic
- Check fallback mechanisms work

### Manual Testing Examples:
```
# General knowledge (RAG)
{"question": "What is organic farming?"}

# Single tool (Agent)
{"question": "Calculate 100 * 50"}
{"question": "What is the MSP for wheat?"}

# Multi-tool (Agent)
{"question": "When to sow rice? Also calculate fertilizer needed for 2 acres"}
{"question": "Analyze soil: N=300, P=15, K=200, pH=7 and suggest irrigation"}

# Force RAG (bypass agent)
{"question": "What is rice?", "force_rag": true}
```

## 📝 Summary

This application implements a production-ready agricultural AI assistant that:
- Combines RAG knowledge retrieval with specialized tool usage
- Uses MCP for dynamic, maintainable tool integration
- Optimizes performance through persistent connections
- Provides fallback mechanisms for robustness
- Follows clean architecture principles for maintainability

The system is designed to be:
- **Fast**: Single initialization, reused connections
- **Reliable**: Graceful fallbacks, error handling
- **Maintainable**: Clear separation, single source of truth
- **Extensible**: Easy to add new tools or modify existing ones
- **Production-ready**: Proper logging, configuration, health checks