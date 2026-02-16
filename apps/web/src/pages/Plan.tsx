import { useAuth } from '../hooks/useAuth'
import { Calendar, Dumbbell, Moon } from 'lucide-react'

export function Plan() {
  const { user } = useAuth()

  /* const weeklyTarget = user?.weeklyTarget || 3 */ // Unused for now
  const restDays = user?.restDays || [] // 0 = Sunday, 1 = Monday, etc.

  // Week starting Monday
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

  const activeDaysCount = 7 - restDays.length

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-800 text-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-2">Workout Plan</h1>
          <p className="text-violet-100">Your weekly schedule</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Weekly Schedule Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-violet-600" />
              Your Weekly Schedule
            </h2>
            <div className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
              <span className="text-violet-600">{activeDaysCount} active</span> · {restDays.length}{' '}
              rest
            </div>
          </div>

          <div className="space-y-3">
            {weekDays.map(day => {
              const isRestDay = restDays.includes(day.index)
              const isToday = day.index === todayIndex

              return (
                <div
                  key={day.label}
                  className={`
                    relative overflow-hidden rounded-xl p-4 flex items-center gap-4 transition-all
                    ${
                      isRestDay
                        ? 'bg-gray-100 border border-gray-200 text-gray-400'
                        : 'bg-white border-l-4 border-violet-500 shadow-sm'
                    }
                    ${isToday ? 'ring-2 ring-violet-400 ring-offset-2' : ''}
                  `}
                >
                  {/* Icon */}
                  <div
                    className={`
                    flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
                    ${isRestDay ? 'bg-gray-200' : 'bg-violet-100 text-violet-600'}
                  `}
                  >
                    {isRestDay ? <Moon className="w-5 h-5" /> : <Dumbbell className="w-5 h-5" />}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p
                        className={`font-semibold ${isRestDay ? 'text-gray-500' : 'text-gray-900'}`}
                      >
                        {day.label}
                        {isToday && (
                          <span className="ml-2 text-xs font-bold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                            Today
                          </span>
                        )}
                      </p>
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded border ${
                          isRestDay
                            ? 'bg-gray-50 text-gray-400 border-gray-200'
                            : 'bg-violet-50 text-violet-700 border-violet-100'
                        }`}
                      >
                        {isRestDay ? '😴 Rest' : '💪 Active'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 text-center opacity-75">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
            <Calendar className="w-6 h-6 text-gray-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Planning Tools Coming Soon</h2>
          <p className="text-sm text-gray-500">
            Soon you'll be able to customize your weekly routine and schedule specific workouts.
          </p>
        </div>
      </div>
    </div>
  )
}
