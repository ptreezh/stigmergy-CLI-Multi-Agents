#!/usr/bin/env node

/**
 * Stigmergy 依赖优化脚本
 *
 * 使用方法：
 *   node scripts/optimize-deps.js [--check-only | --apply]
 *
 * 选项：
 *   --check-only    仅检查依赖状态，不应用更改
 *   --apply         应用优化建议
 *   --backup        备份当前 package.json
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DependencyOptimizer {
  constructor() {
    this.projectRoot = process.cwd();
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
    this.backupPath = path.join(this.projectRoot, 'package.json.backup');
    this.optimizedPath = path.join(this.projectRoot, 'package.optimized.json');
    this.reportPath = path.join(this.projectRoot, 'DEPENDENCY_OPTIMIZATION.md');
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      warning: '\x1b[33m', // Yellow
      error: '\x1b[31m',   // Red
      reset: '\x1b[0m'
    };

    const color = colors[type] || colors.info;
    console.log(`${color}${message}${colors.reset}`);
  }

  async backupPackageJson() {
    try {
      const content = await fs.readFile(this.packageJsonPath, 'utf8');
      await fs.writeFile(this.backupPath, content);
      this.log('✓ 已备份 package.json 到 package.json.backup', 'success');
      return true;
    } catch (error) {
      this.log(`✗ 备份失败: ${error.message}`, 'error');
      return false;
    }
  }

  async readPackageJson() {
    try {
      const content = await fs.readFile(this.packageJsonPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      this.log(`✗ 读取 package.json 失败: ${error.message}`, 'error');
      return null;
    }
  }

  async writePackageJson(data) {
    try {
      const content = JSON.stringify(data, null, 2);
      await fs.writeFile(this.packageJsonPath, content, 'utf8');
      this.log('✓ 已更新 package.json', 'success');
      return true;
    } catch (error) {
      this.log(`✗ 写入 package.json 失败: ${error.message}`, 'error');
      return false;
    }
  }

  analyzeDependencies(pkg) {
    const analysis = {
      dependencies: {},
      devDependencies: {},
      totalSize: 0,
      issues: []
    };

    // 分析生产依赖
    if (pkg.dependencies) {
      for (const [name, version] of Object.entries(pkg.dependencies)) {
        analysis.dependencies[name] = {
          version,
          type: 'production'
        };
      }
    }

    // 分析开发依赖
    if (pkg.devDependencies) {
      for (const [name, version] of Object.entries(pkg.devDependencies)) {
        analysis.devDependencies[name] = {
          version,
          type: 'development'
        };
      }
    }

    // 检查常见问题
    if (pkg.dependencies) {
      // 检查是否应该放在 devDependencies
      const devOnly = ['jest', 'eslint', 'prettier', 'typescript', '@types/'];
      for (const name of devOnly) {
        if (pkg.dependencies[name]) {
          analysis.issues.push({
            type: 'warning',
            message: `${name} 应该放在 devDependencies 而非 dependencies`
          });
        }
      }
    }

    return analysis;
  }

  getOptimizedVersions() {
    return {
      // 生产依赖 - 稳定版本
      dependencies: {
        chalk: '^4.1.2',          // 保持 v4 (CommonJS)
        commander: '^11.1.0',      // LTS 稳定版
        inquirer: '^8.2.6',        // 最后支持 CommonJS 的稳定版
        'js-yaml': '^4.1.1',       // 保持
        semver: '^7.7.3'           // 保持
      },
      // 开发依赖
      devDependencies: {
        '@types/jest': '^29.5.14',
        '@types/node': '^20.14.0',
        typescript: '^5.6.3',
        tsnode: '^10.9.2',
        eslint: '^8.57.1',
        prettier: '^3.3.3',
        jest: '^29.7.0'
      },
      // 可选依赖
      optionalDependencies: {
        'fs-extra': '^11.3.3',
        rimraf: '^5.0.5'
      }
    };
  }

  applyOptimizations(pkg) {
    const optimized = { ...pkg };
    const versions = this.getOptimizedVersions();

    // 更新生产依赖
    optimized.dependencies = { ...pkg.dependencies };
    for (const [name, version] of Object.entries(versions.dependencies)) {
      if (optimized.dependencies[name]) {
        optimized.dependencies[name] = version;
      }
    }

    // 更新开发依赖
    optimized.devDependencies = { ...pkg.devDependencies };

    // 添加新的开发依赖
    optimized.devDependencies['depcheck'] = '^1.4.7';
    optimized.devDependencies['npm-check'] = '^6.0.4';

    // 更新现有开发依赖版本
    for (const [name, version] of Object.entries(versions.devDependencies)) {
      if (optimized.devDependencies[name]) {
        optimized.devDependencies[name] = version;
      }
    }

    // 移动 fs-extra 和 rimraf 到 optionalDependencies
    if (optimized.devDependencies['fs-extra']) {
      delete optimized.devDependencies['fs-extra'];
    }
    if (optimized.devDependencies['rimraf']) {
      delete optimized.devDependencies['rimraf'];
    }

    // 添加 optionalDependencies
    optimized.optionalDependencies = {
      ...(pkg.optionalDependencies || {}),
      ...versions.optionalDependencies
    };

    // 添加新的 scripts
    optimized.scripts = {
      ...(pkg.scripts || {}),
      audit: 'npm audit --audit-level=moderate',
      'audit:fix': 'npm audit fix',
      'check-updates': 'npm outdated',
      'analyze-deps': 'depcheck',
      'check-unused': 'npm-check'
    };

    return optimized;
  }

  async checkNpmInstalled() {
    try {
      execSync('npm --version', { stdio: 'pipe' });
      return true;
    } catch {
      this.log('⚠ npm 未安装或不在 PATH 中', 'warning');
      return false;
    }
  }

  async runNpmAudit() {
    if (!await this.checkNpmInstalled()) {
      return null;
    }

    try {
      this.log('\n🔍 运行 npm audit...', 'info');
      const output = execSync('npm audit --json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return JSON.parse(output);
    } catch (error) {
      // npm audit 在发现漏洞时会返回非零退出码
      try {
        return JSON.parse(error.stdout);
      } catch {
        return null;
      }
    }
  }

  async runNpmOutdated() {
    if (!await this.checkNpmInstalled()) {
      return null;
    }

    try {
      this.log('\n📦 检查过时的依赖...', 'info');
      const output = execSync('npm outdated --json', {
        encoding: 'utf8',
        stdio: 'pipe'
      });
      return JSON.parse(output);
    } catch {
      // npm outdated 在发现过时包时会返回非零退出码
      return {};
    }
  }

  displayReport(analysis, audit, outdated) {
    console.log('\n' + '='.repeat(80));
    this.log('📊 Stigmergy 依赖分析报告', 'info');
    console.log('='.repeat(80));

    // 依赖统计
    const depCount = Object.keys(analysis.dependencies).length;
    const devDepCount = Object.keys(analysis.devDependencies).length;
    console.log(`\n生产依赖: ${depCount}`);
    console.log(`开发依赖: ${devDepCount}`);
    console.log(`总计: ${depCount + devDepCount}`);

    // 安全审计
    if (audit) {
      const vulnCount = audit.metadata?.vulnerabilities || {};
      const totalVulns = Object.values(vulnCount).reduce((sum, count) => sum + count, 0);

      console.log('\n' + '-'.repeat(80));
      this.log('🔒 安全审计', 'info');

      if (totalVulns > 0) {
        this.log(`发现 ${totalVulns} 个已知漏洞`, 'warning');
        console.log(`  - 低危: ${vulnCount.low || 0}`);
        console.log(`  - 中危: ${vulnCount.moderate || 0}`);
        console.log(`  - 高危: ${vulnCount.high || 0}`);
        console.log(`  - 严重: ${vulnCount.critical || 0}`);
      } else {
        this.log('✓ 未发现已知漏洞', 'success');
      }
    }

    // 过时的依赖
    if (outdated && Object.keys(outdated).length > 0) {
      console.log('\n' + '-'.repeat(80));
      this.log('⚠ 过时的依赖', 'warning');
      console.log('\n包名                 当前    最新    类型');
      console.log('-'.repeat(80));

      for (const [name, info] of Object.entries(outdated)) {
        console.log(`${name.padEnd(20)} ${info.current.padStart(10)} ${info.latest.padStart(8)} ${info.type}`);
      }
    } else {
      console.log('\n' + '-'.repeat(80));
      this.log('✓ 所有依赖都是最新版本', 'success');
    }

    // 问题清单
    if (analysis.issues.length > 0) {
      console.log('\n' + '-'.repeat(80));
      this.log('⚠ 发现的问题', 'warning');
      analysis.issues.forEach((issue, index) => {
        console.log(`\n${index + 1}. [${issue.type}] ${issue.message}`);
      });
    }

    console.log('\n' + '='.repeat(80));
  }

  async run(options = {}) {
    this.log('🚀 Stigmergy 依赖优化工具', 'info');
    console.log('='.repeat(80));

    // 检查模式
    const checkOnly = options.checkOnly || process.argv.includes('--check-only');
    const apply = options.apply || process.argv.includes('--apply');
    const backup = process.argv.includes('--backup');

    try {
      // 备份
      if (backup || apply) {
        await this.backupPackageJson();
      }

      // 读取 package.json
      const pkg = await this.readPackageJson();
      if (!pkg) {
        this.log('✗ 无法读取 package.json', 'error');
        return 1;
      }

      // 分析依赖
      this.log('\n📦 分析依赖...', 'info');
      const analysis = this.analyzeDependencies(pkg);

      // 运行审计
      const audit = await this.runNpmAudit();

      // 检查过时的依赖
      const outdated = await this.runNpmOutdated();

      // 显示报告
      this.displayReport(analysis, audit, outdated);

      // 应用优化
      if (apply) {
        this.log('\n🔧 应用优化...', 'info');
        const optimized = this.applyOptimizations(pkg);

        const success = await this.writePackageJson(optimized);
        if (success) {
          this.log('\n✓ 优化已应用！', 'success');
          this.log('\n下一步操作:', 'info');
          console.log('  1. 运行: npm install');
          console.log('  2. 运行: npm test');
          console.log('  3. 如有问题，恢复: cp package.json.backup package.json');
        } else {
          return 1;
        }
      } else if (!checkOnly) {
        this.log('\n💡 提示:', 'info');
        console.log('  使用 --apply 应用优化建议');
        console.log('  使用 --backup 仅备份当前 package.json');
        console.log('  使用 --check-only 仅检查不修改');
        console.log('\n示例:');
        console.log('  node scripts/optimize-deps.js --check-only');
        console.log('  node scripts/optimize-deps.js --backup --apply');
      }

      console.log('\n' + '='.repeat(80));
      this.log('✓ 完成！', 'success');

      return 0;
    } catch (error) {
      this.log(`\n✗ 错误: ${error.message}`, 'error');
      console.error(error.stack);
      return 1;
    }
  }
}

// CLI 接口
if (require.main === module) {
  const optimizer = new DependencyOptimizer();
  const exitCode = optimizer.run();
  process.exit(exitCode || 0);
}

module.exports = DependencyOptimizer;
