import { useState } from 'react';
import { useAppStore } from '../store/useAppStore.js';
import ProgressRing from '../components/ProgressRing.jsx';
import MacroCard from '../components/MacroCard.jsx';
import StepProgress from '../components/StepProgress.jsx';
import WeightChart from '../components/WeightChart.jsx';

export default function Dashboard() {
  const todayLog = useAppStore(s => s.todayLog);
  const macroGoals = useAppStore(s => s.macroGoals);
  const userProfile = useAppStore(s => s.userProfile);
  const weightHistory = useAppStore(s => s.weightHistory);
  const streaks = useAppStore(s => s.streaks);
  const updateWeight = useAppStore(s => s.updateWeight);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [weightInput, setWeightInput] = useState('');

  const handleWeightSubmit = async () => {
    const w = parseFloat(weightInput);
    if (!isNaN(w) && w > 0 && w < 300) {
      await updateWeight(w);
      setWeightInput('');
      setShowWeightInput(false);
    }
  };

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
      <div className="max-w-lg mx-auto px-6 pt-8">

        {/* Header */}
        <div className="mb-8 animate-slide-up stagger-1">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">
            {greeting}, <span className="text-gradient">Nit</span>
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-medium">{today}</p>
        </div>

        {/* Macro Rings */}
        <div className="animate-slide-up stagger-2 mb-6">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-text-primary tracking-tight">Today's Macros</h2>
              <span className="text-xs font-medium text-text-tertiary px-3 py-1 bg-[rgba(255,255,255,0.04)] rounded-full">
                {userProfile.currentWeight} kg
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 justify-items-center">
              <ProgressRing
                progress={macroGoals.calories > 0 ? (todayLog.caloriesConsumed / macroGoals.calories) * 100 : 0}
                size={76}
                strokeWidth={7}
                color="var(--color-accent-calories)"
                label="Calories"
                value={todayLog.caloriesConsumed}
                goal={macroGoals.calories}
                unit="kcal"
                showGoal={false}
              />
              <ProgressRing
                progress={macroGoals.protein > 0 ? (todayLog.proteinG / macroGoals.protein) * 100 : 0}
                size={76}
                strokeWidth={7}
                color="var(--color-accent-protein)"
                label="Protein"
                value={todayLog.proteinG}
                goal={macroGoals.protein}
                unit="g"
              />
              <ProgressRing
                progress={macroGoals.fat > 0 ? (todayLog.fatG / macroGoals.fat) * 100 : 0}
                size={76}
                strokeWidth={7}
                color="var(--color-accent-fat)"
                label="Fat"
                value={todayLog.fatG}
                goal={macroGoals.fat}
                unit="g"
              />
              <ProgressRing
                progress={macroGoals.carbs > 0 ? (todayLog.carbsG / macroGoals.carbs) * 100 : 0}
                size={76}
                strokeWidth={7}
                color="var(--color-accent-carbs)"
                label="Carbs"
                value={todayLog.carbsG}
                goal={macroGoals.carbs}
                unit="g"
              />
            </div>
          </div>
        </div>

        {/* Calorie summary card */}
        <div className="animate-slide-up stagger-3 mb-5">
          <div className="glass-card p-5 relative overflow-hidden flex items-center justify-between">
            <div className="absolute top-0 left-0 w-1 h-full" style={{
              background: 'linear-gradient(180deg, var(--color-accent-calories), var(--color-accent-carbs))',
            }} />
            <div className="pl-3">
              <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-widest">Calories Remaining</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-3xl font-bold text-text-primary tracking-tight">
                  {Math.max(0, macroGoals.calories - todayLog.caloriesConsumed)}
                </span>
                <span className="text-sm font-medium text-text-secondary">kcal</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-text-tertiary font-semibold uppercase tracking-widest block">Target</span>
              <span className="text-sm text-text-secondary font-semibold mt-0.5">{macroGoals.calories} kcal</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="animate-slide-up stagger-3">
            <MacroCard
              label="Fiber"
              icon="🥬"
              value={todayLog.fiberG}
              goal={macroGoals.fiber}
              unit="g"
              color="var(--color-accent-fiber)"
            />
          </div>
          <div className="animate-slide-up stagger-4">
            <MacroCard
              label="Water"
              icon="💧"
              value={todayLog.waterMl}
              goal={macroGoals.water}
              unit="ml"
              color="var(--color-accent-water)"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="animate-slide-up stagger-4 mb-5">
          <StepProgress steps={todayLog.steps} goal={userProfile.stepsGoal} />
        </div>

        {/* Streaks & Workout */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="animate-slide-up stagger-5 h-full">
            <div className="glass-card p-5 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🏋️</span>
                <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-widest">This Week</span>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-text-primary tracking-tight">{streaks.trainingDaysThisWeek}</span>
                  <span className="text-xs font-medium text-text-secondary">/ 4 days</span>
                </div>
                {todayLog.workoutDone && (
                  <div className="mt-3 inline-flex items-center text-[10px] bg-accent-success/10 text-accent-success px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-success mr-1.5 animate-pulse-subtle"></div>
                    Done Today
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="animate-slide-up stagger-5 h-full">
            <div className="glass-card p-5 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🔥</span>
                <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-widest">Protein Streak</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-accent-success tracking-tight">{streaks.proteinGoalHitStreak}</span>
                <span className="text-xs font-medium text-text-secondary">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="animate-slide-up stagger-5 mb-5">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-lg">
                  😴
                </div>
                <span className="text-[11px] text-text-secondary font-semibold uppercase tracking-widest">Sleep</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold tracking-tight ${todayLog.sleepHrs >= 7 ? 'text-accent-success' : todayLog.sleepHrs > 0 ? 'text-accent-fat' : 'text-text-primary'}`}>
                  {todayLog.sleepHrs || '—'}
                </span>
                <span className="text-xs font-medium text-text-secondary">/ 7-9 hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Chart */}
        <div className="animate-slide-up stagger-6 mb-5">
          <WeightChart data={weightHistory} />
        </div>

        {/* Weight Input */}
        <div className="animate-slide-up stagger-6 mb-8">
          {showWeightInput ? (
            <div className="glass-card p-5 animate-fade-in-scale">
              <h3 className="text-sm font-semibold text-text-primary mb-4 tracking-tight">Log Today's Weight</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 78.5"
                  step="0.1"
                  min="30"
                  max="300"
                  autoFocus
                  className="flex-1 bg-bg-input border border-glass-border rounded-xl px-4 py-3 text-sm font-medium text-text-primary placeholder-text-tertiary outline-none focus:border-accent-primary/60 focus:bg-[rgba(255,255,255,0.02)] transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleWeightSubmit()}
                />
                <button
                  onClick={handleWeightSubmit}
                  className="px-5 py-3 bg-accent-primary text-white rounded-xl text-sm font-semibold hover:opacity-90 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-accent-primary/25"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowWeightInput(false); setWeightInput(''); }}
                  className="px-4 py-3 bg-[rgba(255,255,255,0.06)] text-text-secondary rounded-xl text-sm font-semibold hover:bg-[rgba(255,255,255,0.1)] hover:text-text-primary active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowWeightInput(true)}
              className="w-full glass-card p-5 flex items-center justify-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.08)] transition-all group"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="opacity-70 group-hover:opacity-100 transition-opacity">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Log today's weight
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
