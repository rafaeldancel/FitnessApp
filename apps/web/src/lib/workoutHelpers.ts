import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import type { CreateLoggedWorkout, LoggedWorkout } from '@repo/shared/schemas'

/**
 * Log a workout to Firestore
 */
export async function logWorkout(
  userId: string,
  workout: CreateLoggedWorkout
): Promise<LoggedWorkout> {
  try {
    console.log('💪 Logging workout...', workout)

    const workoutData = {
      userId,
      name: workout.name,
      type: workout.type,
      duration: workout.duration,
      calories: workout.calories || null,
      date: Timestamp.fromDate(workout.date),
      notes: workout.notes || '',
      createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, 'loggedWorkouts'), workoutData)
    console.log('✅ Workout logged with ID:', docRef.id)

    return {
      id: docRef.id,
      userId,
      name: workout.name,
      type: workout.type,
      duration: workout.duration,
      calories: workout.calories,
      date: workout.date,
      notes: workout.notes,
      createdAt: new Date(),
    }
  } catch (error) {
    console.error('❌ Error logging workout:', error)
    throw new Error('Failed to log workout')
  }
}

/**
 * Get workouts for a user with optional filters
 */
export async function getWorkouts(
  userId: string,
  options?: {
    limitCount?: number
    startDate?: Date
    endDate?: Date
  }
): Promise<LoggedWorkout[]> {
  try {
    console.log('🔍 Fetching workouts for user:', userId)

    let q = query(
      collection(db, 'loggedWorkouts'),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    )

    if (options?.limitCount) {
      q = query(q, limit(options.limitCount))
    }

    const snapshot = await getDocs(q)
    const workouts = snapshot.docs.map((doc) => {
      const data = doc.data()
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
      } as LoggedWorkout
    })

    // Apply date filters in memory (since Firestore limits compound queries)
    let filteredWorkouts = workouts
    if (options?.startDate) {
      filteredWorkouts = filteredWorkouts.filter(
        (w) => w.date >= options.startDate!
      )
    }
    if (options?.endDate) {
      filteredWorkouts = filteredWorkouts.filter((w) => w.date <= options.endDate!)
    }

    console.log(`✅ Found ${filteredWorkouts.length} workouts`)
    return filteredWorkouts
  } catch (error) {
    console.error('❌ Error fetching workouts:', error)
    return []
  }
}

/**
 * Get workouts for the current week (Monday - Sunday)
 */
export async function getThisWeeksWorkouts(userId: string): Promise<LoggedWorkout[]> {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1 // Days since Monday

  const monday = new Date(now)
  monday.setDate(now.getDate() - diff)
  monday.setHours(0, 0, 0, 0)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  return getWorkouts(userId, {
    startDate: monday,
    endDate: sunday,
  })
}

/**
 * Calculate current workout streak (consecutive days with workouts)
 */
export async function calculateStreak(userId: string): Promise<number> {
  try {
    const allWorkouts = await getWorkouts(userId)

    if (allWorkouts.length === 0) return 0

    // Group workouts by date (YYYY-MM-DD)
    const workoutsByDate = new Map<string, boolean>()
    allWorkouts.forEach((workout) => {
      const dateKey = workout.date.toISOString().split('T')[0]
      workoutsByDate.set(dateKey, true)
    })

    // Check backwards from today
    let streak = 0
    const today = new Date()
    let currentDate = new Date(today)
    currentDate.setHours(0, 0, 0, 0)

    // Start checking from today or yesterday (if no workout today)
    const todayKey = currentDate.toISOString().split('T')[0]
    if (!workoutsByDate.has(todayKey)) {
      // If no workout today, start from yesterday
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // Count consecutive days
    while (true) {
      const dateKey = currentDate.toISOString().split('T')[0]
      if (workoutsByDate.has(dateKey)) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  } catch (error) {
    console.error('❌ Error calculating streak:', error)
    return 0
  }
}

/**
 * Get total workout count for user
 */
export async function getTotalWorkoutCount(userId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'loggedWorkouts'),
      where('userId', '==', userId)
    )
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    console.error('❌ Error getting total workout count:', error)
    return 0
  }
}
