#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const STIGMERGY_BUS_DIR = process.env.STIGMERGY_BUS_DIR || path.join(os.homedir(), '.stigmergy', 'bus');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getAgentName() {
  return process.env.STIGMERGY_AGENT_NAME || process.argv[2] || 'unknown';
}

function writeReport(reportType, data) {
  const agent = getAgentName();
  const timestamp = new Date().toISOString();

  let destPath;
  switch (reportType) {
    case 'onetime':
      destPath = path.join(STIGMERGY_BUS_DIR, 'onetime', `${agent}.json`);
      break;
    case 'daily':
      const date = new Date().toISOString().split('T')[0];
      destPath = path.join(STIGMERGY_BUS_DIR, 'daily', agent, `${date}.json`);
      break;
    case 'session':
      const sessionId = process.env.STIGMERGY_SESSION_ID || `session-${Date.now()}`;
      destPath = path.join(STIGMERGY_BUS_DIR, 'sessions', agent, `${sessionId}.json`);
      break;
    default:
      console.error('Unknown report type:', reportType);
      process.exit(1);
  }

  ensureDir(path.dirname(destPath));

  const report = {
    ...data,
    agent,
    reportType,
    timestamp
  };

  fs.writeFileSync(destPath, JSON.stringify(report, null, 2));
  console.log(`[REPORTER] ${reportType} report written to: ${destPath}`);
  return destPath;
}

function readBusTasks() {
  const tasksDir = path.join(STIGMERGY_BUS_DIR, 'tasks');
  if (!fs.existsSync(tasksDir)) return [];
  return fs.readdirSync(tasksDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(tasksDir, f), 'utf8')); } catch { return null; }
    })
    .filter(Boolean);
}

function readBusRegistry() {
  const registryDir = path.join(STIGMERGY_BUS_DIR, 'registry');
  if (!fs.existsSync(registryDir)) return [];
  return fs.readdirSync(registryDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      try { return JSON.parse(fs.readFileSync(path.join(registryDir, f), 'utf8')); } catch { return null; }
    })
    .filter(Boolean);
}

function generateOnetimeReport() {
  const tasks = readBusTasks();
  const registry = readBusRegistry();
  const otherAgents = registry.filter(r => r.agent !== getAgentName());

  const report = {
    installation: {
      path: process.env.STIGMERGY_HOME || process.cwd(),
      version: process.env.STIGMERGY_VERSION || 'unknown',
      configFiles: []
    },
    capabilities: {
      commands: [],
      tools: [],
      memoryAccess: true
    },
    memory: {
      files: [],
      sessionPattern: '',
      sessionFormat: 'json'
    },
    projects: [],
    help: {
      files: [],
      content: ''
    },
    globalAwareness: {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      stuckTasks: tasks.filter(t => t.status === 'stuck').length,
      activeAgents: otherAgents.length,
      otherAgents: otherAgents.map(a => ({
        name: a.agent,
        status: a.status,
        currentTask: a.currentTask,
        capabilities: a.capabilities
      }))
    }
  };

  return writeReport('onetime', report);
}

function generateDailyReport(data) {
  const tasks = readBusTasks();
  const registry = readBusRegistry();
  const otherAgents = registry.filter(r => r.agent !== getAgentName());

  const report = {
    date: new Date().toISOString().split('T')[0],
    yesterday: {
      tasksCompleted: data.yesterday?.tasksCompleted || [],
      projectsWorked: data.yesterday?.projectsWorked || [],
      sessionCount: data.yesterday?.sessionCount || 0
    },
    today: {
      activeProject: data.today?.activeProject || null,
      plannedTasks: data.today?.plannedTasks || [],
      blockers: data.today?.blockers || []
    },
    blockers: data.blockers || [],
    globalState: {
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      stuckTasks: tasks.filter(t => t.status === 'stuck').length,
      activeAgents: otherAgents.length,
      agentsByStatus: otherAgents.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
      }, {})
    }
  };

  return writeReport('daily', report);
}

function generateSessionReport(data) {
  const tasks = readBusTasks();
  const registry = readBusRegistry();
  const otherAgents = registry.filter(r => r.agent !== getAgentName());

  const report = {
    sessionId: process.env.STIGMERGY_SESSION_ID || `session-${Date.now()}`,
    workingDirectory: data.workingDirectory || process.cwd(),
    filesModified: data.filesModified || [],
    tasksCompleted: data.tasksCompleted || [],
    keyDecisions: data.keyDecisions || [],
    nextSteps: data.nextSteps || [],
    globalAwareness: {
      totalActiveAgents: otherAgents.length,
      agentsWorkingOnSameProject: otherAgents.filter(a => a.project === (data.workingDirectory || process.cwd())).length,
      stuckTasksInProject: tasks.filter(t => t.project === (data.workingDirectory || process.cwd()) && t.status === 'stuck').length
    }
  };

  return writeReport('session', report);
}

// CLI interface
const command = process.argv[2];
switch (command) {
  case 'onetime':
    generateOnetimeReport();
    break;
  case 'daily':
    const dailyData = JSON.parse(process.argv[3] || '{}');
    generateDailyReport(dailyData);
    break;
  case 'session':
    const sessionData = JSON.parse(process.argv[3] || '{}');
    generateSessionReport(sessionData);
    break;
  default:
    console.error('Usage: reporter.js <onetime|daily|session> [jsonData]');
    process.exit(1);
}
