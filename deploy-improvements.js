#!/usr/bin/env node

/**
 * 快速部署改进版本
 * 一键应用所有并发执行改进
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const chalk = require('chalk');

async function deploy() {
  console.log(chalk.bold.cyan('\n========================================'));
  console.log(chalk.bold.cyan('  Stigmergy 改进版本部署'));
  console.log(chalk.bold.cyan('========================================\n'));

  try {
    // 1. 备份原文件
    console.log(chalk.yellow('📦 步骤 1/4: 备份原文件...'));
    const originalFile = path.join(__dirname, 'src/orchestration/core/CentralOrchestrator.ts');
    const backupFile = path.join(__dirname, 'src/orchestration/core/CentralOrchestrator.ts.backup');

    try {
      await fs.copyFile(originalFile, backupFile);
      console.log(chalk.green('  ✅ 备份完成: CentralOrchestrator.ts.backup'));
    } catch (error) {
      console.log(chalk.gray('  ℹ️  备份文件已存在'));
    }

    // 2. 编译 TypeScript
    console.log(chalk.yellow('\n📦 步骤 2/4: 编译 TypeScript...'));
    try {
      execSync('npm run build:orchestration', {
        cwd: __dirname,
        stdio: 'inherit'
      });
      console.log(chalk.green('  ✅ 编译完成'));
    } catch (error) {
      console.log(chalk.red('  ❌ 编译失败'));
      throw error;
    }

    // 3. 复制到全局安装
    console.log(chalk.yellow('\n📦 步骤 3/4: 更新全局安装...'));
    const globalDir = 'C:\\Users\\Zhang\\AppData\\Roaming\\npm\\node_modules\\stigmergy';

    // 检查全局安装目录
    try {
      await fs.access(globalDir);
    } catch {
      console.log(chalk.red('  ❌ 全局安装目录不存在'));
      console.log(chalk.gray('  💡 请先运行: npm install -g .'));
      return;
    }

    // 复制编译后的文件
    const distSource = path.join(__dirname, 'dist/orchestration');
    const distDest = path.join(globalDir, 'dist/orchestration');

    // 创建目标目录
    await fs.mkdir(distDest, { recursive: true });

    // 复制文件
    const copyFiles = async (src, dest) => {
      const entries = await fs.readdir(src, { withFileTypes: true });
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
          await fs.mkdir(destPath, { recursive: true });
          await copyFiles(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    };

    await copyFiles(distSource, distDest);
    console.log(chalk.green('  ✅ 更新完成'));

    // 4. 验证安装
    console.log(chalk.yellow('\n📦 步骤 4/4: 验证安装...'));
    try {
      const version = execSync('stigmergy --version', {
        encoding: 'utf-8',
        stdio: 'pipe'
      }).trim();

      console.log(chalk.green(`  ✅ 当前版本: ${version}`));
    } catch (error) {
      console.log(chalk.yellow('  ⚠️  无法验证版本'));
    }

    // 完成
    console.log(chalk.bold.green('\n========================================'));
    console.log(chalk.bold.green('  🎉 部署完成!'));
    console.log(chalk.bold.green('========================================\n'));

    console.log(chalk.bold('改进效果:'));
    console.log(chalk.cyan('  ✓ 实时输出: 可以看到每个 CLI 的执行过程'));
    console.log(chalk.cyan('  ✓ CLI 前缀: 每行输出都有 [CLI名称] 前缀'));
    console.log(chalk.cyan('  ✓ 进度提示: 显示启动和完成消息'));
    console.log(chalk.green('  ✓ 文件锁: 防止文件写入冲突 (可选)'));

    console.log(chalk.bold('\n如何使用:'));
    console.log(chalk.white('  stigmergy concurrent "你的任务"'));
    console.log(chalk.white('  stigmergy interactive'));

    console.log(chalk.bold('\n测试脚本:'));
    console.log(chalk.white('  node test-conflict-demo.js      # 冲突演示'));
    console.log(chalk.white('  node test-improvements.js       # 改进测试'));

    console.log(chalk.bold('\n详细文档:'));
    console.log(chalk.white('  IMPROVEMENTS-IMPLEMENTATION.md  # 实施报告'));
    console.log(chalk.white('  CONFLICT-ANALYSIS.md             # 冲突分析'));
    console.log(chalk.white('  CONCURRENCY-MECHANISM-ANALYSIS.md # 并发机制'));

    console.log(chalk.bold('\n回滚:'));
    console.log(chalk.white('  如果遇到问题，可以回滚:'));
    console.log(chalk.gray('    cp src/orchestration/core/CentralOrchestrator.ts.backup \\'));
    console.log(chalk.gray('       src/orchestration/core/CentralOrchestrator.ts'));
    console.log(chalk.gray('    npm run build:orchestration'));

    console.log(chalk.bold('\n' + '='.repeat(70) + '\n'));

  } catch (error) {
    console.error(chalk.bold.red('\n❌ 部署失败:'), error.message);
    console.error(chalk.gray(error.stack));
    process.exit(1);
  }
}

// 运行部署
deploy().catch(err => {
  console.error(chalk.red('错误:', err.message));
  process.exit(1);
});
