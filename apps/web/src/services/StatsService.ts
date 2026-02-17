import type { LoggedWorkout } from '../types';
import { DateService } from './DateService';

export class StatsService {
  /**
   * Calculate current streak (consecutive days with activities leading up to today/yesterday)
   */
  calculateStreak(workouts: LoggedWorkout[]): number {
    if (!workouts.length) return 0;

    // formatting date to YYYY-MM-DD local string
    const toDateKey = (date: Date) => DateService.getLocalDateString(date);

    const workoutDates = new Set(workouts.map((w) => toDateKey(new Date(w.date))));

    let streak = 0;
    const today = new Date();
    const current = new Date(today);

    // Check if we should start from today or yesterday
    if (!workoutDates.has(toDateKey(today))) {
      current.setDate(current.getDate() - 1);
      // If no workout yesterday either, streak is 0
      if (!workoutDates.has(toDateKey(current))) {
        return 0;
      }
    }

    // Count backwards
    while (workoutDates.has(toDateKey(current))) {
      streak++;
      current.setDate(current.getDate() - 1);
    }

    return streak;
  }

  calculateLongestStreak(workouts: LoggedWorkout[]): number {
    if (!workouts.length) return 0;

    const sortedDates = [
      ...new Set(workouts.map((w) => DateService.getLocalDateString(new Date(w.date)))),
    ].sort(); // ascending strings works for ISO dates

    let maxStreak = 0;
    let currentStreak = 0;
    let prevDate: Date | null = null;

    for (const dateStr of sortedDates) {
      const date = new Date(dateStr);

      if (!prevDate) {
        currentStreak = 1;
        maxStreak = 1;
        prevDate = date;
        continue;
      }

      // Calc difference in days
      const diffTime = Math.abs(date.getTime() - prevDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      if (currentStreak > maxStreak) maxStreak = currentStreak;
      prevDate = date;
    }

    return maxStreak;
  }

  calculateWeeklyActiveDays(workouts: LoggedWorkout[]): number {
    const startOfWeek = DateService.getStartOfWeek();
    const activeDays = new Set<string>();

    workouts.forEach((w) => {
      const d = new Date(w.date);
      if (d >= startOfWeek) {
        activeDays.add(DateService.getLocalDateString(d));
      }
    });

    return activeDays.size;
  }

  calculateWeeklyDuration(workouts: LoggedWorkout[]): number {
    const startOfWeek = DateService.getStartOfWeek();
    return workouts
      .filter((w) => new Date(w.date) >= startOfWeek)
      .reduce((sum, w) => sum + w.duration, 0);
  }

  calculateTodaysCalories(workouts: LoggedWorkout[]): number {
    const today = DateService.getLocalDateString();
    return workouts
      .filter((w) => DateService.getLocalDateString(new Date(w.date)) === today)
      .reduce((sum, w) => sum + (w.calories || 0), 0);
  }

  calculateDailyCalorieHistory(workouts: LoggedWorkout[]): { date: string; calories: number }[] {
    const history = new Map<string, number>();

    workouts.forEach((w) => {
      const date = DateService.getLocalDateString(new Date(w.date));
      const current = history.get(date) || 0;
      history.set(date, current + (w.calories || 0));
    });

    return Array.from(history.entries())
      .map(([date, calories]) => ({ date, calories }))
      .sort((a, b) => b.date.localeCompare(a.date)); // descending
  }

  getUniqueActiveDays(workouts: LoggedWorkout[]): number {
    return new Set(workouts.map((w) => DateService.getLocalDateString(new Date(w.date)))).size;
  }

  /**
   * Estimate calories based on type/duration
   * Static because it doesn't depend on workout history
   */
  static estimateCalories(type: string, durationMinutes: number): number {
    // This logic exists in workoutHelpers (and constants indirectly).
    // Hardcoding here or importing constant?
    // Ideally use constants, but avoiding circular deps if possible.
    // importing constants is safe.
    const rates: Record<string, number> = {
      strength: 7,
      compound: 7,
      cardio: 10,
      hiit: 12,
      flexibility: 4,
      warmup: 4,
      cooldown: 3,
      other: 5,
    };
    const rate = rates[type.toLowerCase()] || 5;
    return Math.round(durationMinutes * rate);
  }
}
