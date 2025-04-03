@echo off
cd /d "%~dp0"
start backend\run_backend.bat
start "" "%~dp0\ConnectorApp.exe"
exit
