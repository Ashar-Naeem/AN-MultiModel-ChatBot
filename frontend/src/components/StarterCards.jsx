import React from 'react';
import { Sparkles } from 'lucide-react';

export default function StarterCards({ modelName }) {
  return (
    <div style={{
      maxWidth: '680px',
      width: '100%',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
    }}>
      {/* Brand AN Avatar Icon */}
      <div style={{
        width: '76px',
        height: '76px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #2563eb 0%, #6366f1 50%, #9333ea 100%)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 40px rgba(99, 102, 241, 0.45)',
        position: 'relative',
      }}>
        {/* Ambient background glow */}
        <div style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '26px',
          background: 'radial-gradient(circle at 50% 0%, rgba(56, 189, 248, 0.4), transparent 70%)',
          pointerEvents: 'none',
        }} />
        <span style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 800,
          fontSize: '1.8rem',
          color: '#ffffff',
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}>
          AN
        </span>
      </div>

      {/* Main Greeting Heading */}
      <h2 style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: 'clamp(2rem, 5.5vw, 2.75rem)',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #ffffff 0%, #93c5fd 40%, #c084fc 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.6rem',
        textAlign: 'center',
        letterSpacing: '-0.6px',
        lineHeight: 1.15,
      }}>
        How can I help you today?
      </h2>

      {/* Tagline */}
      <p style={{
        color: '#94a3b8',
        fontSize: '1rem',
        textAlign: 'center',
        maxWidth: '460px',
        lineHeight: 1.6,
        margin: '0 auto',
      }}>
        <strong style={{ color: '#f8fafc', fontWeight: 600 }}>AN Multimodal Assistant</strong>
        {' '}·{' '}
        <span style={{ color: '#38bdf8', fontWeight: 500 }}>{modelName || 'Gemini 3.6 Flash'}</span>
      </p>

      {/* Subtle Divider */}
      <div style={{
        marginTop: '2.2rem',
        width: '100px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.4), transparent)',
      }} />
    </div>
  );
}
