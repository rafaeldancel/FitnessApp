import { WorkoutService } from '../services/WorkoutService';
import { StatsService } from '../services/StatsService';

import type { CreateLoggedWorkout, LoggedWorkout, PlannedWorkout } from '../types';

// Re-export deprecated functions or use-case specific wrappers
// The goal is to keep the API surface identical so imports don't break.

/**
 * Log a workout to Firestore
 */
export async function logWorkout(
  userId: string,
  workout: CreateLoggedWorkout
): Promise<LoggedWorkout> {
  const service = new WorkoutService(userId);
  const id = await service.logWorkout(workout);

  // Return expected shape to match old signature
  return {
    id,
    userId,
    name: workout.name,
    type: workout.type,
    duration: workout.duration,
    calories: workout.calories,
    date: workout.date,
    notes: workout.notes,
    createdAt: new Date(), // approximation
  };
}

export async function getWorkouts(
  userId: string,
  options?: {
    limitCount?: number;
    startDate?: Date;
    endDate?: Date;
  }
): Promise<LoggedWorkout[]> {
  const service = new WorkoutService(userId);
  return service.getWorkouts(options);
}

export async function getThisWeeksWorkouts(userId: string): Promise<LoggedWorkout[]> {
  const service = new WorkoutService(userId);
  return service.getThisWeeksWorkouts();
}

export async function getLastWeeksWorkouts(userId: string): Promise<LoggedWorkout[]> {
  const service = new WorkoutService(userId);
  return service.getLastWeeksWorkouts();
}

export async function calculateStreak(userId: string): Promise<number> {
  const workoutService = new WorkoutService(userId);
  const statsService = new StatsService();

  // We need to fetch workouts first to calculate streak
  // This might be heavier than the old implementation if we don't paginate,
  // but the old implementation also called getWorkouts(userId) without limits.
  const workouts = await workoutService.getWorkouts();
  return statsService.calculateStreak(workouts);
}

export async function getTotalWorkoutCount(userId: string): Promise<number> {
  // StatsService doesn't have this, but WorkoutService could.
  // Or we just calculate length of getWorkouts.
  // Old implementation did a query.
  // For now, let's keep it simple or move to WorkoutService if critical.
  // I'll leave it as a wrapper around getWorkouts().length for now to follow OOP pattern,
  // or implement a count method in WorkoutService if optimization needed.
  // Given strict "don't break", let's use the valid service method.
  const service = new WorkoutService(userId);
  const workouts = await service.getWorkouts();
  return workouts.length;
}

export async function markSessionCompleted(userId: string, sessionName: string): Promise<void> {
  const service = new WorkoutService(userId);
  return service.markSessionCompleted(sessionName);
}

export async function checkSessionCompletion(userId: string): Promise<boolean> {
  const service = new WorkoutService(userId);
  return service.checkSessionCompletion();
}

export function estimateCalories(type: string, durationMinutes: number): number {
  return StatsService.estimateCalories(type, durationMinutes);
}

export async function logWorkoutSession(
  userId: string,
  exercises: { name: string; type: string; duration: number; calories?: number }[],
  sessionName: string
): Promise<void> {
  const service = new WorkoutService(userId);
  return service.logWorkoutSession(exercises, sessionName);
}

export async function getTodaysWorkouts(userId: string): Promise<LoggedWorkout[]> {
  const service = new WorkoutService(userId);
  return service.getTodaysWorkouts();
}

// =============================================
// 🗓️ PLANNED WORKOUTS wrappers
// =============================================

export async function scheduleWorkout(
  userId: string,
  workout: Omit<PlannedWorkout, 'id' | 'createdAt'>
): Promise<string> {
  const service = new WorkoutService(userId);
  return service.schedulePlannedWorkout(workout);
}

export async function getPlannedWorkouts(
  userId: string,
  startDate?: string
): Promise<PlannedWorkout[]> {
  const service = new WorkoutService(userId);
  return service.getPlannedWorkouts(startDate);
}

export async function deletePlannedWorkout(workoutId: string): Promise<void> {
  // We need userId to instantiate service, but this function signature doesn't have it.
  // This is a tricky one for the wrapper if the service requires userId in constructor.
  // However, deleteDoc just needs the ID.
  // I should probably make deletePlannedWorkout static or allow instantiation without ID for this method?
  // Or simpler: Instantiate a service with dummy ID, or make the method static in service?
  // Actually, deleteDoc doesn't care about userId permissions in client-side impl (unless security rules check).
  // I'll modify WorkoutService to optional userId or handle this case.
  // For now, I'll instantiate with a placeholder since the service method implementation only uses the doc ID.
  const service = new WorkoutService('placeholder');
  return service.deletePlannedWorkout(workoutId);
}

export async function markPlannedWorkoutComplete(workoutId: string): Promise<void> {
  const service = new WorkoutService('placeholder');
  return service.markPlannedComplete(workoutId);
}

// Re-export getLocalDateString relative to this file to avoid breaking imports
export { getLocalDateString } from './dateUtils';

export async function getPlannedWorkoutById(workoutId: string): Promise<PlannedWorkout | null> {
  const service = new WorkoutService('placeholder');
  return service.getPlannedWorkoutById(workoutId);
}
