# 🎨 Skribbl.io Clone

A real-time multiplayer drawing and guessing game inspired by **skribbl.io**.

Players can create private rooms, invite friends using room codes or invite links, draw words on a shared canvas, guess words in real-time, earn points, and compete on the leaderboard.

---

# ✨ Features

## Room & Lobby

* Create Private Rooms
* Join Room via Room Code
* Join Room via Invite Link
* Lobby with Player List
* Host Controlled Game Start
* Configurable Room Settings

### Room Settings

* Rounds (2–10)
* Draw Time (15–240 sec)
* Max Players (2–20)
* Word Count (1–5)

---

## Gameplay

* Turn-Based Drawing & Guessing
* Multiple Rounds
* Automatic Drawer Rotation
* Word Selection System
* Real-Time Score Updates
* Winner Screen
* Leaderboard Ranking
* Auto Round Progression
* Round Timer

---

## Drawing Features

* Real-Time Canvas Synchronization
* Brush Tool
* Multiple Colors
* Brush Size Control
* Eraser Tool
* Undo Drawing
* Clear Canvas
* Drawer-Only Drawing Permissions

---

## Chat & Guessing

* Real-Time Guess System
* General Chat System
* Correct Guess Detection
* Correct Guess Notifications
* Drawer Cannot Guess
* Guessers Cannot Draw

---

## Hint System

* Hidden Word Display
* Automatic Hint Reveal Over Time
* Timer-Based Letter Reveal

---

# 🛠 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Socket.IO Client

## Backend

* Node.js
* Express.js
* Socket.IO

## Data Storage

* In-Memory Map (MVP)

---

# 📁 Project Structure

```bash
skribbl_clone/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── classes/
│   │   ├── socket/
│   │   ├── words/
│   │   └── server.js
│   │
│   └── package.json
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone <repository-url>
cd skribbl_clone
```

---

## Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs on:

```bash
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the backend folder:

```env
PORT=5000
```

---

# 🏗 Architecture Overview

```text
React Frontend
       │
       │ Socket.IO
       ▼
Node.js + Express Server
       │
       ▼
Game Logic Layer
(Room, Game, Player)
       │
       ▼
In-Memory Game Store
(Rooms, Players, Scores, Runtime State)
```

---

## Core Classes

### Room

Handles:

* Players
* Host
* Room Settings
* Leaderboard

### Game

Handles:

* Rounds
* Turn Rotation
* Word Selection
* Hint Generation
* Guess Validation
* Timer Management

### Player

Handles:

* Score
* Guess Status
* Socket Information

---

# 💾 Data Storage

This MVP uses an in-memory data store.

Rooms, players, scores, and game state are stored in memory while the server is running.

**Note:** All game data resets when the backend server restarts. Database persistence (MySQL/PostgreSQL/MongoDB) can be added later if required.

---

# 🔌 WebSocket Events

## Room Events

| Event         | Description       |
| ------------- | ----------------- |
| create_room   | Create room       |
| join_room     | Join room         |
| player_joined | New player joined |
| player_left   | Player left       |
| start_game    | Host starts game  |

---

## Game Events

| Event        | Description          |
| ------------ | -------------------- |
| round_start  | New round started    |
| word_chosen  | Drawer selected word |
| timer_update | Timer update         |
| round_end    | Round finished       |
| game_over    | Game finished        |

---

## Drawing Events

| Event        | Description       |
| ------------ | ----------------- |
| draw_start   | Start drawing     |
| draw_move    | Continue drawing  |
| draw_end     | Stop drawing      |
| draw_data    | Broadcast drawing |
| draw_undo    | Undo last stroke  |
| canvas_clear | Clear canvas      |

---

## Chat Events

| Event        | Description            |
| ------------ | ---------------------- |
| chat         | Send chat message      |
| chat_message | Broadcast chat message |

---

## Guess Events

| Event        | Description  |
| ------------ | ------------ |
| guess        | Submit guess |
| guess_result | Guess result |

---

# 🎮 Game Flow

1. Host creates a room.
2. Players join the room.
3. Host starts the game.
4. Drawer receives multiple word options.
5. Drawer selects a word.
6. Timer starts.
7. Drawer draws on the shared canvas.
8. Other players submit guesses.
9. Correct guesses earn points.
10. Hint letters reveal over time.
11. Round ends automatically.
12. Next drawer starts.
13. After all rounds, the winner is declared.

---

# 🏆 Scoring System

* Correct Guess = +100 Points
* Scoreboard updates instantly
* Highest score wins the game

---

# 📸 Screenshots

## Home Page

(Add Screenshot Here)

## Lobby

(Add Screenshot Here)

## Game Screen

(Add Screenshot Here)

## Result Screen

(Add Screenshot Here)

---

# 🌐 Live Demo

Frontend:

To be updated after deployment

Backend:

To be updated after deployment

---

# ✅ Assignment Requirements Covered

✅ Multiplayer Rooms

✅ Create Room with Configurable Settings

✅ Join via Room Code

✅ Join via Invite Link

✅ Lobby System

✅ Host Controlled Start

✅ Turn-Based Gameplay

✅ Real-Time Drawing Synchronization

✅ Real-Time Guessing

✅ Word Selection System

✅ Word Count Configuration

✅ Scoring System

✅ Leaderboard

✅ Winner Screen

✅ Drawer Rotation

✅ Round Timer

✅ Hint Reveal System

✅ Chat System

✅ Undo Tool

✅ Eraser Tool

✅ Clear Canvas

✅ Drawer-Only Drawing Permissions

✅ Guessers Cannot Draw

✅ Private Rooms

✅ WebSocket Synchronization

✅ OOP Architecture (Room, Game, Player Classes)

---

# 👨‍💻 Author

**Prince Raghav**

Built as part of the Skribbl.io Clone Internship Assignment.
