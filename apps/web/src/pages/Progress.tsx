import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getWorkouts } from '../lib/workoutHelpers'
import type { LoggedWorkout } from '@repo/shared/schemas'
import { TrendingUp, Calendar, ArrowRight } from 'lucide-react'
import { WorkoutListModal, WorkoutListItem } from '../components/WorkoutListModal'

export function Progress() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<LoggedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      try {
        setLoading(true)
        // Fetch all workouts for the modal (or a reasonable large limit like 50/100)
        // User requested "Scrollable list of ALL workouts inside the modal"
        const data = await getWorkouts(user.id, { limitCount: 100 })
        setWorkouts(data)
      } catch (error) {
        console.error('Error loading progress data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const getWorkoutTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      strength: 'Strength',
      cardio: 'Cardio',
      hiit: 'HIIT',
      flexibility: 'Flexibility',
      other: 'Other',
    }
    return labels[type] || type
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-800 text-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-2">Progress</h1>
          <p className="text-violet-100">Track your fitness journey</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-8">
        {/* Workout History */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-semibold text-gray-900">Workout History</h2>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-violet-600 border-t-transparent" />
              </div>
            ) : workouts.length > 0 ? (
              <>
                <div className="space-y-3">
                  {workouts.slice(0, 3).map(workout => (
                    <WorkoutListItem
                      key={workout.id}
                      workout={workout}
                      getTypeLabel={getWorkoutTypeLabel}
                      // For Progress preview, maybe we show relative date or full date?
                      // Dashboard uses formatDate (Today/Yesterday), let's render Date here too.
                      formatDate={d =>
                        d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      }
                    />
                  ))}
                </div>

                {workouts.length > 3 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3 bg-white text-violet-600 font-medium rounded-lg border border-gray-200 hover:bg-violet-50 transition flex items-center justify-center gap-2"
                  >
                    View All
                    <span className="bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full text-xs">
                      {workouts.length}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">
                  💪
                </div>
                <p className="text-gray-500">No workouts logged yet</p>
              </div>
            )}
          </div>
        </div>

        <WorkoutListModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Workout History"
          workouts={workouts}
          grouping={true}
        />

        {/* Coming Soon Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center opacity-75">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <TrendingUp className="w-6 h-6 text-gray-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">More Coming Soon</h2>
          <p className="text-sm text-gray-500">
            Charts, trends, and achievement tracking are on the way.
          </p>
        </div>
      </div>
    </div>
  )
}
