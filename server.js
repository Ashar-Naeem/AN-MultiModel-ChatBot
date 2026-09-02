const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

dotenv.config();

const authRoutes = require("./routes/auth");
const { isEmailConfigured } = require("./services/emailService");

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
app.use("/api/auth", authRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    mongoDbConnected: mongoose.connection.readyState === 1,
    emailConfigured: isEmailConfigured(),
    timestamp: new Date().toISOString(),
  });
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, "frontend/dist")));

// Initialize Gemini SDK
const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// Default curated Gemini models
const DEFAULT_MODELS = [
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description: "Fastest balanced model for quick, responsive chat responses",
  },
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    description:
      "Google's flagship multimodal model with ultra-fast inference & reasoning",
  },
  {
    id: "gemini-flash-latest",
    name: "Gemini Flash (Latest)",
    description: "Production-grade high-speed intelligence for coding and chat",
  },
  {
    id: "gemini-pro-latest",
    name: "Gemini Pro (Latest)",
    description:
      "State-of-the-art model for complex logic, math, and code generation",
  },
  {
    id: "gemini-3-flash-preview",
    name: "Gemini 3 Flash Preview",
    description: "Next-gen experimental fast model with high-context abilities",
  },
  {
    id: "gemini-3.1-pro-preview",
    name: "Gemini 3.1 Pro Preview",
    description: "Deep thinking and complex multimodal problem solving",
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash Lite",
    description: "Ultra-compact and responsive lightweight Gemini model",
  },
];

function trimConversationForModel(messages, maxRecentTurns = 10) {
  if (!Array.isArray(messages) || messages.length <= maxRecentTurns * 2) {
    return messages || [];
  }

  return messages.slice(-maxRecentTurns * 2);
}

