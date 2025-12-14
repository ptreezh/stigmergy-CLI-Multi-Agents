// Utility functions for end-to-end testing
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test result tracker
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Log file path
const logFilePath = path.join(__dirname, 'logs', `e2e-test-${new Date().toISOString().replace(/[:.]/g, '-')}.log`);

// Initialize log file
fs.writeFileSync(logFilePath, `Stigmergy CLI End-to-End Test Log\n`);
fs.appendFileSync(logFilePath, `Started at: ${new Date().toISOString()}\n`);
fs.appendFileSync(logFilePath, `=`.repeat(80) + '\n\n');

/**
 * Execute a command and return the result
 * @param {string} command - Command to execute
 * @param {number} timeout - Timeout in milliseconds (default: 30000)
 * @returns {Promise<Object>} Result object with status, stdout, stderr
 */
function executeCommand(command, timeout = 30000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    // Log the command
    const logEntry = `[${new Date().toISOString()}] Executing: ${command}\n`;
    fs.appendFileSync(logFilePath, logEntry);
    console.log(`Executing: ${command}`);
    
    // Spawn the process
    const child = spawn(command, { 
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    let stdout = '';
    let stderr = '';
    
    // Capture stdout
    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    // Capture stderr
    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    // Handle process close
    child.on('close', (code) => {
      const executionTime = Date.now() - startTime;
      const result = {
        command,
        code,
        stdout,
        stderr,
        executionTime,
        success: code === 0
      };
      
      // Log the result
      const resultLog = `  Status: ${code}, Time: ${executionTime}ms\n`;
      fs.appendFileSync(logFilePath, resultLog);
      
      if (stdout) {
        fs.appendFileSync(logFilePath, `  STDOUT:\n${stdout}\n`);
      }
      if (stderr) {
        fs.appendFileSync(logFilePath, `  STDERR:\n${stderr}\n`);
      }
      
      fs.appendFileSync(logFilePath, `  ---\n\n`);
      
      resolve(result);
    });
    
    // Handle errors
    child.on('error', (error) => {
      const executionTime = Date.now() - startTime;
      const result = {
        command,
        code: -1,
        stdout: '',
        stderr: error.message,
        executionTime,
        success: false
      };
      
      // Log the error
      const errorLog = `  ERROR: ${error.message}, Time: ${executionTime}ms\n  ---\n\n`;
      fs.appendFileSync(logFilePath, errorLog);
      
      resolve(result);
    });
    
    // Handle timeout
    setTimeout(() => {
      if (child.exitCode === null) {
        child.kill();
        const executionTime = Date.now() - startTime;
        const result = {
          command,
          code: -2,
          stdout: '',
          stderr: 'TIMEOUT',
          executionTime,
          success: false
        };
        
        // Log the timeout
        const timeoutLog = `  TIMEOUT after ${timeout}ms\n  ---\n\n`;
        fs.appendFileSync(logFilePath, timeoutLog);
        
        resolve(result);
      }
    }, timeout);
  });
}

/**
 * Record test result
 * @param {string} testName - Name of the test
 * @param {boolean} passed - Whether the test passed
 * @param {Object} details - Additional details about the test
 */
function recordTestResult(testName, passed, details = {}) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  const result = {
    name: testName,
    passed,
    details
  };
  
  testResults.details.push(result);
  
  // Log to file
  const status = passed ? 'PASS' : 'FAIL';
  const logEntry = `[${status}] ${testName}\n`;
  fs.appendFileSync(logFilePath, logEntry);
  
  // Log to console
  console.log(`${status}: ${testName}`);
}

/**
 * Get test summary
 * @returns {Object} Test summary
 */
function getTestSummary() {
  return {
    ...testResults,
    passRate: testResults.total > 0 ? (testResults.passed / testResults.total * 100).toFixed(2) : 0
  };
}

/**
 * Save detailed test report
 */
function saveTestReport() {
  const summary = getTestSummary();
  const reportPath = path.join(__dirname, 'logs', `e2e-report-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  
  const report = {
    timestamp: new Date().toISOString(),
    summary,
    details: testResults.details
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  // Also save a human-readable summary
  const summaryPath = path.join(__dirname, 'logs', `e2e-summary-${new Date().toISOString().replace(/[:.]/g, '-')}.txt`);
  let summaryContent = `Stigmergy CLI End-to-End Test Summary\n`;
  summaryContent += `=====================================\n\n`;
  summaryContent += `Timestamp: ${report.timestamp}\n`;
  summaryContent += `Total Tests: ${summary.total}\n`;
  summaryContent += `Passed: ${summary.passed}\n`;
  summaryContent += `Failed: ${summary.failed}\n`;
  summaryContent += `Pass Rate: ${summary.passRate}%\n\n`;
  
  summaryContent += `Detailed Results:\n`;
  summaryContent += `-----------------\n`;
  testResults.details.forEach(detail => {
    const status = detail.passed ? 'PASS' : 'FAIL';
    summaryContent += `${status}: ${detail.name}\n`;
  });
  
  fs.writeFileSync(summaryPath, summaryContent);
  
  return { reportPath, summaryPath };
}

/**
 * Wait for a specified time
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
  executeCommand,
  recordTestResult,
  getTestSummary,
  saveTestReport,
  wait,
  logFilePath
};
