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
        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[rgba(255,255,255,0.02)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[15px] font-bold text-text-primary tracking-tight">
              {isToday ? 'Today' : dateStr}
            </span>
            {isToday && (
              <span className="text-[11px] font-medium text-text-tertiary">{dateStr}</span>
            )}
          </div>
          {log.workoutDone && (
            <span className="text-[10px] bg-accent-success/15 text-accent-success px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ml-1">
              💪 Workout
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Quick macro summary */}
          <div className="flex gap-4 text-xs font-bold">
            <span style={{ color: 'var(--color-accent-calories)' }}>{log.caloriesConsumed || 0} <span className="text-[10px] font-medium text-text-tertiary">kcal</span></span>
            <span style={{ color: 'var(--color-accent-protein)' }}>{log.proteinG || 0}g <span className="text-[10px] font-medium text-text-tertiary">P</span></span>
          </div>

          {/* Expand chevron */}
          <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${expanded ? 'rotate-180 bg-[rgba(255,255,255,0.05)]' : 'bg-[rgba(255,255,255,0.02)]'}`}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className="text-text-secondary"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </button>

      {/* Expanded details */}
      <div className={`grid transition-all duration-300 ease-in-out ${expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-2 border-t border-glass-border">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-2">
              <MiniStat label="Calories" value={log.caloriesConsumed || 0} unit="kcal" color="var(--color-accent-calories)" />
              <MiniStat label="Protein" value={log.proteinG || 0} unit="g" color="var(--color-accent-protein)" />
              <MiniStat label="Fat" value={log.fatG || 0} unit="g" color="var(--color-accent-fat)" />
              <MiniStat label="Carbs" value={log.carbsG || 0} unit="g" color="var(--color-accent-carbs)" />
              <MiniStat label="Fiber" value={log.fiberG || 0} unit="g" color="var(--color-accent-fiber)" />
              <MiniStat label="Water" value={log.waterMl || 0} unit="ml" color="var(--color-accent-water)" />
              <MiniStat label="Steps" value={log.steps || 0} unit="" color="var(--color-text-primary)" />
              <MiniStat label="Sleep" value={log.sleepHrs || 0} unit="hrs" color="var(--color-accent-primary)" />
            </div>

            {/* Workout details */}
            {log.workoutDone && log.workoutDetails?.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-widest mb-2">Workout</p>
                <div className="space-y-1.5">
                  {log.workoutDetails.map((exercise, i) => (
                    <p key={i} className="text-[13px] text-text-primary font-medium">
                      <span className="text-accent-success mr-2">•</span>{exercise}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Food log */}
            {log.foodLog?.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-widest mb-2">Food Log</p>
                <div className="space-y-1.5">
                  {log.foodLog.map((food, i) => (
                    <p key={i} className="text-[13px] text-text-primary font-medium">
                      <span className="text-accent-calories mr-2">•</span>{food}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {log.notes && (
              <div className="mt-5 pt-4 border-t border-[rgba(255,255,255,0.04)]">
                <p className="text-[11px] text-text-secondary font-semibold uppercase tracking-widest mb-2">Notes</p>
                <p className="text-[13px] text-text-primary font-medium leading-relaxed bg-[rgba(255,255,255,0.02)] p-3 rounded-xl border border-glass-border">{log.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, unit, color }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] text-text-secondary font-semibold uppercase tracking-widest">{label}</span>
      <span className="text-[15px] font-bold tracking-tight mt-0.5" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="text-[11px] font-medium text-text-tertiary ml-1 tracking-normal">{unit}</span>}
      </span>
    </div>
  );
}
