@echo off
title Shakib Studio Hub Desktop App
cd /d "%~dp0"
:: Electron is installed inside this project by "For New PC\Start_Setup_For_New_PC.bat".
:: This makes the launcher independent of the Photo Editor folder and its name.
set "ELECTRON=%~dp0node_modules\electron\dist\electron.exe"
if not exist "%ELECTRON%" (
    echo First-time setup is required. Starting it now...
    call "%~dp0For New PC\Start_Setup_For_New_PC.bat"
    exit /b %ERRORLEVEL%
)
start "" "%ELECTRON%" "%~dp0main-electron.js"
exit
