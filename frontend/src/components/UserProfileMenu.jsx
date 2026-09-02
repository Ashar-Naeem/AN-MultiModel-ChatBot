import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, Sparkles, CheckCircle2, ChevronDown } from 'lucide-react';

export default function UserProfileMenu({ user, onLogout, onOpenAuthModal }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => onOpenAuthModal('login')}
        style={{
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.25) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          color: '#f8fafc',
          cursor: 'pointer',
          padding: '0.4rem 0.85rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 10px rgba(99, 102, 241, 0.2)',
          flexShrink: 0,
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.25) 0%, rgba(99, 102, 241, 0.4) 100%)';
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.6)';
          e.currentTarget.style.boxShadow = '0 0 15px rgba(56, 189, 248, 0.4)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56, 189, 248, 0.15) 0%, rgba(99, 102, 241, 0.25) 100%)';
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.4)';
          e.currentTarget.style.boxShadow = '0 2px 10px rgba(99, 102, 241, 0.2)';
        }}
      >
        <User size={15} color="#38bdf8" />
        <span>Sign In</span>
      </button>
    );
  }

  // Get user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      {/* Profile Trigger Button */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          background: 'rgba(15, 23, 42, 0.7)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '11px',
          padding: '0.3rem 0.55rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.5)';
          e.currentTarget.style.background = 'rgba(28, 36, 56, 0.8)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.3)';
          e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)';
        }}
      >
        {/* Avatar Bubble */}
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Outfit, sans-serif',
          boxShadow: '0 2px 8px rgba(99, 102, 241, 0.35)',
        }}>
          {getInitials(user.name)}
        </div>

        {/* User Name Preview */}
        <span style={{
          color: '#f8fafc',
          fontSize: '0.84rem',
          fontWeight: 600,
          fontFamily: 'Outfit, sans-serif',
          maxWidth: '100px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {user.name || 'User'}
        </span>

        <ChevronDown size={14} color="#94a3b8" />
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          width: '230px',
          background: 'linear-gradient(180deg, #111827 0%, #0b0f19 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15)',
          padding: '0.85rem',
          zIndex: 50,
          animation: 'fadeIn 0.15s ease-out',
        }}>
          {/* User Details */}
          <div style={{
            paddingBottom: '0.75rem',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '0.75rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.35rem',
            }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #38bdf8 0%, #6366f1 100%)',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Outfit, sans-serif',
              }}>
                {getInitials(user.name)}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{
                  color: '#f8fafc',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  fontFamily: 'Outfit, sans-serif',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}>
                  {user.name}
                </div>
                <div style={{
                  color: '#94a3b8',
                  fontSize: '0.74rem',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}>
                  {user.email}
                </div>
              </div>
            </div>

            {/* MongoDB status badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              background: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.25)',
              padding: '0.2rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.68rem',
              color: '#86efac',
              marginTop: '0.25rem',
            }}>
              <CheckCircle2 size={11} color="#22c55e" />
              <span>MongoDB Atlas Cloud</span>
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            onClick={() => {
              setDropdownOpen(false);
              onLogout();
            }}
            style={{
              width: '100%',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#fca5a5',
              padding: '0.55rem 0.75rem',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#fca5a5';
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      )}
    </div>
  );
}
