# Justice AI Backend Startup Script
# Run this instead of manually starting uvicorn

cd D:\justice-ai\backend

Write-Host "Loading environment variables from .env file..." -ForegroundColor Yellow
Write-Host "Please ensure OPENAI_API_KEY is set in your .env file" -ForegroundColor Yellow
Write-Host ""

Write-Host "Starting Justice AI backend..." -ForegroundColor Green
Write-Host ""

# Start the server (backend on port 3000)
uvicorn main:app --reload --host 0.0.0.0 --port 3000
