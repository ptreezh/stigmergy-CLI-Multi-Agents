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
      console.error(`Unknown report type: ${reportType}`);
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

function generateOnetimeReport() {
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
    }
  };

  return writeReport('onetime', report);
}

function generateDailyReport(data) {
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
    blockers: data.blockers || []
  };

  return writeReport('daily', report);
}

function generateSessionReport(data) {
  const report = {
    sessionId: process.env.STIGMERGY_SESSION_ID || `session-${Date.now()}`,
    workingDirectory: data.workingDirectory || process.cwd(),
    filesModified: data.filesModified || [],
    tasksCompleted: data.tasksCompleted || [],
    keyDecisions: data.keyDecisions || [],
    nextSteps: data.nextSteps || []
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
