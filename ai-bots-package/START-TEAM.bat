@echo off
title Free AI Agent Team
color 0E
cd /d "%~dp0"

echo ============================================================
echo            STARTING FREE AI AGENT TEAM
echo ============================================================
echo.

REM --- Make sure Python is available ---
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH.
    echo Install Python from https://www.python.org/downloads/
    echo Then run this file again.
    echo.
    pause
    exit /b
)

REM --- Make sure required packages are installed (quietly) ---
python -c "import flask, requests" >nul 2>&1
if errorlevel 1 (
    echo Installing required packages ^(one-time^)...
    python -m pip install flask requests --quiet
    echo Done.
    echo.
)

echo Your AI Agent Team is starting up...
echo.
echo   Keep THIS window open while you use your IDE.
echo   To stop the AI, just close this window.
echo.
echo   PRIMARY MODEL: qwen/qwen3-next-80b-a3b-instruct:free
echo   ^(Closest to Claude Opus, fast, 1M context, FREE^)
echo.
echo   By default this uses only FREE models (no credits needed).
echo   To have it try real Claude models FIRST (strongest brain first,
echo   paid/billed per token), add this line to my-keys.env:
echo     ANTHROPIC_API_KEY=sk-ant-...
echo.
echo ------------------------------------------------------------
echo   IDE SETTINGS ^(copy these into Cursor / Antigravity / Continue^):
echo.
echo     Base URL :  http://localhost:8080/v1
echo     API Key  :  local
echo     Model    :  auto
echo.
echo   LOG FILE:
echo     %~dp0ai-agent-team.log
echo ------------------------------------------------------------
echo.

set TEAM_MAX_TOKENS=2000
set BEST_MODEL=qwen/qwen3-next-80b-a3b-instruct:free
python "%~dp0ai-agent-team.py"

echo.
echo AI stopped. You can close this window.
pause