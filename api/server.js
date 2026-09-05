const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Groq = require("groq-sdk");
const path = require("path");

dotenv.config();

const authRoutes = require("../routes/auth");
const { isEmailConfigured } = require("../services/emailService");

const app = express();
app.use(cors());
// Support large payloads for media and images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
if (MONGODB_URI) {
  mongoose
    .connect(MONGODB_URI)
    .then(() =>
      console.log("✓ MongoDB Connected successfully to ANchatbot cluster"),
    )
    .catch((err) => console.error("✗ MongoDB Connection Error:", err.message));
} else {
  console.warn("! MONGODB_URI not found in environment variables");
}

// Authentication Routes
app.use(["/api/auth", "/auth"], authRoutes);

// Health check endpoint
app.get(["/api/health", "/health"], (req, res) => {
  res.json({
    status: "ok",
    mongoDbConnected: mongoose.connection.readyState === 1,
    emailConfigured: isEmailConfigured(),
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    groqModel: process.env.GROQ_MODEL || "qwen/qwen3.8-27b",
    timestamp: new Date().toISOString(),
  });
});

// Initialize Providers
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

const groqApiKey = process.env.GROQ_API_KEY || "";
const groq = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const GROQ_MODEL = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
const GROQ_MODEL_FAST = process.env.GROQ_MODEL_FAST || "qwen/qwen3.8-27b";
const GEMINI_DEFAULT_MODEL = "gemini-3.5-flash-lite";

// Curated Models (Groq + Gemini)
const CURATED_MODELS = [
  {
    id: "qwen/qwen3.8-27b",
    name: "Qwen 3.8 27B",
    tag: "⚡ Ultra Fast",
    description: "Ultra-fast inference on Groq LPUs with superior reasoning & coding",
    provider: "groq",
  },
  {
    id: "gemini-3.5-flash-lite",
    name: "Gemini 3.5 Flash Lite",
    tag: "⚡ Fast Gemini",
    description: "Ultra-compact Google Gemini model with ~1s initial response",
    provider: "gemini",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    tag: "🧠 Deep Thinking",
    description: "Google's flagship multimodal model with deep thinking capabilities",
    provider: "gemini",
  },
  {
    id: "qwen/qwen3.6-27b",
    name: "Qwen 3.6 27B",
    tag: "⚡ Fast",
    description: "High-speed balanced Groq model for conversational intelligence",
    provider: "groq",
  },
  {
    id: "openai/gpt-oss-120b",
    name: "GPT OSS 120B",
    tag: "🧠 120B Reasoning",
    description: "State-of-the-art 120B reasoning model hosted on Groq hardware",
    provider: "groq",
  },
  {
    id: "openai/gpt-oss-20b",
    name: "GPT OSS 20B",
    tag: "⚡ Ultra Fast",
    description: "Ultra-responsive Groq model for swift query answers",
    provider: "groq",
  },
  {
    id: "groq/compound",
    name: "Groq Compound",
    tag: "⚡ Multi-Agent",
    description: "Fast multi-agent compound system on Groq LPUs",
    provider: "groq",
  },
  {
    id: "gemini-pro-latest",
    name: "Gemini Pro (Latest)",
    tag: "🧠 Multimodal Logic",
    description: "Model for complex logic, math, and deep multimodal reasoning",
    provider: "gemini",
  },
];

function trimConversationForModel(messages, maxRecentTurns = 10) {
  if (!Array.isArray(messages) || messages.length <= maxRecentTurns * 2) {
    return messages || [];
  }
  return messages.slice(-maxRecentTurns * 2);
}

