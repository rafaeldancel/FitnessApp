import { Calendar } from 'lucide-react'

export function Plan() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-800 text-white py-8 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-bold mb-2">Workout Plan</h1>
          <p className="text-violet-100">Plan your weekly workouts</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-full mb-4">
            <Calendar className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Coming Soon
          </h2>
          <p className="text-gray-600">
            Workout planning features will be available here. You'll be able to schedule and manage your weekly workout routines.
          </p>
        </div>
      </div>
    </div>
  )
}
