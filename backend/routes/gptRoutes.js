// const express = require("express");
// const router = express.Router();
// const fetch = require("node-fetch"); // or axios

// router.post("/query", async (req, res) => {
//   const { query } = req.body;
//   if (!query) return res.status(400).json({ error: "Query is required" });

//   try {
//     const response = await fetch("http://172.18.0.4:5001/query", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ query, db_data: [] })
//     });

//     const data = await response.json();
//     res.json({ result: data.result });
//   } catch (err) {
//     console.error("Error calling GPT server:", err);
//     res.json({ result: "Error generating response." });
//   }
// });

// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const axios = require("axios");

// // Forward request to GPT microservice
// router.post("/query", async (req, res) => {
//   const { query } = req.body;
//   if (!query) return res.status(400).json({ error: "Query is required" });

//   try {
//     const response = await axios.post("http://hr-genai:5001/query", {
//       query,
//       db_data: [] // optionally pass DB data
//     });
//     res.json({ result: response.data.reply });
//   } catch (err) {
//     console.error("Error calling GPT service:", err.message);
//     res.json({ result: "Error generating response." });
//   }
// });

// module.exports = router;

// backend/routes/gptRoutes.js
const express = require("express");
const router = express.Router();
const { spawnSync } = require("child_process");
const Employee = require("../models").EmployeeMaster; // adjust path to your model

// POST /api/gpt/query
router.post("/query", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: "Query is required" });

    // -------- Step 1: Preprocess query for known patterns --------
    // Example: count female employees
    let dbAnswer = "";
    if (/female employees/i.test(query)) {
      const count = await Employee.count({ where: { sex: "F" } });
      dbAnswer = `Number of female employees: ${count}`;
    }
    // Add more patterns if needed

    // -------- Step 2: Build prompt for Llama --------
    let prompt = `You are a friendly HR assistant.\nUser asked: "${query}"\n`;
    if (dbAnswer) prompt += `Relevant data: ${dbAnswer}\n`;
    prompt += `Please answer concisely.`;

    // -------- Step 3: Call Ollama CLI --------
    const result = spawnSync("ollama", ["run", "llama3.1", prompt], {
      encoding: "utf-8",
    });

    if (result.error) throw result.error;
    if (result.stderr) console.error("Ollama stderr:", result.stderr);

    const responseText = result.stdout.trim() || "No response generated.";
    res.json({ result: responseText });
  } catch (err) {
    console.error("GPT route error:", err);
    res.status(500).json({ result: "Error generating response." });
  }
});

module.exports = router;

