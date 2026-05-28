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

  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSend = useCallback(async (text) => {
    if (isStreaming) return;

    // Add user message
    await addMessage({ role: 'user', content: text });

    // Build messages array for OpenAI
    const recentLogs = dayLogs.slice(0, 7);
    const systemPrompt = buildSystemPrompt(userProfile, todayLog, recentLogs);

    // Get last 20 messages for context
    const currentMessages = useAppStore.getState().messages;
    const contextMessages = currentMessages.slice(-20).map(m => ({
      role: m.role,
      content: m.content
    }));

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages
    ];

    // Add placeholder assistant message
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

  // Filter out system messages for display
  const displayMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="flex flex-col h-full bg-bg-primary">
      {/* Chat header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-glass-border bg-bg-surface/80 backdrop-blur-xl animate-slide-down sticky top-0 z-10">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold shadow-lg shadow-accent-primary/20"
          style={{
            background: 'linear-gradient(135deg, var(--color-accent-primary), #6366F1)'
          }}>
          #
        </div>
        <div>
          <h2 className="text-[15px] font-bold text-text-primary tracking-tight">Hash</h2>
          <p className="text-[11px] font-medium text-text-secondary tracking-wide">Your fitness bestie ✨</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 pt-6 pb-6 no-scrollbar">
        {displayMessages.length === 0 ? (
          <EmptyChat />
        ) : (
          <div className="max-w-lg mx-auto w-full">
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
            <div ref={messagesEndRef} className="h-4" />
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
    <div className="h-full flex flex-col items-center justify-center text-center px-8 animate-fade-in max-w-sm mx-auto">
      <div className="w-20 h-20 rounded-[28px] flex items-center justify-center mb-6 shadow-2xl shadow-accent-primary/20"
        style={{
          background: 'linear-gradient(135deg, var(--color-accent-primary), #6366F1)'
        }}>
        <span className="text-4xl font-extrabold text-white">#</span>
      </div>
      <h3 className="text-2xl font-bold text-text-primary mb-3 tracking-tight">Hey Nit! 👋</h3>
      <p className="text-[15px] text-text-secondary leading-[1.6] font-medium mb-8">
        I'm Hash, your personal fitness bestie. Tell me what you ate, log a workout, or just chat!
      </p>
      <div className="flex flex-col gap-3 w-full">
        {['What should I eat?', 'I just did a 30m workout', 'How am I doing today?'].map((suggestion, i) => (
          <button
            key={suggestion}
            className="w-full px-5 py-3.5 glass-card text-[14px] font-semibold text-text-primary hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-all animate-slide-up"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            "{suggestion}"
          </button>
        ))}
      </div>
    </div>
  );
}
