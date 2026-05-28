import { useCountUp } from '../hooks/useCountUp.js';

export default function MacroCard({ label, value = 0, goal = 0, unit = '', color = '#6366F1', icon, className = '' }) {
  const animatedValue = useCountUp(value);
  const percentage = goal > 0 ? Math.min((value / goal) * 100, 100) : 0;

  return (
    <div className={`glass-card p-5 relative overflow-hidden flex flex-col justify-between h-full ${className}`}>
      {/* Colored accent line at left side instead of top for sleeker look */}
      <div className="absolute top-0 left-0 bottom-0 w-1" style={{ background: color, opacity: 0.8 }} />
      
      <div className="flex items-center gap-2 mb-3 pl-1">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-widest">{label}</span>
      </div>

      <div className="pl-1">
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-2xl font-bold text-text-primary tracking-tight" style={{ color: percentage >= 100 ? color : undefined, textShadow: percentage >= 100 ? `0 0 16px ${color}66` : 'none' }}>
            {animatedValue}
          </span>
          <span className="text-xs font-medium text-text-secondary">/ {goal} {unit}</span>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
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
    </div>
  );
}
