import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getWorkouts, estimateCalories } from '../lib/workoutHelpers'
import type { LoggedWorkout } from '../types'
import { Calendar, ArrowRight, Zap, Clock, Trophy, Flame, BarChart2, X } from 'lucide-react'
import { WorkoutListModal } from '../components/workout/WorkoutListModal'
import {
  format,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  subDays,
  parseISO,
  differenceInCalendarDays,
  isToday,
} from 'date-fns'

export function Progress() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<LoggedWorkout[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCalorieModalOpen, setIsCalorieModalOpen] = useState(false)

  useEffect(() => {
    if (!user?.id) return

    const loadData = async () => {
      try {
        setLoading(true)
        const data = await getWorkouts(user.id, { limitCount: 1000 }) // Fetch more for strict stats
        setWorkouts(data)
      } catch (error) {
        console.error('Error loading progress data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user?.id])

  // Stats Calculations
  const stats = useMemo(() => {
    if (!workouts.length)
      return {
        weeklyDays: 0,
        weeklyMinutes: 0,
        totalWorkouts: 0,
        bestStreak: 0,
        currentStreak: 0,
        todayCalories: 0,
        streakDays: [],
        calorieHistory: [],
      }

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday start
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    // Weekly Stats
    const thisWeekWorkouts = workouts.filter(w =>
      isWithinInterval(new Date(w.date), { start: weekStart, end: weekEnd })
    )
    const weeklyUniqueDays = new Set(
      thisWeekWorkouts.map(w => format(new Date(w.date), 'yyyy-MM-dd'))
    ).size
    const weeklyMinutes = thisWeekWorkouts.reduce((acc, w) => acc + w.duration, 0)

    // Streaks
    // Get all unique dates sorted ascending
    const uniqueDates = Array.from(
      new Set(workouts.map(w => format(new Date(w.date), 'yyyy-MM-dd')))
    ).sort()

    // Best Streak
    let maxStreak = 0
    let tempStreak = 0
    let prevDate: Date | null = null

    uniqueDates.forEach(dateStr => {
      const currentDate = parseISO(dateStr)
      if (!prevDate) {
        tempStreak = 1
      } else {
        const diff = differenceInCalendarDays(currentDate, prevDate)
        if (diff === 1) {
          tempStreak++
        } else {
          tempStreak = 1
        }
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak
      prevDate = currentDate
    })

    // Current Streak
    let currentStreak = 0
    const todayStr = format(now, 'yyyy-MM-dd')
    const yesterdayStr = format(subDays(now, 1), 'yyyy-MM-dd')
    const lastWorkoutDate = uniqueDates[uniqueDates.length - 1]

    if (lastWorkoutDate === todayStr || lastWorkoutDate === yesterdayStr) {
      // Reverse iterate to find streak
      let streakCount = 0
      // If last workout was yesterday, verified by check above, logic handles it?
      // Let's iterate backwards from "streak reference date"

      // If last workout was today, start check from today.
      // If last workout was yesterday, start check from yesterday.

      const streakRef = lastWorkoutDate === todayStr ? 0 : 1

      // Check backwards
      for (let i = streakRef; i < 365; i++) {
        // Limit check to a year
        const d = subDays(now, i)
        const dStr = format(d, 'yyyy-MM-dd')
        if (uniqueDates.includes(dStr)) {
          streakCount++
        } else {
          break
        }
      }
      currentStreak = streakCount
    }

    // Calories
    const todayCalories = workouts
      .filter(w => format(new Date(w.date), 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd'))
      .reduce((acc, w) => acc + (w.calories || estimateCalories(w.type, w.duration)), 0)

    // Calorie History
    const historyMap = new Map<string, number>()
    workouts.forEach(w => {
      const c = w.calories || estimateCalories(w.type, w.duration)
      if (c > 0) {
        const d = format(new Date(w.date), 'yyyy-MM-dd')
        historyMap.set(d, (historyMap.get(d) || 0) + c)
      }
    })
    const calorieHistory = Array.from(historyMap.entries())
      .map(([date, calories]) => ({ date, calories }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 30)

    return {
      weeklyDays: weeklyUniqueDays,
      weeklyMinutes,
      totalWorkouts: workouts.length,
      bestStreak: maxStreak,
      currentStreak,
      todayCalories,
      calorieHistory,
    }
  }, [workouts])

  // 14 Day Streak Visual - Split into 2 rows
  const streakRows = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 13; i >= 0; i--) {
      days.push(subDays(today, i))
    }
    // Row 1: Days 13-7 ago (First 7 in the array)
    const row1 = days.slice(0, 7)
    // Row 2: Days 6-0 ago (Last 7 in the array, ending in today)
    const row2 = days.slice(7, 14)
    return { row1, row2 }
  }, [])

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
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-violet-500 to-violet-700 text-white pb-16 pt-8 px-4 rounded-b-3xl relative z-0">
        <div className="max-w-lg mx-auto">
          <Zap className="w-10 h-10 text-white fill-white mb-2" />
          <h1 className="text-2xl font-bold mb-1">Your Progress</h1>
          <p className="text-violet-200">Track your fitness journey</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-10 relative z-10 space-y-6">
        {/* Stats Overview Grid (2x2 Overlapping) */}
        <div className="bg-white rounded-2xl shadow-sm grid grid-cols-2 overflow-hidden">
          {/* Active Days (TL) */}
          <div className="p-4 border-r border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-100 flex-shrink-0 flex items-center justify-center text-violet-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Active Days</div>
              <div className="text-2xl font-bold text-gray-900 leading-none">
                {stats.weeklyDays}
                <span className="text-sm text-gray-400 font-normal">/7</span>
              </div>
            </div>
          </div>

          {/* Weekly Mins (TR) */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center text-orange-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Weekly Mins</div>
              <div className="text-2xl font-bold text-gray-900 leading-none">
                {stats.weeklyMinutes}
              </div>
            </div>
          </div>

          {/* Total Sessions (BL) */}
          <div className="p-4 border-r border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600">
              <BarChart2 className="w-5 h-5" />{' '}
              {/* BarChart equivalent in Lucide is BarChart or Activity often used */}
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Total Sessions</div>
              <div className="text-2xl font-bold text-gray-900 leading-none">
                {stats.totalWorkouts}
              </div>
            </div>
          </div>

          {/* Best Streak (BR) */}
          <div className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex-shrink-0 flex items-center justify-center text-emerald-600">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Best Streak</div>
              <div className="text-2xl font-bold text-gray-900 leading-none">
                {stats.bestStreak}
              </div>
            </div>
          </div>
        </div>

        {/* Workout Streak */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 pl-1">Workout Streak</h2>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">🔥</span>
              <span className="text-3xl font-bold text-gray-900">{stats.currentStreak}</span>
              <span className="text-gray-500 text-base">day streak</span>
            </div>

            {/* Calendar Visual - 2 Rows */}
            <div className="flex flex-col gap-4">
              {/* Row 1 (Older) */}
              <div className="flex justify-between px-1">
                {streakRows.row1.map(date => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const hasWorkout = workouts.some(
                    w => format(new Date(w.date), 'yyyy-MM-dd') === dateStr
                  )
                  const dayLabel = format(date, 'EEEEE')

                  return (
                    <div key={dateStr} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400 mb-1">{dayLabel}</span>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          hasWorkout ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {hasWorkout && (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              {/* Row 2 (Newer/Today) */}
              <div className="flex justify-between px-1">
                {streakRows.row2.map(date => {
                  const dateStr = format(date, 'yyyy-MM-dd')
                  const hasWorkout = workouts.some(
                    w => format(new Date(w.date), 'yyyy-MM-dd') === dateStr
                  )
                  const isTodayDate = isToday(date)
                  const dayLabel = format(date, 'EEEEE')

                  return (
                    <div key={dateStr} className="flex flex-col items-center gap-1">
                      <span className="text-xs text-gray-400 mb-1">{dayLabel}</span>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative ${
                          hasWorkout ? 'bg-emerald-500 text-white' : 'bg-gray-200'
                        }`}
                      >
                        {hasWorkout && (
                          <svg
                            className="w-4 h-4"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                        {isTodayDate && (
                          <div className="absolute inset-0 rounded-full border-2 border-violet-600 scale-110"></div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">Longest streak: {stats.bestStreak} days</p>
          </div>
        </div>

        {/* Calories Burned */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 pl-1">Calories Burned</h2>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-4xl font-bold text-gray-900">{stats.todayCalories}</span>
              <span className="text-xl text-gray-500">kcal</span>
              <span className="text-base text-gray-500">today</span>
              <span className="text-xl">🔥</span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-3 mb-2 relative overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((stats.todayCalories / 500) * 100, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mb-3">
              <span>0</span>
              <span>Daily Goal: 500 kcal</span>
            </div>

            <button
              onClick={() => setIsCalorieModalOpen(true)}
              className="text-gray-700 text-sm font-medium hover:underline"
            >
              View Calorie History →
            </button>
          </div>
        </div>

        {/* Workout History - KEEP FUNCTIONALITY EXACTLY AS IS */}
        <div>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Calendar className="w-5 h-5 text-violet-600" />
            <h2 className="text-lg font-bold text-gray-900">Workout History</h2>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-violet-600 border-t-transparent" />
              </div>
            ) : workouts.length > 0 ? (
              <>
                <div className="space-y-3">
                  {workouts.slice(0, 3).map(workout => (
                    <div
                      key={workout.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">{workout.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                            <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 capitalize">
                              {getWorkoutTypeLabel(workout.type)}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {workout.duration}m
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {format(new Date(workout.date), 'MMM d')}
                          </div>
                          <div className="text-xs text-gray-400">
                            {format(new Date(workout.date), 'h:mm a')}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {workouts.length > 3 && (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="w-full py-3.5 bg-white text-violet-600 font-semibold rounded-xl shadow-sm border border-gray-100 hover:bg-violet-50 transition flex items-center justify-center gap-2"
                  >
                    View All History
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-dashed border-gray-200">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-500 font-medium">No workouts yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Complete your first workout to see streaks!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 pb-2">
          <p className="text-xs text-gray-400">More analytics coming soon</p>
        </div>
      </div>

      {/* Workout History Modal */}
      <WorkoutListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Workout History"
        workouts={workouts}
        grouping={true}
      />

      {/* Calorie History Modal */}
      {isCalorieModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" /> Calorie History
              </h3>
              <button
                onClick={() => setIsCalorieModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-0 overflow-y-auto">
              {stats.calorieHistory.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {stats.calorieHistory.map(item => {
                    const date = parseISO(item.date)
                    const isTodayDate = isToday(date)
                    return (
                      <div
                        key={item.date}
                        className="flex items-center justify-between p-4 hover:bg-gray-50"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {isTodayDate ? 'Today' : format(date, 'EEEE, MMM d')}
                          </p>
                          <p className="text-xs text-gray-500">{format(date, 'MMMM yyyy')}</p>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-gray-900">
                          {item.calories}{' '}
                          <span className="text-xs font-normal text-gray-500">kcal</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500">No calorie data available yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
