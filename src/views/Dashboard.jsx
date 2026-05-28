import { useState } from 'react';
import { useAppStore } from '../store/useAppStore.js';
import ProgressRing from '../components/ProgressRing.jsx';
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="flex-1 overflow-y-auto pb-28 no-scrollbar">
      {/* Bulletproof container: exactly 20px padding on each side on small screens, max 500px wide */}
      <div className="w-[calc(100%-40px)] max-w-[500px] mx-auto pt-6 sm:pt-8">

        {/* Header */}
        <div className="mb-6 animate-slide-up stagger-1">
          <h1 className="text-[28px] font-bold text-text-primary tracking-tight">
            {greeting}, <span className="text-accent-primary">{userProfile.name || 'Nit'}</span>
          </h1>
          <p className="text-[13px] font-semibold text-text-secondary mt-1 tracking-wide">{today}</p>
        </div>

        {/* SECTION: NUTRITION HUB */}
        <div className="section-block mb-6 animate-slide-up stagger-2">
          <div className="section-header flex justify-between items-center">
            <span>Today's Nutrition</span>
            <span className="text-[10px] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 rounded text-text-tertiary">{userProfile.currentWeight} kg</span>
          </div>
          
          <div className="p-5">
            {/* Calories Summary */}
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-[rgba(255,255,255,0.04)]">
              <div>
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest">Remaining</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-4xl font-extrabold text-text-primary tracking-tighter">
                    {Math.max(0, macroGoals.calories - todayLog.caloriesConsumed)}
                  </span>
                  <span className="text-sm font-semibold text-text-tertiary">kcal</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-text-secondary uppercase tracking-widest block">Target</span>
                <span className="text-lg font-bold text-text-primary mt-1">{macroGoals.calories}</span>
              </div>
            </div>

            {/* Macro Rings Grid */}
            <div className="grid grid-cols-3 gap-2 justify-items-center">
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

        {/* SECTION: DAILY GOALS */}
        <div className="section-block mb-6 animate-slide-up stagger-3">
          <div className="section-header">Daily Goals</div>
          
          <div className="section-row">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-sm">🚶</div>
              <span className="text-[14px] font-semibold text-text-primary">Steps</span>
            </div>
            <div className="text-right flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[15px] font-bold text-text-primary">{todayLog.steps.toLocaleString()}</span>
                <span className="text-[11px] text-text-tertiary font-medium">/ {userProfile.stepsGoal.toLocaleString()}</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[rgba(255,255,255,0.05)] relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 right-0 bg-text-primary transition-all duration-1000" 
                      style={{ height: `${Math.min((todayLog.steps / userProfile.stepsGoal) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="section-row">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-sm">💧</div>
              <span className="text-[14px] font-semibold text-text-primary">Water</span>
            </div>
            <div className="text-right flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[15px] font-bold text-text-primary">{todayLog.waterMl.toLocaleString()} ml</span>
                <span className="text-[11px] text-text-tertiary font-medium">/ {macroGoals.water.toLocaleString()} ml</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[rgba(255,255,255,0.05)] relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 right-0 bg-accent-water transition-all duration-1000" 
                      style={{ height: `${Math.min((todayLog.waterMl / macroGoals.water) * 100, 100)}%` }} />
              </div>
            </div>
          </div>

          <div className="section-row">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-sm">🥬</div>
              <span className="text-[14px] font-semibold text-text-primary">Fiber</span>
            </div>
            <div className="text-right flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[15px] font-bold text-text-primary">{todayLog.fiberG} g</span>
                <span className="text-[11px] text-text-tertiary font-medium">/ {macroGoals.fiber} g</span>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[rgba(255,255,255,0.05)] relative overflow-hidden">
                 <div className="absolute bottom-0 left-0 right-0 bg-accent-fiber transition-all duration-1000" 
                      style={{ height: `${Math.min((todayLog.fiberG / macroGoals.fiber) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: INSIGHTS */}
        <div className="section-block mb-6 animate-slide-up stagger-4">
          <div className="section-header">Insights & Streaks</div>
          
          <div className="section-row">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-sm">🏋️</div>
              <span className="text-[14px] font-semibold text-text-primary">Workouts</span>
            </div>
            <div className="text-right">
              <span className="text-[15px] font-bold text-text-primary">{streaks.trainingDaysThisWeek} <span className="text-[12px] font-medium text-text-tertiary">/ 4 days</span></span>
              {todayLog.workoutDone && (
                <div className="text-[10px] font-bold text-accent-success uppercase tracking-wider mt-1 flex items-center justify-end gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-success animate-pulse-subtle" />
                  Done Today
                </div>
              )}
            </div>
          </div>

          <div className="section-row">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-sm">🔥</div>
              <span className="text-[14px] font-semibold text-text-primary">Protein Streak</span>
            </div>
            <div className="text-right">
              <span className="text-[15px] font-bold text-accent-success">{streaks.proteinGoalHitStreak} <span className="text-[12px] font-medium text-text-tertiary">days</span></span>
            </div>
          </div>

          <div className="section-row">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.03)] flex items-center justify-center text-sm">😴</div>
              <span className="text-[14px] font-semibold text-text-primary">Sleep</span>
            </div>
            <div className="text-right">
              <span className={`text-[15px] font-bold ${todayLog.sleepHrs >= 7 ? 'text-accent-success' : 'text-text-primary'}`}>
                {todayLog.sleepHrs || '—'} <span className="text-[12px] font-medium text-text-tertiary">/ 7-9 hrs</span>
              </span>
            </div>
          </div>
        </div>

        {/* SECTION: WEIGHT TREND */}
        <div className="section-block mb-6 animate-slide-up stagger-5">
          <div className="section-header">Weight Trend</div>
          <div className="p-4">
            <WeightChart data={weightHistory} />
          </div>
          
          <div className="border-t border-[rgba(255,255,255,0.04)]">
            {showWeightInput ? (
              <div className="p-4 bg-[rgba(255,255,255,0.02)] animate-fade-in">
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    placeholder="e.g. 78.5"
                    step="0.1"
                    className="flex-1 bg-bg-input border border-[rgba(255,255,255,0.05)] rounded-xl px-4 py-3 text-[14px] font-bold text-text-primary outline-none focus:border-accent-primary"
                  />
                  <button onClick={handleWeightSubmit} className="px-5 py-3 bg-accent-primary text-white rounded-xl text-sm font-bold">
                    Save
                  </button>
                  <button onClick={() => { setShowWeightInput(false); setWeightInput(''); }} className="px-4 py-3 bg-[rgba(255,255,255,0.05)] text-text-secondary rounded-xl text-sm font-bold">
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowWeightInput(true)}
                className="w-full p-4 flex items-center justify-center gap-2 text-[13px] font-bold text-text-secondary hover:text-text-primary hover:bg-[rgba(255,255,255,0.02)] transition-colors"
              >
                + Log today's weight
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
