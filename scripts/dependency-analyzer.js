#!/usr/bin/env node

const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue('🔍 Stigmergy CLI 依赖分析工具'));
console.log('='.repeat(50));

async function analyzeDependencies() {
  try {
    console.log(chalk.yellow('\n1. 检查未使用的依赖...'));
    try {
      console.log(execSync('npx depcheck', { encoding: 'utf8' }));
    } catch (error) {
      console.log(chalk.red('depcheck 检测到问题:'));
      console.log(error.stdout || error.message);
    }

    console.log(chalk.yellow('\n2. 检查过时的包...'));
    try {
      const outdated = execSync('npm outdated --json', { encoding: 'utf8' });
      if (outdated.trim()) {
        console.log(chalk.red('发现过时的包:'));
        console.log(JSON.stringify(JSON.parse(outdated), null, 2));
      } else {
        console.log(chalk.green('✅ 所有包都是最新版本'));
      }
    } catch (error) {
      if (error.message.includes('ENOENT')) {
        console.log(chalk.yellow('⚠️  npm outdated 命令失败，跳过此检查'));
      } else {
        console.log(chalk.red('npm outdated 检测到问题'));
      }
    }

    console.log(chalk.yellow('\n3. 安全审计...'));
    try {
      const audit = execSync('npm audit --json', { encoding: 'utf8' });
      const auditResult = JSON.parse(audit);
      if (auditResult.vulnerabilities && Object.keys(auditResult.vulnerabilities).length > 0) {
        console.log(chalk.red('发现安全漏洞:'));
        Object.keys(auditResult.vulnerabilities).forEach(pkg => {
          const vuln = auditResult.vulnerabilities[pkg];
          console.log(`  - ${pkg}: ${vuln.severity} (${vuln.title})`);
        });
      } else {
        console.log(chalk.green('✅ 未发现安全漏洞'));
      }
    } catch (error) {
      console.log(chalk.red('npm audit 检测到问题'));
    }

    console.log(chalk.yellow('\n4. 更新建议...'));
    try {
      console.log(execSync('npx npm-check-updates', { encoding: 'utf8' }));
    } catch (error) {
      console.log(chalk.red('npm-check-updates 检测到问题'));
    }

    console.log(chalk.yellow('\n5. 包大小分析...'));
    try {
      const lsOutput = execSync('npm ls --depth=0 --json', { encoding: 'utf8' });
      const result = JSON.parse(lsOutput);
      const dependencies = result.dependencies || {};

      console.log(chalk.blue('\n当前依赖包统计:'));
      console.log(`总计: ${Object.keys(dependencies).length} 个依赖包`);

      const packages = Object.entries(dependencies).map(([name, info]) => ({
        name,
        version: info.version,
        resolved: info.resolved
      }));

      packages.sort((a, b) => a.name.localeCompare(b.name));
      packages.forEach(pkg => {
        console.log(`  ${chalk.cyan(pkg.name)}: ${pkg.version}`);
      });
    } catch (error) {
      console.log(chalk.red('包大小分析失败'));
    }

    console.log(chalk.green('\n✅ 依赖分析完成！'));
    console.log(chalk.blue('\n推荐的优化命令:'));
    console.log('  npx depcheck                    # 检查未使用的依赖');
    console.log('  npm outdated                     # 查看过时的包');
    console.log('  npm audit fix                   # 修复安全漏洞');
    console.log('  npx npm-check-updates -u        # 更新所有包到最新版本');
    console.log('  npm install                     # 应用更新后的包');

  } catch (error) {
    console.error(chalk.red('分析过程中出现错误:'), error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  analyzeDependencies();
}

module.exports = { analyzeDependencies };