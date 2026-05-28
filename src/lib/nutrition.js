/**
 * Calculate daily macro targets based on body weight
 * Uses the exact formulas from the Hash system prompt
 * @param {number} weightKg - Current body weight in kilograms
 * @returns {object} - All macro targets
 */
export function calculateMacros(weightKg) {
  const calories = Math.round(weightKg * 25);
  const proteinG = Math.round(weightKg * 1.9);
  const fatG = Math.round(weightKg * 0.7);
  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbKcal = calories - (proteinKcal + fatKcal);
  const carbsG = Math.round(carbKcal / 4);
  const fiberG = Math.round(calories * 14 / 1000);
  const waterMl = Math.round(35 * weightKg);

  return {
    calories,
    protein: proteinG,
    fat: fatG,
    carbs: carbsG,
    fiber: fiberG,
    water: waterMl,
    // Breakdown for reference
    proteinKcal,
    fatKcal,
    carbKcal
  };
}

/**
 * Get formatted macro goals with labels and colors
 * @param {number} weightKg - Current body weight in kg
 * @returns {Array} - Array of macro goal objects with display info
 */
export function getMacroGoals(weightKg) {
  const macros = calculateMacros(weightKg);
  return [
    { key: 'calories', label: 'Calories', goal: macros.calories, unit: 'kcal', color: '#FF6B6B' },
    { key: 'protein', label: 'Protein', goal: macros.protein, unit: 'g', color: '#4ECDC4' },
    { key: 'fat', label: 'Fat', goal: macros.fat, unit: 'g', color: '#FFD93D' },
    { key: 'carbs', label: 'Carbs', goal: macros.carbs, unit: 'g', color: '#A78BFA' },
    { key: 'fiber', label: 'Fiber', goal: macros.fiber, unit: 'g', color: '#F472B6' },
    { key: 'water', label: 'Water', goal: macros.water, unit: 'ml', color: '#38BDF8' },
  ];
}

/**
 * Default user profile
 */
export const DEFAULT_PROFILE = {
  name: 'Nit',
  age: 22,
  heightCm: 170,
  currentWeight: 79,
  goalWeight: 74,
  stepsGoal: 10000,
  sleepGoalHrs: 8,
};
