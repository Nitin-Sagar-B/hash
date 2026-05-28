export default function ChatMessage({ message, isStreaming = false }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-2`}>
      {!isUser && (
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1 ml-1">Hash</span>
      )}
      
      <div className={`max-w-[85%] relative group ${isUser ? 'chat-message-user' : 'chat-message-hash'}`}>
        <div className="px-5 py-3.5 text-[15px] leading-[1.5] whitespace-pre-wrap font-medium">
          {message.content}
          {isStreaming && (
            <span className="inline-block w-[3px] h-4 ml-1 bg-text-primary animate-pulse-subtle align-middle rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex flex-col items-start mb-2">
      <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1 ml-1">Hash</span>
      <div className="max-w-[85%] chat-message-hash px-5 py-4 w-[72px]">
        <div className="flex gap-1.5 items-center justify-center h-full">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
