#!/bin/bash
# ResQNet Deployment Script for Raspberry Pi
# 
# TODO: Implement:
# - Build and copy artifacts to target Pi
# - Systemd service installation
# - Wi-Fi AP configuration (hostapd + dnsmasq)
# - Firewall rules
# - Auto-start on boot

set -e

PI_HOST=${PI_HOST:-pi@resqnet.local}
PI_PATH=${PI_PATH:-/home/pi/resqnet}

echo "=== Deploying ResQNet to $PI_HOST ==="

# Sync files
echo "Syncing files..."
rsync -avz --exclude 'node_modules' --exclude 'build' --exclude '.git' \
    ./ $PI_HOST:$PI_PATH/

# Run setup on Pi
echo "Running setup on Pi..."
ssh $PI_HOST "cd $PI_PATH && bash scripts/setup.sh"

echo "=== Deployment Complete ==="