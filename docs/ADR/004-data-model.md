# ADR 004: Firestore Data Model

## Status: Accepted

## Context: Need to store user profiles, workouts, plans, and completion tracking

## Decision: Separate collections: users, loggedWorkouts, plannedWorkouts, completedSessions

## Consequences: Clean separation of concerns, requires composite indexes for complex queries
