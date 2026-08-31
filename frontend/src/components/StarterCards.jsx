import React from 'react';
import { Flame } from 'lucide-react';

export default function StarterCards({ modelName }) {
  return (
    <div style={{
      maxWidth: '720px',
      width: '100%',
      margin: '0 auto',
      padding: '2rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Brand Icon */}
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '22px',
        background: 'linear-gradient(135deg, rgba(225,29,72,0.2) 0%, rgba(159,18,57,0.15) 100%)',
        border: '1px solid rgba(225, 29, 72, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.75rem',
        boxShadow: '0 8px 40px rgba(225, 29, 72, 0.25)',
        position: 'relative',
      }}>
        {/* Inner glow */}
        <div style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius: '22px',
          background: 'radial-gradient(circle at 50% 0%, rgba(225,29,72,0.15), transparent 60%)',
          pointerEvents: 'none',
        }} />
        <Flame size={34} color="#e11d48" />
      </div>

      <h2 style={{
        fontFamily: 'Outfit, sans-serif',
        fontSize: '2.6rem',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #ffffff 0%, #fda4af 60%, #e11d48 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '0.7rem',
        textAlign: 'center',
        letterSpacing: '-0.8px',
        lineHeight: 1.1,
      }}>
        How can I help you today?
      </h2>

      <p style={{
        color: '#a1919a',
        fontSize: '0.97rem',
        textAlign: 'center',
        maxWidth: '480px',
        lineHeight: 1.6,
        marginTop: '0.3rem',
      }}>
        Powered by{' '}
        <strong style={{ color: '#e11d48', fontWeight: 600 }}>Groq LPU Inference</strong>
        {' '}using{' '}
        <span style={{ color: '#fb7185', fontWeight: 600 }}>{modelName || 'GPT-OSS 120B'}</span>
      </p>

      {/* Decorative divider */}
      <div style={{
        marginTop: '2.5rem',
        width: '120px',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(225,29,72,0.4), transparent)',
      }} />
    </div>
  );
}
