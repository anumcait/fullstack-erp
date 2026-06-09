"""
tools.py — Single source of truth for all 8 agricultural tools.

This file contains:
1. Shared data (crop calendars, weather advice, etc.)
2. Core tool functions (the logic)
3. LangChain tool wrappers (for the fallback agent path)
"""

import ast
import os
import requests
from langchain_core.tools import tool


# ─── Shared data (used by multiple tools) ───────────────────────────────────

CROP_CALENDAR = {
    "rice":   {"kharif": {"sowing": "June–July",     "harvesting": "October–November"}},
    "wheat":  {"rabi":   {"sowing": "October–November", "harvesting": "March–April"}},
    "maize":  {"kharif": {"sowing": "June–July",     "harvesting": "September–October"}},
    "cotton": {"kharif": {"sowing": "April–May",     "harvesting": "October–December"}},
}

WEATHER_DATA = {
    "summer":  {"temp": "30-45°C", "advice": "Irrigate early morning/evening. Use mulch. Monitor heat stress."},
    "monsoon": {"temp": "24-32°C", "advice": "Ensure drainage. Ideal for kharif sowing. Watch for fungal diseases."},
    "winter":  {"temp": "5-20°C",  "advice": "Protect from frost. Ideal for rabi crops. Reduce irrigation."},
}

IRRIGATION_DATA = {
    "rice":   {"frequency": "Every 2-3 days",   "method": "Flood irrigation"},
    "wheat":  {"frequency": "Every 15-20 days", "method": "Flood/Sprinkler"},
    "maize":  {"frequency": "Every 8-12 days",  "method": "Furrow irrigation"},
    "cotton": {"frequency": "Every 12-15 days", "method": "Drip/Furrow"},
}

MSP_DATA = {
    "rice":   {"msp": 2320, "season": "Kharif"},
    "wheat":  {"msp": 2425, "season": "Rabi"},
    "maize":  {"msp": 2225, "season": "Kharif"},
    "cotton": {"msp": 7521, "season": "Kharif"},
}


# ─── Tool 1: RAG Knowledge Search ────────────────────────────────────────────

def rag_knowledge_search(question: str) -> dict:
    """Search agricultural knowledge base for crops, farming, soil, irrigation, fertilizers"""
    from lifecycle.rag_query.query_pipeline import rag_query
    try:
        # Now returns {"answer": str, "contexts": list}
        return rag_query(question)
    except Exception as e:
        return {"answer": f"Search failed: {str(e)}", "contexts": []}


# ─── Tool 2: Crop Calendar ────────────────────────────────────────────────────

def crop_calendar_lookup(crop_name: str) -> str:
    """Get planting and harvesting times for rice, wheat, maize, cotton"""
    crop = crop_name.strip().lower()
    if crop not in CROP_CALENDAR:
        return f"No data for '{crop_name}'. Available: rice, wheat, maize, cotton"
    seasons = CROP_CALENDAR[crop]
    lines = [f"Crop Calendar - {crop_name.title()}:"]
    for season, times in seasons.items():
        lines.append(f"  {season.title()}: Sowing {times['sowing']}, Harvesting {times['harvesting']}")
    return "\n".join(lines)


# ─── Tool 3: Soil Health Analyzer ────────────────────────────────────────────

def soil_health_analyzer(nitrogen: float, phosphorus: float, potassium: float, ph: float) -> str:
    """Analyze soil NPK (kg/ha) and pH levels"""
    recs = []
    if nitrogen < 250:
        recs.append("LOW Nitrogen (<250): Apply urea")
    elif nitrogen > 500:
        recs.append("HIGH Nitrogen (>500): Reduce fertilizer")
    else:
        recs.append("Nitrogen OK (250-500)")

    if phosphorus < 10:
        recs.append("LOW Phosphorus (<10): Apply DAP")
    elif phosphorus > 25:
        recs.append("HIGH Phosphorus (>25): Reduce inputs")
    else:
        recs.append("Phosphorus OK (10-25)")

    if potassium < 110:
        recs.append("LOW Potassium (<110): Apply MOP")
    elif potassium > 280:
        recs.append("HIGH Potassium (>280): No need")
    else:
        recs.append("Potassium OK (110-280)")

    if ph < 5.5:
        recs.append(f"ACIDIC pH ({ph}): Apply lime")
    elif ph > 8.0:
        recs.append(f"ALKALINE pH ({ph}): Apply gypsum")
    else:
        recs.append(f"pH OK ({ph})")

    return f"Soil Report (N:{nitrogen}, P:{phosphorus}, K:{potassium}, pH:{ph})\n" + "\n".join(recs)


# ─── Tool 4: Farm Calculator ──────────────────────────────────────────────────

