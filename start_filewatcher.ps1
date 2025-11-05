Write-Host "Installing watchdog dependency if needed..." -ForegroundColor Yellow
pip install watchdog==4.0.0

Write-Host ""
Write-Host "Starting filewatcher..." -ForegroundColor Green
python filewatcher.py