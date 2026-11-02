@echo off
echo.
echo ╔══════════════════════════════════════════════╗
echo ║       BugTracker - Quick Setup Script        ║
echo ╚══════════════════════════════════════════════╝
echo.

echo [1/4] Installing dependencies...
call npm run install:all
if %errorlevel% neq 0 (echo ERROR: npm install failed & pause & exit /b 1)

echo.
echo [2/4] Dependencies installed!
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo IMPORTANT: Before continuing, make sure:
echo   1. PostgreSQL is running on your machine
echo   2. Edit server\.env with your PostgreSQL password
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause

echo [3/4] Running database migrations...
call npm run migrate
if %errorlevel% neq 0 (echo ERROR: Migration failed. Check PostgreSQL connection & pause & exit /b 1)

echo.
echo [4/4] Seeding sample data...
call npm run seed
if %errorlevel% neq 0 (echo ERROR: Seed failed & pause & exit /b 1)

echo.
echo ╔══════════════════════════════════════════════╗
echo ║         Setup Complete! Starting app...      ║
echo ║                                              ║
echo ║  Frontend: http://localhost:5173             ║
echo ║  Backend:  http://localhost:5000             ║
echo ║                                              ║
echo ║  Demo Login:                                 ║
echo ║    admin@bugtracker.com / admin123           ║
echo ╚══════════════════════════════════════════════╝
echo.
call npm run dev
