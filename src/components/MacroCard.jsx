import { useCountUp } from '../hooks/useCountUp.js';

export default function MacroCard({ label, value = 0, goal = 0, unit = '', color = '#6366F1', icon, className = '' }) {
  const animatedValue = useCountUp(value);
  const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;

  return (
    <div className={`glass-card p-4 relative overflow-hidden ${className}`}>
      {/* Colored accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: color, opacity: 0.6 }} />
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-base">{icon}</span>}
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</span>
        </div>
      </div>

      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-2xl font-bold text-text-primary" style={{ color: percentage >= 100 ? color : undefined }}>
          {animatedValue}
        </span>
        <span className="text-xs text-text-secondary">/ {goal} {unit}</span>
      </div>

      {/* Progress bar */}
      <div className="h-[3px] bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${percentage}%`,
            background: color,
            boxShadow: percentage >= 100 ? `0 0 8px ${color}` : 'none'
          }}
        />
      </div>
    </div>
  );
}
