#!/usr/bin/env node

/**
 * Stigmergy 发布前检查脚本
 *
 * 使用方法：
 *   node scripts/pre-publish-check.js
 *
 * 此脚本会检查：
 * 1. package.json 配置
 * 2. 必需文件是否存在
 * 3. TypeScript 编译产物是否存在
 * 4. 发布包内容预览
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class PrePublishChecker {
  constructor() {
    this.projectRoot = process.cwd();
    this.packageJsonPath = path.join(this.projectRoot, 'package.json');
    this.errors = [];
    this.warnings = [];
    this.passed = [];
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

  async checkFileExists(filePath, description) {
    try {
      await fs.access(filePath);
      this.passed.push(`✓ ${description} 存在`);
      return true;
    } catch {
      this.errors.push(`✗ ${description} 不存在: ${filePath}`);
      return false;
    }
  }

  async checkPackageJson() {
    this.log('\n📦 检查 package.json...', 'info');

    try {
      const content = await fs.readFile(this.packageJsonPath, 'utf8');
      const pkg = JSON.parse(content);

      // 检查必需字段
      const requiredFields = ['name', 'version', 'description', 'main', 'bin'];
      for (const field of requiredFields) {
        if (!pkg[field]) {
          this.errors.push(`✗ package.json 缺少必需字段: ${field}`);
        } else {
          this.passed.push(`✓ ${field}: ${pkg[field]}`);
        }
      }

      // 检查 files 字段
      if (!pkg.files || !Array.isArray(pkg.files)) {
        this.warnings.push('⚠ package.json 缺少 files 字段');
      } else {
        this.log(`\n  将发布以下文件:`, 'info');
        pkg.files.forEach(pattern => {
          console.log(`    - ${pattern}`);
        });
      }

      // 检查是否包含 TypeScript 编译产物
      if (pkg.files && !pkg.files.includes('dist/**/*.js')) {
        this.warnings.push('⚠ files 字段未包含 dist/**/*.js（TypeScript 编译产物可能不会被发布）');
      }

      // 检查 dependencies
      if (!pkg.dependencies || Object.keys(pkg.dependencies).length === 0) {
        this.warnings.push('⚠ 没有生产依赖');
      } else {
        this.log(`\n  生产依赖 (${Object.keys(pkg.dependencies).length} 个):`, 'info');
        for (const [name, version] of Object.entries(pkg.dependencies)) {
          console.log(`    - ${name}@${version}`);
        }
      }

      // 检查 devDependencies（不会发布）
      if (pkg.devDependencies && Object.keys(pkg.devDependencies).length > 0) {
        this.log(`\n  开发依赖 (${Object.keys(pkg.devDependencies).length} 个) - 不会发布:`, 'info');
        for (const [name, version] of Object.entries(pkg.devDependencies)) {
          console.log(`    - ${name}@${version}`);
        }
      }

      return pkg;
    } catch (error) {
      this.errors.push(`✗ 读取 package.json 失败: ${error.message}`);
      return null;
    }
  }

  async checkBinFiles(pkg) {
    this.log('\n🔧 检查 bin 文件...', 'info');

    if (!pkg || !pkg.bin) {
      this.warnings.push('⚠ 没有 bin 字段');
      return;
    }

    for (const [name, filePath] of Object.entries(pkg.bin)) {
      const fullPath = path.join(this.projectRoot, filePath);
      await this.checkFileExists(fullPath, `bin/${name}`);
    }
  }

  async checkMainFile(pkg) {
    this.log('\n📄 检查主入口文件...', 'info');

    if (!pkg || !pkg.main) {
      this.warnings.push('⚠ 没有 main 字段');
      return;
    }

    const mainPath = path.join(this.projectRoot, pkg.main);
    await this.checkFileExists(mainPath, `主入口文件 (${pkg.main})`);
  }

  async checkTypeScriptBuild() {
    this.log('\n🔨 检查 TypeScript 编译产物...', 'info');

    const distDir = path.join(this.projectRoot, 'dist', 'orchestration');

    try {
      const files = await fs.readdir(distDir, { recursive: true });
      const jsFiles = files.filter(f => f.endsWith('.js'));

      if (jsFiles.length === 0) {
        this.errors.push('✗ dist/orchestration/ 目录下没有编译产物');
        return false;
      }

      this.passed.push(`✓ 找到 ${jsFiles.length} 个 TypeScript 编译产物`);
      return true;
    } catch (error) {
      this.warnings.push('⚠ dist/orchestration/ 目录不存在或为空');
      this.log('  提示: 运行 npm run build:orchestration 编译 TypeScript', 'warning');
      return false;
    }
  }

  async checkNpmIgnore() {
    this.log('\n🚫 检查 .npmignore...', 'info');

    const npmignorePath = path.join(this.projectRoot, '.npmignore');

    const exists = await this.checkFileExists(npmignorePath, '.npmignore 文件');
    if (exists) {
      this.passed.push('✓ .npmignore 文件存在，将排除指定文件');
    } else {
      this.warnings.push('⚠ 没有 .npmignore 文件');
    }
  }

  async checkGitStatus() {
    this.log('\n📂 检查 Git 状态...', 'info');

    try {
      const status = execSync('git status --porcelain', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      if (status.trim()) {
        this.warnings.push('⚠ 工作目录有未提交的更改');
        this.log('  提示: 建议提交所有更改后再发布', 'warning');
      } else {
        this.passed.push('✓ 工作目录干净');
      }
    } catch (error) {
      this.warnings.push('⚠ 无法检查 Git 状态（可能不是 Git 仓库）');
    }
  }

  async previewPackageContents() {
    this.log('\n👀 预览将发布的内容...', 'info');

    try {
      // 使用 npm pack --dry-run 预览
      const output = execSync('npm pack --dry-run 2>&1', {
        encoding: 'utf8',
        stdio: 'pipe'
      });

      console.log(output);

      this.passed.push('✓ npm pack --dry-run 成功');
    } catch (error) {
      this.errors.push(`✗ npm pack --dry-run 失败: ${error.message}`);
    }
  }

  displaySummary() {
    console.log('\n' + '='.repeat(80));
    this.log('📊 检查结果总结', 'info');
    console.log('='.repeat(80));

    if (this.passed.length > 0) {
      console.log('\n✅ 通过的检查:');
      this.passed.forEach(msg => this.log(`  ${msg}`, 'success'));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  警告:');
      this.warnings.forEach(msg => this.log(`  ${msg}`, 'warning'));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ 错误:');
      this.errors.forEach(msg => this.log(`  ${msg}`, 'error'));
    }

    console.log('\n' + '='.repeat(80));

    if (this.errors.length > 0) {
      this.log('\n❌ 发现错误，请修复后再发布！\n', 'error');
      return false;
    } else if (this.warnings.length > 0) {
      this.log('\n⚠️  有警告，请确认后再发布！\n', 'warning');
      return true;
    } else {
      this.log('\n✅ 所有检查通过，可以发布！\n', 'success');
      return true;
    }
  }

  async run() {
    this.log('🔍 Stigmergy 发布前检查', 'info');
    console.log('='.repeat(80));

    // 1. 检查 package.json
    const pkg = await this.checkPackageJson();

    // 2. 检查 bin 文件
    await this.checkBinFiles(pkg);

    // 3. 检查主入口文件
    await this.checkMainFile(pkg);

    // 4. 检查 TypeScript 编译产物
    await this.checkTypeScriptBuild();

    // 5. 检查 .npmignore
    await this.checkNpmIgnore();

    // 6. 检查 Git 状态
    await this.checkGitStatus();

    // 7. 预览发布内容
    await this.previewPackageContents();

    // 8. 显示总结
    const canPublish = this.displaySummary();

    return canPublish ? 0 : 1;
  }
}

// CLI 接口
if (require.main === module) {
  const checker = new PrePublishChecker();
  const exitCode = checker.run();
  process.exit(exitCode || 0);
}

module.exports = PrePublishChecker;
