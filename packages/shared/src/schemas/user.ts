import { z } from 'zod'

export const FitnessGoalEnum = z.enum([
  'build_muscle',
  'lose_weight',
  'improve_endurance',
  'increase_flexibility',
  'general_fitness'
])

export const GenderEnum = z.enum(['male', 'female', 'non_binary', 'prefer_not_to_say'])

export const HealthRestrictionTypeEnum = z.enum([
  'back_issues',
  'knee_problems',
  'shoulder_issues',
  'heart_condition',
  'asthma',
  'pregnancy',
  'recent_surgery',
  'other'
])

export const HealthRestrictionSchema = z.object({
  type: HealthRestrictionTypeEnum,
  description: z.string().optional(),
})

export const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),

  // Personal info
  name: z.string().min(2).optional(),
  age: z.number().int().min(13).max(120).optional(),
  height: z.number().positive().optional(), // cm
  weight: z.number().positive().optional(), // kg
  gender: GenderEnum.optional(),

  // Fitness goals (keeping old singular field for backward compatibility)
  fitnessGoal: FitnessGoalEnum.optional(),
  fitnessGoals: z.array(FitnessGoalEnum).min(1).max(5).optional(),

  // Workout schedule
  weeklyTarget: z.number().int().min(1).max(7).optional(),
  restDays: z.array(z.number().int().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday

  // Health restrictions
  hasHealthRestrictions: z.boolean().default(false),
  healthRestrictions: z.array(HealthRestrictionSchema).optional(),

  // System fields
  onboardingComplete: z.boolean().default(false),
  onboardingCompletedAt: z.date().optional(),
})

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  fitnessGoal: FitnessGoalEnum.optional(),
  weeklyTarget: z.number().int().min(1).max(7).optional(),
})

export type User = z.infer<typeof UserSchema>
export type CreateUser = z.infer<typeof CreateUserSchema>
export type FitnessGoal = z.infer<typeof FitnessGoalEnum>
export type Gender = z.infer<typeof GenderEnum>
export type HealthRestrictionType = z.infer<typeof HealthRestrictionTypeEnum>
export type HealthRestriction = z.infer<typeof HealthRestrictionSchema>
