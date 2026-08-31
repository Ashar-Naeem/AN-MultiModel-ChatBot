import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Bot, 
  Copy, 
  Check, 
  RefreshCw, 
  ArrowDown, 
  AlertCircle,
  Terminal,
  Flame
} from 'lucide-react';

// Custom Code Block component with Copy button & Language Badge
function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : 'code';
  const codeText = String(children).replace(/\n$/, '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a1919a' }}>
          <Terminal size={12} />
          <span>{language}</span>
        </span>
        <button onClick={copyToClipboard}>
          {copied ? (
            <>
              <Check size={12} color="#10b981" />
              <span style={{ color: '#10b981' }}>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={12} />
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
  streamingMessage
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll to bottom when messages or streaming updates
  const scrollToBottom = (smooth = true) => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
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
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const copyMessageText = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      if (inline) return <code className={className} {...props}>{children}</code>;
      return <CodeBlock className={className}>{children}</CodeBlock>;
    }
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '2rem 1.5rem 3rem 1.5rem',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: '820px', margin: '0 auto', width: '100%', minWidth: 0 }}>
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isError = msg.isError;

          if (isUser) {
            return (
              <div
                key={idx}
                className="fade-in"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  marginBottom: '1.6rem',
                }}
              >
                <span style={{
                  fontSize: '0.7rem',
                  color: '#6b5a60',
                  marginBottom: '0.3rem',
                  fontWeight: 600,
                  paddingRight: '0.25rem',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}>
                  You
                </span>

                <div style={{
                  background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
                  border: '1px solid rgba(225, 29, 72, 0.3)',
                  borderRadius: '18px 18px 4px 18px',
                  padding: '0.8rem 1.2rem',
                  color: '#fff',
                  maxWidth: '78%',
                  boxShadow: '0 4px 20px rgba(225, 29, 72, 0.25)',
                  wordBreak: 'break-word',
                }}>
                  <div className="markdown-content" style={{ color: '#fff' }}>
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={idx}
              className="fade-in"
              style={{
                display: 'flex',
                gap: '0.8rem',
                marginBottom: '1.6rem',
                alignItems: 'flex-start',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: isError 
                  ? 'rgba(239, 68, 68, 0.2)'
                  : 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
                boxShadow: isError
                  ? '0 4px 12px rgba(239,68,68,0.2)'
                  : '0 4px 16px rgba(225, 29, 72, 0.3)',
                marginTop: '1.35rem',
                border: isError
                  ? '1px solid rgba(239,68,68,0.3)'
                  : '1px solid rgba(225,29,72,0.2)',
              }}>
                {isError 
                  ? <AlertCircle size={16} color="#f87171" />
                  : <Flame size={16} color="#fff" />
                }
              </div>

              {/* Message Content Bubble */}
              <div style={{
                maxWidth: '84%',
                minWidth: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
                {/* Sender Name */}
                <span style={{
                  fontSize: '0.7rem',
                  color: '#6b5a60',
                  marginBottom: '0.3rem',
                  fontWeight: 600,
                  paddingLeft: '0.25rem',
                  letterSpacing: '0.3px',
                  textTransform: 'uppercase',
                }}>
                  {isError ? 'Error' : 'Groq Assistant'}
                </span>

                <div style={{
                  background: isError 
                    ? 'rgba(239, 68, 68, 0.08)' 
                    : 'rgba(28, 18, 22, 0.9)',
                  border: isError 
                    ? '1px solid rgba(239, 68, 68, 0.25)' 
                    : '1px solid rgba(225, 29, 72, 0.1)',
                  borderRadius: '4px 18px 18px 18px',
                  padding: '0.95rem 1.2rem',
                  color: isError ? '#f87171' : '#f5f0f1',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                  position: 'relative',
                  backdropFilter: 'blur(8px)',
                  minWidth: 0,
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}>
                  <div className="markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>

                  {/* Actions Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginTop: '0.7rem',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(225, 29, 72, 0.08)',
                  }}>
                    <button
                      onClick={() => copyMessageText(msg.content, idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6b5a60',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.7rem',
                        padding: '0.22rem 0.5rem',
                        borderRadius: '6px',
                        transition: 'all 0.15s ease',
                        fontFamily: 'Inter, sans-serif',
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(225,29,72,0.08)';
                        e.currentTarget.style.color = '#fb7185';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#6b5a60';
                      }}
                      title="Copy message"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check size={12} color="#10b981" />
                          <span style={{ color: '#10b981' }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    {idx === messages.length - 1 && !isGenerating && (
                      <button
                        onClick={onRegenerate}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#6b5a60',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.7rem',
                          padding: '0.22rem 0.5rem',
                          borderRadius: '6px',
                          transition: 'all 0.15s ease',
                          fontFamily: 'Inter, sans-serif',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(225,29,72,0.08)';
                          e.currentTarget.style.color = '#fb7185';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#6b5a60';
                        }}
                        title="Regenerate response"
                      >
                        <RefreshCw size={12} />
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
          <div className="fade-in" style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.6rem' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(225, 29, 72, 0.4)',
              animation: 'rose-pulse 2s infinite',
            }}>
              <Flame size={16} color="#fff" />
            </div>

            <div style={{ maxWidth: '84%', minWidth: 0, overflow: 'hidden' }}>
              <span style={{
                fontSize: '0.7rem',
                color: '#6b5a60',
                marginBottom: '0.3rem',
                display: 'block',
                fontWeight: 600,
                padding: '0 0.25rem',
                letterSpacing: '0.3px',
                textTransform: 'uppercase',
              }}>
                Groq Assistant · Streaming
              </span>

              <div style={{
                background: 'rgba(28, 18, 22, 0.9)',
                border: '1px solid rgba(225, 29, 72, 0.2)',
                borderRadius: '4px 18px 18px 18px',
                padding: '0.95rem 1.2rem',
                color: '#f5f0f1',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 0 20px rgba(225,29,72,0.08)',
                minWidth: 0,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}>
                <div className="markdown-content">
                  {streamingMessage ? (
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                  ) : (
                    <span style={{ color: '#6b5a60', fontStyle: 'italic' }}>Thinking...</span>
                  )}
                  <span className="typing-cursor" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ height: '2rem' }} />
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={() => scrollToBottom(true)}
          style={{
            position: 'fixed',
            bottom: '110px',
            right: '28px',
            background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 18px rgba(225, 29, 72, 0.5)',
            zIndex: 10,
            transition: 'transform 0.15s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          title="Scroll to Bottom"
        >
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
}
