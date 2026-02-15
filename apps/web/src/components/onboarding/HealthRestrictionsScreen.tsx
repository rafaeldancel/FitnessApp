import type {
  OnboardingFormState,
  OnboardingFormErrors,
} from '../../hooks/useOnboardingForm'
import type { HealthRestrictionType } from '@repo/shared/schemas'

interface HealthRestrictionsScreenProps {
  formState: OnboardingFormState
  errors: OnboardingFormErrors
  onUpdateField: <K extends keyof OnboardingFormState>(
    field: K,
    value: OnboardingFormState[K]
  ) => void
}

interface RestrictionOption {
  type: HealthRestrictionType
  label: string
  icon: string
}

const RESTRICTION_OPTIONS: RestrictionOption[] = [
  { type: 'back_issues', label: 'Back Issues', icon: '🔙' },
  { type: 'knee_problems', label: 'Knee Problems', icon: '🦵' },
  { type: 'shoulder_issues', label: 'Shoulder Issues', icon: '💪' },
  { type: 'heart_condition', label: 'Heart Condition', icon: '❤️' },
  { type: 'asthma', label: 'Asthma', icon: '🫁' },
  { type: 'pregnancy', label: 'Pregnancy', icon: '🤰' },
  { type: 'recent_surgery', label: 'Recent Surgery', icon: '🏥' },
  { type: 'other', label: 'Other', icon: '📝' },
]

export function HealthRestrictionsScreen({
  formState,
  errors,
  onUpdateField,
}: HealthRestrictionsScreenProps) {
  const toggleRestriction = (type: HealthRestrictionType) => {
    const current = formState.healthRestrictions
    const exists = current.find((r) => r.type === type)

    if (exists) {
      onUpdateField(
        'healthRestrictions',
        current.filter((r) => r.type !== type)
      )
    } else {
      onUpdateField('healthRestrictions', [...current, { type, description: '' }])
    }
  }

  const updateRestrictionDescription = (type: HealthRestrictionType, description: string) => {
    const current = formState.healthRestrictions
    onUpdateField(
      'healthRestrictions',
      current.map((r) => (r.type === type ? { ...r, description } : r))
    )
  }

  const hasOther = formState.healthRestrictions.some((r) => r.type === 'other')
  const otherDescription =
    formState.healthRestrictions.find((r) => r.type === 'other')?.description || ''

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Any health considerations?</h2>
      <p className="text-gray-600 mb-6">
        Help us ensure your workouts are safe and effective
      </p>

      {/* Toggle */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-gray-700 font-medium">I have health restrictions</span>
          <button
            type="button"
            onClick={() => {
              const newValue = !formState.hasHealthRestrictions
              onUpdateField('hasHealthRestrictions', newValue)
              if (!newValue) {
                onUpdateField('healthRestrictions', [])
              }
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formState.hasHealthRestrictions ? 'bg-violet-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formState.hasHealthRestrictions ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Restrictions List */}
      {formState.hasHealthRestrictions && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {RESTRICTION_OPTIONS.map((option) => {
              const isSelected = formState.healthRestrictions.some((r) => r.type === option.type)

              return (
                <button
                  key={option.type}
                  onClick={() => toggleRestriction(option.type)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-violet-600 bg-violet-50'
                      : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <svg
                          className="w-5 h-5 text-violet-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
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

          {/* Other Description */}
          {hasOther && (
            <div className="mt-4">
              <label
                htmlFor="other-description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Please describe your health restriction
              </label>
              <textarea
                id="other-description"
                value={otherDescription}
                onChange={(e) => updateRestrictionDescription('other', e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                placeholder="Please provide details about your health restriction (minimum 10 characters)"
              />
              <p className="mt-1 text-sm text-gray-500 text-right">
                {otherDescription.length} / 500 characters
              </p>
            </div>
          )}

          {errors.healthRestrictions && (
            <p className="mt-2 text-sm text-red-600 text-center animate-fade-in">
              {errors.healthRestrictions}
            </p>
          )}
        </div>
      )}

      {!formState.hasHealthRestrictions && (
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-700 font-medium">
            ✓ No health restrictions - you're all set!
          </p>
        </div>
      )}
    </div>
  )
}
