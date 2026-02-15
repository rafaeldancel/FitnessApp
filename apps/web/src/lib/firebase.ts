import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

// Production Firebase Configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBZNhZF7bh8ppxVo6ZCEC-2wGmMQ0E-AFU',
  authDomain: 'fitnessapp-74003.firebaseapp.com',
  projectId: 'fitnessapp-74003',
  storageBucket: 'fitnessapp-74003.firebasestorage.app',
  messagingSenderId: '760934895974',
  appId: '1:760934895974:web:f5606ca8ebfab19a81b8a7',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

if (import.meta.env.DEV) {
  console.log('🔥 Firebase initialized in PRODUCTION mode')
  console.log('📧 Real emails WILL be sent for verification')
  console.log('💾 Data will be saved to PRODUCTION Firestore')
  console.warn('⚠️ NOT using emulators - this is REAL Firebase!')
}
