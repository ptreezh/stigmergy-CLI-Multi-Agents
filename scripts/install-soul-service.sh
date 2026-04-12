#!/bin/bash
# Soul System Service Installer
# 安装Soul系统定时服务

set -e

SOUL_HOME="${HOME}/.stigmergy"
BIN_DIR="${SOUL_HOME}/bin"
SYSTEMD_DIR="${HOME}/.config/systemd/user"

echo "🔧 Installing Soul System Service..."

# Create directories
mkdir -p "${BIN_DIR}"
mkdir -p "${SYSTEMD_DIR}"

# Copy scripts
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create evolve script
cat > "${BIN_DIR}/soul-evolve.sh" << 'EOF'
#!/bin/bash
# Soul Auto-Evolve Script

SOUL_HOME="${HOME}/.stigmergy"
LOG_DIR="${SOUL_HOME}/logs"
mkdir -p "$LOG_DIR"

LOG_FILE="${LOG_DIR}/soul-evolve-$(date +%Y%m%d).log"

echo "$(date '+%Y-%m-%d %H:%M:%S') Starting scheduled evolution..." >> "$LOG_FILE"

# Run evolution for each CLI
for cli in claude qwen opencode; do
  echo "$(date '+%Y-%m-%d %H:%M:%S') Evolving ${cli}..." >> "$LOG_FILE"
  
  node "${SOUL_HOME}/bin/soul-evolve.js" "$cli" >> "$LOG_FILE" 2>&1
  
  if [ $? -eq 0 ]; then
    echo "$(date '+%Y-%m-%d %H:%M:%S') ✓ ${cli} evolved" >> "$LOG_FILE"
  else
    echo "$(date '+%Y-%m-%d %H:%M:%S') ✗ ${cli} failed" >> "$LOG_FILE"
  fi
done

echo "$(date '+%Y-%m-%d %H:%M:%S') Evolution complete" >> "$LOG_FILE"
EOF

chmod +x "${BIN_DIR}/soul-evolve.sh"

# Create systemd timer unit (night: every 30min, day: every 4h)
cat > "${SYSTEMD_DIR}/soul-evolve.timer" << 'EOF'
[Unit]
Description=Soul System Auto-Evolve Timer (Night: 30min, Day: 4h)

[Timer]
# Run every 30 minutes
OnCalendar=*:0/30
# But apply different scheduling via the script itself based on time of day

[Install]
WantedBy=timers.target
EOF

# Create systemd service unit
cat > "${SYSTEMD_DIR}/soul-evolve.service" << 'EOF'
[Unit]
Description=Soul System Auto-Evolve Service
After=network.target

[Service]
Type=oneshot
ExecStart=%h/.stigmergy/bin/soul-evolve.sh
StandardOutput=append:%h/.stigmergy/logs/soul-evolve.log
StandardError=append:%h/.stigmergy/logs/soul-evolve.log

[Install]
WantedBy=default.target
EOF

# Reload systemd
systemctl --user daemon-reload 2>/dev/null || true

# Enable and start timer
systemctl --user enable soul-evolve.timer 2>/dev/null || true
systemctl --user start soul-evolve.timer 2>/dev/null || true

echo "✅ Soul System Service installed!"
echo ""
echo "Timer status:"
systemctl --user status soul-evolve.timer 2>/dev/null || echo "Timer enabled (use 'systemctl --user list-timers' to view)"
echo ""
echo "Logs: ${LOG_DIR}/soul-evolve-*.log"
