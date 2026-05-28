export default function ChatMessage({ message, isStreaming = false }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-5 animate-slide-up`}>
      <div className={`max-w-[88%] relative group flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Sender label */}
        {!isUser && (
          <div className="flex items-center gap-2 mb-1.5 ml-1">
            <div className="w-6 h-6 rounded-[8px] flex items-center justify-center text-[11px] font-extrabold shadow-sm shadow-accent-primary/20"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), #6366F1)' }}>
              #
            </div>
            <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Hash</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={`px-5 py-3.5 text-[15px] leading-[1.6] whitespace-pre-wrap transition-all duration-200 ${
          isUser ? 'chat-message-user' : 'chat-message-hash group-hover:bg-[rgba(255,255,255,0.03)]'
        }`}>
          {message.content}
          {isStreaming && (
            <span className="inline-block w-[3px] h-4 ml-1 bg-text-primary animate-pulse-subtle align-middle rounded-full" />
          )}
        </div>

        {/* Timestamp */}
        <div className="mt-1.5 mx-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="text-[10px] font-medium text-text-tertiary">
            {message.timestamp
              ? new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
              : ''
            }
          </span>
        </div>
      </div>
    </div>
  );
}

// Typing indicator component
export function TypingIndicator() {
  return (
    <div className="flex justify-start mb-5 animate-slide-up">
      <div className="max-w-[88%]">
        <div className="flex items-center gap-2 mb-1.5 ml-1">
          <div className="w-6 h-6 rounded-[8px] flex items-center justify-center text-[11px] font-extrabold shadow-sm shadow-accent-primary/20"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-primary), #6366F1)' }}>
            #
          </div>
          <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-wider">Hash</span>
        </div>
        <div className="chat-message-hash px-5 py-4 w-[68px]">
          <div className="flex gap-1.5 items-center justify-center h-full">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
