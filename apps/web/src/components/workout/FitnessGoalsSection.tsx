import { useState } from 'react'
import { Pencil, Check } from 'lucide-react'
import type { FitnessGoal } from '../../types'
import { updateUserDocument } from '../../lib/authHelpers'

interface FitnessGoalsSectionProps {
  initialGoals: FitnessGoal[]
  userId: string
  onUpdate: () => Promise<void>
}

const ALL_GOALS: { value: FitnessGoal; label: string; icon: string }[] = [
  { value: 'build_muscle', label: 'Build Muscle', icon: '💪' },
  { value: 'lose_weight', label: 'Lose Weight', icon: '🔥' },
  { value: 'improve_endurance', label: 'Improve Endurance', icon: '🏃' },
  { value: 'increase_flexibility', label: 'Increase Flexibility', icon: '🧘' },
  { value: 'general_fitness', label: 'General Fitness', icon: '⭐' },
]

export function FitnessGoalsSection({ initialGoals, userId, onUpdate }: FitnessGoalsSectionProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<FitnessGoal[]>(initialGoals)
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const toggleGoal = (goal: FitnessGoal) => {
    setSelectedGoals(prev => {
      const exists = prev.includes(goal)
      if (exists) {
        // Prevent removing the last goal
        if (prev.length === 1) {
          setToast({ type: 'error', message: 'You need at least one fitness goal' })
          setTimeout(() => setToast(null), 3000)
          return prev
        }
        return prev.filter(g => g !== goal)
      } else {
        return [...prev, goal]
      }
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    setToast(null)
    try {
      await updateUserDocument(userId, { fitnessGoals: selectedGoals })
      await onUpdate()
      setToast({
        type: 'success',
        message: 'Goals updated! Your workout suggestions will reflect your new goals.',
      })
      setTimeout(() => setToast(null), 3000)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to save goals:', error)
      setToast({ type: 'error', message: 'Failed to save changes. Please try again.' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setSelectedGoals(initialGoals)
    setIsEditing(false)
    setToast(null)
  }

  // Update local state if props change (e.g. external update)
  if (!isEditing && JSON.stringify(initialGoals) !== JSON.stringify(selectedGoals)) {
    setSelectedGoals(initialGoals)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          🎯 Your Fitness Goals
        </h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>

      {/* Toast Message */}
      {toast && (
        <div
          className={`
          absolute top-0 left-0 right-0 p-3 text-sm font-medium text-center z-10 transition-transform
          ${
            toast.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }
        `}
        >
          {toast.message}
        </div>
      )}

      {/* Goals List */}
      <div className="flex flex-wrap gap-2 mb-4">
        {ALL_GOALS.map(goal => {
          const isSelected = selectedGoals.includes(goal.value)
          const isInteractive = isEditing

          if (!isEditing && !isSelected) return null // Hide unselected in view mode

          return (
            <button
              key={goal.value}
              disabled={!isInteractive}
              onClick={() => toggleGoal(goal.value)}
              aria-pressed={isSelected}
              aria-label={
                isInteractive
                  ? isSelected
                    ? `Remove ${goal.label} goal`
                    : `Add ${goal.label} goal`
                  : undefined
              }
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all
                ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-sm ring-2 ring-transparent'
                    : 'bg-gray-50 text-gray-500 border border-dashed border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                }
                ${isInteractive ? 'cursor-pointer active:scale-95' : 'cursor-default'}
                ${isInteractive && isSelected ? 'hover:bg-violet-700' : ''}
              `}
            >
              <span>{goal.icon}</span>
              {goal.label}
              {isEditing && isSelected && <Check className="w-3 h-3 ml-1" />}
              {isEditing && !isSelected && <PlusIcon className="w-3 h-3 ml-1 opacity-50" />}
            </button>
          )
        })}
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="flex-1 py-2.5 text-gray-500 font-medium hover:text-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-[2] py-2.5 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
