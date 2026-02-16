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

export type LoggedWorkout = z.infer<typeof LoggedWorkoutSchema>
export type CreateLoggedWorkout = z.infer<typeof CreateLoggedWorkoutSchema>
export type WorkoutType = z.infer<typeof WorkoutTypeEnum>
