#!/usr/bin/env node
/**
 * Local Configurations Bundler Script
 * 开发者脚本：扫描本地 iflow CLI 配置并打包到 stigmergy 包中
 *
 * 功能：
 * 1. 扫描本地 iflow 的 agents 和 skills
 * 2. 打包配置到 config/bundle/ 目录
 * 3. 这些配置将随 npm 包一起分发
 * 4. 安装 stigmergy 后会自动部署到目标机器的各个 CLI 工具
 *
 * 使用方法：
 *   node scripts/bundle-local-configs.js [--verbose]
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class LocalConfigBundler {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.sourceHome = os.homedir();
    this.targetDir = path.join(__dirname, '../config/bundle');
    // 只扫描 iflow 的配置
    this.sourceCLI = 'iflow';
    // 部署目标：将 iflow 的配置部署到这些 CLI 工具
    this.targetCLIs = ['iflow', 'qwen', 'codebuddy', 'qodercli'];
  }

  /**
   * 扫描单个 CLI 工具的配置
   */
  async scanCLIConfig(cliName) {
    const configBasePath = path.join(this.sourceHome, `.${cliName}`);

    const result = {
      cliName,
      agents: { items: [], exists: false },
      skills: { items: [], exists: false },
      markdown: { exists: false, content: null }
    };

    // 扫描 agents 目录
    const agentsPath = path.join(configBasePath, 'agents');
    try {
      const stats = await fs.stat(agentsPath);
      if (stats.isDirectory()) {
        result.agents.exists = true;
        await this.scanDirectoryRecursive(agentsPath, result.agents.items, agentsPath);
      }
    } catch (error) {
      // 目录不存在，跳过
    }

    // 扫描 skills 目录
    const skillsPath = path.join(configBasePath, 'skills');
    try {
      const stats = await fs.stat(skillsPath);
      if (stats.isDirectory()) {
        result.skills.exists = true;
        await this.scanDirectoryRecursive(skillsPath, result.skills.items, skillsPath);
      }
    } catch (error) {
      // 目录不存在，跳过
    }

    // 扫描 markdown 配置文件
    const mdFilenames = {
      iflow: 'iflow.md',
      qwen: 'qwen.md',
      codebuddy: 'codebuddy.md',
      qodercli: 'qoder.md',
      claude: 'claude.md',
      gemini: 'gemini.md'
    };

    const mdFilename = mdFilenames[cliName];
    if (mdFilename) {
      const mdPath = path.join(configBasePath, mdFilename);
      try {
        const content = await fs.readFile(mdPath, 'utf8');
        result.markdown.exists = true;
        result.markdown.content = content;
        result.markdown.filename = mdFilename;
      } catch (error) {
        // 文件不存在，跳过
      }
    }

    return result;
  }

  /**
   * 递归扫描目录
   */
  async scanDirectoryRecursive(dirPath, items, basePath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.relative(basePath, fullPath);

      if (entry.isDirectory()) {
        await this.scanDirectoryRecursive(fullPath, items, basePath);
      } else if (entry.isFile()) {
        const content = await fs.readFile(fullPath, 'utf8');
        items.push({
          path: relativePath,
          content: content,
          size: Buffer.byteLength(content, 'utf8')
        });
      }
    }
  }

  /**
   * 扫描 iflow 配置
   */
  async scanAllConfigs() {
    console.log(chalk.blue('🔍 Scanning local iflow CLI configuration...'));

    const bundle = {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      platform: os.platform(),
      hostname: os.hostname(),
      sourceCLI: this.sourceCLI,
      targetCLIs: this.targetCLIs,
      configs: {}
    };

    let totalItems = 0;
    let totalSize = 0;

    // 只扫描 iflow 的配置
    console.log(chalk.gray(`  Scanning ${this.sourceCLI}...`));
    const cliConfig = await this.scanCLIConfig(this.sourceCLI);
    bundle.configs[this.sourceCLI] = cliConfig;

    const itemCount = cliConfig.agents.items.length + cliConfig.skills.items.length;
    const itemSize = [
      ...cliConfig.agents.items,
      ...cliConfig.skills.items
    ].reduce((sum, item) => sum + item.size, 0);

    totalItems = itemCount;
    totalSize = itemSize;

    if (itemCount > 0) {
      console.log(chalk.green(`    ${this.sourceCLI}: ${cliConfig.agents.items.length} agents, ${cliConfig.skills.items.length} skills`));
    }

    bundle.summary = {
      totalItems,
      totalSize,
      sourceCLI: this.sourceCLI,
      targetCLIs: this.targetCLIs
    };

    console.log(chalk.green(`✓ Scanned ${totalItems} files (${(totalSize / 1024).toFixed(2)} KB)`));
    console.log(chalk.gray(`  Will deploy to: ${this.targetCLIs.join(', ')}`));

    return bundle;
  }

  /**
   * 保存配置包到文件
   */
  async saveBundle(bundle) {
    console.log(chalk.blue('\n📦 Saving configuration bundle...'));

    try {
      // 确保目标目录存在
      await fs.mkdir(this.targetDir, { recursive: true });

      // 保存配置包
      const bundlePath = path.join(this.targetDir, 'config-bundle.json');
      await fs.writeFile(bundlePath, JSON.stringify(bundle, null, 2), 'utf8');
      console.log(chalk.green(`✓ Bundle saved: ${bundlePath}`));

      // 生成部署清单
      const manifest = this.generateManifest(bundle);
      const manifestPath = path.join(this.targetDir, 'deployment-manifest.json');
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
      console.log(chalk.green(`✓ Manifest saved: ${manifestPath}`));

      // 生成 README
      const readme = this.generateReadme(bundle);
      const readmePath = path.join(this.targetDir, 'README.md');
      await fs.writeFile(readmePath, readme, 'utf8');
      console.log(chalk.green(`✓ README saved: ${readmePath}`));

      return {
        success: true,
        bundlePath,
        manifestPath,
        readmePath,
        summary: bundle.summary
      };

    } catch (error) {
      console.error(chalk.red(`[ERROR] Failed to save bundle: ${error.message}`));
      return { success: false, error: error.message };
    }
  }

  /**
   * 生成部署清单
   * 将 iflow 的配置部署到所有目标 CLI 工具
   */
  generateManifest(bundle) {
    const manifest = {
      version: bundle.version,
      generatedAt: bundle.generatedAt,
      platform: bundle.platform,
      sourceCLI: bundle.sourceCLI,
      deployments: []
    };

    // 获取 iflow 的配置
    const iflowConfig = bundle.configs[bundle.sourceCLI];
    if (!iflowConfig) {
      return manifest;
    }

    // 为每个目标 CLI 工具生成部署条目
    for (const targetCLI of bundle.targetCLIs) {
      // Agents 部署
      if (iflowConfig.agents.items.length > 0) {
        manifest.deployments.push({
          source: bundle.sourceCLI,
          target: targetCLI,
          type: 'agents',
          targetPath: path.join(os.homedir(), `.${targetCLI}`, 'agents'),
          itemCount: iflowConfig.agents.items.length
        });
      }

      // Skills 部署
      if (iflowConfig.skills.items.length > 0) {
        manifest.deployments.push({
          source: bundle.sourceCLI,
          target: targetCLI,
          type: 'skills',
          targetPath: path.join(os.homedir(), `.${targetCLI}`, 'skills'),
          itemCount: iflowConfig.skills.items.length
        });
      }

      // Markdown 配置文件部署
      if (iflowConfig.markdown.exists) {
        manifest.deployments.push({
          source: bundle.sourceCLI,
          target: targetCLI,
          type: 'config',
          targetPath: path.join(os.homedir(), `.${targetCLI}`, iflowConfig.markdown.filename),
          itemCount: 1
        });
      }
    }

    return manifest;
  }

  /**
   * 生成 README 文件
   */
  generateReadme(bundle) {
    const iflowConfig = bundle.configs[bundle.sourceCLI];
    const itemCount = iflowConfig ? iflowConfig.agents.items.length + iflowConfig.skills.items.length : 0;

    return `# CLI Configurations Bundle

This directory contains pre-packaged configurations from **${bundle.sourceCLI}** for deployment to multiple CLI tools.

## Bundle Information

- **Source**: ${bundle.sourceCLI}
- **Targets**: ${bundle.targetCLIs.join(', ')}
- **Version**: ${bundle.version}
- **Generated**: ${bundle.generatedAt}
- **Platform**: ${bundle.platform}
- **Total Files**: ${bundle.summary.totalItems}
- **Total Size**: ${(bundle.summary.totalSize / 1024).toFixed(2)} KB

## Contents

**${bundle.sourceCLI}**: ${iflowConfig ? iflowConfig.agents.items.length : 0} agents, ${iflowConfig ? iflowConfig.skills.items.length : 0} skills

These configurations will be deployed to: ${bundle.targetCLIs.join(', ')}

## Deployment

These configurations are automatically deployed when installing the stigmergy package.

To manually deploy:
\`\`\`bash
stigmergy config-deploy
\`\`\`

## Files

- \`config-bundle.json\`: Complete configuration bundle
- \`deployment-manifest.json\`: Deployment instructions
- \`README.md\`: This file

---
*Generated by stigmergy CLI Configuration Bundler*
`;
  }

  /**
   * 运行打包流程
   */
  async run() {
    console.log(chalk.cyan('🚀 Local Configurations Bundler'));
    console.log('='.repeat(60));
    console.log(chalk.gray('This script scans local CLI configurations and bundles them'));
    console.log(chalk.gray('for distribution with the stigmergy npm package.\n'));

    const bundle = await this.scanAllConfigs();

    if (bundle.summary.totalItems === 0) {
      console.log(chalk.yellow('\n⚠️  No configurations found to package'));
      console.log(chalk.gray('Make sure you have CLI tools installed with agents/skills configured.'));
      return { success: true, message: 'No configurations found' };
    }

    const result = await this.saveBundle(bundle);

    if (result.success) {
      console.log(chalk.green('\n✅ Configuration bundling completed!'));
      console.log(chalk.cyan('\nSummary:'));
      console.log(`  Total files: ${bundle.summary.totalItems}`);
      console.log(`  Total size: ${(bundle.summary.totalSize / 1024).toFixed(2)} KB`);
      console.log(`  Bundle: ${result.bundlePath}`);
      console.log(chalk.cyan('\nNext steps:'));
      console.log('  1. Review the bundled configurations');
      console.log('  2. Commit the changes to git');
      console.log('  3. Publish the npm package');
    }

    return result;
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  const bundler = new LocalConfigBundler({ verbose });
  const result = await bundler.run();

  process.exit(result.success ? 0 : 1);
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error(chalk.red('[FATAL]'), error.message);
    process.exit(1);
  });
}

module.exports = LocalConfigBundler;
