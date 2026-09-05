import React from "react";
import { X, Sliders, Trash2, CheckCircle2, Sparkles } from "lucide-react";

const SYSTEM_PRESETS = [
  {
    label: "Default AN Assistant",
    prompt:
      "You are AN, a powerful, helpful, knowledgeable, and precise multimodal AI assistant powered by Google Gemini.",
  },
  {
    label: "Senior Engineer",
    prompt:
      "You are AN, a senior full-stack software engineer and architect. Provide clean, well-documented, production-ready code with concise explanations.",
  },
  {
    label: "Creative Writer",
    prompt:
      "You are AN, an imaginative storyteller and creative writer. Use evocative language, rich metaphors, and engaging storytelling.",
  },
  {
    label: "Concise Analyst",
    prompt:
      "Respond with maximum brevity and precision. Use bullet points, bold key terms, and omit filler words.",
  },
];

const labelStyle = {
  display: "block",
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#f8fafc",
  marginBottom: "0.35rem",
  fontFamily: "Inter, sans-serif",
};

const subLabelStyle = {
  fontSize: "0.76rem",
  color: "#94a3b8",
  marginBottom: "0.6rem",
  lineHeight: 1.5,
};

export default function SettingsModal({
  isOpen,
  onClose,
  systemPrompt,
  setSystemPrompt,
  temperature,
  setTemperature,
  maxTokens,
  setMaxTokens,
  onClearAllChats,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(5, 8, 15, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#0d121f",
          border: "1px solid rgba(99, 102, 241, 0.25)",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "540px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow:
            "0 24px 64px rgba(0, 0, 0, 0.8), 0 0 45px rgba(99, 102, 241, 0.15)",
          position: "relative",
        }}
      >
        {/* Top glow accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "90px",
            background:
              "linear-gradient(180deg, rgba(56, 189, 248, 0.1) 0%, transparent 100%)",
            borderRadius: "20px 20px 0 0",
            pointerEvents: "none",
          }}
        />

        {/* Modal Header */}
        <div
          style={{
            padding: "1.2rem 1.4rem",
            borderBottom: "1px solid rgba(99, 102, 241, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "relative",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "9px",
                background:
                  "linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #9333ea 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
              }}
            >
              <span
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 800,
                  fontSize: "0.8rem",
                  color: "#fff",
                }}
              >
                AN
              </span>
            </div>
            <h2
              style={{
                fontFamily: "Outfit, sans-serif",
                fontSize: "1.18rem",
                fontWeight: 700,
                color: "#ffffff",
                margin: 0,
                letterSpacing: "-0.2px",
              }}
            >
              AN Studio Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(99, 102, 241, 0.1)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              color: "#94a3b8",
              cursor: "pointer",
              padding: "0.35rem",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
              e.currentTarget.style.color = "#38bdf8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
              e.currentTarget.style.color = "#94a3b8";
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div
          style={{
            padding: "1.4rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.4rem",
          }}
        >
          {/* System Persona */}
          <div>
            <label style={labelStyle}>
              System Persona / Custom Instructions
            </label>
            <p style={subLabelStyle}>
              Configure AN's personality, behavior, reasoning depth, and output
              structure.
            </p>
            <textarea
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="e.g. You are AN, a senior full-stack AI mentor..."
              rows={3}
              style={{
                width: "100%",
                background: "#111726",
                border: "1px solid rgba(99, 102, 241, 0.2)",
                borderRadius: "10px",
                padding: "0.75rem",
                color: "#f8fafc",
                fontSize: "0.86rem",
                outline: "none",
                fontFamily: "Inter, sans-serif",
                resize: "vertical",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(56, 189, 248, 0.5)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(99, 102, 241, 0.2)")
              }
            />

            {/* Presets Buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
                marginTop: "0.65rem",
              }}
            >
              {SYSTEM_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSystemPrompt(preset.prompt)}
                  style={{
                    fontSize: "0.72rem",
                    background: "rgba(99, 102, 241, 0.08)",
                    border: "1px solid rgba(99, 102, 241, 0.2)",
                    color: "#94a3b8",
                    padding: "0.3rem 0.6rem",
                    borderRadius: "7px",
                    cursor: "pointer",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 500,
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(56, 189, 248, 0.45)";
                    e.currentTarget.style.color = "#38bdf8";
                    e.currentTarget.style.background =
                      "rgba(99, 102, 241, 0.15)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(99, 102, 241, 0.2)";
                    e.currentTarget.style.color = "#94a3b8";
                    e.currentTarget.style.background =
                      "rgba(99, 102, 241, 0.08)";
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.45rem",
              }}
            >
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Temperature{" "}
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                  {temperature}
                </span>
              </label>
              <span
                style={{
                  fontSize: "0.74rem",
                  color: "#c084fc",
                  fontWeight: 500,
                }}
              >
                {temperature < 0.3
                  ? "Deterministic & Code"
                  : temperature < 0.8
                    ? "Balanced Chat"
                    : "Creative & Expressive"}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{
                width: "100%",
                accentColor: "#4f46e5",
                cursor: "pointer",
                height: "5px",
              }}
            />
          </div>

          {/* Max Tokens */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.45rem",
              }}
            >
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Max Output Tokens{" "}
                <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                  {maxTokens}
                </span>
              </label>
            </div>
            <input
              type="range"
              min="256"
              max="2048"
              step="256"
              value={Math.min(maxTokens, 2048)}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              style={{
                width: "100%",
                accentColor: "#4f46e5",
                cursor: "pointer",
                height: "5px",
              }}
            />
          </div>

          {/* Connected status banner */}
          <div
            style={{
              background: "rgba(52, 211, 153, 0.08)",
              border: "1px solid rgba(52, 211, 153, 0.25)",
              borderRadius: "10px",
              padding: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
            }}
          >
            <CheckCircle2 size={18} color="#34d399" />
            <div>
              <div
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "#34d399",
                }}
              >
                AN Powered by Groq & Google Gemini AI
              </div>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                Auto-Failover High Availability & Multimodal Intelligence Enabled
              </div>
            </div>
          </div>

          {/* Clear All Sessions */}
          <div
            style={{
              borderTop: "1px solid rgba(99, 102, 241, 0.15)",
              paddingTop: "1.1rem",
            }}
          >
            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete all saved chat sessions?",
                  )
                ) {
                  onClearAllChats();
                  onClose();
                }
              }}
              style={{
                width: "100%",
                background: "rgba(239, 68, 68, 0.08)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "#f87171",
                padding: "0.65rem",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.84rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "Inter, sans-serif",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.18)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.45)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.25)";
              }}
            >
              <Trash2 size={15} />
              <span>Delete All Chat History</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "1rem 1.4rem",
            borderTop: "1px solid rgba(99, 102, 241, 0.15)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={onClose}
            style={{
              background:
                "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #9333ea 100%)",
              color: "#ffffff",
              border: "none",
              padding: "0.55rem 1.5rem",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 4px 18px rgba(99, 102, 241, 0.4)",
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 24px rgba(99, 102, 241, 0.55)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 18px rgba(99, 102, 241, 0.4)";
            }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
