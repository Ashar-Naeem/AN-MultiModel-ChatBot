import React, { useState, useEffect, useRef } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import StarterCards from "./components/StarterCards";
import SettingsModal from "./components/SettingsModal";
import AuthModal from "./components/AuthModal";
import { apiUrl } from "./lib/api";

const DEFAULT_MODELS = [
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
    description:
      "Google's flagship multimodal model with deep thinking capabilities",
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
    description:
      "State-of-the-art model for complex logic, math, and code generation",
    provider: "gemini",
  },
];

const getUserStorageId = (currentUser) => {
  const rawId =
    currentUser?.email ||
    currentUser?._id ||
    currentUser?.id ||
    currentUser?.userId ||
    "guest";
  return String(rawId).trim() || "guest";
};

const buildScopedStorageKey = (key, currentUser) => {
  const safeId =
    getUserStorageId(currentUser)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "_")
      .replace(/^_+|_+$/g, "") || "guest";
  return `an_studio_${key}_${safeId}`;
};

const getDefaultChat = () => [
  { id: "chat_" + Date.now(), title: "New Conversation", messages: [] },
];

const loadChatsForUser = (currentUser) => {
  try {
    const stored = localStorage.getItem(
      buildScopedStorageKey("chats", currentUser),
    );
    if (!stored) return getDefaultChat();
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return getDefaultChat();
  } catch (error) {
    console.error("Failed to load chats for user:", error);
    return getDefaultChat();
  }
};

const getActiveChatIdForUser = (currentUser, chats) => {
  const saved = localStorage.getItem(
    buildScopedStorageKey("active_chat_id", currentUser),
  );
  if (saved && chats.some((chat) => chat.id === saved)) return saved;
  return chats[0]?.id || `chat_${Date.now()}`;
};

