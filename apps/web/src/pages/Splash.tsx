import { useEffect } from 'react'

interface SplashProps {
  onComplete: () => void
  isAuthenticated: boolean
}

export function Splash({ onComplete, isAuthenticated }: SplashProps) {
  useEffect(() => {
    // Shorter duration for authenticated users (1s), longer for new users (2s)
    const duration = isAuthenticated ? 1000 : 2000

    const timer = setTimeout(() => {
      onComplete()
    }, duration)

    return () => clearTimeout(timer)
  }, [onComplete, isAuthenticated])

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center animate-fade-in">
      <div className="text-center">
        {/* Lightning Bolt Icon */}
        <div className="inline-block animate-scale-up-bounce mb-6">
          <div className="relative">
            {/* Pulsing glow effect */}
            <div className="absolute inset-0 animate-pulse-glow">
              <svg
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-white opacity-30 blur-xl"
              >
                <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" />
              </svg>
            </div>
            {/* Main icon */}
            <svg
              width="100"
              height="100"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white relative"
            >
              <path
                d="M13 2L3 14h8l-1 8 10-12h-8l1-8z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl font-bold text-white tracking-wider animate-fade-in-delayed">
          FitSprint
        </h1>
      </div>
    </div>
  )
}
