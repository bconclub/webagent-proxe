# Start server script
Write-Host "=== Wind Chasers PROXe Server Startup ===" -ForegroundColor Cyan
Write-Host ""

# Check if port 3000 is in use
$portInUse = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
if ($portInUse) {
    Write-Host "⚠️  Port 3000 is already in use!" -ForegroundColor Yellow
    Write-Host "Stopping existing processes..." -ForegroundColor Yellow
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "✅ Processes stopped" -ForegroundColor Green
}

# Check if .env exists
if (Test-Path "backend\.env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file NOT found - server will use defaults" -ForegroundColor Yellow
    Write-Host "⚠️  Note: Claude API calls will fail without CLAUDE_API_KEY" -ForegroundColor Yellow
}

# Start server
Write-Host ""
Write-Host "Starting Node.js server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Access your pages at:" -ForegroundColor White
Write-Host "  📄 Main: http://localhost:3000/" -ForegroundColor White
Write-Host "  🎯 Wind Chasers: http://localhost:3000/windchasers-proxe" -ForegroundColor White
Write-Host "  ❤️  Health: http://localhost:3000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location backend
node server.js

