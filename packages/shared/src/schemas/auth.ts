import { z } from 'zod'
import { FitnessGoalEnum } from './user'

export const SignUpSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    fitnessGoal: FitnessGoalEnum,
    weeklyTarget: z
      .number({
        required_error: 'Please select a weekly workout target',
        invalid_type_error: 'Weekly target must be a number',
      })
      .int('Weekly target must be a whole number')
      .min(1, 'Weekly target must be at least 1 workout')
      .max(7, 'Weekly target cannot exceed 7 workouts'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type SignUpInput = z.infer<typeof SignUpSchema>
export type LoginInput = z.infer<typeof LoginSchema>
