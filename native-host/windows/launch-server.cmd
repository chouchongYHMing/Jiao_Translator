@echo off
cd /d "%~dp0..\..\server"
if errorlevel 1 (
  echo Could not find the server directory. Run install.ps1 again.
  exit /b 1
)
call ".venv\Scripts\activate.bat"
if errorlevel 1 (
  echo Could not activate the virtual environment.
  exit /b 1
)
".venv\Scripts\python.exe" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
