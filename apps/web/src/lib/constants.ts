import type { FitnessGoal } from '../types'

export const CALORIE_RATES: Record<string, number> = {
  strength: 7,
  compound: 7,
  cardio: 10,
  hiit: 12,
  flexibility: 4,
  warmup: 4,
  cooldown: 3,
  other: 5,
}

export const DEFAULT_DAILY_CALORIE_GOAL = 500
export const DEFAULT_REST_SECONDS = 30
export const MAX_FITNESS_GOALS = 5

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  build_muscle: '💪 Build Muscle',
  lose_weight: '🔥 Lose Weight',
  improve_endurance: '🏃 Improve Endurance',
  increase_flexibility: '🧘 Increase Flexibility',
  general_fitness: '⭐ General Fitness',
}
