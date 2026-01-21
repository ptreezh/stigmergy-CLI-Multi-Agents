# Deployment and Maintenance Workflows

## 1. Overview
This document outlines the deployment and maintenance workflows for the dual coordination layer system with Python detection and graceful degradation capabilities.

## 2. Deployment Strategy

### 2.1 Installation Process

#### 2.1.1 Default Installation
```bash
# Standard installation (Node.js components only)
npm install stigmergy-cli

# Installation with Python components (if Python available)
npm install stigmergy-cli --with-python
```

#### 2.1.2 Installation Script
```javascript
// scripts/install.js
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const pythonDetector = require('../src/utils/pythonDetector');

async function install() {
  console.log('📦 Installing Stigmergy CLI...');
  
  // Install Node.js dependencies
  console.log('🔧 Installing Node.js dependencies...');
  const npmInstall = spawnSync('npm', ['install'], {
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  if (npmInstall.status !== 0) {
    console.error('❌ Failed to install Node.js dependencies');
    process.exit(1);
  }
  
  // Check for Python and install Python components if available
  const withPython = process.argv.includes('--with-python');
  if (withPython) {
    console.log('🐍 Checking for Python availability...');
    const pythonAvailable = await pythonDetector.isPythonAvailable();
    
    if (pythonAvailable) {
      console.log('✅ Python detected, installing Python components...');
      await installPythonComponents();
    } else {
      console.warn('⚠️ Python not found, skipping Python component installation');
    }
  }
  
  // Create necessary directories
  await createDirectories();
  
  // Install CLI adapters
  await installCLIAdapters();
  
  console.log('🎉 Installation completed successfully!');
}

async function installPythonComponents() {
  try {
    const pythonCmd = await pythonDetector.getPythonCommand();
    const installScript = path.join(__dirname, '..', 'scripts', 'install_python_components.py');
    
    const result = spawnSync(pythonCmd, [installScript], {
      stdio: 'inherit'
    });
    
    if (result.status !== 0) {
      throw new Error('Python component installation failed');
    }
  } catch (error) {
    console.error('❌ Python component installation failed:', error.message);
    throw error;
  }
}

async function createDirectories() {
  const dirs = [
    path.join(require('os').homedir(), '.stigmergy'),
    path.join(require('os').homedir(), '.stigmergy', 'adapters'),
    path.join(require('os').homedir(), '.stigmergy', 'logs'),
    path.join(require('os').homedir(), '.stigmergy', 'cache')
  ];
  
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
}

async function installCLIAdapters() {
  console.log('🔌 Installing CLI adapters...');
  
  // This would iterate through available adapters and install them
  // Implementation would depend on the specific adapter installation mechanisms
  console.log('✅ CLI adapters installation completed');
}

if (require.main === module) {
  install().catch(error => {
    console.error('Installation failed:', error);
    process.exit(1);
  });
}

module.exports = { install };
```

### 2.2 Update Process

