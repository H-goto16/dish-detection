.PHONY: help build up down logs shell frontend backend dev clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make build     - Build the development Docker image"
	@echo "  make up        - Start all services (frontend + backend)"
	@echo "  make dev       - Start development container with shell access"
	@echo "  make frontend  - Start frontend with hot reloading"
	@echo "  make backend   - Start backend with hot reloading"
	@echo "  make logs      - Show logs from all services"
	@echo "  make shell     - Access development container shell"
	@echo "  make down      - Stop all services"
	@echo "  make clean     - Remove containers and images"

# Build the development image
build:
	docker-compose build

# Start all services
up:
	docker-compose up -d

# Start development container with interactive shell
dev:
	docker-compose run --rm dev

# Start frontend with hot reloading
frontend:
	docker-compose up frontend

# Start backend with hot reloading
backend:
	docker-compose up backend

# Show logs
logs:
	docker-compose logs -f

# Access shell in running container
shell:
	docker-compose exec dev bash

# Stop all services
down:
	docker-compose down

# Clean up
clean:
	docker-compose down -v --rmi all --remove-orphans
