/**
 * Enhanced Stigmergy Uninstaller
 *
 * Comprehensive uninstallation with complete cleanup of all Stigmergy-related files,
 * configurations, caches, and integrations across all supported CLI tools.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

class EnhancedUninstaller {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      force: options.force || false,
      verbose: options.verbose || false,
      preserveUserConfigs: options.preserveUserConfigs || false,
      ...options,
    };

    this.homeDir = os.homedir();
    this.stigmergyDir = path.join(this.homeDir, '.stigmergy');
    this.stigmergyTestDir = path.join(this.homeDir, '.stigmergy-test');

    this.supportedCLIs = [
      'claude',
      'gemini',
      'qwen',
      'iflow',
      'qodercli',
      'codebuddy',
      'codex',
      'copilot',
      'qwencode',
    ];

    this.results = {
      filesRemoved: 0,
      directoriesRemoved: 0,
      errors: [],
      skipped: [],
    };
  }

  /**
   * Perform complete uninstallation
   */
  async completeUninstall() {
    console.log('ðŸ—‘ï¸? Starting Enhanced Stigmergy Uninstall...\n');

    if (this.options.dryRun) {
      console.log('ðŸ” DRY RUN MODE - No files will be deleted\n');
    }

    try {
      // 1. Clean Stigmergy main directory
      await this.cleanStigmergyDirectory();

      // 2. Clean test directory
      await this.cleanTestDirectory();

      // 3. Clean CLI configurations
      await this.cleanCLIConfigurations();

      // 4. Clean NPX cache
      await this.cleanNPXCache();

      // 5. Clean temporary files
      await this.cleanTemporaryFiles();

      // 6. Uninstall global packages (if requested)
      if (this.options.uninstallGlobal) {
        await this.uninstallGlobalPackages();
      }

      // 7. Print summary
      this.printSummary();

      return this.results;
    } catch (error) {
      console.error('â?Uninstall failed:', error.message);
      this.results.errors.push(error.message);
      return this.results;
    }
  }

  /**
   * Create uninstall plan without executing
   */
  async createUninstallPlan() {
    console.log('ðŸ“‹ Creating Uninstall Plan...\n');

    const plan = {
      directories: [],
      files: [],
      globalPackages: [],
      cliConfigurations: [],
      estimatedSize: 0,
    };

    // Scan Stigmergy directory
    if (fs.existsSync(this.stigmergyDir)) {
      await this.scanDirectory(this.stigmergyDir, plan);
    }

    // Scan test directory
    if (fs.existsSync(this.stigmergyTestDir)) {
      await this.scanDirectory(this.stigmergyTestDir, plan);
    }

    // Scan CLI configurations
    for (const cli of this.supportedCLIs) {
      const cliConfig = path.join(this.homeDir, `.${cli}`);
      if (fs.existsSync(cliConfig)) {
        const stigmergyFiles = await this.findStigmergyFiles(cliConfig);
        plan.cliConfigurations.push({
          cli,
          files: stigmergyFiles,
        });
      }
    }

    // Calculate estimated size
    plan.estimatedSize = await this.calculateDirectorySize([
      this.stigmergyDir,
      this.stigmergyTestDir,
      ...plan.cliConfigurations.flatMap((c) => c.files),
    ]);

    return plan;
  }

  /**
   * Clean Stigmergy main directory
   */
  async cleanStigmergyDirectory() {
    console.log('ðŸ“ Cleaning Stigmergy directory...');

    if (!fs.existsSync(this.stigmergyDir)) {
      console.log('  â„¹ï¸  Stigmergy directory not found');
      return;
    }

    const files = await this.getAllFiles(this.stigmergyDir);

    if (this.options.dryRun) {
      console.log(`  ðŸ” Would remove ${files.length} files and directories`);
      this.logFiles(files, '  ');
      return;
    }

    try {
      await this.removeDirectory(this.stigmergyDir);
      console.log(`  âœ?Removed ${files.length} files and directories`);
      this.results.filesRemoved += files.length;
      this.results.directoriesRemoved++;
    } catch (error) {
      console.error(
        `  â?Failed to remove Stigmergy directory: ${error.message}`,
      );
      this.results.errors.push(`Stigmergy directory: ${error.message}`);
    }
  }

  /**
   * Clean test directory
   */
  async cleanTestDirectory() {
    console.log('ðŸ§ª Cleaning test directory...');

    if (!fs.existsSync(this.stigmergyTestDir)) {
      console.log('  â„¹ï¸  Test directory not found');
      return;
    }

    if (this.options.dryRun) {
      console.log('  ðŸ” Would remove test directory');
      return;
    }

    try {
      await this.removeDirectory(this.stigmergyTestDir);
      console.log('  âœ?Removed test directory');
      this.results.directoriesRemoved++;
    } catch (error) {
      console.error(`  â?Failed to remove test directory: ${error.message}`);
      this.results.errors.push(`Test directory: ${error.message}`);
    }
  }

  /**
   * Clean CLI configurations
   */
  async cleanCLIConfigurations() {
    console.log('âš™ï¸  Cleaning CLI configurations...');

    let totalCleaned = 0;

    for (const cli of this.supportedCLIs) {
      const cliConfig = path.join(this.homeDir, `.${cli}`);

      if (!fs.existsSync(cliConfig)) {
        continue;
      }

      const stigmergyFiles = await this.findStigmergyFiles(cliConfig);

      if (stigmergyFiles.length === 0) {
        continue;
      }

      console.log(`  ðŸ“‚ ${cli}: ${stigmergyFiles.length} Stigmergy files`);

      if (this.options.dryRun) {
        this.logFiles(stigmergyFiles, '    ðŸ” ');
        continue;
      }

      try {
        for (const file of stigmergyFiles) {
          await this.removeFile(file);
          totalCleaned++;
        }
        console.log(`    âœ?Cleaned ${stigmergyFiles.length} files`);
      } catch (error) {
        console.error(`    â?Failed to clean ${cli}: ${error.message}`);
        this.results.errors.push(`${cli} config: ${error.message}`);
      }
    }

    if (!this.options.dryRun && totalCleaned > 0) {
      console.log(`  âœ?Cleaned ${totalCleaned} CLI configuration files`);
      this.results.filesRemoved += totalCleaned;
    }
  }

  /**
   * Clean NPX cache
   */
  async cleanNPXCache() {
    console.log('ðŸ“¦ Cleaning NPX cache...');

    const npxCacheDirs = await this.findNPXCacheDirectories();

    if (npxCacheDirs.length === 0) {
      console.log('  â„¹ï¸  No Stigmergy entries in NPX cache');
      return;
    }

    console.log(
      `  ðŸ“¦ Found ${npxCacheDirs.length} Stigmergy entries in NPX cache`,
    );

    if (this.options.dryRun) {
      this.logFiles(npxCacheDirs, '  ðŸ” ');
      return;
    }

    let removed = 0;
    for (const cacheDir of npxCacheDirs) {
      try {
        await this.removeDirectory(cacheDir);
        removed++;
      } catch (error) {
        console.error(`    â?Failed to remove ${cacheDir}: ${error.message}`);
        this.results.errors.push(`NPX cache: ${error.message}`);
      }
    }

    if (removed > 0) {
      console.log(`  âœ?Removed ${removed} NPX cache entries`);
      this.results.directoriesRemoved += removed;
    }
  }

  /**
   * Clean temporary files
   */
  async cleanTemporaryFiles() {
    console.log('ðŸ—‘ï¸? Cleaning temporary files...');

    const tempDirs = [
      path.join(os.tmpdir()),
      path.join(this.homeDir, 'AppData', 'Local', 'Temp'),
    ];

    let totalRemoved = 0;

    for (const tempDir of tempDirs) {
      if (!fs.existsSync(tempDir)) {
        continue;
      }

      try {
        const tempFiles = await this.findStigmergyTempFiles(tempDir);

        if (this.options.dryRun) {
          console.log(`  ðŸ” ${tempDir}: ${tempFiles.length} temporary files`);
          continue;
        }

        for (const file of tempFiles) {
          await this.removeFile(file);
          totalRemoved++;
        }

        if (tempFiles.length > 0) {
          console.log(
            `  âœ?${path.basename(tempDir)}: removed ${tempFiles.length} files`,
          );
        }
      } catch (error) {
        console.error(`  â?Failed to clean ${tempDir}: ${error.message}`);
        this.results.errors.push(`Temp files: ${error.message}`);
      }
    }

    if (!this.options.dryRun && totalRemoved > 0) {
      console.log(`  âœ?Removed ${totalRemoved} temporary files`);
      this.results.filesRemoved += totalRemoved;
    }
  }

  /**
   * Uninstall global packages
   */
  async uninstallGlobalPackages() {
    console.log('ðŸŒ Uninstalling global packages...');

    const globalPackages = ['stigmergy-cli', 'stigmergy'];

    for (const pkg of globalPackages) {
      try {
        const result = spawnSync('npm', ['list', '-g', pkg], {
          encoding: 'utf8',
          shell: true,
        });

        if (result.status === 0 && result.stdout.includes(pkg)) {
          console.log(`  ðŸ“¦ Found global package: ${pkg}`);

          if (this.options.dryRun) {
            console.log(`    ðŸ” Would uninstall: ${pkg}`);
            continue;
          }

          const uninstallResult = spawnSync('npm', ['uninstall', '-g', pkg], {
            encoding: 'utf8',
            shell: true,
            stdio: 'inherit',
          });

          if (uninstallResult.status === 0) {
            console.log(`    âœ?Uninstalled: ${pkg}`);
          } else {
            console.log(`    âš ï¸  Failed to uninstall: ${pkg}`);
          }
        }
      } catch (error) {
        console.error(`  â?Error checking ${pkg}: ${error.message}`);
      }
    }
  }

  /**
   * Helper methods
   */
  async removeDirectory(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        return false;
      }

      if (this.options.verbose) {
        console.log(`    Removing directory: ${dirPath}`);
      }

      fs.rmSync(dirPath, { recursive: true, force: true, maxRetries: 3 });
      return true;
    } catch (error) {
      if (!this.options.force) {
        throw error;
      }
      this.results.skipped.push(`Directory: ${dirPath} (${error.message})`);
      return false;
    }
  }

  async removeFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }

      if (this.options.verbose) {
        console.log(`    Removing file: ${filePath}`);
      }

      fs.unlinkSync(filePath);
      return true;
    } catch (error) {
      if (!this.options.force) {
        throw error;
      }
      this.results.skipped.push(`File: ${filePath} (${error.message})`);
      return false;
    }
  }

  async getAllFiles(dirPath) {
    const files = [];

    try {
      const items = fs.readdirSync(dirPath);

      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          files.push(...(await this.getAllFiles(fullPath)));
          files.push(fullPath);
        } else {
          files.push(fullPath);
        }
      }

      files.push(dirPath);
    } catch (error) {
      console.warn(`Warning: Could not read ${dirPath}: ${error.message}`);
    }

    return files;
  }

  async findStigmergyFiles(dirPath) {
    const stigmergyFiles = [];

    try {
      const files = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const file of files) {
        const fullPath = path.join(dirPath, file.name);

        if (file.isDirectory()) {
          stigmergyFiles.push(...(await this.findStigmergyFiles(fullPath)));
        } else if (this.isStigmergyFile(file.name)) {
          stigmergyFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }

    return stigmergyFiles;
  }

  isStigmergyFile(fileName) {
    const stigmergyPatterns = [
      'stigmergy',
      'cross-cli',
      'hook',
      'integration',
      '.stigmergy',
    ];

    const lowerFileName = fileName.toLowerCase();
    return stigmergyPatterns.some((pattern) =>
      lowerFileName.includes(pattern.toLowerCase()),
    );
  }

  async findNPXCacheDirectories() {
    const cacheDirs = [];
    const npxCacheBase = path.join(
      this.homeDir,
      'AppData',
      'Local',
      'npm-cache',
      '_npx',
    );

    if (!fs.existsSync(npxCacheBase)) {
      // Try alternative locations
      const alternatives = [
        path.join(this.homeDir, '.npm', '_npx'),
        path.join(os.tmpdir(), 'npm-cache', '_npx'),
      ];

      for (const alt of alternatives) {
        if (fs.existsSync(alt)) {
          npxCacheBase = alt;
          break;
        }
      }
    }

    if (fs.existsSync(npxCacheBase)) {
      try {
        const entries = fs.readdirSync(npxCacheBase);

        for (const entry of entries) {
          const entryPath = path.join(npxCacheBase, entry);
          const stigmergyPath = path.join(
            entryPath,
            'node_modules',
            'stigmergy',
          );

          if (fs.existsSync(stigmergyPath)) {
            cacheDirs.push(entryPath);
          }
        }
      } catch (error) {
        console.warn(`Warning: Could not scan NPX cache: ${error.message}`);
      }
    }

    return cacheDirs;
  }

  async findStigmergyTempFiles(tempDir) {
    const tempFiles = [];

    try {
      const files = fs.readdirSync(tempDir, { withFileTypes: true });

      for (const file of files) {
        if (
          this.isStigmergyFile(file.name) ||
          file.name.startsWith('stigmergy-') ||
          file.name.includes('stigmergy')
        ) {
          const fullPath = path.join(tempDir, file.name);

          if (file.isDirectory()) {
            tempFiles.push(fullPath);
          } else {
            tempFiles.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Skip temp directories we can't read
    }

    return tempFiles;
  }

  async scanDirectory(dirPath, plan) {
    try {
      const stat = fs.statSync(dirPath);

      if (stat.isDirectory()) {
        const files = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const file of files) {
          const fullPath = path.join(dirPath, file.name);

          if (file.isDirectory()) {
            plan.directories.push(fullPath);
            await this.scanDirectory(fullPath, plan);
          } else {
            plan.files.push(fullPath);
          }
        }
      } else {
        plan.files.push(dirPath);
      }
    } catch (error) {
      console.warn(`Warning: Could not scan ${dirPath}: ${error.message}`);
    }
  }

  async calculateDirectorySize(paths) {
    let totalSize = 0;

    for (const filePath of paths) {
      try {
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          totalSize += stat.size;
        }
      } catch (error) {
        // Skip files we can't stat
      }
    }

    return totalSize;
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  logFiles(files, prefix = '') {
    files.forEach((file) => {
      console.log(`${prefix}${path.basename(file)}`);
    });
  }

  printSummary() {
    console.log('\nðŸ“Š UNINSTALL SUMMARY:');
    console.log('='.repeat(50));

    if (this.options.dryRun) {
      console.log('ðŸ” DRY RUN MODE - No files were actually deleted');
    } else {
      console.log(`ðŸ“ Directories removed: ${this.results.directoriesRemoved}`);
      console.log(`ðŸ“„ Files removed: ${this.results.filesRemoved}`);
    }

    if (this.results.skipped.length > 0) {
      console.log(`â­ï¸  Items skipped: ${this.results.skipped.length}`);
      if (this.options.verbose) {
        this.results.skipped.forEach((item) => {
          console.log(`    ${item}`);
        });
      }
    }

    if (this.results.errors.length > 0) {
      console.log(`â?Errors: ${this.results.errors.length}`);
      this.results.errors.forEach((error) => {
        console.log(`    ${error}`);
      });
    }

    console.log('\nâœ?Enhanced uninstall completed!');
  }
}

module.exports = EnhancedUninstaller;
