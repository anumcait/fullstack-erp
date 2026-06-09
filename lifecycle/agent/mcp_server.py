"""
mcp_server.py — MCP Server that exposes 8 agricultural tools via stdio.

HOW IT WORKS:
  1. We import the real tool logic from tools_core.py (single source of truth)
  2. We wrap each function with @mcp.tool() so MCP can expose them
  3. When FastAPI starts, this file runs as a subprocess and speaks MCP protocol

WHY ONLY DECORATORS HERE:
  No logic lives here. If you need to fix a tool, fix it in tools_core.py.
"""

import sys
import os
from dotenv import load_dotenv

load_dotenv()

# Make sure the project root is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from mcp.server.fastmcp import FastMCP

# Import all tool functions from the single source of truth
from lifecycle.agent.tools import (
    rag_knowledge_search,
    crop_calendar_lookup,
    soil_health_analyzer,
    farm_calculator,
    get_current_weather,
    weather_advisory,
    irrigation_advisor,
    market_price_lookup,
)

# Create MCP server
mcp = FastMCP("Agricultural AI Tools")

# Register all 8 tools with MCP (just wrapping — no logic here)
mcp.tool()(rag_knowledge_search)
mcp.tool()(crop_calendar_lookup)
mcp.tool()(soil_health_analyzer)
mcp.tool()(farm_calculator)
mcp.tool()(get_current_weather)
mcp.tool()(weather_advisory)
mcp.tool()(irrigation_advisor)
mcp.tool()(market_price_lookup)

# Start MCP server when run as a script (FastAPI calls this as subprocess)
if __name__ == "__main__":
    mcp.run(transport="stdio")
