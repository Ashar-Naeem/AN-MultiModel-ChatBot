import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  RefreshCw,
  ArrowDown,
  AlertCircle,
  Terminal,
  Sparkles,
  User,
} from "lucide-react";

// Custom Code Block component with Copy button & Language Badge
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "code";
  const codeText = String(children).replace(/\n$/, "");

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            color: "#94a3b8",
          }}
        >
          <Terminal size={13} color="#38bdf8" />
          <span style={{ textTransform: "lowercase", fontWeight: 600 }}>
            {language}
          </span>
        </span>
        <button onClick={copyToClipboard} aria-label="Copy code block">
          {copied ? (
            <>
              <Check size={13} color="#34d399" />
              <span style={{ color: "#34d399" }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre>
        <code>{codeText}</code>
      </pre>
    </div>
  );
}

export default function ChatWindow({
  messages,
  isGenerating,
  onRegenerate,
  streamingMessage,
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll to bottom when messages or streaming updates
  const scrollToBottom = (smooth = true) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  useEffect(() => {
    scrollToBottom(false);
  }, [messages, streamingMessage]);

  // Handle scroll detection for "Scroll to Bottom" floating button
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 120;
    setShowScrollBottom(isUp);
  };

  const copyMessageText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      if (inline)
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      return <CodeBlock className={className}>{children}</CodeBlock>;
    },
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        padding: isMobile
          ? "0.85rem 0.55rem 2rem 0.55rem"
          : "1.5rem 1rem 3rem 1rem",
        position: "relative",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          width: "100%",
          minWidth: 0,
        }}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === "user";
          const isError = msg.isError;

          if (isUser) {
            return (
              <div
                key={idx}
                className="fade-in"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  marginBottom: "1.5rem",
                  width: "100%",
                }}
              >
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#64748b",
                    marginBottom: "0.35rem",
                    fontWeight: 600,
                    paddingRight: "0.3rem",
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                  }}
                >
                  You
                </span>

                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "18px 18px 4px 18px",
                    padding: isMobile ? "0.75rem 0.95rem" : "0.85rem 1.2rem",
                    color: "#ffffff",
                    maxWidth: isMobile ? "92%" : "85%",
                    boxShadow: "0 4px 22px rgba(37, 99, 235, 0.28)",
                    wordBreak: "break-word",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.6rem",
                  }}
                >
                  {/* Render Attached Image if exists */}
                  {msg.image && (
                    <div
                      style={{
                        borderRadius: "12px",
                        overflow: "hidden",
                        maxHeight: isMobile ? "220px" : "280px",
                        maxWidth: "100%",
                        background: "rgba(0,0,0,0.3)",
                      }}
                    >
                      <img
                        src={msg.image}
                        alt="User attached image"
                        style={{
                          width: "100%",
                          maxHeight: isMobile ? "220px" : "280px",
                          objectFit: "contain",
                          display: "block",
                          borderRadius: "10px",
                        }}
                      />
                    </div>
                  )}

                  {/* Render Multiple Media Items if present */}
                  {Array.isArray(msg.media) &&
                    msg.media.length > 0 &&
                    !msg.image && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        {msg.media.map((med, mIdx) => (
                          <img
                            key={mIdx}
                            src={med.data || med}
                            alt="Attached media"
                            style={{
                              maxHeight: isMobile ? "160px" : "200px",
                              maxWidth: "100%",
                              objectFit: "contain",
                              borderRadius: "10px",
                            }}
                          />
                        ))}
                      </div>
                    )}

                  {/* Message Text */}
                  {msg.content && (
                    <div
                      className="markdown-content"
                      style={{ color: "#ffffff" }}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={markdownComponents}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="fade-in"
              style={{
                display: "flex",
                gap: isMobile ? "0.5rem" : "0.75rem",
                marginBottom: isMobile ? "1.2rem" : "1.6rem",
                alignItems: "flex-start",
                width: "100%",
              }}
            >
              {/* AN Avatar */}
              <div
                style={{
                  width: isMobile ? "28px" : "34px",
                  height: isMobile ? "28px" : "34px",
                  borderRadius: isMobile ? "8px" : "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  background: isError
                    ? "rgba(239, 68, 68, 0.2)"
                    : "linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #9333ea 100%)",
                  boxShadow: isError
                    ? "0 4px 12px rgba(239, 68, 68, 0.25)"
                    : "0 4px 18px rgba(99, 102, 241, 0.35)",
                  marginTop: isMobile ? "0.95rem" : "1.35rem",
                  border: isError
                    ? "1px solid rgba(239, 68, 68, 0.35)"
                    : "1px solid rgba(255, 255, 255, 0.15)",
                }}
              >
                {isError ? (
                  <AlertCircle size={isMobile ? 14 : 17} color="#f87171" />
                ) : (
                  <span
                    style={{
                      fontFamily: "Outfit, sans-serif",
                      fontWeight: 800,
                      fontSize: isMobile ? "0.74rem" : "0.82rem",
                      color: "#fff",
                    }}
                  >
                    AN
                  </span>
                )}
              </div>

              {/* Message Content Bubble */}
              <div
                style={{
                  maxWidth: isMobile ? "calc(100% - 36px)" : "calc(100% - 46px)",
                  minWidth: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  width: "100%",
                }}
              >
                {/* Sender Title */}
                <span
                  style={{
                    fontSize: "0.7rem",
                    color: "#64748b",
                    marginBottom: "0.35rem",
                    fontWeight: 600,
                    paddingLeft: "0.3rem",
                    letterSpacing: "0.4px",
                    textTransform: "uppercase",
                  }}
                >
                  {isError ? "Error" : "AN"}
                </span>

                <div
                  style={{
                    background: isError
                      ? "rgba(239, 68, 68, 0.08)"
                      : "rgba(17, 24, 39, 0.88)",
                    border: isError
                      ? "1px solid rgba(239, 68, 68, 0.25)"
                      : "1px solid rgba(99, 102, 241, 0.18)",
                    borderRadius: "4px 18px 18px 18px",
                    padding: isMobile ? "0.8rem 0.95rem" : "0.95rem 1.25rem",
                    color: isError ? "#fca5a5" : "#f1f5f9",
                    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.35)",
                    position: "relative",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    minWidth: 0,
                    width: "100%",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      marginTop: "0.75rem",
                      paddingTop: "0.5rem",
                      borderTop: "1px solid rgba(99, 102, 241, 0.1)",
                    }}
                  >
                    <button
                      onClick={() => copyMessageText(msg.content, idx)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        fontSize: "0.72rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "6px",
                        transition: "all 0.15s ease",
                        fontFamily: "Inter, sans-serif",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background =
                          "rgba(99, 102, 241, 0.12)";
                        e.currentTarget.style.color = "#38bdf8";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#64748b";
                      }}
                      title="Copy response"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={13} color="#34d399" />
                          <span style={{ color: "#34d399" }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {idx === messages.length - 1 && !isGenerating && (
                      <button
                        onClick={onRegenerate}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#64748b",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          fontSize: "0.72rem",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "6px",
                          transition: "all 0.15s ease",
                          fontFamily: "Inter, sans-serif",
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background =
                            "rgba(99, 102, 241, 0.12)";
                          e.currentTarget.style.color = "#c084fc";
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#64748b";
                        }}
                        title="Regenerate response"
                      >
                        <RefreshCw size={13} />
                        <span>Retry</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Live Streaming Message Display */}
        {isGenerating && (
          <div
            className="fade-in"
            style={{
              display: "flex",
              gap: isMobile ? "0.5rem" : "0.75rem",
              marginBottom: isMobile ? "1.2rem" : "1.6rem",
              width: "100%",
            }}
          >
            <div
              style={{
                width: isMobile ? "28px" : "34px",
                height: isMobile ? "28px" : "34px",
                borderRadius: isMobile ? "8px" : "10px",
                background:
                  "linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #9333ea 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 4px 18px rgba(99, 102, 241, 0.4)",
                animation: "gemini-pulse 2s infinite",
                marginTop: isMobile ? "0.95rem" : "1.35rem",
              }}
            >
              <span
                style={{
                  fontFamily: "Outfit, sans-serif",
                  fontWeight: 800,
                  fontSize: isMobile ? "0.74rem" : "0.82rem",
                  color: "#fff",
                }}
              >
                AN
              </span>
            </div>

            <div
              style={{
                maxWidth: isMobile ? "calc(100% - 36px)" : "calc(100% - 46px)",
                minWidth: 0,
                width: "100%",
              }}
            >
              <span
                style={{
                  fontSize: "0.7rem",
                  color: "#38bdf8",
                  marginBottom: "0.35rem",
                  display: "block",
                  fontWeight: 600,
                  padding: "0 0.3rem",
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                }}
              >
                AN · Thinking & Streaming
              </span>

              <div
                style={{
                  background: "rgba(17, 24, 39, 0.88)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  borderRadius: "4px 18px 18px 18px",
                  padding: isMobile ? "0.8rem 0.95rem" : "0.95rem 1.25rem",
                  color: "#f1f5f9",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  boxShadow: "0 0 25px rgba(99, 102, 241, 0.15)",
                  minWidth: 0,
                  width: "100%",
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                <div className="markdown-content">
                  {streamingMessage ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                  ) : (
                    <span style={{ color: "#94a3b8", fontStyle: "italic" }}>
                      Thinking...
                    </span>
                  )}
                  <span className="typing-cursor" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ height: "2rem" }} />
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          style={{
            position: "fixed",
            bottom: isMobile ? "80px" : "100px",
            right: isMobile ? "16px" : "24px",
            background:
              "linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #9333ea 100%)",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: isMobile ? "36px" : "40px",
            height: isMobile ? "36px" : "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.5)",
            zIndex: 30,
            transition: "transform 0.15s ease",
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
          onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
          title="Scroll to Bottom"
          aria-label="Scroll to Bottom"
        >
          <ArrowDown size={isMobile ? 16 : 18} />
        </button>
      )}
    </div>
  );
}
