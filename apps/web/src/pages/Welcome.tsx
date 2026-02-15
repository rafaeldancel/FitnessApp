interface WelcomeProps {
  onGetStarted: () => void
}

export function Welcome({ onGetStarted }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center animate-slide-up">
        {/* Lightning Icon */}
        <div className="inline-block mb-8">
          <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
            <svg
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-violet-600"
            >
              <path
                d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Welcome to FitSprint
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-600 mb-12 max-w-lg mx-auto">
          Track your fitness journey, achieve your goals, and sprint towards a healthier you
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
          {/* Feature 1 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-violet-600"
              >
                <path
                  d="M22 12h-4l-3 9L9 3l-3 9H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Track Progress</h3>
            <p className="text-sm text-gray-600">
              Monitor your workouts and see your improvements
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-violet-600"
              >
                <path
                  d="M22 12h-4l-3 9L9 3l-3 9H2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points="23 6 13.5 15.5 8.5 10.5 1 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Set Goals</h3>
            <p className="text-sm text-gray-600">
              Define targets and achieve your fitness milestones
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
            <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-violet-600"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M12 6v6l4 2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Stay Consistent</h3>
            <p className="text-sm text-gray-600">
              Build habits with weekly workout targets
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onGetStarted}
          className="bg-violet-600 hover:bg-violet-700 text-white font-semibold text-lg px-12 py-4 rounded-xl transition shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Get Started
        </button>

        {/* Footer Text */}
        <p className="mt-8 text-sm text-gray-500">
          Join thousands of users achieving their fitness goals
        </p>
      </div>
    </div>
  )
}
