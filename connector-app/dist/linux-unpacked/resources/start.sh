#!/bin/bash

# ✅ Check if Docker is installed
if ! command -v docker &> /dev/null; then
  echo "🚨 Docker is not installed. Installing Docker..."

  # Auto-install Docker on Debian/Ubuntu
  sudo apt update
  sudo apt install -y docker.io docker-compose

  sudo systemctl enable docker
  sudo systemctl start docker
else
  echo "✅ Docker is already installed."
fi

# ✅ Check if Docker daemon is running
if ! pgrep -x "dockerd" > /dev/null; then
  echo "⚠️ Docker daemon is not running. Attempting to start..."
  sudo systemctl start docker
fi

# ✅ Navigate to the directory where docker-compose.yml is placed
cd "$(dirname "$0")"

# ✅ Start Docker backend
echo "🚀 Starting backend via Docker Compose..."
docker compose up -d
