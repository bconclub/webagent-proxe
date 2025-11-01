#!/bin/bash
# VPS Deployment Script for PROXe/Wind Chasers
# This script pulls latest code from git and restarts the server

echo "=== PROXe VPS Deployment Script ==="
echo ""

# Navigate to project directory (adjust path as needed)
PROJECT_DIR="/home/webagent/backend"
cd "$PROJECT_DIR" || exit

echo "📥 Pulling latest code from git..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull failed!"
    exit 1
fi

echo "✅ Code updated successfully"
echo ""

# Install/update dependencies if package.json changed
echo "📦 Installing dependencies..."
cd backend
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed!"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Restart server with PM2 (if using PM2)
if command -v pm2 &> /dev/null; then
    echo "🔄 Restarting server with PM2..."
    pm2 restart webagent-backend || pm2 start backend/server.js --name webagent-backend
    
    if [ $? -eq 0 ]; then
        echo "✅ Server restarted with PM2"
        pm2 save
    else
        echo "⚠️  PM2 restart failed, trying to start server directly..."
        cd backend
        nohup node server.js > /dev/null 2>&1 &
        echo "✅ Server started"
    fi
else
    echo "⚠️  PM2 not found. Starting server with nohup..."
    cd backend
    # Kill existing node processes on port 3000
    fuser -k 3000/tcp 2>/dev/null
    nohup node server.js > server.log 2>&1 &
    echo "✅ Server started (PID: $!)"
    echo "📋 Check logs with: tail -f server.log"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Server should be running at:"
echo "  - Main: http://your-vps-ip:3000/"
echo "  - Wind Chasers: http://your-vps-ip:3000/windchasers-proxe"
echo "  - Health: http://your-vps-ip:3000/api/health"

