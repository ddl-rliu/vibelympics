# 🚗🚗🚙🚙🏁🏆 Ultimate Racer

An emoji-only turn-based racing game built for Chainguard's Vibelympics competition.

## 🎮 The Game

Race around an emoji track against an AI opponent! This is a momentum-based racing game where your previous velocity affects your next possible moves. Navigate through checkpoints, avoid going off-track, and cross the finish line first to win!

### 🕹️ How to Play

1. **Start**: Click ▶️ to begin the race
2. **Move**: On your turn (🚙), click one of the 🔴 indicators to move
3. **Momentum**: Your velocity carries over - plan ahead!
4. **Checkpoints**: Pass through 1️⃣ → 2️⃣ → 3️⃣ → 🏁 in order
5. **Win**: Cross the finish line first to claim victory!

### ⚠️ Penalties

- Going on grass 🟩 = 1 turn penalty + velocity reset
- Hitting audience members = 1 turn penalty + velocity reset (they become 💀)
- Colliding with opponent = 1 turn penalty + velocity reset

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Python Flask
- **Containers**: Docker with Chainguard base images
- **Package Management**: npm (frontend), uv (backend)

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Make (optional, but recommended)

### Running the App

```bash
# Setup environment and start the app
make dev

# Or manually:
docker compose up --build
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

### Other Commands

```bash
# Just build
make build

# Start in background
make up

# Stop
make down

# View logs
make logs

# Clean up everything
make clean
```

## 📁 Project Structure

```
ultimate-racer/
├── backend/
│   ├── src/
│   │   └── app.py          # Flask API with game logic
│   ├── Dockerfile          # Chainguard Python image
│   └── pyproject.toml      # Python dependencies (uv)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Track.tsx           # Race track renderer
│   │   │   ├── VictoryPopup.tsx    # Win screen
│   │   │   └── IntroAnimation.tsx  # Tutorial animation
│   │   ├── App.tsx         # Main application
│   │   ├── api.ts          # Backend API client
│   │   ├── types.ts        # TypeScript definitions
│   │   └── index.css       # TailwindCSS styles
│   ├── Dockerfile          # Chainguard Node image
│   └── package.json        # Node dependencies
├── docker-compose.yml      # Container orchestration
├── Makefile               # Development commands
└── README.md              # This file
```

## 🎯 Game Mechanics

### Movement System

Each turn, you can adjust your velocity by -1, 0, or +1 in both X and Y directions. This creates 9 possible moves per turn (some may be out of bounds).

```
New Position = Current Position + New Velocity
New Velocity = Current Velocity + Change (-1, 0, or +1)
```

### Checkpoints

The race requires passing through checkpoints in order:
1. **Checkpoint 1** (1️⃣): Left side of track going down
2. **Checkpoint 2** (2️⃣): Bottom curve
3. **Checkpoint 3** (3️⃣): Right side going back up
4. **Finish Line** (🏁): Complete the lap!

### AI Strategy

The AI opponent targets the next checkpoint, accelerating when far and decelerating when close. It avoids off-track areas and collisions.

## 🎨 Design Philosophy

### Zero Text UI

Every visible element is an emoji:
- Buttons: ▶️, 🔄️
- Cars: 🚙 (player), 🚗 (AI)
- Track: ⬛ (tarmac), 🟩 (grass), 🏁 (finish)
- Audience: 😃, 🤓, 😎 → 😨, 😱 (when scared) → 💀 (when hit)

### Visual Feedback

- Current turn highlighted with glow
- Valid moves shown as 🔴 indicators
- History trails with semi-transparent paths
- Checkpoint progress displayed at top

## 🔧 Development

### Hot Reload

Both frontend and backend support hot reload:
- Frontend: Vite watches `/src` directory
- Backend: Flask debug mode watches Python files

### Debugging

Console logs are verbose - check browser console and terminal output for game state information.

### Environment Variables

Create a `.env` file (or run `make setup`):

```env
BACKEND_PORT=5000
FRONTEND_PORT=3000
FLASK_ENV=development
FLASK_DEBUG=1
```

## 🏆 Credits

Built for [Chainguard's Vibelympics](https://www.chainguard.dev/vibelympics) - a competition where developers build apps without looking at the code.

**The Golden Rule**: Zero text in the UI. Everything the user sees must be emoji. 🧭

---

*Now go race! 🏎️💨*
