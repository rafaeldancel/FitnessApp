interface OnboardingProgressProps {
  currentStep: number
  totalSteps?: number
}

const STEP_LABELS = [
  'Welcome',
  'Personal Info',
  'Fitness Goals',
  'Workout Schedule',
  'Health Info',
  'Summary',
]

export function OnboardingProgress({
  currentStep,
  totalSteps = 6,
}: OnboardingProgressProps) {
  return (
    <div className="w-full">
      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div
            key={step}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              step === currentStep
                ? 'bg-violet-600 scale-150'
                : step < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
            }`}
            aria-label={`Step ${step}${step === currentStep ? ' (current)' : step < currentStep ? ' (completed)' : ''}`}
          />
        ))}
      </div>

      {/* Current step label */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Step {currentStep} of {totalSteps}: {STEP_LABELS[currentStep - 1]}
        </p>
      </div>
    </div>
  )
}
