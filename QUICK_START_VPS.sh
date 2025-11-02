#!/bin/bash
# Quick Start Script for VPS - Run this when server is down

echo "=== Quick Server Start ==="
echo ""

# Navigate to project
cd /home/webagent/backend

echo "📥 Pulling latest code..."
git pull origin main

echo ""
echo "📦 Installing dependencies..."
cd backend
npm install

echo ""
echo "🚀 Starting server with PM2..."

# Check if already exists and stop it first
if pm2 list | grep -q webagent-backend; then
    pm2 delete webagent-backend
fi

# Start server
pm2 start server.js --name webagent-backend
pm2 save

echo ""
echo "⏳ Waiting for server to start..."
sleep 3

echo ""
echo "📊 Server Status:"
pm2 status webagent-backend

echo ""
echo "🏥 Testing health..."
if curl -s http://localhost:3000/api/health > /dev/null; then
    echo "✅ Server is healthy!"
else
    echo "⚠️  Health check failed. Check logs:"
    pm2 logs webagent-backend --lines 20 --nostream
fi

echo ""
echo "📋 View logs with: pm2 logs webagent-backend"
echo "🔄 Restart with: pm2 restart webagent-backend"
echo "🛑 Stop with: pm2 stop webagent-backend"

