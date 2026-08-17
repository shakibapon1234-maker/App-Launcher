@echo off
title Shakib Studio Hub - Local Controller
cd /d "%~dp0"

echo ========================================================
echo         Shakib Studio Hub - Starting Server
echo ========================================================
echo.

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on this computer!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Kill any old server on port 4500 so new code runs fresh
echo [1/3] Refreshing background server on Port 4500...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":4500" ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
)

echo [2/3] Launching Shakib Studio Hub Server with Auto-Folder Detection...
start "Shakib Studio Hub Server" /min cmd /c "node server.js"

timeout /t 2 /nobreak >nul

echo [3/3] Opening Studio Hub in your Browser...
start http://localhost:4500

echo.
echo ========================================================
echo   Shakib Studio Hub is ACTIVE! (http://localhost:4500)
echo   Local desktop features and folder links are now ready.
echo ========================================================
echo.
pause
