import os, asyncio
from typing import Dict, Any
from langchain_groq import ChatGroq
from ragas.metrics import Faithfulness, AnswerRelevancy, ContextRecall, ContextPrecision
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper
from lifecycle.embeddings.embeddings import load_embedding_model

_LLM = ChatGroq(model="llama-3.1-70b-versatile", temperature=0, api_key=os.getenv("GROQ_API_KEY"))
_EMB = load_embedding_model()
RAGAS_LLM, RAGAS_EMB = LangchainLLMWrapper(_LLM), LangchainEmbeddingsWrapper(_EMB)

def ragas_evaluator_factory(metric_class):
    m = metric_class()
    if hasattr(m, "llm"): m.llm = RAGAS_LLM
    if hasattr(m, "embeddings"): m.embeddings = RAGAS_EMB
    def evaluate_metric(run, example) -> dict:
        q = (example.inputs or {}).get("question", "")
        a = (run.outputs or {}).get("answer", "")
        c = (run.outputs or {}).get("contexts", [])
        gt = (example.outputs or {}).get("answer", "")
        name = f"ragas_{m.name}"
        if not c: return {"key": name, "score": 0.0, "comment": "No contexts"}
        data = {"user_input": q, "response": a, "retrieved_contexts": c, "reference": gt}
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            score = loop.run_until_complete(m.ascore(data))
            loop.close()
            return {"key": name, "score": float(score)}
        except Exception as e: return {"key": name, "score": 0.0, "comment": str(e)}
    return evaluate_metric

ragas_faithfulness_eval = ragas_evaluator_factory(Faithfulness)
ragas_answer_relevance_eval = ragas_evaluator_factory(AnswerRelevancy)
ragas_context_recall_eval = ragas_evaluator_factory(ContextRecall)
ragas_context_precision_eval = ragas_evaluator_factory(ContextPrecision)

RAGAS_EVALUATORS = [ragas_faithfulness_eval, ragas_answer_relevance_eval, ragas_context_recall_eval, ragas_context_precision_eval]
