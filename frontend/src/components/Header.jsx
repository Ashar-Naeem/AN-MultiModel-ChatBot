import React from 'react';
import { 
  PanelLeft, 
  Settings, 
  Sliders, 
  RotateCcw, 
  Download,
  Flame
} from 'lucide-react';

export default function Header({ 
  models, 
  selectedModel, 
  onSelectModel, 
  onToggleSidebar, 
  onOpenSettings,
  onClearChat,
  onExportChat,
  systemPrompt
}) {
  const currentModelObj = models.find(m => m.id === selectedModel) || {
    id: selectedModel,
    name: selectedModel,
    description: 'Groq LLM'
  };

  return (
    <header style={{
      height: '58px',
      borderBottom: '1px solid rgba(225, 29, 72, 0.1)',
      background: 'rgba(12, 10, 11, 0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.1rem',
      zIndex: 20,
      flexShrink: 0,
      position: 'relative',
    }}>
      {/* Subtle header glow line at bottom */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(225,29,72,0.3), transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Toggle Sidebar Button */}
        <button 
          onClick={onToggleSidebar}
          style={{
            background: 'rgba(225, 29, 72, 0.08)',
            border: '1px solid rgba(225, 29, 72, 0.15)',
            color: '#a1919a',
            cursor: 'pointer',
            padding: '0.38rem',
            borderRadius: '8px',
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
          title="Toggle Sidebar"
        >
          <PanelLeft size={17} />
        </button>

        {/* Model Selector */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(225, 29, 72, 0.08)',
            border: '1px solid rgba(225, 29, 72, 0.2)',
            padding: '0.32rem 0.7rem',
            borderRadius: '9px',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(225,29,72,0.4)'}
          onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(225,29,72,0.2)'}
          >
            <Flame size={14} color="#e11d48" />
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#f5f0f1',
                fontFamily: 'Outfit, sans-serif',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                outline: 'none',
                paddingRight: '0.4rem',
              }}
            >
              {models.map((m) => (
                <option 
                  key={m.id} 
                  value={m.id}
                  style={{ background: '#110d0f', color: '#f5f0f1' }}
                >
                  {m.name || m.id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        {systemPrompt && (
          <div 
            onClick={onOpenSettings}
            style={{ 
              fontSize: '0.72rem', 
              color: '#fb7185', 
              background: 'rgba(225, 29, 72, 0.1)', 
              border: '1px solid rgba(225, 29, 72, 0.25)',
              padding: '0.22rem 0.55rem', 
              borderRadius: '999px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontWeight: 500,
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(225,29,72,0.2)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(225,29,72,0.1)'}
            title="Custom System Instructions Active"
          >
            <Sliders size={11} />
            <span>Custom Persona</span>
          </div>
        )}

        <button 
          onClick={onExportChat}
          style={{
            background: 'transparent',
            border: '1px solid rgba(225, 29, 72, 0.12)',
            color: '#a1919a',
            cursor: 'pointer',
            padding: '0.38rem 0.6rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.78rem',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(225,29,72,0.08)';
            e.currentTarget.style.color = '#fb7185';
            e.currentTarget.style.borderColor = 'rgba(225,29,72,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#a1919a';
            e.currentTarget.style.borderColor = 'rgba(225,29,72,0.12)';
          }}
          title="Export Conversation JSON"
        >
          <Download size={14} />
          <span>Export</span>
        </button>

        <button 
          onClick={onClearChat}
          style={{
            background: 'transparent',
            border: '1px solid rgba(225, 29, 72, 0.12)',
            color: '#a1919a',
            cursor: 'pointer',
            padding: '0.38rem 0.6rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.78rem',
            transition: 'all 0.15s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(225,29,72,0.08)';
            e.currentTarget.style.color = '#fb7185';
            e.currentTarget.style.borderColor = 'rgba(225,29,72,0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#a1919a';
            e.currentTarget.style.borderColor = 'rgba(225,29,72,0.12)';
          }}
          title="Clear Current Messages"
        >
          <RotateCcw size={14} />
          <span>Clear</span>
        </button>

        <button 
          onClick={onOpenSettings}
          style={{
            background: 'rgba(225, 29, 72, 0.08)',
            border: '1px solid rgba(225, 29, 72, 0.15)',
            color: '#a1919a',
            cursor: 'pointer',
            padding: '0.38rem',
            borderRadius: '8px',
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
          title="Settings"
        >
          <Settings size={17} />
        </button>
      </div>
    </header>
  );
}
