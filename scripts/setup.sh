#!/bin/bash
# ResQNet Setup Script for Linux/Raspberry Pi
# 
# TODO: Implement:
# - Install Python dependencies
# - Set up virtual environment
# - Initialize SQLite database
# - Configure systemd service for auto-start
# - Set up Wi-Fi AP mode on Raspberry Pi

set -e

echo "=== ResQNet Setup ==="
echo "Installing dependencies..."

# Check Python version
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required"
    exit 1
fi

# Create the development environment beside the gateway package.
echo "Creating virtual environment..."
python3 -m venv gateway/venv
source gateway/venv/bin/activate

# Install dependencies
echo "Installing Python packages..."
cd gateway
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Copy .env.example to .env if not exists
if [ ! -f gateway/.env ]; then
    cp gateway/.env.example gateway/.env
    echo "Created gateway/.env from .env.example"
fi

# Initialize database
echo "Initializing database..."
# TODO: Run database migrations

echo "=== Setup Complete ==="
echo "Run from the repository root with: python -m uvicorn gateway.app.main:app --reload"