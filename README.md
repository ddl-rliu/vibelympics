# 🏠 Flaming Hot Auditor 🔥

A stunning package vulnerability auditor with 3D visualization. Built for the Chainguard Vibelympics competition.

![Flaming Hot Auditor](https://img.shields.io/badge/Vibelympics-2024-orange)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)
![Chainguard](https://img.shields.io/badge/Chainguard-Images-green)

## Overview

Flaming Hot Auditor is a visual package security tool that queries the [OSV (Open Source Vulnerabilities)](https://osv.dev/) API to display vulnerability information in an engaging 3D interface. Houses represent package versions, and the amount of fire on each house indicates the severity and number of vulnerabilities.

### Features

- 🏘️ **3D House Visualization**: Each package version is a house - the more fires, the more vulnerabilities
- 🔥 **Animated Flames**: Fire intensity corresponds to vulnerability severity (Critical > High > Moderate > Low)
- 😊😐😱 **Expressive Faces**: Houses show emotions based on their vulnerability count
- 🚨 **Malicious Package Detection**: Red background and warning for typosquatting/malicious packages
- 📋 **Post-it Note Details**: Click a house to see vulnerability details on sticky notes
- 🌐 **Multi-Ecosystem Support**: PyPI, npm, Maven, and Go packages

## Quick Start

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
docker-compose up
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

### Usage

1. Select an ecosystem (PyPI, npm, Maven, or Go)
2. Enter a package name (e.g., `urllib3`, `flask`, `requests`)
3. Optionally specify a version
4. Click "🔥 Audit Package"
5. Explore the houses - click one to see vulnerability details

## Testing

### Test Packages

| Package | Ecosystem | Expected Result |
|---------|-----------|-----------------|
| `urllib3` | PyPI | Many versions, various vulnerabilities |
| `controlurl` | PyPI | Malicious package warning |
| `flask` | PyPI | Multiple vulnerabilities |
| `requests` | PyPI | Various vulnerabilities |

### API Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test audit endpoint
curl -X POST http://localhost:5000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"ecosystem": "PyPI", "name": "urllib3"}'

# Test malicious package
curl -X POST http://localhost:5000/api/audit \
  -H "Content-Type: application/json" \
  -d '{"ecosystem": "PyPI", "name": "controlurl"}'
```

Or use Make:

```bash
make test           # Test urllib3
make test-malicious # Test controlurl (malicious)
```

## Architecture

```
round_2/
├── backend/
│   ├── app.py           # Flask API server
│   ├── pyproject.toml   # Python dependencies (uv)
│   └── Dockerfile       # Chainguard Python image
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   └── components/
│   │       ├── SearchForm.jsx   # Search UI
│   │       ├── HouseScene.jsx   # Three.js 3D scene
│   │       └── VulnerabilityView.jsx # Post-it notes view
│   ├── package.json     # Node dependencies
│   └── Dockerfile       # Chainguard Node image
├── docker-compose.yml   # Container orchestration
├── Makefile            # Convenience commands
└── .env                # Environment configuration
```

## Technology Stack

- **Backend**: Flask (Python) with uv for package management
- **Frontend**: React + Vite + Three.js + TailwindCSS
- **Containers**: Chainguard secure base images
- **API**: OSV (Open Source Vulnerabilities) API

## Make Commands

| Command | Description |
|---------|-------------|
| `make build` | Build all containers |
| `make up` | Start containers in background |
| `make down` | Stop containers |
| `make restart` | Restart all containers |
| `make logs` | View container logs |
| `make dev` | Build, start, and follow logs |
| `make test` | Run API tests |
| `make clean` | Remove containers and images |

## Security Notes

- Uses Chainguard secure base images (non-root by default)
- Python container runs as `nonroot` user
- Node container runs as `node` user
- No secrets or credentials required (OSV API is public)

## Development

Hot reload is enabled for both frontend and backend:

- **Frontend**: Changes to `src/` are reflected immediately
- **Backend**: Changes to `app.py` trigger server restart

## Credits

Built for the [Chainguard Vibelympics](https://chainguard.dev) competition.

Powered by the [OSV API](https://osv.dev/) for vulnerability data.

---

🔥 *Making security auditing delightful, one flaming house at a time.* 🏠
