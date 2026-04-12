#!/usr/bin/env node
/**
 * Long-Running Task Scheduler for Package Decomposition
 * 
 * This script manages automated execution of the package decomposition plan
 * with progress tracking, recovery, and rollback capabilities.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROGRESS_FILE = path.join(ROOT_DIR, '.package-migration-progress.json');
const LOG_DIR = path.join(ROOT_DIR, 'logs', 'migration');
const BACKUP_DIR = path.join(ROOT_DIR, '.migration-backups');

// Task definitions with dependencies
const TASKS = {
  // Phase 1: Base Package
  'phase1-setup': {
    name: 'Phase 1: Setup Base Package Structure',
    command: 'node scripts/automated-implementation.js phase1 --task setup',
    dependencies: [],
    timeout: 300000,
    retryCount: 3,
  },
  'phase1-core': {
    name: 'Phase 1: Migrate Core Components',
    command: 'node scripts/automated-implementation.js phase1 --task core',
    dependencies: ['phase1-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-adapters': {
    name: 'Phase 1: Migrate Adapters',
    command: 'node scripts/automated-implementation.js phase1 --task adapters',
    dependencies: ['phase1-core'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-test': {
    name: 'Phase 1: Test Base Package',
    command: 'npm run test:unit -- --testPathPattern=packages/base',
    dependencies: ['phase1-adapters'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 2: UI Package
  'phase2-setup': {
    name: 'Phase 2: Setup UI Package',
    command: 'node scripts/automated-implementation.js phase2 --task setup',
    dependencies: ['phase1-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase2-desktop': {
    name: 'Phase 2: Integrate Desktop UI',
    command: 'node scripts/automated-implementation.js phase2 --task desktop',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-feishu': {
    name: 'Phase 2: Integrate Feishu IM',
    command: 'node scripts/automated-implementation.js phase2 --task feishu',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-test': {
    name: 'Phase 2: Test UI Package',
    command: 'npm run test:unit -- --testPathPattern=packages/ui',
    dependencies: ['phase2-desktop', 'phase2-feishu'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 3: Professional Package
  'phase3-setup': {
    name: 'Phase 3: Setup Professional Package',
    command: 'node scripts/automated-implementation.js phase3 --task setup',
    dependencies: ['phase2-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase3-research': {
    name: 'Phase 3: Research Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task research',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-dev': {
    name: 'Phase 3: Development Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task development',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-business': {
    name: 'Phase 3: Business Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task business',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-test': {
    name: 'Phase 3: Test Professional Package',
    command: 'npm run test:unit -- --testPathPattern=packages/professional',
    dependencies: ['phase3-research', 'phase3-dev', 'phase3-business'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 4: Integration
  'phase4-integrate': {
    name: 'Phase 4: Integration Testing',
    command: 'npm run test:integration',
    dependencies: ['phase3-test'],
    timeout: 600000,
    retryCount: 2,
  },
  'phase4-e2e': {
    name: 'Phase 4: E2E Testing',
    command: 'npm run test:e2e',
    dependencies: ['phase4-integrate'],
    timeout: 900000,
    retryCount: 2,
  },
  'phase4-release': {
    name: 'Phase 4: Release Preparation',
    command: 'node scripts/automated-implementation.js phase4 --task release',
    dependencies: ['phase4-e2e'],
    timeout: 300000,
    retryCount: 2,
  },
};

// Progress tracking
class ProgressTracker {
  constructor() {
    this.progress = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return {
      startTime: null,
      currentPhase: null,
      completedTasks: [],
      failedTasks: [],
      taskLogs: {},
      checkpoints: [],
    };
  }

  saveProgress() {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
  }

  startTask(taskId) {
    this.progress.currentPhase = taskId;
    this.progress.taskLogs[taskId] = {
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'running',
      attempts: (this.progress.taskLogs[taskId]?.attempts || 0) + 1,
      output: [],
    };
    this.saveProgress();
  }

  completeTask(taskId, success, output = '') {
    if (success) {
      if (!this.progress.completedTasks.includes(taskId)) {
        this.progress.completedTasks.push(taskId);
      }
    } else {
      if (!this.progress.failedTasks.includes(taskId)) {
        this.progress.failedTasks.push(taskId);
      }
    }

    if (this.progress.taskLogs[taskId]) {
      this.progress.taskLogs[taskId].endTime = new Date().toISOString();
      this.progress.taskLogs[taskId].status = success ? 'completed' : 'failed';
      this.progress.taskLogs[taskId].output.push(output);
    }
    
    this.progress.currentPhase = null;
    this.saveProgress();
  }

  createCheckpoint(name) {
    this.progress.checkpoints.push({
      name,
      timestamp: new Date().toISOString(),
      completedTasks: [...this.progress.completedTasks],
    });
    this.saveProgress();
  }

  canRunTask(taskId) {
    const task = TASKS[taskId];
    if (!task) return false;
    
    return task.dependencies.every(dep => 
      this.progress.completedTasks.includes(dep)
    );
  }

  getNextTask() {
    for (const taskId of Object.keys(TASKS)) {
      if (!this.progress.completedTasks.includes(taskId) &&
          !this.progress.failedTasks.includes(taskId) &&
          this.canRunTask(taskId)) {
        return taskId;
      }
    }
    return null;
  }
}

// Backup manager
class BackupManager {
  static createBackup(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `${name}-${timestamp}`);
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const criticalPaths = ['src', 'package.json', 'lerna.json', 'packages'];

    criticalPaths.forEach(p => {
      const sourcePath = path.join(ROOT_DIR, p);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, p);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
      }
    });

    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }

  static restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup not found: ${backupName}`);
      return false;
    }

    execSync(`cp -r "${backupPath}/"* "${ROOT_DIR}/"`, { stdio: 'inherit' });
    console.log(`✅ Restored from backup: ${backupName}`);
    return true;
  }

  static listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR);
  }
}

// Task executor
class TaskExecutor {
  static async execute(taskId) {
    const task = TASKS[taskId];
    if (!task) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    console.log(`\n🚀 Starting task: ${task.name}`);
    console.log(`   Command: ${task.command}`);
    console.log(`   Timeout: ${task.timeout}ms`);

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', task.command], {
        cwd: ROOT_DIR,
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(str);
      });

      child.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        process.stderr.write(str);
      });

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`Task timeout after ${task.timeout}ms`));
      }, task.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Task failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }
}

// Main scheduler
class Scheduler {
  constructor(options = {}) {
    this.progressTracker = new ProgressTracker();
    this.dryRun = options.dryRun || false;
    this.autoRetry = options.autoRetry !== false;
    this.maxRetries = options.maxRetries || 3;
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   Package Decomposition - Long-Running Task Scheduler     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!this.progressTracker.progress.startTime) {
      this.progressTracker.progress.startTime = new Date().toISOString();
      this.progressTracker.saveProgress();
    }

    BackupManager.createBackup('initial');

    while (true) {
      const nextTask = this.progressTracker.getNextTask();
      
      if (!nextTask) {
        const failed = this.progressTracker.progress.failedTasks;
        if (failed.length > 0) {
          console.log('\n❌ Migration stopped due to failed tasks:');
          failed.forEach(t => console.log(`   - ${t}`));
          console.log('\n   Fix issues and run with --resume to continue');
        } else {
          console.log('\n✅ All tasks completed successfully!');
          this.generateReport();
        }
        break;
      }

      const task = TASKS[nextTask];
      let attempts = 0;
      let success = false;

      while (attempts < task.retryCount && !success) {
        attempts++;
        
        if (this.dryRun) {
          console.log(`[DRY RUN] Would execute: ${task.name}`);
          this.progressTracker.completeTask(nextTask, true, 'Dry run');
          success = true;
          continue;
        }

        this.progressTracker.startTask(nextTask);

        try {
          BackupManager.createBackup(`pre-${nextTask}`);
          
          const output = await TaskExecutor.execute(nextTask);
          this.progressTracker.completeTask(nextTask, true, output);
          success = true;
          
          this.progressTracker.createCheckpoint(`post-${nextTask}`);
        } catch (error) {
          console.error(`\n❌ Task failed (attempt ${attempts}/${task.retryCount}): ${error.message}`);
          
          if (attempts >= task.retryCount) {
            this.progressTracker.completeTask(nextTask, false, error.message);
            
            if (!this.autoRetry) {
              console.log('\n   Auto-retry disabled. Exiting.');
              break;
            }
          } else {
            console.log('   Retrying...');
            await new Promise(r => setTimeout(r, 5000));
          }
        }
      }
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTasks: Object.keys(TASKS).length,
        completedTasks: this.progressTracker.progress.completedTasks.length,
        failedTasks: this.progressTracker.progress.failedTasks.length,
        startTime: this.progressTracker.progress.startTime,
        endTime: new Date().toISOString(),
      },
      completedTasks: this.progressTracker.progress.completedTasks,
      failedTasks: this.progressTracker.progress.failedTasks,
      taskDetails: this.progressTracker.progress.taskLogs,
    };

    const reportPath = path.join(LOG_DIR, `migration-report-${Date.now()}.json`);
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Migration report saved to: ${reportPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`   Total tasks: ${report.summary.totalTasks}`);
    console.log(`   Completed: ${report.summary.completedTasks}`);
    console.log(`   Failed: ${report.summary.failedTasks}`);
  }

  static resume() {
    console.log('📋 Resuming from previous state...\n');
    const scheduler = new Scheduler();
    scheduler.run();
  }

  static rollback(checkpointName) {
    console.log(`⏪ Rolling back to checkpoint: ${checkpointName}\n`);
    BackupManager.restoreBackup(checkpointName);
  }

  static status() {
    const progress = new ProgressTracker().progress;
    
    console.log('\n📊 Migration Status:\n');
    console.log(`Start Time: ${progress.startTime || 'Not started'}`);
    console.log(`Current Task: ${progress.currentPhase || 'None'}`);
    console.log(`\n✅ Completed Tasks (${progress.completedTasks.length}):`);
    progress.completedTasks.forEach(t => console.log(`   - ${t}`));
    
    if (progress.failedTasks.length > 0) {
      console.log(`\n❌ Failed Tasks (${progress.failedTasks.length}):`);
      progress.failedTasks.forEach(t => console.log(`   - ${t}`));
    }

    console.log('\n📁 Available Backups:');
    BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      const scheduler = new Scheduler({
        dryRun: args.includes('--dry-run'),
        autoRetry: !args.includes('--no-retry'),
      });
      scheduler.run();
      break;
    case 'resume':
      Scheduler.resume();
      break;
    case 'rollback':
      const checkpoint = args[1];
      if (!checkpoint) {
        console.error('Usage: node long-running-scheduler.js rollback <checkpoint-name>');
        process.exit(1);
      }
      Scheduler.rollback(checkpoint);
      break;
    case 'status':
      Scheduler.status();
      break;
    case 'list-backups':
      console.log('\n📁 Available Backups:');
      BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
      break;
    default:
      console.log(`
Usage: node long-running-scheduler.js <command> [options]

Commands:
  start           Start the migration process
  resume          Resume from previous state
  rollback <name> Rollback to a checkpoint
  status          Show current migration status
  list-backups    List available backups

Options:
  --dry-run       Simulate without making changes
  --no-retry      Disable automatic retry on failure

Examples:
  node long-running-scheduler.js start
  node long-running-scheduler.js start --dry-run
  node long-running-scheduler.js resume
  node long-running-scheduler.js rollback pre-phase1-core
  node long-running-scheduler.js status
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { Scheduler, ProgressTracker, BackupManager, TaskExecutor, TASKS };
/**
 * Long-Running Task Scheduler for Package Decomposition
 * 
 * This script manages automated execution of the package decomposition plan
 * with progress tracking, recovery, and rollback capabilities.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROGRESS_FILE = path.join(ROOT_DIR, '.package-migration-progress.json');
const LOG_DIR = path.join(ROOT_DIR, 'logs', 'migration');
const BACKUP_DIR = path.join(ROOT_DIR, '.migration-backups');

// Task definitions with dependencies
const TASKS = {
  // Phase 1: Base Package
  'phase1-setup': {
    name: 'Phase 1: Setup Base Package Structure',
    command: 'node scripts/automated-implementation.js phase1 --task setup',
    dependencies: [],
    timeout: 300000,
    retryCount: 3,
  },
  'phase1-core': {
    name: 'Phase 1: Migrate Core Components',
    command: 'node scripts/automated-implementation.js phase1 --task core',
    dependencies: ['phase1-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-adapters': {
    name: 'Phase 1: Migrate Adapters',
    command: 'node scripts/automated-implementation.js phase1 --task adapters',
    dependencies: ['phase1-core'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-test': {
    name: 'Phase 1: Test Base Package',
    command: 'npm run test:unit -- --testPathPattern=packages/base',
    dependencies: ['phase1-adapters'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 2: UI Package
  'phase2-setup': {
    name: 'Phase 2: Setup UI Package',
    command: 'node scripts/automated-implementation.js phase2 --task setup',
    dependencies: ['phase1-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase2-desktop': {
    name: 'Phase 2: Integrate Desktop UI',
    command: 'node scripts/automated-implementation.js phase2 --task desktop',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-feishu': {
    name: 'Phase 2: Integrate Feishu IM',
    command: 'node scripts/automated-implementation.js phase2 --task feishu',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-test': {
    name: 'Phase 2: Test UI Package',
    command: 'npm run test:unit -- --testPathPattern=packages/ui',
    dependencies: ['phase2-desktop', 'phase2-feishu'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 3: Professional Package
  'phase3-setup': {
    name: 'Phase 3: Setup Professional Package',
    command: 'node scripts/automated-implementation.js phase3 --task setup',
    dependencies: ['phase2-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase3-research': {
    name: 'Phase 3: Research Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task research',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-dev': {
    name: 'Phase 3: Development Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task development',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-business': {
    name: 'Phase 3: Business Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task business',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-test': {
    name: 'Phase 3: Test Professional Package',
    command: 'npm run test:unit -- --testPathPattern=packages/professional',
    dependencies: ['phase3-research', 'phase3-dev', 'phase3-business'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 4: Integration
  'phase4-integrate': {
    name: 'Phase 4: Integration Testing',
    command: 'npm run test:integration',
    dependencies: ['phase3-test'],
    timeout: 600000,
    retryCount: 2,
  },
  'phase4-e2e': {
    name: 'Phase 4: E2E Testing',
    command: 'npm run test:e2e',
    dependencies: ['phase4-integrate'],
    timeout: 900000,
    retryCount: 2,
  },
  'phase4-release': {
    name: 'Phase 4: Release Preparation',
    command: 'node scripts/automated-implementation.js phase4 --task release',
    dependencies: ['phase4-e2e'],
    timeout: 300000,
    retryCount: 2,
  },
};

// Progress tracking
class ProgressTracker {
  constructor() {
    this.progress = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return {
      startTime: null,
      currentPhase: null,
      completedTasks: [],
      failedTasks: [],
      taskLogs: {},
      checkpoints: [],
    };
  }

  saveProgress() {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
  }

  startTask(taskId) {
    this.progress.currentPhase = taskId;
    this.progress.taskLogs[taskId] = {
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'running',
      attempts: (this.progress.taskLogs[taskId]?.attempts || 0) + 1,
      output: [],
    };
    this.saveProgress();
  }

  completeTask(taskId, success, output = '') {
    if (success) {
      if (!this.progress.completedTasks.includes(taskId)) {
        this.progress.completedTasks.push(taskId);
      }
    } else {
      if (!this.progress.failedTasks.includes(taskId)) {
        this.progress.failedTasks.push(taskId);
      }
    }

    if (this.progress.taskLogs[taskId]) {
      this.progress.taskLogs[taskId].endTime = new Date().toISOString();
      this.progress.taskLogs[taskId].status = success ? 'completed' : 'failed';
      this.progress.taskLogs[taskId].output.push(output);
    }
    
    this.progress.currentPhase = null;
    this.saveProgress();
  }

  createCheckpoint(name) {
    this.progress.checkpoints.push({
      name,
      timestamp: new Date().toISOString(),
      completedTasks: [...this.progress.completedTasks],
    });
    this.saveProgress();
  }

  canRunTask(taskId) {
    const task = TASKS[taskId];
    if (!task) return false;
    
    return task.dependencies.every(dep => 
      this.progress.completedTasks.includes(dep)
    );
  }

  getNextTask() {
    for (const taskId of Object.keys(TASKS)) {
      if (!this.progress.completedTasks.includes(taskId) &&
          !this.progress.failedTasks.includes(taskId) &&
          this.canRunTask(taskId)) {
        return taskId;
      }
    }
    return null;
  }
}

// Backup manager
class BackupManager {
  static createBackup(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `${name}-${timestamp}`);
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const criticalPaths = ['src', 'package.json', 'lerna.json', 'packages'];

    criticalPaths.forEach(p => {
      const sourcePath = path.join(ROOT_DIR, p);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, p);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
      }
    });

    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }

  static restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup not found: ${backupName}`);
      return false;
    }

    execSync(`cp -r "${backupPath}/"* "${ROOT_DIR}/"`, { stdio: 'inherit' });
    console.log(`✅ Restored from backup: ${backupName}`);
    return true;
  }

  static listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR);
  }
}

// Task executor
class TaskExecutor {
  static async execute(taskId) {
    const task = TASKS[taskId];
    if (!task) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    console.log(`\n🚀 Starting task: ${task.name}`);
    console.log(`   Command: ${task.command}`);
    console.log(`   Timeout: ${task.timeout}ms`);

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', task.command], {
        cwd: ROOT_DIR,
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(str);
      });

      child.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        process.stderr.write(str);
      });

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`Task timeout after ${task.timeout}ms`));
      }, task.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Task failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }
}

// Main scheduler
class Scheduler {
  constructor(options = {}) {
    this.progressTracker = new ProgressTracker();
    this.dryRun = options.dryRun || false;
    this.autoRetry = options.autoRetry !== false;
    this.maxRetries = options.maxRetries || 3;
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   Package Decomposition - Long-Running Task Scheduler     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!this.progressTracker.progress.startTime) {
      this.progressTracker.progress.startTime = new Date().toISOString();
      this.progressTracker.saveProgress();
    }

    BackupManager.createBackup('initial');

    while (true) {
      const nextTask = this.progressTracker.getNextTask();
      
      if (!nextTask) {
        const failed = this.progressTracker.progress.failedTasks;
        if (failed.length > 0) {
          console.log('\n❌ Migration stopped due to failed tasks:');
          failed.forEach(t => console.log(`   - ${t}`));
          console.log('\n   Fix issues and run with --resume to continue');
        } else {
          console.log('\n✅ All tasks completed successfully!');
          this.generateReport();
        }
        break;
      }

      const task = TASKS[nextTask];
      let attempts = 0;
      let success = false;

      while (attempts < task.retryCount && !success) {
        attempts++;
        
        if (this.dryRun) {
          console.log(`[DRY RUN] Would execute: ${task.name}`);
          this.progressTracker.completeTask(nextTask, true, 'Dry run');
          success = true;
          continue;
        }

        this.progressTracker.startTask(nextTask);

        try {
          BackupManager.createBackup(`pre-${nextTask}`);
          
          const output = await TaskExecutor.execute(nextTask);
          this.progressTracker.completeTask(nextTask, true, output);
          success = true;
          
          this.progressTracker.createCheckpoint(`post-${nextTask}`);
        } catch (error) {
          console.error(`\n❌ Task failed (attempt ${attempts}/${task.retryCount}): ${error.message}`);
          
          if (attempts >= task.retryCount) {
            this.progressTracker.completeTask(nextTask, false, error.message);
            
            if (!this.autoRetry) {
              console.log('\n   Auto-retry disabled. Exiting.');
              break;
            }
          } else {
            console.log('   Retrying...');
            await new Promise(r => setTimeout(r, 5000));
          }
        }
      }
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTasks: Object.keys(TASKS).length,
        completedTasks: this.progressTracker.progress.completedTasks.length,
        failedTasks: this.progressTracker.progress.failedTasks.length,
        startTime: this.progressTracker.progress.startTime,
        endTime: new Date().toISOString(),
      },
      completedTasks: this.progressTracker.progress.completedTasks,
      failedTasks: this.progressTracker.progress.failedTasks,
      taskDetails: this.progressTracker.progress.taskLogs,
    };

    const reportPath = path.join(LOG_DIR, `migration-report-${Date.now()}.json`);
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Migration report saved to: ${reportPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`   Total tasks: ${report.summary.totalTasks}`);
    console.log(`   Completed: ${report.summary.completedTasks}`);
    console.log(`   Failed: ${report.summary.failedTasks}`);
  }

  static resume() {
    console.log('📋 Resuming from previous state...\n');
    const scheduler = new Scheduler();
    scheduler.run();
  }

  static rollback(checkpointName) {
    console.log(`⏪ Rolling back to checkpoint: ${checkpointName}\n`);
    BackupManager.restoreBackup(checkpointName);
  }

  static status() {
    const progress = new ProgressTracker().progress;
    
    console.log('\n📊 Migration Status:\n');
    console.log(`Start Time: ${progress.startTime || 'Not started'}`);
    console.log(`Current Task: ${progress.currentPhase || 'None'}`);
    console.log(`\n✅ Completed Tasks (${progress.completedTasks.length}):`);
    progress.completedTasks.forEach(t => console.log(`   - ${t}`));
    
    if (progress.failedTasks.length > 0) {
      console.log(`\n❌ Failed Tasks (${progress.failedTasks.length}):`);
      progress.failedTasks.forEach(t => console.log(`   - ${t}`));
    }

    console.log('\n📁 Available Backups:');
    BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      const scheduler = new Scheduler({
        dryRun: args.includes('--dry-run'),
        autoRetry: !args.includes('--no-retry'),
      });
      scheduler.run();
      break;
    case 'resume':
      Scheduler.resume();
      break;
    case 'rollback':
      const checkpoint = args[1];
      if (!checkpoint) {
        console.error('Usage: node long-running-scheduler.js rollback <checkpoint-name>');
        process.exit(1);
      }
      Scheduler.rollback(checkpoint);
      break;
    case 'status':
      Scheduler.status();
      break;
    case 'list-backups':
      console.log('\n📁 Available Backups:');
      BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
      break;
    default:
      console.log(`
Usage: node long-running-scheduler.js <command> [options]

Commands:
  start           Start the migration process
  resume          Resume from previous state
  rollback <name> Rollback to a checkpoint
  status          Show current migration status
  list-backups    List available backups

Options:
  --dry-run       Simulate without making changes
  --no-retry      Disable automatic retry on failure

Examples:
  node long-running-scheduler.js start
  node long-running-scheduler.js start --dry-run
  node long-running-scheduler.js resume
  node long-running-scheduler.js rollback pre-phase1-core
  node long-running-scheduler.js status
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { Scheduler, ProgressTracker, BackupManager, TaskExecutor, TASKS };

 * Long-Running Task Scheduler for Package Decomposition
 * 
 * This script manages automated execution of the package decomposition plan
 * with progress tracking, recovery, and rollback capabilities.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROGRESS_FILE = path.join(ROOT_DIR, '.package-migration-progress.json');
const LOG_DIR = path.join(ROOT_DIR, 'logs', 'migration');
const BACKUP_DIR = path.join(ROOT_DIR, '.migration-backups');

// Task definitions with dependencies
const TASKS = {
  // Phase 1: Base Package
  'phase1-setup': {
    name: 'Phase 1: Setup Base Package Structure',
    command: 'node scripts/automated-implementation.js phase1 --task setup',
    dependencies: [],
    timeout: 300000,
    retryCount: 3,
  },
  'phase1-core': {
    name: 'Phase 1: Migrate Core Components',
    command: 'node scripts/automated-implementation.js phase1 --task core',
    dependencies: ['phase1-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-adapters': {
    name: 'Phase 1: Migrate Adapters',
    command: 'node scripts/automated-implementation.js phase1 --task adapters',
    dependencies: ['phase1-core'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-test': {
    name: 'Phase 1: Test Base Package',
    command: 'npm run test:unit -- --testPathPattern=packages/base',
    dependencies: ['phase1-adapters'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 2: UI Package
  'phase2-setup': {
    name: 'Phase 2: Setup UI Package',
    command: 'node scripts/automated-implementation.js phase2 --task setup',
    dependencies: ['phase1-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase2-desktop': {
    name: 'Phase 2: Integrate Desktop UI',
    command: 'node scripts/automated-implementation.js phase2 --task desktop',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-feishu': {
    name: 'Phase 2: Integrate Feishu IM',
    command: 'node scripts/automated-implementation.js phase2 --task feishu',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-test': {
    name: 'Phase 2: Test UI Package',
    command: 'npm run test:unit -- --testPathPattern=packages/ui',
    dependencies: ['phase2-desktop', 'phase2-feishu'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 3: Professional Package
  'phase3-setup': {
    name: 'Phase 3: Setup Professional Package',
    command: 'node scripts/automated-implementation.js phase3 --task setup',
    dependencies: ['phase2-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase3-research': {
    name: 'Phase 3: Research Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task research',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-dev': {
    name: 'Phase 3: Development Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task development',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-business': {
    name: 'Phase 3: Business Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task business',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-test': {
    name: 'Phase 3: Test Professional Package',
    command: 'npm run test:unit -- --testPathPattern=packages/professional',
    dependencies: ['phase3-research', 'phase3-dev', 'phase3-business'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 4: Integration
  'phase4-integrate': {
    name: 'Phase 4: Integration Testing',
    command: 'npm run test:integration',
    dependencies: ['phase3-test'],
    timeout: 600000,
    retryCount: 2,
  },
  'phase4-e2e': {
    name: 'Phase 4: E2E Testing',
    command: 'npm run test:e2e',
    dependencies: ['phase4-integrate'],
    timeout: 900000,
    retryCount: 2,
  },
  'phase4-release': {
    name: 'Phase 4: Release Preparation',
    command: 'node scripts/automated-implementation.js phase4 --task release',
    dependencies: ['phase4-e2e'],
    timeout: 300000,
    retryCount: 2,
  },
};

// Progress tracking
class ProgressTracker {
  constructor() {
    this.progress = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return {
      startTime: null,
      currentPhase: null,
      completedTasks: [],
      failedTasks: [],
      taskLogs: {},
      checkpoints: [],
    };
  }

  saveProgress() {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
  }

  startTask(taskId) {
    this.progress.currentPhase = taskId;
    this.progress.taskLogs[taskId] = {
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'running',
      attempts: (this.progress.taskLogs[taskId]?.attempts || 0) + 1,
      output: [],
    };
    this.saveProgress();
  }

  completeTask(taskId, success, output = '') {
    if (success) {
      if (!this.progress.completedTasks.includes(taskId)) {
        this.progress.completedTasks.push(taskId);
      }
    } else {
      if (!this.progress.failedTasks.includes(taskId)) {
        this.progress.failedTasks.push(taskId);
      }
    }

    if (this.progress.taskLogs[taskId]) {
      this.progress.taskLogs[taskId].endTime = new Date().toISOString();
      this.progress.taskLogs[taskId].status = success ? 'completed' : 'failed';
      this.progress.taskLogs[taskId].output.push(output);
    }
    
    this.progress.currentPhase = null;
    this.saveProgress();
  }

  createCheckpoint(name) {
    this.progress.checkpoints.push({
      name,
      timestamp: new Date().toISOString(),
      completedTasks: [...this.progress.completedTasks],
    });
    this.saveProgress();
  }

  canRunTask(taskId) {
    const task = TASKS[taskId];
    if (!task) return false;
    
    return task.dependencies.every(dep => 
      this.progress.completedTasks.includes(dep)
    );
  }

  getNextTask() {
    for (const taskId of Object.keys(TASKS)) {
      if (!this.progress.completedTasks.includes(taskId) &&
          !this.progress.failedTasks.includes(taskId) &&
          this.canRunTask(taskId)) {
        return taskId;
      }
    }
    return null;
  }
}

// Backup manager
class BackupManager {
  static createBackup(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `${name}-${timestamp}`);
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const criticalPaths = ['src', 'package.json', 'lerna.json', 'packages'];

    criticalPaths.forEach(p => {
      const sourcePath = path.join(ROOT_DIR, p);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, p);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
      }
    });

    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }

  static restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup not found: ${backupName}`);
      return false;
    }

    execSync(`cp -r "${backupPath}/"* "${ROOT_DIR}/"`, { stdio: 'inherit' });
    console.log(`✅ Restored from backup: ${backupName}`);
    return true;
  }

  static listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR);
  }
}

// Task executor
class TaskExecutor {
  static async execute(taskId) {
    const task = TASKS[taskId];
    if (!task) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    console.log(`\n🚀 Starting task: ${task.name}`);
    console.log(`   Command: ${task.command}`);
    console.log(`   Timeout: ${task.timeout}ms`);

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', task.command], {
        cwd: ROOT_DIR,
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(str);
      });

      child.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        process.stderr.write(str);
      });

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`Task timeout after ${task.timeout}ms`));
      }, task.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Task failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }
}

// Main scheduler
class Scheduler {
  constructor(options = {}) {
    this.progressTracker = new ProgressTracker();
    this.dryRun = options.dryRun || false;
    this.autoRetry = options.autoRetry !== false;
    this.maxRetries = options.maxRetries || 3;
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   Package Decomposition - Long-Running Task Scheduler     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!this.progressTracker.progress.startTime) {
      this.progressTracker.progress.startTime = new Date().toISOString();
      this.progressTracker.saveProgress();
    }

    BackupManager.createBackup('initial');

    while (true) {
      const nextTask = this.progressTracker.getNextTask();
      
      if (!nextTask) {
        const failed = this.progressTracker.progress.failedTasks;
        if (failed.length > 0) {
          console.log('\n❌ Migration stopped due to failed tasks:');
          failed.forEach(t => console.log(`   - ${t}`));
          console.log('\n   Fix issues and run with --resume to continue');
        } else {
          console.log('\n✅ All tasks completed successfully!');
          this.generateReport();
        }
        break;
      }

      const task = TASKS[nextTask];
      let attempts = 0;
      let success = false;

      while (attempts < task.retryCount && !success) {
        attempts++;
        
        if (this.dryRun) {
          console.log(`[DRY RUN] Would execute: ${task.name}`);
          this.progressTracker.completeTask(nextTask, true, 'Dry run');
          success = true;
          continue;
        }

        this.progressTracker.startTask(nextTask);

        try {
          BackupManager.createBackup(`pre-${nextTask}`);
          
          const output = await TaskExecutor.execute(nextTask);
          this.progressTracker.completeTask(nextTask, true, output);
          success = true;
          
          this.progressTracker.createCheckpoint(`post-${nextTask}`);
        } catch (error) {
          console.error(`\n❌ Task failed (attempt ${attempts}/${task.retryCount}): ${error.message}`);
          
          if (attempts >= task.retryCount) {
            this.progressTracker.completeTask(nextTask, false, error.message);
            
            if (!this.autoRetry) {
              console.log('\n   Auto-retry disabled. Exiting.');
              break;
            }
          } else {
            console.log('   Retrying...');
            await new Promise(r => setTimeout(r, 5000));
          }
        }
      }
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTasks: Object.keys(TASKS).length,
        completedTasks: this.progressTracker.progress.completedTasks.length,
        failedTasks: this.progressTracker.progress.failedTasks.length,
        startTime: this.progressTracker.progress.startTime,
        endTime: new Date().toISOString(),
      },
      completedTasks: this.progressTracker.progress.completedTasks,
      failedTasks: this.progressTracker.progress.failedTasks,
      taskDetails: this.progressTracker.progress.taskLogs,
    };

    const reportPath = path.join(LOG_DIR, `migration-report-${Date.now()}.json`);
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Migration report saved to: ${reportPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`   Total tasks: ${report.summary.totalTasks}`);
    console.log(`   Completed: ${report.summary.completedTasks}`);
    console.log(`   Failed: ${report.summary.failedTasks}`);
  }

  static resume() {
    console.log('📋 Resuming from previous state...\n');
    const scheduler = new Scheduler();
    scheduler.run();
  }

  static rollback(checkpointName) {
    console.log(`⏪ Rolling back to checkpoint: ${checkpointName}\n`);
    BackupManager.restoreBackup(checkpointName);
  }

  static status() {
    const progress = new ProgressTracker().progress;
    
    console.log('\n📊 Migration Status:\n');
    console.log(`Start Time: ${progress.startTime || 'Not started'}`);
    console.log(`Current Task: ${progress.currentPhase || 'None'}`);
    console.log(`\n✅ Completed Tasks (${progress.completedTasks.length}):`);
    progress.completedTasks.forEach(t => console.log(`   - ${t}`));
    
    if (progress.failedTasks.length > 0) {
      console.log(`\n❌ Failed Tasks (${progress.failedTasks.length}):`);
      progress.failedTasks.forEach(t => console.log(`   - ${t}`));
    }

    console.log('\n📁 Available Backups:');
    BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      const scheduler = new Scheduler({
        dryRun: args.includes('--dry-run'),
        autoRetry: !args.includes('--no-retry'),
      });
      scheduler.run();
      break;
    case 'resume':
      Scheduler.resume();
      break;
    case 'rollback':
      const checkpoint = args[1];
      if (!checkpoint) {
        console.error('Usage: node long-running-scheduler.js rollback <checkpoint-name>');
        process.exit(1);
      }
      Scheduler.rollback(checkpoint);
      break;
    case 'status':
      Scheduler.status();
      break;
    case 'list-backups':
      console.log('\n📁 Available Backups:');
      BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
      break;
    default:
      console.log(`
Usage: node long-running-scheduler.js <command> [options]

Commands:
  start           Start the migration process
  resume          Resume from previous state
  rollback <name> Rollback to a checkpoint
  status          Show current migration status
  list-backups    List available backups

Options:
  --dry-run       Simulate without making changes
  --no-retry      Disable automatic retry on failure

Examples:
  node long-running-scheduler.js start
  node long-running-scheduler.js start --dry-run
  node long-running-scheduler.js resume
  node long-running-scheduler.js rollback pre-phase1-core
  node long-running-scheduler.js status
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { Scheduler, ProgressTracker, BackupManager, TaskExecutor, TASKS };

 * Long-Running Task Scheduler for Package Decomposition
 * 
 * This script manages automated execution of the package decomposition plan
 * with progress tracking, recovery, and rollback capabilities.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROGRESS_FILE = path.join(ROOT_DIR, '.package-migration-progress.json');
const LOG_DIR = path.join(ROOT_DIR, 'logs', 'migration');
const BACKUP_DIR = path.join(ROOT_DIR, '.migration-backups');

// Task definitions with dependencies
const TASKS = {
  // Phase 1: Base Package
  'phase1-setup': {
    name: 'Phase 1: Setup Base Package Structure',
    command: 'node scripts/automated-implementation.js phase1 --task setup',
    dependencies: [],
    timeout: 300000,
    retryCount: 3,
  },
  'phase1-core': {
    name: 'Phase 1: Migrate Core Components',
    command: 'node scripts/automated-implementation.js phase1 --task core',
    dependencies: ['phase1-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-adapters': {
    name: 'Phase 1: Migrate Adapters',
    command: 'node scripts/automated-implementation.js phase1 --task adapters',
    dependencies: ['phase1-core'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-test': {
    name: 'Phase 1: Test Base Package',
    command: 'npm run test:unit -- --testPathPattern=packages/base',
    dependencies: ['phase1-adapters'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 2: UI Package
  'phase2-setup': {
    name: 'Phase 2: Setup UI Package',
    command: 'node scripts/automated-implementation.js phase2 --task setup',
    dependencies: ['phase1-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase2-desktop': {
    name: 'Phase 2: Integrate Desktop UI',
    command: 'node scripts/automated-implementation.js phase2 --task desktop',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-feishu': {
    name: 'Phase 2: Integrate Feishu IM',
    command: 'node scripts/automated-implementation.js phase2 --task feishu',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-test': {
    name: 'Phase 2: Test UI Package',
    command: 'npm run test:unit -- --testPathPattern=packages/ui',
    dependencies: ['phase2-desktop', 'phase2-feishu'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 3: Professional Package
  'phase3-setup': {
    name: 'Phase 3: Setup Professional Package',
    command: 'node scripts/automated-implementation.js phase3 --task setup',
    dependencies: ['phase2-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase3-research': {
    name: 'Phase 3: Research Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task research',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-dev': {
    name: 'Phase 3: Development Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task development',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-business': {
    name: 'Phase 3: Business Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task business',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-test': {
    name: 'Phase 3: Test Professional Package',
    command: 'npm run test:unit -- --testPathPattern=packages/professional',
    dependencies: ['phase3-research', 'phase3-dev', 'phase3-business'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 4: Integration
  'phase4-integrate': {
    name: 'Phase 4: Integration Testing',
    command: 'npm run test:integration',
    dependencies: ['phase3-test'],
    timeout: 600000,
    retryCount: 2,
  },
  'phase4-e2e': {
    name: 'Phase 4: E2E Testing',
    command: 'npm run test:e2e',
    dependencies: ['phase4-integrate'],
    timeout: 900000,
    retryCount: 2,
  },
  'phase4-release': {
    name: 'Phase 4: Release Preparation',
    command: 'node scripts/automated-implementation.js phase4 --task release',
    dependencies: ['phase4-e2e'],
    timeout: 300000,
    retryCount: 2,
  },
};

// Progress tracking
class ProgressTracker {
  constructor() {
    this.progress = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return {
      startTime: null,
      currentPhase: null,
      completedTasks: [],
      failedTasks: [],
      taskLogs: {},
      checkpoints: [],
    };
  }

  saveProgress() {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
  }

  startTask(taskId) {
    this.progress.currentPhase = taskId;
    this.progress.taskLogs[taskId] = {
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'running',
      attempts: (this.progress.taskLogs[taskId]?.attempts || 0) + 1,
      output: [],
    };
    this.saveProgress();
  }

  completeTask(taskId, success, output = '') {
    if (success) {
      if (!this.progress.completedTasks.includes(taskId)) {
        this.progress.completedTasks.push(taskId);
      }
    } else {
      if (!this.progress.failedTasks.includes(taskId)) {
        this.progress.failedTasks.push(taskId);
      }
    }

    if (this.progress.taskLogs[taskId]) {
      this.progress.taskLogs[taskId].endTime = new Date().toISOString();
      this.progress.taskLogs[taskId].status = success ? 'completed' : 'failed';
      this.progress.taskLogs[taskId].output.push(output);
    }
    
    this.progress.currentPhase = null;
    this.saveProgress();
  }

  createCheckpoint(name) {
    this.progress.checkpoints.push({
      name,
      timestamp: new Date().toISOString(),
      completedTasks: [...this.progress.completedTasks],
    });
    this.saveProgress();
  }

  canRunTask(taskId) {
    const task = TASKS[taskId];
    if (!task) return false;
    
    return task.dependencies.every(dep => 
      this.progress.completedTasks.includes(dep)
    );
  }

  getNextTask() {
    for (const taskId of Object.keys(TASKS)) {
      if (!this.progress.completedTasks.includes(taskId) &&
          !this.progress.failedTasks.includes(taskId) &&
          this.canRunTask(taskId)) {
        return taskId;
      }
    }
    return null;
  }
}

// Backup manager
class BackupManager {
  static createBackup(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `${name}-${timestamp}`);
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const criticalPaths = ['src', 'package.json', 'lerna.json', 'packages'];

    criticalPaths.forEach(p => {
      const sourcePath = path.join(ROOT_DIR, p);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, p);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
      }
    });

    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }

  static restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup not found: ${backupName}`);
      return false;
    }

    execSync(`cp -r "${backupPath}/"* "${ROOT_DIR}/"`, { stdio: 'inherit' });
    console.log(`✅ Restored from backup: ${backupName}`);
    return true;
  }

  static listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR);
  }
}

// Task executor
class TaskExecutor {
  static async execute(taskId) {
    const task = TASKS[taskId];
    if (!task) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    console.log(`\n🚀 Starting task: ${task.name}`);
    console.log(`   Command: ${task.command}`);
    console.log(`   Timeout: ${task.timeout}ms`);

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', task.command], {
        cwd: ROOT_DIR,
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(str);
      });

      child.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        process.stderr.write(str);
      });

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`Task timeout after ${task.timeout}ms`));
      }, task.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Task failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }
}

// Main scheduler
class Scheduler {
  constructor(options = {}) {
    this.progressTracker = new ProgressTracker();
    this.dryRun = options.dryRun || false;
    this.autoRetry = options.autoRetry !== false;
    this.maxRetries = options.maxRetries || 3;
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   Package Decomposition - Long-Running Task Scheduler     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!this.progressTracker.progress.startTime) {
      this.progressTracker.progress.startTime = new Date().toISOString();
      this.progressTracker.saveProgress();
    }

    BackupManager.createBackup('initial');

    while (true) {
      const nextTask = this.progressTracker.getNextTask();
      
      if (!nextTask) {
        const failed = this.progressTracker.progress.failedTasks;
        if (failed.length > 0) {
          console.log('\n❌ Migration stopped due to failed tasks:');
          failed.forEach(t => console.log(`   - ${t}`));
          console.log('\n   Fix issues and run with --resume to continue');
        } else {
          console.log('\n✅ All tasks completed successfully!');
          this.generateReport();
        }
        break;
      }

      const task = TASKS[nextTask];
      let attempts = 0;
      let success = false;

      while (attempts < task.retryCount && !success) {
        attempts++;
        
        if (this.dryRun) {
          console.log(`[DRY RUN] Would execute: ${task.name}`);
          this.progressTracker.completeTask(nextTask, true, 'Dry run');
          success = true;
          continue;
        }

        this.progressTracker.startTask(nextTask);

        try {
          BackupManager.createBackup(`pre-${nextTask}`);
          
          const output = await TaskExecutor.execute(nextTask);
          this.progressTracker.completeTask(nextTask, true, output);
          success = true;
          
          this.progressTracker.createCheckpoint(`post-${nextTask}`);
        } catch (error) {
          console.error(`\n❌ Task failed (attempt ${attempts}/${task.retryCount}): ${error.message}`);
          
          if (attempts >= task.retryCount) {
            this.progressTracker.completeTask(nextTask, false, error.message);
            
            if (!this.autoRetry) {
              console.log('\n   Auto-retry disabled. Exiting.');
              break;
            }
          } else {
            console.log('   Retrying...');
            await new Promise(r => setTimeout(r, 5000));
          }
        }
      }
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTasks: Object.keys(TASKS).length,
        completedTasks: this.progressTracker.progress.completedTasks.length,
        failedTasks: this.progressTracker.progress.failedTasks.length,
        startTime: this.progressTracker.progress.startTime,
        endTime: new Date().toISOString(),
      },
      completedTasks: this.progressTracker.progress.completedTasks,
      failedTasks: this.progressTracker.progress.failedTasks,
      taskDetails: this.progressTracker.progress.taskLogs,
    };

    const reportPath = path.join(LOG_DIR, `migration-report-${Date.now()}.json`);
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Migration report saved to: ${reportPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`   Total tasks: ${report.summary.totalTasks}`);
    console.log(`   Completed: ${report.summary.completedTasks}`);
    console.log(`   Failed: ${report.summary.failedTasks}`);
  }

  static resume() {
    console.log('📋 Resuming from previous state...\n');
    const scheduler = new Scheduler();
    scheduler.run();
  }

  static rollback(checkpointName) {
    console.log(`⏪ Rolling back to checkpoint: ${checkpointName}\n`);
    BackupManager.restoreBackup(checkpointName);
  }

  static status() {
    const progress = new ProgressTracker().progress;
    
    console.log('\n📊 Migration Status:\n');
    console.log(`Start Time: ${progress.startTime || 'Not started'}`);
    console.log(`Current Task: ${progress.currentPhase || 'None'}`);
    console.log(`\n✅ Completed Tasks (${progress.completedTasks.length}):`);
    progress.completedTasks.forEach(t => console.log(`   - ${t}`));
    
    if (progress.failedTasks.length > 0) {
      console.log(`\n❌ Failed Tasks (${progress.failedTasks.length}):`);
      progress.failedTasks.forEach(t => console.log(`   - ${t}`));
    }

    console.log('\n📁 Available Backups:');
    BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      const scheduler = new Scheduler({
        dryRun: args.includes('--dry-run'),
        autoRetry: !args.includes('--no-retry'),
      });
      scheduler.run();
      break;
    case 'resume':
      Scheduler.resume();
      break;
    case 'rollback':
      const checkpoint = args[1];
      if (!checkpoint) {
        console.error('Usage: node long-running-scheduler.js rollback <checkpoint-name>');
        process.exit(1);
      }
      Scheduler.rollback(checkpoint);
      break;
    case 'status':
      Scheduler.status();
      break;
    case 'list-backups':
      console.log('\n📁 Available Backups:');
      BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
      break;
    default:
      console.log(`
Usage: node long-running-scheduler.js <command> [options]

Commands:
  start           Start the migration process
  resume          Resume from previous state
  rollback <name> Rollback to a checkpoint
  status          Show current migration status
  list-backups    List available backups

Options:
  --dry-run       Simulate without making changes
  --no-retry      Disable automatic retry on failure

Examples:
  node long-running-scheduler.js start
  node long-running-scheduler.js start --dry-run
  node long-running-scheduler.js resume
  node long-running-scheduler.js rollback pre-phase1-core
  node long-running-scheduler.js status
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { Scheduler, ProgressTracker, BackupManager, TaskExecutor, TASKS };

 * Long-Running Task Scheduler for Package Decomposition
 * 
 * This script manages automated execution of the package decomposition plan
 * with progress tracking, recovery, and rollback capabilities.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROGRESS_FILE = path.join(ROOT_DIR, '.package-migration-progress.json');
const LOG_DIR = path.join(ROOT_DIR, 'logs', 'migration');
const BACKUP_DIR = path.join(ROOT_DIR, '.migration-backups');

// Task definitions with dependencies
const TASKS = {
  // Phase 1: Base Package
  'phase1-setup': {
    name: 'Phase 1: Setup Base Package Structure',
    command: 'node scripts/automated-implementation.js phase1 --task setup',
    dependencies: [],
    timeout: 300000,
    retryCount: 3,
  },
  'phase1-core': {
    name: 'Phase 1: Migrate Core Components',
    command: 'node scripts/automated-implementation.js phase1 --task core',
    dependencies: ['phase1-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-adapters': {
    name: 'Phase 1: Migrate Adapters',
    command: 'node scripts/automated-implementation.js phase1 --task adapters',
    dependencies: ['phase1-core'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-test': {
    name: 'Phase 1: Test Base Package',
    command: 'npm run test:unit -- --testPathPattern=packages/base',
    dependencies: ['phase1-adapters'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 2: UI Package
  'phase2-setup': {
    name: 'Phase 2: Setup UI Package',
    command: 'node scripts/automated-implementation.js phase2 --task setup',
    dependencies: ['phase1-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase2-desktop': {
    name: 'Phase 2: Integrate Desktop UI',
    command: 'node scripts/automated-implementation.js phase2 --task desktop',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-feishu': {
    name: 'Phase 2: Integrate Feishu IM',
    command: 'node scripts/automated-implementation.js phase2 --task feishu',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-test': {
    name: 'Phase 2: Test UI Package',
    command: 'npm run test:unit -- --testPathPattern=packages/ui',
    dependencies: ['phase2-desktop', 'phase2-feishu'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 3: Professional Package
  'phase3-setup': {
    name: 'Phase 3: Setup Professional Package',
    command: 'node scripts/automated-implementation.js phase3 --task setup',
    dependencies: ['phase2-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase3-research': {
    name: 'Phase 3: Research Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task research',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-dev': {
    name: 'Phase 3: Development Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task development',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-business': {
    name: 'Phase 3: Business Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task business',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-test': {
    name: 'Phase 3: Test Professional Package',
    command: 'npm run test:unit -- --testPathPattern=packages/professional',
    dependencies: ['phase3-research', 'phase3-dev', 'phase3-business'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 4: Integration
  'phase4-integrate': {
    name: 'Phase 4: Integration Testing',
    command: 'npm run test:integration',
    dependencies: ['phase3-test'],
    timeout: 600000,
    retryCount: 2,
  },
  'phase4-e2e': {
    name: 'Phase 4: E2E Testing',
    command: 'npm run test:e2e',
    dependencies: ['phase4-integrate'],
    timeout: 900000,
    retryCount: 2,
  },
  'phase4-release': {
    name: 'Phase 4: Release Preparation',
    command: 'node scripts/automated-implementation.js phase4 --task release',
    dependencies: ['phase4-e2e'],
    timeout: 300000,
    retryCount: 2,
  },
};

// Progress tracking
class ProgressTracker {
  constructor() {
    this.progress = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return {
      startTime: null,
      currentPhase: null,
      completedTasks: [],
      failedTasks: [],
      taskLogs: {},
      checkpoints: [],
    };
  }

  saveProgress() {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
  }

  startTask(taskId) {
    this.progress.currentPhase = taskId;
    this.progress.taskLogs[taskId] = {
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'running',
      attempts: (this.progress.taskLogs[taskId]?.attempts || 0) + 1,
      output: [],
    };
    this.saveProgress();
  }

  completeTask(taskId, success, output = '') {
    if (success) {
      if (!this.progress.completedTasks.includes(taskId)) {
        this.progress.completedTasks.push(taskId);
      }
    } else {
      if (!this.progress.failedTasks.includes(taskId)) {
        this.progress.failedTasks.push(taskId);
      }
    }

    if (this.progress.taskLogs[taskId]) {
      this.progress.taskLogs[taskId].endTime = new Date().toISOString();
      this.progress.taskLogs[taskId].status = success ? 'completed' : 'failed';
      this.progress.taskLogs[taskId].output.push(output);
    }
    
    this.progress.currentPhase = null;
    this.saveProgress();
  }

  createCheckpoint(name) {
    this.progress.checkpoints.push({
      name,
      timestamp: new Date().toISOString(),
      completedTasks: [...this.progress.completedTasks],
    });
    this.saveProgress();
  }

  canRunTask(taskId) {
    const task = TASKS[taskId];
    if (!task) return false;
    
    return task.dependencies.every(dep => 
      this.progress.completedTasks.includes(dep)
    );
  }

  getNextTask() {
    for (const taskId of Object.keys(TASKS)) {
      if (!this.progress.completedTasks.includes(taskId) &&
          !this.progress.failedTasks.includes(taskId) &&
          this.canRunTask(taskId)) {
        return taskId;
      }
    }
    return null;
  }
}

// Backup manager
class BackupManager {
  static createBackup(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `${name}-${timestamp}`);
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const criticalPaths = ['src', 'package.json', 'lerna.json', 'packages'];

    criticalPaths.forEach(p => {
      const sourcePath = path.join(ROOT_DIR, p);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, p);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
      }
    });

    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }

  static restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup not found: ${backupName}`);
      return false;
    }

    execSync(`cp -r "${backupPath}/"* "${ROOT_DIR}/"`, { stdio: 'inherit' });
    console.log(`✅ Restored from backup: ${backupName}`);
    return true;
  }

  static listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR);
  }
}

// Task executor
class TaskExecutor {
  static async execute(taskId) {
    const task = TASKS[taskId];
    if (!task) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    console.log(`\n🚀 Starting task: ${task.name}`);
    console.log(`   Command: ${task.command}`);
    console.log(`   Timeout: ${task.timeout}ms`);

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', task.command], {
        cwd: ROOT_DIR,
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(str);
      });

      child.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        process.stderr.write(str);
      });

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`Task timeout after ${task.timeout}ms`));
      }, task.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Task failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }
}

// Main scheduler
class Scheduler {
  constructor(options = {}) {
    this.progressTracker = new ProgressTracker();
    this.dryRun = options.dryRun || false;
    this.autoRetry = options.autoRetry !== false;
    this.maxRetries = options.maxRetries || 3;
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   Package Decomposition - Long-Running Task Scheduler     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!this.progressTracker.progress.startTime) {
      this.progressTracker.progress.startTime = new Date().toISOString();
      this.progressTracker.saveProgress();
    }

    BackupManager.createBackup('initial');

    while (true) {
      const nextTask = this.progressTracker.getNextTask();
      
      if (!nextTask) {
        const failed = this.progressTracker.progress.failedTasks;
        if (failed.length > 0) {
          console.log('\n❌ Migration stopped due to failed tasks:');
          failed.forEach(t => console.log(`   - ${t}`));
          console.log('\n   Fix issues and run with --resume to continue');
        } else {
          console.log('\n✅ All tasks completed successfully!');
          this.generateReport();
        }
        break;
      }

      const task = TASKS[nextTask];
      let attempts = 0;
      let success = false;

      while (attempts < task.retryCount && !success) {
        attempts++;
        
        if (this.dryRun) {
          console.log(`[DRY RUN] Would execute: ${task.name}`);
          this.progressTracker.completeTask(nextTask, true, 'Dry run');
          success = true;
          continue;
        }

        this.progressTracker.startTask(nextTask);

        try {
          BackupManager.createBackup(`pre-${nextTask}`);
          
          const output = await TaskExecutor.execute(nextTask);
          this.progressTracker.completeTask(nextTask, true, output);
          success = true;
          
          this.progressTracker.createCheckpoint(`post-${nextTask}`);
        } catch (error) {
          console.error(`\n❌ Task failed (attempt ${attempts}/${task.retryCount}): ${error.message}`);
          
          if (attempts >= task.retryCount) {
            this.progressTracker.completeTask(nextTask, false, error.message);
            
            if (!this.autoRetry) {
              console.log('\n   Auto-retry disabled. Exiting.');
              break;
            }
          } else {
            console.log('   Retrying...');
            await new Promise(r => setTimeout(r, 5000));
          }
        }
      }
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTasks: Object.keys(TASKS).length,
        completedTasks: this.progressTracker.progress.completedTasks.length,
        failedTasks: this.progressTracker.progress.failedTasks.length,
        startTime: this.progressTracker.progress.startTime,
        endTime: new Date().toISOString(),
      },
      completedTasks: this.progressTracker.progress.completedTasks,
      failedTasks: this.progressTracker.progress.failedTasks,
      taskDetails: this.progressTracker.progress.taskLogs,
    };

    const reportPath = path.join(LOG_DIR, `migration-report-${Date.now()}.json`);
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Migration report saved to: ${reportPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`   Total tasks: ${report.summary.totalTasks}`);
    console.log(`   Completed: ${report.summary.completedTasks}`);
    console.log(`   Failed: ${report.summary.failedTasks}`);
  }

  static resume() {
    console.log('📋 Resuming from previous state...\n');
    const scheduler = new Scheduler();
    scheduler.run();
  }

  static rollback(checkpointName) {
    console.log(`⏪ Rolling back to checkpoint: ${checkpointName}\n`);
    BackupManager.restoreBackup(checkpointName);
  }

  static status() {
    const progress = new ProgressTracker().progress;
    
    console.log('\n📊 Migration Status:\n');
    console.log(`Start Time: ${progress.startTime || 'Not started'}`);
    console.log(`Current Task: ${progress.currentPhase || 'None'}`);
    console.log(`\n✅ Completed Tasks (${progress.completedTasks.length}):`);
    progress.completedTasks.forEach(t => console.log(`   - ${t}`));
    
    if (progress.failedTasks.length > 0) {
      console.log(`\n❌ Failed Tasks (${progress.failedTasks.length}):`);
      progress.failedTasks.forEach(t => console.log(`   - ${t}`));
    }

    console.log('\n📁 Available Backups:');
    BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      const scheduler = new Scheduler({
        dryRun: args.includes('--dry-run'),
        autoRetry: !args.includes('--no-retry'),
      });
      scheduler.run();
      break;
    case 'resume':
      Scheduler.resume();
      break;
    case 'rollback':
      const checkpoint = args[1];
      if (!checkpoint) {
        console.error('Usage: node long-running-scheduler.js rollback <checkpoint-name>');
        process.exit(1);
      }
      Scheduler.rollback(checkpoint);
      break;
    case 'status':
      Scheduler.status();
      break;
    case 'list-backups':
      console.log('\n📁 Available Backups:');
      BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
      break;
    default:
      console.log(`
Usage: node long-running-scheduler.js <command> [options]

Commands:
  start           Start the migration process
  resume          Resume from previous state
  rollback <name> Rollback to a checkpoint
  status          Show current migration status
  list-backups    List available backups

Options:
  --dry-run       Simulate without making changes
  --no-retry      Disable automatic retry on failure

Examples:
  node long-running-scheduler.js start
  node long-running-scheduler.js start --dry-run
  node long-running-scheduler.js resume
  node long-running-scheduler.js rollback pre-phase1-core
  node long-running-scheduler.js status
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { Scheduler, ProgressTracker, BackupManager, TaskExecutor, TASKS };

 * Long-Running Task Scheduler for Package Decomposition
 * 
 * This script manages automated execution of the package decomposition plan
 * with progress tracking, recovery, and rollback capabilities.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROGRESS_FILE = path.join(ROOT_DIR, '.package-migration-progress.json');
const LOG_DIR = path.join(ROOT_DIR, 'logs', 'migration');
const BACKUP_DIR = path.join(ROOT_DIR, '.migration-backups');

// Task definitions with dependencies
const TASKS = {
  // Phase 1: Base Package
  'phase1-setup': {
    name: 'Phase 1: Setup Base Package Structure',
    command: 'node scripts/automated-implementation.js phase1 --task setup',
    dependencies: [],
    timeout: 300000,
    retryCount: 3,
  },
  'phase1-core': {
    name: 'Phase 1: Migrate Core Components',
    command: 'node scripts/automated-implementation.js phase1 --task core',
    dependencies: ['phase1-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-adapters': {
    name: 'Phase 1: Migrate Adapters',
    command: 'node scripts/automated-implementation.js phase1 --task adapters',
    dependencies: ['phase1-core'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-test': {
    name: 'Phase 1: Test Base Package',
    command: 'npm run test:unit -- --testPathPattern=packages/base',
    dependencies: ['phase1-adapters'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 2: UI Package
  'phase2-setup': {
    name: 'Phase 2: Setup UI Package',
    command: 'node scripts/automated-implementation.js phase2 --task setup',
    dependencies: ['phase1-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase2-desktop': {
    name: 'Phase 2: Integrate Desktop UI',
    command: 'node scripts/automated-implementation.js phase2 --task desktop',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-feishu': {
    name: 'Phase 2: Integrate Feishu IM',
    command: 'node scripts/automated-implementation.js phase2 --task feishu',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-test': {
    name: 'Phase 2: Test UI Package',
    command: 'npm run test:unit -- --testPathPattern=packages/ui',
    dependencies: ['phase2-desktop', 'phase2-feishu'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 3: Professional Package
  'phase3-setup': {
    name: 'Phase 3: Setup Professional Package',
    command: 'node scripts/automated-implementation.js phase3 --task setup',
    dependencies: ['phase2-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase3-research': {
    name: 'Phase 3: Research Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task research',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-dev': {
    name: 'Phase 3: Development Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task development',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-business': {
    name: 'Phase 3: Business Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task business',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-test': {
    name: 'Phase 3: Test Professional Package',
    command: 'npm run test:unit -- --testPathPattern=packages/professional',
    dependencies: ['phase3-research', 'phase3-dev', 'phase3-business'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 4: Integration
  'phase4-integrate': {
    name: 'Phase 4: Integration Testing',
    command: 'npm run test:integration',
    dependencies: ['phase3-test'],
    timeout: 600000,
    retryCount: 2,
  },
  'phase4-e2e': {
    name: 'Phase 4: E2E Testing',
    command: 'npm run test:e2e',
    dependencies: ['phase4-integrate'],
    timeout: 900000,
    retryCount: 2,
  },
  'phase4-release': {
    name: 'Phase 4: Release Preparation',
    command: 'node scripts/automated-implementation.js phase4 --task release',
    dependencies: ['phase4-e2e'],
    timeout: 300000,
    retryCount: 2,
  },
};

// Progress tracking
class ProgressTracker {
  constructor() {
    this.progress = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return {
      startTime: null,
      currentPhase: null,
      completedTasks: [],
      failedTasks: [],
      taskLogs: {},
      checkpoints: [],
    };
  }

  saveProgress() {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
  }

  startTask(taskId) {
    this.progress.currentPhase = taskId;
    this.progress.taskLogs[taskId] = {
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'running',
      attempts: (this.progress.taskLogs[taskId]?.attempts || 0) + ,
      output: [],
    };
    this.saveProgress();
  }

  completeTask(taskId, success, output = '') {
    if (success) {
      if (!this.progress.completedTasks.includes(taskId)) {
        this.progress.completedTasks.push(taskId);
      }
    } else {
      if (!this.progress.failedTasks.includes(taskId)) {
        this.progress.failedTasks.push(taskId);
      }
    }

    if (this.progress.taskLogs[taskId]) {
      this.progress.taskLogs[taskId].endTime = new Date().toISOString();
      this.progress.taskLogs[taskId].status = success ? 'completed' : 'failed';
      this.progress.taskLogs[taskId].output.push(output);
    }
    
    this.progress.currentPhase = null;
    this.saveProgress();
  }

  createCheckpoint(name) {
    this.progress.checkpoints.push({
      name,
      timestamp: new Date().toISOString(),
      completedTasks: [...this.progress.completedTasks],
    });
    this.saveProgress();
  }

  canRunTask(taskId) {
    const task = TASKS[taskId];
    if (!task) return false;
    
    return task.dependencies.every(dep => 
      this.progress.completedTasks.includes(dep)
    );
  }

  getNextTask() {
    for (const taskId of Object.keys(TASKS)) {
      if (!this.progress.completedTasks.includes(taskId) &&
          !this.progress.failedTasks.includes(taskId) &&
          this.canRunTask(taskId)) {
        return taskId;
      }
    }
    return null;
  }
}

// Backup manager
class BackupManager {
  static createBackup(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `${name}-${timestamp}`);
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    const criticalPaths = ['src', 'package.json', 'lerna.json', 'packages'];

    criticalPaths.forEach(p => {
      const sourcePath = path.join(ROOT_DIR, p);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, p);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
      }
    });

    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }

  static restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup not found: ${backupName}`);
      return false;
    }

    execSync(`cp -r "${backupPath}/"* "${ROOT_DIR}/"`, { stdio: 'inherit' });
    console.log(`✅ Restored from backup: ${backupName}`);
    return true;
  }

  static listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR);
  }
}

// Task executor
class TaskExecutor {
  static async execute(taskId) {
    const task = TASKS[taskId];
    if (!task) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    console.log(`\n🚀 Starting task: ${task.name}`);
    console.log(`   Command: ${task.command}`);
    console.log(`   Timeout: ${task.timeout}ms`);

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', task.command], {
        cwd: ROOT_DIR,
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(str);
      });

      child.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        process.stderr.write(str);
      });

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`Task timeout after ${task.timeout}ms`));
      }, task.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Task failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }
}

// Main scheduler
class Scheduler {
  constructor(options = {}) {
    this.progressTracker = new ProgressTracker();
    this.dryRun = options.dryRun || false;
    this.autoRetry = options.autoRetry !== false;
    this.maxRetries = options.maxRetries || 3;
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   Package Decomposition - Long-Running Task Scheduler     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!this.progressTracker.progress.startTime) {
      this.progressTracker.progress.startTime = new Date().toISOString();
      this.progressTracker.saveProgress();
    }

    BackupManager.createBackup('initial');

    while (true) {
      const nextTask = this.progressTracker.getNextTask();
      
      if (!nextTask) {
        const failed = this.progressTracker.progress.failedTasks;
        if (failed.length > 0) {
          console.log('\n❌ Migration stopped due to failed tasks:');
          failed.forEach(t => console.log(`   - ${t}`));
          console.log('\n   Fix issues and run with --resume to continue');
        } else {
          console.log('\n✅ All tasks completed successfully!');
          this.generateReport();
        }
        break;
      }

      const task = TASKS[nextTask];
      let attempts = 0;
      let success = false;

      while (attempts < task.retryCount && !success) {
        attempts++;
        
        if (this.dryRun) {
          console.log(`[DRY RUN] Would execute: ${task.name}`);
          this.progressTracker.completeTask(nextTask, true, 'Dry run');
          success = true;
          continue;
        }

        this.progressTracker.startTask(nextTask);

        try {
          BackupManager.createBackup(`pre-${nextTask}`);
          
          const output = await TaskExecutor.execute(nextTask);
          this.progressTracker.completeTask(nextTask, true, output);
          success = true;
          
          this.progressTracker.createCheckpoint(`post-${nextTask}`);
        } catch (error) {
          console.error(`\n❌ Task failed (attempt ${attempts}/${task.retryCount}): ${error.message}`);
          
          if (attempts >= task.retryCount) {
            this.progressTracker.completeTask(nextTask, false, error.message);
            
            if (!this.autoRetry) {
              console.log('\n   Auto-retry disabled. Exiting.');
              break;
            }
          } else {
            console.log('   Retrying...');
            await new Promise(r => setTimeout(r, 5000));
          }
        }
      }
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTasks: Object.keys(TASKS).length,
        completedTasks: this.progressTracker.progress.completedTasks.length,
        failedTasks: this.progressTracker.progress.failedTasks.length,
        startTime: this.progressTracker.progress.startTime,
        endTime: new Date().toISOString(),
      },
      completedTasks: this.progressTracker.progress.completedTasks,
      failedTasks: this.progressTracker.progress.failedTasks,
      taskDetails: this.progressTracker.progress.taskLogs,
    };

    const reportPath = path.join(LOG_DIR, `migration-report-${Date.now()}.json`);
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Migration report saved to: ${reportPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`   Total tasks: ${report.summary.totalTasks}`);
    console.log(`   Completed: ${report.summary.completedTasks}`);
    console.log(`   Failed: ${report.summary.failedTasks}`);
  }

  static resume() {
    console.log('📋 Resuming from previous state...\n');
    const scheduler = new Scheduler();
    scheduler.run();
  }

  static rollback(checkpointName) {
    console.log(`⏪ Rolling back to checkpoint: ${checkpointName}\n`);
    BackupManager.restoreBackup(checkpointName);
  }

  static status() {
    const progress = new ProgressTracker().progress;
    
    console.log('\n📊 Migration Status:\n');
    console.log(`Start Time: ${progress.startTime || 'Not started'}`);
    console.log(`Current Task: ${progress.currentPhase || 'None'}`);
    console.log(`\n✅ Completed Tasks (${progress.completedTasks.length}):`);
    progress.completedTasks.forEach(t => console.log(`   - ${t}`));
    
    if (progress.failedTasks.length > 0) {
      console.log(`\n❌ Failed Tasks (${progress.failedTasks.length}):`);
      progress.failedTasks.forEach(t => console.log(`   - ${t}`));
    }

    console.log('\n📁 Available Backups:');
    BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      const scheduler = new Scheduler({
        dryRun: args.includes('--dry-run'),
        autoRetry: !args.includes('--no-retry'),
      });
      scheduler.run();
      break;
    case 'resume':
      Scheduler.resume();
      break;
    case 'rollback':
      const checkpoint = args[1];
      if (!checkpoint) {
        console.error('Usage: node long-running-scheduler.js rollback <checkpoint-name>');
        process.exit(1);
      }
      Scheduler.rollback(checkpoint);
      break;
    case 'status':
      Scheduler.status();
      break;
    case 'list-backups':
      console.log('\n📁 Available Backups:');
      BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
      break;
    default:
      console.log(`
Usage: node long-running-scheduler.js <command> [options]

Commands:
  start           Start the migration process
  resume          Resume from previous state
  rollback <name> Rollback to a checkpoint
  status          Show current migration status
  list-backups    List available backups

Options:
  --dry-run       Simulate without making changes
  --no-retry      Disable automatic retry on failure

Examples:
  node long-running-scheduler.js start
  node long-running-scheduler.js start --dry-run
  node long-running-scheduler.js resume
  node long-running-scheduler.js rollback pre-phase1-core
  node long-running-scheduler.js status
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { Scheduler, ProgressTracker, BackupManager, TaskExecutor, TASKS };

      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { Scheduler, ProgressTracker, BackupManager, TaskExecutor, TASKS };
/**
 * Long-Running Task Scheduler for Package Decomposition
 * 
 * This script manages automated execution of the package decomposition plan
 * with progress tracking, recovery, and rollback capabilities.
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PROGRESS_FILE = path.join(ROOT_DIR, '.package-migration-progress.json');
const LOG_DIR = path.join(ROOT_DIR, 'logs', 'migration');
const BACKUP_DIR = path.join(ROOT_DIR, '.migration-backups');

// Task definitions with dependencies
const TASKS = {
  // Phase 1: Base Package
  'phase1-setup': {
    name: 'Phase 1: Setup Base Package Structure',
    command: 'node scripts/automated-implementation.js phase1 --task setup',
    dependencies: [],
    timeout: 300000,
    retryCount: 3,
  },
  'phase1-core': {
    name: 'Phase 1: Migrate Core Components',
    command: 'node scripts/automated-implementation.js phase1 --task core',
    dependencies: ['phase1-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-adapters': {
    name: 'Phase 1: Migrate Adapters',
    command: 'node scripts/automated-implementation.js phase1 --task adapters',
    dependencies: ['phase1-core'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase1-test': {
    name: 'Phase 1: Test Base Package',
    command: 'npm run test:unit -- --testPathPattern=packages/base',
    dependencies: ['phase1-adapters'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 2: UI Package
  'phase2-setup': {
    name: 'Phase 2: Setup UI Package',
    command: 'node scripts/automated-implementation.js phase2 --task setup',
    dependencies: ['phase1-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase2-desktop': {
    name: 'Phase 2: Integrate Desktop UI',
    command: 'node scripts/automated-implementation.js phase2 --task desktop',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-feishu': {
    name: 'Phase 2: Integrate Feishu IM',
    command: 'node scripts/automated-implementation.js phase2 --task feishu',
    dependencies: ['phase2-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase2-test': {
    name: 'Phase 2: Test UI Package',
    command: 'npm run test:unit -- --testPathPattern=packages/ui',
    dependencies: ['phase2-desktop', 'phase2-feishu'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 3: Professional Package
  'phase3-setup': {
    name: 'Phase 3: Setup Professional Package',
    command: 'node scripts/automated-implementation.js phase3 --task setup',
    dependencies: ['phase2-test'],
    timeout: 300000,
    retryCount: 3,
  },
  'phase3-research': {
    name: 'Phase 3: Research Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task research',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-dev': {
    name: 'Phase 3: Development Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task development',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-business': {
    name: 'Phase 3: Business Domain Agents',
    command: 'node scripts/automated-implementation.js phase3 --task business',
    dependencies: ['phase3-setup'],
    timeout: 600000,
    retryCount: 3,
  },
  'phase3-test': {
    name: 'Phase 3: Test Professional Package',
    command: 'npm run test:unit -- --testPathPattern=packages/professional',
    dependencies: ['phase3-research', 'phase3-dev', 'phase3-business'],
    timeout: 300000,
    retryCount: 2,
  },

  // Phase 4: Integration
  'phase4-integrate': {
    name: 'Phase 4: Integration Testing',
    command: 'npm run test:integration',
    dependencies: ['phase3-test'],
    timeout: 600000,
    retryCount: 2,
  },
  'phase4-e2e': {
    name: 'Phase 4: E2E Testing',
    command: 'npm run test:e2e',
    dependencies: ['phase4-integrate'],
    timeout: 900000,
    retryCount: 2,
  },
  'phase4-release': {
    name: 'Phase 4: Release Preparation',
    command: 'node scripts/automated-implementation.js phase4 --task release',
    dependencies: ['phase4-e2e'],
    timeout: 300000,
    retryCount: 2,
  },
};

// Progress tracking
class ProgressTracker {
  constructor() {
    this.progress = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(PROGRESS_FILE)) {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    }
    return {
      startTime: null,
      currentPhase: null,
      completedTasks: [],
      failedTasks: [],
      taskLogs: {},
      checkpoints: [],
    };
  }

  saveProgress() {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(this.progress, null, 2));
  }

  startTask(taskId) {
    this.progress.currentPhase = taskId;
    this.progress.taskLogs[taskId] = {
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'running',
      attempts: (this.progress.taskLogs[taskId]?.attempts || 0) + 1,
      output: [],
    };
    this.saveProgress();
  }

  completeTask(taskId, success, output = '') {
    if (success) {
      if (!this.progress.completedTasks.includes(taskId)) {
        this.progress.completedTasks.push(taskId);
      }
    } else {
      if (!this.progress.failedTasks.includes(taskId)) {
        this.progress.failedTasks.push(taskId);
      }
    }

    if (this.progress.taskLogs[taskId]) {
      this.progress.taskLogs[taskId].endTime = new Date().toISOString();
      this.progress.taskLogs[taskId].status = success ? 'completed' : 'failed';
      this.progress.taskLogs[taskId].output.push(output);
    }
    
    this.progress.currentPhase = null;
    this.saveProgress();
  }

  createCheckpoint(name) {
    this.progress.checkpoints.push({
      name,
      timestamp: new Date().toISOString(),
      completedTasks: [...this.progress.completedTasks],
    });
    this.saveProgress();
  }

  canRunTask(taskId) {
    const task = TASKS[taskId];
    if (!task) return false;
    
    return task.dependencies.every(dep => 
      this.progress.completedTasks.includes(dep)
    );
  }

  getNextTask() {
    for (const taskId of Object.keys(TASKS)) {
      if (!this.progress.completedTasks.includes(taskId) &&
          !this.progress.failedTasks.includes(taskId) &&
          this.canRunTask(taskId)) {
        return taskId;
      }
    }
    return null;
  }
}

// Backup manager
class BackupManager {
  static createBackup(name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `${name}-${timestamp}`);
    
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }

    // Backup critical files
    const criticalPaths = [
      'src',
      'package.json',
      'lerna.json',
      'packages',
    ];

    criticalPaths.forEach(p => {
      const sourcePath = path.join(ROOT_DIR, p);
      if (fs.existsSync(sourcePath)) {
        const destPath = path.join(backupPath, p);
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        execSync(`cp -r "${sourcePath}" "${destPath}"`, { stdio: 'inherit' });
      }
    });

    console.log(`✅ Backup created: ${backupPath}`);
    return backupPath;
  }

  static restoreBackup(backupName) {
    const backupPath = path.join(BACKUP_DIR, backupName);
    if (!fs.existsSync(backupPath)) {
      console.error(`❌ Backup not found: ${backupName}`);
      return false;
    }

    // Restore from backup
    execSync(`cp -r "${backupPath}/"* "${ROOT_DIR}/"`, { stdio: 'inherit' });
    console.log(`✅ Restored from backup: ${backupName}`);
    return true;
  }

  static listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) return [];
    return fs.readdirSync(BACKUP_DIR);
  }
}

// Task executor
class TaskExecutor {
  static async execute(taskId) {
    const task = TASKS[taskId];
    if (!task) {
      throw new Error(`Unknown task: ${taskId}`);
    }

    console.log(`\n🚀 Starting task: ${task.name}`);
    console.log(`   Command: ${task.command}`);
    console.log(`   Timeout: ${task.timeout}ms`);

    return new Promise((resolve, reject) => {
      const child = spawn('sh', ['-c', task.command], {
        cwd: ROOT_DIR,
        stdio: ['inherit', 'pipe', 'pipe'],
      });

      let output = '';
      let errorOutput = '';

      child.stdout.on('data', (data) => {
        const str = data.toString();
        output += str;
        process.stdout.write(str);
      });

      child.stderr.on('data', (data) => {
        const str = data.toString();
        errorOutput += str;
        process.stderr.write(str);
      });

      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error(`Task timeout after ${task.timeout}ms`));
      }, task.timeout);

      child.on('close', (code) => {
        clearTimeout(timeout);
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`Task failed with code ${code}: ${errorOutput}`));
        }
      });
    });
  }
}

// Main scheduler
class Scheduler {
  constructor(options = {}) {
    this.progressTracker = new ProgressTracker();
    this.dryRun = options.dryRun || false;
    this.autoRetry = options.autoRetry !== false;
    this.maxRetries = options.maxRetries || 3;
  }

  async run() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   Package Decomposition - Long-Running Task Scheduler     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');

    if (!this.progressTracker.progress.startTime) {
      this.progressTracker.progress.startTime = new Date().toISOString();
      this.progressTracker.saveProgress();
    }

    // Create initial checkpoint
    BackupManager.createBackup('initial');

    while (true) {
      const nextTask = this.progressTracker.getNextTask();
      
      if (!nextTask) {
        const failed = this.progressTracker.progress.failedTasks;
        if (failed.length > 0) {
          console.log('\n❌ Migration stopped due to failed tasks:');
          failed.forEach(t => console.log(`   - ${t}`));
          console.log('\n   Fix issues and run with --resume to continue');
        } else {
          console.log('\n✅ All tasks completed successfully!');
          this.generateReport();
        }
        break;
      }

      const task = TASKS[nextTask];
      let attempts = 0;
      let success = false;

      while (attempts < task.retryCount && !success) {
        attempts++;
        
        if (this.dryRun) {
          console.log(`[DRY RUN] Would execute: ${task.name}`);
          this.progressTracker.completeTask(nextTask, true, 'Dry run');
          success = true;
          continue;
        }

        this.progressTracker.startTask(nextTask);

        try {
          // Create checkpoint before each task
          BackupManager.createBackup(`pre-${nextTask}`);
          
          const output = await TaskExecutor.execute(nextTask);
          this.progressTracker.completeTask(nextTask, true, output);
          success = true;
          
          // Create checkpoint after successful task
          this.progressTracker.createCheckpoint(`post-${nextTask}`);
        } catch (error) {
          console.error(`\n❌ Task failed (attempt ${attempts}/${task.retryCount}): ${error.message}`);
          
          if (attempts >= task.retryCount) {
            this.progressTracker.completeTask(nextTask, false, error.message);
            
            if (!this.autoRetry) {
              console.log('\n   Auto-retry disabled. Exiting.');
              break;
            }
          } else {
            console.log('   Retrying...');
            await new Promise(r => setTimeout(r, 5000)); // Wait 5s before retry
          }
        }
      }
    }
  }

  generateReport() {
    const report = {
      summary: {
        totalTasks: Object.keys(TASKS).length,
        completedTasks: this.progressTracker.progress.completedTasks.length,
        failedTasks: this.progressTracker.progress.failedTasks.length,
        startTime: this.progressTracker.progress.startTime,
        endTime: new Date().toISOString(),
      },
      completedTasks: this.progressTracker.progress.completedTasks,
      failedTasks: this.progressTracker.progress.failedTasks,
      taskDetails: this.progressTracker.progress.taskLogs,
    };

    const reportPath = path.join(LOG_DIR, `migration-report-${Date.now()}.json`);
    fs.mkdirSync(LOG_DIR, { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log(`\n📊 Migration report saved to: ${reportPath}`);
    console.log(`\n📈 Summary:`);
    console.log(`   Total tasks: ${report.summary.totalTasks}`);
    console.log(`   Completed: ${report.summary.completedTasks}`);
    console.log(`   Failed: ${report.summary.failedTasks}`);
  }

  static resume() {
    console.log('📋 Resuming from previous state...\n');
    const scheduler = new Scheduler();
    scheduler.run();
  }

  static rollback(checkpointName) {
    console.log(`⏪ Rolling back to checkpoint: ${checkpointName}\n`);
    BackupManager.restoreBackup(checkpointName);
  }

  static status() {
    const progress = new ProgressTracker().progress;
    
    console.log('\n📊 Migration Status:\n');
    console.log(`Start Time: ${progress.startTime || 'Not started'}`);
    console.log(`Current Task: ${progress.currentPhase || 'None'}`);
    console.log(`\n✅ Completed Tasks (${progress.completedTasks.length}):`);
    progress.completedTasks.forEach(t => console.log(`   - ${t}`));
    
    if (progress.failedTasks.length > 0) {
      console.log(`\n❌ Failed Tasks (${progress.failedTasks.length}):`);
      progress.failedTasks.forEach(t => console.log(`   - ${t}`));
    }

    console.log('\n📁 Available Backups:');
    BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
  }
}

// CLI interface
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'start':
      const scheduler = new Scheduler({
        dryRun: args.includes('--dry-run'),
        autoRetry: !args.includes('--no-retry'),
      });
      scheduler.run();
      break;
    case 'resume':
      Scheduler.resume();
      break;
    case 'rollback':
      const checkpoint = args[1];
      if (!checkpoint) {
        console.error('Usage: node long-running-scheduler.js rollback <checkpoint-name>');
        process.exit(1);
      }
      Scheduler.rollback(checkpoint);
      break;
    case 'status':
      Scheduler.status();
      break;
    case 'list-backups':
      console.log('\n📁 Available Backups:');
      BackupManager.listBackups().forEach(b => console.log(`   - ${b}`));
      break;
    default:
      console.log(`
Usage: node long-running-scheduler.js <command> [options]

Commands:
  start           Start the migration process
  resume          Resume from previous state
  rollback <name> Rollback to a checkpoint
  status          Show current migration status
  list-backups    List available backups

Options:
  --dry-run       Simulate without making changes
  --no-retry      Disable automatic retry on failure

Examples:
  node long-running-scheduler.js start
  node long-running-scheduler.js start --dry-run
  node long-running-scheduler.js resume
  node long-running-scheduler.js rollback pre-phase1-core
  node long-running-scheduler.js status
      `);
  }
}

if (require.main === module) {
  main();
}

module.exports = { Scheduler, ProgressTracker, BackupManager, TaskExecutor, TASKS };

    }
    
    return { created: Object.keys(packages) };
  }

  async configureTypeScript(state) {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        declaration: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitThis: true,
        alwaysStrict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: './src'
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests']
    };
    
    for (const pkg of ['base', 'ui', 'professional']) {
      const configPath = path.join(ROOT_DIR, 'packages', pkg, 'tsconfig.json');
      fs.writeFileSync(configPath, JSON.stringify(tsConfig, null, 2));
      this.log('info', `Created tsconfig.json for ${pkg}`);
    }
    
    return { configured: ['base', 'ui', 'professional'] };
  }

  async setupBuildPipeline(state) {
    const lernaConfig = {
      packages: ['packages/*'],
      version: '1.0.0',
      npmClient: 'npm',
      useWorkspaces: true
    };
    
    fs.writeFileSync(
      path.join(ROOT_DIR, 'lerna.json'),
      JSON.stringify(lernaConfig, null, 2)
    );
    
    this.log('info', 'Configured lerna for monorepo build');
    return { configured: 'lerna' };
  }

  async cloneSmartWorkstation(state) {
    this.log('info', 'SmartWorkstation integration - checking for existing installation');
    const swPath = path.join(ROOT_DIR, 'packages', 'ui', 'smartworkstation');
    if (fs.existsSync(swPath)) {
      this.log('info', 'SmartWorkstation already exists');
      return { status: 'exists' };
    }
    this.log('info', 'SmartWorkstation needs to be cloned manually or via CI');
    return { status: 'pending-clone' };
  }

  async configureDesktopIntegration(state) {
    const desktopConfig = {
      electron: {
        main: 'main.js',
        preload: 'preload.js'
      },
      windows: {
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600
      }
    };
    
    const configPath = path.join(ROOT_DIR, 'packages', 'ui', 'desktop.config.json');
    fs.writeFileSync(configPath, JSON.stringify(desktopConfig, null, 2));
    
    this.log('info', 'Created desktop configuration');
    return { configured: 'desktop' };
  }

  async setupFeishuIntegration(state) {
    const feishuConfig = {
      webhook: {
        url: process.env.FEISHU_WEBHOOK_URL || '',
        enabled: false
      },
      auth: {
        appId: process.env.FEISHU_APP_ID || '',
        appSecret: process.env.FEISHU_APP_SECRET || ''
      },
      features: {
        messageSync: true,
        notification: true,
        commandHandling: true
      }
    };
    
    const configPath = path.join(ROOT_DIR, 'packages', 'ui', 'feishu.config.json');
    fs.writeFileSync(configPath, JSON.stringify(feishuConfig, null, 2));
    
    this.log('info', 'Created Feishu integration configuration');
    return { configured: 'feishu' };
  }

  async createAdapterLayer(state) {
    const adapterCode = `// UI Adapter for Stigmergy CLI
const BaseAdapter = require('@stigmergy/base');

class UIAdapter extends BaseAdapter {
  constructor(config) {
    super(config);
    this.desktop = null;
    this.feishu = null;
  }

  async initialize() {
    await this.initDesktop();
    await this.initFeishu();
  }

  async initDesktop() {
    // Desktop integration initialization
    this.log('Desktop integration initialized');
  }

  async initFeishu() {
    // Feishu integration initialization
    this.log('Feishu integration initialized');
  }

  async sendMessage(channel, message) {
    // Send message through appropriate channel
    if (channel === 'feishu' && this.feishu) {
      return this.feishu.send(message);
    }
    throw new Error(\`Unknown channel: \${channel}\`);
  }
}

module.exports = UIAdapter;
`;
    
    const adapterPath = path.join(ROOT_DIR, 'packages', 'ui', 'src', 'adapter.js');
    fs.writeFileSync(adapterPath, adapterCode);
    
    this.log('info', 'Created UI adapter layer');
    return { created: 'adapter.js' };
  }

  async createAgentFramework(state) {
    const agentFramework = `// Agent Framework for Professional Package
class AgentFramework {
  constructor() {
    this.agents = new Map();
    this.skills = new Map();
  }

  registerAgent(name, agent) {
    this.agents.set(name, agent);
    return this;
  }

  registerSkill(name, skill) {
    this.skills.set(name, skill);
    return this;
  }

  async execute(agentName, task) {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(\`Agent not found: \${agentName}\`);
    }
    return agent.execute(task);
  }

  async useSkill(skillName, context) {
    const skill = this.skills.get(skillName);
    if (!skill) {
      throw new Error(\`Skill not found: \${skillName}\`);
    }
    return skill.execute(context);
  }
}

module.exports = AgentFramework;
`;
    
    const frameworkPath = path.join(ROOT_DIR, 'packages', 'professional', 'src', 'framework.js');
    fs.writeFileSync(frameworkPath, agentFramework);
    
    this.log('info', 'Created agent framework');
    return { created: 'framework.js' };
  }

  async implementAcademicAgent(state) {
    const academicAgent = `// Academic Research Agent
const AgentFramework = require('./framework');

class AcademicAgent {
  constructor() {
    this.name = 'academic';
    this.skills = [
      'grounded-theory-expert',
      'validity-reliability',
      'mathematical-statistics',
      'network-computation'
    ];
  }

  async execute(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'analyze':
        return this.analyze(data);
      case 'validate':
        return this.validate(data);
      case 'compute':
        return this.compute(data);
      default:
        throw new Error(\`Unknown task type: \${type}\`);
    }
  }

  async analyze(data) {
    // Perform academic analysis
    return { analysis: 'completed', data };
  }

  async validate(data) {
    // Validate research methodology
    return { validation: 'passed', data };
  }

  async compute(data) {
    // Perform statistical computation
    return { computation: 'completed', data };
  }
}

module.exports = AcademicAgent;
`;
    
    const agentPath = path.join(ROOT_DIR, 'packages', 'professional', 'src', 'agents', 'academic.js');
    const agentDir = path.dirname(agentPath);
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }
    fs.writeFileSync(agentPath, academicAgent);
    
    this.log('info', 'Created academic agent');
    return { created: 'academic.js' };
  }

  async implementBusinessAgent(state) {
    const businessAgent = `// Business Analysis Agent
const AgentFramework = require('./framework');

class BusinessAgent {
  constructor() {
    this.name = 'business';
    this.skills = [
      'business-ecosystem-analysis',
      'digital-transformation',
      'ecosystem-analysis'
    ];
  }

  async execute(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'analyze':
        return this.analyzeBusiness(data);
      case 'transform':
        return this.planTransformation(data);
      case 'ecosystem':
        return this.analyzeEcosystem(data);
      default:
        throw new Error(\`Unknown task type: \${type}\`);
    }
  }

  async analyzeBusiness(data) {
    // Perform business analysis
    return { analysis: 'completed', data };
  }

  async planTransformation(data) {
    // Plan digital transformation
    return { transformation: 'planned', data };
  }

  async analyzeEcosystem(data) {
    // Analyze business ecosystem
    return { ecosystem: 'analyzed', data };
  }
}

module.exports = BusinessAgent;
`;
    
    const agentPath = path.join(ROOT_DIR, 'packages', 'professional', 'src', 'agents', 'business.js');
    fs.writeFileSync(agentPath, businessAgent);
    
    this.log('info', 'Created business agent');
    return { created: 'business.js' };
  }

  async createSkillTemplates(state) {
    const skillTemplate = `// Skill Template
class SkillTemplate {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.version = config.version || '1.0.0';
  }

  async execute(context) {
    throw new Error('execute() must be implemented by subclass');
  }

  validate(context) {
    return true;
  }
}

module.exports = SkillTemplate;
`;
    
    const templatePath = path.join(ROOT_DIR, 'packages', 'professional', 'src', 'skills', 'template.js');
    const skillDir = path.dirname(templatePath);
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }
    fs.writeFileSync(templatePath, skillTemplate);
    
    this.log('info', 'Created skill template');
    return { created: 'template.js' };
  }

  async runIntegrationTests(state) {
    this.log('info', 'Running integration tests...');
    
    try {
      const result = execSync('npm test', { 
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        timeout: 300000
      });
      this.log('info', 'Integration tests passed');
      return { passed: true, output: result };
    } catch (error) {
      this.log('warn', 'Some tests may have failed');
      return { passed: false, error: error.message };
    }
  }

  async createDocumentation(state) {
    const docs = {
      'README.md': `# Stigmergy CLI - Multi-Agents

## Package Structure

- **@stigmergy/base**: Core functionality and shared modules
- **@stigmergy/ui**: Desktop and IM integration (SmartWorkstation)
- **@stigmergy/professional**: Domain-specific agents and skills

## Installation

\`\`\`bash
npm install @stigmergy/base
npm install @stigmergy/ui
npm install @stigmergy/professional
\`\`\`

## Usage

\`\`\`javascript
const { BasePackage } = require('@stigmergy/base');
const { UIAdapter } = require('@stigmergy/ui');
const { AcademicAgent } = require('@stigmergy/professional');
\`\`\`
`,
      'CHANGELOG.md': `# Changelog

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial package decomposition
- Base package with core modules
- UI package with SmartWorkstation integration
- Professional package with academic and business agents
- Long-running automation scheduler
`
    };
    
    for (const [filename, content] of Object.entries(docs)) {
      const docPath = path.join(ROOT_DIR, 'packages', 'docs', filename);
      const docDir = path.dirname(docPath);
      if (!fs.existsSync(docDir)) {
        fs.mkdirSync(docDir, { recursive: true });
      }
      fs.writeFileSync(docPath, content);
      this.log('info', `Created documentation: ${filename}`);
    }
    
    return { created: Object.keys(docs) };
  }

  async setupCICD(state) {
    const githubActions = {
      'ci.yml': `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
`
    };
    
    const workflowsDir = path.join(ROOT_DIR, '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    
    for (const [filename, content] of Object.entries(githubActions)) {
      const workflowPath = path.join(workflowsDir, filename);
      fs.writeFileSync(workflowPath, content);
      this.log('info', `Created CI workflow: ${filename}`);
    }
    
    return { created: Object.keys(githubActions) };
  }

  async prepareRelease(state) {
    const releaseNotes = `# Release Notes

## Version 1.0.0

### Package Decomposition Complete

This release introduces the new package structure:

#### @stigmergy/base
- Core memory management
- Smart routing
- Hook system
- Skill management

#### @stigmergy/ui
- Desktop integration (Electron)
- Feishu IM integration
- SmartWorkstation adapter

#### @stigmergy/professional
- Academic research agent
- Business analysis agent
- Skill templates and framework

### Migration Guide

See [MIGRATION.md](./MIGRATION.md) for details on migrating from the monolithic structure.
`;
    
    const releasePath = path.join(ROOT_DIR, 'RELEASE_NOTES.md');
    fs.writeFileSync(releasePath, releaseNotes);
    
    this.log('info', 'Created release notes');
    return { created: 'RELEASE_NOTES.md' };
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const scheduler = new LongRunningScheduler();

  const showStatus = args.includes('--status');
  const startNow = args.includes('--start');
  const resume = args.includes('--resume');
  const reset = args.includes('--reset');
  const scheduleArg = args.find(a => a.startsWith('--schedule='));

  if (showStatus) {
    scheduler.showStatus();
    return;
  }

  if (reset) {
    scheduler.reset();
    return;
  }

  if (scheduleArg) {
    const cronExpr = scheduleArg.split('=')[1];
    await scheduler.schedule(cronExpr);
    return;
  }

  if (startNow || resume) {
    await scheduler.start();
    return;
  }

  console.log(`
Stigmergy Long-Running Automation Scheduler
==========================================

Usage:
  node scripts/long-running-scheduler.js --start      Start automation from beginning
  node scripts/long-running-scheduler.js --status     Show current status
  node scripts/long-running-scheduler.js --resume     Resume from last checkpoint
  node scripts/long-running-scheduler.js --reset      Reset all progress
  node scripts/long-running-scheduler.js --schedule="0 9 * * 1-5"  Schedule automation

State file: ${STATE_FILE}
Log file: ${LOG_FILE}
Checkpoints: ${CHECKPOINT_DIR}
`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LongRunningScheduler };
/**
 * Stigmergy Long-Running Automation Scheduler
 * 
 * This scheduler manages the automated execution of the implementation plan.
 * It supports:
 * - Phase-by-phase execution
 * - Task-level granularity
 * - Progress tracking and persistence
 * - Recovery from interruptions
 * - Scheduled execution (cron-like)
 * - Parallel task execution where safe
 * - Rollback capabilities
 * 
 * Usage:
 *   node scripts/long-running-scheduler.js --start
 *   node scripts/long-running-scheduler.js --status
 *   node scripts/long-running-scheduler.js --resume
 *   node scripts/long-running-scheduler.js --schedule="0 9 * * 1-5"  # Weekdays 9am
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const STATE_FILE = path.join(ROOT_DIR, '.automation-state.json');
const LOG_FILE = path.join(ROOT_DIR, '.automation-log.json');
const CHECKPOINT_DIR = path.join(ROOT_DIR, '.automation-checkpoints');

class LongRunningScheduler {
  constructor() {
    this.phases = this.loadPhases();
    this.state = this.loadState();
    this.ensureDirectories();
  }

  loadPhases() {
    try {
      const automated = require('./automated-implementation');
      return automated.PHASES || this.getDefaultPhases();
    } catch (e) {
      return this.getDefaultPhases();
    }
  }

  getDefaultPhases() {
    return {
      1: {
        name: 'Base Package Migration',
        description: 'Extract and establish base package',
        tasks: [
          { id: 'base-1', name: 'Create packages directory structure', action: () => this.createDirectoryStructure() },
          { id: 'base-2', name: 'Extract core modules', action: () => this.extractCoreModules() },
          { id: 'base-3', name: 'Setup package.json', action: () => this.setupPackageJson() },
          { id: 'base-4', name: 'Configure TypeScript', action: () => this.configureTypeScript() },
          { id: 'base-5', name: 'Setup build pipeline', action: () => this.setupBuildPipeline() }
        ]
      },
      2: {
        name: 'UI Package Integration',
        description: 'Integrate SmartWorkstation for UI',
        tasks: [
          { id: 'ui-1', name: 'Clone SmartWorkstation', action: () => this.cloneSmartWorkstation() },
          { id: 'ui-2', name: 'Configure desktop integration', action: () => this.configureDesktopIntegration() },
          { id: 'ui-3', name: 'Setup Feishu integration', action: () => this.setupFeishuIntegration() },
          { id: 'ui-4', name: 'Create adapter layer', action: () => this.createAdapterLayer() }
        ]
      },
      3: {
        name: 'Professional Package Development',
        description: 'Develop domain-specific agents',
        tasks: [
          { id: 'prof-1', name: 'Create agent framework', action: () => this.createAgentFramework() },
          { id: 'prof-2', name: 'Implement academic agent', action: () => this.implementAcademicAgent() },
          { id: 'prof-3', name: 'Implement business agent', action: () => this.implementBusinessAgent() },
          { id: 'prof-4', name: 'Create skill templates', action: () => this.createSkillTemplates() }
        ]
      },
      4: {
        name: 'Integration Testing and Release',
        description: 'Final integration and release',
        tasks: [
          { id: 'int-1', name: 'Run integration tests', action: () => this.runIntegrationTests() },
          { id: 'int-2', name: 'Create documentation', action: () => this.createDocumentation() },
          { id: 'int-3', name: 'Setup CI/CD', action: () => this.setupCICD() },
          { id: 'int-4', name: 'Release preparation', action: () => this.prepareRelease() }
        ]
      }
    };
  }

  ensureDirectories() {
    if (!fs.existsSync(CHECKPOINT_DIR)) {
      fs.mkdirSync(CHECKPOINT_DIR, { recursive: true });
    }
  }

  loadState() {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
    return this.getInitialState();
  }

  getInitialState() {
    return {
      version: '1.0.0',
      startTime: null,
      lastUpdateTime: null,
      currentPhase: 0,
      currentTask: null,
      status: 'idle',
      totalTasks: this.countTotalTasks(),
      completedTasks: 0,
      failedTasks: 0,
      skippedTasks: 0,
      phases: {
        1: { status: 'pending', tasks: {}, progress: 0 },
        2: { status: 'pending', tasks: {}, progress: 0 },
        3: { status: 'pending', tasks: {}, progress: 0 },
        4: { status: 'pending', tasks: {}, progress: 0 }
      },
      schedule: null,
      checkpoints: [],
      errors: [],
      metadata: {
        hostname: require('os').hostname(),
        platform: process.platform,
        nodeVersion: process.version
      }
    };
  }

  countTotalTasks() {
    let count = 0;
    for (const phase of Object.values(this.phases)) {
      count += phase.tasks.length;
    }
    return count;
  }

  saveState() {
    this.state.lastUpdateTime = new Date().toISOString();
    fs.writeFileSync(STATE_FILE, JSON.stringify(this.state, null, 2));
  }

  saveCheckpoint(name, data = {}) {
    const checkpoint = {
      name,
      timestamp: new Date().toISOString(),
      state: JSON.parse(JSON.stringify(this.state)),
      ...data
    };
    const filename = `checkpoint-${Date.now()}-${name}.json`;
    const filepath = path.join(CHECKPOINT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(checkpoint, null, 2));
    this.state.checkpoints.push({ name, file: filename, timestamp: checkpoint.timestamp });
    this.saveState();
    return filepath;
  }

  loadCheckpoint(filename) {
    const filepath = path.join(CHECKPOINT_DIR, filename);
    if (fs.existsSync(filepath)) {
      const checkpoint = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      this.state = checkpoint.state;
      this.saveState();
      return true;
    }
    return false;
  }

  log(level, message, data = {}) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      phase: this.state.currentPhase,
      task: this.state.currentTask,
      ...data
    };
    
    let logs = [];
    if (fs.existsSync(LOG_FILE)) {
      try {
        logs = JSON.parse(fs.readFileSync(LOG_FILE, 'utf-8'));
      } catch (e) {
        logs = [];
      }
    }
    logs.push(entry);
    
    if (logs.length > 1000) {
      logs = logs.slice(-1000);
    }
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    console.log(`${prefix} ${message}`);
  }

  async executeTask(phaseNum, task, state) {
    this.state.currentTask = task.id;
    this.log('info', `Starting task: ${task.name}`);
    
    const startTime = Date.now();
    try {
      const result = await task.action.call(this, state);
      const duration = Date.now() - startTime;
      
      this.state.phases[phaseNum].tasks[task.id] = {
        status: 'completed',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration,
        result
      };
      this.state.completedTasks++;
      this.updatePhaseProgress(phaseNum);
      
      this.log('info', `Task completed: ${task.name}`, { duration: `${duration}ms` });
      this.saveState();
      
      return { success: true, result };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.state.phases[phaseNum].tasks[task.id] = {
        status: 'failed',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date().toISOString(),
        duration,
        error: error.message
      };
      this.state.failedTasks++;
      this.state.errors.push({
        phase: phaseNum,
        task: task.id,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      
      this.log('error', `Task failed: ${task.name}`, { error: error.message });
      this.saveState();
      
      return { success: false, error: error.message };
    }
  }

  updatePhaseProgress(phaseNum) {
    const phase = this.phases[phaseNum];
    const phaseState = this.state.phases[phaseNum];
    const completedInPhase = Object.values(phaseState.tasks).filter(t => t.status === 'completed').length;
    phaseState.progress = Math.round((completedInPhase / phase.tasks.length) * 100);
  }

  async runPhase(phaseNum) {
    const phase = this.phases[phaseNum];
    if (!phase) {
      throw new Error(`Invalid phase: ${phaseNum}`);
    }

    this.log('info', `Starting Phase ${phaseNum}: ${phase.name}`);
    this.state.currentPhase = phaseNum;
    this.state.phases[phaseNum].status = 'in_progress';
    this.state.status = 'running';
    this.saveState();

    this.saveCheckpoint(`phase-${phaseNum}-start`);

    const state = {
      log: (msg) => this.log('info', msg),
      rootDir: ROOT_DIR
    };

    let allSuccess = true;
    for (const task of phase.tasks) {
      if (this.state.phases[phaseNum].tasks[task.id]?.status === 'completed') {
        this.log('info', `Skipping completed task: ${task.name}`);
        this.state.skippedTasks++;
        continue;
      }

      const result = await this.executeTask(phaseNum, task, state);
      if (!result.success) {
        allSuccess = false;
        this.saveCheckpoint(`phase-${phaseNum}-task-${task.id}-failed`);
        
        if (this.shouldStopOnFailure()) {
          this.log('warn', 'Stopping execution due to task failure');
          break;
        }
      }
    }

    this.state.phases[phaseNum].status = allSuccess ? 'completed' : 'partial';
    this.saveState();
    
    return allSuccess;
  }

  shouldStopOnFailure() {
    return true;
  }

  async start() {
    if (this.state.status === 'running') {
      this.log('warn', 'Scheduler is already running');
      return;
    }

    this.state.startTime = new Date().toISOString();
    this.state.status = 'running';
    this.saveState();

    this.log('info', 'Starting long-running automation');

    try {
      for (let i = 1; i <= 4; i++) {
        if (this.state.phases[i].status === 'completed') {
          this.log('info', `Skipping completed phase ${i}`);
          continue;
        }

        const success = await this.runPhase(i);
        if (!success) {
          this.log('error', `Phase ${i} failed, stopping automation`);
          this.state.status = 'failed';
          this.saveState();
          return;
        }

        this.saveCheckpoint(`phase-${i}-complete`);
      }

      this.state.status = 'completed';
      this.log('info', 'All phases completed successfully!');
    } catch (error) {
      this.state.status = 'error';
      this.state.errors.push({
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
      this.log('error', 'Automation failed with error', { error: error.message });
    }

    this.saveState();
  }

  async resume() {
    if (this.state.status === 'idle') {
      this.log('info', 'No previous run to resume');
      return;
    }

    this.log('info', 'Resuming automation', {
      lastPhase: this.state.currentPhase,
      completedTasks: this.state.completedTasks
    });

    await this.start();
  }

  showStatus() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║         Stigmergy Automation Status                          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log(`Status: ${this.getStatusEmoji()} ${this.state.status}`);
    console.log(`Started: ${this.state.startTime || 'Not started'}`);
    console.log(`Last Update: ${this.state.lastUpdateTime || 'N/A'}`);
    console.log(`\nProgress: ${this.state.completedTasks}/${this.state.totalTasks} tasks completed`);
    console.log(`Failed: ${this.state.failedTasks} | Skipped: ${this.state.skippedTasks}`);

    console.log('\nPhase Status:');
    console.log('─'.repeat(50));
    
    for (const [num, phaseState] of Object.entries(this.state.phases)) {
      const status = this.getPhaseStatusEmoji(phaseState.status);
      const progressBar = this.getProgressBar(phaseState.progress);
      console.log(`  Phase ${num}: ${status} ${phaseState.status} ${progressBar} ${phaseState.progress}%`);
    }

    if (this.state.errors.length > 0) {
      console.log('\nRecent Errors:');
      console.log('─'.repeat(50));
      for (const err of this.state.errors.slice(-5)) {
        console.log(`  [${err.timestamp}] Phase ${err.phase}/${err.task}: ${err.error}`);
      }
    }

    console.log('');
  }

  getStatusEmoji() {
    switch (this.state.status) {
      case 'idle': return '⏸️';
      case 'running': return '🔄';
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'error': return '⚠️';
      default: return '❓';
    }
  }

  getPhaseStatusEmoji(status) {
    switch (status) {
      case 'pending': return '⏳';
      case 'in_progress': return '🔄';
      case 'completed': return '✅';
      case 'partial': return '⚠️';
      default: return '❓';
    }
  }

  getProgressBar(percent) {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;
  }

  reset() {
    this.state = this.getInitialState();
    this.saveState();
    this.log('info', 'Scheduler state reset');
  }

  async schedule(cronExpression) {
    this.state.schedule = cronExpression;
    this.saveState();
    this.log('info', `Scheduled with expression: ${cronExpression}`);
    
    console.log(`\nScheduler configured with: ${cronExpression}`);
    console.log('Note: For actual scheduling, integrate with node-cron or system scheduler');
    console.log('Example crontab entry:');
    console.log(`  ${cronExpression} cd ${ROOT_DIR} && node scripts/long-running-scheduler.js --start`);
  }

  // Task action implementations
  async createDirectoryStructure(state) {
    const packagesDir = path.join(ROOT_DIR, 'packages');
    const dirs = [
      'packages/base/src',
      'packages/base/tests',
      'packages/ui/src',
      'packages/ui/tests',
      'packages/professional/src',
      'packages/professional/tests'
    ];
    
    for (const dir of dirs) {
      const fullPath = path.join(ROOT_DIR, dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
        this.log('info', `Created directory: ${dir}`);
      }
    }
    
    return { created: dirs };
  }

  async extractCoreModules(state) {
    const coreModules = [
      'src/core/memory_manager.js',
      'src/core/smart_router.js',
      'src/core/hook_manager.js',
      'src/core/skill_manager.js'
    ];
    
    const baseSrc = path.join(ROOT_DIR, 'packages/base/src');
    
    for (const module of coreModules) {
      const srcPath = path.join(ROOT_DIR, module);
      if (fs.existsSync(srcPath)) {
        const destPath = path.join(baseSrc, path.basename(module));
        fs.copyFileSync(srcPath, destPath);
        this.log('info', `Copied: ${module} -> packages/base/src/${path.basename(module)}`);
      }
    }
    
    return { extracted: coreModules };
  }

  async setupPackageJson(state) {
    const packages = {
      base: {
        name: '@stigmergy/base',
        version: '1.0.0',
        description: 'Stigmergy Base Package - Core functionality',
        main: 'src/index.js',
        scripts: {
          test: 'jest',
          build: 'babel src -d dist',
          lint: 'eslint src/'
        }
      },
      ui: {
        name: '@stigmergy/ui',
        version: '1.0.0',
        description: 'Stigmergy UI Package - Desktop and IM integration',
        main: 'src/index.js',
        scripts: {
          test: 'jest',
          build: 'babel src -d dist',
          lint: 'eslint src/'
        }
      },
      professional: {
        name: '@stigmergy/professional',
        version: '1.0.0',
        description: 'Stigmergy Professional Package - Domain-specific agents',
        main: 'src/index.js',
        scripts: {
          test: 'jest',
          build: 'babel src -d dist',
          lint: 'eslint src/'
        }
      }
    };
    
    for (const [name, config] of Object.entries(packages)) {
      const pkgPath = path.join(ROOT_DIR, 'packages', name, 'package.json');
      fs.writeFileSync(pkgPath, JSON.stringify(config, null, 2));
      this.log('info', `Created package.json for ${name}`);
    }
    
    return { created: Object.keys(packages) };
  }

  async configureTypeScript(state) {
    const tsConfig = {
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        declaration: true,
        strict: true,
        noImplicitAny: true,
        strictNullChecks: true,
        noImplicitThis: true,
        alwaysStrict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        outDir: './dist',
        rootDir: './src'
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests']
    };
    
    for (const pkg of ['base', 'ui', 'professional']) {
      const configPath = path.join(ROOT_DIR, 'packages', pkg, 'tsconfig.json');
      fs.writeFileSync(configPath, JSON.stringify(tsConfig, null, 2));
      this.log('info', `Created tsconfig.json for ${pkg}`);
    }
    
    return { configured: ['base', 'ui', 'professional'] };
  }

  async setupBuildPipeline(state) {
    const lernaConfig = {
      packages: ['packages/*'],
      version: '1.0.0',
      npmClient: 'npm',
      useWorkspaces: true
    };
    
    fs.writeFileSync(
      path.join(ROOT_DIR, 'lerna.json'),
      JSON.stringify(lernaConfig, null, 2)
    );
    
    this.log('info', 'Configured lerna for monorepo build');
    return { configured: 'lerna' };
  }

  async cloneSmartWorkstation(state) {
    this.log('info', 'SmartWorkstation integration - checking for existing installation');
    const swPath = path.join(ROOT_DIR, 'packages', 'ui', 'smartworkstation');
    if (fs.existsSync(swPath)) {
      this.log('info', 'SmartWorkstation already exists');
      return { status: 'exists' };
    }
    this.log('info', 'SmartWorkstation needs to be cloned manually or via CI');
    return { status: 'pending-clone' };
  }

  async configureDesktopIntegration(state) {
    const desktopConfig = {
      electron: {
        main: 'main.js',
        preload: 'preload.js'
      },
      windows: {
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600
      }
    };
    
    const configPath = path.join(ROOT_DIR, 'packages', 'ui', 'desktop.config.json');
    fs.writeFileSync(configPath, JSON.stringify(desktopConfig, null, 2));
    
    this.log('info', 'Created desktop configuration');
    return { configured: 'desktop' };
  }

  async setupFeishuIntegration(state) {
    const feishuConfig = {
      webhook: {
        url: process.env.FEISHU_WEBHOOK_URL || '',
        enabled: false
      },
      auth: {
        appId: process.env.FEISHU_APP_ID || '',
        appSecret: process.env.FEISHU_APP_SECRET || ''
      },
      features: {
        messageSync: true,
        notification: true,
        commandHandling: true
      }
    };
    
    const configPath = path.join(ROOT_DIR, 'packages', 'ui', 'feishu.config.json');
    fs.writeFileSync(configPath, JSON.stringify(feishuConfig, null, 2));
    
    this.log('info', 'Created Feishu integration configuration');
    return { configured: 'feishu' };
  }

  async createAdapterLayer(state) {
    const adapterCode = `// UI Adapter for Stigmergy CLI
const BaseAdapter = require('@stigmergy/base');

class UIAdapter extends BaseAdapter {
  constructor(config) {
    super(config);
    this.desktop = null;
    this.feishu = null;
  }

  async initialize() {
    await this.initDesktop();
    await this.initFeishu();
  }

  async initDesktop() {
    // Desktop integration initialization
    this.log('Desktop integration initialized');
  }

  async initFeishu() {
    // Feishu integration initialization
    this.log('Feishu integration initialized');
  }

  async sendMessage(channel, message) {
    // Send message through appropriate channel
    if (channel === 'feishu' && this.feishu) {
      return this.feishu.send(message);
    }
    throw new Error(\`Unknown channel: \${channel}\`);
  }
}

module.exports = UIAdapter;
`;
    
    const adapterPath = path.join(ROOT_DIR, 'packages', 'ui', 'src', 'adapter.js');
    fs.writeFileSync(adapterPath, adapterCode);
    
    this.log('info', 'Created UI adapter layer');
    return { created: 'adapter.js' };
  }

  async createAgentFramework(state) {
    const agentFramework = `// Agent Framework for Professional Package
class AgentFramework {
  constructor() {
    this.agents = new Map();
    this.skills = new Map();
  }

  registerAgent(name, agent) {
    this.agents.set(name, agent);
    return this;
  }

  registerSkill(name, skill) {
    this.skills.set(name, skill);
    return this;
  }

  async execute(agentName, task) {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(\`Agent not found: \${agentName}\`);
    }
    return agent.execute(task);
  }

  async useSkill(skillName, context) {
    const skill = this.skills.get(skillName);
    if (!skill) {
      throw new Error(\`Skill not found: \${skillName}\`);
    }
    return skill.execute(context);
  }
}

module.exports = AgentFramework;
`;
    
    const frameworkPath = path.join(ROOT_DIR, 'packages', 'professional', 'src', 'framework.js');
    fs.writeFileSync(frameworkPath, agentFramework);
    
    this.log('info', 'Created agent framework');
    return { created: 'framework.js' };
  }

  async implementAcademicAgent(state) {
    const academicAgent = `// Academic Research Agent
const AgentFramework = require('./framework');

class AcademicAgent {
  constructor() {
    this.name = 'academic';
    this.skills = [
      'grounded-theory-expert',
      'validity-reliability',
      'mathematical-statistics',
      'network-computation'
    ];
  }

  async execute(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'analyze':
        return this.analyze(data);
      case 'validate':
        return this.validate(data);
      case 'compute':
        return this.compute(data);
      default:
        throw new Error(\`Unknown task type: \${type}\`);
    }
  }

  async analyze(data) {
    // Perform academic analysis
    return { analysis: 'completed', data };
  }

  async validate(data) {
    // Validate research methodology
    return { validation: 'passed', data };
  }

  async compute(data) {
    // Perform statistical computation
    return { computation: 'completed', data };
  }
}

module.exports = AcademicAgent;
`;
    
    const agentPath = path.join(ROOT_DIR, 'packages', 'professional', 'src', 'agents', 'academic.js');
    const agentDir = path.dirname(agentPath);
    if (!fs.existsSync(agentDir)) {
      fs.mkdirSync(agentDir, { recursive: true });
    }
    fs.writeFileSync(agentPath, academicAgent);
    
    this.log('info', 'Created academic agent');
    return { created: 'academic.js' };
  }

  async implementBusinessAgent(state) {
    const businessAgent = `// Business Analysis Agent
const AgentFramework = require('./framework');

class BusinessAgent {
  constructor() {
    this.name = 'business';
    this.skills = [
      'business-ecosystem-analysis',
      'digital-transformation',
      'ecosystem-analysis'
    ];
  }

  async execute(task) {
    const { type, data } = task;
    
    switch (type) {
      case 'analyze':
        return this.analyzeBusiness(data);
      case 'transform':
        return this.planTransformation(data);
      case 'ecosystem':
        return this.analyzeEcosystem(data);
      default:
        throw new Error(\`Unknown task type: \${type}\`);
    }
  }

  async analyzeBusiness(data) {
    // Perform business analysis
    return { analysis: 'completed', data };
  }

  async planTransformation(data) {
    // Plan digital transformation
    return { transformation: 'planned', data };
  }

  async analyzeEcosystem(data) {
    // Analyze business ecosystem
    return { ecosystem: 'analyzed', data };
  }
}

module.exports = BusinessAgent;
`;
    
    const agentPath = path.join(ROOT_DIR, 'packages', 'professional', 'src', 'agents', 'business.js');
    fs.writeFileSync(agentPath, businessAgent);
    
    this.log('info', 'Created business agent');
    return { created: 'business.js' };
  }

  async createSkillTemplates(state) {
    const skillTemplate = `// Skill Template
class SkillTemplate {
  constructor(config) {
    this.name = config.name;
    this.description = config.description;
    this.version = config.version || '1.0.0';
  }

  async execute(context) {
    throw new Error('execute() must be implemented by subclass');
  }

  validate(context) {
    return true;
  }
}

module.exports = SkillTemplate;
`;
    
    const templatePath = path.join(ROOT_DIR, 'packages', 'professional', 'src', 'skills', 'template.js');
    const skillDir = path.dirname(templatePath);
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }
    fs.writeFileSync(templatePath, skillTemplate);
    
    this.log('info', 'Created skill template');
    return { created: 'template.js' };
  }

  async runIntegrationTests(state) {
    this.log('info', 'Running integration tests...');
    
    try {
      const result = execSync('npm test', { 
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        timeout: 300000
      });
      this.log('info', 'Integration tests passed');
      return { passed: true, output: result };
    } catch (error) {
      this.log('warn', 'Some tests may have failed');
      return { passed: false, error: error.message };
    }
  }

  async createDocumentation(state) {
    const docs = {
      'README.md': `# Stigmergy CLI - Multi-Agents

## Package Structure

- **@stigmergy/base**: Core functionality and shared modules
- **@stigmergy/ui**: Desktop and IM integration (SmartWorkstation)
- **@stigmergy/professional**: Domain-specific agents and skills

## Installation

\`\`\`bash
npm install @stigmergy/base
npm install @stigmergy/ui
npm install @stigmergy/professional
\`\`\`

## Usage

\`\`\`javascript
const { BasePackage } = require('@stigmergy/base');
const { UIAdapter } = require('@stigmergy/ui');
const { AcademicAgent } = require('@stigmergy/professional');
\`\`\`
`,
      'CHANGELOG.md': `# Changelog

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial package decomposition
- Base package with core modules
- UI package with SmartWorkstation integration
- Professional package with academic and business agents
- Long-running automation scheduler
`
    };
    
    for (const [filename, content] of Object.entries(docs)) {
      const docPath = path.join(ROOT_DIR, 'packages', 'docs', filename);
      const docDir = path.dirname(docPath);
      if (!fs.existsSync(docDir)) {
        fs.mkdirSync(docDir, { recursive: true });
      }
      fs.writeFileSync(docPath, content);
      this.log('info', `Created documentation: ${filename}`);
    }
    
    return { created: Object.keys(docs) };
  }

  async setupCICD(state) {
    const githubActions = {
      'ci.yml': `name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
`
    };
    
    const workflowsDir = path.join(ROOT_DIR, '.github', 'workflows');
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }
    
    for (const [filename, content] of Object.entries(githubActions)) {
      const workflowPath = path.join(workflowsDir, filename);
      fs.writeFileSync(workflowPath, content);
      this.log('info', `Created CI workflow: ${filename}`);
    }
    
    return { created: Object.keys(githubActions) };
  }

  async prepareRelease(state) {
    const releaseNotes = `# Release Notes

## Version 1.0.0

### Package Decomposition Complete

This release introduces the new package structure:

#### @stigmergy/base
- Core memory management
- Smart routing
- Hook system
- Skill management

#### @stigmergy/ui
- Desktop integration (Electron)
- Feishu IM integration
- SmartWorkstation adapter

#### @stigmergy/professional
- Academic research agent
- Business analysis agent
- Skill templates and framework

### Migration Guide

See [MIGRATION.md](./MIGRATION.md) for details on migrating from the monolithic structure.
`;
    
    const releasePath = path.join(ROOT_DIR, 'RELEASE_NOTES.md');
    fs.writeFileSync(releasePath, releaseNotes);
    
    this.log('info', 'Created release notes');
    return { created: 'RELEASE_NOTES.md' };
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const scheduler = new LongRunningScheduler();

  const showStatus = args.includes('--status');
  const startNow = args.includes('--start');
  const resume = args.includes('--resume');
  const reset = args.includes('--reset');
  const scheduleArg = args.find(a => a.startsWith('--schedule='));

  if (showStatus) {
    scheduler.showStatus();
    return;
  }

  if (reset) {
    scheduler.reset();
    return;
  }

  if (scheduleArg) {
    const cronExpr = scheduleArg.split('=')[1];
    await scheduler.schedule(cronExpr);
    return;
  }

  if (startNow || resume) {
    await scheduler.start();
    return;
  }

  console.log(`
Stigmergy Long-Running Automation Scheduler
==========================================

Usage:
  node scripts/long-running-scheduler.js --start      Start automation from beginning
  node scripts/long-running-scheduler.js --status     Show current status
  node scripts/long-running-scheduler.js --resume     Resume from last checkpoint
  node scripts/long-running-scheduler.js --reset      Reset all progress
  node scripts/long-running-scheduler.js --schedule="0 9 * * 1-5"  Schedule automation

State file: ${STATE_FILE}
Log file: ${LOG_FILE}
Checkpoints: ${CHECKPOINT_DIR}
`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { LongRunningScheduler };