// Format messages for Gemini with multimodal support
function buildGeminiContents(messages) {
  const cleanMessages = (messages || []).filter(
    (m) =>
      !m.isError &&
      ((m.content && m.content.trim() !== "") ||
        m.image ||
        (Array.isArray(m.media) && m.media.length > 0)),
  );

  if (cleanMessages.length === 0) {
    return [{ role: "user", parts: [{ text: "Hello" }] }];
  }

  return cleanMessages.map((m) => {
    const role =
      m.role === "assistant" || m.role === "model" ? "model" : "user";
    const parts = [];

    if (m.content && m.content.trim() !== "") {
      parts.push({ text: m.content });
    }

    if (m.image) {
      if (typeof m.image === "string") {
        const match = m.image.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      } else if (
        typeof m.image === "object" &&
        m.image.data &&
        m.image.mimeType
      ) {
        parts.push({
          inlineData: {
            mimeType: m.image.mimeType,
            data: m.image.data.replace(/^data:[^;]+;base64,/, ""),
          },
        });
      }
    }

    if (Array.isArray(m.media)) {
      m.media.forEach((med) => {
        if (typeof med === "string") {
          const match = med.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        } else if (med && med.data && med.mimeType) {
          parts.push({
            inlineData: {
              mimeType: med.mimeType,
              data: med.data.replace(/^data:[^;]+;base64,/, ""),
            },
          });
        }
      });
    }

    if (parts.length === 0) {
      parts.push({ text: " " });
    }

    return { role, parts };
  });
}

// Format messages for Groq chat completions
function buildGroqMessages(messages, systemPrompt) {
  const groqMessages = [];

  if (systemPrompt && typeof systemPrompt === "string" && systemPrompt.trim() !== "") {
    groqMessages.push({ role: "system", content: systemPrompt.trim() });
  }

  const cleanMessages = (messages || []).filter(
    (m) =>
      !m.isError &&
      ((m.content && m.content.trim() !== "") ||
        m.image ||
        (Array.isArray(m.media) && m.media.length > 0)),
  );

  if (cleanMessages.length === 0) {
    groqMessages.push({ role: "user", content: "Hello" });
    return groqMessages;
  }

  cleanMessages.forEach((m) => {
    const role =
      m.role === "assistant" || m.role === "model" ? "assistant" : "user";
    let text = m.content ? m.content.trim() : "";
    if (!text && (m.image || (Array.isArray(m.media) && m.media.length > 0))) {
      text = "[Attached Media Content]";
    }
    groqMessages.push({ role, content: text });
  });

  return groqMessages;
}

// Check if a model belongs to Groq
function isGroqModel(modelId) {
  if (!modelId) return true;
  const m = String(modelId).toLowerCase();
  return (
    m.includes("qwen") ||
    m.includes("llama") ||
    m.includes("gpt-oss") ||
    m.includes("compound") ||
    m.includes("allam") ||
    m.includes("orpheus") ||
    m.startsWith("groq/")
  );
}

