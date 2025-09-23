@echo off
echo.
echo ========================================
echo  Cursor Share Sync - Team Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org
    echo Then run this setup again.
    pause
    exit /b 1
)

echo ✅ Node.js detected
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed
echo.

REM Build the project
echo 🔨 Building project...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build project
    pause
    exit /b 1
)

echo ✅ Project built successfully
echo.

REM Check if .env file exists
if not exist ".env" (
    echo 📋 Creating environment file...
    copy ".env.example" ".env"
    echo.
    echo ⚠️  IMPORTANT: You need to configure your .env file!
    echo.
    echo 1. Open .env in a text editor
    echo 2. Add your Supabase credentials:
    echo    - SUPABASE_URL=your-project-url
    echo    - SUPABASE_ANON_KEY=your-anon-key
    echo 3. Add your workspace configuration:
    echo    - WORKSPACE_ID=your-workspace-id
    echo    - USER_ID=your-user-id
    echo.
    echo Then run: npm start
    echo.
) else (
    echo ✅ Environment file exists
    echo.
    echo 🚀 Setup complete!
    echo.
    echo To start the file watcher, run:
    echo   npm start
    echo.
    echo Your cursor-share folder will be created automatically.
    echo Drop markdown files there to sync with your team!
    echo.
)

pause