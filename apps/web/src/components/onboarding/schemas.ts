import { z } from 'zod'
import {
  GenderEnum,
  FitnessGoalEnum,
  HealthRestrictionTypeEnum,
  HealthRestrictionSchema,
} from '@repo/shared/schemas'

/**
 * Validation schema for Step 2: Personal Info
 */
export const PersonalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age'),
  height: z
    .number({ invalid_type_error: 'Height must be a number' })
    .positive('Height must be greater than 0'),
  weight: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .positive('Weight must be greater than 0'),
  gender: GenderEnum,
})

/**
 * Validation schema for Step 3: Fitness Goals
 */
export const FitnessGoalsSchema = z.object({
  fitnessGoals: z
    .array(FitnessGoalEnum)
    .min(1, 'Please select at least one fitness goal')
    .max(5, 'Please select at most 5 fitness goals'),
})

/**
 * Validation schema for Step 4: Workout Schedule
 */
export const WorkoutScheduleSchema = z
  .object({
    weeklyTarget: z
      .number({ invalid_type_error: 'Please select workouts per week' })
      .int('Workouts per week must be a whole number')
      .min(1, 'Please select at least 1 workout per week')
      .max(7, 'Maximum is 7 workouts per week'),
    restDays: z
      .array(z.number().int().min(0).max(6))
      .min(0)
      .max(7),
  })
  .refine(
    (data) => {
      const requiredRestDays = 7 - data.weeklyTarget
      return data.restDays.length === requiredRestDays
    },
    (data) => {
      const requiredRestDays = 7 - data.weeklyTarget
      return {
        message: `Please select exactly ${requiredRestDays} rest day${requiredRestDays !== 1 ? 's' : ''}`,
        path: ['restDays'],
      }
    }
  )

/**
 * Validation schema for Step 5: Health Restrictions
 */
export const HealthRestrictionsSchema = z
  .object({
    hasHealthRestrictions: z.boolean(),
    healthRestrictions: z.array(HealthRestrictionSchema),
  })
  .refine(
    (data) => {
      // If has restrictions is true, must have at least one restriction
      if (data.hasHealthRestrictions) {
        return data.healthRestrictions.length > 0
      }
      return true
    },
    {
      message: 'Please select at least one health restriction or toggle off',
      path: ['healthRestrictions'],
    }
  )
  .refine(
    (data) => {
      // If 'other' is selected, description must be at least 10 characters
      const otherRestriction = data.healthRestrictions.find((r) => r.type === 'other')
      if (otherRestriction) {
        return otherRestriction.description && otherRestriction.description.trim().length >= 10
      }
      return true
    },
    {
      message: 'Please provide a description for "Other" (minimum 10 characters)',
      path: ['healthRestrictions'],
    }
  )

/**
 * Complete onboarding data schema (all steps combined)
 * Note: Can't use merge() with refined schemas, so we define it directly
 */
export const CompleteOnboardingSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(13, 'You must be at least 13 years old')
    .max(120, 'Please enter a valid age'),
  height: z
    .number({ invalid_type_error: 'Height must be a number' })
    .positive('Height must be greater than 0'),
  weight: z
    .number({ invalid_type_error: 'Weight must be a number' })
    .positive('Weight must be greater than 0'),
  gender: GenderEnum,
  fitnessGoals: z
    .array(FitnessGoalEnum)
    .min(1, 'Please select at least one fitness goal')
    .max(5, 'Please select at most 5 fitness goals'),
  weeklyTarget: z
    .number({ invalid_type_error: 'Please select workouts per week' })
    .int('Workouts per week must be a whole number')
    .min(1, 'Please select at least 1 workout per week')
    .max(7, 'Maximum is 7 workouts per week'),
  restDays: z.array(z.number().int().min(0).max(6)).min(0).max(7),
  hasHealthRestrictions: z.boolean(),
  healthRestrictions: z.array(HealthRestrictionSchema),
})

export type PersonalInfo = z.infer<typeof PersonalInfoSchema>
export type FitnessGoalsData = z.infer<typeof FitnessGoalsSchema>
export type WorkoutScheduleData = z.infer<typeof WorkoutScheduleSchema>
export type HealthRestrictionsData = z.infer<typeof HealthRestrictionsSchema>
export type CompleteOnboardingData = z.infer<typeof CompleteOnboardingSchema>