// Build auto-failover execution plan
function getExecutionPlan(requestedModel) {
  const plan = [];

  if (isGroqModel(requestedModel)) {
    if (groq) {
      plan.push({ provider: "groq", model: requestedModel || GROQ_MODEL });
      if (GROQ_MODEL_FAST && GROQ_MODEL_FAST !== requestedModel) {
        plan.push({ provider: "groq", model: GROQ_MODEL_FAST });
      }
      if (GROQ_MODEL && GROQ_MODEL !== requestedModel && GROQ_MODEL !== GROQ_MODEL_FAST) {
        plan.push({ provider: "groq", model: GROQ_MODEL });
      }
      if (requestedModel !== "qwen/qwen3.8-27b") {
        plan.push({ provider: "groq", model: "qwen/qwen3.8-27b" });
      }
    }
    if (genAI) {
      plan.push({ provider: "gemini", model: GEMINI_DEFAULT_MODEL });
      plan.push({ provider: "gemini", model: "gemini-3.6-flash" });
    }
  } else {
    if (genAI) {
      plan.push({ provider: "gemini", model: requestedModel || GEMINI_DEFAULT_MODEL });
      if (requestedModel !== GEMINI_DEFAULT_MODEL) {
        plan.push({ provider: "gemini", model: GEMINI_DEFAULT_MODEL });
      }
      plan.push({ provider: "gemini", model: "gemini-3.6-flash" });
    }
    if (groq) {
      plan.push({ provider: "groq", model: GROQ_MODEL });
      if (GROQ_MODEL_FAST && GROQ_MODEL_FAST !== GROQ_MODEL) {
        plan.push({ provider: "groq", model: GROQ_MODEL_FAST });
      }
      plan.push({ provider: "groq", model: "qwen/qwen3.8-27b" });
    }
  }

  const uniquePlan = [];
  const seen = new Set();
  for (const item of plan) {
    const key = `${item.provider}:${item.model}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniquePlan.push(item);
    }
  }

  if (uniquePlan.length === 0) {
    if (groq) uniquePlan.push({ provider: "groq", model: GROQ_MODEL });
    if (genAI) uniquePlan.push({ provider: "gemini", model: GEMINI_DEFAULT_MODEL });
  }

  return uniquePlan;
}

// Groq chat generation
async function generateGroqChat(messages, modelName, temperature, systemPrompt, maxTokens) {
  if (!groq) throw new Error("Groq API key not configured");
  const groqMessages = buildGroqMessages(messages, systemPrompt);
  const response = await groq.chat.completions.create({
    model: modelName,
    messages: groqMessages,
    temperature: Number(temperature) || 0.4,
    max_tokens: Number(maxTokens) || 1024,
  });
  return response.choices[0]?.message?.content || "";
}

// Gemini chat generation with latency timeout protection
async function generateGeminiChat(
  messages,
  modelName,
  temperature,
  systemPrompt,
  maxTokens,
  timeoutMs = 6000,
) {
  if (!genAI) throw new Error("Gemini API key not configured");
  const recentMessages = trimConversationForModel(messages, 10);
  const contents = buildGeminiContents(recentMessages);
  const generativeModel = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction:
      systemPrompt && systemPrompt.trim() !== "" ? systemPrompt.trim() : undefined,
    generationConfig: {
      temperature: Number(temperature) || 0.4,
      maxOutputTokens: Number(maxTokens) || 1024,
    },
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            `Gemini model ${modelName} exceeded latency threshold (${timeoutMs}ms)`,
          ),
        ),
      timeoutMs,
    ),
  );

  const result = await Promise.race([
    generativeModel.generateContent({ contents }),
    timeoutPromise,
  ]);
  return result.response.text();
}

// Groq chat streaming generator
async function* streamGroq(messages, modelName, temperature, systemPrompt, maxTokens) {
  if (!groq) throw new Error("Groq API key not configured");
  const groqMessages = buildGroqMessages(messages, systemPrompt);
  const stream = await groq.chat.completions.create({
    model: modelName,
    messages: groqMessages,
    temperature: Number(temperature) || 0.4,
    max_tokens: Number(maxTokens) || 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) yield text;
  }
}

// Gemini chat streaming generator with first-chunk timeout protection
async function* streamGemini(
  messages,
  modelName,
  temperature,
  systemPrompt,
  maxTokens,
  timeoutMs = 6000,
) {
  if (!genAI) throw new Error("Gemini API key not configured");
  const recentMessages = trimConversationForModel(messages, 10);
  const contents = buildGeminiContents(recentMessages);
  const generativeModel = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction:
      systemPrompt && systemPrompt.trim() !== "" ? systemPrompt.trim() : undefined,
    generationConfig: {
      temperature: Number(temperature) || 0.4,
      maxOutputTokens: Number(maxTokens) || 4096,
    },
  });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            `Gemini model ${modelName} stream initiation timed out (${timeoutMs}ms)`,
          ),
        ),
      timeoutMs,
    ),
  );

  const result = await Promise.race([
    generativeModel.generateContentStream({ contents }),
    timeoutPromise,
  ]);

  const iterator = result.stream[Symbol.asyncIterator]();
  let firstChunk = true;

  while (true) {
    let nextPromise = iterator.next();
    if (firstChunk) {
      nextPromise = Promise.race([nextPromise, timeoutPromise]);
    }
    const { done, value } = await nextPromise;
    if (done) break;
    firstChunk = false;
    const text = value.text();
    if (text) yield text;
  }
}

// Get Available Models endpoint
app.get(["/api/models", "/models"], async (req, res) => {
  try {
    let availableGroqModels = [];
    if (groq) {
      try {
        const groqList = await groq.models.list();
        availableGroqModels = (groqList.data || [])
          .filter((m) => {
            const id = (m.id || "").toLowerCase();
            return (
              !id.includes("whisper") &&
              !id.includes("guard") &&
              !id.includes("safeguard") &&
              !id.includes("embedding") &&
              !id.includes("audio") &&
              !id.includes("orpheus") &&
              !id.includes("tts")
            );
          })
          .map((m) => {
            const matched = CURATED_MODELS.find((cm) => cm.id === m.id);
            return {
              id: m.id,
              name: matched ? matched.name : m.id,
              tag: matched ? matched.tag : "⚡ Fast",
              description: matched
                ? matched.description
                : "Groq High-Speed LPU Inference Model",
              provider: "groq",
            };
          });
      } catch (gErr) {
        console.warn("Could not fetch models dynamically from Groq:", gErr.message);
      }
    }

    let availableGeminiModels = [];
    if (geminiApiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models?key=${geminiApiKey}`,
        );
        if (response.ok) {
          const data = await response.json();
          availableGeminiModels = (data.models || [])
            .filter((m) => {
              if (!m.supportedGenerationMethods?.includes("generateContent")) return false;
              const id = (m.name || "").replace("models/", "").toLowerCase();
              const displayName = (m.displayName || "").toLowerCase();
              const fullStr = `${id} ${displayName}`;
              const bannedTerms = [
                "banana",
                "aqa",
                "custom-tools",
                "custom tools",
                "embedding",
                "imagen",
                "tts",
                "robotics",
                "vision-preview",
                "whisper",
                "learnlm",
                "text-",
                "chat-bison",
                "-image",
                "image-preview",
                "transcribe",
                "lyria",
                "deep research",
                "computer use",
                "agent preview",
              ];
              if (bannedTerms.some((term) => fullStr.includes(term))) return false;
              return true;
            })
            .map((m) => {
              const id = m.name.replace("models/", "");
              const matched = CURATED_MODELS.find((cm) => cm.id === id);
              return {
                id: id,
                name: matched ? matched.name : m.displayName || id,
                tag: matched ? matched.tag : "✨ Gemini",
                description: matched
                  ? matched.description
                  : m.description || "Google Gemini Multimodal Model",
                provider: "gemini",
              };
            });
        }
      } catch (gemErr) {
        console.warn("Could not fetch models dynamically from Gemini:", gemErr.message);
      }
    }

    const combinedMap = new Map();
    // Prioritize curated models
    CURATED_MODELS.forEach((m) => combinedMap.set(m.id, m));
    // Add dynamic Groq models
    availableGroqModels.forEach((m) => {
      if (!combinedMap.has(m.id)) combinedMap.set(m.id, m);
    });
    // Add dynamic Gemini models (avoiding duplicates by id and name)
    const seenNames = new Set(CURATED_MODELS.map((m) => m.name.toLowerCase()));
    availableGeminiModels.forEach((m) => {
      if (!combinedMap.has(m.id) && !seenNames.has(m.name.toLowerCase())) {
        combinedMap.set(m.id, m);
        seenNames.add(m.name.toLowerCase());
      }
    });

    const finalModels = Array.from(combinedMap.values());
    res.json({ models: finalModels.length > 0 ? finalModels : CURATED_MODELS });
  } catch (error) {
    console.warn("Could not fetch models dynamically, using curated list:", error.message);
    res.json({ models: CURATED_MODELS });
  }
});

