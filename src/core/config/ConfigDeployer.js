/**
 * Configuration Deployer
 * Deploys packaged configurations to target machines' CLI global directories
 *
 * 功能：
 * 1. 读取打包的配置文件
 * 2. 在目标机器上创建必要的目录结构
 * 3. 部署 agents 和 skills 到目标 CLI 工具的全局配置目录
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const chalk = require('chalk');

class ConfigDeployer {
  constructor(options = {}) {
    this.packageDir = options.packageDir || path.join(__dirname, '../../../config/bundle');
    this.force = options.force || false;
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
  }

  /**
   * 读取打包的配置
   */
  async loadConfigBundle() {
    const bundlePath = path.join(this.packageDir, 'config-bundle.json');

    try {
      const content = await fs.readFile(bundlePath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(chalk.red(`[ERROR] Failed to load config bundle: ${error.message}`));
      return null;
    }
  }

  /**
   * 读取部署清单
   */
  async loadManifest() {
    const manifestPath = path.join(this.packageDir, 'deployment-manifest.json');

    try {
      const content = await fs.readFile(manifestPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error(chalk.red(`[ERROR] Failed to load deployment manifest: ${error.message}`));
      return null;
    }
  }

  /**
   * 创建目标目录
   */
  async ensureDirectory(dirPath) {
    if (this.dryRun) {
      console.log(chalk.gray(`  [DRY RUN] Would create directory: ${dirPath}`));
      return true;
    }

    try {
      await fs.mkdir(dirPath, { recursive: true });
      if (this.verbose) {
        console.log(chalk.gray(`  Created directory: ${dirPath}`));
      }
      return true;
    } catch (error) {
      console.error(chalk.red(`  [ERROR] Failed to create directory ${dirPath}: ${error.message}`));
      return false;
    }
  }

  /**
   * 写入文件到目标位置
   */
  async writeFile(targetPath, content) {
    if (this.dryRun) {
      console.log(chalk.gray(`  [DRY RUN] Would write file: ${targetPath} (${content.length} bytes)`));
      return true;
    }

    try {
      // 如果文件已存在且不强制覆盖，跳过
      try {
        await fs.access(targetPath);
        if (!this.force) {
          if (this.verbose) {
            console.log(chalk.yellow(`  Skipped existing file: ${targetPath}`));
          }
          return true;
        }
      } catch (error) {
        // 文件不存在，继续
      }

      // 确保目录存在
      const dirPath = path.dirname(targetPath);
      await this.ensureDirectory(dirPath);

      // 写入文件
      await fs.writeFile(targetPath, content, 'utf8');
      if (this.verbose) {
        console.log(chalk.green(`  Wrote: ${targetPath}`));
      }
      return true;
    } catch (error) {
      console.error(chalk.red(`  [ERROR] Failed to write ${targetPath}: ${error.message}`));
      return false;
    }
  }

  /**
   * 部署单个配置项
   */
  async deployConfigItem(cliName, configType, items) {
    const targetBasePath = path.join(os.homedir(), `.${cliName}`);
    const targetPath = path.join(targetBasePath, configType);

    console.log(chalk.blue(`\n  Deploying to ${cliName}/${configType}...`));

    // 确保目标目录存在
    await this.ensureDirectory(targetPath);

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    for (const item of items) {
      const itemTargetPath = path.join(targetPath, item.path);

      const success = await this.writeFile(itemTargetPath, item.content);
      if (success) {
        // 检查是否是跳过（文件已存在）
        try {
          await fs.access(itemTargetPath);
          if (!this.force) {
            skipCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          successCount++;
        }
      } else {
        failCount++;
      }
    }

    console.log(chalk.gray(`    Results: ${successCount} written, ${skipCount} skipped, ${failCount} failed`));

    return { successCount, skipCount, failCount };
  }

  /**
   * 部署 markdown 配置文件
   */
  async deployMarkdownConfig(cliName, markdownConfig) {
    if (!markdownConfig.exists || !markdownConfig.content) {
      return { successCount: 0, skipCount: 0, failCount: 0 };
    }

    const targetBasePath = path.join(os.homedir(), `.${cliName}`);
    const targetPath = path.join(targetBasePath, markdownConfig.filename);

    console.log(chalk.blue(`\n  Deploying ${cliName}/${markdownConfig.filename}...`));

    const success = await this.writeFile(targetPath, markdownConfig.content);

    return {
      successCount: success ? 1 : 0,
      skipCount: 0,
      failCount: success ? 0 : 1
    };
  }

  /**
   * 部署单个 CLI 工具的配置
   */
  async deployCLIConfig(cliName, cliConfig) {
    console.log(chalk.cyan(`\n📦 Deploying ${cliName} configuration...`));

    const results = {
      agents: { successCount: 0, skipCount: 0, failCount: 0 },
      skills: { successCount: 0, skipCount: 0, failCount: 0 },
      markdown: { successCount: 0, skipCount: 0, failCount: 0 },
      skillRegistration: { successCount: 0, skipCount: 0, failCount: 0 }
    };

    // 部署 agents
    if (cliConfig.agents.items.length > 0) {
      results.agents = await this.deployConfigItem(cliName, 'agents', cliConfig.agents.items);
    }

    // 部署 skills
    if (cliConfig.skills.items.length > 0) {
      results.skills = await this.deployConfigItem(cliName, 'skills', cliConfig.skills.items);
    }

    // 部署 markdown 配置文件
    if (cliConfig.markdown.exists) {
      results.markdown = await this.deployMarkdownConfig(cliName, cliConfig.markdown);
    }

    // 为支持的CLI自动注册skills到.md文档
    if (this.shouldRegisterSkillsInMD(cliName)) {
      const skillNames = cliConfig.skills.items.map(item => {
        // 从路径中提取skill名称: skills/skill-name/skill.md -> skill-name
        // 同时支持 / 和 \\ 分隔符
        const parts = item.path.split(/[/\\]/);
        return parts[parts.length - 2] || path.basename(item.path, '.md');
      });

      if (skillNames.length > 0) {
        results.skillRegistration = await this.registerSkillsInCLIDoc(cliName, skillNames);
      }
    }

    return results;
  }

  /**
   * 判断CLI是否支持.md文档注册
   * 根据测试结果，只有iflow, codebuddy, qwen支持此机制
   */
  shouldRegisterSkillsInMD(cliName) {
    const supportedCLIs = ['iflow', 'codebuddy', 'qwen'];
    return supportedCLIs.includes(cliName);
  }

  /**
   * 获取CLI的.md文档路径
   */
  getCLIDocPath(cliName) {
    // CLI的.md文档在项目根目录
    return path.join(process.cwd(), `${cliName}.md`);
  }

  /**
   * 读取CLI的.md文档
   */
  async readCLIDoc(cliName) {
    const docPath = this.getCLIDocPath(cliName);

    try {
      const content = await fs.readFile(docPath, 'utf8');
      return { success: true, content, path: docPath };
    } catch (error) {
      console.error(chalk.red(`  [ERROR] Failed to read ${cliName}.md: ${error.message}`));
      return { success: false, content: null, path: docPath };
    }
  }

  /**
   * 在.md文档中注册skill
   * 如果 skills section 不存在，会自动创建
   */
  async registerSkillsInCLIDoc(cliName, skillNames) {
    console.log(chalk.blue(`\n  Registering ${skillNames.length} skill(s) in ${cliName}.md...`));

    const results = {
      successCount: 0,
      skipCount: 0,
      failCount: 0
    };

    // 读取.md文档
    const { success, content, path: docPath } = await this.readCLIDoc(cliName);
    if (!success || !content) {
      results.failCount = skillNames.length;
      return results;
    }

    let updatedContent = content;

    // 检查是否存在 skills section
    const hasSkillsSection = updatedContent.includes('</available_skills>');

    // 如果不存在，创建完整的 skills section
    if (!hasSkillsSection) {
      console.log(chalk.yellow(`  No skills section found, creating one...`));

      const skillsSectionTemplate = `

<!-- SKILLS_START -->
<skills_system priority="1">

## Stigmergy Skills

<usage>
Load skills using Stigmergy skill manager:

Direct call (current CLI):
  Bash("stigmergy skill read <skill-name>")

Cross-CLI call (specify CLI):
  Bash("stigmergy use <cli-name> skill <skill-name>")

Smart routing (auto-select best CLI):
  Bash("stigmergy call skill <skill-name>")

The skill content will load with detailed instructions.
Base directory will be provided for resolving bundled resources.
</usage>

<available_skills>

</available_skills>

</skills_system>
<!-- SKILLS_END -->`;

      // 在文件末尾添加
      updatedContent = updatedContent.trimEnd() + skillsSectionTemplate;
    }

    // 现在注册每个 skill
    for (const skillName of skillNames) {
      // 检查是否已经注册
      if (updatedContent.includes(`<name>${skillName}</name>`)) {
        if (this.verbose) {
          console.log(chalk.yellow(`    Skipped: ${skillName} (already registered)`));
        }
        results.skipCount++;
        continue;
      }

      // 创建skill条目
      const skillEntry = this.createSkillEntry(skillName);

      // 在</available_skills>前添加
      const endIndex = updatedContent.indexOf('</available_skills>');
      if (endIndex === -1) {
        console.error(chalk.red(`    [ERROR] </available_skills> tag not found in ${cliName}.md`));
        results.failCount++;
        continue;
      }

      updatedContent = updatedContent.slice(0, endIndex) + skillEntry + updatedContent.slice(endIndex);

      if (this.verbose) {
        console.log(chalk.green(`    ✓ Registered: ${skillName}`));
      }
      results.successCount++;
    }

    // 写入更新后的内容
    if (results.successCount > 0 || !hasSkillsSection) {
      if (this.dryRun) {
        console.log(chalk.gray(`  [DRY RUN] Would update ${docPath}`));
      } else {
        try {
          await fs.writeFile(docPath, updatedContent, 'utf8');

          if (!hasSkillsSection) {
            console.log(chalk.green(`  ✓ Created skills section in ${cliName}.md`));
          }

          if (results.successCount > 0) {
            console.log(chalk.green(`  ✓ Updated ${cliName}.md (${results.successCount} skill(s) registered)`));
          }
        } catch (error) {
          console.error(chalk.red(`  [ERROR] Failed to write ${docPath}: ${error.message}`));
          results.successCount = 0;
          results.failCount = results.successCount;
        }
      }
    }

    console.log(chalk.gray(`    Results: ${results.successCount} registered, ${results.skipCount} skipped, ${results.failCount} failed`));

    return results;
  }

  /**
   * 创建skill条目
   */
  createSkillEntry(skillName) {
    return `
<skill>
<name>${skillName}</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>`;
  }

  /**
   * 从.md文档中移除skill
   */
  async unregisterSkillsFromCLIDoc(cliName, skillNames) {
    console.log(chalk.blue(`\n  Unregistering ${skillNames.length} skill(s) from ${cliName}.md...`));

    const results = {
      successCount: 0,
      skipCount: 0,
      failCount: 0
    };

    // 读取.md文档
    const { success, content, path: docPath } = await this.readCLIDoc(cliName);
    if (!success || !content) {
      results.failCount = skillNames.length;
      return results;
    }

    let updatedContent = content;

    for (const skillName of skillNames) {
      // 检查是否已注册
      if (!updatedContent.includes(`<name>${skillName}</name>`)) {
        if (this.verbose) {
          console.log(chalk.yellow(`    Skipped: ${skillName} (not registered)`));
        }
        results.skipCount++;
        continue;
      }

      // 移除skill条目
      const regex = new RegExp(`<skill>[\\s\\S]*?<name>${skillName}<\\/name>[\\s\\S]*?<\\/skill>`, 'g');
      const newContent = updatedContent.replace(regex, '');

      if (newContent === updatedContent) {
        console.error(chalk.red(`    [ERROR] Failed to remove ${skillName} from ${cliName}.md`));
        results.failCount++;
        continue;
      }

      updatedContent = newContent;

      if (this.verbose) {
        console.log(chalk.green(`    ✓ Unregistered: ${skillName}`));
      }
      results.successCount++;
    }

    // 写入更新后的内容
    if (results.successCount > 0) {
      if (this.dryRun) {
        console.log(chalk.gray(`  [DRY RUN] Would update ${docPath}`));
      } else {
        try {
          await fs.writeFile(docPath, updatedContent, 'utf8');
          console.log(chalk.green(`  ✓ Updated ${cliName}.md (${results.successCount} skill(s) unregistered)`));
        } catch (error) {
          console.error(chalk.red(`  [ERROR] Failed to write ${docPath}: ${error.message}`));
          results.successCount = 0;
          results.failCount = results.successCount;
        }
      }
    }

    console.log(chalk.gray(`    Results: ${results.successCount} unregistered, ${results.skipCount} skipped, ${results.failCount} failed`));

    return results;
  }

  /**
   * 验证部署结果
   */
  async verifyDeployment(manifest) {
    console.log(chalk.blue('\n🔍 Verifying deployment...'));

    const verificationResults = [];

    for (const deployment of manifest.deployments) {
      const targetPath = deployment.targetPath;

      try {
        const stats = await fs.stat(targetPath);
        verificationResults.push({
          cli: deployment.cli,
          type: deployment.type,
          path: targetPath,
          exists: true,
          isDirectory: stats.isDirectory()
        });

        console.log(chalk.green(`  ✓ ${deployment.cli}/${deployment.type}`));
      } catch (error) {
        verificationResults.push({
          cli: deployment.cli,
          type: deployment.type,
          path: targetPath,
          exists: false
        });

        console.log(chalk.yellow(`  ⚠ ${deployment.cli}/${deployment.type} (not found)`));
      }
    }

    return verificationResults;
  }

  /**
   * 主流程：部署配置
   * 从源 CLI（iflow）读取配置，部署到所有目标 CLI 工具
   */
  async run() {
    console.log(chalk.cyan('🚀 Configuration Deployer'));
    console.log('='.repeat(60));

    if (this.dryRun) {
      console.log(chalk.yellow('\n⚠️  DRY RUN MODE - No actual changes will be made\n'));
    }

    // 加载配置包
    const configBundle = await this.loadConfigBundle();
    if (!configBundle) {
      return { success: false, error: 'Failed to load config bundle' };
    }

    // 加载部署清单
    const manifest = await this.loadManifest();
    if (!manifest) {
      return { success: false, error: 'Failed to load manifest' };
    }

    const sourceCLI = configBundle.sourceCLI || 'iflow';
    const targetCLIs = configBundle.targetCLIs || [sourceCLI];

    console.log(chalk.gray(`\nSource CLI: ${sourceCLI}`));
    console.log(chalk.gray(`Target CLIs: ${targetCLIs.join(', ')}`));
    console.log(chalk.gray(`Bundle version: ${configBundle.generatedAt}`));
    console.log(chalk.gray(`Platform: ${configBundle.platform}`));
    console.log(chalk.gray(`Total items: ${configBundle.summary.totalItems}`));

    // 获取源 CLI 的配置
    const sourceConfig = configBundle.configs[sourceCLI];
    if (!sourceConfig) {
      return { success: false, error: `Source CLI config not found: ${sourceCLI}` };
    }

    // 部署到每个目标 CLI 工具
    const deploymentResults = {};
    const summary = {
      totalSuccess: 0,
      totalSkip: 0,
      totalFail: 0
    };

    for (const targetCLI of targetCLIs) {
      console.log(chalk.cyan(`\n📦 Deploying ${sourceCLI} config to ${targetCLI}...`));

      const results = await this.deployCLIConfig(targetCLI, sourceConfig);
      deploymentResults[targetCLI] = results;

      summary.totalSuccess += results.agents.successCount + results.skills.successCount + results.markdown.successCount + results.skillRegistration.successCount;
      summary.totalSkip += results.agents.skipCount + results.skills.skipCount + results.markdown.skipCount + results.skillRegistration.skipCount;
      summary.totalFail += results.agents.failCount + results.skills.failCount + results.markdown.failCount + results.skillRegistration.failCount;
    }

    // 验证部署（如果不是 dry run）
    if (!this.dryRun) {
      await this.verifyDeployment(manifest);
    }

    console.log(chalk.green('\n✅ Configuration deployment completed!'));
    console.log(chalk.cyan('\nSummary:'));
    console.log(`  Deployed: ${summary.totalSuccess} files`);
    console.log(`  Skipped: ${summary.totalSkip} files`);
    console.log(`  Failed: ${summary.totalFail} files`);

    if (summary.totalFail > 0) {
      console.log(chalk.yellow('\n⚠️  Some deployments failed. Run with --verbose for details.'));
    }

    return {
      success: summary.totalFail === 0,
      summary,
      deploymentResults
    };
  }
}

module.exports = ConfigDeployer;
