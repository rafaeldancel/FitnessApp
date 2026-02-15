import type { OnboardingFormState, OnboardingFormErrors } from '../../hooks/useOnboardingForm'
import type { Gender } from '@repo/shared/schemas'

interface PersonalInfoScreenProps {
  formState: OnboardingFormState
  errors: OnboardingFormErrors
  onUpdateField: <K extends keyof OnboardingFormState>(
    field: K,
    value: OnboardingFormState[K]
  ) => void
}

export function PersonalInfoScreen({
  formState,
  errors,
  onUpdateField,
}: PersonalInfoScreenProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Tell us about yourself</h2>
      <p className="text-gray-600 mb-6">
        This helps us create a personalized workout plan
      </p>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={formState.name}
            onChange={(e) => onUpdateField('name', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
              errors.name
                ? 'border-red-500 focus:ring-red-600'
                : 'border-gray-300 focus:ring-violet-600'
            }`}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.name}</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            id="age"
            type="number"
            value={formState.age}
            onChange={(e) =>
              onUpdateField('age', e.target.value ? parseInt(e.target.value) : '')
            }
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
              errors.age
                ? 'border-red-500 focus:ring-red-600'
                : 'border-gray-300 focus:ring-violet-600'
            }`}
            placeholder="25"
            min="13"
            max="120"
          />
          {errors.age && (
            <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.age}</p>
          )}
        </div>

        {/* Height and Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Height */}
          <div>
            <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
              Height (cm)
            </label>
            <input
              id="height"
              type="number"
              value={formState.height}
              onChange={(e) =>
                onUpdateField('height', e.target.value ? parseFloat(e.target.value) : '')
              }
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.height
                  ? 'border-red-500 focus:ring-red-600'
                  : 'border-gray-300 focus:ring-violet-600'
              }`}
              placeholder="170"
              min="0"
              step="0.1"
            />
            {errors.height && (
              <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.height}</p>
            )}
          </div>

          {/* Weight */}
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              Weight (kg)
            </label>
            <input
              id="weight"
              type="number"
              value={formState.weight}
              onChange={(e) =>
                onUpdateField('weight', e.target.value ? parseFloat(e.target.value) : '')
              }
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.weight
                  ? 'border-red-500 focus:ring-red-600'
                  : 'border-gray-300 focus:ring-violet-600'
              }`}
              placeholder="70"
              min="0"
              step="0.1"
            />
            {errors.weight && (
              <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.weight}</p>
            )}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            id="gender"
            value={formState.gender}
            onChange={(e) => onUpdateField('gender', e.target.value as Gender)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
              errors.gender
                ? 'border-red-500 focus:ring-red-600'
                : 'border-gray-300 focus:ring-violet-600'
            }`}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.gender}</p>
          )}
        </div>
      </div>
    </div>
  )
}
