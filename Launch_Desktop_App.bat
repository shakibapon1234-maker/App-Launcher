@echo off
title Shakib Studio Hub Desktop App
cd /d "%~dp0"
:: Keep this relative so the Hub can be cloned on another PC or drive.
set "ELECTRON=%~dp0..\..\Warisha Fasion\photo and text editor\photo-and-text-editor\node_modules\electron\dist\electron.exe"
if not exist "%ELECTRON%" (
    echo Desktop Hub could not find Electron.
    echo Expected: %ELECTRON%
    echo Keep the Photo and Text Editor project beside Studio-Launcher,
    echo or run start.bat to use the Hub in your web browser.
    pause
    exit /b 1
)
start "" "%ELECTRON%" "%~dp0main-electron.js"
exit
