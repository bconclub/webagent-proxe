# PROXe Deployment Guide

## VPS Deployment Steps

### Prerequisites
- Node.js 18+ installed on VPS
- PM2 installed globally (`npm install -g pm2`)
- Nginx installed and configured
- Domain/DNS configured

### 1. Build the Application

```bash
# Build frontend
cd frontend
npm install
npm run build

# The build creates a standalone server in .next/standalone
```

### 2. Deploy to VPS

```bash
# Copy files to VPS (adjust paths as needed)
scp -r frontend/.next/standalone/* user@vps:/var/www/proxe/
scp -r backend user@vps:/var/www/proxe/backend
```

### 3. Set Up PM2

```bash
# On VPS
cd /var/www/proxe
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable on boot
```

### 4. Configure Nginx

```bash
# Copy nginx config
sudo cp nginx.conf /etc/nginx/sites-available/proxe
sudo ln -s /etc/nginx/sites-available/proxe /etc/nginx/sites-enabled/

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Environment Variables

Create `.env` files in backend and frontend directories:

**backend/.env:**
```
PROXE_SUPABASE_URL=your_supabase_url
PROXE_SUPABASE_ANON_KEY=your_key
SUPABASE_URL=your_windchasers_url
SUPABASE_ANON_KEY=your_key
ANTHROPIC_API_KEY=your_key
```

### 6. Brand-Specific Builds

To build for specific brands:
```bash
cd frontend
npm run build:proxe      # Build PROXe brand
npm run build:windchasers # Build Wind Chasers brand
npm run build:all        # Build all brands
```

## Architecture

- **Frontend**: Next.js app with brand switching via routing (`/` for PROXe, `/windchasers` for Wind Chasers)
- **Backend**: Express API server handling chat requests
- **PM2**: Process manager for both frontend and backend
- **Nginx**: Reverse proxy routing `/api` to backend and everything else to frontend

## Monitoring

```bash
pm2 status          # Check status
pm2 logs            # View logs
pm2 restart all     # Restart all apps
```

