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
    <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <div className="mb-6 animate-slide-up stagger-1">
          <h1 className="text-2xl font-bold text-text-primary">Log History</h1>
          <p className="text-sm text-text-secondary mt-1">
            {dayLogs.length > 0
              ? `${dayLogs.length} day${dayLogs.length > 1 ? 's' : ''} logged`
              : 'No logs yet'}
          </p>
        </div>

        {/* Logs list */}
        {dayLogs.length > 0 ? (
          <div className="space-y-3">
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
    <div className="flex flex-col items-center justify-center text-center px-8 py-20 animate-fade-in">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-text-tertiary mb-4">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <h3 className="text-base font-semibold text-text-secondary mb-2">No logs yet</h3>
      <p className="text-sm text-text-tertiary max-w-[240px]">
        Start chatting with Hash to log your meals, workouts, and daily stats. It'll all show up here~
      </p>
    </div>
  );
}
