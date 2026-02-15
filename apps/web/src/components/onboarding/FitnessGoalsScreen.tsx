import type { OnboardingFormState, OnboardingFormErrors } from '../../hooks/useOnboardingForm'
import type { FitnessGoal } from '@repo/shared/schemas'

interface FitnessGoalsScreenProps {
  formState: OnboardingFormState
  errors: OnboardingFormErrors
  onUpdateField: <K extends keyof OnboardingFormState>(
    field: K,
    value: OnboardingFormState[K]
  ) => void
}

interface GoalOption {
  value: FitnessGoal
  label: string
  description: string
  icon: string
}

const GOAL_OPTIONS: GoalOption[] = [
  {
    value: 'build_muscle',
    label: 'Build Muscle',
    description: 'Increase strength and muscle mass',
    icon: '💪',
  },
  {
    value: 'lose_weight',
    label: 'Lose Weight',
    description: 'Burn fat and reduce body weight',
    icon: '🔥',
  },
  {
    value: 'improve_endurance',
    label: 'Improve Endurance',
    description: 'Build stamina and cardiovascular health',
    icon: '🏃',
  },
  {
    value: 'increase_flexibility',
    label: 'Increase Flexibility',
    description: 'Improve range of motion and mobility',
    icon: '🧘',
  },
  {
    value: 'general_fitness',
    label: 'General Fitness',
    description: 'Overall health and wellness',
    icon: '⭐',
  },
]

export function FitnessGoalsScreen({
  formState,
  errors,
  onUpdateField,
}: FitnessGoalsScreenProps) {
  const toggleGoal = (goal: FitnessGoal) => {
    const currentGoals = formState.fitnessGoals
    if (currentGoals.includes(goal)) {
      onUpdateField(
        'fitnessGoals',
        currentGoals.filter((g) => g !== goal)
      )
    } else if (currentGoals.length < 5) {
      onUpdateField('fitnessGoals', [...currentGoals, goal])
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">What are your fitness goals?</h2>
      <p className="text-gray-600 mb-6">
        Select 1-5 goals that you want to achieve
      </p>

      {/* Counter */}
      <div className="mb-6 text-center">
        <span className="inline-block px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
          {formState.fitnessGoals.length} of 5 goals selected
        </span>
      </div>

      {/* Goal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {GOAL_OPTIONS.map((option) => {
          const isSelected = formState.fitnessGoals.includes(option.value)
          const isDisabled = !isSelected && formState.fitnessGoals.length >= 5

          return (
            <button
              key={option.value}
              onClick={() => toggleGoal(option.value)}
              disabled={isDisabled}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                isSelected
                  ? 'border-violet-600 bg-violet-50'
                  : isDisabled
                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{option.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{option.label}</h3>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>
                {isSelected && (
                  <div className="flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-violet-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {errors.fitnessGoals && (
        <p className="mt-2 text-sm text-red-600 text-center animate-fade-in">
          {errors.fitnessGoals}
        </p>
      )}
    </div>
  )
}
