# PROXe Development Guide

## Quick Start

### Option 1: Use the dev script (Recommended)
```powershell
.\scripts\dev.ps1
```

This starts both backend (port 3001) and frontend (port 3000) servers.

### Option 2: Manual start

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Backend runs on: `http://localhost:3001`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
Frontend runs on: `http://localhost:3000`

## Access Points

- **PROXe Brand**: http://localhost:3000/
- **Wind Chasers Brand**: http://localhost:3000/windchasers
- **Backend API**: http://localhost:3001/api/chat

## Architecture

- **Frontend (Next.js)**: Port 3000
  - Proxies `/api/*` requests to backend on port 3001
  - Routes:
    - `/` → PROXe brand
    - `/windchasers` → Wind Chasers brand

- **Backend (Express)**: Port 3001
  - Handles `/api/chat` endpoint
  - Serves API for both brands

## Troubleshooting

**Port already in use:**
- Stop any existing Node.js processes
- Or change ports in:
  - `frontend/next.config.js` (rewrites destination)
  - `backend/server.js` (PORT variable)

**API returns 404:**
- Make sure backend is running on port 3001
- Check that Next.js rewrites are configured in `next.config.js`
- Verify backend logs show it's listening on port 3001

