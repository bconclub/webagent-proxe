# Development script to run both API server and frontend
# Usage: .\scripts\dev.ps1

Write-Host "Starting PROXe development servers..." -ForegroundColor Green
Write-Host ""

# Start API server in background
Write-Host "Starting API server (port 3000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\..\api'; npm run dev" -WindowStyle Normal

# Wait a moment for API server to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend server (port 3002)..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Access the app at:" -ForegroundColor Yellow
Write-Host "  PROXe:     http://localhost:3002" -ForegroundColor Green
Write-Host "  Wind Chasers: http://localhost:3002/windchasers" -ForegroundColor Green
Write-Host ""

cd $PSScriptRoot\..
npm run dev

