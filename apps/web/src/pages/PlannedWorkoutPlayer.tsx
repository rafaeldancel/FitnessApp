import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getPlannedWorkoutById, markPlannedWorkoutComplete } from '../lib/workoutHelpers';
import { logWorkout } from '../lib/workoutHelpers';
import { CheckCircle2, Loader2, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react';
import type { PlannedWorkout } from '../types';

interface PlannedWorkoutPlayerProps {
  workoutId: string;
  onClose: () => void;
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

type Phase = 'warmup' | 'main' | 'cooldown';

interface FlatExercise {
  exercise: ExerciseItem;
  phase: Phase;
  indexInPhase: number;
  phaseTotal: number;
}

// Extract a time in seconds from the defaultReps field
function parseExerciseDuration(exercise: ExerciseItem): number {
  const reps = exercise.defaultReps || '';

  // 1) Timed exercises: "30 sec", "60 sec", "45-60 sec", "45 sec each side"
  const secMatch = reps.match(/(\d+)\s*sec/);
  if (secMatch) {
    const baseSec = parseInt(secMatch[1], 10);
    const sets = exercise.defaultSets || 1;
    return baseSec * sets;
  }

  // 2) Minute-based exercises: "20 min", "3 min rounds"
  const minMatch = reps.match(/(\d+)\s*min/);
  if (minMatch) {
    const baseMin = parseInt(minMatch[1], 10);
    const sets = exercise.defaultSets || 1;
    return baseMin * 60 * sets;
  }

  // 3) Set-based exercises — use durationMinutes estimate
  if (exercise.durationMinutes && exercise.durationMinutes > 0) {
    return exercise.durationMinutes * 60;
  }

  // 4) Absolute fallback
  return 60;
}

export function PlannedWorkoutPlayer({ workoutId, onClose }: PlannedWorkoutPlayerProps) {
  const { user } = useAuth();
  const [workout, setWorkout] = useState<PlannedWorkout | null>(null);
  const [loadingWorkout, setLoadingWorkout] = useState(true);

  useEffect(() => {
    if (!workoutId) return;
    setLoadingWorkout(true);
    getPlannedWorkoutById(workoutId)
      .then(setWorkout)
      .finally(() => setLoadingWorkout(false));
  }, [workoutId]);

  // Group exercises into phases
  const allExercises: FlatExercise[] = useMemo(() => {
    if (!workout?.exercises) return [];

    const warmup: ExerciseItem[] = [];
    const main: ExerciseItem[] = [];
    const cooldown: ExerciseItem[] = [];

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
      else main.push(item);
    });

    const list: FlatExercise[] = [];
    warmup.forEach((e, i) =>
      list.push({ exercise: e, phase: 'warmup', indexInPhase: i, phaseTotal: warmup.length })
    );
    main.forEach((e, i) =>
      list.push({ exercise: e, phase: 'main', indexInPhase: i, phaseTotal: main.length })
    );
    cooldown.forEach((e, i) =>
      list.push({ exercise: e, phase: 'cooldown', indexInPhase: i, phaseTotal: cooldown.length })
    );
    return list;
  }, [workout]);

  const totalExercises = allExercises.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exerciseTransition, setExerciseTransition] = useState<'enter' | 'exit' | 'idle'>('idle');

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const current = allExercises[currentIndex];

  // Phase label and color
  const phaseInfo: Record<Phase, { label: string; emoji: string; accent: string }> = {
    warmup: { label: 'Warm-Up', emoji: '🔥', accent: 'text-orange-400' },
    main: { label: 'Main Workout', emoji: '💪', accent: 'text-violet-300' },
    cooldown: { label: 'Cool-Down', emoji: '🧊', accent: 'text-blue-300' },
  };

  // Initialize timer for current exercise
  const initTimer = useCallback(
    (index: number) => {
      const ex = allExercises[index];
      if (!ex) return;
      setTimeLeft(parseExerciseDuration(ex.exercise));
      setIsResting(false);
      setIsRunning(true);
      setExerciseTransition('enter');
      setTimeout(() => setExerciseTransition('idle'), 300);
    },
    [allExercises]
  );

  // Initialize first exercise once workout loads
  useEffect(() => {
    if (allExercises.length > 0 && !loadingWorkout) {
      startTimeRef.current = Date.now();
      initTimer(0);
    }
  }, [allExercises.length, loadingWorkout, initTimer]);

  // Elapsed time tracker
  useEffect(() => {
    if (loadingWorkout || allExercises.length === 0) return;
    elapsedRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => {
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, [loadingWorkout, allExercises.length]);

  // Timer countdown
  useEffect(() => {
    if (isComplete) return;
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          if (isResting) {
            const nextIdx = currentIndex + 1;
            if (nextIdx >= totalExercises) {
              setIsComplete(true);
            } else {
              setCurrentIndex(nextIdx);
              initTimer(nextIdx);
            }
          } else {
            if (currentIndex >= totalExercises - 1) {
              setIsComplete(true);
            } else {
              setIsResting(true);
              setTimeLeft(30);
              setIsRunning(true);
            }
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isResting, currentIndex, totalExercises, isComplete, initTimer]);

  const goToExercise = (index: number) => {
    if (index < 0 || index >= totalExercises) return;
    setExerciseTransition('exit');
    setTimeout(() => {
      setCurrentIndex(index);
      initTimer(index);
    }, 150);
  };

  const handleNext = () => {
    if (currentIndex >= totalExercises - 1) {
      setIsComplete(true);
    } else {
      goToExercise(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      goToExercise(currentIndex - 1);
    }
  };

  const togglePause = () => setIsRunning(!isRunning);

  // Format seconds to mm:ss
  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (loadingWorkout || allExercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-900 via-violet-800 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-violet-400 border-t-transparent"></div>
          <p className="mt-4 text-violet-200">Loading workout...</p>
        </div>
      </div>
    );
  }

  // Timer circle progress
  const maxTime = isResting
    ? 30
    : parseExerciseDuration(current?.exercise || allExercises[0].exercise);
  const progress = maxTime > 0 ? ((maxTime - timeLeft) / maxTime) * 100 : 0;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Determine workout type for logging
  function mapCategory(
    cat: string | undefined
  ): 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'other' {
    if (['strength', 'cardio', 'hiit', 'flexibility', 'other'].includes(cat || '')) {
      return cat as 'strength' | 'cardio' | 'hiit' | 'flexibility' | 'other';
    }
    if (cat === 'compound') return 'strength';
    if (cat === 'warmup' || cat === 'cooldown') return 'flexibility';
    return 'other';
  }

  // Completion screen
  if (isComplete) {
    const totalMin = Math.max(1, Math.round(elapsedSeconds / 60));
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-900 via-violet-800 to-purple-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Confetti particles */}
        <div className="confetti-container absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2.5 + Math.random() * 2}s`,
                backgroundColor: ['#a78bfa', '#f59e0b', '#34d399', '#f472b6', '#60a5fa', '#fbbf24'][
                  i % 6
                ],
              }}
            />
          ))}
        </div>

        <div className="text-center z-10">
          <p className="text-6xl mb-4">🎉</p>
          <h1 className="text-3xl font-bold text-white mb-2">Workout Complete!</h1>
          <p className="text-violet-200 mb-8">Great job pushing through today</p>

          <div className="bg-white/10 backdrop-blur rounded-xl p-6 mb-8 border border-white/20">
            <p className="text-sm text-violet-300 mb-3 uppercase tracking-wider font-medium">
              {workout?.name || 'Planned Workout'}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-3xl font-bold text-white">{totalExercises}</p>
                <p className="text-xs text-violet-300">Exercises</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">
                  {totalMin}
                  <span className="text-lg">m</span>
                </p>
                <p className="text-xs text-violet-300">Duration</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 w-full max-w-xs mx-auto">
            <button
              onClick={async () => {
                if (!user?.id || !workout?.id) return;
                try {
                  setIsLogging(true);
                  // Log each exercise individually
                  const now = new Date();
                  const logPromises = allExercises.map((item) =>
                    logWorkout(user.id, {
                      name: item.exercise.name,
                      type: mapCategory(item.exercise.category),
                      duration: Math.max(1, Math.round(parseExerciseDuration(item.exercise) / 60)),
                      date: now,
                      notes: `Completed via Planned Workout: ${workout.name}`,
                      sessionSource: 'planned_workout',
                    })
                  );

                  try {
                    await Promise.all(logPromises);
                    console.log('✅ All planned exercises logged');
                  } catch (error) {
                    console.error('⚠️ Some exercises failed to log:', error);
                  }

                  // Mark planned workout as completed
                  await markPlannedWorkoutComplete(workout.id!);
                  console.log('✅ Planned workout marked complete');

                  onClose(); // Return to dashboard
                } catch (error) {
                  console.error('Failed to log planned session:', error);
                  setIsLogging(false);
                }
              }}
              disabled={isLogging}
              className="w-full py-3.5 bg-white text-violet-700 font-semibold rounded-lg hover:bg-violet-50 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLogging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Log This Session
                  <CheckCircle2 className="w-4 h-4" />
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full py-3.5 bg-white/10 border border-white/20 text-white font-medium rounded-lg hover:bg-white/20 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <style>{`
          .confetti-piece {
            position: absolute;
            top: -10px;
            width: 8px;
            height: 8px;
            border-radius: 2px;
            animation: confetti-fall linear forwards;
          }
          @keyframes confetti-fall {
            0% { transform: translateY(-10px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  const info = current ? phaseInfo[current.phase] : phaseInfo.warmup;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 via-violet-800 to-purple-900 flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onClose} className="p-2 text-white/70 hover:text-white transition">
          <X className="w-6 h-6" />
        </button>
        <span className="text-sm text-violet-300 font-medium">
          Exercise {currentIndex + 1} of {totalExercises}
        </span>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Progress bar */}
      <div className="px-4 mb-4">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-400 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalExercises) * 100}%` }}
          />
        </div>
      </div>

      {/* Phase label */}
      <div className="text-center mb-2">
        <span className={`text-sm font-semibold ${info.accent}`}>
          {info.emoji} {info.label}
        </span>
      </div>

      {/* Exercise Content */}
      <div
        className={`flex-1 flex flex-col items-center justify-center px-6 transition-all duration-200 ${
          exerciseTransition === 'enter'
            ? 'animate-fade-in'
            : exerciseTransition === 'exit'
              ? 'opacity-0 translate-y-2'
              : ''
        }`}
      >
        {isResting ? (
          <>
            <p className="text-violet-300 text-sm font-medium uppercase tracking-wider mb-2">
              Rest
            </p>
            <p className="text-white text-xl font-semibold mb-6">Get ready for next exercise</p>
          </>
        ) : (
          <>
            {/* Exercise name */}
            <h2 className="text-2xl font-bold text-white text-center mb-2">
              {current?.exercise.name}
            </h2>
            {/* Sets x reps */}
            <p className="text-violet-300 text-sm mb-3">
              {current?.exercise.defaultSets && current?.exercise.defaultReps
                ? `${current.exercise.defaultSets} × ${current.exercise.defaultReps}`
                : `${current?.exercise.durationMinutes}m`}
            </p>
            {/* Muscle group badges */}
            <div className="flex flex-wrap gap-1.5 justify-center mb-6">
              {current?.exercise.muscleGroups.map((mg) => (
                <span
                  key={mg}
                  className="text-xs px-2 py-0.5 bg-white/10 text-violet-200 rounded-full"
                >
                  {mg}
                </span>
              ))}
            </div>
          </>
        )}

        {/* Video placeholder */}
        {!isResting && (
          <div className="w-full max-w-sm aspect-video bg-gradient-to-br from-white/5 to-white/10 rounded-xl flex flex-col items-center justify-center mb-6 border border-white/10">
            <Play className="w-10 h-10 text-white/30 mb-2" />
            <p className="text-xs text-white/30 font-medium">Video coming soon</p>
          </div>
        )}

        {/* Circular Timer */}
        <div className="relative w-32 h-32 mb-6">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
            />
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke={isResting ? '#60a5fa' : '#a78bfa'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white font-mono">{formatTime(timeLeft)}</span>
            <span className="text-xs text-violet-300">{isResting ? 'rest' : 'remaining'}</span>
          </div>
        </div>

        {/* Play/Pause */}
        <button
          onClick={togglePause}
          className="w-14 h-14 rounded-full bg-white/15 border border-white/20 flex items-center justify-center text-white hover:bg-white/25 transition mb-6"
        >
          {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="px-4 pb-6 pt-2">
        <div className="max-w-sm mx-auto flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 py-3 rounded-lg text-sm font-medium transition
              text-white/70 bg-white/10 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed
              flex items-center justify-center gap-1"
          >
            <SkipBack className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNext}
            className="flex-[2] py-3 rounded-lg text-sm font-semibold transition
              bg-violet-500 text-white hover:bg-violet-400
              flex items-center justify-center gap-1"
          >
            {currentIndex >= totalExercises - 1 ? 'Finish' : 'Next Exercise'}
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
