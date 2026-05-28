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
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-glass-border animate-slide-down">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{
            background: 'linear-gradient(135deg, #6366F1, #A78BFA)',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
          }}>
          #
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-primary">Hash</h2>
          <p className="text-[10px] text-text-tertiary">Your fitness bestie ✨</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 pt-4 pb-4 no-scrollbar">
        {displayMessages.length === 0 ? (
          <EmptyChat />
        ) : (
          <>
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
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </div>
  );
}

function EmptyChat() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12 animate-fade-in">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{
          background: 'linear-gradient(135deg, #6366F1, #A78BFA)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.2)'
        }}>
        <span className="text-2xl font-bold text-white">#</span>
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">Hey Nit! 👋</h3>
      <p className="text-sm text-text-secondary leading-relaxed max-w-[280px]">
        I'm Hash, your personal fitness bestie. Tell me what you ate, log a workout, or just chat — I'm here for you~
      </p>
      <div className="flex flex-wrap gap-2 mt-6 justify-center">
        {['What should I eat?', 'I just worked out', 'How am I doing?'].map(suggestion => (
          <button
            key={suggestion}
            className="px-3 py-1.5 glass-card text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
