export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  onboardingComplete: boolean;
  onboardingCompletedAt?: Date;

  // Profile
  name?: string;
  age?: number;
  height?: number; // cm
  weight?: number; // kg
  gender?: Gender;

  // Goals & Preferences
  fitnessGoals?: FitnessGoal[];
  weeklyTarget?: number; // days per week
  restDays?: number[]; // 0-6 (Sun-Sat)

  // Health
  hasHealthRestrictions?: boolean;
  healthRestrictions?: HealthRestriction[];
}

export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | 'other';

export type FitnessGoal =
  | 'build_muscle'
  | 'lose_weight'
  | 'improve_endurance'
  | 'increase_flexibility'
  | 'general_fitness';

export type HealthRestrictionType =
  | 'back_issues'
  | 'knee_problems'
  | 'shoulder_issues'
  | 'heart_condition'
  | 'recent_surgery'
  | 'asthma'
  | 'pregnancy'
  | 'other';

export interface HealthRestriction {
  type: HealthRestrictionType;
  description?: string;
}

export interface Exercise {
  id: string;
  name: string;
  category: WorkoutType | 'compound';
  muscleGroups: string[];
  defaultSets?: number;
  defaultReps?: string; // "12" or "30 sec" for timed exercises
  durationMinutes: number; // estimated time for this exercise
  caloriesPerMinute: number; // estimated calories burned per minute
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  equipment: string[]; // empty = bodyweight
  // Health restriction flags — if true, AVOID for users with this restriction
  contraindications: {
    back_injury?: boolean;
    knee_injury?: boolean;
    shoulder_injury?: boolean;
    heart_condition?: boolean;
    recent_surgery?: boolean;
    asthma?: boolean;
    wrist_injury?: boolean;
    hip_injury?: boolean;
  };
}

export type WorkoutType =
  | 'strength'
  | 'cardio'
  | 'hiit'
  | 'flexibility'
  | 'compound'
  | 'warmup'
  | 'cooldown'
  | 'other';

export interface PlannedWorkout {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  type: WorkoutType;
  name: string;
  templateUsed?: string;
  exercises: Exercise[];
  duration: number; // minutes
  completed: boolean;
  createdAt: unknown; // Firestore Timestamp
}

export interface LoggedWorkout {
  id: string;
  userId: string;
  name: string;
  type: WorkoutType;
  duration: number; // minutes
  calories?: number;
  date: Date;
  notes?: string;
  createdAt: Date;
  sessionSource?: string | null;
}

export interface CreateLoggedWorkout {
  name: string;
  type: WorkoutType;
  duration: number;
  calories?: number;
  date: Date;
  notes?: string;
  sessionSource?: string;
}

export interface CompletedSession {
  userId: string;
  date: string; // YYYY-MM-DD
  sessionName: string;
  completedAt: unknown; // Firestore Timestamp
}

export interface OnboardingData {
  name: string;
  age: number;
  height: number;
  weight: number;
  gender: Gender;
  fitnessGoals: FitnessGoal[];
  weeklyTarget: number;
  restDays: number[];
  hasHealthRestrictions?: boolean;
  healthRestrictions: HealthRestriction[];
}
