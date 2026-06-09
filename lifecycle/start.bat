@echo off
title AgroAI - Local Deployment
echo.
echo ========================================
echo   AgroAI - Agricultural AI Agent
echo   Local Deployment Startup
echo ========================================
echo.

:: Start FastAPI backend in a new terminal window
echo [1/2] Starting FastAPI backend on http://localhost:8000 ...
start "AgroAI - FastAPI Backend" cmd /k "cd /d "%~dp0.." && "%~dp0.venv\Scripts\uvicorn.exe" lifecycle.main:app --reload --port 8000"

:: Wait 5 seconds for FastAPI to initialize
echo     Waiting for backend to start...
timeout /t 5 /nobreak > nul

:: Start Streamlit UI in a new terminal window
echo [2/2] Starting Streamlit UI on http://localhost:8501 ...
start "AgroAI - Streamlit UI" cmd /k "cd /d "%~dp0.." && "%~dp0.venv\Scripts\streamlit.exe" run lifecycle/application/app.py"

echo.
echo ========================================
echo   Both services starting!
echo   FastAPI  -^> http://localhost:8000
echo   API Docs -^> http://localhost:8000/docs
echo   Chat UI  -^> http://localhost:8501
echo ========================================
echo.
pause
