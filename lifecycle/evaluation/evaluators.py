"""
evaluation/evaluators.py — LLM-as-judge evaluators for LangSmith evaluation.

THREE EVALUATORS:
  1. correctness_evaluator   — Does the answer match the reference? (0.0–1.0)
  2. faithfulness_evaluator  — Is the answer factual / no hallucination? (0.0–1.0)
  3. tool_relevance_evaluator — Did the agent use an appropriate tool? (0 or 1)

SIGNATURE (required by langsmith.evaluate):
  evaluator(run: Run, example: Example) -> dict
    run     — the agent's actual output (run.outputs["answer"], run.outputs["tools_used"])
    example — the golden reference (example.outputs["answer"])
"""

import os
from langchain_groq import ChatGroq


# ─── Shared LLM judge ────────────────────────────────────────────────────────

def _get_judge_llm() -> ChatGroq:
    """Reuse the same Groq LLM as the agent — no extra API key needed."""
    return ChatGroq(
        model="llama-3.3-70b-versatile",
        temperature=0,
        api_key=os.getenv("GROQ_API_KEY"),
    )


# ─── Evaluator 1: Correctness ─────────────────────────────────────────────────

def correctness_evaluator(run, example) -> dict:
    """
    LLM-as-judge: Compare predicted answer vs reference answer.
    Returns score 0.0 (wrong) to 1.0 (correct).
    """
    predicted = (run.outputs or {}).get("answer", "")
    reference = (example.outputs or {}).get("answer", "")
    question  = (example.inputs  or {}).get("question", "")

    if not predicted or not reference:
        return {"key": "correctness", "score": 0.0}

    prompt = f"""You are an expert agricultural AI evaluator.

Question: {question}

Reference Answer (correct): {reference}

Predicted Answer: {predicted}

Score the predicted answer on correctness from 0.0 to 1.0:
- 1.0 = Fully correct, matches the reference in facts and intent
- 0.7 = Mostly correct with minor omissions
- 0.5 = Partially correct
- 0.2 = Mostly wrong but has some relevant content
- 0.0 = Completely wrong or irrelevant

Reply with ONLY a number between 0.0 and 1.0. Nothing else."""

    try:
        llm = _get_judge_llm()
        response = llm.invoke(prompt)
        score = float(response.content.strip())
        score = max(0.0, min(1.0, score))
    except (ValueError, Exception):
        score = 0.0

    return {"key": "correctness", "score": score}


# ─── Evaluator 2: Faithfulness ────────────────────────────────────────────────

def faithfulness_evaluator(run, example) -> dict:
    """
    LLM-as-judge: Is the predicted answer grounded in facts?
    Detects hallucinations — wrong numbers, invented data, etc.
    Returns score 0.0 (hallucinated) to 1.0 (fully faithful).
    """
    predicted = (run.outputs or {}).get("answer", "")
    question  = (example.inputs  or {}).get("question", "")

    if not predicted:
        return {"key": "faithfulness", "score": 0.0}

    prompt = f"""You are an expert agricultural fact-checker.

Question: {question}

Answer to evaluate: {predicted}

Check if the answer contains any hallucinations, made-up numbers, or factually wrong 
agricultural information (wrong MSP values, wrong crop seasons, wrong soil thresholds, etc).

Score from 0.0 to 1.0:
- 1.0 = Completely faithful, no hallucinations
- 0.7 = Mostly faithful, minor inaccuracies
- 0.5 = Some hallucinations present
- 0.0 = Major hallucinations or completely wrong facts

Reply with ONLY a number between 0.0 and 1.0. Nothing else."""

    try:
        llm = _get_judge_llm()
        response = llm.invoke(prompt)
        score = float(response.content.strip())
        score = max(0.0, min(1.0, score))
    except (ValueError, Exception):
        score = 0.0

    return {"key": "faithfulness", "score": score}


# ─── Evaluator 3: Tool Relevance ──────────────────────────────────────────────

# Keyword → expected tool mapping (heuristic, no extra LLM call)
_TOOL_KEYWORD_MAP = {
    "crop_calendar_lookup":  ["sow", "plant", "harvest", "calendar", "season", "kharif", "rabi", "when to"],
    "irrigation_advisor":    ["irrigat", "water", "watering", "drip", "flood", "sprinkler"],
    "market_price_lookup":   ["msp", "market price", "minimum support", "price", "quintal"],
    "soil_health_analyzer":  ["nitrogen", "phosphorus", "potassium", "ph", "npk", "soil test", "soil health"],
    "weather_advisory":      ["summer", "monsoon", "winter", "season", "advice", "seasonal"],
    "get_current_weather":   ["current weather", "weather in", "temperature in", "humidity in"],
    "farm_calculator":       ["calculat", "how many", "total", "area", "hectare", "acre", "yield"],
    "rag_knowledge_search":  ["fertilizer", "pest", "disease", "crop", "farming", "technique"],
}


def tool_relevance_evaluator(run, example) -> dict:
    """
    Heuristic evaluator: Did the agent call a tool relevant to the question?
    Score: 1.0 if the right tool was used (or no tool expected), 0.0 otherwise.
    No LLM call — fast and free.
    """
    question   = (example.inputs  or {}).get("question", "").lower()
    tools_used = (run.outputs     or {}).get("tools_used", [])

    # Find which tool we EXPECT based on keywords
    expected_tool = None
    for tool, keywords in _TOOL_KEYWORD_MAP.items():
        if any(kw in question for kw in keywords):
            expected_tool = tool
            break

    if expected_tool is None:
        # No specific tool expected → pass (RAG or general answer is fine)
        return {"key": "tool_relevance", "score": 1.0}

    if not tools_used:
        # Expected a tool but none was called
        return {"key": "tool_relevance", "score": 0.0}

    # Check if expected tool (or rag_knowledge_search as fallback) was used
    used = set(tools_used)
    if expected_tool in used or "rag_knowledge_search" in used:
        return {"key": "tool_relevance", "score": 1.0}

    return {"key": "tool_relevance", "score": 0.0}


# Export all evaluators as a list for convenience
ALL_EVALUATORS = [
    correctness_evaluator,
    faithfulness_evaluator,
    tool_relevance_evaluator,
]
