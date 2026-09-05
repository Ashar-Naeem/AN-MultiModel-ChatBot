import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  ChevronDown,
  Search,
  Check,
  X,
} from "lucide-react";

export default function ModelSelector({ models, selectedModel, onSelectModel }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'groq' | 'gemini'
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
  );

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close popover when clicking outside on desktop
  useEffect(() => {
    if (isMobile) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, isMobile]);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchTerm("");
      setActiveFilter("all");
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const currentModelObj = models.find((m) => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel || "AI Model",
    tag: "⚡ Fast",
    provider: selectedModel?.includes("gemini") ? "gemini" : "groq",
  };

  // Filter models
  const filteredModels = models.filter((m) => {
    const matchesSearch =
      (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "groq") {
      return m.provider === "groq" || (m.id && !m.id.includes("gemini"));
    }
    if (activeFilter === "gemini") {
      return m.provider === "gemini" || (m.id && m.id.includes("gemini"));
    }
    return true;
  });

  const handleSelect = (modelId) => {
    onSelectModel(modelId);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative" }} ref={containerRef}>
      {/* Header Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select AI Model"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: isOpen ? "rgba(28, 36, 56, 0.9)" : "rgba(15, 23, 42, 0.8)",
          border: isOpen
            ? "1px solid rgba(56, 189, 248, 0.5)"
            : "1px solid rgba(99, 102, 241, 0.28)",
          padding: isMobile ? "0.35rem 0.55rem" : "0.35rem 0.7rem",
          borderRadius: "10px",
          boxShadow: isOpen
            ? "0 0 16px rgba(56, 189, 248, 0.25)"
            : "0 2px 10px rgba(0, 0, 0, 0.25)",
          cursor: "pointer",
          maxWidth: isMobile ? "min(170px, 44vw)" : "250px",
          transition: "all 0.18s ease",
          outline: "none",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.45)";
          e.currentTarget.style.background = "rgba(28, 36, 56, 0.85)";
        }}
        onMouseOut={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.28)";
            e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
          }
        }}
      >
        <Sparkles size={14} color="#38bdf8" style={{ flexShrink: 0 }} />
        <span
          style={{
            color: "#f8fafc",
            fontFamily: "Outfit, sans-serif",
            fontWeight: 600,
            fontSize: isMobile ? "0.78rem" : "0.85rem",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textAlign: "left",
            flex: 1,
          }}
        >
          {currentModelObj.name}
        </span>
        <ChevronDown
          size={13}
          color="#94a3b8"
          style={{
            flexShrink: 0,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
          }}
        />
      </button>

      {/* DESKTOP POPOVER MENU */}
      {!isMobile && isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            width: "370px",
            background: "linear-gradient(180deg, #111827 0%, #0b0f19 100%)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: "16px",
            boxShadow:
              "0 20px 45px rgba(0, 0, 0, 0.7), 0 0 25px rgba(99, 102, 241, 0.15)",
            padding: "0.85rem",
            zIndex: 100,
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {/* Search bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(99, 102, 241, 0.22)",
              borderRadius: "10px",
              padding: "0.45rem 0.65rem",
              marginBottom: "0.65rem",
            }}
          >
            <Search size={14} color="#64748b" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search models by name or capability..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#f8fafc",
                fontSize: "0.82rem",
                fontFamily: "Inter, sans-serif",
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "2px",
                  display: "flex",
                }}
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Provider Filter Tabs */}
          <div
            style={{
              display: "flex",
              gap: "0.35rem",
              marginBottom: "0.75rem",
              paddingBottom: "0.6rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
            }}
          >
            {[
              { id: "all", label: "All Models" },
              { id: "groq", label: "⚡ Groq LPUs" },
              { id: "gemini", label: "✨ Gemini" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                style={{
                  padding: "0.3rem 0.6rem",
                  borderRadius: "7px",
                  border: "none",
                  background:
                    activeFilter === tab.id
                      ? "rgba(56, 189, 248, 0.15)"
                      : "transparent",
                  color: activeFilter === tab.id ? "#38bdf8" : "#94a3b8",
                  fontWeight: activeFilter === tab.id ? 600 : 500,
                  fontSize: "0.75rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Model List */}
          <div
            style={{
              maxHeight: "310px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              paddingRight: "0.2rem",
            }}
          >
            {filteredModels.length === 0 ? (
              <div
                style={{
                  padding: "1.5rem",
                  textAlign: "center",
                  color: "#64748b",
                  fontSize: "0.82rem",
                }}
              >
                No models found matching "{searchTerm}"
              </div>
            ) : (
              filteredModels.map((m) => {
                const isSelected = m.id === selectedModel;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelect(m.id)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "0.65rem 0.75rem",
                      borderRadius: "10px",
                      background: isSelected
                        ? "rgba(56, 189, 248, 0.12)"
                        : "rgba(15, 23, 42, 0.5)",
                      border: isSelected
                        ? "1px solid rgba(56, 189, 248, 0.4)"
                        : "1px solid rgba(255, 255, 255, 0.05)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: "0.6rem",
                      transition: "all 0.15s ease",
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "rgba(28, 36, 56, 0.75)";
                        e.currentTarget.style.borderColor =
                          "rgba(99, 102, 241, 0.35)";
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "rgba(15, 23, 42, 0.5)";
                        e.currentTarget.style.borderColor =
                          "rgba(255, 255, 255, 0.05)";
                      }
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          marginBottom: "0.2rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            color: isSelected ? "#38bdf8" : "#f8fafc",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                            fontFamily: "Outfit, sans-serif",
                          }}
                        >
                          {m.name || m.id}
                        </span>
                        {m.tag && (
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 600,
                              color: m.tag.includes("Fast")
                                ? "#38bdf8"
                                : "#c084fc",
                              background: m.tag.includes("Fast")
                                ? "rgba(56, 189, 248, 0.12)"
                                : "rgba(192, 132, 252, 0.12)",
                              border: m.tag.includes("Fast")
                                ? "1px solid rgba(56, 189, 248, 0.25)"
                                : "1px solid rgba(192, 132, 252, 0.25)",
                              padding: "0.1rem 0.4rem",
                              borderRadius: "6px",
                            }}
                          >
                            {m.tag}
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          color: "#94a3b8",
                          fontSize: "0.74rem",
                          margin: 0,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {m.description || "High-performance multimodal AI model"}
                      </p>
                    </div>
                    {isSelected && (
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          background: "#38bdf8",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <Check size={12} color="#090d16" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM SHEET DRAWER */}
      {isMobile && isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(5, 8, 15, 0.8)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              zIndex: 120,
              animation: "fadeIn 0.2s ease-out",
            }}
          />

          {/* Bottom Sheet Modal */}
          <div
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "84dvh",
              background: "linear-gradient(180deg, #111827 0%, #070a12 100%)",
              borderTop: "1px solid rgba(99, 102, 241, 0.35)",
              borderRadius: "22px 22px 0 0",
              boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.85)",
              zIndex: 121,
              display: "flex",
              flexDirection: "column",
              animation: "slideUpSheet 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              paddingBottom: "env(safe-area-inset-bottom, 12px)",
            }}
          >
            {/* Grab Handle */}
            <div
              style={{
                width: "40px",
                height: "4px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.2)",
                margin: "0.65rem auto 0.4rem auto",
                flexShrink: 0,
              }}
            />

            {/* Title Header */}
            <div
              style={{
                padding: "0.4rem 1.1rem 0.75rem 1.1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Sparkles size={16} color="#38bdf8" />
                <h3
                  style={{
                    color: "#f8fafc",
                    fontSize: "0.98rem",
                    fontWeight: 700,
                    fontFamily: "Outfit, sans-serif",
                    margin: 0,
                  }}
                >
                  Select AI Model
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close model selector"
                style={{
                  background: "rgba(255, 255, 255, 0.07)",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Search Input */}
            <div style={{ padding: "0.75rem 1.1rem 0.5rem 1.1rem", flexShrink: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  borderRadius: "11px",
                  padding: "0.55rem 0.75rem",
                }}
              >
                <Search size={15} color="#64748b" style={{ flexShrink: 0 }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search models..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    border: "none",
                    outline: "none",
                    color: "#f8fafc",
                    fontSize: "16px", // Prevent iOS safari zoom
                    fontFamily: "Inter, sans-serif",
                  }}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#94a3b8",
                      cursor: "pointer",
                      padding: "2px",
                      display: "flex",
                    }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Provider Filter Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                padding: "0 1.1rem 0.65rem 1.1rem",
                flexShrink: 0,
              }}
            >
              {[
                { id: "all", label: "All Models" },
                { id: "groq", label: "⚡ Groq LPUs" },
                { id: "gemini", label: "✨ Gemini" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    padding: "0.38rem 0.75rem",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      activeFilter === tab.id
                        ? "rgba(56, 189, 248, 0.16)"
                        : "rgba(255, 255, 255, 0.05)",
                    color: activeFilter === tab.id ? "#38bdf8" : "#94a3b8",
                    fontWeight: activeFilter === tab.id ? 700 : 500,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Scrollable Model List */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
                padding: "0 1.1rem 1rem 1.1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.55rem",
              }}
            >
              {filteredModels.length === 0 ? (
                <div
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "0.85rem",
                  }}
                >
                  No models found matching "{searchTerm}"
                </div>
              ) : (
                filteredModels.map((m) => {
                  const isSelected = m.id === selectedModel;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleSelect(m.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "0.75rem 0.85rem",
                        borderRadius: "12px",
                        background: isSelected
                          ? "rgba(56, 189, 248, 0.12)"
                          : "rgba(15, 23, 42, 0.65)",
                        border: isSelected
                          ? "1.5px solid rgba(56, 189, 248, 0.5)"
                          : "1px solid rgba(99, 102, 241, 0.15)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "0.65rem",
                        boxShadow: isSelected
                          ? "0 0 15px rgba(56, 189, 248, 0.18)"
                          : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            marginBottom: "0.25rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              color: isSelected ? "#38bdf8" : "#f8fafc",
                              fontWeight: 700,
                              fontSize: "0.88rem",
                              fontFamily: "Outfit, sans-serif",
                            }}
                          >
                            {m.name || m.id}
                          </span>
                          {m.tag && (
                            <span
                              style={{
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                color: m.tag.includes("Fast")
                                  ? "#38bdf8"
                                  : "#c084fc",
                                background: m.tag.includes("Fast")
                                  ? "rgba(56, 189, 248, 0.12)"
                                  : "rgba(192, 132, 252, 0.12)",
                                border: m.tag.includes("Fast")
                                  ? "1px solid rgba(56, 189, 248, 0.25)"
                                  : "1px solid rgba(192, 132, 252, 0.25)",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "6px",
                              }}
                            >
                              {m.tag}
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "0.76rem",
                            margin: 0,
                            lineHeight: 1.4,
                          }}
                        >
                          {m.description ||
                            "High-performance multimodal AI model"}
                        </p>
                      </div>
                      {isSelected && (
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: "#38bdf8",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            marginTop: "2px",
                          }}
                        >
                          <Check size={13} color="#090d16" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
