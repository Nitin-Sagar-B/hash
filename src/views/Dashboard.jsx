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
    <div className="flex-1 overflow-y-auto pb-24 no-scrollbar">
      <div className="max-w-lg mx-auto px-4 pt-6">

        {/* Header */}
        <div className="mb-6 animate-slide-up stagger-1">
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting}, <span className="text-gradient">Nit</span> 👋
          </h1>
          <p className="text-sm text-text-secondary mt-1">{today}</p>
        </div>

        {/* Macro Rings */}
        <div className="animate-slide-up stagger-2 mb-6">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-text-primary">Today's Macros</h2>
              <span className="text-xs text-text-tertiary">{userProfile.currentWeight} kg</span>
            </div>
            <div className="grid grid-cols-4 gap-2 justify-items-center">
              <ProgressRing
                progress={macroGoals.calories > 0 ? (todayLog.caloriesConsumed / macroGoals.calories) * 100 : 0}
                size={80}
                strokeWidth={6}
                color="#FF6B6B"
                label="Calories"
                value={todayLog.caloriesConsumed}
                goal={macroGoals.calories}
                unit="kcal"
                showGoal={false}
              />
              <ProgressRing
                progress={macroGoals.protein > 0 ? (todayLog.proteinG / macroGoals.protein) * 100 : 0}
                size={80}
                strokeWidth={6}
                color="#4ECDC4"
                label="Protein"
                value={todayLog.proteinG}
                goal={macroGoals.protein}
                unit="g"
              />
              <ProgressRing
                progress={macroGoals.fat > 0 ? (todayLog.fatG / macroGoals.fat) * 100 : 0}
                size={80}
                strokeWidth={6}
                color="#FFD93D"
                label="Fat"
                value={todayLog.fatG}
                goal={macroGoals.fat}
                unit="g"
              />
              <ProgressRing
                progress={macroGoals.carbs > 0 ? (todayLog.carbsG / macroGoals.carbs) * 100 : 0}
                size={80}
                strokeWidth={6}
                color="#A78BFA"
                label="Carbs"
                value={todayLog.carbsG}
                goal={macroGoals.carbs}
                unit="g"
              />
            </div>
          </div>
        </div>

        {/* Calorie summary card */}
        <div className="animate-slide-up stagger-3 mb-4">
          <div className="glass-card p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
              background: 'linear-gradient(90deg, #FF6B6B, #A78BFA)',
              opacity: 0.6
            }} />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Calories remaining</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-bold text-text-primary">
                    {Math.max(0, macroGoals.calories - todayLog.caloriesConsumed)}
                  </span>
                  <span className="text-sm text-text-secondary">kcal</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-text-tertiary block">Target</span>
                <span className="text-sm text-text-secondary font-medium">{macroGoals.calories} kcal</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="animate-slide-up stagger-3">
            <MacroCard
              label="Fiber"
              icon="🥬"
              value={todayLog.fiberG}
              goal={macroGoals.fiber}
              unit="g"
              color="#F472B6"
            />
          </div>
          <div className="animate-slide-up stagger-4">
            <MacroCard
              label="Water"
              icon="💧"
              value={todayLog.waterMl}
              goal={macroGoals.water}
              unit="ml"
              color="#38BDF8"
            />
          </div>
        </div>

        {/* Steps */}
        <div className="animate-slide-up stagger-4 mb-4">
          <StepProgress steps={todayLog.steps} goal={userProfile.stepsGoal} />
        </div>

        {/* Streaks & Workout */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="animate-slide-up stagger-5">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>🏋️</span>
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">This Week</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-text-primary">{streaks.trainingDaysThisWeek}</span>
                <span className="text-xs text-text-secondary">/ 4 workouts</span>
              </div>
              {todayLog.workoutDone && (
                <span className="inline-block mt-2 text-xs bg-accent-success/15 text-accent-success px-2 py-0.5 rounded-full font-medium">
                  ✅ Done today
                </span>
              )}
            </div>
          </div>
          <div className="animate-slide-up stagger-5">
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <span>🔥</span>
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Protein Streak</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-accent-success">{streaks.proteinGoalHitStreak}</span>
                <span className="text-xs text-text-secondary">days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sleep */}
        <div className="animate-slide-up stagger-5 mb-4">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>😴</span>
                <span className="text-xs text-text-secondary font-medium uppercase tracking-wider">Sleep</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-bold ${todayLog.sleepHrs >= 7 ? 'text-accent-success' : todayLog.sleepHrs > 0 ? 'text-accent-fat' : 'text-text-primary'}`}>
                  {todayLog.sleepHrs || '—'}
                </span>
                <span className="text-xs text-text-secondary">/ 7-9 hrs</span>
              </div>
            </div>
          </div>
        </div>

        {/* Weight Chart */}
        <div className="animate-slide-up stagger-6 mb-4">
          <WeightChart data={weightHistory} />
        </div>

        {/* Weight Input */}
        <div className="animate-slide-up stagger-6 mb-6">
          {showWeightInput ? (
            <div className="glass-card p-4 animate-fade-in-scale">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Log Today's Weight</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="e.g. 78.5"
                  step="0.1"
                  min="30"
                  max="300"
                  autoFocus
                  className="flex-1 bg-bg-input border border-glass-border rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent-primary/50 transition-colors"
                  onKeyDown={(e) => e.key === 'Enter' && handleWeightSubmit()}
                />
                <button
                  onClick={handleWeightSubmit}
                  className="px-4 py-2.5 bg-accent-primary text-white rounded-xl text-sm font-medium hover:bg-accent-primary/80 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowWeightInput(false); setWeightInput(''); }}
                  className="px-3 py-2.5 bg-[rgba(255,255,255,0.06)] text-text-secondary rounded-xl text-sm hover:bg-[rgba(255,255,255,0.1)] transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowWeightInput(true)}
              className="w-full glass-card p-4 flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