export default function App() {
  // Authentication State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(
    () => localStorage.getItem("an_studio_token") || "",
  );
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState("signup");

  // State Initialization with per-user chat persistence
  const [chats, setChats] = useState(() => loadChatsForUser(null));

  const [activeChatId, setActiveChatId] = useState(() => {
    const initialChats = loadChatsForUser(null);
    return getActiveChatIdForUser(null, initialChats);
  });

  const [models, setModels] = useState(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem("an_studio_model");
    return saved && saved !== "gemini-2.0-flash" && DEFAULT_MODELS.some((m) => m.id === saved)
      ? saved
      : "qwen/qwen3.8-27b";
  });

  const [systemPrompt, setSystemPrompt] = useState(() => {
    return localStorage.getItem("an_studio_system_prompt") || "";
  });

  const [temperature, setTemperature] = useState(() => {
    return parseFloat(localStorage.getItem("an_studio_temp")) || 0.4;
  });

  const [maxTokens, setMaxTokens] = useState(() => {
    return parseInt(localStorage.getItem("an_studio_max_tokens"), 10) || 1024;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const abortControllerRef = useRef(null);

  useEffect(() => {
    const userChats = loadChatsForUser(user);
    setChats(userChats);
    setActiveChatId(getActiveChatIdForUser(user, userChats));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(
      buildScopedStorageKey("chats", user),
      JSON.stringify(chats),
    );
  }, [chats, user]);

  useEffect(() => {
    localStorage.setItem(
      buildScopedStorageKey("active_chat_id", user),
      activeChatId,
    );
  }, [activeChatId, user]);

  useEffect(() => {
    localStorage.setItem("an_studio_model", selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem("an_studio_system_prompt", systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem("an_studio_temp", temperature.toString());
  }, [temperature]);

  useEffect(() => {
    localStorage.setItem("an_studio_max_tokens", maxTokens.toString());
  }, [maxTokens]);

  // Window resize handler for responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Verify and restore user session on mount
  useEffect(() => {
    async function verifySession() {
      const savedToken = localStorage.getItem("an_studio_token");
      if (!savedToken) {
        setIsAuthChecking(false);
        return;
      }

      try {
        const res = await fetch(apiUrl("/api/auth/me"), {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        } else {
          localStorage.removeItem("an_studio_token");
          setUser(null);
          setToken("");
        }
      } catch (err) {
        console.warn("Failed to verify user session:", err);
      } finally {
        setIsAuthChecking(false);
      }
    }
    verifySession();
  }, []);

  // Auth Action Handlers
  const handleAuthSuccess = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setAuthModalOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("an_studio_token");
    setUser(null);
    setToken("");
    setAuthModalInitialMode("login");
    setAuthModalOpen(true);
  };

  const handleOpenAuthModal = (mode = "signup") => {
    setAuthModalInitialMode(mode);
    setAuthModalOpen(true);
  };

  // Fetch Available Models on Mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch(apiUrl("/api/models"));
        if (res.ok) {
          const data = await res.json();
          if (data.models && data.models.length > 0) {
            setModels(data.models);
            setSelectedModel((prev) => {
              if (prev && prev !== "gemini-2.0-flash" && data.models.some((m) => m.id === prev)) {
                return prev;
              }
              return data.models[0].id;
            });
          }
        }
      } catch (err) {
        console.warn("Could not fetch dynamic models, using defaults.", err);
      }
    }
    fetchModels();
  }, []);

  // Get active chat session
  const activeChat = chats.find((c) => c.id === activeChatId) || chats[0];
  const activeMessages = activeChat ? activeChat.messages : [];

  // Create New Chat
  const handleNewChat = () => {
    const newId = "chat_" + Date.now();
    const newChat = { id: newId, title: "New Conversation", messages: [] };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newId);
  };

  // Delete Chat
  const handleDeleteChat = (id) => {
    setChats((prev) => {
      const filtered = prev.filter((c) => c.id !== id);
      if (filtered.length === 0) {
        const newId = "chat_" + Date.now();
        const fallback = { id: newId, title: "New Conversation", messages: [] };
        setActiveChatId(newId);
        return [fallback];
      }
      if (id === activeChatId) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename Chat
  const handleRenameChat = (id, newTitle) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c)),
    );
  };

  // Clear current active chat messages
  const handleClearCurrentChat = () => {
    setChats((prev) =>
      prev.map((c) => (c.id === activeChatId ? { ...c, messages: [] } : c)),
    );
  };

  // Export current chat conversation as JSON
  const handleExportChat = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(activeMessages, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `${(activeChat?.title || "an_chat").replace(/[^a-z0-9]/gi, "_").toLowerCase()}_export.json`,
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Clear all chats
  const handleClearAllChats = () => {
    const newId = "chat_" + Date.now();
    setChats([{ id: newId, title: "New Conversation", messages: [] }]);
    setActiveChatId(newId);
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);

    // Save whatever streaming text was generated so far
    if (streamingMessage.trim()) {
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId) {
            return {
              ...c,
              messages: [
                ...c.messages,
                { role: "assistant", content: streamingMessage },
              ],
            };
          }
          return c;
        }),
      );
    }
    setStreamingMessage("");
  };

  // Send Message Logic (Supports multimodal text + images & SSE Streaming)
  const handleSendMessage = async (payload) => {
    const userText = typeof payload === "string" ? payload : payload.text || "";
    const userImage = typeof payload === "object" ? payload.image : null;
    const userMedia = typeof payload === "object" ? payload.media : null;

    if (
      (!userText.trim() &&
        !userImage &&
        (!userMedia || userMedia.length === 0)) ||
      isGenerating
    )
      return;

    const userMessage = {
      role: "user",
      content: userText,
      image: userImage,
      media: userMedia,
    };
    const updatedMessages = [...activeMessages, userMessage];

    // Auto update chat title if it's the first message
    const isFirstMessage = activeMessages.length === 0;
    const titleSource = userText.trim() || "Image Inquiry";
    const generatedTitle = isFirstMessage
      ? titleSource.length > 28
        ? titleSource.slice(0, 28) + "..."
        : titleSource
      : activeChat.title;

    setChats((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            title: generatedTitle,
            messages: updatedMessages,
          };
        }
        return c;
      }),
    );

    setIsGenerating(true);
    setStreamingMessage("");

    // Setup AbortController for stream cancellation
    abortControllerRef.current = new AbortController();

    const timeoutMs = 120000;
    const timeoutId = setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }, timeoutMs);

    try {
      const response = await fetch(apiUrl("/api/chat/stream"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
          temperature: temperature,
          systemPrompt: systemPrompt,
          maxTokens: maxTokens,
        }),
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";
      let leftover = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const combined = leftover + chunk;
        const lines = combined.split("\n");
        leftover = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "").trim();
            if (dataStr === "[DONE]") {
              break;
            }
            let parsed;
            try {
              parsed = JSON.parse(dataStr);
            } catch (e) {
              continue;
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.content) {
              accumulatedText += parsed.content;
              setStreamingMessage(accumulatedText);
            }
          }
        }
      }

      if (leftover.trim() !== "") {
        if (leftover.startsWith("data: ")) {
          const dataStr = leftover.replace("data: ", "").trim();
          if (dataStr !== "[DONE]") {
            let parsed;
            try {
              parsed = JSON.parse(dataStr);
            } catch (e) {
              parsed = null;
            }
            if (parsed && !parsed.error && parsed.content) {
              accumulatedText += parsed.content;
              setStreamingMessage(accumulatedText);
            } else if (parsed && parsed.error) {
              throw new Error(parsed.error);
            }
          }
        }
      }

      // Stream completed successfully: Commit assistant message
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId) {
            return {
              ...c,
              messages: [
                ...updatedMessages,
                {
                  role: "assistant",
                  content: accumulatedText || "No response content generated.",
                },
              ],
            };
          }
          return c;
        }),
      );
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("Stream generation aborted by user.");
        return;
      }

      console.error("Chat error:", err);
      // Append error message to chat window
      setChats((prev) =>
        prev.map((c) => {
          if (c.id === activeChatId) {
            return {
              ...c,
              messages: [
                ...updatedMessages,
                {
                  role: "assistant",
                  content: `**Error:** ${err.message || "Failed to process request."}`,
                  isError: true,
                },
              ],
            };
          }
          return c;
        }),
      );
    } finally {
      setIsGenerating(false);
      setStreamingMessage("");
      abortControllerRef.current = null;
    }
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (activeMessages.length === 0 || isGenerating) return;

    // Find last user message
    const lastUserIdx = activeMessages.reduce(
      (acc, m, i) => (m.role === "user" ? i : acc),
      -1,
    );
    if (lastUserIdx !== -1) {
      const trimmedMessages = activeMessages.slice(0, lastUserIdx + 1);
      const lastUserMsg = trimmedMessages[trimmedMessages.length - 1];

      // Reset messages up to last user message
      setChats((prev) =>
        prev.map((c) =>
          c.id === activeChatId
            ? { ...c, messages: trimmedMessages.slice(0, -1) }
            : c,
        ),
      );

      // Re-send last user message
      handleSendMessage(lastUserMsg);
    }
  };

  return (
    <div
      className="app-shell"
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        height: "100dvh",
        overflow: "hidden",
        background: "#090d16",
        position: "relative",
      }}
    >
      {/* Background Ambient Cosmic Glows */}
      <div
        className="ambient-glow"
        style={{
          top: "-140px",
          left: "20%",
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.06) 50%, transparent 70%)",
        }}
      />
      <div
        className="ambient-glow"
        style={{
          bottom: "-100px",
          right: "10%",
          background:
            "radial-gradient(circle, rgba(192, 132, 252, 0.14) 0%, rgba(99, 102, 241, 0.05) 50%, transparent 70%)",
        }}
      />
      <div
        className="ambient-glow"
        style={{
          top: "35%",
          left: "50%",
          width: "700px",
          height: "700px",
          background:
            "radial-gradient(circle, rgba(99, 102, 241, 0.04) 0%, transparent 70%)",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onOpenSettings={() => setSettingsOpen(true)}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        user={user}
        onLogout={handleLogout}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main Chat Workspace */}
      <main
        className="chat-shell"
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          height: "100dvh",
          position: "relative",
          overflow: "hidden",
          zIndex: 2,
        }}
      >
        {/* Top Header */}
        <Header
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={() => setSettingsOpen(true)}
          onClearChat={handleClearCurrentChat}
          onExportChat={handleExportChat}
          systemPrompt={systemPrompt}
          user={user}
          onLogout={handleLogout}
          onOpenAuthModal={handleOpenAuthModal}
        />

        {/* Chat Thread or Starter Prompts View */}
        {activeMessages.length === 0 && !isGenerating ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <StarterCards
              modelName={models.find((m) => m.id === selectedModel)?.name}
            />
          </div>
        ) : (
          <ChatWindow
            messages={activeMessages}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            streamingMessage={streamingMessage}
          />
        )}

        {/* Message Input Controls */}
        <MessageInput
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        temperature={temperature}
        setTemperature={setTemperature}
        maxTokens={maxTokens}
        setMaxTokens={setMaxTokens}
        onClearAllChats={handleClearAllChats}
      />

      {/* Authentication Modal / Gateway */}
      <AuthModal
        isOpen={(!isAuthChecking && !user) || authModalOpen}
        isMandatory={!isAuthChecking && !user}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={!user ? "signup" : authModalInitialMode}
      />
    </div>
  );
}
