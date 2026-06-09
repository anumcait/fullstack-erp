"""
evaluation/run_eval.py — Main evaluation runner.

HOW IT WORKS:
  1. Loads the 20-question golden dataset into LangSmith (creates dataset if new)
  2. Defines a target function that calls POST /query on the running FastAPI server
  3. Runs langsmith.evaluate() — sends all 20 questions, scores with 3 evaluators
  4. Prints a summary table to console
  5. Prints a direct link to the LangSmith Experiments dashboard

USAGE (from project root — FastAPI must be running first):
  python -m lifecycle.evaluation.run_eval

BEGINNER NOTE:
  - This calls YOUR running server (localhost:8000) — same as a real user would
  - Results automatically appear in LangSmith → Experiments tab
  - Each run creates a new Experiment so you can compare over time
"""

import os
import sys
import time
import requests
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from langsmith import Client
from langsmith.evaluation import evaluate

from lifecycle.evaluation.dataset import get_dataset
from lifecycle.evaluation.evaluators import ALL_EVALUATORS as CUSTOM_EVALUATORS
from lifecycle.evaluation.ragas_evaluators import RAGAS_EVALUATORS
from lifecycle.evaluation.report import print_summary

# Combine all evaluators
ALL_EVALUATORS = CUSTOM_EVALUATORS + RAGAS_EVALUATORS


# ─── Config ───────────────────────────────────────────────────────────────────

DATASET_NAME  = "agri-agent-mini-rag-dataset"
FASTAPI_URL   = "http://localhost:8000"
EXPERIMENT_PREFIX = "agri-agent-eval"


# ─── Step 1: Upload / load the dataset on LangSmith ──────────────────────────

def get_or_create_dataset(client: Client) -> object:
    """
    Return existing dataset or create it from our golden Q&A list.
    LangSmith datasets are stored on the cloud — created once, reused forever.
    """
    # Check if dataset already exists
    datasets = list(client.list_datasets(dataset_name=DATASET_NAME))
    if datasets:
        dataset = datasets[0]
        print(f"✅ Dataset found:   '{DATASET_NAME}' ({dataset.id})")
        return dataset

    # Create new dataset
    print(f"📦 Creating dataset '{DATASET_NAME}' on LangSmith...")
    dataset = client.create_dataset(
        dataset_name=DATASET_NAME,
        description="20 golden Q&A pairs covering all 8 AgriBot tools + RAG knowledge",
    )

    # Upload examples
    examples = get_dataset()
    client.create_examples(
        inputs  =[e["inputs"]  for e in examples],
        outputs =[e["outputs"] for e in examples],
        dataset_id=dataset.id,
    )
    print(f"✅ Dataset created with {len(examples)} examples.")
    return dataset


# ─── Step 2: Target function — calls the real FastAPI server ──────────────────

def call_agent(inputs: dict) -> dict:
    """
    Target function called by LangSmith for each example.
    Sends the question to POST /query and returns answer + tools_used.

    Retries up to 3 times on 500 errors (Groq rate limits hit under eval load).
    Waits 10s between retries to let the rate limit window reset.
    """
    question = inputs["question"]
    max_retries = 3

    for attempt in range(1, max_retries + 1):
        try:
            response = requests.post(
                f"{FASTAPI_URL}/query",
                json={"question": question},
                timeout=120,
            )

            if response.status_code == 500:
                error_text = response.text[:200]
                print(f"  ⚠️  500 error (attempt {attempt}/{max_retries}): {error_text[:80]}")
                if attempt < max_retries:
                    wait = 10 * attempt   # 10s, 20s, 30s
                    print(f"     Waiting {wait}s before retry (Groq rate limit)...")
                    time.sleep(wait)
                    continue
                else:
                    return {"answer": f"Server error after {max_retries} retries", "tools_used": [], "contexts": []}

            response.raise_for_status()
            data = response.json()

            # Small delay between successful calls to stay under rate limits
            time.sleep(3)

            return {
                "answer":     data.get("answer", ""),
                "tools_used": data.get("tools_used", []),
                "contexts":   data.get("contexts", []),
            }

        except requests.exceptions.ConnectionError:
            print(f"\n❌ Cannot connect to FastAPI at {FASTAPI_URL}")
            print("   Make sure the server is running:  start.bat  or  uvicorn lifecycle.main:app --port 8000")
            sys.exit(1)
        except requests.exceptions.Timeout:
            print(f"  ⚠️  Timeout on attempt {attempt}/{max_retries}")
            if attempt < max_retries:
                time.sleep(15)
                continue
            return {"answer": "Request timed out after retries", "tools_used": [], "contexts": []}
        except Exception as e:
            return {"answer": f"Error: {str(e)}", "tools_used": [], "contexts": []}

    return {"answer": "Failed after all retries", "tools_used": [], "contexts": []}


# ─── Step 3: Health check ──────────────────────────────────────────────────────

def check_server():
    """Make sure FastAPI is up before starting the long eval run."""
    try:
        r = requests.get(f"{FASTAPI_URL}/", timeout=5)
        r.raise_for_status()
        print(f"✅ FastAPI server is running at {FASTAPI_URL}")
    except Exception:
        print(f"\n❌ FastAPI server not reachable at {FASTAPI_URL}")
        print("   Start it first with:  start.bat  (or Terminal 1)\n")
        sys.exit(1)


# ─── Main ─────────────────────────────────────────────────────────────────────

def run():
    print()
    print("=" * 60)
    print("  🌾 AgroAI — LangSmith Evaluation Run")
    print("=" * 60)

    # Check LangSmith config
    api_key = os.getenv("LANGCHAIN_API_KEY", "")
    project  = os.getenv("LANGCHAIN_PROJECT", "default")
    if not api_key or api_key == "your-langsmith-api-key-here":
        print("❌ LANGCHAIN_API_KEY not set in .env — cannot run evaluation.")
        sys.exit(1)
    print(f"✅ LangSmith project:  {project}")

    # Check server
    check_server()

    # LangSmith client
    client = Client()

    # Get / create dataset
    dataset = get_or_create_dataset(client)

    print(f"\n🚀 Running evaluation on {DATASET_NAME}...")
    print("   Questions run one-at-a-time (sequential) to avoid Groq rate limits.")
    print("   Estimated time: 5-8 minutes\n")

    results = evaluate(
        call_agent,
        data=DATASET_NAME,
        evaluators=ALL_EVALUATORS,
        experiment_prefix=EXPERIMENT_PREFIX,
        metadata={
            "model":   "llama-3.3-70b-versatile",
            "dataset": DATASET_NAME,
        },
        max_concurrency=1,  # Sequential — prevents Groq rate limit 500 errors
    )

    # Print summary
    print_summary(results)

    # LangSmith link
    print(f"\n🔗 Full results → https://smith.langchain.com/projects/p/{project}")
    print("   (Open LangSmith → your project → Experiments tab)\n")


if __name__ == "__main__":
    run()
