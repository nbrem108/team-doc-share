#!/bin/bash

echo ""
echo "========================================"
echo " Cursor Share Sync - Team Setup"
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ ERROR: Node.js is not installed!"
    echo "Please install Node.js from https://nodejs.org"
    echo "Then run this setup again."
    exit 1
fi

echo "✅ Node.js detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Build the project
echo "🔨 Building project..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to build project"
    exit 1
fi

echo "✅ Project built successfully"
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📋 Creating environment file..."
    cp ".env.example" ".env"
    echo ""
    echo "⚠️  IMPORTANT: You need to configure your .env file!"
    echo ""
    echo "1. Open .env in a text editor"
    echo "2. Add your Supabase credentials:"
    echo "   - SUPABASE_URL=your-project-url"
    echo "   - SUPABASE_ANON_KEY=your-anon-key"
    echo "3. Add your workspace configuration:"
    echo "   - WORKSPACE_ID=your-workspace-id"
    echo "   - USER_ID=your-user-id"
    echo ""
    echo "Then run: npm start"
    echo ""
else
    echo "✅ Environment file exists"
    echo ""
    echo "🚀 Setup complete!"
    echo ""
    echo "To start the file watcher, run:"
    echo "  npm start"
    echo ""
    echo "Your cursor-share folder will be created automatically."
    echo "Drop markdown files there to sync with your team!"
    echo ""
fi