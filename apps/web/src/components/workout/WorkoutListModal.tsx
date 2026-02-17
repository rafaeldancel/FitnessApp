import { useState, useMemo } from 'react';
import { X, Dumbbell, Clock } from 'lucide-react';
import type { LoggedWorkout } from '../../types';

interface WorkoutListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  workouts: LoggedWorkout[];
  grouping?: boolean; // true for History (Progress), false for Recent (Dashboard)
}

export function WorkoutListModal({
  isOpen,
  onClose,
  title,
  workouts,
  grouping = false,
}: WorkoutListModalProps) {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isClosing, setIsClosing] = useState(false);

  // Handle closing animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300); // Match animation duration
  };

  // Sort workouts
  const sortedWorkouts = useMemo(() => {
    return [...workouts].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [workouts, sortOrder]);

  // Group workouts by date (if grouping is enabled)
  const groupedWorkouts = useMemo(() => {
    if (!grouping) return null;

    const groups: Record<string, LoggedWorkout[]> = {};
    sortedWorkouts.forEach((w) => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey = w.date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

      if (w.date.toDateString() === today.toDateString()) {
        dateKey = 'Today';
      } else if (w.date.toDateString() === yesterday.toDateString()) {
        dateKey = 'Yesterday';
      }

      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(w);
    });
    return groups;
  }, [sortedWorkouts, grouping]);

  const getWorkoutTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      strength: 'Strength',
      cardio: 'Cardio',
      hiit: 'HIIT',
      flexibility: 'Flexibility',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (!isOpen && !isClosing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen && !isClosing ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`fixed bottom-0 left-0 right-0 bg-white z-50 rounded-t-xl h-[85vh] flex flex-col transform transition-transform duration-300 ease-out shadow-xl ${
          isOpen && !isClosing ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Header */}
        <div className="flex bg-white items-center justify-between p-4 border-b border-gray-100 rounded-t-xl sticky top-0 z-10">
          <h3 id="modal-title" className="text-lg font-bold text-gray-900">
            {title}
          </h3>

          <div className="flex items-center gap-2">
            {/* Sort Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSortOrder('newest')}
                aria-pressed={sortOrder === 'newest'}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  sortOrder === 'newest'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortOrder('oldest')}
                aria-pressed={sortOrder === 'oldest'}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  sortOrder === 'oldest'
                    ? 'bg-white text-violet-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Oldest
              </button>
            </div>

            <button
              onClick={handleClose}
              className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-lg mx-auto space-y-4">
            {grouping && groupedWorkouts ? (
              // Grouped Layout
              Object.entries(groupedWorkouts).map(([date, items]) => (
                <div key={date}>
                  <h4 className="text-sm font-semibold text-gray-500 mb-2 sticky top-0 bg-gray-50 py-1 z-10">
                    {date}
                  </h4>
                  <div className="space-y-3">
                    {items.map((workout) => (
                      <WorkoutListItem
                        key={workout.id}
                        workout={workout}
                        getTypeLabel={getWorkoutTypeLabel}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Flat Layout
              <div className="space-y-3">
                {sortedWorkouts.map((workout) => (
                  <WorkoutListItem
                    key={workout.id}
                    workout={workout}
                    getTypeLabel={getWorkoutTypeLabel}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}

            {sortedWorkouts.length === 0 && (
              <div className="text-center py-10">
                <p className="text-gray-500">No workouts found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Sub-component for individual item
export function WorkoutListItem({
  workout,
  getTypeLabel,
  formatDate,
}: {
  workout: LoggedWorkout;
  getTypeLabel: (t: string) => string;
  formatDate?: (d: Date) => string;
}) {
  const isSession = workout.sessionSource === 'daily_workout';

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
      {/* Icon/Avatar */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mt-0.5 ${
          isSession ? 'bg-violet-100 text-violet-600' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {isSession ? <span className="text-sm">✅</span> : <Dumbbell className="w-5 h-5" />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-gray-900 leading-tight truncate">{workout.name}</p>
            <p className="text-xs text-gray-500 mt-1 capitalize">{getTypeLabel(workout.type)}</p>
          </div>

          {/* Badge */}
          {isSession ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-violet-50 text-violet-700 border border-violet-100 whitespace-nowrap">
              🏋️ Session
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200 whitespace-nowrap">
              📝 Manual
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="text-sm text-gray-600 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {workout.duration} min
          </div>
          {formatDate && <span className="text-xs text-gray-400">{formatDate(workout.date)}</span>}
        </div>
      </div>
    </div>
  );
}
