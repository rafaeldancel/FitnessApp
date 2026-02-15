import { useState } from 'react'
import './style.css'
// Import Firebase to trigger emulator connection
import { auth, db } from './lib/firebase'

import { Header } from '@repo/ui/Header'
import { Button } from '@repo/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@repo/ui/Card'

export function App() {
  const [count, setCount] = useState(0)

  // Test Firebase connection
  console.log('Firebase Auth:', auth)
  console.log('Firebase DB:', db)

  return (
    <div className="min-h-screen py-8 px-4">
      <Header title="Fitness App - Firebase Test" />

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Firebase Connection Test</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Check the browser console (F12) for:</p>
            <code className="bg-gray-100 p-2 block rounded">
              ��� Connecting to Firebase Emulators...
            </code>
            <p className="mt-4 text-sm text-gray-600">
              If you see this message, Firebase is connected! ✅
            </p>

            <div className="mt-6">
              <Button onClick={() => setCount(count + 1)}>Test Button (Count: {count})</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
