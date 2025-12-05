.PHONY: build up down restart logs clean dev setup help

# Default target
help:
	@echo "🚗🚗🚙🚙🏁🏆 Ultimate Racer - Emoji Racing Game"
	@echo ""
	@echo "Available commands:"
	@echo "  make setup    - Create .env file and prepare environment"
	@echo "  make build    - Build all Docker containers"
	@echo "  make up       - Start all services"
	@echo "  make dev      - Build and start with logs"
	@echo "  make down     - Stop all services"
	@echo "  make restart  - Restart all services"
	@echo "  make logs     - View logs from all services"
	@echo "  make clean    - Remove all containers, images, and volumes"

# Setup environment
setup:
	@if [ ! -f .env ]; then \
		echo "BACKEND_PORT=5000" > .env; \
		echo "FRONTEND_PORT=3000" >> .env; \
		echo "FLASK_ENV=development" >> .env; \
		echo "FLASK_DEBUG=1" >> .env; \
		echo "✅ Created .env file"; \
	else \
		echo "ℹ️  .env file already exists"; \
	fi

# Build containers
build:
	docker compose build

# Start services in background
up:
	docker compose up -d

# Development mode - build and show logs
dev: setup build
	docker compose up

# Stop services
down:
	docker compose down

# Restart services
restart: down up

# View logs
logs:
	docker compose logs -f

# Clean everything
clean:
	docker compose down -v --rmi all --remove-orphans

