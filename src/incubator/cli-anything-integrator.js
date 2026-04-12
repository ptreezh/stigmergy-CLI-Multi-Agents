/**
 * CLI-Anything 集成器
 * 基于真实的 CLI-Anything Claude Code 插件架构
 */

const path = require('path');
const fs = require('fs');

class CLIAnythingIntegrator {
  constructor() {
    // CLI-Anything 插件路径（在 f:\aa\stigmergy-plc-edu\CLI-Anything\）
    this.cliAnythingPath = this._detectCLIAnythingPath();
  }

  /**
   * 检测 Claude Code 是否安装
   * @returns {Promise<Object>} 检测结果
   */
  async detectClaudeCode() {
    // 实际实现会检查 claude 命令是否存在
    return {
      installed: false,  // 默认假设未安装
      version: null,
      path: null,
      installRequired: true
    };
  }

  /**
   * 检测 CLI-Anything 插件是否安装
   * @returns {Promise<Object>} 检测结果
   */
  async detectCLIAnythingPlugin() {
    return {
      installed: false,
      pluginPath: null,
      installRequired: true
    };
  }

  /**
   * 生成 Claude Code 安装命令
   * @returns {Array} 安装命令列表
   */
  generateClaudeCodeInstallCommands() {
    return [
      {
        phase: 'install-claude-code',
        command: 'npm install -g @anthropic-ai/claude-code',
        description: '安装 Claude Code'
      },
      {
        phase: 'verify-install',
        command: 'claude --version',
        description: '验证安装'
      }
    ];
  }

  /**
   * 生成 CLI-Anything 插件安装命令
   * @returns {Array} 插件安装命令列表
   */
  generatePluginInstallCommands() {
    return [
      {
        phase: 'add-marketplace',
        command: '/plugin marketplace add HKUDS/CLI-Anything',
        description: '添加 CLI-Anything 插件市场'
      },
      {
        phase: 'install-plugin',
        command: '/plugin install cli-anything',
        description: '安装 cli-anything 插件'
      },
      {
        phase: 'reload-plugins',
        command: '/reload-plugins',
        description: '重新加载插件'
      }
    ];
  }

  /**
   * 生成 /cli-anything 构建命令
   * @param {string} softwarePath - 软件源码路径
   * @returns {string} 构建命令
   */
  generateBuildCommand(softwarePath) {
    return `/cli-anything ${softwarePath}`;
  }

  /**
   * 生成 refine 命令
   * @param {string} softwarePath - 软件路径
   * @param {string} focus - 专注区域（可选）
   * @returns {string} refine 命令
   */
  generateRefineCommand(softwarePath, focus) {
    let cmd = `/cli-anything:refine ${softwarePath}`;
    if (focus) {
      cmd += ` "${focus}"`;
    }
    return cmd;
  }

  /**
   * 获取 HARNESS.md 内容
   * @returns {string} HARNESS.md 内容
   */
  getHARNESSTemplate() {
    const harnessPath = path.join(
      this.cliAnythingPath,
      'cli-anything-plugin',
      'HARNESS.md'
    );

    try {
      if (fs.existsSync(harnessPath)) {
        return fs.readFileSync(harnessPath, 'utf-8');
      }
    } catch (error) {
      console.error('读取 HARNESS.md 失败:', error.message);
    }

    // 返回空模板
    return this._getDefaultHARNESSTemplate();
  }

  /**
   * 执行7阶段流水线
   * @param {string} softwarePath - 软件路径
   * @returns {Promise<Array>} 流水线命令序列
   */
  async executePipeline(softwarePath) {
    return [
      {
        phase: 'phase-0-source',
        command: `验证源码: ${softwarePath}`,
        description: 'Phase 0: 源获取'
      },
      {
        phase: 'phase-1-analyze',
        command: this.generateBuildCommand(softwarePath),
        description: 'Phase 1-7: 分析 → 设计 → 实现 → 测试 → 文档 → 发布'
      },
      {
        phase: 'phase-install',
        command: `cd ${softwarePath}/agent-harness && pip install -e .`,
        description: '安装生成的 CLI'
      },
      {
        phase: 'phase-verify',
        command: `which cli-anything-${path.basename(softwarePath)}`,
        description: '验证安装成功'
      }
    ];
  }

  /**
   * 分析项目结构并推荐策略
   * @param {Object} structure - 项目结构
   * @returns {Object} 分析结果
   */
  analyzeProject(structure) {
    const files = structure.files || [];
    const fileNames = files.map(f => f.toLowerCase());

    // 判断项目类型
    let projectType = 'unknown';
    if (fileNames.includes('requirements.txt') || fileNames.includes('setup.py')) {
      projectType = 'python';
    } else if (fileNames.includes('package.json')) {
      projectType = 'nodejs';
    }

    // 推荐策略
    const strategy = {
      projectType,
      recommendedStrategy: 'cli-anything',
      estimatedTime: this._estimateTime(projectType),
      canUseBuiltin: false,  // 不再使用虚构的内置引擎
      requiresExternalTool: true
    };

    return strategy;
  }

  /**
   * 检测 CLI-Anything 路径
   * @private
   * @returns {string} CLI-Anything 路径
   */
  _detectCLIAnythingPath() {
    // 常见路径
    const commonPaths = [
      'f:\\aa\\stigmergy-plc-edu\\CLI-Anything',
      'f:\\aa\\CLI-Anything',
      path.join(process.env.HOME || process.env.USERPROFILE, 'CLI-Anything')
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    // 默认返回占位路径
    return 'CLI-Anything_NOT_FOUND';
  }

  /**
   * 估算时间
   * @private
   */
  _estimateTime(projectType) {
    switch (projectType) {
      case 'python':
      case 'nodejs':
        return '30-60分钟';
      default:
        return '60-120分钟';
    }
  }

  /**
   * 获取默认 HARNESS 模板
   * @private
   */
  _getDefaultHARNESSTemplate() {
    return `# CLI-Anything HARNESS.md 核心方法论

## 关键原则

1. **使用真实软件** - CLI必须调用实际应用程序，不要重新实现功能
2. **渲染差距处理** - 项目文件中的效果在渲染时必须正确处理
3. **时间码精度** - 非整数帧率使用 round() 而非 int()
4. **输出验证** - 永远不要信任导出成功，必须程序化验证

## 7阶段流水线

Phase 0: 源获取
Phase 1: 代码库分析
Phase 2: CLI架构设计
Phase 3: 实现
Phase 4: 测试规划
Phase 5: 测试实现
Phase 6: 测试文档化
Phase 7: PyPI发布和安装
`;
  }
}

module.exports = {
  CLIAnythingIntegrator
};
