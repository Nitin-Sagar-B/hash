import { useCountUp } from '../hooks/useCountUp.js';

export default function ProgressRing({
  progress = 0,
  size = 120,
  strokeWidth = 8,
  color = '#6366F1',
  bgColor = 'rgba(255,255,255,0.06)',
  label = '',
  value = 0,
  goal = 0,
  unit = '',
  showGoal = true,
  className = ''
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const offset = circumference - (clampedProgress / 100) * circumference;
  const animatedValue = useCountUp(value);
  const isGoalReached = progress >= 100;

  return (
    <div className={`relative flex flex-col items-center ${className}`} style={{ width: size, height: size + 40 }}>
      <div className={`relative ${isGoalReached ? 'animate-goal-pulse' : ''}`} style={{ width: size, height: size, color }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={bgColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="progress-ring-circle"
            style={{
              filter: isGoalReached ? `drop-shadow(0 0 6px ${color})` : 'none'
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-text-primary leading-none">
            {animatedValue}
          </span>
          {showGoal && (
            <span className="text-[10px] text-text-secondary mt-0.5">
              / {goal}{unit}
            </span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-xs text-text-secondary mt-2 font-medium tracking-wide">{label}</span>
      )}
    </div>
  );
}
