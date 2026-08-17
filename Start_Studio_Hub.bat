@echo off
title Shakib Studio Hub - Central Control Center
echo ========================================================
echo         Shakib Studio Hub - Central Control
echo ========================================================
echo.

cd /d "%~dp0"

echo [1/2] Starting Shakib Studio Hub Server on Port 4500...
start /b "" node server.js

timeout /t 2 /nobreak >nul

echo [2/2] Opening Studio Hub in your Browser...
start http://localhost:4500

echo.
echo ========================================================
echo  Shakib Studio Hub is active! (Port 4500)
echo  You can minimize this window while working.
echo ========================================================
echo.
pause
