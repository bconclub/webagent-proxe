#!/bin/bash
# VPS Deployment Script for PROXe/Wind Chasers
# This script pulls latest code from git and restarts the server

echo "=== PROXe VPS Deployment & Troubleshooting Script ==="
echo ""

# Check if server is running
echo "📊 Checking server status..."
if command -v pm2 &> /dev/null; then
    pm2_status=$(pm2 list | grep webagent-backend || echo "not found")
    if [[ $pm2_status == *"online"* ]]; then
        echo "✅ Server is running (PM2)"
    elif [[ $pm2_status == *"stopped"* ]]; then
        echo "⚠️  Server is stopped (PM2)"
    else
        echo "⚠️  Server not found in PM2"
    fi
else
    echo "⚠️  PM2 not found, checking for Node processes..."
    if pgrep -f "node.*server.js" > /dev/null; then
        echo "✅ Node server process found"
    else
        echo "⚠️  No Node server process found"
    fi
fi

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
    
    # Check if process exists
    if pm2 list | grep -q webagent-backend; then
        pm2 restart webagent-backend
    else
        cd backend
        pm2 start server.js --name webagent-backend
        pm2 save
    fi
    
    if [ $? -eq 0 ]; then
        echo "✅ Server restarted with PM2"
        pm2 save
        
        # Wait a moment and check status
        sleep 2
        echo ""
        echo "📊 Server Status:"
        pm2 status webagent-backend
        
        echo ""
        echo "📋 Recent Logs:"
        pm2 logs webagent-backend --lines 10 --nostream
    else
        echo "❌ PM2 restart failed!"
        echo ""
        echo "📋 Error logs:"
        pm2 logs webagent-backend --err --lines 20 --nostream
        echo ""
        echo "⚠️  Please check logs manually: pm2 logs webagent-backend"
    fi
else
    echo "⚠️  PM2 not found. Starting server with nohup..."
    cd backend
    # Kill existing node processes on port 3000
    fuser -k 3000/tcp 2>/dev/null || pkill -f "node.*server.js"
    sleep 1
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

