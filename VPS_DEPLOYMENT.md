# VPS Deployment Guide

## Prerequisites

1. SSH access to your VPS
2. Git installed on VPS
3. Node.js installed on VPS
4. PM2 installed (optional but recommended) for process management

## Quick Deployment

### Option 1: Using the deployment script

1. Upload the `deploy-vps.sh` script to your VPS
2. Make it executable:
   ```bash
   chmod +x deploy-vps.sh
   ```
3. Update the `PROJECT_DIR` path in the script to match your VPS setup
4. Run the script:
   ```bash
   ./deploy-vps.sh
   ```

### Option 2: Manual deployment

1. **SSH into your VPS:**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Navigate to your project directory:**
   ```bash
   cd /home/webagent/backend  # or your project path
   ```

3. **Pull latest code:**
   ```bash
   git pull origin main
   ```

4. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

5. **Restart the server:**

   **With PM2 (recommended):**
   ```bash
   pm2 restart webagent-backend
   # Or if it doesn't exist:
   pm2 start backend/server.js --name webagent-backend
   pm2 save
   ```

   **Without PM2:**
   ```bash
   # Kill existing process
   pkill -f "node.*server.js"
   # Start server
   cd backend
   nohup node server.js > server.log 2>&1 &
   ```

## Environment Variables

Make sure your `.env` file on the VPS has all required variables:

```env
PORT=3000
CLAUDE_API_KEY=your_claude_api_key
PROXE_SUPABASE_URL=your_proxe_supabase_url
PROXE_SUPABASE_ANON_KEY=your_proxe_supabase_key
SUPABASE_URL=your_windchasers_supabase_url
SUPABASE_ANON_KEY=your_windchasers_supabase_key
```

## Using PM2 (Recommended)

PM2 keeps your server running and restarts it if it crashes.

**Install PM2:**
```bash
npm install -g pm2
```

**Start server with PM2:**
```bash
cd /path/to/project/backend
pm2 start server.js --name webagent-backend
pm2 save
pm2 startup  # Auto-start on server reboot
```

**Useful PM2 commands:**
```bash
pm2 list              # List all processes
pm2 logs webagent-backend  # View logs
pm2 restart webagent-backend  # Restart
pm2 stop webagent-backend     # Stop
pm2 delete webagent-backend   # Remove
```

## Nginx Configuration (Optional)

If you want to use a domain name and HTTPS, configure Nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

1. **Check if server is running:**
   ```bash
   pm2 list
   # or
   ps aux | grep node
   ```

2. **Check logs:**
   ```bash
   pm2 logs webagent-backend
   # or
   tail -f backend/server.log
   ```

3. **Check port:**
   ```bash
   netstat -tulpn | grep 3000
   ```

4. **Test API:**
   ```bash
   curl http://localhost:3000/api/health
   ```

