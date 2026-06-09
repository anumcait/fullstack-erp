
import os
import sys

# Ensure parent of lifecycle is in path so we can import lifecycle.xxx
ROOT = r"c:\Users\sai\lifecycle"
PARENT = os.path.dirname(ROOT)
if PARENT not in sys.path:
    sys.path.insert(0, PARENT)

from dotenv import load_dotenv
load_dotenv(os.path.join(ROOT, ".env"))

from langchain_groq import ChatGroq
from ragas.llms import LangchainLLMWrapper
from ragas.metrics import Faithfulness

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
ragas_llm = LangchainLLMWrapper(llm)

# Instantiate
metric = Faithfulness()
metric.llm = ragas_llm

# Mock data
row = {
    'question': 'What is the color of the sky?', 
    'answer': 'The sky is blue.', 
    'contexts': ['The sky appears blue during the day due to Rayleigh scattering.']
}

print("Running score...")
score = metric.score(row)
print(f"Score: {score}")
