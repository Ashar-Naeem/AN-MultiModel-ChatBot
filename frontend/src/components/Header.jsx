import React, { useState, useEffect } from "react";
import {
  PanelLeft,
  Settings,
  Sliders,
  RotateCcw,
  Download,
} from "lucide-react";
import UserProfileMenu from "./UserProfileMenu";
import ModelSelector from "./ModelSelector";

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
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      style={{
        height: isMobile ? "54px" : "60px",
        borderBottom: "1px solid rgba(99, 102, 241, 0.15)",
        background: "rgba(9, 13, 22, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "0 0.5rem" : "0 1rem",
        gap: "0.4rem",
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
          gap: isMobile ? "0.4rem" : "0.65rem",
          minWidth: 0,
          flex: 1,
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
            padding: isMobile ? "0.45rem" : "0.45rem",
            width: isMobile ? "36px" : "36px",
            height: isMobile ? "36px" : "36px",
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

        {/* Responsive Custom Model Selector */}
        <ModelSelector
          models={models}
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>

      {/* Right Area: Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? "0.25rem" : "0.4rem",
          flexShrink: 0,
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
          className="hide-on-compact"
          style={{
            background: "transparent",
            border: "1px solid rgba(99, 102, 241, 0.18)",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "0.4rem 0.55rem",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.78rem",
            fontWeight: 500,
            transition: "all 0.15s ease",
            height: "36px",
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
          className="hide-on-compact"
          style={{
            background: "transparent",
            border: "1px solid rgba(99, 102, 241, 0.18)",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "0.4rem 0.55rem",
            borderRadius: "9px",
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.78rem",
            fontWeight: 500,
            transition: "all 0.15s ease",
            height: "36px",
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
            width: "36px",
            height: "36px",
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
