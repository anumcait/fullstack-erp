from flask import Flask, request, jsonify
from gpt4all import GPT4All
from pathlib import Path

app = Flask(__name__)

# Load model once at startup
model_dir = Path("/app")  # your backend folder
model_name = "gpt4all-falcon-newbpe-q4_0.gguf"  # your model file

print("Loading GPT model... This may take a while the first time.")
model = GPT4All(
    model_name=model_name,
    model_path=str(model_dir),
    allow_download=False
)
print("Model loaded!")

@app.route("/query", methods=["POST"])
def query_model():
    data = request.json
    query = data.get("query", "")
    db_data = data.get("db_data", [])
    prompt = f"Query: {query}\nDB: {db_data}"

    try:
        answer = model.generate(prompt, max_tokens=100)
    except Exception as e:
        return jsonify({"result": f"Error: {str(e)}"})

    return jsonify({"result": answer})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)


# from gpt4all import GPT4All
# import sys, json
# from pathlib import Path

# query = sys.argv[1]
# db_json = sys.argv[2]
# try:
#     db_result = json.loads(db_json)
# except:
#     db_result = []

# # Model file
# model_dir = Path("/app")
# model_name = "gpt4all-falcon-newbpe-q4_0.gguf" 

# model = GPT4All(
#     model_name=model_name,
#     model_path=str(model_dir),
#     allow_download=False,
   
# )

# prompt = f"Query: {query}\nDB: {db_result}"
# answer = model.generate(prompt, max_tokens=100)
# print(answer)