def farm_calculator(expression: str) -> str:
    """Calculate math for area, yield, costs. Example: '100*50' or '(100*50)/1000'"""
    try:
        tree = ast.parse(expression, mode="eval")
        for node in ast.walk(tree):
            if not isinstance(node, (
                ast.Expression, ast.BinOp, ast.UnaryOp, ast.Constant,
                ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Mod, ast.Pow,
                ast.FloorDiv, ast.USub, ast.UAdd,
            )):
                return "Unsupported operation"
        result = eval(compile(tree, "<calc>", "eval"))
        return f"Result: {expression} = {result}"
    except (SyntaxError, ValueError):
        return "Invalid expression"
    except ZeroDivisionError:
        return "Error: Division by zero"


# ─── Tool 5: Current Weather (Real-time API) ─────────────────────────────────

def get_current_weather(location: str) -> str:
    """Get current weather for a location. Example: 'Delhi' or 'Mumbai, India'"""
    api_key = os.getenv("OPENWEATHER_API_KEY")
    if not api_key:
        return "⚠️ Weather API not configured. Set OPENWEATHER_API_KEY in .env file"
    try:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}&units=metric"
        response = requests.get(url, timeout=5)
        if response.status_code == 404:
            return f"❌ Location '{location}' not found. Try: 'Delhi, India'"
        if response.status_code == 429:
            return "⚠️ Weather API rate limit. Try again in a minute."
        if response.status_code == 401:
            return "⚠️ Invalid API key. Check your OPENWEATHER_API_KEY"
        response.raise_for_status()
        data = response.json()
        temp        = data["main"]["temp"]
        feels_like  = data["main"]["feels_like"]
        humidity    = data["main"]["humidity"]
        description = data["weather"][0]["description"]
        wind_speed  = data.get("wind", {}).get("speed", 0)
        return (
            f"Weather in {location}:\n"
            f"  🌡️  Temperature: {temp}°C (feels like {feels_like}°C)\n"
            f"  💧 Humidity: {humidity}%\n"
            f"  🌤️  Conditions: {description.title()}\n"
            f"  💨 Wind: {wind_speed} m/s"
        )
    except requests.Timeout:
        return "⚠️ Weather API timed out. Check your internet connection."
    except requests.RequestException:
        return "⚠️ Failed to get weather. Check API key and internet connection."


# ─── Tool 6: Weather Advisory (Seasonal) ─────────────────────────────────────

def weather_advisory(season: str) -> str:
    """Get seasonal farming advice for summer, monsoon, winter"""
    key = season.strip().lower()
    if key not in WEATHER_DATA:
        return "Unknown season. Available: summer, monsoon, winter"
    info = WEATHER_DATA[key]
    return f"{season.title()} Season ({info['temp']})\nAdvice: {info['advice']}"


# ─── Tool 7: Irrigation Advisor ───────────────────────────────────────────────

def irrigation_advisor(crop: str) -> str:
    """Get irrigation schedule for rice, wheat, maize, cotton"""
    key = crop.strip().lower()
    if key not in IRRIGATION_DATA:
        return f"No data for '{crop}'. Available: rice, wheat, maize, cotton"
    info = IRRIGATION_DATA[key]
    return f"Irrigation for {crop.title()}:\n  Frequency: {info['frequency']}\n  Method: {info['method']}"


# ─── Tool 8: Market Price (MSP) ───────────────────────────────────────────────

def market_price_lookup(crop: str) -> str:
    """Get Minimum Support Price (MSP) for rice, wheat, maize, cotton"""
    key = crop.strip().lower()
    if key not in MSP_DATA:
        return f"No MSP data for '{crop}'. Available: rice, wheat, maize, cotton"
    info = MSP_DATA[key]
    return f"{crop.title()} MSP 2025-26: Rs {info['msp']}/quintal ({info['season']} season)"


# ─── LangChain Tool Wrappers ────────────────────────────────────────────────

# We wrap the functions for LangChain's ReAct agent
# These are used when the MCP subprocess is not available (fallback)
rag_knowledge_search_lc = tool(rag_knowledge_search)
crop_calendar_lookup_lc  = tool(crop_calendar_lookup)
soil_health_analyzer_lc  = tool(soil_health_analyzer)
farm_calculator_lc       = tool(farm_calculator)
get_current_weather_lc   = tool(get_current_weather)
weather_advisory_lc      = tool(weather_advisory)
irrigation_advisor_lc    = tool(irrigation_advisor)
market_price_lookup_lc   = tool(market_price_lookup)

# All tools as a list — used by agent_pipeline.py as fallback
ALL_TOOLS = [
    rag_knowledge_search_lc,
    crop_calendar_lookup_lc,
    soil_health_analyzer_lc,
    farm_calculator_lc,
    get_current_weather_lc,
    weather_advisory_lc,
    irrigation_advisor_lc,
    market_price_lookup_lc,
]
