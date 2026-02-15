import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyBzNnZF7bh8opxVo6ZCEC-2wGmMQBE-AFU',
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
  console.log('Ì¥ß Connecting to Firebase Emulators...')
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  // Functions connection - will silently fail if functions not running, which is fine
  try {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001)
  } catch (e) {
    console.log('‚ö†Ô∏è Functions emulator not available')
  }
}