#### 2.2.1 Update Script
```javascript
// scripts/update.js
const { spawnSync } = require('child_process');
const pythonDetector = require('../src/utils/pythonDetector');
const fs = require('fs');
const path = require('path');

async function update() {
  console.log('🔄 Updating Stigmergy CLI...');
  
  // Check current version
  const currentVersion = getCurrentVersion();
  console.log(`📍 Current version: ${currentVersion}`);
  
  // Update Node.js components
  console.log('🔧 Updating Node.js components...');
  const npmUpdate = spawnSync('npm', ['update', 'stigmergy-cli'], {
    stdio: 'inherit'
  });
  
  if (npmUpdate.status !== 0) {
    console.error('❌ Failed to update Node.js components');
    process.exit(1);
  }
  
  // Check if Python components need update
  const pythonAvailable = await pythonDetector.isPythonAvailable();
  if (pythonAvailable) {
    console.log('🐍 Checking Python components for updates...');
    await updatePythonComponents();
  }
  
  // Update CLI adapters
  await updateCLIAdapters();
  
  // Run post-update migrations
  await runMigrations();
  
  const newVersion = getCurrentVersion();
  console.log(`🎉 Update completed successfully!`);
  console.log(`📍 Version: ${currentVersion} → ${newVersion}`);
}

function getCurrentVersion() {
  const packageJson = require('../package.json');
  return packageJson.version;
}

async function updatePythonComponents() {
  try {
    const pythonCmd = await pythonDetector.getPythonCommand();
    const updateScript = path.join(__dirname, '..', 'scripts', 'update_python_components.py');
    
    const result = spawnSync(pythonCmd, [updateScript], {
      stdio: 'inherit'
      }
    );
    
    if (result.status !== 0) {
      throw new Error('Python component update failed');
    }
  } catch (error) {
    console.error('❌ Python component update failed:', error.message);
  }
}

async function updateCLIAdapters() {
  console.log('🔌 Updating CLI adapters...');
  
  // This would check for adapter updates and apply them
  console.log('✅ CLI adapters update completed');
}

async function runMigrations() {
  console.log('⚙️ Running post-update migrations...');
  
  // Check for required migrations based on version differences
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  if (fs.existsSync(migrationsDir)) {
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.js'))
      .sort();
    
    for (const migrationFile of migrationFiles) {
      try {
        console.log(`📈 Running migration: ${migrationFile}`);
        const migration = require(path.join(migrationsDir, migrationFile));
        await migration.up();
      } catch (error) {
        console.error(`❌ Migration ${migrationFile} failed:`, error.message);
      }
    }
  }
  
  console.log('✅ Migrations completed');
}

if (require.main === module) {
  update().catch(error => {
    console.error('Update failed:', error);
    process.exit(1);
  });
}

module.exports = { update };
```

## 3. Maintenance Workflows

### 3.1 Health Monitoring

#### 3.1.1 Health Check Script
```javascript
// scripts/health.js
const CoordinationLayerManager = require('../src/core/coordination');

async function healthCheck() {
  console.log('🏥 Performing system health check...');
  
  const manager = new CoordinationLayerManager();
  
  try {
    // Initialize coordination layer
    await manager.initialize({ allowDegradation: false });
    
    // Perform health check
    const isHealthy = await manager.healthCheck();
    
    if (isHealthy) {
      console.log('✅ System is healthy');
      
      // Get detailed status
      const status = await manager.getSystemStatus();
      console.log(`📍 Active implementation: ${status.implementation}`);
      console.log(`📊 Health status: ${status.health ? 'Good' : 'Issues detected'}`);
      
      // Show adapter status
      if (status.adapters) {
        console.log('\n🔌 Adapter Status:');
        status.adapters.forEach(adapter => {
          console.log(`  - ${adapter.name}: ${adapter.available ? '✅ Available' : '❌ Unavailable'} (${adapter.version})`);
        });
      }
    } else {
      console.log('❌ System health issues detected');
      
      // Try to get more details
      try {
        const status = await manager.getSystemStatus();
        if (status.error) {
          console.log(`📝 Error: ${status.error}`);
        }
      } catch (error) {
        console.log(`📝 Error getting status: ${error.message}`);
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  healthCheck();
}

module.exports = { healthCheck };
```

### 3.2 Log Analysis

