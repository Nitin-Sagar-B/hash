import { useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore.js';
import { streamChat, buildSystemPrompt, cleanResponse } from '../lib/openai.js';
import ChatMessage, { TypingIndicator } from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';

export default function Chat() {
  const messages = useAppStore(s => s.messages);
  const isStreaming = useAppStore(s => s.isStreaming);
  const addMessage = useAppStore(s => s.addMessage);
  const updateLastMessage = useAppStore(s => s.updateLastMessage);
  const setStreaming = useAppStore(s => s.setStreaming);
  const applyDashboardUpdate = useAppStore(s => s.applyDashboardUpdate);
  const userProfile = useAppStore(s => s.userProfile);
  const todayLog = useAppStore(s => s.todayLog);
  const dayLogs = useAppStore(s => s.dayLogs);

  const clearChat = useAppStore(s => s.clearChat);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = useCallback(async (text) => {
    if (isStreaming) return;

    await addMessage({ role: 'user', content: text });

    const recentLogs = dayLogs.slice(0, 7);
    const systemPrompt = buildSystemPrompt(userProfile, todayLog, recentLogs);

    const currentMessages = useAppStore.getState().messages;
    const contextMessages = currentMessages.slice(-20).map(m => ({
      role: m.role,
      content: m.content
    }));

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages
    ];

    await addMessage({ role: 'assistant', content: '' });
    setStreaming(true);

    let fullResponse = '';

    try {
      await streamChat(apiMessages, {
        onToken: (token) => {
          fullResponse += token;
          updateLastMessage(cleanResponse(fullResponse));
        },
        onDone: (response) => {
          const cleaned = cleanResponse(response);
          updateLastMessage(cleaned);
          setStreaming(false);
        },
        onDashboardUpdate: (data) => {
          applyDashboardUpdate(data);
        },
        onError: (error) => {
          console.error('Chat error:', error);
          updateLastMessage('Oops, something went wrong 😅 Try again?');
          setStreaming(false);
        }
      });
    } catch (error) {
      console.error('Chat send error:', error);
      updateLastMessage('Oops, something went wrong 😅 Try again?');
      setStreaming(false);
    }
  }, [isStreaming, addMessage, updateLastMessage, setStreaming, applyDashboardUpdate, userProfile, todayLog, dayLogs]);

  const displayMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Solid Chat Header */}
      <div className="solid-header flex items-center justify-between px-4 py-4 relative z-10">
        <div className="w-[60px]" /> {/* Spacer for centering */}
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-extrabold shadow-lg shadow-accent-primary/20 bg-accent-primary text-white">
            #
          </div>
          <div className="flex flex-col">
            <h2 className="text-[14px] font-bold text-text-primary tracking-tight leading-tight">Hash</h2>
            <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Active</p>
          </div>
        </div>
        
        <div className="w-[60px] flex justify-end">
          {displayMessages.length > 0 && (
            <button 
              onClick={clearChat}
              className="text-[11px] font-bold text-text-secondary hover:text-accent-primary transition-colors uppercase tracking-wider bg-[rgba(255,255,255,0.05)] px-3 py-1.5 rounded-lg"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto py-6 no-scrollbar centered-layout">
        {displayMessages.length === 0 ? (
          <EmptyChat />
        ) : (
          <div className="centered-container flex flex-col gap-y-2">
            {displayMessages.map((msg, idx) => (
              <ChatMessage
                key={msg.timestamp || idx}
                message={msg}
                isStreaming={isStreaming && idx === displayMessages.length - 1 && msg.role === 'assistant'}
              />
            ))}
            {isStreaming && displayMessages[displayMessages.length - 1]?.role === 'user' && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-4 max-w-sm mx-auto animate-fade-in">
      <div className="w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 bg-accent-primary shadow-[0_8px_32px_rgba(79,70,229,0.3)]">
        <span className="text-[40px] font-extrabold text-white">#</span>
      </div>
      <h3 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">Hey Nit! 👋</h3>
      <p className="text-[14px] text-text-secondary leading-[1.6] font-medium mb-10 px-2">
        I'm Hash. Log a meal, tell me about your workout, or just say hi.
      </p>
      <div className="flex flex-col gap-3 w-full">
        {['What should I eat for dinner?', 'I just did a 30m run', 'How are my macros?'].map((suggestion, i) => (
          <button
            key={suggestion}
            className="w-full px-5 py-4 bg-bg-surface border border-[rgba(255,255,255,0.04)] rounded-xl text-[14px] font-bold text-text-primary hover:bg-bg-elevated transition-colors shadow-sm"
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
}
