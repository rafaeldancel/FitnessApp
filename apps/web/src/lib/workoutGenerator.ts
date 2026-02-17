import type { Exercise, FitnessGoal, HealthRestriction } from '../types';
import { exerciseLibrary, sessionTemplates } from './exerciseLibrary';

export interface GeneratedSession {
  name: string;
  isRestDay: boolean;
  restDayMessage?: string;
  totalDuration: number;
  warmup: Exercise[];
  mainExercises: Exercise[];
  cooldown: Exercise[];
  goalLabel: string;
}

// Map onboarding health restriction types to exercise contraindication keys
const restrictionToContraindication: Record<string, keyof Exercise['contraindications']> = {
  back_issues: 'back_injury',
  knee_problems: 'knee_injury',
  shoulder_issues: 'shoulder_injury',
  heart_condition: 'heart_condition',
  recent_surgery: 'recent_surgery',
  asthma: 'asthma',
  // 'pregnancy' and 'other' don't directly map to exercise contraindications
};

/**
 * Deterministic seed for the day — same workout all day, changes tomorrow
 */
function getDaySeed(): number {
  const now = new Date();
  // Use local date to avoid timezone shift issues
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay); // Day of year (1-366)
}

/**
 * Simple deterministic pseudo-random using a seed
 * Returns a number 0 <= n < 1
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

/**
 * Deterministic shuffle using day seed
 */
function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom(seed + i) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Filter out exercises that conflict with the user's health restrictions
 */
export function filterByRestrictions(
  exercises: Exercise[],
  healthRestrictions: HealthRestriction[]
): Exercise[] {
  if (healthRestrictions.length === 0) return exercises;

  const activeContraKeys = healthRestrictions
    .map((r) => restrictionToContraindication[r.type])
    .filter(Boolean);

  if (activeContraKeys.length === 0) return exercises;

  return exercises.filter((exercise) => {
    return !activeContraKeys.some((key) => exercise.contraindications[key]);
  });
}

/**
 * Check if an exercise's muscle groups overlap with the target focus areas
 */
function matchesFocus(exercise: Exercise, focus: string[]): boolean {
  // 'full body' focus matches everything
  if (focus.includes('full body')) return true;
  return exercise.muscleGroups.some((mg) =>
    focus.some(
      (f) =>
        mg.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(mg.toLowerCase())
    )
  );
}

/**
 * Pick warmup exercises relevant to the main workout's focus
 */
export function pickWarmup(
  focus: string[],
  healthRestrictions: HealthRestriction[],
  seed: number,
  count: number = 3
): Exercise[] {
  const allWarmups = exerciseLibrary.warmup || [];
  const safe = filterByRestrictions(allWarmups, healthRestrictions);

  // Prefer warmups relevant to today's focus, then fill with general ones
  const relevant = safe.filter((e) => matchesFocus(e, focus));
  const general = safe.filter((e) => !matchesFocus(e, focus));

  const shuffledRelevant = seededShuffle(relevant, seed + 100);
  const shuffledGeneral = seededShuffle(general, seed + 200);

  const picked: Exercise[] = [];
  // Take from relevant first, then fill from general
  for (const e of [...shuffledRelevant, ...shuffledGeneral]) {
    if (picked.length >= count) break;
    picked.push(e);
  }

  return picked;
}

/**
 * Pick cooldown exercises that stretch muscles used in the main workout
 */
export function pickCooldown(
  mainMuscleGroups: string[],
  healthRestrictions: HealthRestriction[],
  seed: number,
  count: number = 3
): Exercise[] {
  const allCooldowns = exerciseLibrary.cooldown || [];
  const safe = filterByRestrictions(allCooldowns, healthRestrictions);

  // Prefer cooldowns that target muscles used in the main workout
  const relevant = safe.filter((e) => matchesFocus(e, mainMuscleGroups));
  const general = safe.filter((e) => !matchesFocus(e, mainMuscleGroups));

  const shuffledRelevant = seededShuffle(relevant, seed + 300);
  const shuffledGeneral = seededShuffle(general, seed + 400);

  const picked: Exercise[] = [];
  for (const e of [...shuffledRelevant, ...shuffledGeneral]) {
    if (picked.length >= count) break;
    picked.push(e);
  }

  return picked;
}

/**
 * Pick main exercises for the session
 */
