import { useState, useEffect } from 'react';
import { getPlannedWorkoutById } from '../lib/workoutHelpers';
import { ArrowLeft, CheckCircle2, Play } from 'lucide-react';
import type { PlannedWorkout } from '../types';

interface PlannedWorkoutDetailProps {
  workoutId: string;
  onBack: () => void;
  onStartWorkout: () => void;
}

interface ExerciseItem {
  id: string;
  name: string;
  muscleGroups: string[];
  defaultSets?: number;
  defaultReps?: string;
  durationMinutes?: number;
  category?: string;
}

export function PlannedWorkoutDetail({
  workoutId,
  onBack,
  onStartWorkout,
}: PlannedWorkoutDetailProps) {
  const [workout, setWorkout] = useState<PlannedWorkout | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workoutId) return;
    setLoading(true);
    getPlannedWorkoutById(workoutId)
      .then(setWorkout)
      .finally(() => setLoading(false));
  }, [workoutId]);

  const isCompleted = workout?.completed ?? false;

  // Group exercises by category into warmup, main, cooldown sections
  const warmup: ExerciseItem[] = [];
  const mainExercises: ExerciseItem[] = [];
  const cooldown: ExerciseItem[] = [];

  if (workout?.exercises) {
    workout.exercises.forEach((ex: ExerciseItem, idx: number) => {
      const item: ExerciseItem = {
        id: ex.id || `ex-${idx}`,
        name: ex.name || 'Unknown Exercise',
        muscleGroups: ex.muscleGroups || [],
        defaultSets: ex.defaultSets,
        defaultReps: ex.defaultReps,
        durationMinutes: ex.durationMinutes,
        category: ex.category,
      };
      if (ex.category === 'warmup') warmup.push(item);
      else if (ex.category === 'cooldown') cooldown.push(item);
      else mainExercises.push(item);
    });
  }

  // Shared exercise row renderer
  const renderExercise = (ex: ExerciseItem, borderColor: string, isLast: boolean) => (
    <div
      key={ex.id}
      className={`flex items-center gap-3 py-4 px-4 border-l-[3px] ${borderColor} ${
        isCompleted ? 'bg-gray-50/50' : ''
      } ${!isLast ? 'border-b border-gray-100' : ''}`}
      style={{ minHeight: '64px' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className={`text-base font-semibold ${
              isCompleted ? 'text-gray-400 line-through' : 'text-gray-900'
            }`}
          >
            {ex.name}
          </p>
          {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
        </div>
        <p className="text-sm text-gray-400 mt-0.5">{ex.muscleGroups.join(', ')}</p>
      </div>
      <span className="text-sm text-gray-500 whitespace-nowrap font-medium">
        {ex.defaultSets && ex.defaultReps
          ? `${ex.defaultSets} × ${ex.defaultReps}`
          : `${ex.durationMinutes}m`}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading workout...</p>
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center px-6">
        <p className="text-gray-500 text-lg mb-4">Workout not found</p>
        <button onClick={onBack} className="text-violet-600 font-semibold">
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  const typeLabel = workout.type.replace('_', ' ');

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-violet-500 to-violet-700 text-white rounded-b-3xl">
        {/* Top bar */}
        <div className="px-4 pt-4 pb-2">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h1 className="text-base font-semibold text-white">Planned Workout</h1>
          </div>
        </div>

        {/* Centered content */}
        <div className="text-center px-5 pt-4 pb-10">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white mx-auto mb-3"
          >
            <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" />
          </svg>
          <h2 className="text-2xl font-extrabold mb-3">{workout.name}</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium capitalize">
              📋 {typeLabel}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
              🕐 ~{workout.duration} min
            </span>
          </div>
        </div>
      </div>

      {/* Exercise List Card — overlaps hero */}
      <div className="px-4 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">
          {/* Completed banner */}
          {isCompleted && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 mb-1">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium text-green-700">
                Session completed! Great work 💪
              </span>
            </div>
          )}

          {/* Warm-Up Section */}
          {warmup.length > 0 && (
            <div>
              <div className="bg-amber-100 rounded-lg py-2.5 px-4 mb-2">
                <span className="text-base font-semibold text-amber-700">
                  🔥 Warm-Up - {warmup.length} exercises
                </span>
              </div>
              <div>
                {warmup.map((ex, i) =>
                  renderExercise(ex, 'border-amber-400', i === warmup.length - 1)
                )}
              </div>
            </div>
          )}

          {/* Main Workout Section */}
          {mainExercises.length > 0 && (
            <div>
              <div className="bg-violet-100 rounded-lg py-2.5 px-4 mb-2">
                <span className="text-base font-semibold text-violet-700">
                  💪 Main Workout - {mainExercises.length} exercises
                </span>
              </div>
              <div>
                {mainExercises.map((ex, i) =>
                  renderExercise(ex, 'border-violet-400', i === mainExercises.length - 1)
                )}
              </div>
            </div>
          )}

          {/* Cool-Down Section */}
          {cooldown.length > 0 && (
            <div>
              <div className="bg-blue-100 rounded-lg py-2.5 px-4 mb-2">
                <span className="text-base font-semibold text-blue-700">
                  🧊 Cool-Down - {cooldown.length} exercises
                </span>
              </div>
              <div>
                {cooldown.map((ex, i) =>
                  renderExercise(ex, 'border-blue-400', i === cooldown.length - 1)
                )}
              </div>
            </div>
          )}

          {/* Fallback: if no categories, show all as "Exercises" */}
          {warmup.length === 0 &&
            mainExercises.length === 0 &&
            cooldown.length === 0 &&
            workout.exercises.length > 0 && (
              <div>
                <div className="bg-violet-100 rounded-lg py-2.5 px-4 mb-2">
                  <span className="text-base font-semibold text-violet-700">
                    💪 Exercises - {workout.exercises.length} total
                  </span>
                </div>
                <div>
                  {(workout.exercises as ExerciseItem[]).map((ex, i) =>
                    renderExercise(
                      {
                        id: ex.id || `ex-${i}`,
                        name: ex.name || 'Exercise',
                        muscleGroups: ex.muscleGroups || [],
                        defaultSets: ex.defaultSets,
                        defaultReps: ex.defaultReps,
                        durationMinutes: ex.durationMinutes,
                      },
                      'border-violet-400',
                      i === workout.exercises.length - 1
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20">
        <div className="max-w-[430px] mx-auto bg-white/90 backdrop-blur-sm shadow-[0_-4px_12px_rgba(0,0,0,0.06)] px-5 py-3 pb-5">
          <button
            onClick={onStartWorkout}
            disabled={isCompleted}
            className={`w-full h-12 font-bold rounded-xl transition flex items-center justify-center gap-2 ${
              isCompleted
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-violet-500 to-violet-700 text-white shadow-md hover:shadow-lg active:shadow-sm'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Session Completed ✅
              </>
            ) : (
              <>
                <Play className="w-5 h-5" fill="currentColor" />
                Start Workout
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
