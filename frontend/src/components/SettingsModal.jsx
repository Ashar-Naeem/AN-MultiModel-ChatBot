import React from 'react';
import { X, Sliders, Trash2, CheckCircle2, Flame } from 'lucide-react';

const SYSTEM_PRESETS = [
  { label: "Default Assistant", prompt: "You are a helpful, respectful, and honest AI assistant powered by Groq." },
  { label: "Expert Developer", prompt: "You are a senior full-stack software engineer. Provide concise, clean, well-formatted, production-ready code with concise technical explanations." },
  { label: "Creative Writer", prompt: "You are an imaginative creative writer and storyteller. Use expressive language, engaging narratives, and vivid details." },
  { label: "Concise Summarizer", prompt: "Respond with absolute brevity. Use bullet points and summary highlights without fluff or extra words." }
];

const labelStyle = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: '#f5f0f1',
  marginBottom: '0.4rem',
  fontFamily: 'Inter, sans-serif',
};

const subLabelStyle = {
  fontSize: '0.76rem',
  color: '#a1919a',
  marginBottom: '0.6rem',
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
  onClearAllChats
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        background: '#130e10',
        border: '1px solid rgba(225, 29, 72, 0.2)',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(225, 29, 72, 0.08)',
        position: 'relative',
      }}>
        {/* Top glow accent */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '80px',
          background: 'linear-gradient(180deg, rgba(225,29,72,0.08) 0%, transparent 100%)',
          borderRadius: '18px 18px 0 0',
          pointerEvents: 'none',
        }} />

        {/* Modal Header */}
        <div style={{
          padding: '1.2rem 1.5rem',
          borderBottom: '1px solid rgba(225, 29, 72, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '30px', height: '30px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(225,29,72,0.35)',
            }}>
              <Sliders size={15} color="#fff" />
            </div>
            <h2 style={{
              fontFamily: 'Outfit, sans-serif',
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.2px',
            }}>
              Studio Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(225,29,72,0.08)',
              border: '1px solid rgba(225,29,72,0.15)',
              color: '#a1919a',
              cursor: 'pointer',
              padding: '0.3rem',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(225,29,72,0.15)';
              e.currentTarget.style.color = '#fb7185';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(225,29,72,0.08)';
              e.currentTarget.style.color = '#a1919a';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.4rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* System Persona */}
          <div>
            <label style={labelStyle}>System Persona / Instructions</label>
            <p style={subLabelStyle}>
              Define how the Groq AI model behaves, responds, and formats output.
            </p>
            <textarea 
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="e.g. You are a helpful software engineering assistant..."
              rows={3}
              style={{
                width: '100%',
                background: '#1a1014',
                border: '1px solid rgba(225,29,72,0.15)',
                borderRadius: '9px',
                padding: '0.75rem',
                color: '#f5f0f1',
                fontSize: '0.84rem',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                resize: 'vertical',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(225,29,72,0.45)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(225,29,72,0.15)'}
            />

            {/* Presets */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.6rem' }}>
              {SYSTEM_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setSystemPrompt(preset.prompt)}
                  style={{
                    fontSize: '0.7rem',
                    background: 'rgba(225, 29, 72, 0.07)',
                    border: '1px solid rgba(225, 29, 72, 0.15)',
                    color: '#a1919a',
                    padding: '0.23rem 0.55rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(225,29,72,0.4)';
                    e.currentTarget.style.color = '#fb7185';
                    e.currentTarget.style.background = 'rgba(225,29,72,0.12)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(225,29,72,0.15)';
                    e.currentTarget.style.color = '#a1919a';
                    e.currentTarget.style.background = 'rgba(225,29,72,0.07)';
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Temperature Slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Temperature <span style={{ color: '#e11d48', fontWeight: 700 }}>{temperature}</span>
              </label>
              <span style={{ fontSize: '0.73rem', color: '#fb7185', fontWeight: 500 }}>
                {temperature < 0.3 ? 'Factual & Precise' : temperature < 0.8 ? 'Balanced' : 'Creative & Wild'}
              </span>
            </div>
            <input 
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#e11d48', cursor: 'pointer', height: '4px' }}
            />
          </div>

          {/* Max Tokens */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>
                Max Tokens <span style={{ color: '#e11d48', fontWeight: 700 }}>{maxTokens}</span>
              </label>
            </div>
            <input 
              type="range"
              min="256"
              max="4096"
              step="256"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: '#e11d48', cursor: 'pointer', height: '4px' }}
            />
          </div>

          {/* Status Banner */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.07)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '9px',
            padding: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}>
            <CheckCircle2 size={17} color="#10b981" />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#10b981' }}>
                Groq SDK Connected
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a1919a' }}>
                High-speed LPU hardware active
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{ borderTop: '1px solid rgba(225, 29, 72, 0.1)', paddingTop: '1rem' }}>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to delete all saved chat sessions?")) {
                  onClearAllChats();
                  onClose();
                }
              }}
              style={{
                width: '100%',
                background: 'rgba(239, 68, 68, 0.07)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#f87171',
                padding: '0.6rem',
                borderRadius: '9px',
                fontWeight: 600,
                fontSize: '0.83rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.14)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.07)';
                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
              }}
            >
              <Trash2 size={15} />
              <span>Delete All Chat History</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid rgba(225, 29, 72, 0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
              color: '#fff',
              border: 'none',
              padding: '0.5rem 1.4rem',
              borderRadius: '9px',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 4px 16px rgba(225, 29, 72, 0.35)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(225,29,72,0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(225,29,72,0.35)';
            }}
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
