/**
 * CLI生成引擎
 * 负责CLI工具选择、溯源生成、验证、文档生成
 */

const { CLITool, InputType } = require('./types');

class CLIGenerationEngine {
  /**
   * 选择CLI工具
   * @param {string} inputType - 输入类型
   * @returns {string|null} CLI工具名称
   */
  selectTool(inputType) {
    switch (inputType) {
      case InputType.SOURCE_CODE:
      case InputType.DESKTOP_SOFTWARE:
        return CLITool.CLI_ANYTHING;
      case InputType.WEBSITE:
        return CLITool.OPENCLI;
      case InputType.NONE:
        return null;
      default:
        return null;
    }
  }

  /**
   * 生成CLI溯源信息
   * @param {Object} options - 生成选项
   * @returns {Object} CLI溯源对象
   */
  generateProvenance(options) {
    return {
      cliName: options.cliName,
      sourceType: options.sourceType,
      sourceUrl: options.sourceUrl,
      generatedAt: new Date().toISOString(),
      generatedBy: options.cliTool,
      capabilities: options.capabilities,
      testPassed: false  // 初始未测试
    };
  }

  /**
   * 验证CLI生成结果
   * @param {Object} cliResult - CLI结果
   * @returns {Object} 验证结果 { valid, errors }
   */
  validateCLI(cliResult) {
    const errors = [];

    // 验证必需字段
    if (!cliResult.cliName) {
      errors.push('缺少CLI名称');
    }

    if (!cliResult.commands || cliResult.commands.length === 0) {
      errors.push('CLI命令列表不能为空');
    }

    if (!cliResult.testSuccess) {
      errors.push('CLI测试未通过');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 生成CLI使用文档
   * @param {Object} options - 文档选项
   * @returns {string} Markdown格式文档
   */
  generateDocumentation(options) {
    const lines = [
      `# ${options.cliName}`,
      '',
      options.description || 'CLI工具',
      '',
      '## 命令列表',
      ''
    ];

    // 添加命令表格
    options.commands.forEach(cmd => {
      lines.push(`### ${cmd.name}`);
      lines.push('');
      lines.push(cmd.description || '');
      if (cmd.params && cmd.params.length > 0) {
        lines.push('');
        lines.push('**参数:**');
        lines.push('');
        cmd.params.forEach(param => {
          lines.push(`- \`${param}\``);
        });
      }
      lines.push('');
    });

    // 添加使用示例
    if (options.examples && options.examples.length > 0) {
      lines.push('## 使用示例');
      lines.push('');
      lines.push('```bash');
      options.examples.forEach(example => {
        lines.push(example);
      });
      lines.push('```');
    }

    return lines.join('\n');
  }

  /**
   * 生成完整孵化报告
   * @param {Object} options - 孵化选项
   * @returns {Object} 孵化报告
   */
  generateIncubationReport(options) {
    return {
      idea: options.idea,
      inputType: options.inputType,
      sourceUrl: options.sourceUrl,
      cliTool: options.cliTool,
      cliName: options.cliName,
      provenance: options.provenance,
      baseSkills: options.baseSkills,
      estimatedTime: options.estimatedTime,
      generatedAt: new Date().toISOString()
    };
  }
}

module.exports = {
  CLIGenerationEngine
};
