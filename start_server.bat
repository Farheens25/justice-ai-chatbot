@echo off
setlocal enabledelayedexpansion
cd D:\justice-ai\backend
echo Loading environment variables from .env file...
echo Please ensure OPENAI_API_KEY is set in your .env file
echo.
echo Starting Justice AI backend...
echo.
rem Start the server (backend on port 3000)
uvicorn main:app --reload --host 0.0.0.0 --port 3000
