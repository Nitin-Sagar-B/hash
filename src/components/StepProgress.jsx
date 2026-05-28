import { useCountUp } from '../hooks/useCountUp.js';

export default function StepProgress({ steps = 0, goal = 10000, className = '' }) {
  const animatedSteps = useCountUp(steps);
  const percentage = Math.min((steps / goal) * 100, 100);
  const isGoalReached = steps >= goal;

  return (
    <div className={`glass-card p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-lg">
            🚶
          </div>
          <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">Steps</span>
        </div>
        {isGoalReached && (
          <span className="text-[10px] bg-accent-success/15 text-accent-success px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-fade-in">
            Goal reached ✨
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-4 pl-1">
        <span className={`text-3xl font-bold tracking-tight ${isGoalReached ? 'text-accent-success' : 'text-text-primary'}`} style={{ textShadow: isGoalReached ? '0 0 16px rgba(16,185,129,0.3)' : 'none' }}>
          {animatedSteps.toLocaleString()}
        </span>
        <span className="text-xs font-medium text-text-secondary">/ {goal.toLocaleString()}</span>
      </div>

      <div className="h-1.5 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            background: isGoalReached
              ? 'linear-gradient(90deg, var(--color-accent-success), #34D399)'
              : 'linear-gradient(90deg, var(--color-accent-primary), #818CF8)',
            boxShadow: isGoalReached ? '0 0 12px rgba(16, 185, 129, 0.4)' : '0 0 12px rgba(67, 56, 202, 0.4)'
          }}
        />
      </div>
    </div>
  );
}
