import { useState } from 'react'

interface WelcomeProps {
  onGetStarted: () => void
}

export function Welcome({ onGetStarted }: WelcomeProps) {
  const [isExiting, setIsExiting] = useState(false)

  const handleGetStarted = () => {
    setIsExiting(true)
    // Wait for exit animation to complete before navigating
    setTimeout(() => {
      onGetStarted()
    }, 300)
  }

  const containerAnimation = isExiting ? 'animate-fade-out-up' : ''

  return (
    <div
      className={`h-full w-full bg-gradient-to-b from-gray-50 to-white flex justify-center pt-20 p-6 overflow-y-auto ${containerAnimation}`}
    >
      <div className="max-w-md w-full text-center pb-8">
        {/* Lightning Icon */}
        <div
          className="inline-block mb-8 opacity-0 animate-zoom-in-fade"
          style={{ animationDelay: '300ms' }}
        >
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center shadow-sm transform transition hover:scale-105 duration-300">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-violet-600"
            >
              <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" />
            </svg>
          </div>
        </div>

        {/* Main Heading */}
        <h1
          className="text-4xl font-bold text-gray-900 mb-4 opacity-0 animate-slide-up-fade"
          style={{ animationDelay: '400ms' }}
        >
          Welcome to FitSprint
        </h1>

        {/* Subheading */}
        <p
          className="text-lg text-gray-600 mb-10 max-w-xs mx-auto opacity-0 animate-slide-up-fade"
          style={{ animationDelay: '500ms' }}
        >
          Track your fitness journey, achieve your goals, and sprint towards a healthier you
        </p>

        {/* Feature Highlights */}
        <div className="space-y-4 mb-10 text-left">
          {/* Feature 1 */}
          <div
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 opacity-0 animate-slide-up-fade hover:shadow-md transition-shadow duration-300"
            style={{ animationDelay: '600ms' }}
          >
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 text-violet-600">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Track Progress</h3>
              <p className="text-sm text-gray-500">Monitor workouts & improvements</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 opacity-0 animate-slide-up-fade hover:shadow-md transition-shadow duration-300"
            style={{ animationDelay: '700ms' }}
          >
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 text-violet-600">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 20v-6M6 20V10M18 20V4" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Set Goals</h3>
              <p className="text-sm text-gray-500">Achieve your fitness milestones</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 opacity-0 animate-slide-up-fade hover:shadow-md transition-shadow duration-300"
            style={{ animationDelay: '800ms' }}
          >
            <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0 text-violet-600">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Stay Consistent</h3>
              <p className="text-sm text-gray-500">Build habits with weekly targets</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="opacity-0 animate-slide-up-fade" style={{ animationDelay: '900ms' }}>
          <button
            onClick={handleGetStarted}
            className="w-full bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg hover:shadow-violet-200 transform hover:-translate-y-0.5"
          >
            Get Started
          </button>
        </div>

        {/* Footer Text */}
        <p
          className="mt-6 text-xs text-gray-400 opacity-0 animate-slide-up-fade"
          style={{ animationDelay: '1000ms' }}
        >
          Join thousands of users achieving their fitness goals
        </p>
      </div>
    </div>
  )
}
