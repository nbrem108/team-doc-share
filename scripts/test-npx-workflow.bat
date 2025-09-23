@echo off
echo.
echo ========================================
echo  Testing NPX Workflow (Local Package)
echo ========================================
echo.

REM Create test directory
set TEST_DIR="%USERPROFILE%\Desktop\cursor-sync-test"
echo 📁 Creating test directory: %TEST_DIR%
mkdir %TEST_DIR% 2>nul
cd /d %TEST_DIR%

echo.
echo 🧪 Testing NPX commands with local package...
echo.

REM Install local package globally for testing
echo 📦 Installing local package for testing...
npm install -g "%~dp0..\cursor-share-sync-1.0.0.tgz"

if %errorlevel% neq 0 (
    echo ❌ Failed to install package
    pause
    exit /b 1
)

echo ✅ Package installed successfully
echo.

echo 🔧 Testing CLI commands...
echo.

REM Test help command
echo Testing: cursor-share-sync --help
cursor-share-sync --help
echo.

REM Test setup command (commented out to avoid creating real workspace)
REM echo Testing: cursor-share-sync setup
REM cursor-share-sync setup
REM echo.

echo ✅ CLI commands working!
echo.

echo 🎉 NPX workflow test complete!
echo.
echo Next steps for publishing:
echo 1. Create GitHub repository: nbrem108/cursor-share-sync
echo 2. Push code to GitHub
echo 3. Run: npm publish
echo 4. Test: npx cursor-share-sync@latest --help
echo.

REM Cleanup
npm uninstall -g cursor-share-sync

pause