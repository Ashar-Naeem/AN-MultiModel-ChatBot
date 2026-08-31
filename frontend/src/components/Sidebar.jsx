import React, { useState } from 'react';
import { 
  Plus, 
  MessageSquare, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  Search, 
  Settings, 
  Flame,
  PanelLeftClose, 
  PanelLeft 
} from 'lucide-react';

export default function Sidebar({ 
  chats, 
  activeChatId, 
  onSelectChat, 
  onNewChat, 
  onDeleteChat, 
  onRenameChat, 
  onOpenSettings,
  isOpen,
  onToggleSidebar
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 30, backdropFilter: 'blur(4px)'
          }}
          onClick={onToggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: isOpen ? '272px' : '0',
          minWidth: isOpen ? '272px' : '0',
          overflow: 'hidden',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          background: '#110d0f',
          borderRight: '1px solid rgba(225, 29, 72, 0.12)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        {/* Subtle sidebar glow at top */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '200px',
          background: 'linear-gradient(180deg, rgba(225,29,72,0.06) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{
          padding: '1.2rem 1.1rem',
          borderBottom: '1px solid rgba(225, 29, 72, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: '10px', 
              background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(225, 29, 72, 0.4)',
              flexShrink: 0,
            }}>
              <Flame size={18} color="#fff" />
            </div>
            <div style={{ whiteSpace: 'nowrap' }}>
              <h1 style={{
                fontFamily: 'Outfit, sans-serif',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#fff',
                margin: 0,
                lineHeight: 1.2,
                letterSpacing: '-0.2px'
              }}>
                Groq Studio
              </h1>
              <span style={{
                fontSize: '0.65rem',
                color: '#e11d48',
                fontWeight: 600,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
              }}>
                LPU LIGHTNING SPEED
              </span>
            </div>
          </div>

          <button 
            onClick={onToggleSidebar}
            style={{
              background: 'rgba(225, 29, 72, 0.08)',
              border: '1px solid rgba(225, 29, 72, 0.15)',
              color: '#a1919a',
              cursor: 'pointer',
              padding: '0.3rem',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0,
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
            <PanelLeftClose size={18} />
          </button>
        </div>

        {/* New Chat Button */}
        <div style={{ padding: '1rem 1rem 0.6rem 1rem', flexShrink: 0, position: 'relative', zIndex: 1 }}>
          <button
            onClick={onNewChat}
            style={{
              width: '100%',
              padding: '0.7rem 1rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              boxShadow: '0 4px 18px rgba(225, 29, 72, 0.35)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 24px rgba(225, 29, 72, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 18px rgba(225, 29, 72, 0.35)';
            }}
          >
            <Plus size={17} />
            <span>New Chat</span>
          </button>

          {/* Search */}
          <div style={{ marginTop: '0.65rem', position: 'relative' }}>
            <Search size={14} style={{
              position: 'absolute', left: '0.7rem', top: '50%',
              transform: 'translateY(-50%)', color: '#6b5a60'
            }} />
            <input 
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.1rem',
                borderRadius: '8px',
                background: 'rgba(225, 29, 72, 0.06)',
                border: '1px solid rgba(225, 29, 72, 0.1)',
                color: '#f5f0f1',
                fontSize: '0.8rem',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'rgba(225,29,72,0.35)'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(225,29,72,0.1)'}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.65rem 1rem 0.65rem', position: 'relative', zIndex: 1 }}>
          <div style={{
            fontSize: '0.68rem', fontWeight: 700, color: '#6b5a60',
            textTransform: 'uppercase', letterSpacing: '0.7px',
            padding: '0.4rem 0.5rem 0.3rem 0.5rem', whiteSpace: 'nowrap'
          }}>
            Recent · {filteredChats.length}
          </div>

          {filteredChats.length === 0 ? (
            <div style={{
              padding: '1.5rem 0.5rem', textAlign: 'center',
              color: '#6b5a60', fontSize: '0.82rem'
            }}>
              No chats found
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = editingId === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={isActive ? '' : ''}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    marginBottom: '0.2rem',
                    cursor: 'pointer',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(225,29,72,0.18) 0%, rgba(159,18,57,0.12) 100%)'
                      : 'transparent',
                    border: isActive
                      ? '1px solid rgba(225, 29, 72, 0.3)'
                      : '1px solid transparent',
                    color: isActive ? '#f5f0f1' : '#a1919a',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(225, 29, 72, 0.07)';
                      e.currentTarget.style.color = '#f5f0f1';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#a1919a';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', flex: 1, minWidth: 0 }}>
                    <MessageSquare
                      size={14}
                      color={isActive ? '#e11d48' : '#6b5a60'}
                      style={{ flexShrink: 0 }}
                    />
                    
                    {isEditing ? (
                      <input 
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditing(chat.id, e);
                          if (e.key === 'Escape') cancelEditing(e);
                        }}
                        autoFocus
                        style={{
                          width: '100%',
                          background: '#1a1014',
                          border: '1px solid #e11d48',
                          color: '#fff',
                          fontSize: '0.8rem',
                          borderRadius: '4px',
                          padding: '0.1rem 0.4rem',
                          outline: 'none',
                          fontFamily: 'Inter, sans-serif',
                        }}
                      />
                    ) : (
                      <span style={{
                        fontSize: '0.82rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: isActive ? 500 : 400,
                      }}>
                        {chat.title}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', marginLeft: '0.4rem' }}>
                    {isEditing ? (
                      <>
                        <button 
                          onClick={(e) => saveEditing(chat.id, e)}
                          style={{ background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <Check size={13} />
                        </button>
                        <button 
                          onClick={cancelEditing}
                          style={{ background: 'transparent', border: 'none', color: '#e11d48', cursor: 'pointer', padding: '0.2rem' }}
                        >
                          <X size={13} />
                        </button>
                      </>
                    ) : (
                      isActive && (
                        <>
                          <button 
                            onClick={(e) => startEditing(chat, e)}
                            style={{ background: 'transparent', border: 'none', color: '#a1919a', cursor: 'pointer', padding: '0.2rem', borderRadius: '4px', transition: 'color 0.15s' }}
                            title="Rename Chat"
                            onMouseOver={(e) => e.currentTarget.style.color = '#fb7185'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#a1919a'}
                          >
                            <Edit2 size={12} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteChat(chat.id);
                            }}
                            style={{ background: 'transparent', border: 'none', color: '#a1919a', cursor: 'pointer', padding: '0.2rem', borderRadius: '4px', transition: 'color 0.15s' }}
                            title="Delete Chat"
                            onMouseOver={(e) => e.currentTarget.style.color = '#e11d48'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#a1919a'}
                          >
                            <Trash2 size={12} />
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

        {/* Footer Settings */}
        <div style={{
          padding: '0.85rem',
          borderTop: '1px solid rgba(225, 29, 72, 0.1)',
          background: 'rgba(0, 0, 0, 0.3)',
          flexShrink: 0,
          position: 'relative',
          zIndex: 1,
        }}>
          <button
            onClick={onOpenSettings}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.75rem',
              borderRadius: '8px',
              background: 'rgba(225, 29, 72, 0.06)',
              border: '1px solid rgba(225, 29, 72, 0.12)',
              color: '#a1919a',
              fontSize: '0.83rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(225,29,72,0.12)';
              e.currentTarget.style.color = '#fb7185';
              e.currentTarget.style.borderColor = 'rgba(225,29,72,0.25)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(225,29,72,0.06)';
              e.currentTarget.style.color = '#a1919a';
              e.currentTarget.style.borderColor = 'rgba(225,29,72,0.12)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={15} color="#e11d48" />
              <span>Model & System Settings</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
