#!/bin/bash
# Script to find the project directory on VPS

echo "=== Finding Project Directory ==="
echo ""

echo "📂 Checking /home/webagent..."
ls -la /home/webagent/

echo ""
echo "📂 Checking for git repository..."
find /home/webagent -name ".git" -type d 2>/dev/null

echo ""
echo "📂 Checking for backend/server.js..."
find /home/webagent -name "server.js" -path "*/backend/server.js" 2>/dev/null

echo ""
echo "📂 Checking for PM2 config..."
find /home/webagent -name ".pm2" -type d 2>/dev/null

