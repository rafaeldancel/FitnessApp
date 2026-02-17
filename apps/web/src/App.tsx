import './style.css';
// Import Firebase to trigger emulator connection
import './lib/firebase';

import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { Splash } from './pages/Splash';
import { Welcome } from './pages/Welcome';
import { Auth } from './pages/Auth';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { LogWorkout } from './pages/LogWorkout';
import type { WorkoutPrefillData } from './pages/LogWorkout';
import { Plan } from './pages/Plan';
import { Progress } from './pages/Progress';
import { WorkoutDetail } from './pages/WorkoutDetail';
import { WorkoutPlayer } from './pages/WorkoutPlayer';
import { PlannedWorkoutDetail } from './pages/PlannedWorkoutDetail';
import { PlannedWorkoutPlayer } from './pages/PlannedWorkoutPlayer';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { BottomNav } from './components/layout/BottomNav';

export function App() {
  const { user, firebaseUser, loading } = useAuth(); // ← CORRECTED: use 'user' not 'userDocument'
  const [splashComplete, setSplashComplete] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentPage, setCurrentPage] = useState<
    | 'dashboard'
    | 'plan'
    | 'log'
    | 'progress'
    | 'workout-detail'
    | 'workout-player'
    | 'planned-workout-detail'
    | 'planned-workout-player'
  >('dashboard');
  const [logPrefillData, setLogPrefillData] = useState<WorkoutPrefillData | undefined>(undefined);
  const [plannedWorkoutId, setPlannedWorkoutId] = useState<string | null>(null);

  // Show loading spinner while checking auth state (initial load)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show splash screen on first load
  // Show splash screen on first load
  if (!splashComplete) {
    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-white relative shadow-2xl overflow-hidden">
        <Splash onComplete={() => setSplashComplete(true)} isAuthenticated={!!firebaseUser} />
      </div>
    );
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
      );
    }

    // If onboarding is not complete, show onboarding page
    if (!user.onboardingComplete) {
      return (
        <div className="max-w-[430px] mx-auto min-h-screen bg-white relative shadow-2xl overflow-hidden">
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        </div>
      );
    }

    // If onboarding is complete, show main app with navigation
    const renderPage = () => {
      switch (currentPage) {
        case 'dashboard':
          return (
            <Dashboard
              onLogWorkout={() => {
                setLogPrefillData(undefined);
                setCurrentPage('log');
              }}
              onViewWorkout={() => setCurrentPage('workout-detail')}
              onViewPlannedWorkout={(id: string) => {
                setPlannedWorkoutId(id);
                setCurrentPage('planned-workout-detail');
              }}
            />
          );
        case 'log':
          return (
            <LogWorkout
              onSuccess={() => {
                setLogPrefillData(undefined);
                setCurrentPage('dashboard');
              }}
              prefillData={logPrefillData}
            />
          );
        case 'plan':
          return <Plan />;
        case 'progress':
          return <Progress />;
        case 'workout-detail':
          return (
            <WorkoutDetail
              onBack={() => setCurrentPage('dashboard')}
              onStartWorkout={() => setCurrentPage('workout-player')}
            />
          );
        case 'workout-player':
          return <WorkoutPlayer onClose={() => setCurrentPage('dashboard')} />;
        case 'planned-workout-detail':
          return (
            <PlannedWorkoutDetail
              workoutId={plannedWorkoutId || ''}
              onBack={() => setCurrentPage('dashboard')}
              onStartWorkout={() => setCurrentPage('planned-workout-player')}
            />
          );
        case 'planned-workout-player':
          return (
            <PlannedWorkoutPlayer
              workoutId={plannedWorkoutId || ''}
              onClose={() => setCurrentPage('dashboard')}
            />
          );
        default:
          return (
            <Dashboard
              onLogWorkout={() => {
                setLogPrefillData(undefined);
                setCurrentPage('log');
              }}
              onViewWorkout={() => setCurrentPage('workout-detail')}
              onViewPlannedWorkout={(id: string) => {
                setPlannedWorkoutId(id);
                setCurrentPage('planned-workout-detail');
              }}
            />
          );
      }
    };

    const showBottomNav = ![
      'workout-detail',
      'workout-player',
      'planned-workout-detail',
      'planned-workout-player',
    ].includes(currentPage);

    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-white relative shadow-2xl overflow-hidden">
        <ProtectedRoute>
          {renderPage()}
          {showBottomNav && (
            <BottomNav
              currentPage={currentPage as 'dashboard' | 'plan' | 'log' | 'progress'}
              onNavigate={(page) => {
                setLogPrefillData(undefined);
                setCurrentPage(page);
              }}
            />
          )}
        </ProtectedRoute>
      </div>
    );
  }

  // If user is not authenticated, show welcome page or auth page
  if (showWelcome) {
    return (
      <div className="max-w-[430px] mx-auto min-h-screen bg-white relative shadow-2xl overflow-hidden">
        <Welcome onGetStarted={() => setShowWelcome(false)} />
      </div>
    );
  }

  // Show auth page
  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-white relative shadow-2xl overflow-hidden">
      <Auth />
    </div>
  );
}