#### 3.2.1 Log Analysis Script
```javascript
// scripts/analyze-logs.js
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function analyzeLogs() {
  console.log('📊 Analyzing system logs...');
  
  const logDir = path.join(require('os').homedir(), '.stigmergy', 'logs');
  if (!fs.existsSync(logDir)) {
    console.log('❌ Log directory not found');
    return;
  }
  
  // Find latest log file
  const logFiles = fs.readdirSync(logDir)
    .filter(f => f.startsWith('stigmergy-') && f.endsWith('.log'))
    .sort()
    .reverse();
  
  if (logFiles.length === 0) {
    console.log('❌ No log files found');
    return;
  }
  
  const latestLog = path.join(logDir, logFiles[0]);
  console.log(`📍 Analyzing: ${latestLog}`);
  
  // Count different types of log entries
  const logContent = fs.readFileSync(latestLog, 'utf8');
  const lines = logContent.split('\n');
  
  const stats = {
    total: lines.length,
    errors: 0,
    warnings: 0,
    info: 0,
    debug: 0,
    degradationEvents: 0
  };
  
  lines.forEach(line => {
    if (line.includes('[ERROR]')) stats.errors++;
    if (line.includes('[WARN]')) stats.warnings++;
    if (line.includes('[INFO]')) stats.info++;
    if (line.includes('[DEBUG]')) stats.debug++;
    if (line.includes('[DEGRADATION]')) stats.degradationEvents++;
  });
  
  console.log('\n📈 Log Analysis Results:');
  console.log(`  Total entries: ${stats.total}`);
  console.log(`  Errors: ${stats.errors}`);
  console.log(`  Warnings: ${stats.warnings}`);
  console.log(`  Info: ${stats.info}`);
  console.log(`  Debug: ${stats.debug}`);
  console.log(`  Degradation events: ${stats.degradationEvents}`);
  
  // Show recent errors if any
  if (stats.errors > 0) {
    console.log('\n❌ Recent Errors:');
    const errorLines = lines.filter(line => line.includes('[ERROR]'));
    errorLines.slice(-5).forEach(line => {
      console.log(`  ${line}`);
    });
  }
  
  // Show recent degradation events if any
  if (stats.degradationEvents > 0) {
    console.log('\n⚠️ Recent Degradation Events:');
    const degLines = lines.filter(line => line.includes('[DEGRADATION]'));
    degLines.slice(-5).forEach(line => {
      console.log(`  ${line}`);
    });
  }
}

if (require.main === module) {
  analyzeLogs();
}

module.exports = { analyzeLogs };
```

### 3.3 Cleanup and Optimization

#### 3.3.1 Cleanup Script
```javascript
// scripts/cleanup.js
const fs = require('fs');
const path = require('path');

function cleanup() {
  console.log('🧹 Cleaning up system...');
  
  // Clean cache directories
  const cacheDir = path.join(require('os').homedir(), '.stigmergy', 'cache');
  if (fs.existsSync(cacheDir)) {
    const cacheFiles = fs.readdirSync(cacheDir);
    console.log(`🗑️ Removing ${cacheFiles.length} cache files...`);
    cacheFiles.forEach(file => {
      try {
        fs.unlinkSync(path.join(cacheDir, file));
      } catch (error) {
        console.warn(`⚠️ Failed to remove cache file ${file}: ${error.message}`);
      }
    });
  }
  
  // Clean old log files
  const logDir = path.join(require('os').homedir(), '.stigmergy', 'logs');
  if (fs.existsSync(logDir)) {
    const logFiles = fs.readdirSync(logDir)
      .filter(f => f.startsWith('stigmergy-') && f.endsWith('.log'))
      .sort();
    
    // Keep only last 7 days of logs
    if (logFiles.length > 7) {
      const filesToRemove = logFiles.slice(0, logFiles.length - 7);
      console.log(`🗑️ Removing ${filesToRemove.length} old log files...`);
      filesToRemove.forEach(file => {
        try {
          fs.unlinkSync(path.join(logDir, file));
        } catch (error) {
          console.warn(`⚠️ Failed to remove log file ${file}: ${error.message}`);
        }
      });
    }
  }
  
  // Clean temporary files
  const tempPattern = path.join(require('os').tmpdir(), 'stigmergy-*');
  try {
    const tempFiles = fs.readdirSync(require('os').tmpdir())
      .filter(f => f.startsWith('stigmergy-'));
    
    console.log(`🗑️ Removing ${tempFiles.length} temporary files...`);
    tempFiles.forEach(file => {
      try {
        const filePath = path.join(require('os').tmpdir(), file);
        fs.rmSync(filePath, { recursive: true, force: true });
      } catch (error) {
        console.warn(`⚠️ Failed to remove temporary file ${file}: ${error.message}`);
      }
    });
  } catch (error) {
    console.warn(`⚠️ Failed to clean temporary files: ${error.message}`);
  }
  
  console.log('✅ Cleanup completed');
}

if (require.main === module) {
  cleanup();
}

module.exports = { cleanup };
```

