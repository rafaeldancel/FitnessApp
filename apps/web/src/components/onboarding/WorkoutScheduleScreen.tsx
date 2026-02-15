import type { OnboardingFormState, OnboardingFormErrors } from '../../hooks/useOnboardingForm'

interface WorkoutScheduleScreenProps {
  formState: OnboardingFormState
  errors: OnboardingFormErrors
  onUpdateField: <K extends keyof OnboardingFormState>(
    field: K,
    value: OnboardingFormState[K]
  ) => void
}

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

export function WorkoutScheduleScreen({
  formState,
  errors,
  onUpdateField,
}: WorkoutScheduleScreenProps) {
  const toggleRestDay = (day: number) => {
    const currentRestDays = formState.restDays
    if (currentRestDays.includes(day)) {
      onUpdateField(
        'restDays',
        currentRestDays.filter((d) => d !== day)
      )
    } else {
      onUpdateField('restDays', [...currentRestDays, day])
    }
  }

  const weeklyTarget = typeof formState.weeklyTarget === 'number' ? formState.weeklyTarget : 0
  const requiredRestDays = weeklyTarget > 0 ? 7 - weeklyTarget : 0
  const selectedRestDays = formState.restDays.length

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Plan your workout schedule</h2>
      <p className="text-gray-600 mb-6">
        Tell us how many days per week you want to work out
      </p>

      {/* Weekly Target Selector */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Workouts per week
        </label>
        <div className="grid grid-cols-7 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <button
              key={num}
              onClick={() => {
                onUpdateField('weeklyTarget', num)
                // Auto-clear rest days when target changes
                onUpdateField('restDays', [])
              }}
              className={`py-4 rounded-lg font-semibold text-lg transition-all ${
                formState.weeklyTarget === num
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-violet-100 hover:text-violet-700'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        {errors.weeklyTarget && (
          <p className="mt-2 text-sm text-red-600 animate-fade-in">{errors.weeklyTarget}</p>
        )}
      </div>

      {/* Rest Days Selector */}
      {weeklyTarget > 0 && weeklyTarget < 7 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select your rest days ({requiredRestDays} {requiredRestDays === 1 ? 'day' : 'days'})
          </label>

          {/* Status message */}
          <div className="mb-4 text-center">
            {selectedRestDays < requiredRestDays ? (
              <span className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Select {requiredRestDays - selectedRestDays} more rest{' '}
                {requiredRestDays - selectedRestDays === 1 ? 'day' : 'days'}
              </span>
            ) : selectedRestDays === requiredRestDays ? (
              <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                Perfect! ✓
              </span>
            ) : (
              <span className="inline-block px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                Too many rest days selected
              </span>
            )}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day) => {
              const isSelected = formState.restDays.includes(day.value)
              const isDisabled = !isSelected && selectedRestDays >= requiredRestDays

              return (
                <button
                  key={day.value}
                  onClick={() => toggleRestDay(day.value)}
                  disabled={isDisabled}
                  className={`py-4 rounded-lg font-medium transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white'
                      : isDisabled
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-violet-100 hover:text-violet-700'
                  }`}
                >
                  {day.label}
                </button>
              )
            })}
          </div>
          {errors.restDays && (
            <p className="mt-2 text-sm text-red-600 text-center animate-fade-in">
              {errors.restDays}
            </p>
          )}
        </div>
      )}

      {weeklyTarget === 7 && (
        <div className="p-4 bg-violet-50 border border-violet-200 rounded-lg">
          <p className="text-violet-700 text-center font-medium">
            💪 Training 7 days a week! Make sure to listen to your body.
          </p>
        </div>
      )}
    </div>
  )
}
