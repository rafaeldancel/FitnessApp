import {
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DateService } from './DateService';
import type { LoggedWorkout, CreateLoggedWorkout, PlannedWorkout, WorkoutType } from '../types';

export class WorkoutService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Log a single workout
   */
  async logWorkout(workout: CreateLoggedWorkout): Promise<string> {
    try {
      const workoutData = {
        userId: this.userId,
        name: workout.name,
        type: workout.type,
        duration: workout.duration,
        calories: workout.calories || null,
        date: Timestamp.fromDate(workout.date),
        notes: workout.notes || '',
        createdAt: Timestamp.now(),
        sessionSource: workout.sessionSource || null,
      };

      const docRef = await addDoc(collection(db, 'loggedWorkouts'), workoutData);
      return docRef.id;
    } catch (error) {
      console.error('❌ Error logging workout:', error);
      throw error;
    }
  }

  /**
   * Log a full session (multiple exercises)
   */
  async logWorkoutSession(
    exercises: { name: string; type: string; duration: number; calories?: number }[],
    sessionName: string
  ): Promise<void> {
    const batch = exercises.map((ex) =>
      this.logWorkout({
        name: ex.name,
        type: ex.type as WorkoutType,
        duration: ex.duration,
        calories: ex.calories,
        date: new Date(),
        sessionSource: sessionName,
      })
    );

    await Promise.all(batch);
  }

  /**
   * Get workouts with optional filters
   */
  async getWorkouts(options?: {
    limitCount?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<LoggedWorkout[]> {
    try {
      let q = query(
        collection(db, 'loggedWorkouts'),
        where('userId', '==', this.userId),
        orderBy('date', 'desc')
      );

      if (options?.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      const snapshot = await getDocs(q);
      const workouts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId,
          name: data.name,
          type: data.type,
          duration: data.duration,
          calories: data.calories,
          date: data.date.toDate(),
          notes: data.notes,
          createdAt: data.createdAt.toDate(),
        } as LoggedWorkout;
      });

      // Client-side date filtering
      let filtered = workouts;
      if (options?.startDate) {
        filtered = filtered.filter((w) => w.date >= options.startDate!);
      }
      if (options?.endDate) {
        filtered = filtered.filter((w) => w.date <= options.endDate!);
      }

      return filtered;
    } catch (error) {
      console.error('❌ Error fetching workouts:', error);
      return [];
    }
  }

  async getTodaysWorkouts(): Promise<LoggedWorkout[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.getWorkouts({ startDate: today, endDate: tomorrow });
  }

  async getThisWeeksWorkouts(): Promise<LoggedWorkout[]> {
    const start = DateService.getStartOfWeek();
    const end = DateService.getEndOfWeek();
    return this.getWorkouts({ startDate: start, endDate: end });
  }

  async getLastWeeksWorkouts(): Promise<LoggedWorkout[]> {
    const start = DateService.getStartOfLastWeek();
    const end = DateService.getEndOfLastWeek();
    return this.getWorkouts({ startDate: start, endDate: end });
  }

  // =============================================
  // 🗓️ PLANNED WORKOUTS
  // =============================================

  async schedulePlannedWorkout(workout: Omit<PlannedWorkout, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'plannedWorkouts'), {
      ...workout,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  }

  async getPlannedWorkouts(startDate?: string): Promise<PlannedWorkout[]> {
    // Defaults to today if not provided
    const effectiveStart = startDate || DateService.getLocalDateString();

    const q = query(
      collection(db, 'plannedWorkouts'),
      where('userId', '==', this.userId),
      where('date', '>=', effectiveStart),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        }) as PlannedWorkout
    );
  }

  async markPlannedComplete(docId: string): Promise<void> {
    const ref = doc(db, 'plannedWorkouts', docId);
    await setDoc(ref, { completed: true }, { merge: true });
  }

  async deletePlannedWorkout(docId: string): Promise<void> {
    await deleteDoc(doc(db, 'plannedWorkouts', docId));
  }

  // =============================================
  // 🏁 SESSION COMPLETION
  // =============================================

  async markSessionCompleted(sessionName: string): Promise<void> {
    const today = DateService.getLocalDateString();
    const docId = `${this.userId}__${today}`;

    await setDoc(doc(db, 'completedSessions', docId), {
      userId: this.userId,
      date: today,
      sessionName,
      completedAt: Timestamp.now(),
    });
  }

  async checkSessionCompletion(): Promise<boolean> {
    const today = DateService.getLocalDateString();
    const docId = `${this.userId}__${today}`;
    const snap = await getDoc(doc(db, 'completedSessions', docId));
    return snap.exists();
  }
  async getPlannedWorkoutById(workoutId: string): Promise<PlannedWorkout | null> {
    try {
      const docRef = doc(db, 'plannedWorkouts', workoutId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as PlannedWorkout;
      } else {
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching planned workout:', error);
      return null;
    }
  }
}
