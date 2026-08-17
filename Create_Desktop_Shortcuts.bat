@echo off
title Create Desktop Shortcut for Shakib Studio Hub
cd /d "%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $s = $ws.CreateShortcut((Join-Path $desktop 'Shakib Studio Hub.lnk')); $s.TargetPath = '%~dp0Launch_Desktop_App.bat'; $s.WorkingDirectory = '%~dp0'; $s.Description = 'Shakib Studio Hub Desktop'; $s.Save()"

echo ========================================================
echo   Desktop shortcut 'Shakib Studio Hub' created!
echo ========================================================
timeout /t 3 >nul
