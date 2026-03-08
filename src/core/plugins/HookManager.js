/**
 * Hook Manager - 统一钩子管理系统
 * 管理不同 CLI 的钩子配置和执行
 *
 * 支持的 CLI：
 * - Claude: .claude-plugin/hooks/
 * - iFlow: hooks.json
 * - Qwen: hooks.json
 * - CodeBuddy: hooks.json
 */

const fs = require("fs").promises;
const path = require("path");
const os = require("os");

class HookManager {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.cliRegistry = new Map();
  }

  /**
   * 获取 CLI 的 hooks 配置文件路径
   */
  getHooksConfigPath(cliName) {
    const cliConfigDir = path.join(os.homedir(), `.${cliName}`);

    switch (cliName.toLowerCase()) {
      case "claude":
        // Claude 使用 .claude-plugin/hooks/hooks.json
        return path.join(
          cliConfigDir,
          "plugins",
          "superpowers",
          ".claude-plugin",
          "hooks",
          "hooks.json",
        );

      case "iflow":
      case "qwen":
      case "codebuddy":
      case "codex":
        // 这些 CLI 使用根目录的 hooks.json
        return path.join(cliConfigDir, "hooks.json");

      default:
        // 默认使用 hooks.json
        return path.join(cliConfigDir, "hooks.json");
    }
  }

  /**
   * 获取 CLI 的 Hook 实现文件路径
   */
  getHookImplementationPath(cliName, hookName) {
    const cliConfigDir = path.join(os.homedir(), `.${cliName}`);

    switch (cliName.toLowerCase()) {
      case "claude":
        // Claude 使用 TypeScript hooks
        return path.join(
          cliConfigDir,
          "plugins",
          "superpowers",
          ".claude-plugin",
          "hooks",
          `${hookName}.ts`,
        );

      case "iflow":
      case "qwen":
      case "codebuddy":
        // 其他 CLI 使用 JavaScript hooks
        return path.join(cliConfigDir, "hooks", `${hookName}.js`);

      default:
        return path.join(cliConfigDir, "hooks", `${hookName}.js`);
    }
  }

  /**
   * 为 CLI 创建 hooks 配置
   */
  async createHooksConfig(cliName, hooksConfig) {
    const hooksConfigPath = this.getHooksConfigPath(cliName);

    // 确保目录存在
    const configDir = path.dirname(hooksConfigPath);
    await fs.mkdir(configDir, { recursive: true });

    // 根据不同 CLI 生成不同的配置格式
    let configContent;

    switch (cliName.toLowerCase()) {
      case "claude":
        configContent = this._generateClaudeHooksConfig(hooksConfig);
        break;

      case "iflow":
        configContent = this._generateIFlowHooksConfig(hooksConfig);
        break;

      case "qwen":
        configContent = this._generateQwenHooksConfig(hooksConfig);
        break;

      case "codebuddy":
        configContent = this._generateCodeBuddyHooksConfig(hooksConfig);
        break;

      default:
        configContent = this._generateGenericHooksConfig(hooksConfig);
    }

    if (this.dryRun) {
      console.log(`  [DRY RUN] Would create: ${hooksConfigPath}`);
      console.log(
        `  [DRY RUN] Content:\n${JSON.stringify(configContent, null, 2)}`,
      );
      return;
    }

    await fs.writeFile(
      hooksConfigPath,
      JSON.stringify(configContent, null, 2),
      "utf8",
    );

    if (this.verbose) {
      console.log(`  ✅ Created hooks config: ${hooksConfigPath}`);
    }
  }

  /**
   * 生成 Claude CLI 的 hooks 配置
   */
  _generateClaudeHooksConfig(hooksConfig) {
    const hooks = {};

    for (const [hookName, hookConfig] of Object.entries(hooksConfig)) {
      hooks[hookName] = {
        enabled: hookConfig.enabled || true,
        priority: hookConfig.priority || 1,
        implementation: {
          type: "typescript",
          file: `hooks/${hookName}.ts`,
        },
      };
    }

    return {
      version: "1.0.0",
      hooks,
    };
  }

  /**
   * 生成 iFlow 的 hooks 配置
   */
  _generateIFlowHooksConfig(hooksConfig) {
    const hooks = {};

    for (const [hookName, hookConfig] of Object.entries(hooksConfig)) {
      hooks[hookName] = {
        enabled: hookConfig.enabled || true,
        trigger_keywords: hookConfig.trigger_keywords || [],
        handler: hookConfig.handler || `hooks/${hookName}.js`,
        context_injection: hookConfig.context_injection || {
          enabled: true,
          format: "markdown",
          max_length: 2000,
        },
      };
    }

    return {
      version: "1.0.0",
      hooks,
    };
  }

  /**
   * 生成 Qwen 的 hooks 配置
   */
  _generateQwenHooksConfig(hooksConfig) {
    const hooks = {};

    for (const [hookName, hookConfig] of Object.entries(hooksConfig)) {
      hooks[hookName] = {
        enabled: hookConfig.enabled || true,
        context_injection: {
          trigger_keywords: hookConfig.trigger_keywords || [
            "task",
            "project",
            "code",
            "debug",
            "test",
            "design",
            "implement",
          ],
          max_context_length: hookConfig.max_context_length || 2000,
          injection_format: hookConfig.injection_format || "markdown",
        },
      };
    }

    return {
      version: "1.0.0",
      hooks,
    };
  }

  /**
   * 生成 CodeBuddy 的 hooks 配置
   */
  _generateCodeBuddyHooksConfig(hooksConfig) {
    const hooks = {};

    for (const [hookName, hookConfig] of Object.entries(hooksConfig)) {
      hooks[hookName] = {
        enabled: hookConfig.enabled || true,
        trigger_patterns: hookConfig.trigger_patterns || [],
        handler: hookConfig.handler || `hooks/${hookName}.js`,
        priority: hookConfig.priority || "medium",
      };
    }

    return {
      version: "1.0.0",
      hooks,
    };
  }

  /**
   * 生成通用 hooks 配置
   */
  _generateGenericHooksConfig(hooksConfig) {
    const hooks = {};

    for (const [hookName, hookConfig] of Object.entries(hooksConfig)) {
      hooks[hookName] = {
        enabled: hookConfig.enabled || true,
        handler: hookConfig.handler || `hooks/${hookName}.js`,
      };
    }

    return {
      version: "1.0.0",
      hooks,
    };
  }

  /**
   * 创建 Hook 实现文件
   */
  async createHookImplementation(cliName, hookName, hookContent) {
    const hookPath = this.getHookImplementationPath(cliName, hookName);

    // 确保目录存在
    const hookDir = path.dirname(hookPath);
    await fs.mkdir(hookDir, { recursive: true });

    if (this.dryRun) {
      console.log(`  [DRY RUN] Would create: ${hookPath}`);
      return;
    }

    await fs.writeFile(hookPath, hookContent, "utf8");

    if (this.verbose) {
      console.log(`  ✅ Created hook implementation: ${hookPath}`);
    }
  }

  /**
   * 生成 SessionStart Hook 实现
   */
  generateSessionStartHook(cliName) {
    switch (cliName.toLowerCase()) {
      case "claude":
        return this._generateClaudeSessionStartHook();

      case "iflow":
      case "qwen":
      case "codebuddy":
        return this._generateGenericSessionStartHook(cliName);

      default:
        return this._generateGenericSessionStartHook(cliName);
    }
  }

  /**
   * 生成 Claude 的 SessionStart Hook (TypeScript)
   */
  _generateClaudeSessionStartHook() {
    return `
import { HookContext } from '@anthropic-ai/claude-code';

/**
 * SessionStart Hook - 注入 superpowers 上下文
 */
export async function sessionStart(context: HookContext): Promise<void> {
  // 检查是否应该注入 superpowers
  if (shouldInjectSuperpowers(context)) {
    const skills = await listAvailableSkills();
    const injection = generateSkillInjection(skills);
    console.log(injection);
  }
}

function shouldInjectSuperpowers(context: HookContext): boolean {
  // 根据项目类型、用户偏好等判断
  return true;
}

async function listAvailableSkills(): Promise<string[]> {
  const fs = require('fs').promises;
  const path = require('path');
  const os = require('os');

  const skillsDir = path.join(os.homedir(), '.claude', 'skills');

  try {
    const dirs = await fs.readdir(skillsDir);
    return dirs.filter(d => !d.startsWith('.'));
  } catch {
    return [];
  }
}

function generateSkillInjection(skills: string[]): string {
  return \`
<!-- SKILLS_START -->
<skills_system priority="1">

## Superpowers Skills

<usage>
Use the Skill tool to load skills
</usage>

<available_skills>
\${skills.map(s => \`- \${s}\`).join('\\n')}
</available_skills>

</skills_system>
<!-- SKILLS_END -->
  \`.trim();
}
`;
  }

  /**
   * 生成通用的 SessionStart Hook (JavaScript)
   */
  _generateGenericSessionStartHook(cliName) {
    return `
/**
 * SessionStart Hook - 注入 superpowers 上下文
 * 针对 ${cliName} CLI
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

/**
 * SessionStart Hook 主函数
 * @param {Object} context - Hook 上下文
 */
async function sessionStart(context) {
  if (shouldInjectSuperpowers(context)) {
    const skills = await listAvailableSkills('${cliName}');
    const injection = generateSkillInjection(skills, '${cliName}');
    console.log(injection);
  }
}

/**
 * 判断是否应该注入 superpowers
 */
function shouldInjectSuperpowers(context) {
  // 默认总是注入
  return true;
}

/**
 * 列出可用的技能
 */
async function listAvailableSkills(cliName) {
  const skillsDir = path.join(os.homedir(), \`.\${cliName}\`, 'skills');

  try {
    const dirs = await fs.readdir(skillsDir);
    return dirs.filter(d => !d.startsWith('.'));
  } catch (error) {
    console.error(\`Failed to list skills: \${error.message}\`);
    return [];
  }
}

/**
 * 生成技能注入文本
 */
function generateSkillInjection(skills, cliName) {
  return \`
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
</usage>

<available_skills>
\${skills.map(s => \`<skill><name>\${s}</name><description>Skill deployed from Stigmergy</description><location>stigmergy</location></skill>\`).join('\\n')}
</available_skills>

</skills_system>
<!-- SKILLS_END -->
  \`.trim();
}

// 导出
module.exports = { sessionStart };
`;
  }

  /**
   * 读取现有的 hooks 配置
   */
  async readHooksConfig(cliName) {
    const hooksConfigPath = this.getHooksConfigPath(cliName);

    try {
      const content = await fs.readFile(hooksConfigPath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      if (error.code === "ENOENT") {
        // 文件不存在，返回空配置
        return { hooks: {} };
      }
      throw error;
    }
  }

  /**
   * 更新现有的 hooks 配置
   */
  async updateHooksConfig(cliName, newHooks) {
    const existingConfig = await this.readHooksConfig(cliName);

    // 合并 hooks
    const mergedHooks = {
      ...existingConfig.hooks,
      ...newHooks,
    };

    const updatedConfig = {
      ...existingConfig,
      hooks: mergedHooks,
    };

    const hooksConfigPath = this.getHooksConfigPath(cliName);

    if (this.dryRun) {
      console.log(`  [DRY RUN] Would update: ${hooksConfigPath}`);
      console.log(
        `  [DRY RUN] Content:\n${JSON.stringify(updatedConfig, null, 2)}`,
      );
      return;
    }

    await fs.writeFile(
      hooksConfigPath,
      JSON.stringify(updatedConfig, null, 2),
      "utf8",
    );

    if (this.verbose) {
      console.log(`  ✅ Updated hooks config: ${hooksConfigPath}`);
    }
  }

  /**
   * 删除 hooks 配置
   */
  async removeHooksConfig(cliName, hookNames) {
    const existingConfig = await this.readHooksConfig(cliName);

    for (const hookName of hookNames) {
      delete existingConfig.hooks[hookName];
    }

    const hooksConfigPath = this.getHooksConfigPath(cliName);

    if (this.dryRun) {
      console.log(`  [DRY RUN] Would update: ${hooksConfigPath}`);
      return;
    }

    await fs.writeFile(
      hooksConfigPath,
      JSON.stringify(existingConfig, null, 2),
      "utf8",
    );

    if (this.verbose) {
      console.log(`  ✅ Removed hooks from: ${hooksConfigPath}`);
    }
  }
}

module.exports = HookManager;
