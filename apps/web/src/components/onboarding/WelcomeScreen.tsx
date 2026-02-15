export function WelcomeScreen() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 text-center">
      {/* Icon */}
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white">
          <svg
            className="w-10 h-10"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Welcome to FitnessApp
      </h1>

      {/* Subtext */}
      <p className="text-lg text-gray-600 mb-2">
        Let's personalize your fitness journey
      </p>
      <p className="text-sm text-gray-500 mb-8">
        We'll ask you 6 quick questions to create a workout plan tailored just for you
      </p>

      {/* Features list */}
      <div className="max-w-md mx-auto mb-8 space-y-3 text-left">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-violet-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-gray-700">Personalized workout recommendations</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-violet-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-gray-700">Customized to your fitness goals</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-violet-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <span className="text-gray-700">Safe for your health conditions</span>
        </div>
      </div>

      {/* Time estimate */}
      <p className="text-sm text-gray-500 italic">
        Takes less than 2 minutes
      </p>
    </div>
  )
}
