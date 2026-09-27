@echo off
setlocal
cd /d "%~dp0"
if not exist "node_modules\.bin\vite.cmd" (
  echo Installing local development dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo Unable to install dependencies. Repair or reinstall Node.js LTS with npm, then run this file again.
    pause
    exit /b 1
  )
)
call npm run dev
