import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { logWorkout } from '../lib/workoutHelpers'
import { CheckCircle2, Dumbbell } from 'lucide-react'
import type { WorkoutType } from '@repo/shared/schemas'

interface LogWorkoutProps {
  onSuccess?: () => void
}

export function LogWorkout({ onSuccess }: LogWorkoutProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    type: '' as WorkoutType | '',
    duration: '',
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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-800 text-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-2">Log Workout</h1>
          <p className="text-violet-100">Record your training session</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">Workout logged successfully!</p>
              <p className="text-sm text-green-700">Redirecting to dashboard...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          {/* Workout Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Workout Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.name
                  ? 'border-red-500 focus:ring-red-600'
                  : 'border-gray-300 focus:ring-violet-600'
              }`}
              placeholder="e.g., Morning Run, Chest Day"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.name}</p>
            )}
          </div>

          {/* Workout Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Workout Type *
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as WorkoutType })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.type
                  ? 'border-red-500 focus:ring-red-600'
                  : 'border-gray-300 focus:ring-violet-600'
              }`}
            >
              <option value="">Select type</option>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="hiit">HIIT</option>
              <option value="flexibility">Flexibility</option>
              <option value="other">Other</option>
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.type}</p>
            )}
          </div>

          {/* Duration and Calories */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (min) *
              </label>
              <input
                id="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                  errors.duration
                    ? 'border-red-500 focus:ring-red-600'
                    : 'border-gray-300 focus:ring-violet-600'
                }`}
                placeholder="30"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.duration}</p>
              )}
            </div>

            <div>
              <label htmlFor="calories" className="block text-sm font-medium text-gray-700 mb-2">
                Calories
              </label>
              <input
                id="calories"
                type="number"
                min="1"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
                placeholder="300"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition ${
                errors.date
                  ? 'border-red-500 focus:ring-red-600'
                  : 'border-gray-300 focus:ring-violet-600'
              }`}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.date}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 transition"
              placeholder="How did you feel? Any achievements or observations?"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Logging Workout...</span>
              </>
            ) : (
              <>
                <Dumbbell className="w-5 h-5" />
                <span>Log Workout</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
