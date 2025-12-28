/**
 * System Commands
 * Modular implementation for clean, diagnostic, and other system commands
 */

const chalk = require('chalk');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * Handle diagnostic command
 * @param {Object} options - Command options
 */
async function handleDiagnosticCommand(options = {}) {
  try {
    console.log(chalk.cyan('[DIAGNOSTIC] Stigmergy CLI System Diagnostic...\n'));

    const results = {
      system: {},
      directories: {},
      files: {},
      permissions: {},
      summary: { issues: 0, warnings: 0, ok: 0 }
    };

    // System information
    console.log(chalk.blue('🖥️  System Information:'));
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      memory: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
      freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB',
      homeDir: os.homedir(),
      currentDir: process.cwd()
    };

    results.system = systemInfo;
    Object.entries(systemInfo).forEach(([key, value]) => {
      console.log(`  ${key}: ${chalk.green(value)}`);
    });

    // Directory checks
    console.log(chalk.blue('\n📁 Directory Structure:'));
    const directories = [
      path.join(os.homedir(), '.stigmergy'),
      path.join(os.homedir(), '.claude'),
      path.join(os.homedir(), '.gemini'),
      path.join(os.homedir(), '.qwen'),
      path.join(process.cwd(), 'node_modules')
    ];

    for (const dir of directories) {
      try {
        const stats = await fs.stat(dir);
        results.directories[dir] = { exists: true, size: stats.size };
        console.log(`  ${chalk.green('✅')} ${dir}`);
        results.summary.ok++;
      } catch (error) {
        results.directories[dir] = { exists: false, error: error.code };
        console.log(`  ${chalk.yellow('⚠️')} ${dir} (${error.code})`);
        results.summary.warnings++;
      }
    }

    // Permission checks
    console.log(chalk.blue('\n🔐 Permission Checks:'));
    try {
      await fs.access(process.cwd(), fs.constants.W_OK);
      console.log(`  ${chalk.green('✅')} Current directory writable`);
      results.permissions.currentDir = true;
      results.summary.ok++;
    } catch (error) {
      console.log(`  ${chalk.red('❌')} Current directory not writable`);
      results.permissions.currentDir = false;
      results.summary.issues++;
    }

    try {
      await fs.access(os.homedir(), fs.constants.W_OK);
      console.log(`  ${chalk.green('✅')} Home directory writable`);
      results.permissions.homeDir = true;
      results.summary.ok++;
    } catch (error) {
      console.log(`  ${chalk.red('❌')} Home directory not writable`);
      results.permissions.homeDir = false;
      results.summary.issues++;
    }

    // Summary
    console.log(chalk.blue('\n📊 Diagnostic Summary:'));
    console.log(`  Issues: ${chalk.red(results.summary.issues)}`);
    console.log(`  Warnings: ${chalk.yellow(results.summary.warnings)}`);
    console.log(`  OK: ${chalk.green(results.summary.ok)}`);

    if (results.summary.issues > 0) {
      console.log(chalk.red('\n❌ Critical issues found - Fix recommended'));
      console.log('Run: stigmergy fix-perms');
    } else if (results.summary.warnings > 0) {
      console.log(chalk.yellow('\n⚠️  Some warnings found - Check recommended'));
    } else {
      console.log(chalk.green('\n✅ System looks healthy!'));
    }

    return { success: true, results };
  } catch (error) {
    console.error(chalk.red('[ERROR] Diagnostic failed:'), error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Handle clean command
 * @param {Object} options - Command options
 */
async function handleCleanCommand(options = {}) {
  try {
    console.log(chalk.cyan('[CLEAN] Starting intelligent cache cleaning...\n'));

    const stats = {
      found: 0,
      cleaned: 0,
      skipped: 0,
      totalSize: 0,
      cleanedSize: 0,
      errors: []
    };

    // Define cleanup targets with priority and safety levels
    const cleanupTargets = [
      // Priority 1: Always safe to clean
      {
        path: path.join(os.tmpdir(), 'stigmergy-*'),
        priority: 1,
        safe: true,
        description: 'Stigmergy temporary files'
      },
      {
        path: path.join(os.homedir(), '.stigmergy', 'cache'),
        priority: 1,
        safe: true,
        description: 'Stigmergy cache'
      },

      // Priority 2: Generally safe (user data)
      {
        path: path.join(process.cwd(), 'node_modules', '.cache'),
        priority: 2,
        safe: true,
        description: 'Project cache'
      },

      // Priority 3: CLI tool caches (may have permission issues)
      {
        path: path.join(os.homedir(), '.claude', 'cache'),
        priority: 3,
        safe: false,
        description: 'Claude CLI cache'
      },
      {
        path: path.join(os.homedir(), '.gemini', 'cache'),
        priority: 3,
        safe: false,
        description: 'Gemini CLI cache'
      },
      {
        path: path.join(os.homedir(), '.qwen', 'cache'),
        priority: 3,
        safe: false,
        description: 'Qwen CLI cache'
      }
    ];

    // Sort by priority
    cleanupTargets.sort((a, b) => a.priority - b.priority);

    console.log(chalk.blue('🔍 Scanning cleanup targets...'));

    for (const target of cleanupTargets) {
      try {
        const isPattern = target.path.includes('*');
        let targetPaths = [];

        if (isPattern) {
          // Simple glob pattern handling
          const baseDir = path.dirname(target.path);
          const pattern = path.basename(target.path).replace('*', '');
          try {
            const files = await fs.readdir(baseDir);
            targetPaths = files
              .filter(file => file.includes(pattern))
              .map(file => path.join(baseDir, file));
          } catch (error) {
            // Directory doesn't exist, skip silently
            continue;
          }
        } else {
          targetPaths = [target.path];
        }

        for (const targetPath of targetPaths) {
          try {
            const targetStats = await fs.stat(targetPath);
            stats.found++;
            stats.totalSize += targetStats.size;

            if (!options.dryRun) {
              // Attempt to clean with better error handling
              try {
                if (targetStats.isDirectory()) {
                  await fs.rmdir(targetPath, { recursive: true });
                } else {
                  await fs.unlink(targetPath);
                }
                stats.cleaned++;
                stats.cleanedSize += targetStats.size;

                // Only show successful cleanups in normal mode
                if (!options.quiet) {
                  console.log(`  ${chalk.green('✅')} Cleaned ${target.description}`);
                }
              } catch (cleanError) {
                // Silent failure for permission issues
                stats.skipped++;
                stats.errors.push({
                  path: targetPath,
                  error: cleanError.code,
                  safe: target.safe
                });
              }
            } else {
              // Dry run mode
              console.log(`  ${chalk.blue('🔍')} Would clean: ${target.description} (${Math.round(targetStats.size / 1024)} KB)`);
            }
          } catch (statError) {
            // File might be locked or in use
            stats.skipped++;
          }
        }
      } catch (error) {
        // Silently skip inaccessible targets
        stats.skipped++;
      }
    }

    // Show summary with user-friendly output
    console.log(chalk.blue('\n📊 Cleanup Results:'));

    if (stats.cleaned > 0) {
      console.log(`  ${chalk.green('✅')} Cleaned: ${stats.cleaned} items (${Math.round(stats.cleanedSize / 1024)} KB)`);
    }

    if (stats.skipped > 0) {
      console.log(`  ${chalk.yellow('⚠️')}  Skipped: ${stats.skipped} items (in use or permission protected)`);
    }

    // Show critical errors only (safe targets that failed)
    const criticalErrors = stats.errors.filter(e => e.safe && e.error === 'EPERM');
    if (criticalErrors.length > 0 && options.verbose) {
      console.log(`  ${chalk.red('❌')} Permission issues on ${criticalErrors.length} safe targets`);
    }

    // Final user-friendly message
    if (!options.dryRun) {
      if (stats.cleaned > 0) {
        console.log(chalk.green('\n✅ Cache cleanup completed successfully!'));
      } else {
        console.log(chalk.yellow('\n💡 No cache files were available for cleaning'));
      }

      if (stats.skipped > 0 && stats.cleaned === 0) {
        console.log(chalk.gray('   Some files were in use or require admin permissions'));
      }
    } else {
      console.log(chalk.blue('\n💡 Dry run completed. Run without --dry-run to actually clean.'));
    }

    return {
      success: true,
      stats: {
        cleaned: stats.cleaned,
        skipped: stats.skipped,
        totalSize: Math.round(stats.totalSize / 1024),
        cleanedSize: Math.round(stats.cleanedSize / 1024)
      }
    };

  } catch (error) {
    // Show only critical errors to user
    if (options.verbose) {
      console.error(chalk.red('[ERROR] Cache cleaning failed:'), error.message);
    }
    return { success: false, error: error.message };
  }
}

module.exports = {
  handleDiagnosticCommand,
  handleCleanCommand
};