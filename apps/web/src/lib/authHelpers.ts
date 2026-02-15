import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  type User as FirebaseUser,
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from './firebase'
import type { User, FitnessGoal, Gender, HealthRestriction } from '@repo/shared/schemas'

/**
 * Sign up a new user with email and password, send verification email
 * Does NOT create Firestore document - that happens after email verification on first login
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<void> {
  try {
    console.log('🔐 Creating Firebase Auth user...')
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user
    console.log('✅ Firebase Auth user created:', firebaseUser.uid)

    // Send verification email
    console.log('📧 Sending verification email...')
    await sendEmailVerification(firebaseUser)
    console.log('✅ Verification email sent')

    if (import.meta.env.DEV) {
      console.log('💡 Running in emulator - check http://localhost:4000 to view verification emails')
    }

    // Sign out immediately - user must verify email before signing in
    console.log('🔓 Signing out user until email is verified...')
    await signOut(auth)
    console.log('✅ Signup complete - user must verify email')
  } catch (error) {
    console.error('❌ Signup error:', error)
    throw new Error(getAuthErrorMessage(error))
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<FirebaseUser> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    throw new Error(getAuthErrorMessage(error))
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    throw new Error(getAuthErrorMessage(error))
  }
}

/**
 * Create a minimal user document in Firestore
 * Called after email verification on first login
 */
export async function createUserDocument(
  userId: string,
  email: string
): Promise<User> {
  try {
    const userDoc: User = {
      id: userId,
      email: email,
      onboardingComplete: false,
      hasHealthRestrictions: false,
    }

    console.log('📝 Writing to Firestore users collection:', userDoc)
    await setDoc(doc(db, 'users', userId), userDoc)
    console.log('✅ Firestore write complete')
    return userDoc
  } catch (error) {
    console.error('❌ Firestore write error:', error)
    throw new Error(`Failed to create user document: ${getAuthErrorMessage(error)}`)
  }
}

/**
 * Fetch a user document from Firestore
 */
export async function getUserDocument(userId: string): Promise<User | null> {
  try {
    console.log('🔍 Fetching user document for UID:', userId)
    const userDocRef = doc(db, 'users', userId)
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as User
      console.log('✅ User document found:', userData)
      return userData
    }

    console.warn('⚠️ User document does not exist for UID:', userId)
    return null
  } catch (error) {
    console.error('❌ Error fetching user document:', error)
    return null
  }
}

/**
 * Resend verification email to a user
 */
export async function resendVerificationEmail(
  email: string,
  password: string
): Promise<void> {
  try {
    console.log('📧 Resending verification email...')

    // Sign in temporarily to send verification email
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Send verification email
    await sendEmailVerification(user)
    console.log('✅ Verification email resent')

    if (import.meta.env.DEV) {
      console.log('💡 Running in emulator - check http://localhost:4000 to view verification emails')
    }

    // Sign out immediately
    await signOut(auth)
  } catch (error) {
    console.error('❌ Resend verification error:', error)
    throw new Error(getAuthErrorMessage(error))
  }
}

/**
 * Update user document in Firestore with partial data
 */
export async function updateUserDocument(
  userId: string,
  data: Partial<User>
): Promise<void> {
  try {
    console.log('📝 Updating user document:', userId, data)
    const userDocRef = doc(db, 'users', userId)
    await updateDoc(userDocRef, data)
    console.log('✅ User document updated')
  } catch (error) {
    console.error('❌ Error updating user document:', error)
    throw new Error(`Failed to update user document: ${getAuthErrorMessage(error)}`)
  }
}

/**
 * Interface for onboarding data
 */
export interface OnboardingData {
  name: string
  age: number
  height: number
  weight: number
  gender: Gender
  fitnessGoals: FitnessGoal[]
  weeklyTarget: number
  restDays: number[]
  hasHealthRestrictions: boolean
  healthRestrictions: HealthRestriction[]
}

/**
 * Complete onboarding by saving all data to Firestore
 */
export async function completeOnboarding(
  userId: string,
  data: OnboardingData
): Promise<void> {
  try {
    console.log('📝 Completing onboarding for user:', userId)

    const updateData: Partial<User> = {
      ...data,
      onboardingComplete: true,
      onboardingCompletedAt: new Date(),
    }

    await updateUserDocument(userId, updateData)
    console.log('✅ Onboarding completed successfully')

    // Clear localStorage draft
    const draftKey = `onboarding_draft_${userId}`
    localStorage.removeItem(draftKey)
  } catch (error) {
    console.error('❌ Error completing onboarding:', error)
    throw new Error(`Failed to complete onboarding: ${getAuthErrorMessage(error)}`)
  }
}

/**
 * Map Firebase error codes to user-friendly error messages
 */
export function getAuthErrorMessage(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return 'An unexpected error occurred'
  }

  const firebaseError = error as { code?: string; message?: string }

  switch (firebaseError.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters long'
    case 'auth/invalid-email':
      return 'Please enter a valid email address'
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled. Please contact support.'
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    default:
      return firebaseError.message || 'An error occurred during authentication'
  }
}
