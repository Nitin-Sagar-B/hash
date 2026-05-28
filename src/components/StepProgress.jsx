import { useCountUp } from '../hooks/useCountUp.js';

export default function StepProgress({ steps = 0, goal = 10000, className = '' }) {
  const animatedSteps = useCountUp(steps);
  const percentage = Math.min((steps / goal) * 100, 100);
  const isGoalReached = steps >= goal;

  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🚶</span>
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">Steps</span>
        </div>
        {isGoalReached && (
          <span className="text-xs text-accent-success font-medium animate-fade-in">Goal reached! ✨</span>
        )}
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className={`text-2xl font-bold ${isGoalReached ? 'text-accent-success' : 'text-text-primary'}`}>
          {animatedSteps.toLocaleString()}
        </span>
        <span className="text-xs text-text-secondary">/ {goal.toLocaleString()}</span>
      </div>

      <div className="h-[4px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            background: isGoalReached
              ? 'linear-gradient(90deg, #10B981, #34D399)'
              : 'linear-gradient(90deg, #6366F1, #A78BFA)',
            boxShadow: isGoalReached ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
          }}
        />
      </div>
    </div>
  );
}
