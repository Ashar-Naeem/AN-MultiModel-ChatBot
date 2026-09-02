import React from "react";
import {
  PanelLeft,
  Settings,
  Sliders,
  RotateCcw,
  Download,
  Sparkles,
} from "lucide-react";
import UserProfileMenu from "./UserProfileMenu";

export default function Header({
  models,
  selectedModel,
  onSelectModel,
  onToggleSidebar,
  onOpenSettings,
  onClearChat,
  onExportChat,
  systemPrompt,
  user,
  onLogout,
  onOpenAuthModal,
}) {
  const currentModelObj = models.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel,
    description: "AN Multimodal AI",
  };
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <header
      style={{
        height: isMobile ? "56px" : "60px",
        borderBottom: "1px solid rgba(99, 102, 241, 0.15)",
        background: "rgba(9, 13, 22, 0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 0.6rem" : "0 1rem",
        gap: isMobile ? "0.35rem" : "0.65rem",
        zIndex: 20,
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* Subtle bottom edge gradient line */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.4), rgba(192, 132, 252, 0.4), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Left Area: Sidebar Toggle & Model Selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.65rem",
          minWidth: 0,
        }}
      >
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "0.45rem",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
            e.currentTarget.style.color = "#38bdf8";
            e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.2)";
          }}
          title="Toggle Sidebar"
          aria-label="Toggle Sidebar"
        >
          <PanelLeft size={18} />
        </button>

        {/* Model Selector Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
            padding: isMobile ? "0.3rem 0.5rem" : "0.35rem 0.65rem",
            borderRadius: "10px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            maxWidth: isMobile ? "155px" : "240px",
            minWidth: 0,
          }}
        >
          <Sparkles size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
          <select
            value={selectedModel}
            onChange={(e) => onSelectModel(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "#f8fafc",
              fontFamily: "Outfit, sans-serif",
              fontWeight: 600,
              fontSize: isMobile ? "0.74rem" : "0.86rem",
              cursor: "pointer",
              outline: "none",
              width: "100%",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }}
          >
            {models.map((m) => (
              <option
                key={m.id}
                value={m.id}
                style={{ background: "#0b0f19", color: "#f8fafc" }}
              >
                {m.name || m.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right Area: Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "0.2rem" : "0.4rem",
        }}
      >
        {systemPrompt && (
          <div
            onClick={onOpenSettings}
            style={{
              fontSize: "0.72rem",
              color: "#38bdf8",
              background: "rgba(56, 189, 248, 0.1)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              padding: "0.25rem 0.6rem",
              borderRadius: "999px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              fontWeight: 500,
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(56, 189, 248, 0.2)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(56, 189, 248, 0.1)")
            }
            title="Custom System Persona Active"
            className="hide-on-mobile"
          >
            <Sliders size={11} />
            <span>Custom Persona</span>
          </div>
        )}

        {/* Export Button */}
        <button
          onClick={onExportChat}
          style={{
            background: "transparent",
            border: "1px solid rgba(99, 102, 241, 0.18)",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "0.4rem 0.65rem",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.78rem",
            fontWeight: 500,
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.12)";
            e.currentTarget.style.color = "#38bdf8";
            e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.35)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.18)";
          }}
          title="Export Conversation as JSON"
        >
          <Download size={14} />
          <span className="hide-on-mobile">Export</span>
        </button>

        {/* Clear Button */}
        <button
          onClick={onClearChat}
          style={{
            background: "transparent",
            border: "1px solid rgba(99, 102, 241, 0.18)",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "0.4rem 0.65rem",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.78rem",
            fontWeight: 500,
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.12)";
            e.currentTarget.style.color = "#c084fc";
            e.currentTarget.style.borderColor = "rgba(192, 132, 252, 0.35)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.18)";
          }}
          title="Clear Current Messages"
        >
          <RotateCcw size={14} />
          <span className="hide-on-mobile">Clear</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "0.45rem",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
            e.currentTarget.style.color = "#c084fc";
            e.currentTarget.style.borderColor = "rgba(192, 132, 252, 0.4)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
            e.currentTarget.style.color = "#94a3b8";
            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.2)";
          }}
          title="Studio Settings"
          aria-label="Studio Settings"
        >
          <Settings size={17} />
        </button>

        {/* User Authentication Menu */}
        <UserProfileMenu
          user={user}
          onLogout={onLogout}
          onOpenAuthModal={onOpenAuthModal}
        />
      </div>
    </header>
  );
}
