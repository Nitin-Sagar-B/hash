import { useState } from 'react';

export default function LogEntry({ log, className = '' }) {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(log.date + 'T00:00:00');
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const isToday = log.date === new Date().toISOString().split('T')[0];

  return (
    <div className={`glass-card overflow-hidden transition-all duration-300 ${className}`}>
      {/* Main row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-text-primary">
              {isToday ? 'Today' : dateStr}
            </span>
            {isToday && (
              <span className="text-[10px] text-text-tertiary">{dateStr}</span>
            )}
          </div>
          {log.workoutDone && (
            <span className="text-xs bg-accent-success/15 text-accent-success px-2 py-0.5 rounded-full font-medium">
              💪 Workout
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Quick macro summary */}
          <div className="flex gap-3 text-xs">
            <span style={{ color: '#FF6B6B' }}>{log.caloriesConsumed || 0} kcal</span>
            <span style={{ color: '#4ECDC4' }}>{log.proteinG || 0}g P</span>
          </div>

          {/* Expand chevron */}
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-text-tertiary transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-glass-border animate-slide-down">
          <div className="grid grid-cols-2 gap-3 mt-3">
            <MiniStat label="Calories" value={log.caloriesConsumed || 0} unit="kcal" color="#FF6B6B" />
            <MiniStat label="Protein" value={log.proteinG || 0} unit="g" color="#4ECDC4" />
            <MiniStat label="Fat" value={log.fatG || 0} unit="g" color="#FFD93D" />
            <MiniStat label="Carbs" value={log.carbsG || 0} unit="g" color="#A78BFA" />
            <MiniStat label="Fiber" value={log.fiberG || 0} unit="g" color="#F472B6" />
            <MiniStat label="Water" value={log.waterMl || 0} unit="ml" color="#38BDF8" />
            <MiniStat label="Steps" value={log.steps || 0} unit="" color="#6366F1" />
            <MiniStat label="Sleep" value={log.sleepHrs || 0} unit="hrs" color="#818CF8" />
          </div>

          {/* Workout details */}
          {log.workoutDone && log.workoutDetails?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-glass-border">
              <p className="text-xs text-text-secondary font-medium mb-2">Workout</p>
              <div className="space-y-1">
                {log.workoutDetails.map((exercise, i) => (
                  <p key={i} className="text-xs text-text-primary">
                    {exercise}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Food log */}
          {log.foodLog?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-glass-border">
              <p className="text-xs text-text-secondary font-medium mb-2">Food Log</p>
              <div className="space-y-1">
                {log.foodLog.map((food, i) => (
                  <p key={i} className="text-xs text-text-primary">{food}</p>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {log.notes && (
            <div className="mt-3 pt-3 border-t border-glass-border">
              <p className="text-xs text-text-secondary font-medium mb-1">Notes</p>
              <p className="text-xs text-text-primary">{log.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, unit, color }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-text-tertiary uppercase tracking-wider">{label}</span>
      <span className="text-sm font-semibold" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-[10px] text-text-secondary ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}
