@echo off
REM Al Shamail App Startup Script
title Al Shamail Development Server
color 0A
cls

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║       🎓 Al Shamail - Online Academy                     ║
echo ║       Starting Development Server...                     ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo Checking pnpm installation...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: pnpm is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo ✓ Dependencies verified
echo.
echo Starting the application...
echo.

REM Start the app
pnpm start

pause
