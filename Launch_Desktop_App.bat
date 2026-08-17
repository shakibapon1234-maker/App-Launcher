@echo off
title Shakib Studio Hub Desktop App
cd /d "%~dp0"
set "ELECTRON=D:\Main Branch\app helper\Warisha Fasion\photo and text editor\photo-and-text-editor\node_modules\electron\dist\electron.exe"
start "" "%ELECTRON%" "%~dp0main-electron.js"
exit
