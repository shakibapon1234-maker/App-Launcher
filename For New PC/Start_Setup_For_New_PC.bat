@echo off
setlocal
title Shakib Studio Hub - New PC Setup
cd /d "%~dp0"

:: Keep the setup logic in PowerShell so it can detect/install Node.js reliably.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Setup-New-PC.ps1"
set "SETUP_EXIT=%ERRORLEVEL%"

if not "%SETUP_EXIT%"=="0" (
    echo.
    echo Setup did not finish. Read the message above, then run this file again.
    pause
)
exit /b %SETUP_EXIT%
