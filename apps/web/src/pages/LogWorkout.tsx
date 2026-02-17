import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logWorkout } from '../lib/workoutHelpers'
import { CheckCircle2, Dumbbell, Calendar } from 'lucide-react'
import type { WorkoutType } from '@repo/shared/schemas'

export interface WorkoutPrefillData {
  name?: string
  type?: string
  duration?: string
}

interface LogWorkoutProps {
  onSuccess?: () => void
  prefillData?: WorkoutPrefillData
}

const WORKOUT_TYPES: { value: WorkoutType; label: string; emoji: string }[] = [
  { value: 'strength', label: 'Strength', emoji: '💪' },
  { value: 'cardio', label: 'Cardio', emoji: '🏃' },
  { value: 'hiit', label: 'HIIT', emoji: '🔥' },
  { value: 'flexibility', label: 'Yoga', emoji: '🧘' },
  { value: 'other', label: 'Other', emoji: '➡️' },
]

export function LogWorkout({ onSuccess, prefillData }: LogWorkoutProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: prefillData?.name || '',
    type: (prefillData?.type || '') as WorkoutType | '',
    duration: prefillData?.duration || '',
    calories: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Workout name is required'
    }
    if (!formData.type) {
      newErrors.type = 'Workout type is required'
    }
    if (!formData.duration || Number(formData.duration) <= 0) {
      newErrors.duration = 'Duration must be greater than 0'
    }
    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) return
    if (!user?.id) {
      setError('You must be logged in to log a workout')
      return
    }

    setIsSubmitting(true)

    try {
      await logWorkout(user.id, {
        name: formData.name.trim(),
        type: formData.type as WorkoutType,
        duration: Number(formData.duration),
        calories: formData.calories ? Number(formData.calories) : undefined,
        date: new Date(formData.date),
        notes: formData.notes.trim(),
      })

      setShowSuccess(true)

      // Reset form
      setFormData({
        name: '',
        type: '',
        duration: '',
        calories: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      })

      // Hide success message and navigate after 2 seconds
      setTimeout(() => {
        setShowSuccess(false)
        if (onSuccess) onSuccess()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log workout')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputBase =
    'w-full h-12 px-4 border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-gray-900'
  const inputError =
    'w-full h-12 px-4 border border-red-400 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-gray-900'

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-500 to-violet-700 text-white px-5 pt-10 pb-16 rounded-b-3xl">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-white mb-4"
        >
          <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" />
        </svg>
        <h1 className="text-2xl font-bold mb-1">Log Workout</h1>
        <p className="text-violet-200 text-sm font-medium">Record your training session</p>
      </div>

      {/* Form Card — overlaps hero */}
      <div className="px-4 -mt-6 relative z-10">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Workout logged successfully!</p>
              <p className="text-sm text-green-700">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-5">
          {/* Workout Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Workout Name
            </label>
            <div className="relative">
              <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className={`${errors.name ? inputError : inputBase} pl-10`}
                placeholder="e.g., Morning Run"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.name}</p>
            )}
          </div>

          {/* Workout Type — Pill Buttons */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1.5">Workout Type</label>
            <div className="flex flex-wrap gap-2">
              {WORKOUT_TYPES.map(wt => (
                <button
                  key={wt.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: wt.value })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    formData.type === wt.value
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {wt.label} {wt.emoji}
                </button>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.type}</p>
            )}
          </div>

          {/* Duration & Calories — side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="duration"
                className="block text-sm font-semibold text-gray-800 mb-1.5"
              >
                Duration
              </label>
              <div className="relative">
                <input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  className={`${errors.duration ? inputError : inputBase} pr-12`}
                  placeholder="30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                  min
                </span>
              </div>
              {errors.duration && (
                <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.duration}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="calories"
                className="block text-sm font-semibold text-gray-800 mb-1.5"
              >
                Calories
              </label>
              <div className="relative">
                <input
                  id="calories"
                  type="number"
                  min="1"
                  value={formData.calories}
                  onChange={e => setFormData({ ...formData, calories: e.target.value })}
                  className={`${inputBase} pr-14`}
                  placeholder="300"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                  kcal
                </span>
              </div>
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className={`${errors.date ? inputError : inputBase} pl-10`}
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-xs text-red-600 animate-fade-in">{errors.date}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-semibold text-gray-800 mb-1.5">
              Notes
            </label>
            <textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition text-gray-900 resize-none"
              placeholder="How did you feel? Any achievements or observations?"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full h-14 rounded-xl font-bold text-white text-base transition-all shadow-md flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 active:bg-violet-800'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Logging Workout...</span>
              </>
            ) : (
              <span>Log Workout ✅</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
