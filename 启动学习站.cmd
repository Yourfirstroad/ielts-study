@echo off
cd /d "%~dp0"
if not exist node_modules (
  call npm ci
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Open http://127.0.0.1:5186/ in your browser.
call npm run dev
pause
