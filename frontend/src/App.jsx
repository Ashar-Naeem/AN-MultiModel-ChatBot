import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import StarterCards from './components/StarterCards';
import SettingsModal from './components/SettingsModal';

const DEFAULT_MODELS = [
  { id: "openai/gpt-oss-120b", name: "GPT-OSS 120B", description: "High-capacity flagship model for reasoning & coding" },
  { id: "openai/gpt-oss-20b", name: "GPT-OSS 20B", description: "Fast lightweight model for instant responses" },
  { id: "qwen/qwen3.6-27b", name: "Qwen 3.6 27B", description: "Advanced coding and structured output model" },
  { id: "qwen/qwen3.8-27b", name: "Qwen 3.8 27B", description: "Latest instruction-tuned model" },
  { id: "groq/compound", name: "Groq Compound", description: "High-performance Groq compound model" },
  { id: "groq/compound-mini", name: "Groq Compound Mini", description: "Ultra-fast compact Groq model" }
];

export default function App() {
  // State Initialization with LocalStorage Persistence
  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem('groq_studio_chats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    const initialId = 'chat_' + Date.now();
    return [{ id: initialId, title: 'New Conversation', messages: [] }];
  });

  const [activeChatId, setActiveChatId] = useState(() => {
    const saved = localStorage.getItem('groq_studio_active_id');
    return saved && chats.some(c => c.id === saved) ? saved : chats[0]?.id || 'chat_' + Date.now();
  });

  const [models, setModels] = useState(DEFAULT_MODELS);
  const [selectedModel, setSelectedModel] = useState(() => {
    const saved = localStorage.getItem('groq_studio_model');
    return saved && DEFAULT_MODELS.some(m => m.id === saved) ? saved : 'openai/gpt-oss-120b';
  });


  const [systemPrompt, setSystemPrompt] = useState(() => {
    return localStorage.getItem('groq_studio_system_prompt') || '';
  });

  const [temperature, setTemperature] = useState(() => {
    return parseFloat(localStorage.getItem('groq_studio_temp')) || 0.7;
  });

  const [maxTokens, setMaxTokens] = useState(() => {
    return parseInt(localStorage.getItem('groq_studio_max_tokens'), 10) || 2048;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const abortControllerRef = useRef(null);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('groq_studio_chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    localStorage.setItem('groq_studio_active_id', activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    localStorage.setItem('groq_studio_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('groq_studio_system_prompt', systemPrompt);
  }, [systemPrompt]);

  useEffect(() => {
    localStorage.setItem('groq_studio_temp', temperature.toString());
  }, [temperature]);

  useEffect(() => {
    localStorage.setItem('groq_studio_max_tokens', maxTokens.toString());
  }, [maxTokens]);

  // Fetch Available Models on Mount
  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch('/api/models');
        if (res.ok) {
          const data = await res.json();
          if (data.models && data.models.length > 0) {
            setModels(data.models);
          }
        }
      } catch (err) {
        console.warn('Could not fetch dynamic models, using defaults.', err);
      }
    }
    fetchModels();
  }, []);

  // Get active chat session
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const activeMessages = activeChat ? activeChat.messages : [];

  // Create New Chat
  const handleNewChat = () => {
    const newId = 'chat_' + Date.now();
    const newChat = { id: newId, title: 'New Conversation', messages: [] };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
  };

  // Delete Chat
  const handleDeleteChat = (id) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const newId = 'chat_' + Date.now();
        const fallback = { id: newId, title: 'New Conversation', messages: [] };
        setActiveChatId(newId);
        return [fallback];
      }
      if (id === activeChatId) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Rename Chat
  const handleRenameChat = (id, newTitle) => {
    setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  // Clear current active chat messages
  const handleClearCurrentChat = () => {
    setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: [] } : c));
  };

  // Export current chat conversation as JSON
  const handleExportChat = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activeMessages, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${activeChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Clear all chats
  const handleClearAllChats = () => {
    const newId = 'chat_' + Date.now();
    setChats([{ id: newId, title: 'New Conversation', messages: [] }]);
    setActiveChatId(newId);
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    
    // Save whatever streaming text was generated so far
    if (streamingMessage.trim()) {
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...c.messages, { role: 'assistant', content: streamingMessage }]
          };
        }
        return c;
      }));
    }
    setStreamingMessage('');
  };

  // Send Message Logic (Supports SSE Streaming)
  const handleSendMessage = async (userText) => {
    if (!userText.trim() || isGenerating) return;

    const userMessage = { role: 'user', content: userText };
    const updatedMessages = [...activeMessages, userMessage];

    // Auto update chat title if it's the first message
    const isFirstMessage = activeMessages.length === 0;
    const generatedTitle = isFirstMessage 
      ? (userText.length > 28 ? userText.slice(0, 28) + '...' : userText)
      : activeChat.title;

    setChats(prev => prev.map(c => {
      if (c.id === activeChatId) {
        return {
          ...c,
          title: generatedTitle,
          messages: updatedMessages
        };
      }
      return c;
    }));

    setIsGenerating(true);
    setStreamingMessage('');

    // Setup AbortController for stream cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
          temperature: temperature,
          systemPrompt: systemPrompt,
          maxTokens: maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '').trim();
            if (dataStr === '[DONE]') {
              break;
            }
            let parsed;
            try {
              parsed = JSON.parse(dataStr);
            } catch (e) {
              continue;
            }
            if (parsed.error) {
              throw new Error(parsed.error);
            }
            if (parsed.content) {
              accumulatedText += parsed.content;
              setStreamingMessage(accumulatedText);
            }
          }
        }
      }


      // Stream completed successfully: Commit assistant message
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [...updatedMessages, { role: 'assistant', content: accumulatedText || 'No response content generated.' }]
          };
        }
        return c;
      }));

    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Stream generation aborted by user.');
        return;
      }

      console.error('Chat error:', err);
      // Append error message to chat window
      setChats(prev => prev.map(c => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: [
              ...updatedMessages,
              { role: 'assistant', content: `**Error:** ${err.message || 'Failed to process request.'}`, isError: true }
            ]
          };
        }
        return c;
      }));
    } finally {
      setIsGenerating(false);
      setStreamingMessage('');
      abortControllerRef.current = null;
    }
  };

  // Regenerate Response
  const handleRegenerate = () => {
    if (activeMessages.length === 0 || isGenerating) return;
    
    // Find last user message
    const lastUserIdx = activeMessages.reduce((acc, m, i) => m.role === 'user' ? i : acc, -1);
    if (lastUserIdx !== -1) {
      const trimmedMessages = activeMessages.slice(0, lastUserIdx + 1);
      const lastUserMsg = trimmedMessages[trimmedMessages.length - 1];

      // Reset messages up to last user message
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages: trimmedMessages.slice(0, -1) } : c));
      
      // Re-send last user message
      handleSendMessage(lastUserMsg.content);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden', background: '#0c0a0b', position: 'relative' }}>
      
      {/* Background Ambient Glows */}
      <div className="ambient-glow" style={{ top: '-120px', left: '15%', opacity: 0.8 }} />
      <div className="ambient-glow" style={{ bottom: '-80px', right: '5%', background: 'radial-gradient(circle, rgba(159,18,57,0.15) 0%, rgba(0,0,0,0) 70%)' }} />
      <div className="ambient-glow" style={{ top: '40%', left: '50%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(225,29,72,0.04) 0%, rgba(0,0,0,0) 70%)', transform: 'translate(-50%, -50%)' }} />

      {/* Sidebar Navigation */}
      <Sidebar 
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onOpenSettings={() => setSettingsOpen(true)}
        isOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Chat Workspace */}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative', overflow: 'hidden', zIndex: 2 }}>
        
        {/* Top Header */}
        <Header 
          models={models}
          selectedModel={selectedModel}
          onSelectModel={setSelectedModel}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenSettings={() => setSettingsOpen(true)}
          onClearChat={handleClearCurrentChat}
          onExportChat={handleExportChat}
          systemPrompt={systemPrompt}
        />

        {/* Chat Thread or Starter Prompts View */}
        {activeMessages.length === 0 && !isGenerating ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
            <StarterCards 
              modelName={models.find(m => m.id === selectedModel)?.name}
            />
          </div>
        ) : (
          <ChatWindow 
            messages={activeMessages}
            isGenerating={isGenerating}
            onRegenerate={handleRegenerate}
            streamingMessage={streamingMessage}
          />
        )}

        {/* Message Input Controls */}
        <MessageInput 
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          onStopGeneration={handleStopGeneration}
        />
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        temperature={temperature}
        setTemperature={setTemperature}
        maxTokens={maxTokens}
        setMaxTokens={setMaxTokens}
        onClearAllChats={handleClearAllChats}
      />
    </div>
  );
}
