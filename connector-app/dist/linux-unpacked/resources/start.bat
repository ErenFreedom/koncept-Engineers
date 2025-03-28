@echo off

REM ✅ Check if Docker is installed
where docker >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
  echo 🚨 Docker is not installed. Please install Docker Desktop from:
  echo https://www.docker.com/products/docker-desktop
  pause
  exit /b
)

REM ✅ Navigate to the directory where docker-compose.yml is located
cd /d %~dp0

REM ✅ Start backend container
echo 🚀 Starting backend Docker container...
docker compose up -d
pause
