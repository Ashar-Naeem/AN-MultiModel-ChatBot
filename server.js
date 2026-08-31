const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Groq = require("groq-sdk");

const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, "frontend/dist")));

// Initialize Groq SDK
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Default fallback models list matching active Groq API models
const DEFAULT_MODELS = [
  { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", description: "High-capacity flagship model for reasoning & coding" },
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", description: "Fast lightweight model for instant responses" },
  { id: "qwen/qwen3.6-27b", name: "Qwen 3.6 27B", description: "Advanced coding and structured output model" },
  { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B", description: "Latest instruction-tuned model" },
  { id: "groq/compound", name: "Groq Compound", description: "High-performance Groq compound model" },
  { id: "groq/compound-mini", name: "Groq Compound Mini", description: "Ultra-fast compact Groq model" }
];

// Helper to format messages array with system prompt
// Strips non-standard fields (e.g. isError) and skips error messages
function buildMessagesPayload(messages, systemPrompt) {
  // Only keep valid role/content pairs, drop error messages and extra properties
  const cleanMessages = messages
    .filter((m) => !m.isError)
    .map(({ role, content }) => ({ role, content }));

  if (!systemPrompt || systemPrompt.trim() === "") {
    return cleanMessages;
  }
  const hasSystem = cleanMessages.some((m) => m.role === "system");
  if (hasSystem) {
    return cleanMessages.map((m) => (m.role === "system" ? { role: m.role, content: systemPrompt } : m));
  }
  return [{ role: "system", content: systemPrompt }, ...cleanMessages];
}

// Get Available Models endpoint
app.get("/api/models", async (req, res) => {
  try {
    const list = await groq.models.list();
    const activeModels = list.data
      .filter((m) => m.active !== false && !m.id.includes('guard') && !m.id.includes('whisper'))
      .map((m) => {
        const found = DEFAULT_MODELS.find((dm) => dm.id === m.id);
        return found || {
          id: m.id,
          name: m.id,
          description: `Owned by ${m.owned_by || 'Groq'}`
        };
      });

    res.json({ models: activeModels.length > 0 ? activeModels : DEFAULT_MODELS });
  } catch (error) {
    console.warn("Could not fetch models dynamically, using defaults:", error.message);
    res.json({ models: DEFAULT_MODELS });
  }
});

// Chat endpoint (Standard Response)
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model = "openai/gpt-oss-120b", temperature = 0.7, systemPrompt, maxTokens = 1024 } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const payloadMessages = buildMessagesPayload(messages, systemPrompt);

    const chatCompletion = await groq.chat.completions.create({
      messages: payloadMessages,
      model: model,
      temperature: Number(temperature),
      max_completion_tokens: Number(maxTokens),
    });

    const reply = chatCompletion.choices[0]?.message?.content || "";
    res.json({ message: reply });
  } catch (error) {
    console.error("Groq API Error:", error);
    res.status(500).json({ error: error.message || "Failed to process request." });
  }
});

// Streaming endpoint (Real-time response)
app.post("/api/chat/stream", async (req, res) => {
  const { messages, model = "openai/gpt-oss-120b", temperature = 0.7, systemPrompt, maxTokens = 2048 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const payloadMessages = buildMessagesPayload(messages, systemPrompt);

    const stream = await groq.chat.completions.create({
      messages: payloadMessages,
      model: model,
      temperature: Number(temperature),
      max_completion_tokens: Number(maxTokens),
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Groq Streaming Error:", error);
    res.write(`data: ${JSON.stringify({ error: error.message || "Streaming error occurred" })}\n\n`);
    res.end();
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