function pickMainExercises(
  goalKey: string,
  focus: string[],
  healthRestrictions: HealthRestriction[],
  seed: number,
  count: number
): Exercise[] {
  const goalExercises = exerciseLibrary[goalKey] || [];
  const safe = filterByRestrictions(goalExercises, healthRestrictions);

  // Prefer exercises matching the focus, then fill with others from the same goal
  const matching = safe.filter((e) => matchesFocus(e, focus));
  const others = safe.filter((e) => !matchesFocus(e, focus));

  const shuffledMatching = seededShuffle(matching, seed + 500);
  const shuffledOthers = seededShuffle(others, seed + 600);

  const picked: Exercise[] = [];
  for (const e of [...shuffledMatching, ...shuffledOthers]) {
    if (picked.length >= count) break;
    picked.push(e);
  }

  return picked;
}

const GOAL_LABELS: Record<string, string> = {
  build_muscle: '💪 Build Muscle',
  lose_weight: '🔥 Lose Weight',
  improve_endurance: '🏃 Improve Endurance',
  increase_flexibility: '🧘 Increase Flexibility',
  general_fitness: '⭐ General Fitness',
};

/**
 * Generate today's workout session based on user profile
 */
export function generateTodaysWorkout(
  fitnessGoals: FitnessGoal[],
  restDays: number[],
  healthRestrictions: HealthRestriction[]
): GeneratedSession {
  const now = new Date();
  const todayDayOfWeek = now.getDay(); // 0=Sun, 6=Sat
  const daySeed = getDaySeed();

  // Check if today is a rest day
  if (restDays.includes(todayDayOfWeek)) {
    return {
      name: 'Rest Day',
      isRestDay: true,
      restDayMessage: 'Recovery is part of the journey. Take it easy today!',
      totalDuration: 0,
      warmup: [],
      mainExercises: [],
      cooldown: [],
      goalLabel: '😴 Rest Day',
    };
  }

  // No goals set — fallback to general fitness
  const goals = fitnessGoals.length > 0 ? fitnessGoals : ['general_fitness' as FitnessGoal];

  // Rotate through goals across workout days using the day seed
  const goalIndex = daySeed % goals.length;
  const todaysGoal = goals[goalIndex];

  // Get session templates for this goal
  const templates = sessionTemplates[todaysGoal] || sessionTemplates.general_fitness;
  const templateIndex = daySeed % templates.length;
  const template = templates[templateIndex];

  // Pick exercises
  const mainExercises = pickMainExercises(
    todaysGoal,
    template.focus,
    healthRestrictions,
    daySeed,
    template.exerciseCount
  );

  // Gather all muscle groups from main exercises for relevant warmup/cooldown
  const mainMuscleGroups = [...new Set(mainExercises.flatMap((e) => e.muscleGroups))];

  const warmup = pickWarmup(template.focus, healthRestrictions, daySeed, 3);
  const cooldown = pickCooldown(mainMuscleGroups, healthRestrictions, daySeed, 3);

  // Calculate total duration
  const warmupTime = warmup.reduce((sum, e) => sum + e.durationMinutes, 0);
  const mainTime = mainExercises.reduce((sum, e) => sum + e.durationMinutes, 0);
  const cooldownTime = cooldown.reduce((sum, e) => sum + e.durationMinutes, 0);

  return {
    name: template.name,
    isRestDay: false,
    totalDuration: warmupTime + mainTime + cooldownTime,
    warmup,
    mainExercises,
    cooldown,
    goalLabel: GOAL_LABELS[todaysGoal] || todaysGoal,
  };
}

/**
 * Generate a full exercise list for a specific template
 * Used when scheduling a planned workout
 */
export function generateExercisesForTemplate(
  goalKey: string,
  templateName: string,
  healthRestrictions: HealthRestriction[]
): Exercise[] {
  const daySeed = getDaySeed(); // Use today's seed for consistency

  // Find the template
  const templates = sessionTemplates[goalKey] || sessionTemplates.general_fitness;
  const template = templates.find((t) => t.name === templateName);

  if (!template) return [];

  // Pick exercises
  const mainExercises = pickMainExercises(
    goalKey,
    template.focus,
    healthRestrictions,
    daySeed,
    template.exerciseCount
  ).map((e) => ({ ...e, category: 'main' as any })); // Tag as main

  const mainMuscleGroups = [...new Set(mainExercises.flatMap((e) => e.muscleGroups))];

  const warmup = pickWarmup(template.focus, healthRestrictions, daySeed, 3).map((e) => ({
    ...e,
    category: 'warmup' as any,
  }));

  const cooldown = pickCooldown(mainMuscleGroups, healthRestrictions, daySeed, 3).map((e) => ({
    ...e,
    category: 'cooldown' as any,
  }));

  return [...warmup, ...mainExercises, ...cooldown];
}
