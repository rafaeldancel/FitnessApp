import { useOnboardingForm } from '../hooks/useOnboardingForm'
import { useAuth } from '../hooks/useAuth'
import { completeOnboarding } from '../lib/authHelpers'
import { OnboardingLayout } from '../components/onboarding/OnboardingLayout'
import { WelcomeScreen } from '../components/onboarding/WelcomeScreen'
import { PersonalInfoScreen } from '../components/onboarding/PersonalInfoScreen'
import { FitnessGoalsScreen } from '../components/onboarding/FitnessGoalsScreen'
import { WorkoutScheduleScreen } from '../components/onboarding/WorkoutScheduleScreen'
import { HealthRestrictionsScreen } from '../components/onboarding/HealthRestrictionsScreen'
import { SummaryScreen } from '../components/onboarding/SummaryScreen'
import type { OnboardingData } from '../lib/authHelpers'

export function Onboarding() {
  const { user, refreshUser } = useAuth()
  const {
    formState,
    currentStep,
    errors,
    updateField,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
    clearDraft,
  } = useOnboardingForm(user?.id)

  const handleNext = () => {
    if (validateStep(currentStep)) {
      nextStep()
    }
  }

  const handleComplete = async (data: OnboardingData) => {
    if (!user?.id) {
      throw new Error('User not authenticated')
    }

    await completeOnboarding(user.id, data)
    clearDraft()

    // Refresh user state so App.tsx routing logic picks up onboardingComplete: true
    // and automatically redirects to Dashboard
    await refreshUser()
  }

  // Check if current step is valid before allowing next
  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 1: // Welcome - always valid
        return true
      case 2: // Personal Info
        return (
          formState.name.trim().length >= 2 &&
          formState.age !== '' &&
          formState.age >= 13 &&
          formState.age <= 120 &&
          formState.height !== '' &&
          formState.height > 0 &&
          formState.weight !== '' &&
          formState.weight > 0 &&
          formState.gender !== ''
        )
      case 3: // Fitness Goals
        return formState.fitnessGoals.length > 0 && formState.fitnessGoals.length <= 5
      case 4: {
        // Workout Schedule
        if (
          formState.weeklyTarget === '' ||
          formState.weeklyTarget < 1 ||
          formState.weeklyTarget > 7
        ) {
          return false
        }
        const requiredRestDays = 7 - Number(formState.weeklyTarget)
        return requiredRestDays === 0 || formState.restDays.length === requiredRestDays
      }
      case 5: // Health Restrictions
        if (formState.hasHealthRestrictions) {
          if (formState.healthRestrictions.length === 0) return false
          const otherRestriction = formState.healthRestrictions.find(r => r.type === 'other')
          if (
            otherRestriction &&
            (!otherRestriction.description || otherRestriction.description.trim().length < 10)
          ) {
            return false
          }
        }
        return true
      default:
        return true
    }
  }

  const renderScreen = () => {
    switch (currentStep) {
      case 1:
        return <WelcomeScreen />
      case 2:
        return (
          <PersonalInfoScreen formState={formState} errors={errors} onUpdateField={updateField} />
        )
      case 3:
        return (
          <FitnessGoalsScreen formState={formState} errors={errors} onUpdateField={updateField} />
        )
      case 4:
        return (
          <WorkoutScheduleScreen
            formState={formState}
            errors={errors}
            onUpdateField={updateField}
          />
        )
      case 5:
        return (
          <HealthRestrictionsScreen
            formState={formState}
            errors={errors}
            onUpdateField={updateField}
          />
        )
      case 6:
        return <SummaryScreen formState={formState} onEdit={goToStep} onComplete={handleComplete} />
      default:
        return null
    }
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      onBack={currentStep > 1 ? prevStep : undefined}
      onNext={currentStep < 6 ? handleNext : undefined}
      nextLabel={currentStep === 6 ? 'Complete Setup' : 'Next'}
      nextDisabled={!isCurrentStepValid()}
    >
      {renderScreen()}
    </OnboardingLayout>
  )
}
