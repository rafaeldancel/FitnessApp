import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { generateTodaysWorkout } from '../lib/workoutGenerator'
import { checkSessionCompletion } from '../lib/workoutHelpers'
import { ArrowLeft, CheckCircle2, Clock, Play } from 'lucide-react'

interface WorkoutDetailProps {
  onBack: () => void
  onStartWorkout: () => void
}

export function WorkoutDetail({ onBack, onStartWorkout }: WorkoutDetailProps) {
  const { user } = useAuth()

  const session = useMemo(() => {
    return generateTodaysWorkout(
      user?.fitnessGoals || [],
      user?.restDays || [],
      user?.healthRestrictions || []
    )
  }, [user?.fitnessGoals, user?.restDays, user?.healthRestrictions])

  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (user?.id) {
      checkSessionCompletion(user.id).then(setIsCompleted)
    }
  }, [user?.id])

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center h-14">
            <button
              onClick={onBack}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="ml-2 text-lg font-semibold text-gray-900">Today's Workout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Session Info */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{session.name}</h2>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm font-medium border border-violet-200">
              {session.goalLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500">
              <Clock className="w-4 h-4" />~{session.totalDuration} min
            </span>
          </div>
        </div>

        {/* Warm-Up Section */}
        {session.warmup.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-orange-50 border-b border-orange-100">
              <h3 className="text-sm font-semibold text-orange-700">
                🔥 Warm-Up · {session.warmup.length} exercises
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {session.warmup.map(ex => (
                <div
                  key={ex.id}
                  className={`flex items-center gap-3 px-5 py-3 border-l-4 border-orange-300 ${
                    isCompleted ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                      >
                        {ex.name}
                      </p>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{ex.muscleGroups.join(', ')}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                    {ex.defaultSets && ex.defaultReps
                      ? `${ex.defaultSets} × ${ex.defaultReps}`
                      : `${ex.durationMinutes}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Workout Section */}
        {session.mainExercises.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-violet-50 border-b border-violet-100">
              <h3 className="text-sm font-semibold text-violet-700">
                💪 Main Workout · {session.mainExercises.length} exercises
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {session.mainExercises.map(ex => (
                <div
                  key={ex.id}
                  className={`flex items-center gap-3 px-5 py-3 border-l-4 border-violet-400 ${
                    isCompleted ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                      >
                        {ex.name}
                      </p>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{ex.muscleGroups.join(', ')}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                    {ex.defaultSets && ex.defaultReps
                      ? `${ex.defaultSets} × ${ex.defaultReps}`
                      : `${ex.durationMinutes}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cool-Down Section */}
        {session.cooldown.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
              <h3 className="text-sm font-semibold text-blue-700">
                🧊 Cool-Down · {session.cooldown.length} exercises
              </h3>
            </div>
            <div className="divide-y divide-gray-100">
              {session.cooldown.map(ex => (
                <div
                  key={ex.id}
                  className={`flex items-center gap-3 px-5 py-3 border-l-4 border-blue-300 ${
                    isCompleted ? 'bg-gray-50' : ''
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm font-medium ${
                          isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                        }`}
                      >
                        {ex.name}
                      </p>
                      {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                    <p className="text-xs text-gray-500">{ex.muscleGroups.join(', ')}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                    {ex.defaultSets && ex.defaultReps
                      ? `${ex.defaultSets} × ${ex.defaultReps}`
                      : `${ex.durationMinutes}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="max-w-lg mx-auto">
          <button
            onClick={onStartWorkout}
            disabled={isCompleted}
            className={`w-full py-3.5 font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-md hover:shadow-lg'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Session Completed
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Start Workout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
