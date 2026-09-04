# ResQNet Setup Script for Windows
# 
# TODO: Implement Windows-specific setup logic.
# NOTE: Primary development target is Raspberry Pi (Linux).

Write-Host "=== ResQNet Setup (Windows) ===" -ForegroundColor Cyan
Write-Host "Setting up Python virtual environment..."

if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is required" -ForegroundColor Red
    exit 1
}

# Create virtual environment
Set-Location -LiteralPath "gateway"
python -m venv venv
& ".\venv\Scripts\Activate.ps1"

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Set-Location -LiteralPath ".."

# Copy .env.example to .env
if (-not (Test-Path -LiteralPath "gateway\.env")) {
    Copy-Item -LiteralPath "gateway\.env.example" -Destination "gateway\.env"
    Write-Host "Created gateway\.env from .env.example" -ForegroundColor Green
}

Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host "Run with: cd gateway; python -m app.main"