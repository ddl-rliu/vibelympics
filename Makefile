# Flaming Hot Auditor - Makefile
# Standard entrypoints for building and running the application

.PHONY: all build up down restart logs clean dev test help

# Default target
all: help

# Build all containers
build:
	@echo "🔥 Building Flaming Hot Auditor containers..."
	docker-compose build

# Start all containers
up:
	@echo "🚀 Starting Flaming Hot Auditor..."
	docker-compose up -d
	@echo ""
	@echo "✨ Flaming Hot Auditor is running!"
	@echo "   Frontend: http://localhost:5173"
	@echo "   Backend:  http://localhost:5000"

# Stop all containers
down:
	@echo "🛑 Stopping Flaming Hot Auditor..."
	docker-compose down

# Restart all containers
restart: down up

# View logs
logs:
	docker-compose logs -f

# View logs for specific service
logs-backend:
	docker-compose logs -f backend

logs-frontend:
	docker-compose logs -f frontend

# Clean up containers and images
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v --rmi all --remove-orphans
	@echo "✅ Cleanup complete"

# Development mode - build and start with logs
dev: build up logs

# Run backend tests with curl
test:
	@echo "🧪 Testing backend health endpoint..."
	@curl -s http://localhost:5000/health | python3 -m json.tool
	@echo ""
	@echo "🧪 Testing audit endpoint with urllib3..."
	@curl -s -X POST http://localhost:5000/api/audit \
		-H "Content-Type: application/json" \
		-d '{"ecosystem": "PyPI", "name": "urllib3"}' | python3 -m json.tool | head -50
	@echo ""
	@echo "✅ Tests complete"

# Test malicious package
test-malicious:
	@echo "🧪 Testing malicious package detection with controlurl..."
	@curl -s -X POST http://localhost:5000/api/audit \
		-H "Content-Type: application/json" \
		-d '{"ecosystem": "PyPI", "name": "controlurl"}' | python3 -m json.tool

# Show help
help:
	@echo "🏠 Flaming Hot Auditor 🔥"
	@echo ""
	@echo "Available commands:"
	@echo "  make build         - Build all Docker containers"
	@echo "  make up            - Start all containers in background"
	@echo "  make down          - Stop all containers"
	@echo "  make restart       - Restart all containers"
	@echo "  make logs          - View logs from all containers"
	@echo "  make logs-backend  - View backend logs only"
	@echo "  make logs-frontend - View frontend logs only"
	@echo "  make clean         - Remove all containers and images"
	@echo "  make dev           - Build, start, and show logs"
	@echo "  make test          - Run API tests with curl"
	@echo "  make test-malicious - Test malicious package detection"
	@echo "  make help          - Show this help message"

