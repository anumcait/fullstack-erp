"""
evaluation/dataset.py — Mini RAG Dataset (5 questions).
Focuses on RAG-intensive questions to see non-zero RAGAS scores.
"""

GOLDEN_DATASET = [
    {
        "inputs":  {"question": "What is the difference between kharif and rabi crops?"},
        "outputs": {"answer": "Kharif crops are sown in monsoon (June-July) and harvested in autumn. Rabi crops are sown in winter (Oct-Nov) and harvested in spring."},
    },
    {
        "inputs":  {"question": "Which fertilizer should I use for wheat to improve yield?"},
        "outputs": {"answer": "For wheat, use urea for nitrogen and DAP (Phosphorus). Apply based on soil test results."},
    },
    {
        "inputs":  {"question": "How should I protect my crops in summer?"},
        "outputs": {"answer": "In summer (30-45°C), irrigate early morning/evening, use mulch, and monitor for heat stress."},
    },
    {
        "inputs":  {"question": "How often should I irrigate my wheat crop?"},
        "outputs": {"answer": "Wheat should be irrigated every 15-20 days using flood or sprinkler methods."},
    },
    {
        "inputs":  {"question": "What planting advice do you have for the Monsoon season?"},
        "outputs": {"answer": "During monsoon: ensure proper drainage, ideal for kharif sowing, and watch for fungal diseases."},
    },
]

def get_dataset() -> list[dict]:
    return GOLDEN_DATASET
