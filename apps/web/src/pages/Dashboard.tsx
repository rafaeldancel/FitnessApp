import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getThisWeeksWorkouts,
  getLastWeeksWorkouts,
  getTodaysWorkouts,
  calculateStreak,
  checkSessionCompletion,
  getPlannedWorkouts,
} from '../lib/workoutHelpers';
import { generateTodaysWorkout } from '../lib/workoutGenerator';
import {
  Flame,
  Calendar,
  Clock,
  Target,
  Dumbbell,
  Plus,
  Zap,
  ChevronRight,
  Check,
} from 'lucide-react';
import { WorkoutListModal } from '../components/workout/WorkoutListModal';
import type { LoggedWorkout, FitnessGoal, PlannedWorkout } from '../types';

interface DashboardProps {
  onLogWorkout?: () => void;
  onViewWorkout?: () => void;
  onViewPlannedWorkout?: (id: string) => void;
}

export function Dashboard({ onLogWorkout, onViewWorkout, onViewPlannedWorkout }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [streak, setStreak] = useState(0);
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState<LoggedWorkout[]>([]);
  const [lastWeekWorkouts, setLastWeekWorkouts] = useState<LoggedWorkout[]>([]);
  const [recentWorkouts, setRecentWorkouts] = useState<LoggedWorkout[]>([]);
  const [isSessionCompleted, setIsSessionCompleted] = useState(false);
  const [plannedWorkout, setPlannedWorkout] = useState<PlannedWorkout | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [streakData, weekData, lastWeekData, recentData, sessionDone, plannedData] =
          await Promise.all([
            calculateStreak(user.id),
            getThisWeeksWorkouts(user.id),
            getLastWeeksWorkouts(user.id),
            getTodaysWorkouts(user.id),
            checkSessionCompletion(user.id),
            getPlannedWorkouts(user.id, new Date().toISOString().split('T')[0]),
          ]);

        setStreak(streakData);
        setThisWeekWorkouts(weekData);
        setLastWeekWorkouts(lastWeekData);
        setRecentWorkouts(recentData);
        setIsSessionCompleted(sessionDone);

        // Check if there is a planned workout for TODAY
        const todayStr = new Date().toISOString().split('T')[0];
        const todaysPlan = plannedData.find((p) => p.date === todayStr) || null;
        setPlannedWorkout(todaysPlan);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const thisWeekTime = thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0);
  const weeklyTarget = user?.weeklyTarget || 0;

  // Count unique days with workouts this week
  const uniqueWorkoutDays = new Set(
    thisWeekWorkouts.map((w) => new Date(w.date).toLocaleDateString())
  ).size;

  // Last week stats (for recap when this week is empty)
  const lastWeekTime = lastWeekWorkouts.reduce((sum, w) => sum + w.duration, 0);

  const showLastWeekRecap = uniqueWorkoutDays === 0 && lastWeekWorkouts.length > 0;

  // Guard progress bar against NaN when weeklyTarget is 0
  const goalProgress =
    weeklyTarget > 0 ? Math.min((uniqueWorkoutDays / weeklyTarget) * 100, 100) : 0;

  // Generate today's workout session (deterministic per day)
  const todaysSession = useMemo(() => {
    return generateTodaysWorkout(
      user?.fitnessGoals || [],
      user?.restDays || [],
      user?.healthRestrictions || []
    );
  }, [user?.fitnessGoals, user?.restDays, user?.healthRestrictions]);

  const GOAL_INFO: Record<FitnessGoal, { icon: string; label: string }> = {
    build_muscle: { icon: '💪', label: 'Build Muscle' },
    lose_weight: { icon: '🔥', label: 'Lose Weight' },
    improve_endurance: { icon: '🏃', label: 'Improve Endurance' },
    increase_flexibility: { icon: '🧘', label: 'Increase Flexibility' },
    general_fitness: { icon: '⭐', label: 'General Fitness' },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 w-full max-w-[430px] mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-violet-100 p-1.5 rounded-lg">
              <Zap className="w-5 h-5 text-violet-600" fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">FitSprint</span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-violet-800 text-white pt-6 pb-16 px-5 rounded-b-3xl relative overflow-hidden shadow-sm">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="relative z-10">
          <p className="text-violet-200 text-sm font-medium mb-1">Welcome back,</p>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold truncate mr-4">{user?.name}</h1>
            <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-sm">
              <Flame
                className={`w-4 h-4 ${streak > 0 ? 'text-orange-400 fill-orange-400' : 'text-gray-300'}`}
              />
              <span className="font-bold text-sm text-white">{streak} Day Streak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Overlapping Hero */}
      <div className="px-4 -mt-10 relative z-20 mb-6">
        <div className="grid grid-cols-2 gap-3">
          {/* This Week Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-violet-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">This Week</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{uniqueWorkoutDays}</span>
              <span className="text-sm text-gray-400">/ {weeklyTarget} days</span>
            </div>
            {/* Mini Progress Bar */}
            <div className="mt-2 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 rounded-full transition-all duration-500"
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
          </div>

          {/* Time Card */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Active Time</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">{thisWeekTime}</span>
              <span className="text-sm text-gray-400">min</span>
            </div>
            <div className="mt-2 text-xs text-green-600 font-medium">
              {showLastWeekRecap
                ? 'Start your week!'
                : lastWeekTime > 0
                  ? `${thisWeekTime > lastWeekTime ? '↑' : '↓'} vs last wk`
                  : 'Keep it up!'}
            </div>
          </div>

          {/* Total Workouts */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Dumbbell className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Total</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {recentWorkouts.length + (recentWorkouts.length === 10 ? '+' : '')}
              </span>
              <span className="text-sm text-gray-400">workouts</span>
            </div>
          </div>

          {/* Goal Target */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Target className="w-16 h-16 text-emerald-500" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-gray-500">Goal</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {(user?.fitnessGoals || []).slice(0, 2).map((goal) => (
                <span
                  key={goal}
                  className="text-[10px] bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded text-gray-600 whitespace-nowrap"
                >
                  {GOAL_INFO[goal]?.label.split(' ')[0] || goal}
                </span>
              ))}
              {(user?.fitnessGoals?.length || 0) > 2 && (
                <span className="text-[10px] text-gray-400">+{user!.fitnessGoals!.length - 2}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Workouts Section */}
      <div className="px-4 space-y-4">
        {(() => {
          const plannedDone = plannedWorkout?.completed ?? false;
          const suggestedDone = isSessionCompleted;
          const allDone = (plannedWorkout ? plannedDone : true) && suggestedDone;
          const exerciseCount =
            todaysSession.warmup.length +
            todaysSession.mainExercises.length +
            todaysSession.cooldown.length;

          // Rest day
          if (todaysSession.isRestDay && !plannedWorkout) {
            return (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  TODAY'S WORKOUTS
                </p>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
                  <p className="text-3xl mb-2">😴</p>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">Rest Day</h3>
                  <p className="text-gray-500 text-sm">Recovery is part of the journey</p>
                </div>
              </div>
            );
          }

          const cardBg =
            allDone && !todaysSession.isRestDay
              ? 'bg-green-50 border-green-200'
              : 'bg-white border-gray-100';

          return (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                TODAY'S WORKOUTS
              </p>
              <div className={`rounded-2xl shadow-sm border p-4 ${cardBg} transition-colors`}>
                {/* Planned Workout Row */}
                {plannedWorkout && (
                  <>
                    <div
                      onClick={() => plannedWorkout.id && onViewPlannedWorkout?.(plannedWorkout.id)}
                      className="flex items-center justify-between cursor-pointer group/planned py-1"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                          Planned
                        </span>
                        <h4 className="font-bold text-gray-900 mt-1 truncate">
                          {plannedWorkout.name}
                        </h4>
                        <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          {plannedWorkout.duration} min ·{' '}
                          <span className="capitalize">
                            {plannedWorkout.type.replace('_', ' ')}
                          </span>
                        </p>
                      </div>
                      {plannedDone ? (
                        <span className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                          <Check className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover/planned:text-gray-600 transition-colors flex-shrink-0" />
                      )}
                    </div>

                    {/* Divider */}
                    {!todaysSession.isRestDay && (
                      <div className="border-t border-gray-100 my-3"></div>
                    )}
                  </>
                )}

                {/* Suggested Workout Row */}
                {!todaysSession.isRestDay && (
                  <div
                    onClick={() => onViewWorkout?.()}
                    className="flex items-center justify-between py-1 cursor-pointer group/suggested"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                        Suggested
                      </span>
                      <h4 className="font-bold text-gray-900 mt-1">
                        {todaysSession.goalLabel?.replace(/^[^\s]+\s/, '') || 'General'}
                      </h4>
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        {todaysSession.totalDuration} min · {exerciseCount} Exercises
                      </p>
                      {suggestedDone ? (
                        <span className="text-emerald-600 text-sm font-medium mt-1.5 inline-flex items-center gap-1">
                          View workout <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewWorkout?.();
                          }}
                          className="text-violet-600 text-sm font-semibold mt-1.5 hover:text-violet-700 transition-colors"
                        >
                          Start Workout
                        </button>
                      )}
                    </div>
                    {suggestedDone ? (
                      <span className="flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap">
                        <Check className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover/suggested:text-gray-600 transition-colors flex-shrink-0" />
                    )}
                  </div>
                )}

                {/* All done message */}
                {allDone && !todaysSession.isRestDay && (
                  <p className="text-center text-emerald-600 text-sm font-semibold mt-3 pt-3 border-t border-green-200">
                    All done for today! 💪
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Log Workout Button */}
        <button
          onClick={onLogWorkout}
          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5 text-gray-500" />
          Log Other Workout
        </button>
      </div>

      {/* Recent Workouts */}
      <div className="px-4 mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg text-gray-900">Recent Workouts</h3>
          {recentWorkouts.length > 3 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              View All
            </button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white h-20 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentWorkouts.length > 0 ? (
          <div className="space-y-3">
            {recentWorkouts.slice(0, 3).map((workout) => (
              <div
                key={workout.id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{workout.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(workout.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {workout.duration} min
                      </span>
                      {workout.sessionSource && (
                        <span className="bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                          Session
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="text-xl">
                      {GOAL_INFO[workout.type as FitnessGoal]?.icon || '💪'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
              <Dumbbell className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm font-medium">No workouts yet</p>
            <p className="text-gray-400 text-xs text-center px-6 mt-1">
              Complete your first session or log a workout manually!
            </p>
          </div>
        )}
      </div>

      <WorkoutListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Recent Workouts"
        workouts={recentWorkouts}
      />
    </div>
  );
}
