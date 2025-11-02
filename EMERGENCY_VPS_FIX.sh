#!/bin/bash
# Emergency VPS Fix Script - Use this when server has 502 errors

echo "=== EMERGENCY SERVER FIX ==="
echo ""

# Stop everything
echo "🛑 Stopping all processes..."
pm2 stop all
pm2 delete all
pkill -9 node 2>/dev/null
pkill -f "node.*server.js" 2>/dev/null

# Check and kill any process on port 3000
if command -v fuser &> /dev/null; then
    fuser -k 3000/tcp 2>/dev/null || true
fi
if command -v lsof &> /dev/null; then
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
fi

# Wait a moment
sleep 3

# Navigate to project (adjust path if different)
cd /home/webagent || cd /root/webagent-backend || { echo "❌ Could not find project directory"; exit 1; }

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
cd backend
npm install

echo "🧹 Cleaning PM2..."
pm2 flush

echo "🚀 Starting fresh server..."
pm2 start server.js --name webagent-backend
pm2 save

echo ""
echo "⏳ Waiting for server..."
sleep 5

echo ""
echo "📊 PM2 Status:"
pm2 status

echo ""
echo "📋 Recent Logs (check for CLAUDE_API_KEY):"
pm2 logs webagent-backend --lines 30 --nostream

echo ""
echo "🏥 Testing Health:"
curl http://localhost:3000/api/health

echo ""
echo "✅ Done! If you see errors, run: pm2 logs webagent-backend"

