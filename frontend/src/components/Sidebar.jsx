import React, { useState, useEffect } from "react";
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Settings,
  PanelLeftClose,
  Layers,
  User as UserIcon,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onOpenSettings,
  isOpen,
  onToggleSidebar,
  user,
  onLogout,
  onOpenAuthModal,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const startEditing = (chat, e) => {
    e.stopPropagation();
    setEditingId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveEditing = (id, e) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameChat(id, editingTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEditing = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleChatClick = (id) => {
    onSelectChat(id);
    if (window.innerWidth <= 768) {
      onToggleSidebar();
    }
  };

  const handleNewChatClick = () => {
    onNewChat();
    if (window.innerWidth <= 768) {
      onToggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && isMobile && (
        <div
          onClick={onToggleSidebar}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 8, 15, 0.8)",
            zIndex: 55,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "block",
          }}
          className="mobile-backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: isOpen ? (isMobile ? "min(310px, 86vw)" : "280px") : "0",
          minWidth: isOpen ? (isMobile ? "min(310px, 86vw)" : "280px") : "0",
          maxWidth: isMobile ? "min(310px, 86vw)" : "280px",
          overflow: "hidden",
          height: "100%",
          height: "100dvh",
          display: "flex",
          flexDirection: "column",
          background: "#0b0f19",
          borderRight: "1px solid rgba(99, 102, 241, 0.15)",
          transition:
            "width 0.28s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          position: isMobile ? "fixed" : "relative",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 60,
          flexShrink: 0,
          boxShadow:
            isOpen && isMobile ? "0 0 50px rgba(0, 0, 0, 0.85)" : "none",
          paddingTop: isMobile ? "env(safe-area-inset-top, 0px)" : 0,
          paddingBottom: isMobile ? "env(safe-area-inset-bottom, 0px)" : 0,
        }}
      >
        {/* Top ambient glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "180px",
            background:
              "linear-gradient(180deg, rgba(56, 189, 248, 0.08) 0%, rgba(192, 132, 252, 0.04) 50%, transparent 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Sidebar Header */}
        <div
          style={{
            padding: "1.1rem 1.1rem 1rem 1.1rem",
            borderBottom: "1px solid rgba(99, 102, 241, 0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "11px",
                background:
                  "linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #9333ea 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 18px rgba(99, 102, 241, 0.45)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  color: "#ffffff",
                  lineHeight: 1,
                }}
              >
                AN
              </span>
            </div>
            <div style={{ whiteSpace: "nowrap" }}>
              <h1
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontSize: "1.08rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  margin: 0,
                  lineHeight: 1.2,
                  letterSpacing: "-0.2px",
                }}
              >
                AN Studio
              </h1>
              <span
                style={{
                  fontSize: "0.66rem",
                  background: "linear-gradient(90deg, #38bdf8, #c084fc)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: 700,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                MULTIMODAL AI
              </span>
            </div>
          </div>

          <button
            onClick={onToggleSidebar}
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
              flexShrink: 0,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.2)";
              e.currentTarget.style.color = "#38bdf8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
              e.currentTarget.style.color = "#94a3b8";
            }}
            title="Close Sidebar"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat & Search */}
        <div
          style={{
            padding: "0.9rem 1rem 0.6rem 1rem",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          <button
            onClick={handleNewChatClick}
            style={{
              width: "100%",
              padding: "0.7rem 1rem",
              borderRadius: "11px",
              background:
                "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #9333ea 100%)",
              color: "#ffffff",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              fontWeight: 600,
              fontSize: "0.88rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(99, 102, 241, 0.4)",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow =
                "0 6px 26px rgba(99, 102, 241, 0.55)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 20px rgba(99, 102, 241, 0.4)";
            }}
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>

          {/* Search Box */}
          <div style={{ marginTop: "0.65rem", position: "relative" }}>
            <Search
              size={14}
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#64748b",
              }}
            />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem 0.5rem 2.2rem",
                borderRadius: "9px",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(99, 102, 241, 0.15)",
                color: "#f8fafc",
                fontSize: "0.82rem",
                outline: "none",
                fontFamily: "Inter, sans-serif",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(56, 189, 248, 0.45)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(99, 102, 241, 0.15)")
              }
            />
          </div>
        </div>

        {/* Conversations List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 0.65rem 1rem 0.65rem",
            position: "relative",
            zIndex: 1,
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div
            style={{
              fontSize: "0.68rem",
              fontWeight: 700,
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.7px",
              padding: "0.4rem 0.5rem 0.3rem 0.5rem",
              whiteSpace: "nowrap",
            }}
          >
            History · {filteredChats.length}
          </div>

          {filteredChats.length === 0 ? (
            <div
              style={{
                padding: "1.5rem 0.5rem",
                textAlign: "center",
                color: "#64748b",
                fontSize: "0.82rem",
              }}
            >
              No chats found
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = editingId === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.58rem 0.7rem",
                    borderRadius: "9px",
                    marginBottom: "0.25rem",
                    cursor: "pointer",
                    background: isActive
                      ? "linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(147, 51, 234, 0.18) 100%)"
                      : "transparent",
                    border: isActive
                      ? "1px solid rgba(99, 102, 241, 0.35)"
                      : "1px solid transparent",
                    color: isActive ? "#ffffff" : "#94a3b8",
                    transition: "all 0.15s ease",
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background =
                        "rgba(99, 102, 241, 0.08)";
                      e.currentTarget.style.color = "#f8fafc";
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#94a3b8";
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.55rem",
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <MessageSquare
                      size={15}
                      color={isActive ? "#38bdf8" : "#64748b"}
                      style={{ flexShrink: 0 }}
                    />

                    {isEditing ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEditing(chat.id, e);
                          if (e.key === "Escape") cancelEditing(e);
                        }}
                        autoFocus
                        style={{
                          width: "100%",
                          background: "#111726",
                          border: "1px solid #38bdf8",
                          color: "#fff",
                          fontSize: "0.8rem",
                          borderRadius: "5px",
                          padding: "0.15rem 0.4rem",
                          outline: "none",
                          fontFamily: "Inter, sans-serif",
                        }}
                      />
                    ) : (
                      <span
                        style={{
                          fontSize: "0.83rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          fontWeight: isActive ? 600 : 400,
                        }}
                      >
                        {chat.title}
                      </span>
                    )}
                  </div>

                  {/* Action Icons */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.2rem",
                      marginLeft: "0.4rem",
                    }}
                  >
                    {isEditing ? (
                      <>
                        <button
                          onClick={(e) => saveEditing(chat.id, e)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#10b981",
                            cursor: "pointer",
                            padding: "0.2rem",
                          }}
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            padding: "0.2rem",
                          }}
                        >
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      isActive && (
                        <>
                          <button
                            onClick={(e) => startEditing(chat, e)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              padding: "0.25rem",
                              borderRadius: "4px",
                              transition: "color 0.15s",
                            }}
                            title="Rename Chat"
                            onMouseOver={(e) =>
                              (e.currentTarget.style.color = "#38bdf8")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.color = "#94a3b8")
                            }
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              padding: "0.25rem",
                              borderRadius: "4px",
                              transition: "color 0.15s",
                            }}
                            title="Delete Chat"
                            onMouseOver={(e) =>
                              (e.currentTarget.style.color = "#ef4444")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.color = "#94a3b8")
                            }
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Area */}
        <div
          style={{
            padding: "0.85rem",
            borderTop: "1px solid rgba(99, 102, 241, 0.12)",
            background: "rgba(5, 8, 15, 0.5)",
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
          }}
        >
          {/* User Profile / Auth Status in Sidebar */}
          {user ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.5rem 0.65rem",
                borderRadius: "10px",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(99, 102, 241, 0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "7px",
                    background:
                      "linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)",
                    color: "#fff",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {(user.name || "U").slice(0, 2).toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#f8fafc",
                      fontFamily: "Outfit, sans-serif",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {user.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.68rem",
                      color: "#86efac",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <span>● Online</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  padding: "0.3rem",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = "#ef4444")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#94a3b8")}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuthModal("login");
                if (window.innerWidth <= 768) {
                  onToggleSidebar();
                }
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.45rem",
                padding: "0.55rem 0.8rem",
                borderRadius: "9px",
                background:
                  "linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.25) 100%)",
                border: "1px solid rgba(99, 102, 241, 0.4)",
                color: "#38bdf8",
                fontSize: "0.82rem",
                fontWeight: 600,
                fontFamily: "Outfit, sans-serif",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(99, 102, 241, 0.4) 100%)";
                e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.6)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.25) 100%)";
                e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.4)";
              }}
            >
              <UserIcon size={14} />
              <span>Sign In / Create Account</span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenSettings();
              if (window.innerWidth <= 768) {
                onToggleSidebar();
              }
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.6rem 0.8rem",
              borderRadius: "9px",
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.16)",
              color: "#94a3b8",
              fontSize: "0.84rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
              e.currentTarget.style.color = "#38bdf8";
              e.currentTarget.style.borderColor = "rgba(56, 189, 248, 0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.08)";
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.16)";
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}
            >
              <Settings size={16} color="#818cf8" />
              <span>Model & Parameters</span>
            </div>
            <Layers size={13} color="#64748b" />
          </button>
        </div>
      </aside>
    </>
  );
}
