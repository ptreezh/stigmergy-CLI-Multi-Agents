#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class ProgressTracker {
  constructor(progressFile) {
    this.progressFile = progressFile || path.join(process.cwd(), '.task-progress.json');
    this.progress = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(this.progressFile)) {
      return JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
    }
    return { tasks: {}, lastUpdated: null, phases: {} };
  }

  saveProgress() {
    this.progress.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.progressFile, JSON.stringify(this.progress, null, 2));
  }

  updateTask(taskId, status, details = {}) {
    this.progress.tasks[taskId] = {
      status,
      timestamp: new Date().toISOString(),
      ...details
    };
    this.saveProgress();
  }

  getTask(taskId) {
    return this.progress.tasks[taskId] || null;
  }

  getProgress() {
    const tasks = Object.values(this.progress.tasks);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const running = tasks.filter(t => t.status === 'running').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    return {
      total,
      completed,
      failed,
      running,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  getPhaseProgress(phase) {
    const phaseTasks = Object.entries(this.progress.tasks)
      .filter(([id]) => id.startsWith(phase));
    
    const total = phaseTasks.length;
    const completed = phaseTasks.filter(([, t]) => t.status === 'completed').length;
    
    return {
      phase,
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  generateReport() {
    const progress = this.getProgress();
    const phases = {
      'BP': this.getPhaseProgress('BP'),
      'UI': this.getPhaseProgress('UI'),
      'PP': this.getPhaseProgress('PP'),
      'INT': this.getPhaseProgress('INT'),
      'TEST': this.getPhaseProgress('TEST'),
      'DOC': this.getPhaseProgress('DOC'),
      'REL': this.getPhaseProgress('REL')
    };

    let report = `# Stigmergy CLI - Progress Report

**Generated**: ${new Date().toISOString()}

## Overall Progress

| Metric | Value |
|--------|-------|
| Total Tasks | ${progress.total} |
| Completed | ${progress.completed} |
| Failed | ${progress.failed} |
| Running | ${progress.running} |
| Pending | ${progress.pending} |
| Progress | ${progress.percentage}% |

## Phase Progress

| Phase | Total | Completed | Progress |
|-------|-------|-----------|----------|
`;

    for (const [name, phase] of Object.entries(phases)) {
      if (phase.total > 0) {
        report += `| ${name} | ${phase.total} | ${phase.completed} | ${phase.percentage}% |\n`;
      }
    }

    report += `
## Task Details

### Completed Tasks
`;

    const completedTasks = Object.entries(this.progress.tasks)
      .filter(([, t]) => t.status === 'completed');
    
    for (const [id, data] of completedTasks) {
      report += `- [x] ${id} (${data.timestamp})\n`;
    }

    report += `\n### Pending Tasks\n`;

    const pendingTasks = Object.entries(this.progress.tasks)
      .filter(([, t]) => t.status === 'pending' || !t.status);
    
    for (const [id] of pendingTasks) {
      report += `- [ ] ${id}\n`;
    }

    report += `\n### Failed Tasks\n`;

    const failedTasks = Object.entries(this.progress.tasks)
      .filter(([, t]) => t.status === 'failed');
    
    for (const [id, data] of failedTasks) {
      report += `- [!] ${id}: ${data.error || 'Unknown error'}\n`;
    }

    return report;
  }

  exportJSON() {
    return JSON.stringify(this.progress, null, 2);
  }

  importJSON(jsonString) {
    try {
      this.progress = JSON.parse(jsonString);
      this.saveProgress();
      return true;
    } catch (error) {
      console.error('Failed to import progress:', error.message);
      return false;
    }
  }

  reset() {
    this.progress = { tasks: {}, lastUpdated: null, phases: {} };
    this.saveProgress();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const tracker = new ProgressTracker();

  switch (command) {
    case 'report':
      console.log(tracker.generateReport());
      break;
    case 'status':
      console.log(JSON.stringify(tracker.getProgress(), null, 2));
      break;
    case 'update':
      const taskId = args[1];
      const status = args[2];
      if (taskId && status) {
        tracker.updateTask(taskId, status);
        console.log(`Updated ${taskId} to ${status}`);
      } else {
        console.log('Usage: node progress-tracker.js update <taskId> <status>');
      }
      break;
    case 'reset':
      tracker.reset();
      console.log('Progress reset');
      break;
    default:
      console.log(tracker.generateReport());
  }
}

module.exports = ProgressTracker;
const fs = require('fs');
const path = require('path');

class ProgressTracker {
  constructor(progressFile) {
    this.progressFile = progressFile || path.join(process.cwd(), '.task-progress.json');
    this.progress = this.loadProgress();
  }

  loadProgress() {
    if (fs.existsSync(this.progressFile)) {
      return JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
    }
    return { tasks: {}, lastUpdated: null, phases: {} };
  }

  saveProgress() {
    this.progress.lastUpdated = new Date().toISOString();
    fs.writeFileSync(this.progressFile, JSON.stringify(this.progress, null, 2));
  }

  updateTask(taskId, status, details = {}) {
    this.progress.tasks[taskId] = {
      status,
      timestamp: new Date().toISOString(),
      ...details
    };
    this.saveProgress();
  }

  getTask(taskId) {
    return this.progress.tasks[taskId] || null;
  }

  getProgress() {
    const tasks = Object.values(this.progress.tasks);
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const running = tasks.filter(t => t.status === 'running').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    return {
      total,
      completed,
      failed,
      running,
      pending,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  getPhaseProgress(phase) {
    const phaseTasks = Object.entries(this.progress.tasks)
      .filter(([id]) => id.startsWith(phase));
    
    const total = phaseTasks.length;
    const completed = phaseTasks.filter(([, t]) => t.status === 'completed').length;
    
    return {
      phase,
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  generateReport() {
    const progress = this.getProgress();
    const phases = {
      'BP': this.getPhaseProgress('BP'),
      'UI': this.getPhaseProgress('UI'),
      'PP': this.getPhaseProgress('PP'),
      'INT': this.getPhaseProgress('INT'),
      'TEST': this.getPhaseProgress('TEST'),
      'DOC': this.getPhaseProgress('DOC'),
      'REL': this.getPhaseProgress('REL')
    };

    let report = `# Stigmergy CLI - Progress Report

**Generated**: ${new Date().toISOString()}

## Overall Progress

| Metric | Value |
|--------|-------|
| Total Tasks | ${progress.total} |
| Completed | ${progress.completed} |
| Failed | ${progress.failed} |
| Running | ${progress.running} |
| Pending | ${progress.pending} |
| Progress | ${progress.percentage}% |

## Phase Progress

| Phase | Total | Completed | Progress |
|-------|-------|-----------|----------|
`;

    for (const [name, phase] of Object.entries(phases)) {
      if (phase.total > 0) {
        report += `| ${name} | ${phase.total} | ${phase.completed} | ${phase.percentage}% |\n`;
      }
    }

    report += `
## Task Details

### Completed Tasks
`;

    const completedTasks = Object.entries(this.progress.tasks)
      .filter(([, t]) => t.status === 'completed');
    
    for (const [id, data] of completedTasks) {
      report += `- [x] ${id} (${data.timestamp})\n`;
    }

    report += `\n### Pending Tasks\n`;

    const pendingTasks = Object.entries(this.progress.tasks)
      .filter(([, t]) => t.status === 'pending' || !t.status);
    
    for (const [id] of pendingTasks) {
      report += `- [ ] ${id}\n`;
    }

    report += `\n### Failed Tasks\n`;

    const failedTasks = Object.entries(this.progress.tasks)
      .filter(([, t]) => t.status === 'failed');
    
    for (const [id, data] of failedTasks) {
      report += `- [!] ${id}: ${data.error || 'Unknown error'}\n`;
    }

    return report;
  }

  exportJSON() {
    return JSON.stringify(this.progress, null, 2);
  }

  importJSON(jsonString) {
    try {
      this.progress = JSON.parse(jsonString);
      this.saveProgress();
      return true;
    } catch (error) {
      console.error('Failed to import progress:', error.message);
      return false;
    }
  }

  reset() {
    this.progress = { tasks: {}, lastUpdated: null, phases: {} };
    this.saveProgress();
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  const tracker = new ProgressTracker();

  switch (command) {
    case 'report':
      console.log(tracker.generateReport());
      break;
    case 'status':
      console.log(JSON.stringify(tracker.getProgress(), null, 2));
      break;
    case 'update':
      const taskId = args[1];
      const status = args[2];
      if (taskId && status) {
        tracker.updateTask(taskId, status);
        console.log(`Updated ${taskId} to ${status}`);
      } else {
        console.log('Usage: node progress-tracker.js update <taskId> <status>');
      }
      break;
    case 'reset':
      tracker.reset();
      console.log('Progress reset');
      break;
    default:
      console.log(tracker.generateReport());
  }
}

module.exports = ProgressTracker;
