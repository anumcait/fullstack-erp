"""
application/app.py — Premium Streamlit Chat UI for Agricultural AI Agent

THREE ENDPOINT MODES:
  1. /query  → Unified (agent + RAG fallback)  — Default
  2. /rag    → RAG only (vector search, no tools)
  3. /agent  → Agent only (all 8 tools, no RAG fallback)

Run:
  streamlit run lifecycle/application/app.py
"""

import requests
import streamlit as st
from datetime import datetime

# ─── Page Config ──────────────────────────────────────────────────────────────

st.set_page_config(
    page_title="AgroAI — Agricultural Intelligence",
    page_icon="🌾",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── Injected CSS: Dark Glassmorphism Premium UI ──────────────────────────────

st.markdown("""
<style>
/* ── Google Font ── */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* ── Global Reset ── */
html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
    background: #0a0e1a;
    color: #e2e8f0;
}

/* ── App background ── */
.stApp {
    background: linear-gradient(135deg, #0a0e1a 0%, #0d1b2a 50%, #0a1628 100%);
    min-height: 100vh;
}

/* ── Sidebar ── */
section[data-testid="stSidebar"] {
    background: linear-gradient(180deg, #0d1b2a 0%, #0a1220 100%);
    border-right: 1px solid rgba(56, 189, 248, 0.15);
}
section[data-testid="stSidebar"] .block-container {
    padding-top: 1.5rem;
}

/* ── Main container ── */
.main .block-container {
    padding: 1.5rem 2rem 6rem 2rem;
    max-width: 1100px;
}

/* ── Header ── */
.hero-header {
    text-align: center;
    padding: 2rem 0 1rem 0;
    border-bottom: 1px solid rgba(56,189,248,0.15);
    margin-bottom: 1.5rem;
}
.hero-title {
    font-size: 2.6rem;
    font-weight: 700;
    background: linear-gradient(135deg, #38bdf8, #818cf8, #34d399);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    letter-spacing: -0.5px;
}
.hero-subtitle {
    color: #64748b;
    font-size: 0.95rem;
    margin-top: 0.4rem;
    font-weight: 400;
}

/* ── Mode pill buttons area ── */
.mode-row {
    display: flex;
    justify-content: center;
    gap: 0.6rem;
    margin-bottom: 1rem;
}

/* ── Chat bubbles ── */
.chat-wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    margin-bottom: 1.5rem;
}

.msg-user {
    display: flex;
    justify-content: flex-end;
}
.msg-user .bubble {
    background: linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%);
    color: #ffffff;
    padding: 0.85rem 1.2rem;
    border-radius: 18px 18px 4px 18px;
    max-width: 72%;
    font-size: 0.95rem;
    line-height: 1.55;
    box-shadow: 0 4px 20px rgba(14,165,233,0.25);
}

.msg-ai {
    display: flex;
    justify-content: flex-start;
    gap: 0.7rem;
    align-items: flex-start;
}
.ai-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #34d399, #059669);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 2px;
    box-shadow: 0 2px 12px rgba(52,211,153,0.3);
}
.msg-ai .bubble {
    background: rgba(17, 30, 50, 0.85);
    border: 1px solid rgba(56,189,248,0.12);
    backdrop-filter: blur(12px);
    color: #e2e8f0;
    padding: 0.95rem 1.2rem;
    border-radius: 4px 18px 18px 18px;
    max-width: 78%;
    font-size: 0.95rem;
    line-height: 1.65;
    box-shadow: 0 4px 24px rgba(0,0,0,0.35);
}

/* ── Meta row (method + tools + time) ── */
.meta-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.6rem;
}
.badge-method-agent {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.5px;
}
.badge-method-rag {
    background: linear-gradient(135deg, #059669, #34d399);
    color: #fff;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.5px;
}
.badge-method-unified {
    background: linear-gradient(135deg, #0ea5e9, #38bdf8);
    color: #fff;
    padding: 2px 10px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.5px;
}
.badge-tool {
    background: rgba(99,102,241,0.18);
    border: 1px solid rgba(99,102,241,0.35);
    color: #a5b4fc;
    padding: 2px 9px;
    border-radius: 999px;
    font-size: 0.70rem;
    font-weight: 500;
}
.time-stamp {
    color: #475569;
    font-size: 0.68rem;
    margin-left: auto;
}

/* ── Error bubble ── */
.bubble-error {
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.3);
    color: #fca5a5;
    padding: 0.85rem 1.2rem;
    border-radius: 4px 18px 18px 18px;
    font-size: 0.9rem;
    max-width: 78%;
}

/* ── Quick prompts ── */
.qp-header {
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 0.5rem;
}

/* ── Sidebar labels ── */
.sidebar-section {
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 1.2rem 0 0.5rem 0;
}
.status-online {
    background: rgba(52,211,153,0.12);
    border: 1px solid rgba(52,211,153,0.35);
    color: #34d399;
    padding: 0.35rem 0.8rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 500;
    text-align: center;
}
.status-offline {
    background: rgba(239,68,68,0.1);
    border: 1px solid rgba(239,68,68,0.3);
    color: #f87171;
    padding: 0.35rem 0.8rem;
    border-radius: 8px;
    font-size: 0.82rem;
    font-weight: 500;
    text-align: center;
}
.tool-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.3rem 0;
    color: #94a3b8;
    font-size: 0.8rem;
}

/* ── Streamlit default overrides ── */
.stButton > button {
    background: linear-gradient(135deg, rgba(14,165,233,0.15), rgba(99,102,241,0.15));
    border: 1px solid rgba(56,189,248,0.3);
    color: #e2e8f0;
    border-radius: 10px;
    font-family: 'Inter', sans-serif;
    font-size: 0.82rem;
    transition: all 0.2s ease;
    padding: 0.35rem 0.8rem;
}
.stButton > button:hover {
    background: linear-gradient(135deg, rgba(14,165,233,0.3), rgba(99,102,241,0.3));
    border-color: rgba(56,189,248,0.6);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(14,165,233,0.2);
}
.stSelectbox > div > div {
    background: rgba(13,27,42,0.8);
    border: 1px solid rgba(56,189,248,0.2);
    border-radius: 10px;
    color: #e2e8f0;
}
.stTextInput > div > div > input {
    background: rgba(13,27,42,0.8);
    border: 1px solid rgba(56,189,248,0.2);
    border-radius: 10px;
    color: #e2e8f0;
}
div[data-testid="stChatInput"] {
    background: rgba(13,27,42,0.9);
    border-top: 1px solid rgba(56,189,248,0.15);
}
div[data-testid="stChatInput"] textarea {
    background: rgba(13,27,42,0.9);
    border: 1px solid rgba(56,189,248,0.25);
    border-radius: 14px;
    color: #e2e8f0;
    font-family: 'Inter', sans-serif;
}
.stRadio > div {
    gap: 0.5rem;
}
.stRadio > div > label {
    background: rgba(13,27,42,0.6);
    border: 1px solid rgba(56,189,248,0.15);
    border-radius: 10px;
    padding: 0.4rem 0.9rem;
    color: #94a3b8;
    font-size: 0.82rem;
    cursor: pointer;
    transition: all 0.2s;
}
/* ── Divider ── */
hr {
    border-color: rgba(56,189,248,0.1);
    margin: 1rem 0;
}
/* ── Stats card ── */
.stats-card {
    background: rgba(13,27,42,0.7);
    border: 1px solid rgba(56,189,248,0.12);
    border-radius: 12px;
    padding: 0.85rem 1rem;
    margin-bottom: 0.6rem;
}
.stats-label {
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}
.stats-value {
    color: #38bdf8;
    font-size: 1.4rem;
    font-weight: 700;
    margin-top: 0.1rem;
}
</style>
""", unsafe_allow_html=True)


# ─── Session State Defaults ───────────────────────────────────────────────────

if "messages" not in st.session_state:
    st.session_state.messages = []

if "stats" not in st.session_state:
    st.session_state.stats = {
        "total": 0,
        "agent_calls": 0,
        "rag_calls": 0,
        "tools_fired": 0,
    }

if "pending_prompt" not in st.session_state:
    st.session_state.pending_prompt = None


# ─── Helper: Call API ─────────────────────────────────────────────────────────

ENDPOINT_MAP = {
    "🔀 Unified  (/query)": "/query",
    "📚 RAG Only  (/rag)": "/rag",
    "🤖 Agent Only  (/agent)": "/agent",
}

TOOL_ICONS = {
    "rag_knowledge_search": "🔍",
    "crop_calendar_lookup": "📅",
    "soil_health_analyzer": "🧪",
    "farm_calculator": "🧮",
    "get_current_weather": "🌦️",
    "weather_advisory": "🌤️",
    "irrigation_advisor": "💧",
    "market_price_lookup": "💹",
}

def call_api(base_url: str, endpoint: str, question: str) -> dict:
    """Call the FastAPI backend and return a normalized response dict."""
    url = f"{base_url.rstrip('/')}{endpoint}"
    payload = {"question": question}

    response = requests.post(url, json=payload, timeout=60)
    response.raise_for_status()
    data = response.json()

    # Normalize across the three endpoint shapes
    answer     = data.get("answer", "No answer returned.")
    tools_used = data.get("tools_used", [])
    method     = data.get("method", endpoint.strip("/"))  # fallback to endpoint name

    return {
        "answer": answer,
        "tools_used": tools_used,
        "method": method,
        "endpoint": endpoint,
    }


def check_health(base_url: str) -> bool:
    try:
        r = requests.get(f"{base_url.rstrip('/')}/", timeout=3)
        return r.status_code == 200
    except Exception:
        return False


def render_method_badge(method: str, endpoint: str) -> str:
    label_map = {
        "agent":   ("🤖 Agent",   "badge-method-agent"),
        "rag":     ("📚 RAG",     "badge-method-rag"),
        "rag_fallback": ("📚 RAG Fallback", "badge-method-rag"),
    }
    if method in label_map:
        label, cls = label_map[method]
    elif endpoint == "/query":
        label, cls = "🔀 Unified", "badge-method-unified"
    elif endpoint == "/rag":
        label, cls = "📚 RAG", "badge-method-rag"
    else:
        label, cls = "🤖 Agent", "badge-method-agent"
    return f'<span class="{cls}">{label}</span>'


def render_tool_badges(tools: list) -> str:
    if not tools:
        return ""
    badges = ""
    for t in tools:
        icon = TOOL_ICONS.get(t, "🔧")
        badges += f'<span class="badge-tool">{icon} {t}</span>'
    return badges


# ─── SIDEBAR ─────────────────────────────────────────────────────────────────

with st.sidebar:
    st.markdown('<p style="font-size:1.4rem;font-weight:700;color:#38bdf8;margin:0;">🌾 AgroAI</p>', unsafe_allow_html=True)
    st.markdown('<p style="color:#475569;font-size:0.78rem;margin-top:0.2rem;">Agricultural Intelligence Platform</p>', unsafe_allow_html=True)

    # ── API Config ──
    st.markdown('<div class="sidebar-section">⚙️ API Configuration</div>', unsafe_allow_html=True)
    api_base = st.text_input(
        "Backend URL",
        value="http://localhost:8000",
        label_visibility="collapsed",
        placeholder="http://localhost:8000",
    )

    # ── Connection Status ──
    is_online = check_health(api_base)
    if is_online:
        st.markdown('<div class="status-online">🟢 &nbsp;Backend Connected</div>', unsafe_allow_html=True)
    else:
        st.markdown('<div class="status-offline">🔴 &nbsp;Backend Offline</div>', unsafe_allow_html=True)

    # ── Endpoint Mode ──
    st.markdown('<div class="sidebar-section">🗂️ Query Mode</div>', unsafe_allow_html=True)
    selected_mode = st.radio(
        "Query Mode",
        options=list(ENDPOINT_MAP.keys()),
        index=0,
        label_visibility="collapsed",
    )
    selected_endpoint = ENDPOINT_MAP[selected_mode]

    # Mode description
    MODE_DESC = {
        "/query": "🔀 Routes to Agent or RAG automatically based on question complexity.",
        "/rag": "📚 Searches the Pinecone knowledge base only. No tool calls.",
        "/agent": "🤖 Always uses the ReAct agent with all 8 tools available.",
    }
    st.markdown(
        f'<p style="color:#475569;font-size:0.78rem;line-height:1.5;margin-top:0.3rem;">'
        f'{MODE_DESC[selected_endpoint]}</p>',
        unsafe_allow_html=True,
    )

    st.markdown("---")

    # ── Session Stats ──
    st.markdown('<div class="sidebar-section">📊 Session Stats</div>', unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        st.markdown(
            f'<div class="stats-card">'
            f'<div class="stats-label">Queries</div>'
            f'<div class="stats-value">{st.session_state.stats["total"]}</div>'
            f'</div>', unsafe_allow_html=True
        )
    with col2:
        st.markdown(
            f'<div class="stats-card">'
            f'<div class="stats-label">Tools Used</div>'
            f'<div class="stats-value">{st.session_state.stats["tools_fired"]}</div>'
            f'</div>', unsafe_allow_html=True
        )

    col3, col4 = st.columns(2)
    with col3:
        st.markdown(
            f'<div class="stats-card">'
            f'<div class="stats-label">Agent Calls</div>'
            f'<div class="stats-value">{st.session_state.stats["agent_calls"]}</div>'
            f'</div>', unsafe_allow_html=True
        )
    with col4:
        st.markdown(
            f'<div class="stats-card">'
            f'<div class="stats-label">RAG Calls</div>'
            f'<div class="stats-value">{st.session_state.stats["rag_calls"]}</div>'
            f'</div>', unsafe_allow_html=True
        )

    st.markdown("---")

    # ── Tool Reference ──
    st.markdown('<div class="sidebar-section">🛠️ Available Tools</div>', unsafe_allow_html=True)
    TOOLS_REF = [
        ("🔍", "rag_knowledge_search", "Knowledge base search"),
        ("📅", "crop_calendar_lookup",  "Sowing & harvest times"),
        ("🧪", "soil_health_analyzer",  "NPK & pH analysis"),
        ("🧮", "farm_calculator",        "Math & area calc"),
        ("🌦️", "get_current_weather",   "Real-time weather"),
        ("🌤️", "weather_advisory",      "Seasonal farming tips"),
        ("💧", "irrigation_advisor",     "Watering schedules"),
        ("💹", "market_price_lookup",    "MSP price lookup"),
    ]
    for icon, name, desc in TOOLS_REF:
        st.markdown(
            f'<div class="tool-item">{icon} <span title="{name}" style="color:#94a3b8;font-size:0.79rem;">{desc}</span></div>',
            unsafe_allow_html=True,
        )

    st.markdown("---")

    # ── Clear Chat ──
    if st.button("🗑️  Clear Chat History", use_container_width=True):
        st.session_state.messages = []
        st.session_state.stats = {"total": 0, "agent_calls": 0, "rag_calls": 0, "tools_fired": 0}
        st.rerun()


# ─── MAIN AREA ────────────────────────────────────────────────────────────────

# Header
st.markdown("""
<div class="hero-header">
    <h1 class="hero-title">🌾 Agricultural Intelligence</h1>
    <p class="hero-subtitle">Powered by LLaMA 3.3 · Pinecone RAG · 8 Specialized Tools · MCP Protocol</p>
</div>
""", unsafe_allow_html=True)

# Active mode banner
MODE_COLORS = {
    "/query":  "rgba(14,165,233,0.08)",
    "/rag":    "rgba(52,211,153,0.08)",
    "/agent":  "rgba(99,102,241,0.08)",
}
MODE_BORDER = {
    "/query":  "rgba(14,165,233,0.25)",
    "/rag":    "rgba(52,211,153,0.25)",
    "/agent":  "rgba(99,102,241,0.25)",
}
st.markdown(
    f'<div style="background:{MODE_COLORS[selected_endpoint]};border:1px solid {MODE_BORDER[selected_endpoint]};'
    f'border-radius:12px;padding:0.6rem 1.1rem;margin-bottom:1.2rem;text-align:center;">'
    f'<span style="font-size:0.82rem;font-weight:600;color:#94a3b8;">Active Endpoint: </span>'
    f'<span style="font-size:0.85rem;font-weight:700;color:#e2e8f0;">{selected_mode}</span>'
    f'</div>',
    unsafe_allow_html=True,
)

# ── Quick Prompts (only when chat is empty) ────────────────────────────────
QUICK_PROMPTS = [
    ("🌱", "When to sow rice in India?"),
    ("🧪", "Analyze soil: N=200, P=12, K=150, pH=6.5"),
    ("🌦️", "Current weather in Delhi?"),
    ("💹", "What is the MSP for wheat in 2025-26?"),
    ("💧", "Irrigation schedule for cotton crop"),
    ("🌿", "Best fertilizer for maize crop in monsoon?"),
    ("📐", "Calculate yield: 100 acres × 2500 kg/acre"),
    ("🌾", "What are kharif and rabi crops?"),
]

if not st.session_state.messages:
    st.markdown('<p class="qp-header">✨ Quick Start — click a question to begin</p>', unsafe_allow_html=True)

    for i in range(0, len(QUICK_PROMPTS), 4):
        cols = st.columns(4)
        for j, col in enumerate(cols):
            if i + j < len(QUICK_PROMPTS):
                icon, prompt = QUICK_PROMPTS[i + j]
                with col:
                    if st.button(f"{icon} {prompt}", key=f"qp_{i+j}", use_container_width=True):
                        st.session_state.pending_prompt = prompt
                        st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)


# ── Render Chat History ────────────────────────────────────────────────────
for msg in st.session_state.messages:
    if msg["role"] == "user":
        st.markdown(
            f'<div class="msg-user"><div class="bubble">{msg["content"]}</div></div>',
            unsafe_allow_html=True,
        )
    else:
        method_badge  = render_method_badge(msg.get("method", ""), msg.get("endpoint", "/query"))
        tool_badges   = render_tool_badges(msg.get("tools_used", []))
        timestamp     = msg.get("time", "")
        answer_html   = msg["content"].replace("\n", "<br>")

        if msg.get("is_error"):
            st.markdown(
                f'<div class="msg-ai">'
                f'<div class="ai-avatar">🌾</div>'
                f'<div class="bubble-error">⚠️ {answer_html}</div>'
                f'</div>',
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                f'<div class="msg-ai">'
                f'<div class="ai-avatar">🌾</div>'
                f'<div style="max-width:78%;">'
                f'<div class="bubble">{answer_html}</div>'
                f'<div class="meta-row">{method_badge}{tool_badges}<span class="time-stamp">{timestamp}</span></div>'
                f'</div>'
                f'</div>',
                unsafe_allow_html=True,
            )

    st.markdown("<div style='margin-bottom:0.5rem'></div>", unsafe_allow_html=True)


# ─── Process a Prompt (from input or quick-button) ────────────────────────────

def submit_question(question: str):
    """Send question to API and update chat state."""
    if not question.strip():
        return

    # Append user message
    st.session_state.messages.append({
        "role": "user",
        "content": question,
    })

    # Show user message immediately
    st.markdown(
        f'<div class="msg-user"><div class="bubble">{question}</div></div>',
        unsafe_allow_html=True,
    )
    st.markdown("<div style='margin-bottom:0.5rem'></div>", unsafe_allow_html=True)

    # Call API with spinner
    with st.spinner("🌾 Thinking..."):
        try:
            result = call_api(api_base, selected_endpoint, question)

            # Update stats
            st.session_state.stats["total"] += 1
            st.session_state.stats["tools_fired"] += len(result["tools_used"])
            if result["method"] in ("agent", "unified"):
                st.session_state.stats["agent_calls"] += 1
            else:
                st.session_state.stats["rag_calls"] += 1

            # Append AI message
            timestamp = datetime.now().strftime("%H:%M")
            st.session_state.messages.append({
                "role": "assistant",
                "content": result["answer"],
                "tools_used": result["tools_used"],
                "method": result["method"],
                "endpoint": selected_endpoint,
                "time": timestamp,
                "is_error": False,
            })

        except requests.exceptions.ConnectionError:
            st.session_state.messages.append({
                "role": "assistant",
                "content": f"Cannot connect to backend at `{api_base}`.\n\nStart the server:\n```\nuvicorn lifecycle.main:app --reload\n```",
                "is_error": True,
            })
        except requests.exceptions.Timeout:
            st.session_state.messages.append({
                "role": "assistant",
                "content": "Request timed out. The backend took too long to respond. Try again.",
                "is_error": True,
            })
        except Exception as e:
            st.session_state.messages.append({
                "role": "assistant",
                "content": f"Unexpected error: {str(e)}",
                "is_error": True,
            })


# Handle pending quick-prompt (from button click before rerun)
if st.session_state.pending_prompt:
    prompt = st.session_state.pending_prompt
    st.session_state.pending_prompt = None
    submit_question(prompt)
    st.rerun()


# ── Chat Input Bar ─────────────────────────────────────────────────────────
user_input = st.chat_input(
    f"Ask a farming question... (mode: {selected_endpoint})",
)

if user_input:
    submit_question(user_input)
    st.rerun()
