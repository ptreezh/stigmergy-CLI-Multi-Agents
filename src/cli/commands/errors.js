/**
 * Error Reporting Commands
 * Modular implementation for error reporting and system troubleshooting
 */

const chalk = require('chalk');
const { errorHandler } = require('../../core/error_handler');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Handle errors command - Generate comprehensive error report
 * @param {Object} options - Command options
 */
async function handleErrorsCommand(options = {}) {
  try {
    console.log(chalk.cyan('[ERRORS] Generating Stigmergy CLI error report...\n'));

    const report = {
      timestamp: new Date().toISOString(),
      system: {},
      environment: {},
      errors: [],
      diagnostics: {}
    };

    // System information
    console.log(chalk.blue('🖥️  System Information:'));
    report.system = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
      freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB'
    };

    Object.entries(report.system).forEach(([key, value]) => {
      console.log(`  ${key}: ${chalk.green(value)}`);
    });

    // Environment information
    console.log(chalk.blue('\n🌍 Environment Information:'));
    report.environment = {
      pwd: process.cwd(),
      home: os.homedir(),
      shell: process.env.SHELL || process.env.COMSPEC || 'unknown',
      path: process.env.PATH ? process.env.PATH.split(path.delimiter).slice(0, 3).join(path.delimiter) + '...' : 'unknown',
      nodeEnv: process.env.NODE_ENV || 'undefined',
      debugMode: process.env.DEBUG === 'true'
    };

    Object.entries(report.environment).forEach(([key, value]) => {
      console.log(`  ${key}: ${chalk.green(value)}`);
    });

    // Error handler report (if available)
    console.log(chalk.blue('\n📋 Error Handler Report:'));
    try {
      if (errorHandler && typeof errorHandler.printErrorReport === 'function') {
        await errorHandler.printErrorReport();
        console.log(chalk.green('  ✅ Error handler report generated'));
      } else {
        console.log(chalk.yellow('  ⚠️  Error handler not available'));
      }
    } catch (error) {
      console.log(chalk.red(`  ❌ Error handler failed: ${error.message}`));
      report.errors.push({
        type: 'error_handler',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // Check for common issues
    console.log(chalk.blue('\n🔍 Common Issues Check:'));

    const checks = [
      {
        name: 'Current directory writable',
        check: async () => {
          try {
            await fs.access(process.cwd(), fs.constants.W_OK);
            return true;
          } catch {
            return false;
          }
        }
      },
      {
        name: 'Home directory accessible',
        check: async () => {
          try {
            await fs.access(os.homedir(), fs.constants.R_OK);
            return true;
          } catch {
            return false;
          }
        }
      },
      {
        name: 'Node modules accessible',
        check: async () => {
          try {
            await fs.access(path.join(process.cwd(), 'node_modules'), fs.constants.R_OK);
            return true;
          } catch {
            return false;
          }
        }
      },
      {
        name: 'Package.json exists',
        check: async () => {
          try {
            await fs.access(path.join(process.cwd(), 'package.json'), fs.constants.R_OK);
            return true;
          } catch {
            return false;
          }
        }
      }
    ];

    for (const check of checks) {
      try {
        const passed = await check.check();
        const icon = passed ? chalk.green('✅') : chalk.red('❌');
        console.log(`  ${icon} ${check.name}`);

        if (!passed) {
          report.errors.push({
            type: 'common_issue',
            message: `${check.name} failed`,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        console.log(`  ${chalk.yellow('⚠️')} ${check.name} - Check failed`);
      }
    }

    // Log files check
    console.log(chalk.blue('\n📄 Log Files:'));
    const logLocations = [
      path.join(os.homedir(), '.stigmergy', 'logs'),
      path.join(process.cwd(), 'logs'),
      path.join(os.tmpdir(), 'stigmergy-logs')
    ];

    for (const logLocation of logLocations) {
      try {
        const stats = await fs.stat(logLocation);
        console.log(`  ${chalk.green('✅')} ${logLocation} (${stats.size} bytes)`);
      } catch {
        console.log(`  ${chalk.gray('⚪')} ${logLocation} (not found)`);
      }
    }

    // Summary
    console.log(chalk.blue('\n📊 Error Report Summary:'));
    const errorCount = report.errors.length;
    const warningCount = report.environment.debugMode ? 1 : 0;

    console.log(`  Errors: ${chalk.red(errorCount)}`);
    console.log(`  Warnings: ${chalk.yellow(warningCount)}`);

    if (errorCount === 0) {
      console.log(chalk.green('\n✅ No critical errors detected!'));
    } else {
      console.log(chalk.red(`\n❌ ${errorCount} issue(s) found - see details above`));
    }

    // Save report to file if requested
    if (options.save) {
      const reportPath = path.join(process.cwd(), `stigmergy-error-report-${Date.now()}.json`);
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(chalk.blue(`\n💾 Report saved to: ${reportPath}`));
    }

    return { success: true, report };
  } catch (error) {
    console.error(chalk.red('[ERROR] Failed to generate error report:'), error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  handleErrorsCommand
};