import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  getThisWeeksWorkouts,
  getWorkouts,
  calculateStreak,
  getTotalWorkoutCount,
} from '../lib/workoutHelpers'
import { Flame, Calendar, Clock, Target, Dumbbell, Plus } from 'lucide-react'
import type { LoggedWorkout } from '@repo/shared/schemas'

interface DashboardProps {
  onLogWorkout?: () => void
}

export function Dashboard({ onLogWorkout }: DashboardProps) {
  const { user, signOut } = useAuth()
  const [streak, setStreak] = useState(0)
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState<LoggedWorkout[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<LoggedWorkout[]>([])
  const [totalWorkouts, setTotalWorkouts] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      try {
        setLoading(true)
        const [streakData, weekData, recentData, totalCount] = await Promise.all([
          calculateStreak(user.id),
          getThisWeeksWorkouts(user.id),
          getWorkouts(user.id, { limitCount: 3 }),
          getTotalWorkoutCount(user.id),
        ])

        setStreak(streakData)
        setThisWeekWorkouts(weekData)
        setRecentWorkouts(recentData)
        setTotalWorkouts(totalCount)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

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

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday = date.toDateString() === today.toDateString()
    const isYesterday = date.toDateString() === yesterday.toDateString()

    if (isToday) return 'Today'
    if (isYesterday) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const thisWeekTime = thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0)
  const weeklyTarget = user?.weeklyTarget || 0

  // Count unique days with workouts this week
  const uniqueWorkoutDays = new Set(
    thisWeekWorkouts.map(w => w.date.toISOString().split('T')[0])
  ).size

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">FitSprint</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-800 text-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-2">
            Hey {user?.name || 'there'}! 👋
          </h2>
          {streak > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-6 h-6 text-orange-400" />
              <span className="text-xl font-semibold">{streak} day streak!</span>
            </div>
          )}
          <p className="text-violet-100">
            {uniqueWorkoutDays >= weeklyTarget
              ? "You've crushed your weekly goal! 🎉"
              : "Let's keep the momentum going!"}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* This Week */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              <span className="text-sm text-gray-600">This Week</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {uniqueWorkoutDays}
              <span className="text-lg text-gray-500">/{weeklyTarget}</span>
            </p>
          </div>

          {/* Total Workouts */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-5 h-5 text-violet-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalWorkouts}</p>
          </div>

          {/* Time This Week */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-violet-600" />
              <span className="text-sm text-gray-600">Time</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {thisWeekTime}
              <span className="text-lg text-gray-500">m</span>
            </p>
          </div>

          {/* Weekly Goal */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-violet-600" />
              <span className="text-sm text-gray-600">Goal</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{weeklyTarget}</p>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min((uniqueWorkoutDays / weeklyTarget) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Today's Workout CTA */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Ready to train?</h3>
          <p className="text-violet-100 mb-4">
            Log your workout and keep your streak alive!
          </p>
          <button
            onClick={onLogWorkout}
            className="w-full bg-white text-violet-600 font-semibold py-3 px-4 rounded-lg hover:bg-violet-50 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Log a Workout</span>
          </button>
        </div>

        {/* Recent Workouts */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Workouts</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-violet-600 border-t-transparent"></div>
            </div>
          ) : recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <Dumbbell className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{workout.name}</p>
                    <p className="text-sm text-gray-600">
                      {getWorkoutTypeLabel(workout.type)} • {workout.duration} min
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {formatDate(workout.date)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No workouts logged yet</p>
              <button
                onClick={onLogWorkout}
                className="text-violet-600 font-medium hover:text-violet-700 transition"
              >
                Log your first workout →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
