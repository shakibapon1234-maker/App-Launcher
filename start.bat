@echo off
title Shakib Studio Hub - Local Launcher
cd /d "%~dp0"

echo ========================================================
echo         Shakib Studio Hub - Central Control
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this PC!
    echo Please install Node.js from https://nodejs.org/ to use Local Desktop features.
    echo.
    echo Opening Cloud Hub in your browser instead...
    start https://shakibapon1234-maker.github.io/App-Launcher/
    pause
    exit /b
)

echo [1/2] Starting Studio Hub Local Server on Port 4500...
start /b "" node server.js

timeout /t 2 /nobreak >nul

echo [2/2] Opening Studio Hub in Browser...
start http://localhost:4500

echo.
echo ========================================================
echo  Shakib Studio Hub is ACTIVE! (http://localhost:4500)
echo  Keep this window minimized while using Studio Apps.
echo ========================================================
echo.
pause
