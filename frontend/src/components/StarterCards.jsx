import React from "react";
import { Sparkles, Code2, Lightbulb, Compass, MessageSquare } from "lucide-react";

export default function StarterCards({ modelName, onSelectPrompt }) {
  const suggestions = [
    {
      icon: <Lightbulb size={17} color="#fbbf24" />,
      title: "Explain a concept",
      prompt: "Explain how neural networks and transformers work in simple terms.",
    },
    {
      icon: <Code2 size={17} color="#38bdf8" />,
      title: "Write or debug code",
      prompt: "Write a complete modern REST API in Node.js and Express with comments.",
    },
    {
      icon: <Compass size={17} color="#c084fc" />,
      title: "Explore ideas",
      prompt: "Brainstorm 5 innovative startup ideas combining AI and productivity.",
    },
    {
      icon: <MessageSquare size={17} color="#34d399" />,
      title: "Draft an email",
      prompt: "Draft a polite and professional follow-up email after a job interview.",
    },
  ];

  return (
    <div
      style={{
        maxWidth: "680px",
        width: "100%",
        margin: "0 auto",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      {/* Brand AN Avatar Icon */}
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "18px",
          background:
            "linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #9333ea 100%)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1.2rem",
          boxShadow: "0 8px 30px rgba(99, 102, 241, 0.45)",
          position: "relative",
          flexShrink: 0,
        }}
      >
        {/* Ambient background glow */}
        <div
          style={{
            position: "absolute",
            inset: "-2px",
            borderRadius: "20px",
            background:
              "radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.4), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <span
          style={{
            fontFamily: "Outfit, sans-serif",
            fontWeight: 800,
            fontSize: "1.5rem",
            color: "#ffffff",
            letterSpacing: "-0.5px",
            lineHeight: 1,
          }}
        >
          AN
        </span>
      </div>

      {/* Main Greeting Heading */}
      <h2
        style={{
          fontFamily: "Outfit, sans-serif",
          fontSize: "clamp(1.5rem, 5.5vw, 2.5rem)",
          fontWeight: 800,
          background:
            "linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #c084fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: "0.5rem",
          textAlign: "center",
          letterSpacing: "-0.5px",
          lineHeight: 1.2,
        }}
      >
        How can I help you today?
      </h2>

      {/* Tagline */}
      <p
        style={{
          color: "#94a3b8",
          fontSize: "0.9rem",
          textAlign: "center",
          maxWidth: "420px",
          lineHeight: 1.5,
          margin: "0 auto 1.5rem auto",
        }}
      >
        <strong style={{ color: "#f8fafc", fontWeight: 600 }}>
          AN Multimodal Assistant
        </strong>{" "}
        ·{" "}
        <span style={{ color: "#38bdf8", fontWeight: 500 }}>
          {modelName || "Qwen 3.8 27B (Groq Fast)"}
        </span>
      </p>

      {/* Quick Suggestion Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
          gap: "0.65rem",
          width: "100%",
          maxWidth: "580px",
        }}
      >
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt && onSelectPrompt(s.prompt)}
            style={{
              background: "rgba(18, 24, 38, 0.75)",
              border: "1px solid rgba(99, 102, 241, 0.18)",
              borderRadius: "14px",
              padding: "0.85rem 1rem",
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              backdropFilter: "blur(10px)",
              outline: "none",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(28, 36, 56, 0.9)";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.45)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(18, 24, 38, 0.75)";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.18)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
              {s.icon}
              <span
                style={{
                  color: "#f8fafc",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                  fontFamily: "Outfit, sans-serif",
                }}
              >
                {s.title}
              </span>
            </div>
            <span
              style={{
                color: "#94a3b8",
                fontSize: "0.76rem",
                lineHeight: 1.4,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {s.prompt}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
