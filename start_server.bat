@echo off
cd D:\justice-ai\project\chatbot\backend
echo Starting Justice AI chatbot backend on http://localhost:3000
python -m uvicorn main:app --reload --host 0.0.0.0 --port 3000
