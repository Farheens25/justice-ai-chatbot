# Justice AI Backend Startup Script

cd D:\justice-ai\project\chatbot\backend

Write-Host "Starting Justice AI chatbot backend on http://localhost:3000" -ForegroundColor Green
python -m uvicorn main:app --reload --host 0.0.0.0 --port 3000
