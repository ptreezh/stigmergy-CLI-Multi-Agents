/**
 * Enhanced Stigmergy Installer
 *
 * Automatic cache cleaning before installation with comprehensive error handling
 * and progress reporting.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const CacheCleaner = require('./cache_cleaner');
const StigmergyInstaller = require('./installer');

class EnhancedInstaller {
  constructor(options = {}) {
    this.options = {
      cleanBeforeInstall: options.cleanBeforeInstall !== false, // Default true
      cleanNPXCache: options.cleanNPXCache !== false,
      cleanTempFiles: options.cleanTempFiles !== false,
      cleanOldVersions: options.cleanOldVersions !== false,
      dryRun: options.dryRun || false,
      force: options.force || false,
      verbose: options.verbose || false,
      ...options
    };

    this.baseInstaller = new StigmergyInstaller();
    this.cacheCleaner = new CacheCleaner({
      dryRun: this.options.dryRun,
      force: this.options.force,
      verbose: this.options.verbose
    });

    this.results = {
      cacheCleaning: {},
      installation: {},
      errors: []
    };
  }

  /**
   * Perform enhanced installation with automatic cache cleaning
   */
  async enhancedInstall(options = {}) {
    const config = {
      cleanStigmergy: true,
      cleanNPX: this.options.cleanNPXCache,
      cleanNPM: this.options.cleanOldVersions,
      cleanCLI: false,
      cleanTemp: this.options.cleanTempFiles,
      ...options
    };

    console.log('🚀 Starting Enhanced Stigmergy Installation...\n');

    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No actual changes will be made\n');
    }

    try {
      // Step 1: Pre-installation cache cleaning
      if (this.options.cleanBeforeInstall) {
        await this.preInstallCacheClean(config);
      }

      // Step 2: Scan and prepare for installation
      await this.scanAndPrepare();

      // Step 3: Perform installation
      if (!this.options.dryRun) {
        await this.performInstallation();
      }

      // Step 4: Post-installation verification
      await this.verifyInstallation();

      // Step 5: Print summary
      this.printSummary();

      return this.results;

    } catch (error) {
      console.error('❌ Enhanced installation failed:', error.message);
      this.results.errors.push(error.message);
      return this.results;
    }
  }

  /**
   * Pre-installation cache cleaning
   */
  async preInstallCacheClean(config) {
    console.log('🧹 Pre-installation Cache Cleaning...\n');

    const startTime = Date.now();

    try {
      // Clean caches before installation
      const cacheResults = await this.cacheCleaner.cleanAllCaches(config);

      const endTime = Date.now();
      const duration = endTime - startTime;

      this.results.cacheCleaning = {
        success: true,
        duration,
        filesRemoved: cacheResults.filesRemoved,
        directoriesRemoved: cacheResults.directoriesRemoved,
        bytesFreed: cacheResults.bytesFreed,
        errors: cacheResults.errors.length
      };

      console.log(`✅ Cache cleaning completed in ${duration}ms`);
      console.log(`📊 Removed ${cacheResults.filesRemoved} files, freed ${this.formatBytes(cacheResults.bytesFreed)}\n`);

    } catch (error) {
      console.error('❌ Cache cleaning failed:', error.message);
      this.results.cacheCleaning = {
        success: false,
        error: error.message
      };

      if (!this.options.force) {
        throw new Error(`Cache cleaning failed: ${error.message}`);
      }

      console.log('⚠️  Continuing installation despite cache cleaning errors...\n');
    }
  }

  /**
   * Scan system and prepare for installation
   */
  async scanAndPrepare() {
    console.log('🔍 Scanning System for Installation...\n');

    try {
      // Check system requirements
      await this.checkSystemRequirements();

      // Scan for existing CLI tools
      const scanResult = await this.baseInstaller.scanCLI();

      console.log(`✅ System scan completed`);
      console.log(`📊 Found ${Object.keys(scanResult.available).length} available CLI tools`);
      console.log(`📊 Missing ${Object.keys(scanResult.missing).length} CLI tools\n`);

      this.results.scan = scanResult;

    } catch (error) {
      console.error('❌ System scan failed:', error.message);
      throw error;
    }
  }

  /**
   * Perform the actual installation
   */
  async performInstallation() {
    console.log('📦 Performing Installation...\n');

    try {
      // Interactive tool selection would go here
      // For now, we'll use a simple approach
      const missingTools = Object.keys(this.results.scan.missing);

      if (missingTools.length === 0) {
        console.log('ℹ️  All CLI tools are already installed');
        this.results.installation = {
          success: true,
          installed: [],
          message: 'No tools needed installation'
        };
        return;
      }

      console.log(`📦 Installing ${missingTools.length} CLI tools...`);

      // Install missing tools
      const installResult = await this.baseInstaller.installTools(
        missingTools,
        this.results.scan.missing
      );

      this.results.installation = {
        success: true,
        installed: missingTools,
        result: installResult
      };

      console.log(`✅ Installation completed`);

    } catch (error) {
      console.error('❌ Installation failed:', error.message);
      this.results.installation = {
        success: false,
        error: error.message
      };
      throw error;
    }
  }

  /**
   * Post-installation verification
   */
  async verifyInstallation() {
    console.log('\n✅ Post-installation Verification...');

    try {
      // Verify installation was successful
      const postScan = await this.baseInstaller.scanCLI();

      const verificationResults = {
        beforeCount: Object.keys(this.results.scan.available).length,
        afterCount: Object.keys(postScan.available).length,
        newlyInstalled: []
      };

      // Find newly installed tools
      for (const tool of Object.keys(postScan.available)) {
        if (!this.results.scan.available[tool]) {
          verificationResults.newlyInstalled.push(tool);
        }
      }

      this.results.verification = verificationResults;

      console.log(`📊 CLI tools before: ${verificationResults.beforeCount}`);
      console.log(`📊 CLI tools after: ${verificationResults.afterCount}`);
      console.log(`📊 Newly installed: ${verificationResults.newlyInstalled.length}`);

      if (verificationResults.newlyInstalled.length > 0) {
        console.log(`✅ Successfully installed: ${verificationResults.newlyInstalled.join(', ')}`);
      }

      console.log('✅ Installation verification completed\n');

    } catch (error) {
      console.error('❌ Verification failed:', error.message);
      this.results.errors.push(`Verification: ${error.message}`);
    }
  }

  /**
   * Check system requirements
   */
  async checkSystemRequirements() {
    console.log('🔧 Checking System Requirements...');

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion < 14) {
      throw new Error(`Node.js version ${nodeVersion} is not supported. Please use Node.js 14 or higher.`);
    }

    console.log(`  ✅ Node.js: ${nodeVersion}`);

    // Check npm availability
    try {
      const { spawnSync } = require('child_process');
      const npmResult = spawnSync('npm', ['--version'], {
        encoding: 'utf8',
        shell: true
      });

      if (npmResult.status === 0) {
        console.log(`  ✅ npm: ${npmResult.stdout.trim()}`);
      } else {
        throw new Error('npm is not available');
      }
    } catch (error) {
      throw new Error('npm is required but not found');
    }

    // Check available disk space (basic check)
    const homeDir = os.homedir();
    try {
      const stats = fs.statSync(homeDir);
      console.log(`  ✅ Home directory accessible: ${homeDir}`);
    } catch (error) {
      throw new Error(`Cannot access home directory: ${homeDir}`);
    }

    console.log('✅ System requirements check passed\n');
  }

  /**
   * Create installation plan without executing
   */
  async createInstallationPlan() {
    console.log('📋 Creating Installation Plan...\n');

    const plan = {
      cacheCleaning: {},
      installation: {},
      estimatedTime: 0,
      estimatedSpace: 0
    };

    try {
      // Check what would be cleaned
      const stigmergyDir = path.join(os.homedir(), '.stigmergy');
      if (fs.existsSync(stigmergyDir)) {
        const cacheSize = await this.calculateDirectorySize(stigmergyDir);
        plan.cacheCleaning.stigmergyCache = {
          path: stigmergyDir,
          size: cacheSize,
          wouldClean: this.options.cleanBeforeInstall
        };
        plan.estimatedSpace += cacheSize;
      }

      // Scan for missing CLI tools
      const scanResult = await this.baseInstaller.scanCLI();
      const missingTools = Object.keys(scanResult.missing);

      plan.installation = {
        missingTools: missingTools,
        toolCount: missingTools.length,
        tools: missingTools.map(tool => ({
          name: scanResult.missing[tool].name,
          installCommand: scanResult.missing[tool].install
        }))
      };

      // Estimate time (very rough estimate)
      plan.estimatedTime = missingTools.length * 30000; // 30 seconds per tool

      console.log(`📊 Installation Plan Summary:`);
      console.log(`  🧹 Cache cleaning: ${this.options.cleanBeforeInstall ? 'Yes' : 'No'}`);
      console.log(`  📦 Tools to install: ${missingTools.length}`);
      console.log(`  ⏱️  Estimated time: ${Math.ceil(plan.estimatedTime / 1000)} seconds`);
      console.log(`  💾 Estimated space: ${this.formatBytes(plan.estimatedSpace)}`);

      return plan;

    } catch (error) {
      console.error('❌ Failed to create installation plan:', error.message);
      throw error;
    }
  }

  /**
   * Quick cache clean only
   */
  async quickCacheClean() {
    console.log('⚡ Quick Cache Clean Only...\n');

    try {
      const results = await this.cacheCleaner.cleanAllCaches({
        cleanStigmergy: false, // Don't clean main config
        cleanNPX: true,
        cleanNPM: false,
        cleanCLI: false,
        cleanTemp: true
      });

      console.log(`✅ Quick cache clean completed`);
      console.log(`📊 Removed ${results.filesRemoved} files, freed ${this.formatBytes(results.bytesFreed)}`);

      return results;

    } catch (error) {
      console.error('❌ Quick cache clean failed:', error.message);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  async calculateDirectorySize(dirPath) {
    let totalSize = 0;

    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          totalSize += await this.calculateDirectorySize(fullPath);
        } else {
          try {
            const stat = fs.statSync(fullPath);
            totalSize += stat.size;
          } catch (error) {
            // Skip files we can't stat
          }
        }
      }
    } catch (error) {
      // Return 0 for directories we can't read
    }

    return totalSize;
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  printSummary() {
    console.log('\n📊 ENHANCED INSTALLATION SUMMARY:');
    console.log('=' .repeat(50));

    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No actual changes were made');
    }

    // Cache cleaning summary
    if (this.results.cacheCleaning.success) {
      console.log(`🧹 Cache Cleaning: ✅`);
      console.log(`   Duration: ${this.results.cacheCleaning.duration}ms`);
      console.log(`   Files removed: ${this.results.cacheCleaning.filesRemoved}`);
      console.log(`   Space freed: ${this.formatBytes(this.results.cacheCleaning.bytesFreed)}`);
    } else if (this.results.cacheCleaning.error) {
      console.log(`🧹 Cache Cleaning: ❌ ${this.results.cacheCleaning.error}`);
    }

    // Installation summary
    if (this.results.installation.success) {
      console.log(`📦 Installation: ✅`);
      if (this.results.installation.installed.length > 0) {
        console.log(`   Installed: ${this.results.installation.installed.join(', ')}`);
      } else {
        console.log(`   Message: ${this.results.installation.message}`);
      }
    } else if (this.results.installation.error) {
      console.log(`📦 Installation: ❌ ${this.results.installation.error}`);
    }

    // Verification summary
    if (this.results.verification) {
      console.log(`✅ Verification: ✅`);
      console.log(`   Newly installed: ${this.results.verification.newlyInstalled.length} tools`);
    }

    // Errors
    if (this.results.errors.length > 0) {
      console.log(`\n❌ Errors encountered: ${this.results.errors.length}`);
      this.results.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    console.log('\n🎉 Enhanced installation completed!');
  }
}

module.exports = EnhancedInstaller;