// Chat endpoint (Standard Response with Auto-Failover)
app.post(["/api/chat", "/chat"], async (req, res) => {
  try {
    const {
      messages,
      model = GROQ_MODEL,
      temperature = 0.4,
      systemPrompt,
      maxTokens = 1024,
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const plan = getExecutionPlan(model);
    let reply = null;
    let lastError = null;

    for (const step of plan) {
      try {
        console.log(`[Chat API] Attempting ${step.provider.toUpperCase()} (${step.model})...`);
        if (step.provider === "groq") {
          reply = await generateGroqChat(
            messages,
            step.model,
            temperature,
            systemPrompt,
            maxTokens,
          );
        } else {
          reply = await generateGeminiChat(
            messages,
            step.model,
            temperature,
            systemPrompt,
            maxTokens,
          );
        }

        if (reply !== null && reply !== undefined) {
          console.log(`[Chat API] Successfully responded using ${step.provider} (${step.model})`);
          break;
        }
      } catch (error) {
        console.warn(
          `[Chat Auto-Failover] ${step.provider} (${step.model}) failed: ${error.message}. Automatically shifting to next alternative...`,
        );
        lastError = error;
      }
    }

    if (reply !== null && reply !== undefined) {
      return res.json({ message: reply });
    }

    console.error("All AI providers and models failed:", lastError);
    res.status(500).json({
      error: lastError?.message || "Failed to process request with available AI services.",
    });
  } catch (error) {
    console.error("Chat API General Error:", error);
    res.status(500).json({
      error: error.message || "Failed to process request.",
    });
  }
});

// Streaming endpoint (Real-time SSE response with Seamless Auto-Failover)
app.post(["/api/chat/stream", "/chat/stream"], async (req, res) => {
  const {
    messages,
    model = GROQ_MODEL,
    temperature = 0.4,
    systemPrompt,
    maxTokens = 4096,
  } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required." });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const streamTimeout = setTimeout(() => {
    if (!req.aborted && !res.writableEnded) {
      res.write(`data: ${JSON.stringify({ error: "Stream timed out." })}\n\n`);
      res.end();
    }
  }, 120000);

  let streamStarted = false;
  let success = false;
  let lastError = null;

  try {
    const plan = getExecutionPlan(model);

    for (const step of plan) {
      if (req.aborted) break;

      try {
        console.log(`[Stream API] Attempting ${step.provider.toUpperCase()} (${step.model})...`);
        const generator =
          step.provider === "groq"
            ? streamGroq(messages, step.model, temperature, systemPrompt, maxTokens)
            : streamGemini(messages, step.model, temperature, systemPrompt, maxTokens);

        for await (const chunk of generator) {
          if (req.aborted) break;
          streamStarted = true;
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }

        if (streamStarted) {
          success = true;
          console.log(
            `[Stream API] Successfully streamed using ${step.provider} (${step.model})`,
          );
          break;
        }
      } catch (err) {
        console.warn(
          `[Stream Auto-Failover] ${step.provider} (${step.model}) failed: ${err.message}.`,
        );
        lastError = err;
        if (streamStarted) {
          break;
        }
        console.warn(
          `[Stream Auto-Failover] Shifting automatically to next fallback without showing error to user...`,
        );
      }
    }

    if (!req.aborted && !res.writableEnded) {
      if (success || streamStarted) {
        res.write("data: [DONE]\n\n");
        res.end();
      } else {
        console.error("All streaming providers failed:", lastError);
        res.write(
          `data: ${JSON.stringify({
            error:
              lastError?.message || "Streaming error occurred with AI providers.",
          })}\n\n`,
        );
        res.end();
      }
    }
  } catch (error) {
    if (!req.aborted && !res.writableEnded) {
      console.error("Fatal Streaming Error:", error);
      res.write(
        `data: ${JSON.stringify({
          error: error.message || "Streaming error occurred.",
        })}\n\n`,
      );
      res.end();
    }
  } finally {
    clearTimeout(streamTimeout);
  }
});

// Export for Vercel serverless
module.exports = app;
