/**
 * Context Injector - 会话上下文注入系统
 * 负责向不同 CLI 的 .md 文件注入技能上下文
 *
 * 功能：
 * 1. 生成标准化的上下文注入格式
 * 2. 注入到 CLI 的 .md 文件
 * 3. 支持优先级系统
 * 4. 支持条件注入
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

class ContextInjector {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
  }

  /**
   * 获取 CLI 的主配置文件路径
   */
  getCLIDocPath(cliName) {
    const cliConfigDir = path.join(os.homedir(), `.${cliName}`);

    // 不同 CLI 的主配置文件名不同
    const docNames = {
      'claude': 'claude.md',
      'iflow': 'IFLOW.md',
      'qwen': 'qwen.md',
      'codebuddy': 'CODEBUDDY.md',
      'codex': 'codex.md',
      'copilot': 'copilot.md',
      'qodercli': 'qodercli.md'
    };

    const docName = docNames[cliName.toLowerCase()] || `${cliName}.md`;
    return path.join(cliConfigDir, docName);
  }

  /**
   * 生成标准化的上下文注入内容
   */
  generateContextInjection(skills, options = {}) {
    const {
      priority = 1,
      title = 'Stigmergy Skills',
      usage = null,
      cliName = 'universal'
    } = options;

    // 默认 usage 说明
    const defaultUsage = `
Load skills using Stigmergy skill manager:

Direct call (current CLI):
  Bash("stigmergy skill read <skill-name>")

Cross-CLI call (specify CLI):
  Bash("stigmergy use <cli-name> skill <skill-name>")

Smart routing (auto-select best CLI):
  Bash("stigmergy call skill <skill-name>")

The skill content will load with detailed instructions.
Base directory will be provided for resolving bundled resources.
`;

    const usageText = usage || defaultUsage;

    // 生成技能列表
    const skillsList = skills.map(skill => {
      if (typeof skill === 'string') {
        return `
<skill>
<name>${skill}</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>`;
      } else if (typeof skill === 'object') {
        return `
<skill>
<name>${skill.name}</name>
<description>${skill.description || 'Skill deployed from Stigmergy'}</description>
<location>${skill.location || 'stigmergy'}</location>
</skill>`;
      }
    }).join('\n');

    return `
<!-- SKILLS_START -->
<skills_system priority="${priority}">

## ${title}

<usage>
${usageText.trim()}
</usage>

<available_skills>
${skillsList}
</available_skills>

</skills_system>
<!-- SKILLS_END -->`;
  }

  /**
   * 为 Claude CLI 生成上下文注入
   */
  generateClaudeContextInjection(skills, options = {}) {
    const { priority = 1 } = options;

    const skillsList = skills.map(skill => {
      const skillName = typeof skill === 'string' ? skill : skill.name;
      const description = typeof skill === 'object' ? skill.description : '';
      return `- ${skillName}${description ? ': ' + description : ''}`;
    }).join('\n');

    return `
<!-- SKILLS_START -->
<skills_system priority="${priority}">

## Available Skills

<usage>
When you need to use a skill, invoke it using the Skill tool BEFORE starting your task.
</usage>

<available_skills>
${skillsList}
</available_skills>

</skills_system>
<!-- SKILLS_END -->`;
  }

  /**
   * 注入上下文到 CLI 的 .md 文件
   */
  async injectContext(cliName, skills, options = {}) {
    const docPath = this.getCLIDocPath(cliName);

    // 检查文件是否存在
    try {
      await fs.access(docPath);
    } catch {
      if (this.verbose) {
        console.log(`  ℹ️  ${cliName}.md does not exist, skipping injection`);
      }
      return false;
    }

    // 读取现有内容
    const existingContent = await fs.readFile(docPath, 'utf8');

    // 生成新的上下文注入
    let injection;
    if (cliName.toLowerCase() === 'claude') {
      injection = this.generateClaudeContextInjection(skills, options);
    } else {
      injection = this.generateContextInjection(skills, options);
    }

    // 检查是否已经存在 SKILLS_START 标记
    const hasSkillsSection = existingContent.includes('<!-- SKILLS_START -->');

    let updatedContent;

    if (hasSkillsSection) {
      // 替换现有的 skills section
      const startMarker = '<!-- SKILLS_START -->';
      const endMarker = '<!-- SKILLS_END -->';

      const startIndex = existingContent.indexOf(startMarker);
      const endIndex = existingContent.indexOf(endMarker) + endMarker.length;

      updatedContent =
        existingContent.slice(0, startIndex) +
        injection +
        existingContent.slice(endIndex);

      if (this.verbose) {
        console.log(`  🔄 Replacing existing skills section in ${cliName}.md`);
      }
    } else {
      // 追加新的 skills section
      updatedContent = existingContent.trimEnd() + '\n' + injection + '\n';

      if (this.verbose) {
        console.log(`  ➕ Adding new skills section to ${cliName}.md`);
      }
    }

    // 写入文件
    if (this.dryRun) {
      console.log(`  [DRY RUN] Would update: ${docPath}`);
      return true;
    }

    await fs.writeFile(docPath, updatedContent, 'utf8');

    if (this.verbose) {
      console.log(`  ✅ Injected context to: ${docPath}`);
    }

    return true;
  }

  /**
   * 从 CLI 的 .md 文件移除上下文注入
   */
  async removeContext(cliName) {
    const docPath = this.getCLIDocPath(cliName);

    // 检查文件是否存在
    try {
      await fs.access(docPath);
    } catch {
      if (this.verbose) {
        console.log(`  ℹ️  ${cliName}.md does not exist`);
      }
      return false;
    }

    // 读取现有内容
    const existingContent = await fs.readFile(docPath, 'utf8');

    // 检查是否存在 SKILLS_START 标记
    if (!existingContent.includes('<!-- SKILLS_START -->')) {
      if (this.verbose) {
        console.log(`  ℹ️  No skills section found in ${cliName}.md`);
      }
      return false;
    }

    // 移除 skills section
    const startMarker = '<!-- SKILLS_START -->';
    const endMarker = '<!-- SKILLS_END -->';

    const startIndex = existingContent.indexOf(startMarker);
    const endIndex = existingContent.indexOf(endMarker) + endMarker.length;

    const updatedContent =
      existingContent.slice(0, startIndex) +
      existingContent.slice(endIndex);

    // 清理多余的换行
    const cleanedContent = updatedContent.replace(/\n{3,}/g, '\n\n');

    // 写入文件
    if (this.dryRun) {
      console.log(`  [DRY RUN] Would update: ${docPath}`);
      return true;
    }

    await fs.writeFile(docPath, cleanedContent, 'utf8');

    if (this.verbose) {
      console.log(`  ✅ Removed context from: ${docPath}`);
    }

    return true;
  }

  /**
   * 更新特定技能的上下文
   */
  async updateSkillContext(cliName, skillName, skillData) {
    const docPath = this.getCLIDocPath(cliName);

    // 检查文件是否存在
    try {
      await fs.access(docPath);
    } catch {
      if (this.verbose) {
        console.log(`  ℹ️  ${cliName}.md does not exist`);
      }
      return false;
    }

    // 读取现有内容
    const existingContent = await fs.readFile(docPath, 'utf8');

    // 检查是否存在 skills section
    if (!existingContent.includes('<!-- SKILLS_START -->')) {
      if (this.verbose) {
        console.log(`  ℹ️  No skills section found in ${cliName}.md`);
      }
      return false;
    }

    // 查找技能条目
    const skillEntryRegex = new RegExp(
      `<skill>\\s*<name>${skillName}</name>[\\s\\S]*?</skill>`,
      'g'
    );

    // 检查技能是否存在
    const skillExists = skillEntryRegex.test(existingContent);

    if (!skillExists) {
      // 技能不存在，添加新技能
      const newSkillEntry = `
<skill>
<name>${skillName}</name>
<description>${skillData.description || 'Skill deployed from Stigmergy'}</description>
<location>${skillData.location || 'stigmergy'}</location>
</skill>`;

      // 在 </available_skills> 之前插入
      const endTag = '</available_skills>';
      const insertPosition = existingContent.indexOf(endTag);

      const updatedContent =
        existingContent.slice(0, insertPosition) +
        newSkillEntry +
        existingContent.slice(insertPosition);

      if (this.dryRun) {
        console.log(`  [DRY RUN] Would add skill to: ${docPath}`);
        return true;
      }

      await fs.writeFile(docPath, updatedContent, 'utf8');

      if (this.verbose) {
        console.log(`  ✅ Added skill "${skillName}" to ${cliName}.md`);
      }

      return true;
    } else {
      // 技能存在，更新
      const updatedContent = existingContent.replace(
        skillEntryRegex,
        `
<skill>
<name>${skillName}</name>
<description>${skillData.description || 'Skill deployed from Stigmergy'}</description>
<location>${skillData.location || 'stigmergy'}</location>
</skill>`
      );

      if (this.dryRun) {
        console.log(`  [DRY RUN] Would update skill in: ${docPath}`);
        return true;
      }

      await fs.writeFile(docPath, updatedContent, 'utf8');

      if (this.verbose) {
        console.log(`  ✅ Updated skill "${skillName}" in ${cliName}.md`);
      }

      return true;
    }
  }

  /**
   * 移除特定技能的上下文
   */
  async removeSkillContext(cliName, skillName) {
    const docPath = this.getCLIDocPath(cliName);

    // 检查文件是否存在
    try {
      await fs.access(docPath);
    } catch {
      return false;
    }

    // 读取现有内容
    const existingContent = await fs.readFile(docPath, 'utf8');

    // 查找并移除技能条目
    const skillEntryRegex = new RegExp(
      `<skill>\\s*<name>${skillName}</name>[\\s\\S]*?</skill>\\n*`,
      'g'
    );

    const updatedContent = existingContent.replace(skillEntryRegex, '');

    if (updatedContent === existingContent) {
      // 没有找到技能
      if (this.verbose) {
        console.log(`  ℹ️  Skill "${skillName}" not found in ${cliName}.md`);
      }
      return false;
    }

    // 写入文件
    if (this.dryRun) {
      console.log(`  [DRY RUN] Would remove skill from: ${docPath}`);
      return true;
    }

    await fs.writeFile(docPath, updatedContent, 'utf8');

    if (this.verbose) {
      console.log(`  ✅ Removed skill "${skillName}" from ${cliName}.md`);
    }

    return true;
  }

  /**
   * 读取当前注入的上下文
   */
  async readInjectedContext(cliName) {
    const docPath = this.getCLIDocPath(cliName);

    // 检查文件是否存在
    try {
      await fs.access(docPath);
    } catch {
      return null;
    }

    // 读取现有内容
    const existingContent = await fs.readFile(docPath, 'utf8');

    // 检查是否存在 skills section
    if (!existingContent.includes('<!-- SKILLS_START -->')) {
      return null;
    }

    // 提取 skills section
    const startMarker = '<!-- SKILLS_START -->';
    const endMarker = '<!-- SKILLS_END -->';

    const startIndex = existingContent.indexOf(startMarker);
    const endIndex = existingContent.indexOf(endMarker) + endMarker.length;

    return existingContent.slice(startIndex, endIndex);
  }

  /**
   * 验证上下文注入的完整性
   */
  async validateInjection(cliName) {
    const injectedContext = await this.readInjectedContext(cliName);

    if (!injectedContext) {
      return {
        valid: false,
        error: 'No skills section found'
      };
    }

    // 检查必需的标记
    const hasStartMarker = injectedContext.includes('<!-- SKILLS_START -->');
    const hasEndMarker = injectedContext.includes('<!-- SKILLS_END -->');
    const hasSkillsSystem = injectedContext.includes('<skills_system');
    const hasAvailableSkills = injectedContext.includes('<available_skills>');

    if (!hasStartMarker || !hasEndMarker) {
      return {
        valid: false,
        error: 'Missing start or end marker'
      };
    }

    if (!hasSkillsSystem) {
      return {
        valid: false,
        error: 'Missing skills_system tag'
      };
    }

    if (!hasAvailableSkills) {
      return {
        valid: false,
        error: 'Missing available_skills section'
      };
    }

    return {
      valid: true,
      context: injectedContext
    };
  }
}

module.exports = ContextInjector;
