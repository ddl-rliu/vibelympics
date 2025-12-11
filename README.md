# 🏠 Flaming Hot Auditor 🔥

A stunning package vulnerability auditor with 3D visualization. Built for the **Chainguard Vibelympics** competition - a showcase of AI-assisted development.

![Flaming Hot Auditor](https://img.shields.io/badge/Vibelympics-2024-orange)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![Chainguard](https://img.shields.io/badge/Chainguard-Images-green)
![React](https://img.shields.io/badge/React-Three.js-61dafb)

## 🎯 Overview

Flaming Hot Auditor transforms package vulnerability data into an engaging 3D experience. Houses represent package versions, and the amount of fire on each house indicates the severity and number of vulnerabilities. It's security auditing that brings a smile!

### ✨ Features

- 🏘️ **3D House Visualization**: Each package version is a house rendered with Three.js
- 🔥 **Animated Flames**: Fire intensity corresponds to vulnerability severity (Critical > High > Moderate > Low)
- 😊😐😱 **Expressive Faces**: Houses show emotions based on vulnerability count
- 🚨 **Malicious Package Detection**: Red background and warning for typosquatting/malicious packages
- 📋 **Post-it Note Details**: Click a house to see vulnerability details on colorful sticky notes
- 🌐 **Multi-Ecosystem Support**: PyPI, npm, Maven, and Go packages
- 📱 **Responsive Design**: Works on desktop and mobile browsers

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Make (optional, for convenience commands)

### Running the Application

```bash
# Clone and navigate to the project
cd round_2

# Build and start the containers
make dev

# Or without make:
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 📖 Usage Guide

### Basic Search

1. Select an ecosystem (PyPI, npm, Maven, or Go)
2. Enter a package name (e.g., `urllib3`, `flask`, `requests`)
3. Optionally specify a version
4. Click "🔥 Audit Package"

### Navigating the 3D Scene

- **Scroll/Drag**: Navigate left/right through versions
- **Click House**: Enter to see vulnerability details
- **Orbit Controls**: Rotate and zoom the 3D view

### URL Parameters (for demos and testing)

```
http://localhost:5173?package=flask
http://localhost:5173?package=flask&ecosystem=PyPI
http://localhost:5173?package=flask&version=0.5&view=details
```

| Parameter | Description | Default |
|-----------|-------------|---------|
| `package` | Package name to search | - |
| `ecosystem` | Package ecosystem | PyPI |
| `version` | Specific version to focus on | latest |
| `view` | Set to `details` to show vulnerability notes | - |

## 🧪 Testing

### Test Packages

| Package | Ecosystem | Expected Result |
|---------|-----------|-----------------|
| `urllib3` | PyPI | 112 versions, many vulnerabilities |
| `flask` | PyPI | 59 versions, various vulnerabilities |
| `controlurl` | PyPI | Malicious package warning (MAL-2023-2595) |
| `requests` | PyPI | Various vulnerabilities |

### API Testing with curl

```bash
# Health check
curl http://localhost:5000/health

# Audit a package
curl -X POST http://localhost:5000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"ecosystem": "PyPI", "name": "urllib3"}'

# Test malicious package detection
curl -X POST http://localhost:5000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"ecosystem": "PyPI", "name": "controlurl"}'
```

### Using Make

```bash
make test           # Test with urllib3
make test-malicious # Test with controlurl (malicious)
```

## 🏗️ Architecture

```
round_2/
├── backend/
│   ├── app.py           # Flask API server with OSV integration
│   ├── pyproject.toml   # Python dependencies
│   └── Dockerfile       # Chainguard Python image
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Main application component
│   │   └── components/
│   │       ├── SearchForm.jsx         # Search UI with ecosystem dropdown
│   │       ├── HouseScene.jsx         # Three.js 3D house visualization
│   │       └── VulnerabilityView.jsx  # Post-it notes detail view
│   ├── package.json     # Node dependencies
│   ├── tailwind.config.js
│   └── Dockerfile       # Chainguard Node image
├── docker-compose.yml   # Container orchestration
├── Makefile            # Convenience commands
├── .env                # Environment configuration
└── README.md           # This file
```

## 🎨 Design System

### Color Palette

**House Colors (Pastel)**:
- Pink: `#FCCCC7`
- Mauve: `#E3AFBD`
- Cream: `#FAF7E4`
- Blue: `#BBE3F0`
- Peach: `#F4D4B2`

**Severity Colors**:
- Critical: Red `#dc2626`
- High: Orange `#ea580c`
- Moderate: Yellow `#f59e0b`
- Low: Green `#84cc16`

**Fire Gradient**: Yellow → Orange → Red (with black outline)

### Typography

- Display: Righteous (headers)
- Body: Space Mono (monospace)

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| Backend | Flask (Python 3.14) |
| Package Management | pip (user install) |
| Frontend | React 18 + Vite 5 |
| 3D Rendering | Three.js + @react-three/fiber + drei |
| Styling | TailwindCSS |
| API | OSV (Open Source Vulnerabilities) |
| Containers | Chainguard secure base images |

## 📝 Make Commands

| Command | Description |
|---------|-------------|
| `make build` | Build all Docker containers |
| `make up` | Start containers in background |
| `make down` | Stop containers |
| `make restart` | Restart all containers |
| `make logs` | View container logs |
| `make dev` | Build, start, and follow logs |
| `make test` | Run API tests |
| `make clean` | Remove containers and images |
| `make help` | Show help message |

## 🔒 Security Notes

- Uses **Chainguard secure base images** (non-root by default)
- Python container runs as `nonroot` user
- Node container runs as `node` user
- No secrets or credentials required (OSV API is public)
- All network requests go through Docker network

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :5173
lsof -i :5000

# Stop existing containers
docker-compose down
docker stop $(docker ps -aq)
```

### Hot Reload Not Working

- Ensure volume mounts are correctly configured in `docker-compose.yml`
- Check file permissions in the containers
- Try rebuilding: `make clean && make dev`

### Container Permission Errors

Chainguard images run as non-root users. Fix ownership in Dockerfiles:
```dockerfile
COPY --chown=nonroot:nonroot . .  # Python
COPY --chown=node:node . .        # Node
```

## 📚 API Reference

### Health Check

```
GET /health

Response: { "status": "healthy", "service": "flaming-hot-auditor" }
```

### Audit Package

```
POST /api/audit
Content-Type: application/json

Body:
{
  "ecosystem": "PyPI",  // PyPI | npm | Maven | Go
  "name": "package-name"
}

Response:
{
  "package": { "ecosystem": "PyPI", "name": "..." },
  "versions": ["1.0.0", "1.0.1", ...],
  "vulnerabilities": [...],
  "is_malicious": false,
  "malicious_details": null,
  "total_vulnerabilities": 5
}
```

## 🏆 Credits

Built for the [Chainguard Vibelympics](https://chainguard.dev) competition.

Powered by the [OSV API](https://osv.dev/) for vulnerability data.

---

🔥 *Making security auditing delightful, one flaming house at a time.* 🏠

**Definition of Done Checklist**:
- ✅ `docker compose up` starts both containers cleanly
- ✅ App loads in browser
- ✅ Tested with urllib3 (many versions)
- ✅ Tested with controlurl (malicious package)
- ✅ Main overview shows houses corresponding to package versions
- ✅ Selecting a house shows vulnerability details
- ✅ Browser tab shows 🏠 Flaming Hot Auditor 🔥
- ✅ README explains how to run the app
- ✅ Git history shows meaningful progression
