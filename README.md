# pixel Grid RTC

A real-time multiplayer territory control game where users compete to capture pixels on a shared grid.

**The Rule:** Capture a pixel and defend it! If you hold a pixel for **5 seconds** without it being stolen, it becomes **LOCKED** 🔒 and yours forever.

## Features

- **Real-Time Multiplayer:** Instant updates using Socket.io (WebSocket).
- **Conflict Handling:** Server-authoritative logic prevents race conditions.
- **Persistence:** Redis database saves the map state (survives server restarts).
- **The 5-Second Rule:** "Survival Mode" logic for locking territory.
- **Live Leaderboard:** Tracks the top conquerors.
- **Performance:** Optimized React rendering and Node.js event handling.

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS
- **Backend:** Node.js, Express, Socket.io
- **Database:** Redis (Upstash)

## Installation

### Prerequisites

- Node.js (v16+)
- A Redis URL (Local or Cloud like Upstash)

### 1. Setup Backend

```bash
cd server
npm install
# Create a .env file and add your Redis URL:
# REDIS_URL=redis://default:password@your-url.upstash.io:6379
npm run dev
```
