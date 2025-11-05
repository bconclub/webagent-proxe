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
if (Test-Path "api\.env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env file NOT found - server will use defaults" -ForegroundColor Yellow
    Write-Host "⚠️  Note: Claude API calls will fail without CLAUDE_API_KEY" -ForegroundColor Yellow
}

# Start server
Write-Host ""
Write-Host "Starting Node.js API server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "API endpoints:" -ForegroundColor White
Write-Host "  ❤️  Health: http://localhost:3000/api/health" -ForegroundColor White
Write-Host "  💬 Chat: http://localhost:3000/api/chat" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location api
node server.js

