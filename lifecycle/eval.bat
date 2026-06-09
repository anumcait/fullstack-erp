@echo off
title AgroAI - Evaluation Run
echo.
echo ========================================
echo   AgroAI - Evaluation
echo   Scoring against 20 golden Q^&A pairs
echo ========================================
echo.
echo [PRE-CHECK] FastAPI backend must be running first.
echo             If not started yet, run start.bat first.
echo.

:: Wait a moment so user can read
timeout /t 3 /nobreak > nul

:: Run evaluation
echo [EVAL] Starting evaluation run...
echo        Results will appear below and on LangSmith.
echo.
cd /d C:\Users\sai
python -m lifecycle.evaluation.run_eval

echo.
echo ========================================
echo   Evaluation complete!
echo   View results: https://smith.langchain.com
echo   Project: lifecycle-agri-agent ^> Experiments
echo ========================================
echo.
pause
