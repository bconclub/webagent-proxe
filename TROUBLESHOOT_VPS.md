# VPS Troubleshooting Guide - 502 Bad Gateway

## Quick Fix Steps

### 1. Check if Server is Running
```bash
# SSH into your VPS
ssh user@your-vps-ip

# Check if Node.js process is running
pm2 list
# OR
ps aux | grep node
```

### 2. Check Server Logs
```bash
# If using PM2:
pm2 logs webagent-backend --lines 50

# If running directly:
tail -f /path/to/backend/server.log
# OR check PM2 logs:
pm2 logs webagent-backend
```

### 3. Common Issues & Fixes

#### Issue 1: Server Not Running
```bash
# Restart with PM2:
cd /path/to/backend
pm2 restart webagent-backend

# Or start if not running:
pm2 start backend/server.js --name webagent-backend
pm2 save
```

#### Issue 2: Missing Environment Variables
```bash
# Check .env file exists:
cd backend
ls -la .env

# Verify CLAUDE_API_KEY is set:
grep CLAUDE_API_KEY .env

# If missing, add it:
nano .env
# Add: CLAUDE_API_KEY=your_key_here
```

#### Issue 3: Port Conflict
```bash
# Check if port 3000 is in use:
netstat -tulpn | grep 3000
# OR
lsof -i :3000

# Kill process if needed:
kill -9 <PID>
# Then restart server
```

#### Issue 4: Server Crashed
```bash
# Check PM2 status:
pm2 status

# View error logs:
pm2 logs webagent-backend --err

# Restart:
pm2 restart webagent-backend
```

#### Issue 5: Nginx/Proxy Issue (if using)
```bash
# Check Nginx status:
sudo systemctl status nginx

# Check Nginx error logs:
sudo tail -f /var/log/nginx/error.log

# Restart Nginx:
sudo systemctl restart nginx
```

### 4. Pull Latest Code and Restart
```bash
cd /path/to/project
git pull origin main
cd backend
npm install
pm2 restart webagent-backend
```

### 5. Test Server Locally on VPS
```bash
# Test health endpoint:
curl http://localhost:3000/api/health

# Test chat endpoint:
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test","brand":"proxe"}'
```

### 6. Check for Error Messages
Look for these common errors in logs:
- `CLAUDE_API_KEY is not configured` - Add API key to .env
- `ECONNREFUSED` - Server not running
- `EADDRINUSE` - Port already in use
- `Module not found` - Run `npm install`

### 7. Emergency Restart
```bash
# Stop all Node processes:
pm2 stop all
# OR
pkill -f node

# Navigate to project:
cd /path/to/backend

# Restart:
pm2 start server.js --name webagent-backend
pm2 save
pm2 startup  # Auto-start on reboot
```

## Check Server Status

### Quick Status Check
```bash
# Server running?
pm2 list

# Port listening?
netstat -tulpn | grep 3000

# Can reach server?
curl http://localhost:3000/api/health
```

### Detailed Check
```bash
# Full system check:
echo "=== PM2 Status ==="
pm2 status

echo "=== Recent Logs ==="
pm2 logs webagent-backend --lines 20

echo "=== Port Check ==="
netstat -tulpn | grep 3000

echo "=== Environment Check ==="
cd backend
test -f .env && echo ".env exists" || echo ".env MISSING"
grep -q CLAUDE_API_KEY .env && echo "CLAUDE_API_KEY found" || echo "CLAUDE_API_KEY MISSING"
```

