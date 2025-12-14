/**
 * Comprehensive Cache Cleaner for Stigmergy
 *
 * Intelligent cache cleaning with selective removal, performance optimization,
 * and error recovery capabilities.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

class CacheCleaner {
  constructor(options = {}) {
    this.options = {
      dryRun: options.dryRun || false,
      force: options.force || false,
      verbose: options.verbose || false,
      preserveRecent: options.preserveRecent || 24 * 60 * 60 * 1000, // 24 hours
      batchSize: options.batchSize || 50,
      parallel: options.parallel || true,
      ...options,
    };

    this.homeDir = os.homedir();
    this.results = {
      filesRemoved: 0,
      directoriesRemoved: 0,
      bytesFreed: 0,
      errors: [],
      skipped: [],
    };
  }

  /**
   * Clean all caches comprehensively
   */
  async cleanAllCaches(options = {}) {
    const config = {
      cleanStigmergy: true,
      cleanNPX: true,
      cleanNPM: true,
      cleanCLI: true,
      cleanTemp: true,
      ...options,
    };

    console.log('🧹 Starting Comprehensive Cache Cleaning...\n');

    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No files will be deleted\n');
    }

    try {
      // 1. Clean Stigmergy cache
      if (config.cleanStigmergy) {
        await this.cleanStigmergyCache();
      }

      // 2. Clean NPX cache
      if (config.cleanNPX) {
        await this.cleanNPXCache();
      }

      // 3. Clean NPM cache
      if (config.cleanNPM) {
        await this.cleanNPMCache();
      }

      // 4. Clean CLI configurations
      if (config.cleanCLI) {
        await this.cleanCLIConfigurations();
      }

      // 5. Clean temporary files
      if (config.cleanTemp) {
        await this.cleanTemporaryFiles();
      }

      // 6. Print summary
      this.printSummary();

      return this.results;
    } catch (error) {
      console.error('�?Cache cleaning failed:', error.message);
      this.results.errors.push(error.message);
      return this.results;
    }
  }

  /**
   * Clean Stigmergy cache and temporary files
   */
  async cleanStigmergyCache() {
    console.log('📁 Cleaning Stigmergy cache...');

    const stigmergyDir = path.join(this.homeDir, '.stigmergy');
    const testDir = path.join(this.homeDir, '.stigmergy-test');

    // Clean main cache directory
    if (fs.existsSync(stigmergyDir)) {
      await this.cleanStigmergyDirectory(stigmergyDir, 'main');
    }

    // Clean test directory
    if (fs.existsSync(testDir)) {
      await this.cleanStigmergyDirectory(testDir, 'test');
    }

    // Clean cache subdirectories specifically
    const cachePaths = [
      path.join(stigmergyDir, 'cache'),
      path.join(stigmergyDir, 'logs'),
      path.join(stigmergyDir, 'temp'),
      path.join(stigmergyDir, '.tmp'),
    ];

    for (const cachePath of cachePaths) {
      if (fs.existsSync(cachePath)) {
        await this.cleanDirectory(cachePath);
      }
    }

    console.log('�?Stigmergy cache cleaning completed');
  }

  /**
   * Clean a specific Stigmergy directory
   */
  async cleanStigmergyDirectory(dirPath, type) {
    console.log(`  📂 Cleaning ${type} directory...`);

    const files = await this.scanDirectory(dirPath);
    const recentFiles = this.filterRecentFiles(files);

    if (recentFiles.length === 0) {
      console.log(`    ℹ️  No recent files to clean in ${type} directory`);
      return;
    }

    console.log(`    📋 Found ${recentFiles.length} files to clean`);

    if (this.options.dryRun) {
      this.logFiles(recentFiles, '      🔍 ');
      return;
    }

    const removed = await this.batchRemoveFiles(recentFiles);
    console.log(`    �?Removed ${removed} files from ${type} directory`);
  }

  /**
   * Clean NPX cache of Stigmergy entries
   */
  async cleanNPXCache() {
    console.log('📦 Cleaning NPX cache...');

    const npxCacheDirs = await this.findNPXCacheDirectories();

    if (npxCacheDirs.length === 0) {
      console.log('  ℹ️  No Stigmergy entries in NPX cache');
      return;
    }

    console.log(`  📦 Found ${npxCacheDirs.length} Stigmergy cache entries`);

    if (this.options.dryRun) {
      this.logFiles(npxCacheDirs, '    🔍 ');
      return;
    }

    let removed = 0;
    const failed = [];

    for (const cacheDir of npxCacheDirs) {
      try {
        const size = await this.getDirectorySize(cacheDir);
        await this.removeDirectory(cacheDir);
        this.results.bytesFreed += size;
        removed++;
      } catch (error) {
        failed.push(cacheDir);
        this.results.errors.push(`NPX cache ${cacheDir}: ${error.message}`);
      }
    }

    console.log(`  �?Removed ${removed} NPX cache entries`);
    if (failed.length > 0) {
      console.log(`  ⚠️  Failed to remove ${failed.length} entries`);
    }
  }

  /**
   * Clean NPM cache
   */
  async cleanNPMCache() {
    console.log('📦 Cleaning NPM cache...');

    try {
      // Use npm cache clean command
      if (this.options.dryRun) {
        console.log('  🔍 Would run: npm cache clean --force');
        return;
      }

      const result = spawnSync('npm', ['cache', 'clean', '--force'], {
        encoding: 'utf8',
        shell: true,
        stdio: this.options.verbose ? 'inherit' : 'pipe',
      });

      if (result.status === 0) {
        console.log('  �?NPM cache cleaned successfully');
      } else {
        console.log('  ⚠️  NPM cache clean failed, trying manual cleanup');
        await this.manualNPMCacheClean();
      }
    } catch (error) {
      console.error(`  �?Failed to clean NPM cache: ${error.message}`);
      this.results.errors.push(`NPM cache: ${error.message}`);
    }
  }

  /**
   * Manual NPM cache cleaning fallback
   */
  async manualNPMCacheClean() {
    const npmCacheDirs = [
      path.join(this.homeDir, '.npm', '_cacache'),
      path.join(this.homeDir, 'AppData', 'Local', 'npm-cache', '_cacache'),
    ];

    for (const cacheDir of npmCacheDirs) {
      if (fs.existsSync(cacheDir)) {
        console.log(`  🧹 Manual cleanup of ${cacheDir}`);
        await this.cleanDirectory(cacheDir);
      }
    }
  }

  /**
   * Clean CLI configurations
   */
  async cleanCLIConfigurations() {
    console.log('⚙️  Cleaning CLI configurations...');

    const supportedCLIs = [
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

    let totalCleaned = 0;

    for (const cli of supportedCLIs) {
      const cliConfig = path.join(this.homeDir, `.${cli}`);

      if (!fs.existsSync(cliConfig)) {
        continue;
      }

      const stigmergyFiles = await this.findStigmergyFiles(cliConfig);

      if (stigmergyFiles.length === 0) {
        continue;
      }

      console.log(`  📂 ${cli}: ${stigmergyFiles.length} Stigmergy files`);

      if (this.options.dryRun) {
        this.logFiles(stigmergyFiles, '    🔍 ');
        continue;
      }

      const removed = await this.batchRemoveFiles(stigmergyFiles);
      totalCleaned += removed;

      if (removed > 0) {
        console.log(`    �?Cleaned ${removed} files from ${cli}`);
      }
    }

    if (totalCleaned > 0) {
      console.log(`  �?Cleaned ${totalCleaned} CLI configuration files`);
    }
  }

  /**
   * Clean temporary files
   */
  async cleanTemporaryFiles() {
    console.log('🗑�? Cleaning temporary files...');

    const tempDirs = [
      os.tmpdir(),
      path.join(this.homeDir, 'AppData', 'Local', 'Temp'),
      path.join(this.homeDir, 'AppData', 'Local', 'npm-cache', '_tmp'),
    ];

    let totalRemoved = 0;

    for (const tempDir of tempDirs) {
      if (!fs.existsSync(tempDir)) {
        continue;
      }

      const tempFiles = await this.findStigmergyTempFiles(tempDir);

      if (tempFiles.length === 0) {
        continue;
      }

      console.log(
        `  📂 ${path.basename(tempDir)}: ${tempFiles.length} temporary files`,
      );

      if (this.options.dryRun) {
        this.logFiles(tempFiles.slice(0, 5), '    🔍 ');
        if (tempFiles.length > 5) {
          console.log(`    ... and ${tempFiles.length - 5} more`);
        }
        continue;
      }

      const removed = await this.batchRemoveFiles(tempFiles);
      totalRemoved += removed;

      if (removed > 0) {
        console.log(
          `    �?Removed ${removed} files from ${path.basename(tempDir)}`,
        );
      }
    }

    if (totalRemoved > 0) {
      console.log(`  �?Removed ${totalRemoved} temporary files`);
    }
  }

  /**
   * Selective cleaning with patterns
   */
  async selectiveClean(targetDirectory, options = {}) {
    const {
      preservePatterns = [],
      removePatterns = [],
      preserveRecent = this.options.preserveRecent,
    } = options;

    console.log(`🎯 Selective cleaning: ${targetDirectory}`);

    if (!fs.existsSync(targetDirectory)) {
      console.log('  ℹ️  Directory not found');
      return;
    }

    const allFiles = await this.scanDirectory(targetDirectory);
    const filesToRemove = [];

    for (const file of allFiles) {
      // Check preserve patterns
      const shouldPreserve =
        preservePatterns.some((pattern) => this.matchPattern(file, pattern)) ||
        this.isRecentFile(file, preserveRecent);

      // Check remove patterns
      const shouldRemove = removePatterns.some((pattern) =>
        this.matchPattern(file, pattern),
      );

      if (shouldRemove && !shouldPreserve) {
        filesToRemove.push(file);
      }
    }

    console.log(`  📋 Found ${filesToRemove.length} files to remove`);

    if (this.options.dryRun) {
      this.logFiles(filesToRemove, '    🔍 ');
      return;
    }

    const removed = await this.batchRemoveFiles(filesToRemove);
    console.log(`  �?Selectively removed ${removed} files`);
  }

  /**
   * Performance-optimized cleaning
   */
  async cleanWithPerformance(targetDirectory, options = {}) {
    const {
      batchSize = this.options.batchSize,
      parallel = this.options.parallel,
      maxConcurrency = 4,
    } = options;

    console.log(`�?Performance cleaning: ${targetDirectory}`);

    const files = await this.scanDirectory(targetDirectory);
    const recentFiles = this.filterRecentFiles(files);

    console.log(
      `  📊 Processing ${recentFiles.length} files in batches of ${batchSize}`,
    );

    if (this.options.dryRun) {
      console.log(
        `  🔍 Would process in ${Math.ceil(recentFiles.length / batchSize)} batches`,
      );
      return;
    }

    let removed = 0;
    const batches = this.createBatches(recentFiles, batchSize);

    if (parallel && batches.length > 1) {
      removed = await this.parallelRemoveBatches(batches, maxConcurrency);
    } else {
      for (const batch of batches) {
        const batchRemoved = await this.batchRemoveFiles(batch);
        removed += batchRemoved;
      }
    }

    console.log(`  �?Performance cleaned ${removed} files`);
    return removed;
  }

  /**
   * Helper methods
   */
  async scanDirectory(dirPath, files = []) {
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          await this.scanDirectory(fullPath, files);
          files.push(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.results.errors.push(`Scan error ${dirPath}: ${error.message}`);
    }

    return files;
  }

  async batchRemoveFiles(files) {
    let removed = 0;

    for (const file of files) {
      try {
        const stat = fs.statSync(file);

        if (this.removeFile(file)) {
          removed++;
          this.results.bytesFreed += stat.size;
        }
      } catch (error) {
        this.results.errors.push(`Remove error ${file}: ${error.message}`);
      }
    }

    this.results.filesRemoved += removed;
    return removed;
  }

  removeFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        return false;
      }

      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
        this.results.directoriesRemoved++;
      } else {
        fs.unlinkSync(filePath);
      }

      if (this.options.verbose) {
        console.log(`    Removed: ${path.basename(filePath)}`);
      }

      return true;
    } catch (error) {
      if (!this.options.force) {
        throw error;
      }
      this.results.skipped.push(`${filePath}: ${error.message}`);
      return false;
    }
  }

  async removeDirectory(dirPath) {
    try {
      if (fs.existsSync(dirPath)) {
        const size = await this.getDirectorySize(dirPath);
        fs.rmSync(dirPath, { recursive: true, force: true });
        this.results.bytesFreed += size;
        this.results.directoriesRemoved++;
        return true;
      }
      return false;
    } catch (error) {
      if (!this.options.force) {
        throw error;
      }
      this.results.skipped.push(`Directory: ${dirPath} (${error.message})`);
      return false;
    }
  }

  async getDirectorySize(dirPath) {
    let totalSize = 0;

    try {
      const files = await this.scanDirectory(dirPath);

      for (const file of files) {
        try {
          const stat = fs.statSync(file);
          totalSize += stat.size;
        } catch (error) {
          // Skip files we can't stat
        }
      }
    } catch (error) {
      // Return 0 for directories we can't scan
    }

    return totalSize;
  }

  filterRecentFiles(files) {
    return files.filter(
      (file) => !this.isRecentFile(file, this.options.preserveRecent),
    );
  }

  isRecentFile(filePath, maxAge) {
    try {
      const stat = fs.statSync(filePath);
      const age = Date.now() - stat.mtime.getTime();
      return age < maxAge;
    } catch (error) {
      return false;
    }
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
      'cache',
      '.tmp',
      'temp',
    ];

    const lowerFileName = fileName.toLowerCase();
    return stigmergyPatterns.some((pattern) =>
      lowerFileName.includes(pattern.toLowerCase()),
    );
  }

  async findNPXCacheDirectories() {
    const cacheDirs = [];
    const possibleNPXBases = [
      path.join(this.homeDir, 'AppData', 'Local', 'npm-cache', '_npx'),
      path.join(this.homeDir, '.npm', '_npx'),
      path.join(os.tmpdir(), 'npm-cache', '_npx'),
    ];

    for (const npxCacheBase of possibleNPXBases) {
      if (!fs.existsSync(npxCacheBase)) {
        continue;
      }

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
        this.results.errors.push(`NPX scan error: ${error.message}`);
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
          tempFiles.push(fullPath);
        }
      }
    } catch (error) {
      // Skip temp directories we can't read
    }

    return tempFiles;
  }

  async cleanDirectory(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        return;
      }

      const files = await this.scanDirectory(dirPath);
      const removed = await this.batchRemoveFiles(files);

      console.log(
        `    🧹 Cleaned ${removed} files from ${path.basename(dirPath)}`,
      );
    } catch (error) {
      console.error(`    �?Failed to clean ${dirPath}: ${error.message}`);
      this.results.errors.push(`Clean error ${dirPath}: ${error.message}`);
    }
  }

  matchPattern(filePath, pattern) {
    const fileName = path.basename(filePath);

    // Simple glob pattern matching
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');

    const regex = new RegExp(regexPattern, 'i');
    return regex.test(fileName);
  }

  createBatches(items, batchSize) {
    const batches = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  async parallelRemoveBatches(batches, maxConcurrency) {
    let totalRemoved = 0;
    const executing = [];

    for (const batch of batches) {
      const promise = this.batchRemoveFiles(batch);
      executing.push(promise);

      if (executing.length >= maxConcurrency) {
        await Promise.race(executing);
        executing.splice(0, 1);
      }
    }

    await Promise.all(executing);
    return totalRemoved;
  }

  formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  logFiles(files, prefix = '') {
    files.slice(0, 10).forEach((file) => {
      console.log(`${prefix}${path.basename(file)}`);
    });

    if (files.length > 10) {
      console.log(`${prefix}... and ${files.length - 10} more`);
    }
  }

  printSummary() {
    console.log('\n📊 CACHE CLEANING SUMMARY:');
    console.log('='.repeat(50));

    if (this.options.dryRun) {
      console.log('🔍 DRY RUN MODE - No files were actually deleted');
    } else {
      console.log(`📁 Directories removed: ${this.results.directoriesRemoved}`);
      console.log(`📄 Files removed: ${this.results.filesRemoved}`);
      console.log(
        `💾 Space freed: ${this.formatBytes(this.results.bytesFreed)}`,
      );
    }

    if (this.results.skipped.length > 0) {
      console.log(`⏭️  Items skipped: ${this.results.skipped.length}`);
      if (this.options.verbose) {
        this.results.skipped.forEach((item) => {
          console.log(`    ${item}`);
        });
      }
    }

    if (this.results.errors.length > 0) {
      console.log(`�?Errors: ${this.results.errors.length}`);
      this.results.errors.forEach((error) => {
        console.log(`    ${error}`);
      });
    }

    console.log('\n�?Cache cleaning completed!');
  }
}

module.exports = CacheCleaner;
