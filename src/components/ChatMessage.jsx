export default function ChatMessage({ message, isStreaming = false }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 animate-fade-in`}>
      <div className={`max-w-[85%] relative`}>
        {/* Sender label */}
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 ml-1">
            <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
              style={{ background: 'linear-gradient(135deg, #6366F1, #A78BFA)' }}>
              #
            </div>
            <span className="text-[10px] text-text-tertiary font-medium">Hash</span>
          </div>
        )}

        {/* Message bubble */}
        <div className={`px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser ? 'chat-message-user' : 'chat-message-hash'
        }`}>
          {message.content}
          {isStreaming && (
            <span className="inline-block w-[2px] h-4 ml-0.5 bg-accent-primary animate-pulse align-text-bottom" />
          )}
        </div>

        {/* Timestamp */}
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mt-1 mx-1`}>
          <span className="text-[10px] text-text-tertiary">
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
    <div className="flex justify-start mb-3 animate-fade-in">
      <div className="max-w-[85%]">
        <div className="flex items-center gap-1.5 mb-1 ml-1">
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold"
            style={{ background: 'linear-gradient(135deg, #6366F1, #A78BFA)' }}>
            #
          </div>
          <span className="text-[10px] text-text-tertiary font-medium">Hash</span>
        </div>
        <div className="chat-message-hash px-4 py-3">
          <div className="flex gap-1.5 items-center h-5">
            <div className="typing-dot" />
            <div className="typing-dot" />
            <div className="typing-dot" />
          </div>
        </div>
      </div>
    </div>
  );
}