// Format messages into Gemini contents format with multimodal media support
function buildGeminiContents(messages) {
  const cleanMessages = messages.filter(
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

    // Add text part if available
    if (m.content && m.content.trim() !== "") {
      parts.push({ text: m.content });
    }

    // Add single image if present
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

    // Add multiple media items if present
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

// Get Available Models endpoint
app.get("/api/models", async (req, res) => {
  try {
    if (!apiKey) {
      return res.json({ models: DEFAULT_MODELS });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    );
    if (!response.ok) {
      return res.json({ models: DEFAULT_MODELS });
    }

    const data = await response.json();
    const available = (data.models || [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => {
        const id = m.name.replace("models/", "");
        const matched = DEFAULT_MODELS.find((dm) => dm.id === id);
        return {
          id: id,
          name: matched ? matched.name : m.displayName || id,
          description: matched
            ? matched.description
            : m.description || "Google Gemini Model",
        };
      });

    const sorted = [
      ...DEFAULT_MODELS.filter((dm) => available.some((a) => a.id === dm.id)),
      ...available.filter((a) => !DEFAULT_MODELS.some((dm) => dm.id === a.id)),
    ];

    res.json({ models: sorted.length > 0 ? sorted : DEFAULT_MODELS });
  } catch (error) {
    console.warn(
      "Could not fetch models dynamically from Gemini, using defaults:",
      error.message,
    );
    res.json({ models: DEFAULT_MODELS });
  }
});

// Chat endpoint (Standard Response)
app.post("/api/chat", async (req, res) => {
  try {
    const {
      messages,
      model = "gemini-2.0-flash",
      temperature = 0.4,
      systemPrompt,
      maxTokens = 1024,
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const recentMessages = trimConversationForModel(messages, 10);
    const contents = buildGeminiContents(recentMessages);
    const fallbackModel = "gemini-2.0-flash";
    let currentModel = model;

    async function tryChat(currentModel, retriesLeft = 2) {
      const generativeModel = genAI.getGenerativeModel({
        model: currentModel,
        systemInstruction:
          systemPrompt && systemPrompt.trim() !== ""
            ? systemPrompt.trim()
            : undefined,
        generationConfig: {
          temperature: Number(temperature) || 0.4,
          maxOutputTokens: Number(maxTokens) || 1024,
        },
      });

      try {
        return await generativeModel.generateContent({ contents });
      } catch (error) {
        const isQuotaError =
          error?.message?.includes("429") ||
          error?.message?.includes("quota") ||
          error?.message?.includes("exceeded") ||
          error?.message?.includes("RESOURCE_EXHAUSTED") ||
          error?.status === 429;

        if (isQuotaError && currentModel !== fallbackModel) {
          console.warn(
            `Quota exceeded for ${currentModel}, falling back to ${fallbackModel} in chat`,
          );
          return tryChat(fallbackModel, 1);
        }

        const is503 =
          error?.message?.includes("503") ||
          error?.message?.includes("UNAVAILABLE") ||
          error?.message?.includes("high demand");

        if (is503 && retriesLeft > 0) {
          console.warn(
            `Model ${currentModel} temporarily unavailable in chat, retrying...`,
          );
          await new Promise((r) => setTimeout(r, 2000));
          return tryChat(currentModel, retriesLeft - 1);
        }

        if (is503 && currentModel !== fallbackModel) {
          console.warn(
            `Falling back from ${currentModel} to ${fallbackModel} in chat`,
          );
          return tryChat(fallbackModel, 1);
        }

        throw error;
      }
    }

    const result = await tryChat(currentModel);
    const reply = result.response.text();
    res.json({ message: reply });
  } catch (error) {
    console.error("Gemini API Error:", error);
    res
      .status(500)
      .json({
        error: error.message || "Failed to process request with Gemini API.",
      });
  }
});

// Streaming endpoint (Real-time SSE response)
app.post("/api/chat/stream", async (req, res) => {
  const {
    messages,
    model = "gemini-2.0-flash",
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
      res.write(
        `data: ${JSON.stringify({ error: "Stream timed out." })}\n\n`,
      );
      res.end();
    }
  }, 120000);

  const fallbackModel = "gemini-2.0-flash";
  let currentModel = model;

  async function tryStream(contents, currentModel, retriesLeft = 2) {
    const generativeModel = genAI.getGenerativeModel({
      model: currentModel,
      systemInstruction:
        systemPrompt && systemPrompt.trim() !== ""
          ? systemPrompt.trim()
          : undefined,
      generationConfig: {
        temperature: Number(temperature) || 0.4,
        maxOutputTokens: Number(maxTokens) || 4096,
      },
    });

    try {
      return await generativeModel.generateContentStream({ contents });
    } catch (error) {
      const isQuotaError =
        error?.message?.includes("429") ||
        error?.message?.includes("quota") ||
        error?.message?.includes("exceeded") ||
        error?.message?.includes("RESOURCE_EXHAUSTED") ||
        error?.status === 429;

      if (isQuotaError && currentModel !== fallbackModel) {
        console.warn(
          `Quota exceeded for ${currentModel}, falling back to ${fallbackModel}`,
        );
        return tryStream(contents, fallbackModel, 1);
      }

      const is503 =
        error?.message?.includes("503") ||
        error?.message?.includes("UNAVAILABLE") ||
        error?.message?.includes("high demand");

      if (is503 && retriesLeft > 0) {
        console.warn(
          `Model ${currentModel} temporarily unavailable, retrying...`,
        );
        await new Promise((r) => setTimeout(r, 2000));
        return tryStream(contents, currentModel, retriesLeft - 1);
      }

      if (is503 && currentModel !== fallbackModel) {
        console.warn(
          `Falling back from ${currentModel} to ${fallbackModel}`,
        );
        return tryStream(contents, fallbackModel, 1);
      }

      throw error;
    }
  }

  try {
    const recentMessages = trimConversationForModel(messages, 10);
    const contents = buildGeminiContents(recentMessages);

    const result = await tryStream(contents, currentModel);

    for await (const chunk of result.stream) {
      if (req.aborted) break;

      const text = chunk.text();
      if (text) {
        res.write(`data: ${JSON.stringify({ content: text })}\n\n`);
      }
    }

    if (!req.aborted && !res.writableEnded) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (error) {
    if (!req.aborted && !res.writableEnded) {
      console.error("Gemini Streaming Error:", error);
      res.write(
        `data: ${JSON.stringify({ error: error.message || "Streaming error occurred with Gemini." })}\n\n`,
      );
      res.end();
    }
  } finally {
    clearTimeout(streamTimeout);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AN AI Studio Server running on port ${PORT}`);
  if (!isEmailConfigured()) {
    console.warn(
      "OTP emails will fail until EMAIL_USER and EMAIL_PASS (Gmail App Password) are set in .env",
    );
  } else {
    console.log("OTP email delivery is configured");
  }
});
