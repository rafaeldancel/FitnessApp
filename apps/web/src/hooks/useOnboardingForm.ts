import { useState, useEffect, useCallback } from 'react'
import type { FitnessGoal, Gender, HealthRestriction } from '@repo/shared/schemas'

export interface OnboardingFormState {
  // Step 2: Personal Info
  name: string
  age: number | ''
  height: number | '' // cm
  weight: number | '' // kg
  gender: Gender | ''

  // Step 3: Fitness Goals
  fitnessGoals: FitnessGoal[]

  // Step 4: Workout Schedule
  weeklyTarget: number | ''
  restDays: number[] // 0=Sunday, 6=Saturday

  // Step 5: Health Restrictions
  hasHealthRestrictions: boolean
  healthRestrictions: HealthRestriction[]
}

export interface OnboardingFormErrors {
  name?: string
  age?: string
  height?: string
  weight?: string
  gender?: string
  fitnessGoals?: string
  weeklyTarget?: string
  restDays?: string
  healthRestrictions?: string
}

const INITIAL_STATE: OnboardingFormState = {
  name: '',
  age: '',
  height: '',
  weight: '',
  gender: '',
  fitnessGoals: [],
  weeklyTarget: '',
  restDays: [],
  hasHealthRestrictions: false,
  healthRestrictions: [],
}

const DRAFT_EXPIRY_DAYS = 7

export function useOnboardingForm(userId?: string) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formState, setFormState] = useState<OnboardingFormState>(INITIAL_STATE)
  const [errors, setErrors] = useState<OnboardingFormErrors>({})

  // Load draft from localStorage on mount
  useEffect(() => {
    if (!userId) return

    const draftKey = `onboarding_draft_${userId}`
    const savedDraft = localStorage.getItem(draftKey)

    if (savedDraft) {
      try {
        const { data, timestamp } = JSON.parse(savedDraft)
        const age = Date.now() - timestamp
        const maxAge = DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000

        if (age < maxAge) {
          setFormState(data.formState)
          setCurrentStep(data.currentStep)
        } else {
          // Draft expired, clear it
          localStorage.removeItem(draftKey)
        }
      } catch (error) {
        console.error('Failed to load onboarding draft:', error)
        localStorage.removeItem(draftKey)
      }
    }
  }, [userId])

  // Save draft to localStorage
  const saveDraft = useCallback(() => {
    if (!userId) return

    const draftKey = `onboarding_draft_${userId}`
    const draft = {
      data: {
        formState,
        currentStep,
      },
      timestamp: Date.now(),
    }

    try {
      localStorage.setItem(draftKey, JSON.stringify(draft))
    } catch (error) {
      console.error('Failed to save onboarding draft:', error)
    }
  }, [userId, formState, currentStep])

  // Clear draft from localStorage
  const clearDraft = useCallback(() => {
    if (!userId) return

    const draftKey = `onboarding_draft_${userId}`
    localStorage.removeItem(draftKey)
  }, [userId])

  // Update form field
  const updateField = useCallback(
    <K extends keyof OnboardingFormState>(field: K, value: OnboardingFormState[K]) => {
      setFormState(prev => ({
        ...prev,
        [field]: value,
      }))
      // Clear error for this field
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }))
    },
    []
  )

  // Update multiple fields at once
  const updateFields = useCallback((updates: Partial<OnboardingFormState>) => {
    setFormState(prev => ({
      ...prev,
      ...updates,
    }))
    // Clear errors for updated fields
    setErrors(prev => {
      const newErrors = { ...prev }
      Object.keys(updates).forEach(key => {
        delete newErrors[key as keyof OnboardingFormErrors]
      })
      return newErrors
    })
  }, [])

  // Validate current step
  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: OnboardingFormErrors = {}

      switch (step) {
        case 1: // Welcome screen - no validation
          return true

        case 2: // Personal Info
          if (!formState.name || formState.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
          }
          if (formState.age === '' || formState.age < 13 || formState.age > 120) {
            newErrors.age = 'Age must be between 13 and 120'
          }
          if (formState.height === '' || formState.height <= 0) {
            newErrors.height = 'Height must be greater than 0'
          }
          if (formState.weight === '' || formState.weight <= 0) {
            newErrors.weight = 'Weight must be greater than 0'
          }
          if (!formState.gender) {
            newErrors.gender = 'Please select a gender'
          }
          break

        case 3: // Fitness Goals
          if (formState.fitnessGoals.length === 0) {
            newErrors.fitnessGoals = 'Please select at least one fitness goal'
          }
          if (formState.fitnessGoals.length > 5) {
            newErrors.fitnessGoals = 'Please select at most 5 fitness goals'
          }
          break

        case 4: // Workout Schedule
          if (
            formState.weeklyTarget === '' ||
            formState.weeklyTarget < 1 ||
            formState.weeklyTarget > 7
          ) {
            newErrors.weeklyTarget = 'Please select workouts per week (1-7)'
          } else {
            const requiredRestDays = 7 - formState.weeklyTarget
            if (requiredRestDays > 0 && formState.restDays.length !== requiredRestDays) {
              newErrors.restDays = `Please select exactly ${requiredRestDays} rest day${requiredRestDays > 1 ? 's' : ''}`
            }
          }
          break

        case 5: // Health Restrictions
          if (formState.hasHealthRestrictions && formState.healthRestrictions.length === 0) {
            newErrors.healthRestrictions =
              'Please select at least one health restriction or toggle off'
          }
          // Validate 'other' description if present
          {
            const otherRestriction = formState.healthRestrictions.find(r => r.type === 'other')
            if (
              otherRestriction &&
              (!otherRestriction.description || otherRestriction.description.trim().length < 10)
            ) {
              newErrors.healthRestrictions =
                'Please provide a description for "Other" (minimum 10 characters)'
            }
          }
          break

        case 6: // Summary - validate all
          return validateStep(2) && validateStep(3) && validateStep(4) && validateStep(5)
      }

      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    },
    [formState]
  )

  // Navigation
  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6))
      saveDraft()
    }
  }, [currentStep, validateStep, saveDraft])

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }, [])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= 6) {
      setCurrentStep(step)
    }
  }, [])

  return {
    // State
    formState,
    currentStep,
    errors,

    // Actions
    updateField,
    updateFields,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    saveDraft,
    clearDraft,
  }
}
