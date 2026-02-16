import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  getThisWeeksWorkouts,
  getLastWeeksWorkouts,
  getTodaysWorkouts,
  calculateStreak,
  checkSessionCompletion,
} from '../lib/workoutHelpers'
import { generateTodaysWorkout } from '../lib/workoutGenerator'
import {
  Flame,
  Calendar,
  Clock,
  Target,
  Dumbbell,
  Plus,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'
import { WorkoutListModal, WorkoutListItem } from '../components/WorkoutListModal'
import type { LoggedWorkout, FitnessGoal } from '@repo/shared/schemas'

interface DashboardProps {
  onLogWorkout?: () => void
  onViewWorkout?: () => void
}

export function Dashboard({ onLogWorkout, onViewWorkout }: DashboardProps) {
  const { user, signOut } = useAuth()
  const [streak, setStreak] = useState(0)
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState<LoggedWorkout[]>([])
  const [lastWeekWorkouts, setLastWeekWorkouts] = useState<LoggedWorkout[]>([])
  const [recentWorkouts, setRecentWorkouts] = useState<LoggedWorkout[]>([])
  const [isSessionCompleted, setIsSessionCompleted] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      try {
        setLoading(true)
        const [streakData, weekData, lastWeekData, recentData, sessionDone] = await Promise.all([
          calculateStreak(user.id),
          getThisWeeksWorkouts(user.id),
          getLastWeeksWorkouts(user.id),
          getTodaysWorkouts(user.id),
          checkSessionCompletion(user.id),
        ])

        setStreak(streakData)
        setThisWeekWorkouts(weekData)
        setLastWeekWorkouts(lastWeekData)
        setRecentWorkouts(recentData)
        setIsSessionCompleted(sessionDone)
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
  // Use toLocaleDateString to ensure we count based on local days, not UTC
  const uniqueWorkoutDays = new Set(thisWeekWorkouts.map(w => w.date.toLocaleDateString())).size

  // Last week stats (for recap when this week is empty)
  const lastWeekTime = lastWeekWorkouts.reduce((sum, w) => sum + w.duration, 0)
  const lastWeekUniqueDays = new Set(lastWeekWorkouts.map(w => w.date.toLocaleDateString())).size
  const showLastWeekRecap = uniqueWorkoutDays === 0 && lastWeekWorkouts.length > 0

  // Guard progress bar against NaN when weeklyTarget is 0
  const goalProgress =
    weeklyTarget > 0 ? Math.min((uniqueWorkoutDays / weeklyTarget) * 100, 100) : 0

  // Generate today's workout session (deterministic per day)
  const todaysSession = useMemo(() => {
    return generateTodaysWorkout(
      user?.fitnessGoals || [],
      user?.restDays || [],
      user?.healthRestrictions || []
    )
  }, [user?.fitnessGoals, user?.restDays, user?.healthRestrictions])

  const GOAL_INFO: Record<FitnessGoal, { icon: string; label: string }> = {
    build_muscle: { icon: '💪', label: 'Build Muscle' },
    lose_weight: { icon: '🔥', label: 'Lose Weight' },
    improve_endurance: { icon: '🏃', label: 'Improve Endurance' },
    increase_flexibility: { icon: '🧘', label: 'Increase Flexibility' },
    general_fitness: { icon: '⭐', label: 'General Fitness' },
  }

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
          <h2 className="text-3xl font-bold mb-2">Hey {user?.name || 'there'}! 👋</h2>
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

          {/* Workouts This Week */}
          <div className="bg-white rounded-xl shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Dumbbell className="w-5 h-5 text-violet-600" />
              <span className="text-sm text-gray-600">Workouts</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{thisWeekWorkouts.length}</p>
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
                  width: `${goalProgress}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Last Week Recap — shown when this week has no workouts yet */}
        {showLastWeekRecap && (
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium text-violet-700">Last Week Recap</span>
            </div>
            <p className="text-sm text-violet-600">
              {lastWeekUniqueDays} active {lastWeekUniqueDays === 1 ? 'day' : 'days'} ·{' '}
              {lastWeekWorkouts.length} {lastWeekWorkouts.length === 1 ? 'workout' : 'workouts'} ·{' '}
              {lastWeekTime}m total
            </p>
          </div>
        )}

        {/* Your Fitness Goals */}
        {user?.fitnessGoals && user.fitnessGoals.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Your Fitness Goals</h3>
            <div className="flex flex-wrap gap-2">
              {user.fitnessGoals.map(goal => {
                const info = GOAL_INFO[goal]
                return (
                  <span
                    key={goal}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-sm font-medium border border-violet-200"
                  >
                    <span>{info.icon}</span>
                    {info.label}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Today's Workout Session — animated glowing border */}
        <div className="glow-border-wrapper rounded-xl">
          <div className="bg-white rounded-xl p-5 relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-violet-600" />
              <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Workout Session</h3>
            </div>

            {todaysSession.isRestDay ? (
              <div className="text-center py-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                <p className="text-4xl mb-3">😴</p>
                <p className="text-xl font-bold text-gray-900 mb-1">Rest Day</p>
                <p className="text-gray-600">{todaysSession.restDayMessage}</p>
              </div>
            ) : (
              <button
                onClick={onViewWorkout}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-gray-50 hover:bg-violet-50 border border-gray-100 hover:border-violet-200 transition group text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-semibold transition ${
                        isSessionCompleted
                          ? 'text-gray-500 line-through'
                          : 'text-gray-900 group-hover:text-violet-700'
                      }`}
                    >
                      {todaysSession.name}
                    </p>
                    {isSessionCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{todaysSession.goalLabel}</p>
                </div>
                <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full whitespace-nowrap">
                  ~{todaysSession.totalDuration}m
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-500 transition flex-shrink-0" />
              </button>
            )}
          </div>
        </div>
        <style>{`
          .glow-border-wrapper {
            position: relative;
            padding: 2px;
            background: conic-gradient(
              from var(--glow-angle, 0deg),
              #8b5cf5, #a855f7, #6366f1, #8b5cf5
            );
            animation: glow-rotate 3.5s linear infinite, glow-pulse 3.5s ease-in-out infinite;
          }
          @property --glow-angle {
            syntax: "<angle>";
            initial-value: 0deg;
            inherits: false;
          }
          @keyframes glow-rotate {
            to { --glow-angle: 360deg; }
          }
          @keyframes glow-pulse {
            0%, 100% { box-shadow: 0 0 12px 2px rgba(139,92,246,0.25); }
            50% { box-shadow: 0 0 20px 4px rgba(139,92,246,0.4); }
          }
        `}</style>

        {/* Today's Workout CTA */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-bold mb-2">Ready to train?</h3>
          <p className="text-violet-100 mb-4">Log your workout and keep your streak alive!</p>
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
            <>
              <div className="space-y-3">
                {recentWorkouts.slice(0, 3).map(workout => (
                  <WorkoutListItem
                    key={workout.id}
                    workout={workout}
                    getTypeLabel={getWorkoutTypeLabel}
                    formatDate={formatDate}
                  />
                ))}
              </div>

              {recentWorkouts.length > 3 && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 text-sm font-medium text-violet-600 hover:bg-violet-50 rounded-lg transition"
                >
                  View All
                  <span className="bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded-full text-xs">
                    {recentWorkouts.length}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No workouts logged today</p>
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

      <WorkoutListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Recent Workouts"
        workouts={recentWorkouts}
        grouping={false}
      />
    </div>
  )
}
