# Development script to run both backend and frontend servers
# Usage: .\scripts\dev.ps1

Write-Host "Starting PROXe development servers..." -ForegroundColor Green
Write-Host ""

# Start backend server in background
Write-Host "Starting backend server (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\backend'; npm run dev" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend server (port 3002)..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the app at:" -ForegroundColor Yellow
Write-Host "  PROXe:     http://localhost:3002" -ForegroundColor Green
Write-Host "  Wind Chasers: http://localhost:3002/windchasers" -ForegroundColor Green
Write-Host ""
Write-Host "Note: Make sure to access the Next.js app, not the old index.html" -ForegroundColor Yellow
Write-Host ""

cd $PSScriptRoot\..\frontend
npm run dev

