import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth'
import { auth } from '../lib/firebase'
import {
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  getUserDocument,
  createUserDocument,
  resendVerificationEmail,
} from '../lib/authHelpers'
import type { User } from '@repo/shared/schemas'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  resendVerification: (email: string, password: string) => Promise<void>
  clearError: () => void
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setFirebaseUser(firebaseUser)

        if (firebaseUser) {
          console.log('🔐 User authenticated:', firebaseUser.uid, firebaseUser.email)
          // Fetch user document from Firestore
          const userDoc = await getUserDocument(firebaseUser.uid)
          console.log('📄 User document from Firestore:', userDoc)

          if (!userDoc) {
            console.error('❌ User document not found in Firestore for UID:', firebaseUser.uid)
            // Note: This is OK if user just signed up and hasn't verified email yet
            // Document will be created on first login after verification
          }

          setUser(userDoc)
        } else {
          console.log('🔓 No user authenticated')
          setUser(null)
        }
      } catch (err) {
        console.error('❌ Error in auth state change:', err)
        setError('Failed to load user data')
        setUser(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleSignUp = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      // Create user account and send verification email
      console.log('🔐 Starting signup process...')
      await signUpWithEmail(email, password)
      console.log('✅ Signup complete - verification email sent')

      // User is already signed out by signUpWithEmail
      // They must verify email before logging in
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign up'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleSignIn = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      // Authenticate with Firebase
      console.log('🔐 Signing in user...')
      const firebaseUser = await signInWithEmail(email, password)
      console.log('✅ Firebase authentication successful:', firebaseUser.uid)

      // Check if email is verified
      if (!firebaseUser.emailVerified) {
        console.error('❌ Email not verified')
        await signOutUser()
        throw new Error('Please verify your email before signing in. Check your inbox for the verification link.')
      }

      console.log('✅ Email verified')

      // Fetch or create user document
      console.log('🔍 Fetching user document...')
      let userDoc = await getUserDocument(firebaseUser.uid)

      if (!userDoc) {
        console.log('📝 User document not found, creating new one...')
        // First time logging in after email verification - create Firestore document
        userDoc = await createUserDocument(firebaseUser.uid, firebaseUser.email!)

        // Immediately update state so App.tsx can route correctly
        // Note: onAuthStateChanged already fired before document creation,
        // so we need to manually update the state here
        setUser(userDoc)
        console.log('✅ User document created and state updated')
      }

      console.log('✅ User document ready, login successful')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign in'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setError(null)
      await signOutUser()
      setUser(null)
      setFirebaseUser(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out'
      setError(message)
      throw err
    }
  }

  const refreshUser = async () => {
    if (firebaseUser) {
      try {
        const userDoc = await getUserDocument(firebaseUser.uid)
        setUser(userDoc)
      } catch (err) {
        console.error('Error refreshing user:', err)
        setError('Failed to refresh user data')
      }
    }
  }

  const handleResendVerification = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      await resendVerificationEmail(email, password)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to resend verification email'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    error,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
    refreshUser,
    resendVerification: handleResendVerification,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
