const { spawnSync } = require("child_process");
const path = require("path");

const PYTHON_SCRIPT_PATH = path.resolve(__dirname, "summarizer.py"); // adjust if inside backend folder

function generateSQL(query, dbData = []) {
  const dbJson = JSON.stringify(dbData);

  const result = spawnSync("python3", [PYTHON_SCRIPT_PATH, query, dbJson], {
    encoding: "utf-8"
  });

  if (result.error) throw result.error;
  if (result.stderr) console.error(result.stderr);

  return result.stdout || "No response generated";
}

module.exports = { generateSQL };
