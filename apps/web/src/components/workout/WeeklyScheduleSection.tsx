import { useState, useEffect } from 'react'
import { Dumbbell, Moon } from 'lucide-react'
import { updateUserDocument } from '../../lib/authHelpers'
import type { User } from '../../types'

interface WeeklyScheduleSectionProps {
  user: User
  onUpdate: () => Promise<void>
}

export function WeeklyScheduleSection({ user, onUpdate }: WeeklyScheduleSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [target, setTarget] = useState(user.weeklyTarget || 3)
  const [selectedRestDays, setSelectedRestDays] = useState<number[]>(user.restDays || [])
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Sync state when entering edit mode or when props change
  useEffect(() => {
    if (!isEditing) {
      setTarget(user.weeklyTarget || 3)
      setSelectedRestDays(user.restDays || [])
    }
  }, [user, isEditing])

  const requiredRestDays = 7 - target
  const currentRestDaysCount = selectedRestDays.length
  const isValid = currentRestDaysCount === requiredRestDays

  const weekDays = [
    { label: 'Monday', short: 'Mon', index: 1 },
    { label: 'Tuesday', short: 'Tue', index: 2 },
    { label: 'Wednesday', short: 'Wed', index: 3 },
    { label: 'Thursday', short: 'Thu', index: 4 },
    { label: 'Friday', short: 'Fri', index: 5 },
    { label: 'Saturday', short: 'Sat', index: 6 },
    { label: 'Sunday', short: 'Sun', index: 0 },
  ]
  const todayIndex = new Date().getDay()

  const handleTargetChange = (newTarget: number) => {
    setTarget(newTarget)
    // Reset rest days when target changes to force re-selection (per prompt)
    setSelectedRestDays([])
  }

  const toggleRestDay = (dayIndex: number) => {
    if (!isEditing) return

    setSelectedRestDays(prev => {
      const isSelected = prev.includes(dayIndex)

      if (isSelected) {
        // Removing a rest day (making it active)
        return prev.filter(d => d !== dayIndex)
      } else {
        // Adding a rest day
        // Check if we hit the limit
        if (prev.length >= requiredRestDays) {
          setToast({
            type: 'error',
            message: `You can only have ${requiredRestDays} rest days with ${target} workout days`,
          })
          setTimeout(() => setToast(null), 3000)
          return prev
        }
        return [...prev, dayIndex]
      }
    })
  }

  const handleSave = async () => {
    if (!isValid) {
      setToast({ type: 'error', message: `Please select exactly ${requiredRestDays} rest days` })
      setTimeout(() => setToast(null), 3000)
      return
    }

    setIsSaving(true)
    setToast(null)
    try {
      await updateUserDocument(user.id, {
        weeklyTarget: target,
        restDays: selectedRestDays,
      })
      await onUpdate()
      setToast({ type: 'success', message: 'Schedule updated!' })
      setTimeout(() => setToast(null), 3000)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save schedule:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setToast(null)
    // State will reset via useEffect
  }

  // Calculate stats for view mode
  const activeDaysCount = 7 - (user.restDays?.length || 0)
  const restDaysCount = user.restDays?.length || 0

  return (
    <section
      aria-label="Weekly Schedule"
      className={`rounded-2xl shadow-sm p-4 relative overflow-hidden transition-colors ${isEditing ? 'bg-violet-50' : 'bg-white'}`}
    >
      {/* Toast Overlay */}
      {toast && (
        <div
          className={`absolute top-0 left-0 right-0 p-3 text-sm font-medium text-center z-20 ${
            toast.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Your Weekly Schedule</h2>
          {!isEditing && (
            <p className="text-xs text-cool-gray-500 font-medium mt-0.5">
              {activeDaysCount} active · {restDaysCount} rest
            </p>
          )}
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-full transition-colors"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      {/* Edit Mode: Target Selector */}
      {isEditing && (
        <div className="mb-6 bg-white p-4 rounded-xl border border-violet-100 shadow-sm">
          <label className="block text-sm font-bold text-gray-800 mb-3">
            How many days/week do you want to work out?
          </label>
          <div className="flex justify-between gap-1">
            {[1, 2, 3, 4, 5, 6, 7].map(num => (
              <button
                key={num}
                onClick={() => handleTargetChange(num)}
                aria-label={`Set target to ${num} days per week`}
                aria-pressed={target === num}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                  ${
                    target === num
                      ? 'bg-violet-600 text-white shadow-md scale-110'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }
                `}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Edit Mode: Helper Text */}
      {isEditing && (
        <div className="mb-2 px-1 flex justify-between items-center">
          <label className="text-sm font-semibold text-gray-700">
            Select your {requiredRestDays} rest days
          </label>
          <span className={`text-xs font-bold ${isValid ? 'text-emerald-600' : 'text-orange-500'}`}>
            {currentRestDaysCount}/{requiredRestDays} selected
          </span>
        </div>
      )}

      {/* Day Rows */}
      <div className="space-y-2.5">
        {weekDays.map(day => {
          // Logic differs between View and Edit modes
          // In Edit mode, use local state
          // In View mode, use prop state

          const isRestDay = isEditing
            ? selectedRestDays.includes(day.index)
            : (user.restDays || []).includes(day.index)

          const isTodayDay = day.index === todayIndex

          // Styles
          const activeStyles = 'bg-violet-50 border border-violet-100'
          const activeIconBg = 'bg-violet-100 text-violet-600'
          const activeBadge = 'bg-violet-100 text-violet-600'

          const restStyles = 'bg-gray-50 border border-gray-100'
          const restIconBg = 'bg-gray-100 text-gray-400'
          const restBadge = 'bg-gray-100 text-gray-400'

          const editHoverStyles = isEditing
            ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99]'
            : ''
          const selectedRing = isEditing && isRestDay ? 'ring-2 ring-gray-300' : ''

          // Today override for View mode mainly, but keep some indication in Edit
          const todayContainerStyles =
            !isEditing && isTodayDay ? 'bg-violet-100 border-2 border-violet-500' : ''

          return (
            <button
              key={day.label}
              onClick={() => toggleRestDay(day.index)}
              aria-label={`Toggle rest day for ${day.label}`}
              aria-pressed={isRestDay}
              disabled={!isEditing}
              className={`
                w-full h-14 flex items-center justify-between px-4 rounded-xl transition-all
                ${isRestDay ? restStyles : activeStyles}
                ${todayContainerStyles}
                ${editHoverStyles}
                ${selectedRing}
              `}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${isRestDay ? restIconBg : activeIconBg}`}
                >
                  {isRestDay ? (
                    <Moon className="w-4 h-4 fill-current" aria-hidden="true" />
                  ) : (
                    <Dumbbell className="w-4 h-4" aria-hidden="true" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold ${isRestDay ? 'text-gray-500' : 'text-gray-900'}`}
                  >
                    {day.label}
                  </span>
                  {!isEditing && isTodayDay && (
                    <span className="text-[10px] font-bold bg-violet-600 text-white px-2 py-0.5 rounded-full">
                      TODAY
                    </span>
                  )}
                </div>
              </div>

              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${isRestDay ? restBadge : activeBadge}`}
              >
                {isRestDay ? 'Rest' : 'Active'}
              </span>
            </button>
          )
        })}
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="mt-6 space-y-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !isValid}
            className={`
              w-full py-3 rounded-xl font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-2
              ${isValid ? 'bg-violet-600 hover:bg-violet-700 hover:shadow-md' : 'bg-gray-300 cursor-not-allowed'}
            `}
          >
            {isSaving ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>

          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </section>
  )
}
