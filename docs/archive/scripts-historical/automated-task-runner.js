#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutomatedTaskRunner {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.taskStatus = new Map();
    this.progressFile = path.join(process.cwd(), '.task-progress.json');
    this.loadProgress();
  }

  loadConfig() {
    if (fs.existsSync(this.configPath)) {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }
    return { tasks: [], taskGroups: {} };
  }

  loadProgress() {
    if (fs.existsSync(this.progressFile)) {
      const progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
      Object.entries(progress.tasks || {}).forEach(([id, data]) => {
        this.taskStatus.set(id, data.status);
      });
    }
  }

  saveProgress() {
    const progress = {
      lastUpdated: new Date().toISOString(),
      tasks: {}
    };
    this.taskStatus.forEach((status, id) => {
      progress.tasks[id] = { status, timestamp: new Date().toISOString() };
    });
    fs.writeFileSync(this.progressFile, JSON.stringify(progress, null, 2));
  }

  findTask(taskId) {
    if (this.config.tasks) {
      const task = this.config.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    for (const group of Object.values(this.config.taskGroups || {})) {
      const task = group.tasks?.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  }

  async runTask(taskId) {
    const task = this.findTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const deps = task.dependencies || [];
    for (const dep of deps) {
      if (this.taskStatus.get(dep) !== 'completed') {
        console.log(`Waiting for dependency: ${dep}`);
        return { success: false, reason: 'dependency_not_completed', dependency: dep };
      }
    }

    this.taskStatus.set(taskId, 'running');
    console.log(`\n[Running] ${taskId}: ${task.name}`);

    try {
      await this.executeTask(task);
      this.taskStatus.set(taskId, 'completed');
      this.saveProgress();
      console.log(`[Completed] ${taskId}`);
      return { success: true, taskId };
    } catch (error) {
      this.taskStatus.set(taskId, 'failed');
      this.saveProgress();
      console.error(`[Failed] ${taskId}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async executeTask(task) {
    if (task.script) {
      console.log(`  Executing script: ${task.script}`);
      execSync(`node ${task.script}`, { stdio: 'inherit' });
    }

    if (task.source && task.target) {
      console.log(`  Migrating: ${task.source} -> ${task.target}`);
      this.migrateFile(task.source, task.target);
    }

    if (task.template && task.target) {
      console.log(`  Applying template: ${task.template} -> ${task.target}`);
      this.applyTemplate(task.template, task.target);
    }

    if (task.target && !task.source && !task.template && !task.script) {
      console.log(`  Creating directory: ${task.target}`);
      this.createDirectory(task.target);
    }
  }

  migrateFile(source, target) {
    const sourcePath = path.resolve(source);
    const targetPath = path.resolve(target);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source not found: ${sourcePath}`);
    }

    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.statSync(sourcePath).isDirectory()) {
      this.copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }

  copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  applyTemplate(template, target) {
    const templatePath = path.resolve(template);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const targetPath = path.resolve(target);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let content = fs.readFileSync(templatePath, 'utf8');
    content = this.processTemplate(content);
    fs.writeFileSync(targetPath, content);
  }

  processTemplate(content) {
    const now = new Date();
    return content
      .replace(/\{\{YEAR\}\}/g, now.getFullYear())
      .replace(/\{\{DATE\}\}/g, now.toISOString().split('T')[0])
      .replace(/\{\{TIMESTAMP\}\}/g, now.toISOString());
  }

  createDirectory(target) {
    const targetPath = path.resolve(target);
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  }

  async runAll() {
    const allTasks = this.getAllTasks();
    const results = [];

    for (const task of allTasks) {
      const result = await this.runTask(task.id);
      results.push({ taskId: task.id, ...result });
    }

    return results;
  }

  getAllTasks() {
    const tasks = [];
    if (this.config.tasks) {
      tasks.push(...this.config.tasks);
    }
    for (const group of Object.values(this.config.taskGroups || {})) {
      if (group.tasks) {
        tasks.push(...group.tasks);
      }
    }
    return tasks;
  }

  getStatus() {
    const total = this.taskStatus.size;
    let completed = 0;
    let failed = 0;
    let running = 0;
    let pending = 0;

    this.taskStatus.forEach(status => {
      switch (status) {
        case 'completed': completed++; break;
        case 'failed': failed++; break;
        case 'running': running++; break;
        default: pending++;
      }
    });

    return { total, completed, failed, running, pending };
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const configPath = args[0] || path.join(process.cwd(), 'task-config.json');
  const taskId = args[1];

  const runner = new AutomatedTaskRunner(configPath);

  if (taskId) {
    runner.runTask(taskId).then(result => {
      process.exit(result.success ? 0 : 1);
    });
  } else {
    runner.runAll().then(results => {
      const status = runner.getStatus();
      console.log(`\n=== Summary ===`);
      console.log(`Completed: ${status.completed}`);
      console.log(`Failed: ${status.failed}`);
      console.log(`Running: ${status.running}`);
      console.log(`Pending: ${status.pending}`);
      process.exit(status.failed > 0 ? 1 : 0);
    });
  }
}

module.exports = AutomatedTaskRunner;
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AutomatedTaskRunner {
  constructor(configPath) {
    this.configPath = configPath;
    this.config = this.loadConfig();
    this.taskStatus = new Map();
    this.progressFile = path.join(process.cwd(), '.task-progress.json');
    this.loadProgress();
  }

  loadConfig() {
    if (fs.existsSync(this.configPath)) {
      return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
    }
    return { tasks: [], taskGroups: {} };
  }

  loadProgress() {
    if (fs.existsSync(this.progressFile)) {
      const progress = JSON.parse(fs.readFileSync(this.progressFile, 'utf8'));
      Object.entries(progress.tasks || {}).forEach(([id, data]) => {
        this.taskStatus.set(id, data.status);
      });
    }
  }

  saveProgress() {
    const progress = {
      lastUpdated: new Date().toISOString(),
      tasks: {}
    };
    this.taskStatus.forEach((status, id) => {
      progress.tasks[id] = { status, timestamp: new Date().toISOString() };
    });
    fs.writeFileSync(this.progressFile, JSON.stringify(progress, null, 2));
  }

  findTask(taskId) {
    if (this.config.tasks) {
      const task = this.config.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    for (const group of Object.values(this.config.taskGroups || {})) {
      const task = group.tasks?.find(t => t.id === taskId);
      if (task) return task;
    }
    return null;
  }

  async runTask(taskId) {
    const task = this.findTask(taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    const deps = task.dependencies || [];
    for (const dep of deps) {
      if (this.taskStatus.get(dep) !== 'completed') {
        console.log(`Waiting for dependency: ${dep}`);
        return { success: false, reason: 'dependency_not_completed', dependency: dep };
      }
    }

    this.taskStatus.set(taskId, 'running');
    console.log(`\n[Running] ${taskId}: ${task.name}`);

    try {
      await this.executeTask(task);
      this.taskStatus.set(taskId, 'completed');
      this.saveProgress();
      console.log(`[Completed] ${taskId}`);
      return { success: true, taskId };
    } catch (error) {
      this.taskStatus.set(taskId, 'failed');
      this.saveProgress();
      console.error(`[Failed] ${taskId}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async executeTask(task) {
    if (task.script) {
      console.log(`  Executing script: ${task.script}`);
      execSync(`node ${task.script}`, { stdio: 'inherit' });
    }

    if (task.source && task.target) {
      console.log(`  Migrating: ${task.source} -> ${task.target}`);
      this.migrateFile(task.source, task.target);
    }

    if (task.template && task.target) {
      console.log(`  Applying template: ${task.template} -> ${task.target}`);
      this.applyTemplate(task.template, task.target);
    }

    if (task.target && !task.source && !task.template && !task.script) {
      console.log(`  Creating directory: ${task.target}`);
      this.createDirectory(task.target);
    }
  }

  migrateFile(source, target) {
    const sourcePath = path.resolve(source);
    const targetPath = path.resolve(target);

    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Source not found: ${sourcePath}`);
    }

    const targetDir = path.dirname(targetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    if (fs.statSync(sourcePath).isDirectory()) {
      this.copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }

  copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const entries = fs.readdirSync(source, { withFileTypes: true });
    for (const entry of entries) {
      const sourcePath = path.join(source, entry.name);
      const targetPath = path.join(target, entry.name);

      if (entry.isDirectory()) {
        this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  applyTemplate(template, target) {
    const templatePath = path.resolve(template);
    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const targetPath = path.resolve(target);
    const targetDir = path.dirname(targetPath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    let content = fs.readFileSync(templatePath, 'utf8');
    content = this.processTemplate(content);
    fs.writeFileSync(targetPath, content);
  }

  processTemplate(content) {
    const now = new Date();
    return content
      .replace(/\{\{YEAR\}\}/g, now.getFullYear())
      .replace(/\{\{DATE\}\}/g, now.toISOString().split('T')[0])
      .replace(/\{\{TIMESTAMP\}\}/g, now.toISOString());
  }

  createDirectory(target) {
    const targetPath = path.resolve(target);
    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }
  }

  async runAll() {
    const allTasks = this.getAllTasks();
    const results = [];

    for (const task of allTasks) {
      const result = await this.runTask(task.id);
      results.push({ taskId: task.id, ...result });
    }

    return results;
  }

  getAllTasks() {
    const tasks = [];
    if (this.config.tasks) {
      tasks.push(...this.config.tasks);
    }
    for (const group of Object.values(this.config.taskGroups || {})) {
      if (group.tasks) {
        tasks.push(...group.tasks);
      }
    }
    return tasks;
  }

  getStatus() {
    const total = this.taskStatus.size;
    let completed = 0;
    let failed = 0;
    let running = 0;
    let pending = 0;

    this.taskStatus.forEach(status => {
      switch (status) {
        case 'completed': completed++; break;
        case 'failed': failed++; break;
        case 'running': running++; break;
        default: pending++;
      }
    });

    return { total, completed, failed, running, pending };
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const configPath = args[0] || path.join(process.cwd(), 'task-config.json');
  const taskId = args[1];

  const runner = new AutomatedTaskRunner(configPath);

  if (taskId) {
    runner.runTask(taskId).then(result => {
      process.exit(result.success ? 0 : 1);
    });
  } else {
    runner.runAll().then(results => {
      const status = runner.getStatus();
      console.log(`\n=== Summary ===`);
      console.log(`Completed: ${status.completed}`);
      console.log(`Failed: ${status.failed}`);
      console.log(`Running: ${status.running}`);
      console.log(`Pending: ${status.pending}`);
      process.exit(status.failed > 0 ? 1 : 0);
    });
  }
}

module.exports = AutomatedTaskRunner;