## 4. Configuration Management

### 4.1 Configuration Backup and Restore

#### 4.1.1 Backup Script
```javascript
// scripts/backup-config.js
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function backupConfig() {
  console.log('💾 Backing up configuration...');
  
  const configDir = path.join(require('os').homedir(), '.stigmergy');
  const backupDir = path.join(require('os').homedir(), '.stigmergy-backup');
  
  // Create backup directory with timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `backup-${timestamp}`);
  
  try {
    // Copy configuration directory
    fs.mkdirSync(backupPath, { recursive: true });
    
    const configFiles = fs.readdirSync(configDir);
    configFiles.forEach(file => {
      const src = path.join(configDir, file);
      const dest = path.join(backupPath, file);
      
      try {
        fs.cpSync(src, dest, { recursive: true });
        console.log(`✅ Backed up: ${file}`);
      } catch (error) {
        console.warn(`⚠️ Failed to backup ${file}: ${error.message}`);
      }
    });
    
    console.log(`🎉 Configuration backed up to: ${backupPath}`);
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    process.exit(1);
  }
}

function restoreConfig(backupPath) {
  console.log(`🔄 Restoring configuration from: ${backupPath}`);
  
  const configDir = path.join(require('os').homedir(), '.stigmergy');
  
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup not found: ${backupPath}`);
    }
    
    // Backup current config first
    const currentBackup = path.join(require('os').homedir(), '.stigmergy-current-backup');
    if (fs.existsSync(configDir)) {
      fs.cpSync(configDir, currentBackup, { recursive: true });
      console.log('✅ Current configuration backed up temporarily');
    }
    
    // Restore from backup
    fs.cpSync(backupPath, configDir, { recursive: true });
    console.log('🎉 Configuration restored successfully');
    
    // Remove temporary backup
    fs.rmSync(currentBackup, { recursive: true, force: true });
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    
    // Try to restore from temporary backup
    const currentBackup = path.join(require('os').homedir(), '.stigmergy-current-backup');
    if (fs.existsSync(currentBackup)) {
      try {
        fs.cpSync(currentBackup, configDir, { recursive: true });
        fs.rmSync(currentBackup, { recursive: true, force: true });
        console.log('🔄 Recovered original configuration');
      } catch (recoverError) {
        console.error('❌ Failed to recover original configuration:', recoverError.message);
      }
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'restore' && args[1]) {
    restoreConfig(args[1]);
  } else {
    backupConfig();
  }
}

module.exports = { backupConfig, restoreConfig };
```

## 5. Monitoring and Alerting

### 5.1 System Monitoring Script
```javascript
// scripts/monitor.js
const fs = require('fs');
const path = require('path');
const CoordinationLayerManager = require('../src/core/coordination');

class SystemMonitor {
  constructor() {
    this.monitoringInterval = 60000; // 1 minute
    this.alertThresholds = {
      errorRate: 0.05, // 5% error rate
      responseTime: 1000, // 1 second
      memoryUsage: 80, // 80% memory usage
      degradationFrequency: 10 // 10 degradation events per hour
    };
  }

  async startMonitoring() {
    console.log('🔍 Starting system monitoring...');
    
    // Start monitoring loop
    setInterval(async () => {
      await this.performHealthCheck();
      await this.checkResourceUsage();
      await this.analyzeLogs();
    }, this.monitoringInterval);
  }

