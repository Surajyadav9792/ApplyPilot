const axios = require("axios");
require("dotenv").config();

async function test() {
  const models = ["qwen/qwen3-8b:free", "meta-llama/llama-4-scout:free", "google/gemma-4-26b-a4b-it:free"];
  
  for (const model of models) {
    console.log("Testing:", model);
    try {
      const r = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: model,
          messages: [
            { role: "system", content: "Return ONLY valid JSON. No markdown." },
            { role: "user", content: "Return a JSON object with subject and greeting keys." }
          ],
          max_tokens: 200,
          temperature: 0.7,
          response_format: { type: "json_object" },
        },
        {
          headers: {
            Authorization: "Bearer " + process.env.OPENROUTER_API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );
      console.log("  OK:", r.data?.choices?.[0]?.message?.content?.substring(0, 100));
    } catch (e) {
      console.log("  FAIL:", e.response?.status, e.response?.data?.error?.message || e.message);
    }
    console.log("");
  }
}

test();
