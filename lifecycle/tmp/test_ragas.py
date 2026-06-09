
import os
import sys

# Ensure parent of lifecycle is in path so we can import lifecycle.xxx
ROOT = r"c:\Users\sai\lifecycle"
PARENT = os.path.dirname(ROOT)
if PARENT not in sys.path:
    sys.path.insert(0, PARENT)

from dotenv import load_dotenv
load_dotenv(os.path.join(ROOT, ".env"))

from lifecycle.evaluation.ragas_evaluators import ragas_faithfulness

# Mock data
run = type('Run', (), {'outputs': {'answer': 'Rice is a Kharif crop.', 'contexts': ['Rice is grown in the Kharif season across many parts of India.']}})
example = type('Example', (), {'inputs': {'question': 'Is rice a kharif crop?'}, 'outputs': {'answer': 'Yes, rice is a Kharif crop.'}})

print("Testing RAGAS Faithfulness...")
result = ragas_faithfulness(run, example)
print(f"Result: {result}")
