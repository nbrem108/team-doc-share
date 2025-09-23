@echo off
echo.
echo ========================================
echo  Setting up SECOND instance for testing
echo ========================================
echo.

REM Create a test directory
set TEST_DIR="%USERPROFILE%\Desktop\cursor-share-test"
echo 📁 Creating test directory: %TEST_DIR%
mkdir %TEST_DIR% 2>nul

REM Copy necessary files
echo 📋 Copying application files...
copy /Y "dist\index.js" %TEST_DIR%\
copy /Y ".env.example" %TEST_DIR%\
copy /Y "package.json" %TEST_DIR%\

REM Copy your current .env for testing
copy /Y ".env" %TEST_DIR%\

REM Create a different user ID for testing
echo.
echo 🔧 Creating test configuration...
echo # Test Instance Configuration > %TEST_DIR%\.env.test
echo SUPABASE_URL=%SUPABASE_URL% >> %TEST_DIR%\.env.test
echo SUPABASE_ANON_KEY=%SUPABASE_ANON_KEY% >> %TEST_DIR%\.env.test
echo WORKSPACE_ID=%WORKSPACE_ID% >> %TEST_DIR%\.env.test
echo USER_ID=test-user-2 >> %TEST_DIR%\.env.test
echo WATCH_FOLDER=./cursor-share-test >> %TEST_DIR%\.env.test

echo.
echo ✅ Second instance ready!
echo.
echo To test:
echo 1. Open a new terminal
echo 2. cd %TEST_DIR%
echo 3. Rename .env.test to .env
echo 4. Run: node index.js
echo.
echo This will create a cursor-share-test folder.
echo Files from both instances will sync to the same workspace!
echo.

pause