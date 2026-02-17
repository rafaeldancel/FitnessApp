import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  getPlannedWorkouts,
  scheduleWorkout,
  deletePlannedWorkout,
  getWorkouts,
} from '../lib/workoutHelpers';
import { generateExercisesForTemplate, pickWarmup, pickCooldown } from '../lib/workoutGenerator';
import { exerciseLibrary, sessionTemplates, type Exercise } from '../lib/exerciseLibrary';
import { FitnessGoalsSection } from '../components/workout/FitnessGoalsSection';
import { WeeklyScheduleSection } from '../components/workout/WeeklyScheduleSection';
import type { PlannedWorkout, LoggedWorkout } from '../types';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Flame,
  Trash2,
  Clock,
  CheckCircle2,
  X,
  Zap,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';

export function Plan() {
  const { user, refreshUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [plannedWorkouts, setPlannedWorkouts] = useState<PlannedWorkout[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<LoggedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGoal, setSelectedGoal] = useState<
    | 'build_muscle'
    | 'lose_weight'
    | 'improve_endurance'
    | 'increase_flexibility'
    | 'general_fitness'
  >('build_muscle');
  const [creationMode, setCreationMode] = useState<'template' | 'custom'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [customName, setCustomName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const pastDate = new Date();
        pastDate.setMonth(pastDate.getMonth() - 6);
        const planned = await getPlannedWorkouts(user.id, pastDate.toISOString().split('T')[0]);
        const completed = await getWorkouts(user.id, { limitCount: 100 });

        setPlannedWorkouts(planned);
        setCompletedWorkouts(completed);
      } catch (error) {
        console.error('Error loading plan data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.id, currentDate]);

  // Calendar Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayIndex = monthStart.getDay() === 0 ? 6 : monthStart.getDay() - 1; // Mon=0, Sun=6

  // Weekly Schedule Logic moved to WeeklyScheduleSection component

  // Modal Logic
  const resetModal = () => {
    setStep(1);
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setSelectedGoal('build_muscle');
    setCreationMode('template');
    setSelectedTemplate(null);
    setCustomName('');
    setSelectedExercises([]);
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setIsSubmitting(true);
    try {
      let workoutName = '';
      let exercisesToSave: any[] = [];
      let estDuration = 0;
      let usedTemplate: string | null = null;

      if (creationMode === 'template' && selectedTemplate) {
        workoutName = selectedTemplate.name;
        usedTemplate = selectedTemplate.name;
        estDuration = selectedTemplate.duration;

        // Generate full exercise list for the template
        exercisesToSave = generateExercisesForTemplate(
          selectedGoal,
          selectedTemplate.name,
          user.healthRestrictions || []
        );
      } else {
        workoutName = customName || 'Custom Workout';
        usedTemplate = null; // Explicit null for Firestore

        // Tag selected exercises as 'main'
        const mainExercises = selectedExercises.map((e) => ({ ...e, category: 'main' }));

        // Auto-add warmup and cooldown
        // Get muscle groups from main exercises to pick relevant warmup/cooldown
        const mainMuscleGroups = [...new Set(mainExercises.flatMap((e) => e.muscleGroups))];
        const restrictions = user.healthRestrictions || [];

        // Pick 2-3 warmups and cooldowns
        const warmup = pickWarmup(['full body'], restrictions, Date.now()).map((e) => ({
          ...e,
          category: 'warmup',
        }));
        const cooldown = pickCooldown(mainMuscleGroups, restrictions, Date.now()).map((e) => ({
          ...e,
          category: 'cooldown',
        }));

        exercisesToSave = [...warmup, ...mainExercises, ...cooldown];

        // Calculate duration including warmup/cooldown (approx 10-15 mins extra)
        const mainDuration = mainExercises.reduce((acc, ex) => acc + (ex.durationMinutes || 0), 0);
        const extraDuration =
          warmup.reduce((acc, e) => acc + e.durationMinutes, 0) +
          cooldown.reduce((acc, e) => acc + e.durationMinutes, 0);

        estDuration = mainDuration + extraDuration;
        if (estDuration === 0) estDuration = 30;
      }

      await scheduleWorkout(user.id, {
        userId: user.id,
        date: selectedDate,
        type:
          selectedGoal === 'build_muscle'
            ? 'strength'
            : selectedGoal === 'lose_weight'
              ? 'hiit'
              : selectedGoal === 'improve_endurance'
                ? 'cardio'
                : selectedGoal === 'increase_flexibility'
                  ? 'flexibility'
                  : 'other',
        name: workoutName,
        templateUsed: usedTemplate || undefined,
        exercises: exercisesToSave,
        duration: estDuration,
        completed: false,
      });

      // Refresh list
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 6);
      const planned = await getPlannedWorkouts(user.id, pastDate.toISOString().split('T')[0]);
      setPlannedWorkouts(planned);

      resetModal();
    } catch (error) {
      console.error('Failed to schedule:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this planned workout?')) return;
    await deletePlannedWorkout(id);
    setPlannedWorkouts((prev) => prev.filter((w) => w.id !== id));
  };

  // Derived State
  const upcomingWorkouts = plannedWorkouts
    .filter((w) => new Date(w.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 7);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 relative">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-violet-500 to-violet-700 text-white pb-16 pt-8 px-4 rounded-b-3xl relative z-0">
        <div className="max-w-lg mx-auto">
          <Zap className="w-8 h-8 text-white fill-white mb-2" />
          <h1 className="text-2xl font-bold mb-1">Workout Plan</h1>
          <p className="text-violet-200">Your schedule & upcoming sessions</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-10 relative z-10 space-y-4">
        {/* Weekly Schedule Card */}
        {user && <WeeklyScheduleSection user={user} onUpdate={refreshUser} />}

        {/* Workout Calendar Card */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Workout Calendar</h2>
              <p className="text-sm font-semibold text-gray-900 mt-1">
                {format(currentDate, 'MMMM yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2 text-center">
            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day) => (
              <div key={day} className="text-xs font-medium text-gray-400">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2">
            {Array.from({ length: startDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {calendarDays.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isTodayDate = isToday(day);

              const hasCompleted = completedWorkouts.some(
                (w) => new Date(w.date).toISOString().split('T')[0] === dateStr
              );
              const hasPlanned = plannedWorkouts.some((w) => w.date === dateStr && !w.completed);

              // Overrides for status dots
              // Actually specific requirement:
              // Today: emerald-500 filled circle
              // Planned: violet-400 ring/outline
              // Completed: ... spec legend says "● Completed (emerald-500)"

              // If it's today, it gets the emerald fill.
              // If it's completed (not today), maybe emerald text or dot?
              // Let's interpret:
              // filled emerald = Completed OR Today (if active?)
              // The screenshot usually shows specific state.
              // Let's attempt to match common patterns:
              // Today = solid emerald circle
              // Planned = hollow violet circle
              // Completed = solid emerald dot? Or just use "Today" style for completed?

              // Re-reading spec:
              // "Today: emerald-500 filled circle, white text"
              // "Planned workout day: violet-400 ring/outline circle"
              // Legend: "● Completed" (emerald-500) and "○ Planned" (violet-400)

              // Let's implement:
              // Base: w-9 h-9 rounded-full flex items-center justify-center text-sm
              // Today: bg-emerald-500 text-white
              // Planned (not today): border-2 border-violet-400 text-violet-600
              // Completed (not today): Text emerald-500, maybe bold? Or a dot under it?
              // The legend implies a dot system might be better, or standard calendar coloring.
              // Let's place a small dot for completed if it's not today.

              return (
                <div
                  key={dateStr}
                  className="flex flex-col items-center justify-center relative h-12"
                >
                  <div
                    onClick={() => {
                      if (!hasCompleted) {
                        setSelectedDate(dateStr);
                        setIsModalOpen(true);
                      }
                    }}
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer
                      ${
                        isTodayDate
                          ? 'bg-emerald-500 text-white font-bold'
                          : hasPlanned
                            ? 'border-2 border-violet-400 text-gray-900 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    {format(day, 'd')}
                  </div>
                  {/* Status Dots for non-today days or additional info */}
                  <div className="flex gap-1 mt-1 h-1.5">
                    {!isTodayDate && hasCompleted && (
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pb-2 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Completed
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-violet-400"></div> Planned
            </div>
          </div>
        </div>

        {/* Fitness Goals Section */}
        {user && (
          <FitnessGoalsSection
            initialGoals={user.fitnessGoals || []}
            userId={user.id}
            onUpdate={refreshUser}
          />
        )}

        {/* Schedule Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3.5 border-2 border-violet-500 rounded-xl text-violet-600 font-semibold hover:bg-violet-50 transition flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Schedule a Workout
        </button>

        {/* Upcoming Workouts */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-3 ml-1">Upcoming Workouts</h3>

          {upcomingWorkouts.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <CalendarIcon className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-gray-500">No upcoming workouts planned.</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-violet-600 font-medium text-sm mt-1 hover:underline"
              >
                Schedule one now
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingWorkouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between relative overflow-hidden"
                >
                  {/* Violet Accent Bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-violet-500"></div>

                  <div className="pl-3">
                    <h4 className="font-semibold text-gray-900 text-sm">{workout.name}</h4>
                    {/* Optional: Date if not today? The design usually implies 'Today, 6:00 PM' etc. */}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{workout.duration} min</span>
                    </div>
                    {/* 
                     We could add time here if we had it, but for now duration is good.
                     The screenshot shows "Today, 6:00 PM", we just have date.
                     Let's format the date nicely. 
                    */}
                    <div className="text-xs text-gray-400 font-medium">
                      {isToday(parseISO(workout.date))
                        ? 'Today'
                        : format(parseISO(workout.date), 'MMM d')}
                    </div>

                    <button
                      onClick={() => workout.id && handleDelete(workout.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Modal Overlay - Unchanged structure, kept for functionality */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-violet-50/50">
              <h3 className="font-bold text-gray-900">Schedule Workout</h3>
              <button onClick={resetModal} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto">
              {/* Step 1: Date & Goal */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Filter by Goal
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'build_muscle',
                        'lose_weight',
                        'improve_endurance',
                        'increase_flexibility',
                        'general_fitness',
                      ].map((goal) => (
                        <button
                          key={goal}
                          onClick={() => setSelectedGoal(goal as any)}
                          className={`
                          px-3 py-1.5 rounded-full text-xs font-medium transition
                          ${
                            selectedGoal === goal
                              ? 'bg-violet-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }
                        `}
                        >
                          {goal.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition flex items-center gap-2"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Choose Custom or Template */}
              {step === 2 && (
                <div className="space-y-6">
                  {/* Tabs */}
                  <div className="flex p-1 bg-gray-100 rounded-lg">
                    <button
                      onClick={() => setCreationMode('template')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition ${creationMode === 'template' ? 'bg-white shadow text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Templates
                    </button>
                    <button
                      onClick={() => setCreationMode('custom')}
                      className={`flex-1 py-2 text-sm font-medium rounded-md transition ${creationMode === 'custom' ? 'bg-white shadow text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                      Custom Build
                    </button>
                  </div>

                  {/* Template List */}
                  {creationMode === 'template' && (
                    <div className="space-y-3 h-64 overflow-y-auto pr-1">
                      {sessionTemplates[selectedGoal]?.map((tmpl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTemplate(tmpl)}
                          className={`
                            w-full text-left p-3 rounded-xl border transition
                            ${
                              selectedTemplate?.name === tmpl.name
                                ? 'border-violet-600 bg-violet-50 ring-1 ring-violet-600'
                                : 'border-gray-200 hover:border-violet-300 hover:bg-gray-50'
                            }
                          `}
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-gray-900">{tmpl.name}</span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {tmpl.duration} min
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {tmpl.focus.join(', ')} • {tmpl.exerciseCount} exercises
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Custom Builder */}
                  {creationMode === 'custom' && (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Workout Name"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none text-sm"
                      />

                      <div className="h-48 overflow-y-auto pr-1 space-y-2 border-t border-gray-100 pt-2">
                        {(exerciseLibrary[selectedGoal] || []).map((ex) => {
                          const isSelected = selectedExercises.some((e) => e.id === ex.id);
                          return (
                            <div
                              key={ex.id}
                              onClick={() => {
                                if (isSelected)
                                  setSelectedExercises((prev) =>
                                    prev.filter((e) => e.id !== ex.id)
                                  );
                                else setSelectedExercises((prev) => [...prev, ex]);
                              }}
                              className={`
                                flex items-center p-2 rounded-lg cursor-pointer border
                                ${isSelected ? 'border-violet-500 bg-violet-50' : 'border-transparent hover:bg-gray-50'}
                              `}
                            >
                              <div
                                className={`w-4 h-4 rounded border mr-3 flex items-center justify-center ${isSelected ? 'bg-violet-600 border-violet-600' : 'border-gray-300'}`}
                              >
                                {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{ex.name}</p>
                                <p className="text-xs text-gray-500">
                                  {ex.defaultSets} × {ex.defaultReps}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 text-right">
                        {selectedExercises.length} exercises selected
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="text-gray-500 hover:text-gray-900 px-4"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={
                        (creationMode === 'template' && !selectedTemplate) ||
                        (creationMode === 'custom' &&
                          (!customName || selectedExercises.length === 0)) ||
                        isSubmitting
                      }
                      className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSubmitting ? 'Scheduling...' : 'Confirm & Schedule'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
