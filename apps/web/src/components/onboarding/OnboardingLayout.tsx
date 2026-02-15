import { ReactNode } from 'react'
import { OnboardingProgress } from './OnboardingProgress'

interface OnboardingLayoutProps {
  currentStep: number
  totalSteps?: number
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  nextDisabled?: boolean
  children: ReactNode
}

export function OnboardingLayout({
  currentStep,
  totalSteps = 6,
  onBack,
  onNext,
  nextLabel = 'Next',
  nextDisabled = false,
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 flex flex-col">
      {/* Progress indicator */}
      <div className="w-full bg-white border-b border-gray-100 py-6 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4">
          <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          <div className="animate-slide-up">{children}</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="w-full bg-white border-t border-gray-100 py-4 sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-4">
            {currentStep > 1 && onBack && (
              <button
                onClick={onBack}
                className="flex-1 py-3 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Back
              </button>
            )}
            {onNext && (
              <button
                onClick={onNext}
                disabled={nextDisabled}
                className={`${currentStep > 1 ? 'flex-1' : 'w-full'} py-3 px-4 rounded-lg font-medium transition ${
                  nextDisabled
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-violet-600 text-white hover:bg-violet-700'
                }`}
              >
                {nextLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