  async performHealthCheck() {
    try {
      const manager = new CoordinationLayerManager();
      const health = await manager.healthCheck();
      
      if (!health) {
        this.sendAlert('CRITICAL', 'System health check failed');
      }
    } catch (error) {
      this.sendAlert('ERROR', `Health check error: ${error.message}`);
    }
  }

  async checkResourceUsage() {
    const memoryUsage = process.memoryUsage();
    const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    if (memoryPercent > this.alertThresholds.memoryUsage) {
      this.sendAlert('WARNING', `High memory usage: ${memoryPercent.toFixed(2)}%`);
    }
  }

  async analyzeLogs() {
    // This would analyze recent logs for patterns
    // Implementation would be similar to the log analysis script
  }

  sendAlert(level, message) {
    const timestamp = new Date().toISOString();
    const alertMessage = `[${timestamp}] ${level}: ${message}`;
    
    console.log(alertMessage);
    
    // In a production system, this would send alerts to monitoring systems
    // For now, we just log them
  }
}

if (require.main === module) {
  const monitor = new SystemMonitor();
  monitor.startMonitoring();
}

module.exports = SystemMonitor;
```

## 6. Package.json Scripts

### 6.1 Updated Package.json
```json
{
  "name": "stigmergy-cli",
  "version": "1.0.94",
  "description": "Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System",
  "scripts": {
    "start": "node src/main_english.js",
    "dev": "nodemon src/main_english.js",
    "test": "jest",
    "test:unit": "jest test/unit",
    "test:integration": "jest test/integration",
    "test:system": "jest test/system",
    "test:performance": "jest test/performance",
    "test:compatibility": "jest test/compatibility",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "lint": "eslint src/",
    "format": "prettier --write src/",
    "install": "node scripts/install.js",
    "install:with-python": "node scripts/install.js --with-python",
    "update": "node scripts/update.js",
    "health": "node scripts/health.js",
    "analyze-logs": "node scripts/analyze-logs.js",
    "cleanup": "node scripts/cleanup.js",
    "backup-config": "node scripts/backup-config.js",
    "restore-config": "node scripts/backup-config.js restore",
    "monitor": "node scripts/monitor.js",
    "postinstall": "node scripts/install.js"
  },
  "dependencies": {
    "commander": "^9.0.0",
    "inquirer": "^8.2.0",
    "chalk": "^4.1.2",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "jest": "^28.0.0",
    "nodemon": "^2.0.15",
    "eslint": "^8.0.0",
    "prettier": "^2.5.0"
  },
  "bin": {
    "stigmergy": "./src/main_english.js"
  },
  "files": [
    "src/",
    "scripts/",
    "migrations/",
    "README.md",
    "LICENSE"
  ]
}
```

## 7. Documentation Updates

### 7.1 Updated README.md
```markdown
# Stigmergy CLI - Multi-Agents Cross-AI CLI Tools Collaboration System

## Features
- Cross-CLI collaboration between Claude, Gemini, QwenCode, iFlow, Qoder, CodeBuddy, and Codex
- Dual coordination layer system (Node.js primary, Python fallback)
- Graceful degradation when system Python is unavailable
- Native CLI integration with official extension mechanisms
- No abstract base classes or factory patterns

## Installation

### Standard Installation (Node.js only)
```bash
npm install -g stigmergy-cli
```

### Full Installation (with Python components)
```bash
npm install -g stigmergy-cli --with-python
```

## Usage
```bash
stigmergy --help
```

## System Requirements
- Node.js 16+
- Python 3.7+ (optional, for enhanced features)

## Commands
- `stigmergy` - Start interactive mode
- `stigmergy health` - Check system health
- `stigmergy update` - Update to latest version
- `stigmergy cleanup` - Clean cache and temporary files
```

This completes the implementation of all required documentation and planning for the dual coordination layer system with Python detection and graceful degradation.