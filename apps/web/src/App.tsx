import './style.css'
// Import Firebase to trigger emulator connection
import './lib/firebase'

import { useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { Splash } from './pages/Splash'
import { Welcome } from './pages/Welcome'
import { Auth } from './pages/Auth'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { LogWorkout } from './pages/LogWorkout'
import { Plan } from './pages/Plan'
import { Progress } from './pages/Progress'
import { ProtectedRoute } from './components/ProtectedRoute'
import { BottomNav } from './components/BottomNav'

export function App() {
  const { user, firebaseUser, loading } = useAuth() // ← CORRECTED: use 'user' not 'userDocument'
  const [splashComplete, setSplashComplete] = useState(false)
  const [showWelcome, setShowWelcome] = useState(true)
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'plan' | 'log' | 'progress'>('dashboard')

  // Show loading spinner while checking auth state (initial load)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show splash screen on first load
  if (!splashComplete) {
    return <Splash onComplete={() => setSplashComplete(true)} isAuthenticated={!!firebaseUser} />
  }

  // If user is authenticated, check onboarding status
  if (firebaseUser) {
    // Wait for user document to load
    if (!user) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your profile...</p>
          </div>
        </div>
      )
    }

    // If onboarding is not complete, show onboarding page
    if (!user.onboardingComplete) {
      return (
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      )
    }

    // If onboarding is complete, show main app with navigation
    const renderPage = () => {
      switch (currentPage) {
        case 'dashboard':
          return <Dashboard onLogWorkout={() => setCurrentPage('log')} />
        case 'log':
          return <LogWorkout onSuccess={() => setCurrentPage('dashboard')} />
        case 'plan':
          return <Plan />
        case 'progress':
          return <Progress />
        default:
          return <Dashboard onLogWorkout={() => setCurrentPage('log')} />
      }
    }

    return (
      <ProtectedRoute>
        {renderPage()}
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      </ProtectedRoute>
    )
  }

  // If user is not authenticated, show welcome page or auth page
  if (showWelcome) {
    return <Welcome onGetStarted={() => setShowWelcome(false)} />
  }

  // Show auth page
  return <Auth />
}
