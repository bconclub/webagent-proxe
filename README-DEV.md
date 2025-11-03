# PROXe Development Guide

## Quick Start

### Option 1: Use the dev script (Recommended)
```powershell
.\scripts\dev.ps1
```

This starts both API server (port 3000) and frontend (port 3002) servers.

### Option 2: Manual start

**Terminal 1 - API Server:**
```powershell
cd api
npm install
npm run dev
```
API server runs on: `http://localhost:3000`

**Terminal 2 - Frontend:**
```powershell
npm install
npm run dev
```
Frontend runs on: `http://localhost:3002`

## Access Points

- **PROXe Brand**: http://localhost:3002/
- **Wind Chasers Brand**: http://localhost:3002/windchasers
- **API Server**: http://localhost:3000/api/chat

## Architecture

- **Frontend (Next.js)**: Port 3002
  - Proxies `/api/*` requests to API server on port 3000
  - Routes:
    - `/` → PROXe brand
    - `/windchasers` → Wind Chasers brand

- **API Server (Express)**: Port 3000
  - Handles `/api/chat` endpoint
  - Serves API for both brands

## Troubleshooting

**Port already in use:**
- Stop any existing Node.js processes
- Or change ports in:
  - `next.config.js` (rewrites destination)
  - `api/server.js` (PORT variable)

**API returns 404:**
- Make sure API server is running on port 3000
- Check that Next.js rewrites are configured in `next.config.js`
- Verify API server logs show it's listening on port 3000
