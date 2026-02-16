import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { CreateLoggedWorkout, LoggedWorkout, WorkoutType } from '@repo/shared/schemas'

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
      sessionSource: workout.sessionSource || null, // Add sessionSource if provided
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
    const workouts = snapshot.docs.map(doc => {
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
      console.log(`   Filtering StartDate: ${options.startDate.toString()}`)
      filteredWorkouts = filteredWorkouts.filter(w => {
        const pass = w.date >= options.startDate!
        if (!pass) console.log(`   Skipping workout (too early): ${w.date.toString()}`)
        return pass
      })
    }
    if (options?.endDate) {
      console.log(`   Filtering EndDate: ${options.endDate.toString()}`)
      filteredWorkouts = filteredWorkouts.filter(w => {
        const pass = w.date <= options.endDate!
        if (!pass) console.log(`   Skipping workout (too late): ${w.date.toString()}`)
        return pass
      })
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

  // Week must run Monday through Sunday inclusive
  // For Sunday Feb 16: the week is Mon Feb 10 00:00 through Sun Feb 16 23:59
  // Javascript's getDay() returns 0 for Sunday

  const monday = new Date(now)
  monday.setHours(0, 0, 0, 0)

  const day = monday.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? 6 : day - 1 // Sunday should go back 6 days to Monday

  monday.setDate(monday.getDate() - diff)

  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  console.log('📅 getThisWeeksWorkouts (Logic Check):')
  console.log('   Now:', now.toString())
  console.log('   Current Day (0-6):', day)
  console.log('   Diff Days to Mon:', diff)
  console.log('   Therefore, Monday is:', monday.toString())
  console.log('   And Sunday is:', sunday.toString())

  return getWorkouts(userId, {
    startDate: monday,
    endDate: sunday,
  })
}

/**
 * Get workouts for last week (Monday - Sunday before current week)
 */
export async function getLastWeeksWorkouts(userId: string): Promise<LoggedWorkout[]> {
  const now = new Date()

  // Find Monday of the current week first
  const thisMonday = new Date(now)
  thisMonday.setHours(0, 0, 0, 0)
  const day = thisMonday.getDay()
  const diff = day === 0 ? 6 : day - 1
  thisMonday.setDate(thisMonday.getDate() - diff)

  // Last week's Monday is 7 days before this Monday
  const lastMonday = new Date(thisMonday)
  lastMonday.setDate(thisMonday.getDate() - 7)

  // Last week's Sunday is the day before this Monday
  const lastSunday = new Date(thisMonday)
  lastSunday.setDate(thisMonday.getDate() - 1)
  lastSunday.setHours(23, 59, 59, 999)

  return getWorkouts(userId, {
    startDate: lastMonday,
    endDate: lastSunday,
  })
}

/**
 * Calculate current workout streak (consecutive days with workouts)
 */
export async function calculateStreak(userId: string): Promise<number> {
  try {
    const allWorkouts = await getWorkouts(userId)

    if (allWorkouts.length === 0) return 0

    // Group workouts by local date string to avoid UTC timezone shifts
    const workoutsByDate = new Map<string, boolean>()
    allWorkouts.forEach(workout => {
      const dateKey = workout.date.toLocaleDateString()
      workoutsByDate.set(dateKey, true)
    })

    // Check backwards from today
    let streak = 0
    const today = new Date()
    const currentDate = new Date(today)
    currentDate.setHours(0, 0, 0, 0)

    // Start checking from today or yesterday (if no workout today)
    const todayKey = currentDate.toLocaleDateString()
    if (!workoutsByDate.has(todayKey)) {
      // If no workout today, start from yesterday
      currentDate.setDate(currentDate.getDate() - 1)
    }

    // Count consecutive days
    while (workoutsByDate.has(currentDate.toLocaleDateString())) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
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
    const q = query(collection(db, 'loggedWorkouts'), where('userId', '==', userId))
    const snapshot = await getDocs(q)
    return snapshot.size
  } catch (error) {
    return 0
  }
}

/**
 * Mark a session as completed for today
 */
export async function markSessionCompleted(userId: string, sessionName: string): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    const completionData = {
      userId,
      date: today,
      sessionName,
      completedAt: Timestamp.now(),
    }

    // Check if already completed to avoid duplicates
    const q = query(
      collection(db, 'completedSessions'),
      where('userId', '==', userId),
      where('date', '==', today)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      await addDoc(collection(db, 'completedSessions'), completionData)
      console.log('✅ Session marked as completed:', sessionName)
    } else {
      console.log('ℹ️ Session already marked as completed for today')
    }
  } catch (error) {
    console.error('❌ Error marking session completed:', error)
  }
}

/**
 * Check if today's session is completed
 */
export async function checkSessionCompletion(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]
    const q = query(
      collection(db, 'completedSessions'),
      where('userId', '==', userId),
      where('date', '==', today)
    )
    const snapshot = await getDocs(q)
    return !snapshot.empty
  } catch (error) {
    console.error('❌ Error checking session completion:', error)
    return false
  }
}

/**
 * Log a full workout session (multiple exercises)
 */
export async function logWorkoutSession(
  userId: string,
  exercises: { name: string; type: string; duration: number }[],
  sessionName: string
): Promise<void> {
  try {
    console.log(`💪 Logging session: ${sessionName} with ${exercises.length} exercises`)

    const now = new Date()
    const batchPromises = exercises.map(ex => {
      // Determine type safely
      let type: WorkoutType = 'other'
      if (['strength', 'cardio', 'hiit', 'flexibility', 'other'].includes(ex.type)) {
        type = ex.type as WorkoutType
      } else if (ex.type === 'compound') {
        type = 'strength'
      }

      return logWorkout(userId, {
        name: ex.name,
        type,
        duration: Math.max(1, Math.round(ex.duration)), // Ensure integer minutes
        date: now,
        notes: `Completed via Today's Workout Session: ${sessionName}`,
        sessionSource: 'daily_workout',
      })
    })

    await Promise.all(batchPromises)
    await markSessionCompleted(userId, sessionName)
    console.log('✅ Session logging complete')
  } catch (error) {
    console.error('❌ Error logging session:', error)
    throw error
  }
}

/**
 * Get workouts for TODAY only
 */
export async function getTodaysWorkouts(userId: string): Promise<LoggedWorkout[]> {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  return getWorkouts(userId, {
    startDate: startOfDay,
    endDate: endOfDay,
  })
}
