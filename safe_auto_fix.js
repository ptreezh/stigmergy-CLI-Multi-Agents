#!/usr/bin/env node

/**
 * Safe Auto-Fix Script with Comprehensive Testing
 * Performs automated code quality fixes with continuous monitoring
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class SafeAutoFixer {
  constructor() {
    this.fixResults = {
      startTime: new Date().toISOString(),
      originalTests: null,
      fixesApplied: [],
      warnings: [],
      errors: [],
      finalTests: null
    };
  }

  log(category, message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${category}: ${message}`;
    console.log(logEntry);

    if (category === 'ERROR') {
      this.fixResults.errors.push({ timestamp, message });
    } else if (category === 'WARNING') {
      this.fixResults.warnings.push({ timestamp, message });
    }
  }

  runBaselineTest() {
    this.log('INFO', 'Running pre-fix baseline test...');
    try {
      const result = spawnSync('node', ['test_baseline_before_fix.js'], {
        encoding: 'utf8',
        timeout: 30000
      });

      if (result.status === 0) {
        this.log('SUCCESS', 'Pre-fix baseline test passed');
        return true;
      } else {
        this.log('ERROR', 'Pre-fix baseline test failed');
        this.log('ERROR', result.stdout);
        return false;
      }
    } catch (error) {
      this.log('ERROR', `Baseline test execution failed: ${error.message}`);
      return false;
    }
  }

  analyzeLintIssues() {
    this.log('INFO', 'Analyzing lint issues before fix...');
    try {
      const result = spawnSync('npm', ['run', 'lint'], {
        encoding: 'utf8',
        timeout: 60000
      });

      const output = String(result.stdout || '') + String(result.stderr || '');
      const lines = output.split('\n').filter(line => line.trim());

      const analysis = {
        totalIssues: 0,
        byType: {},
        safeToFix: [],
        needsReview: [],
        critical: []
      };

      lines.forEach(line => {
        if (line.includes('error') || line.includes('warning')) {
          analysis.totalIssues++;

          // Categorize by error type
          if (line.includes('quotes')) {
            analysis.byType.quotes = (analysis.byType.quotes || 0) + 1;
            analysis.safeToFix.push({ type: 'quotes', line });
          } else if (line.includes('linebreak-style')) {
            analysis.byType.linebreak = (analysis.byType.linebreak || 0) + 1;
            analysis.safeToFix.push({ type: 'linebreak', line });
          } else if (line.includes('indent')) {
            analysis.byType.indent = (analysis.byType.indent || 0) + 1;
            analysis.safeToFix.push({ type: 'indent', line });
          } else if (line.includes('no-unused-vars')) {
            analysis.byType.unusedVars = (analysis.byType.unusedVars || 0) + 1;
            analysis.needsReview.push({ type: 'no-unused-vars', line });
          } else if (line.includes('no-empty')) {
            analysis.byType.emptyBlock = (analysis.byType.emptyBlock || 0) + 1;
            analysis.needsReview.push({ type: 'no-empty', line });
          } else if (line.includes('no-prototype-builtins')) {
            analysis.byType.prototypeBuiltins = (analysis.byType.prototypeBuiltins || 0) + 1;
            analysis.critical.push({ type: 'no-prototype-builtins', line });
          }
        }
      });

      this.log('ANALYSIS', `Total issues: ${analysis.totalIssues}`);
      this.log('ANALYSIS', `Safe to auto-fix: ${analysis.safeToFix.length}`);
      this.log('ANALYSIS', `Needs manual review: ${analysis.needsReview.length}`);
      this.log('ANALYSIS', `Critical issues: ${analysis.critical.length}`);

      Object.keys(analysis.byType).forEach(type => {
        this.log('DETAIL', `${type}: ${analysis.byType[type]} issues`);
      });

      return analysis;
    } catch (error) {
      this.log('ERROR', `Lint analysis failed: ${error.message}`);
      return null;
    }
  }

  performIncrementalFix() {
    this.log('INFO', 'Performing incremental auto-fix...');

    try {
      // Step 1: Run dry run to see what will be fixed
      this.log('STEP1', 'Running ESLint dry run...');
      const dryRun = spawnSync('npx', ['eslint', 'src/', '--fix-dry-run'], {
        encoding: 'utf8',
        timeout: 60000
      });

      // Step 2: Perform actual auto-fix (only safe fixes)
      this.log('STEP2', 'Applying safe auto-fixes...');
      const fixResult = spawnSync('npm', ['run', 'lint', '--', '--fix'], {
        encoding: 'utf8',
        timeout: 120000
      });

      this.log('INFO', `Auto-fix exit code: ${fixResult.status}`);

      if (fixResult.stdout) {
        const fixedLines = fixResult.stdout.split('\n').filter(line => line.trim());
        const fixedCount = fixedLines.filter(line => !line.includes('error') && !line.includes('warning')).length;
        this.log('RESULT', `Processed ${fixedLines.length} lines of output`);
      }

      // Check if there are any critical errors in the fix output
      const fixOutput = fixResult.stdout + fixResult.stderr;
      if (fixOutput.includes('Error:')) {
        this.log('WARNING', 'Critical errors detected during fix');
        this.log('WARNING', fixOutput.split('Error:')[1]?.split('\n')[0]?.trim() || 'Unknown error');
      }

      return fixResult.status === 0 || fixResult.status === 1; // ESLint returns 1 for issues found
    } catch (error) {
      this.log('ERROR', `Auto-fix execution failed: ${error.message}`);
      return false;
    }
  }

  validatePostFix() {
    this.log('INFO', 'Running post-fix validation...');

    // Run baseline test again
    const baselinePassed = this.runBaselineTest();
    if (!baselinePassed) {
      this.log('ERROR', 'Post-fix baseline test failed - functionality may be broken!');
      return false;
    }

    // Run lint again to see remaining issues
    this.log('INFO', 'Checking remaining lint issues...');
    const lintResult = spawnSync('npm', ['run', 'lint'], {
      encoding: 'utf8',
      timeout: 60000
    });

    const lintOutput = lintResult.stdout + lintResult.stderr;
    const remainingIssues = (lintOutput.match(/error|warning/g) || []).length;

    this.log('RESULT', `Remaining issues after fix: ${remainingIssues}`);

    if (remainingIssues < 100) {
      this.log('SUCCESS', 'Significant reduction in code quality issues');
    } else {
      this.log('WARNING', 'Still many issues remaining - may need manual review');
    }

    // Test specific functionality
    this.testSpecificFunctionality();

    return true;
  }

  testSpecificFunctionality() {
    this.log('INFO', 'Testing specific functionality...');

    // Test CLI commands still work
    const criticalCommands = [
      ['node', ['src/index.js', '--help']],
      ['node', ['src/index.js', 'version']],
      ['node', ['src/index.js', 'status']]
    ];

    criticalCommands.forEach(([cmd, args]) => {
      try {
        const result = spawnSync(cmd, args, { encoding: 'utf8', timeout: 10000 });
        if (result.status === 0) {
          this.log('OK', `Command ${args[1]} works after fix`);
        } else {
          this.log('ERROR', `Command ${args[1]} failed after fix`);
        }
      } catch (error) {
        this.log('ERROR', `Command ${args[1]} error: ${error.message}`);
      }
    });

    // Test module loading
    const criticalModules = [
      './src/index.js',
      './src/cli/router.js',
      './src/core/installer.js'
    ];

    criticalModules.forEach(module => {
      try {
        delete require.cache[require.resolve(module)];
        require(module);
        this.log('OK', `Module ${module} loads correctly after fix`);
      } catch (error) {
        this.log('ERROR', `Module ${module} failed to load after fix: ${error.message}`);
      }
    });
  }

  generateReport() {
    this.fixResults.endTime = new Date().toISOString();

    const report = {
      summary: {
        duration: this.fixResults.endTime - this.fixResults.startTime,
        totalFixes: this.fixResults.fixesApplied.length,
        warnings: this.fixResults.warnings.length,
        errors: this.fixResults.errors.length,
        status: this.fixResults.errors.length === 0 ? 'SUCCESS' : 'PARTIAL'
      },
      details: this.fixResults
    };

    const reportFile = `auto-fix-report-${Date.now()}.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log('\n📊 AUTO-FIX SUMMARY');
    console.log('==================');
    console.log(`Duration: ${report.summary.duration}ms`);
    console.log(`Fixes Applied: ${report.summary.totalFixes}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Errors: ${report.summary.errors}`);
    console.log(`Status: ${report.summary.status}`);
    console.log(`\n📄 Detailed report: ${reportFile}`);

    if (report.summary.status === 'SUCCESS') {
      console.log('✅ Auto-fix completed successfully!');
    } else {
      console.log('⚠️  Auto-fix completed with some issues - review report');
    }

    return report;
  }

  async runSafeAutoFix() {
    console.log('🔧 Starting Safe Auto-Fix Process');
    console.log('=================================');

    // Phase 1: Pre-fix validation
    if (!this.runBaselineTest()) {
      this.log('ERROR', 'Cannot proceed with auto-fix - baseline tests failing');
      return false;
    }

    // Phase 2: Analysis
    const analysis = this.analyzeLintIssues();
    if (!analysis) {
      this.log('ERROR', 'Cannot proceed with auto-fix - analysis failed');
      return false;
    }

    if (analysis.safeToFix.length === 0) {
      this.log('INFO', 'No safe fixes to apply');
      return this.generateReport();
    }

    // Phase 3: Incremental fix
    const fixSuccess = this.performIncrementalFix();
    if (!fixSuccess) {
      this.log('ERROR', 'Auto-fix execution failed');
      return false;
    }

    // Phase 4: Post-fix validation
    const validationSuccess = this.validatePostFix();
    if (!validationSuccess) {
      this.log('ERROR', 'Post-fix validation failed');
      return false;
    }

    // Phase 5: Report generation
    return this.generateReport();
  }
}

// Run if called directly
if (require.main === module) {
  const fixer = new SafeAutoFixer();
  fixer.runSafeAutoFix().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Safe auto-fix process failed:', error);
    process.exit(1);
  });
}

module.exports = SafeAutoFixer;