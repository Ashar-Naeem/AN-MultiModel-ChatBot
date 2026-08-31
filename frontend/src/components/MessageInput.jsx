import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Flame } from 'lucide-react';

export default function MessageInput({ 
  onSendMessage, 
  isGenerating, 
  onStopGeneration 
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    if (input.trim() && !isGenerating) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const hasInput = input.trim().length > 0;

  return (
    <div style={{
      padding: '0.8rem 1.5rem 0.9rem 1.5rem',
      background: 'rgba(12, 10, 11, 0.97)',
      borderTop: '1px solid rgba(225, 29, 72, 0.1)',
      position: 'relative',
      zIndex: 10,
      flexShrink: 0,
    }}>
      {/* Glow line on top edge */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(225,29,72,0.25), transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '820px',
        margin: '0 auto',
        position: 'relative',
      }}>
        <div style={{
          background: '#1a1014',
          border: `1px solid ${hasInput || isGenerating ? 'rgba(225, 29, 72, 0.35)' : 'rgba(225, 29, 72, 0.12)'}`,
          borderRadius: '14px',
          padding: '0.6rem 0.8rem 0.6rem 1.1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.7rem',
          boxShadow: hasInput
            ? '0 0 20px rgba(225, 29, 72, 0.12), 0 8px 32px rgba(0,0,0,0.4)'
            : '0 8px 32px rgba(0,0,0,0.35)',
          transition: 'all 0.2s ease',
        }}>
          {/* Prompt Textarea */}
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Groq AI anything... (Shift+Enter for newline)"
            rows={1}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f5f0f1',
              fontSize: '0.94rem',
              fontFamily: 'Inter, sans-serif',
              resize: 'none',
              outline: 'none',
              maxHeight: '180px',
              lineHeight: 1.55,
              padding: '0.1rem 0',
            }}
          />

          {/* Action Button */}
          {isGenerating ? (
            <button
              onClick={onStopGeneration}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.25)';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Stop Generation"
            >
              <Square size={14} fill="#f87171" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={!hasInput}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: hasInput 
                  ? 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)' 
                  : 'rgba(225, 29, 72, 0.06)',
                border: hasInput
                  ? '1px solid rgba(225, 29, 72, 0.4)'
                  : '1px solid rgba(225, 29, 72, 0.1)',
                color: hasInput ? '#ffffff' : '#6b5a60',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: hasInput ? 'pointer' : 'not-allowed',
                flexShrink: 0,
                boxShadow: hasInput ? '0 4px 16px rgba(225, 29, 72, 0.4)' : 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                if (hasInput) {
                  e.currentTarget.style.transform = 'scale(1.06)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(225,29,72,0.55)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = hasInput ? '0 4px 16px rgba(225,29,72,0.4)' : 'none';
              }}
              title="Send Message"
            >
              <Send size={16} />
            </button>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.45rem',
          padding: '0 0.4rem',
          fontSize: '0.72rem',
          color: '#6b5a60',
        }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            color: '#a1919a', fontWeight: 500,
          }}>
            <Flame size={12} color="#e11d48" />
            Powered by Groq LPU
          </span>

          <span style={{ fontWeight: 500, color: '#a1919a' }}>
            Developed by <span style={{ color: '#e11d48', fontWeight: 600 }}>Ashar Naeem</span>
          </span>

          <span style={{ minWidth: '50px', textAlign: 'right', color: '#6b5a60' }}>
            {input.length > 0 ? `${input.length} chars` : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
