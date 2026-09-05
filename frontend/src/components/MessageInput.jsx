import React, { useState, useRef, useEffect } from "react";
import { Send, Square, Sparkles, Image, Paperclip, X } from "lucide-react";

export default function MessageInput({
  onSendMessage,
  isGenerating,
  onStopGeneration,
}) {
  const [input, setInput] = useState("");
  const [selectedMedia, setSelectedMedia] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    // Reset file input value so the same file can be chosen again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processFiles = (files) => {
    const validImageFiles = files.filter((f) => f.type.startsWith("image/"));
    if (validImageFiles.length === 0) return;

    validImageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Data = event.target.result;
        setSelectedMedia((prev) => [
          ...prev,
          {
            id:
              "media_" +
              Date.now() +
              "_" +
              Math.random().toString(36).substr(2, 5),
            name: file.name,
            mimeType: file.type,
            dataUrl: base64Data,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Support pasting image from clipboard
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const removeMedia = (id) => {
    setSelectedMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const hasText = input.trim().length > 0;
    const hasMedia = selectedMedia.length > 0;

    if ((hasText || hasMedia) && !isGenerating) {
      const payload = {
        text: input.trim(),
        image: selectedMedia.length > 0 ? selectedMedia[0].dataUrl : null,
        media: selectedMedia.map((m) => ({
          mimeType: m.mimeType,
          data: m.dataUrl,
        })),
      };

      onSendMessage(payload);
      setInput("");
      setSelectedMedia([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const canSubmit =
    (input.trim().length > 0 || selectedMedia.length > 0) && !isGenerating;

  return (
    <div
      style={{
        padding: isMobile
          ? "0.45rem 0.55rem calc(0.55rem + env(safe-area-inset-bottom, 0px)) 0.55rem"
          : "0.75rem 1rem 0.85rem 1rem",
        background: "rgba(9, 13, 22, 0.96)",
        borderTop: "1px solid rgba(99, 102, 241, 0.15)",
        position: "relative",
        zIndex: 10,
        flexShrink: 0,
      }}
    >
      {/* Subtle top edge gradient glow */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.35), rgba(192, 132, 252, 0.35), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        style={{ display: "none" }}
      />

      <div
        style={{
          maxWidth: "820px",
          margin: "0 auto",
          position: "relative",
          width: "100%",
        }}
      >
        {/* Media Preview Drawer */}
        {selectedMedia.length > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.65rem",
              paddingBottom: "0.65rem",
              overflowX: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {selectedMedia.map((media) => (
              <div
                key={media.id}
                style={{
                  position: "relative",
                  width: "64px",
                  height: "64px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid rgba(99, 102, 241, 0.4)",
                  boxShadow: "0 4px 14px rgba(0, 0, 0, 0.4)",
                  flexShrink: 0,
                  background: "#0b0f19",
                }}
              >
                <img
                  src={media.dataUrl}
                  alt={media.name || "Uploaded media"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <button
                  onClick={() => removeMedia(media.id)}
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "3px",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.75)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                    transition: "all 0.15s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#ef4444")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "rgba(0, 0, 0, 0.75)")
                  }
                  title="Remove image"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div
          style={{
            background: "#111726",
            border: `1px solid ${canSubmit || isGenerating ? "rgba(99, 102, 241, 0.45)" : "rgba(99, 102, 241, 0.18)"}`,
            borderRadius: "16px",
            padding: isMobile
              ? "0.4rem 0.55rem 0.4rem 0.6rem"
              : "0.5rem 0.75rem 0.5rem 0.85rem",
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "0.45rem" : "0.65rem",
            boxShadow: canSubmit
              ? "0 0 24px rgba(99, 102, 241, 0.18), 0 8px 32px rgba(0, 0, 0, 0.4)"
              : "0 8px 32px rgba(0, 0, 0, 0.35)",
            transition: "all 0.2s ease",
          }}
        >
          {/* Media Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            style={{
              background:
                selectedMedia.length > 0
                  ? "rgba(56, 189, 248, 0.15)"
                  : "transparent",
              border: `1px solid ${selectedMedia.length > 0 ? "rgba(56, 189, 248, 0.4)" : "rgba(99, 102, 241, 0.2)"}`,
              color: selectedMedia.length > 0 ? "#38bdf8" : "#94a3b8",
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(99, 102, 241, 0.15)";
              e.currentTarget.style.color = "#38bdf8";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background =
                selectedMedia.length > 0
                  ? "rgba(56, 189, 248, 0.15)"
                  : "transparent";
              e.currentTarget.style.color =
                selectedMedia.length > 0 ? "#38bdf8" : "#94a3b8";
            }}
            title="Attach image or media"
            aria-label="Attach image or media"
          >
            <Image size={18} />
          </button>

          {/* Prompt Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={
              selectedMedia.length > 0
                ? "Ask about this image..."
                : isMobile
                  ? "Message AN..."
                  : "Ask AN anything... (Shift+Enter for newline, or paste images)"
            }
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: "#f8fafc",
              fontSize: isMobile ? "16px" : "0.94rem",
              fontFamily: "Inter, sans-serif",
              resize: "none",
              outline: "none",
              maxHeight: "160px",
              lineHeight: 1.5,
              padding: "0.25rem 0",
            }}
          />

          {/* Action Button */}
          {isGenerating ? (
            <button
              onClick={onStopGeneration}
              style={{
                width: isMobile ? "40px" : "38px",
                height: isMobile ? "40px" : "38px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "#f87171",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
                transition: "all 0.15s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.25)";
                e.currentTarget.style.transform = "scale(1.05)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
                e.currentTarget.style.transform = "scale(1)";
              }}
              title="Stop Generation"
              aria-label="Stop Generation"
            >
              <Square size={14} fill="#f87171" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!canSubmit}
              style={{
                width: isMobile ? "40px" : "38px",
                height: isMobile ? "40px" : "38px",
                borderRadius: "10px",
                background: canSubmit
                  ? "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #9333ea 100%)"
                  : "rgba(99, 102, 241, 0.08)",
                border: canSubmit
                  ? "1px solid rgba(255, 255, 255, 0.2)"
                  : "1px solid rgba(99, 102, 241, 0.12)",
                color: canSubmit ? "#ffffff" : "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: canSubmit ? "pointer" : "not-allowed",
                flexShrink: 0,
                boxShadow: canSubmit
                  ? "0 4px 18px rgba(99, 102, 241, 0.4)"
                  : "none",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                if (canSubmit) {
                  e.currentTarget.style.transform = "scale(1.06)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 22px rgba(99, 102, 241, 0.6)";
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = canSubmit
                  ? "0 4px 18px rgba(99, 102, 241, 0.4)"
                  : "none";
              }}
              title="Send Prompt"
              aria-label="Send Prompt"
            >
              <Send size={16} />
            </button>
          )}
        </div>

        {/* Footer info row */}
        {isMobile ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginTop: "0.3rem",
              padding: "0 0.2rem",
              fontSize: "0.68rem",
              color: "#64748b",
              gap: "0.3rem",
            }}
          >
            <Sparkles size={11} color="#38bdf8" />
            <span>
              AN AI · Developed by{" "}
              <strong style={{ color: "#38bdf8", fontWeight: 600 }}>
                Ashar Naeem
              </strong>
            </span>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "0.45rem",
              padding: "0 0.35rem",
              fontSize: "0.72rem",
              color: "#64748b",
              flexWrap: "wrap",
              gap: "0.2rem",
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                color: "#94a3b8",
                fontWeight: 500,
              }}
            >
              <Sparkles size={12} color="#38bdf8" />
              AN Multimodal AI
            </span>

            <span style={{ fontWeight: 500, color: "#94a3b8" }}>
              Developed by{" "}
              <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                Ashar Naeem
              </span>
            </span>

            <span
              style={{ minWidth: "40px", textAlign: "right", color: "#64748b" }}
            >
              {selectedMedia.length > 0
                ? `${selectedMedia.length} image${selectedMedia.length > 1 ? "s" : ""}`
                : input.length > 0
                  ? `${input.length}c`
                  : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
