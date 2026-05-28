import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore.js';
import LogEntry from '../components/LogEntry.jsx';

export default function LogHistory() {
  const dayLogs = useAppStore(s => s.dayLogs);
  const loadDayLogs = useAppStore(s => s.loadDayLogs);

  useEffect(() => {
    loadDayLogs();
  }, [loadDayLogs]);

  return (
    <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
      <div className="w-[calc(100%-40px)] max-w-[500px] mx-auto pt-6 sm:pt-8">
        
        {/* Header */}
        <div className="mb-6 animate-slide-up stagger-1">
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight">Log History</h1>
          <p className="text-[13px] font-semibold text-text-secondary mt-1 tracking-wide">
            {dayLogs.length > 0
              ? `${dayLogs.length} day${dayLogs.length > 1 ? 's' : ''} logged`
              : 'No logs yet'}
          </p>
        </div>

        {/* Logs list */}
        {dayLogs.length > 0 ? (
          <div className="flex flex-col gap-5">
            {dayLogs.map((log, idx) => (
              <div key={log.date} className="animate-slide-up" style={{ animationDelay: `${Math.min(idx * 0.05, 0.3)}s` }}>
                <LogEntry log={log} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyLogs />
        )}
      </div>
    </div>
  );
}

function EmptyLogs() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-16 animate-fade-in section-block">
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated flex items-center justify-center mb-4">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-tertiary">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </div>
      <h3 className="text-[15px] font-bold text-text-primary mb-1 tracking-tight">No logs yet</h3>
      <p className="text-[13px] font-medium text-text-secondary max-w-[240px] leading-relaxed">
        Start chatting with Hash to log your meals, workouts, and daily stats.
      </p>
    </div>
  );
}
