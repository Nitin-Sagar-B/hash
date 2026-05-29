import { useRef, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore.js';
import { streamChat, buildSystemPrompt, cleanResponse } from '../lib/openai.js';
import ChatMessage, { TypingIndicator } from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';
import { getTodayDate } from '../lib/db.js';

export default function Chat() {
  const messages = useAppStore(s => s.messages);
  const isStreaming = useAppStore(s => s.isStreaming);
  const addMessage = useAppStore(s => s.addMessage);
  const updateLastMessage = useAppStore(s => s.updateLastMessage);
  const setStreaming = useAppStore(s => s.setStreaming);
  const applyDashboardUpdate = useAppStore(s => s.applyDashboardUpdate);
  const userProfile = useAppStore(s => s.userProfile);
  const selectedLog = useAppStore(s => s.selectedLog);
  const selectedDate = useAppStore(s => s.selectedDate);
  const setSelectedDate = useAppStore(s => s.setSelectedDate);
  const dayLogs = useAppStore(s => s.dayLogs);
  const clearChat = useAppStore(s => s.clearChat);

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const todayStr = getTodayDate();
  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    if (isToday) return;
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const dateLabel = useMemo(() => {
    if (isToday) return 'Today';
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }, [selectedDate, isToday]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = useCallback(async (text) => {
    if (isStreaming) return;

    await addMessage({ role: 'user', content: text });

    const recentLogs = dayLogs.slice(0, 7);
    const systemPrompt = buildSystemPrompt(userProfile, selectedLog, recentLogs, selectedDate);

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
            👧
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

      {/* Chat Date Ribbon */}
      <div className="px-4 pt-4 pb-2 z-10 bg-bg-primary">
        <div className="flex items-center justify-between bg-bg-surface rounded-xl p-2 shadow-lg border border-[rgba(255,255,255,0.05)]">
          <button onClick={handlePrevDay} className="w-10 h-10 rounded-lg flex items-center justify-center text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          
          <div className="flex flex-col items-center justify-center">
            <span className="text-[13px] font-bold text-text-primary">{dateLabel}</span>
            {!isToday && <span className="text-[9px] text-accent-primary font-bold tracking-wider uppercase mt-0.5">Past Log</span>}
          </div>

          <button 
            onClick={handleNextDay} 
            disabled={isToday}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
              isToday 
                ? 'opacity-30 cursor-not-allowed text-text-tertiary' 
                : 'text-text-secondary hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pb-6 no-scrollbar centered-layout">
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
        <span className="text-[40px] font-extrabold text-white">👧</span>
      </div>
      <h3 className="text-2xl font-bold text-text-primary mb-2 tracking-tight">Hey Sparky! 👋</h3>
      <p className="text-[14px] text-text-secondary leading-[1.6] font-medium mb-10 px-2">
        I'm Hash, your AI coach. Log a meal, tell me about your workout, or just say hi.
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
