import { useState } from 'react'
import type { OnboardingFormState } from '../../hooks/useOnboardingForm'
import type { OnboardingData } from '../../lib/authHelpers'

interface SummaryScreenProps {
  formState: OnboardingFormState
  onEdit: (step: number) => void
  onComplete: (data: OnboardingData) => Promise<void>
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const GOAL_LABELS: Record<string, string> = {
  build_muscle: 'Build Muscle',
  lose_weight: 'Lose Weight',
  improve_endurance: 'Improve Endurance',
  increase_flexibility: 'Increase Flexibility',
  general_fitness: 'General Fitness',
}

const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-binary',
  prefer_not_to_say: 'Prefer not to say',
}

const RESTRICTION_LABELS: Record<string, string> = {
  back_issues: 'Back Issues',
  knee_problems: 'Knee Problems',
  shoulder_issues: 'Shoulder Issues',
  heart_condition: 'Heart Condition',
  asthma: 'Asthma',
  pregnancy: 'Pregnancy',
  recent_surgery: 'Recent Surgery',
  other: 'Other',
}

export function SummaryScreen({ formState, onEdit, onComplete }: SummaryScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Prepare data for submission
      const data: OnboardingData = {
        name: formState.name.trim(),
        age: formState.age as number,
        height: formState.height as number,
        weight: formState.weight as number,
        gender: formState.gender as any,
        fitnessGoals: formState.fitnessGoals,
        weeklyTarget: formState.weeklyTarget as number,
        restDays: formState.restDays,
        hasHealthRestrictions: formState.hasHealthRestrictions,
        healthRestrictions: formState.healthRestrictions,
      }

      await onComplete(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save your profile. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Review your profile</h2>
        <p className="text-gray-600 mb-6">
          Everything looks good? Let's get started!
        </p>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
                <button
                  onClick={handleComplete}
                  className="mt-2 text-sm text-red-700 font-medium hover:text-red-900 underline"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {/* Personal Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Personal Information</h3>
              <button
                onClick={() => onEdit(2)}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Edit
              </button>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-gray-600">Name</dt>
                <dd className="font-medium text-gray-900">{formState.name}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Age</dt>
                <dd className="font-medium text-gray-900">{formState.age} years</dd>
              </div>
              <div>
                <dt className="text-gray-600">Height</dt>
                <dd className="font-medium text-gray-900">{formState.height} cm</dd>
              </div>
              <div>
                <dt className="text-gray-600">Weight</dt>
                <dd className="font-medium text-gray-900">{formState.weight} kg</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-gray-600">Gender</dt>
                <dd className="font-medium text-gray-900">
                  {GENDER_LABELS[formState.gender as string] || formState.gender}
                </dd>
              </div>
            </dl>
          </div>

          {/* Fitness Goals */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Fitness Goals</h3>
              <button
                onClick={() => onEdit(3)}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Edit
              </button>
            </div>
            <ul className="space-y-2">
              {formState.fitnessGoals.map((goal) => (
                <li key={goal} className="flex items-center gap-2 text-sm text-gray-700">
                  <svg
                    className="w-4 h-4 text-violet-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {GOAL_LABELS[goal] || goal}
                </li>
              ))}
            </ul>
          </div>

          {/* Workout Schedule */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Workout Schedule</h3>
              <button
                onClick={() => onEdit(4)}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Edit
              </button>
            </div>
            <div className="space-y-2 text-sm">
              <p className="text-gray-700">
                <span className="font-medium">{formState.weeklyTarget}</span> workouts per week
              </p>
              {formState.restDays.length > 0 && (
                <div>
                  <p className="text-gray-600 mb-1">Rest days:</p>
                  <div className="flex flex-wrap gap-2">
                    {formState.restDays
                      .sort((a, b) => a - b)
                      .map((day) => (
                        <span
                          key={day}
                          className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-medium"
                        >
                          {DAYS[day]}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Health Restrictions */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Health Considerations</h3>
              <button
                onClick={() => onEdit(5)}
                className="text-sm text-violet-600 hover:text-violet-700 font-medium"
              >
                Edit
              </button>
            </div>
            {formState.hasHealthRestrictions && formState.healthRestrictions.length > 0 ? (
              <ul className="space-y-2">
                {formState.healthRestrictions.map((restriction, index) => (
                  <li key={index} className="text-sm text-gray-700">
                    <span className="font-medium">
                      {RESTRICTION_LABELS[restriction.type] || restriction.type}
                    </span>
                    {restriction.description && (
                      <p className="mt-1 text-gray-600">{restriction.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No health restrictions</p>
            )}
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <button
          onClick={handleComplete}
          disabled={isSubmitting}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition ${
            isSubmitting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-violet-600 text-white hover:bg-violet-700'
          }`}
        >
          {isSubmitting ? 'Saving your profile...' : 'Complete Setup'}
        </button>
        <p className="mt-3 text-sm text-gray-500 text-center">
          You can update these settings anytime in your profile
        </p>
      </div>
    </div>
  )
}
