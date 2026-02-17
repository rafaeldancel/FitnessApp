import { z } from 'zod'

export const WorkoutTypeEnum = z.enum(['strength', 'cardio', 'hiit', 'flexibility', 'other'])

export const LoggedWorkoutSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  name: z.string().min(1, 'Workout name is required'),
  type: WorkoutTypeEnum,
  duration: z.number().positive('Duration must be greater than 0'),
  calories: z.number().positive().optional(),
  date: z.date(),
  notes: z.string().optional(),
  createdAt: z.date(),
  sessionSource: z.string().optional(), // e.g. "daily_workout"
})

export const CreateLoggedWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required'),
  type: WorkoutTypeEnum,
  duration: z.number().positive('Duration must be greater than 0'),
  calories: z.number().positive().optional(),
  date: z.date(),
  notes: z.string().optional(),
  sessionSource: z.string().optional(),
})

export const PlannedWorkoutSchema = z.object({
  id: z.string().optional(),
  userId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  type: WorkoutTypeEnum,
  name: z.string().min(1, 'Workout name is required'),
  templateUsed: z.string().optional(),
  exercises: z.array(z.any()), // Storing full exercise objects for now
  duration: z.number().positive(),
  completed: z.boolean().default(false),
  createdAt: z
    .date()
    .or(z.object({ seconds: z.number(), nanoseconds: z.number() }))
    .optional(),
})

export type LoggedWorkout = z.infer<typeof LoggedWorkoutSchema>
export type CreateLoggedWorkout = z.infer<typeof CreateLoggedWorkoutSchema>
export type PlannedWorkout = z.infer<typeof PlannedWorkoutSchema>
export type WorkoutType = z.infer<typeof WorkoutTypeEnum>
