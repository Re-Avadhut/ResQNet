#!/bin/bash
# ResQNet Deployment Script for Raspberry Pi
#
# TODO: Implement:
# - Systemd service installation
# - Wi-Fi AP configuration (hostapd + dnsmasq)
# - Firewall rules
# - Auto-start on boot
#
# ---------------------------------------------------------------------------
# SAFETY NOTES - read before editing the rsync command below.
#
# An earlier version of this script ran:
#     rsync -avz --exclude node_modules --exclude build --exclude .git ./ pi:...
#
# which would have:
#   1. OVERWRITTEN THE PI'S LIVE DATABASE with the developer's local
#      resqnet.db, destroying real SOS reports and missing-person records.
#   2. Pushed the developer's local gateway/.env over the Pi's own config.
#   3. Copied a Windows/x86 virtualenv onto ARM Linux, where it cannot run.
#
# The exclude list below is the safety mechanism. Do not remove entries from
# it. Anything holding real data or per-machine config must stay excluded.
# ---------------------------------------------------------------------------

set -euo pipefail

PI_HOST=${PI_HOST:-pi@resqnet.local}
PI_PATH=${PI_PATH:-/home/pi/resqnet}

# Never transfer: real data, per-machine config, or platform-specific builds.
EXCLUDES=(
    # Version control / tooling
    '.git'
    '.github'
    '.pytest_cache'
    '.mypy_cache'
    '.ruff_cache'
    '__pycache__'
    '*.pyc'

    # Per-machine environments - MUST be rebuilt natively on the Pi
    'venv'
    '.venv'
    'node_modules'
    'build'

    # Secrets and per-machine config - the Pi keeps its own
    '.env'
    '.env.*'
    '*.pem'
    '*.key'
    'secrets'

    # LIVE DATA - never overwrite what is on the gateway
    '*.db'
    '*.sqlite'
    '*.sqlite3'
    '*.db-journal'
    '*.db-wal'
    '*.db-shm'
    'uploads'
    'runtime'
    'backups'
)

RSYNC_ARGS=()
for pattern in "${EXCLUDES[@]}"; do
    RSYNC_ARGS+=(--exclude "$pattern")
done

echo "=== Deploying ResQNet to $PI_HOST:$PI_PATH ==="
echo
echo "Excluded from transfer: database, uploads, .env, virtualenvs, node_modules."
echo "The gateway's existing data and configuration will NOT be touched."
echo

# Show exactly what would change before doing it. --delete is deliberately NOT
# used: it would remove files on the Pi that this repo does not know about,
# including the database and uploaded photographs.
echo "--- Dry run (no changes made yet) ---"
rsync -avz --dry-run "${RSYNC_ARGS[@]}" ./ "$PI_HOST:$PI_PATH/"

echo
read -r -p "Proceed with the deployment shown above? [y/N] " reply
case "$reply" in
    [yY][eE][sS] | [yY]) ;;
    *) echo "Aborted. Nothing was transferred."; exit 1 ;;
esac

echo "--- Syncing ---"
rsync -avz "${RSYNC_ARGS[@]}" ./ "$PI_HOST:$PI_PATH/"

echo "--- Running setup on the Pi ---"
ssh "$PI_HOST" "cd '$PI_PATH' && bash scripts/setup.sh"

echo
echo "=== Deployment Complete ==="
echo "If this is a first-time deployment, create the gateway config on the Pi:"
echo "  ssh $PI_HOST 'cd $PI_PATH && cp gateway/.env.example gateway/.env'"
echo "Then edit it and set a real SECRET_KEY."
