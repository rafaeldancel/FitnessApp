import * as functions from 'firebase-functions'

// Simple test function
export const helloWorld = functions.https.onRequest((request, response) => {
  response.json({ message: "Hello from Firebase!", timestamp: new Date().toISOString() })
})

// Health check endpoint
export const health = functions.https.onRequest((request, response) => {
  response.json({ status: "ok" })
})
