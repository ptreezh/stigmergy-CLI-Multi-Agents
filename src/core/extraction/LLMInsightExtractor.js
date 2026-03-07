#!/usr/bin/env node
/**
 * LLM驱动的经验提取器
 * 基于可用CLI的模型算力进行智能经验提取
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class LLMInsightExtractor {
  constructor() {
    this.projectDir = process.cwd();
    this.stigmergyMd = path.join(this.projectDir, 'STIGMERGY.md');
  }

  /**
   * 使用可用的CLI分析会话并提取经验
   */
  async extractFromSession(sessionContent, cliType = 'auto') {
    console.log(`[LLM提取] 使用 ${cliType} 分析会话...`);

    // 1. 选择最合适的CLI
    const selectedCLI = await this.selectBestCLI(cliType, sessionContent);
    console.log(`[LLM提取] 选择 ${selectedCLI} 进行分析`);

    // 2. 构建分析提示词
    const prompt = this.buildAnalysisPrompt(sessionContent);

    // 3. 调用选定的CLI进行分析
    const analysis = await this.callCLIForAnalysis(selectedCLI, prompt);

    // 4. 解析和格式化结果
    const structuredInsights = this.parseAnalysisResult(analysis);

    return {
      ...structuredInsights,
      sourceCLI: selectedCLI,
      extractedAt: new Date().toISOString()
    };
  }

  /**
   * 智能选择最合适的CLI
   */
  async selectBestCLI(preferredCLI, sessionContent) {
    if (preferredCLI !== 'auto') {
      return preferredCLI;
    }

    // 检测会话内容特征
    const hasChinese = /[\u4e00-\u9fa5]/.test(sessionContent);
    const hasCode = /```(?:javascript|python|java|go|rust)/.test(sessionContent);
    const isComplex = sessionContent.length > 1000;

    // 根据特征选择CLI
    if (hasChinese && !hasCode) {
      return 'qwen';  // 中文内容优先用qwen
    } else if (hasCode && isComplex) {
      return 'claude';  // 复杂代码分析用claude
    } else if (hasCode) {
      return 'codebuddy';  // 代码相关问题用codebuddy
    } else {
      return 'claude';  // 默认用claude
    }
  }

  /**
   * 构建分析提示词
   */
  buildAnalysisPrompt(sessionContent) {
    return `
你是一个技术经验提取专家。请分析以下会话内容，提取有价值的经验教训。

## 会话内容
\`\`\`
${sessionContent}
\`\`\`

## 提取要求

请按以下金字塔格式提取经验：

# 经验层级 1：快速概览
<用一句话总结这个经验的核心价值>

# 经验层级 2：核心要点
## 问题是什么
<简洁描述问题，不超过50字>

## 解决方案
<核心方法，不超过50字>

## 适用场景
<3个关键词，用逗号分隔>

# 经验层级 3：详细说明
### 问题分析
<详细背景，包括为什么这个问题重要>

### 实施步骤
1. <步骤一>
2. <步骤二>
3. <步骤三>

### 代码示例
如果会话中有代码，提取关键模式；如果没有，写"无代码示例"

### 验证方法
<如何验证解决方案有效>

# 经验层级 4：上下文和变体
### 相关经验
<相关的技术或方法>

### 变体和扩展
<其他可能的解决方案>

### 注意事项
<限制、风险或需要小心的地方>

# 经验层级 5：元数据
### 可信度评估
基于会话内容，评估这个经验的可信度为：
- 高 (90-100%): 有明确证据和验证
- 中 (70-89%): 合理但需要验证
- 低 (<70%): 推测性的，需要测试

请给出你的评估和理由。

### 复用难度
- 低: 直接复制即可
- 中: 需要适应调整
- 高: 需要深入理解

请严格按照上述格式输出，不要添加其他内容。
`;
  }

  /**
   * 调用CLI进行分析
   */
  async callCLIForAnalysis(cliName, prompt) {
    return new Promise((resolve, reject) => {
      // 构建stigmergy call命令
      const command = `stigmergy ${cliName} "${prompt.replace(/"/g, '\\"')}"`;

      console.log(`[LLM提取] 执行命令: ${command.substring(0, 100)}...`);

      const cli = spawn(command, {
        shell: true,
        stdio: ['inherit', 'pipe', 'pipe'],
        timeout: 120000 // 2分钟超时
      });

      let output = '';
      let errorOutput = '';

      cli.stdout.on('data', (data) => {
        output += data.toString();
      });

      cli.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      cli.on('close', (code) => {
        if (code === 0 && output.trim()) {
          resolve(output.trim());
        } else {
          // 如果CLI调用失败，返回基础分析
          console.log(`[LLM提取] CLI调用失败，使用基础分析`);
          resolve(this.basicAnalysis(prompt));
        }
      });

      cli.on('error', (error) => {
        console.log(`[LLM提取] CLI执行失败，使用基础分析`);
        resolve(this.basicAnalysis(prompt));
      });

      // 超时处理
      setTimeout(() => {
        cli.kill();
        console.log(`[LLM提取] CLI超时，使用基础分析`);
        resolve(this.basicAnalysis(prompt));
      }, 120000);
    });
  }

  /**
   * 基础分析方法（当CLI不可用时）
   */
  basicAnalysis(content) {
    // 简单的关键词和模式提取
    const hasSuccess = content.includes('成功') || content.includes('完成') || content.includes('✅');
    const hasProblem = content.includes('错误') || content.includes('失败') || content.includes('问题');
    const hasSolution = content.includes('解决') || content.includes('修复') || content.includes('优化');

    return `
# 经验层级 1：快速概览
${hasSuccess ? '成功完成了任务' : hasProblem ? '遇到并处理了问题' : '进行了技术讨论'}

# 经验层级 2：核心要点
## 问题是什么
${hasProblem ? '遇到了技术问题' : '需要完成的任务'}

## 解决方案
${hasSolution ? '找到并实施了解决方案' : '通过分析和讨论解决'}

## 适用场景
技术问题解决, 代码开发, 调试调试

# 经验层级 3：详细说明
### 问题分析
会话中讨论了技术问题及其解决方案

### 实施步骤
1. 分析问题
2. 寻找解决方案
3. 实施并验证

### 代码示例
会话中可能包含代码示例

### 验证方法
通过实际运行和测试验证

# 经验层级 4：上下文和变体
### 相关经验
类似的技术问题

### 变体和扩展
可能有其他解决方案

### 注意事项
需要根据具体情况调整

# 经验层级 5：元数据
### 可信度评估
中 (70%) - 基础分析，建议验证

### 复用难度
中 - 需要理解具体上下文
`;
  }

  /**
   * 解析分析结果
   */
  parseAnalysisResult(analysis) {
    // 提取各个层级的内容
    const levels = {
      level1: { name: '快速概览', content: '' },
      level2: { name: '核心要点', content: '' },
      level3: { name: '详细说明', content: '' },
      level4: { name: '上下文和变体', content: '' },
      level5: { name: '元数据', content: '' }
    };

    // 简单解析（实际可以用更复杂的markdown解析）
    const lines = analysis.split('\n');
    let currentLevel = null;

    for (const line of lines) {
      if (line.startsWith('# 经验层级 1')) {
        currentLevel = 'level1';
      } else if (line.startsWith('# 经验层级 2')) {
        currentLevel = 'level2';
      } else if (line.startsWith('# 经验层级 3')) {
        currentLevel = 'level3';
      } else if (line.startsWith('# 经验层级 4')) {
        currentLevel = 'level4';
      } else if (line.startsWith('# 经验层级 5')) {
        currentLevel = 'level5';
      } else if (currentLevel && line.trim()) {
        levels[currentLevel].content += line + '\n';
      }
    }

    return {
      levels,
      fullAnalysis: analysis,
      hasValidContent: analysis.includes('经验层级')
    };
  }

  /**
   * 格式化为金字塔MD格式
   */
  formatAsPyramidMD(insights) {
    if (!insights.hasValidContent) {
      return this.formatBasicPyramid(insights);
    }

    return `
${insights.fullAnalysis}

---
*提取时间: ${insights.extractedAt}*
*来源CLI: ${insights.sourceCLI}*
*格式: 金字塔式MD - 渐进式信息披露*
`;
  }

  /**
   * 基础金字塔格式（当分析失败时）
   */
  formatBasicPyramid(insights) {
    return `
# 经验层级 1：快速概览
技术会话经验 - 包含问题分析和解决方案

# 经验层级 2：核心要点
## 问题是什么
需要解决的技术问题或任务

## 解决方案
通过讨论和分析找到解决方案

## 适用场景
技术开发, 问题解决, 代码编写

# 经验层级 3：详细说明
### 问题分析
会话中讨论了具体的技术问题

### 实施步骤
1. 问题识别
2. 方案设计
3. 实施验证

### 代码示例
可能包含代码示例或技术讨论

### 验证方法
通过测试和实际应用验证

# 经验层级 4：上下文和变体
### 相关经验
相关技术领域和类似问题

### 变体和扩展
可能的替代方案

### 注意事项
需要根据实际情况应用

# 经验层级 5：元数据
### 可信度评估
中 (60%) - 基础格式化

### 复用难度
中 - 需要具体上下文

---
*提取时间: ${insights.extractedAt}*
*来源CLI: ${insights.sourceCLI}*
*格式: 金字塔式MD - 基础版本*
`;
  }

  /**
   * 将经验追加到STIGMERGY.md
   */
  async appendToMemory(pyramidMD) {
    try {
      fs.appendFileSync(this.stigmergyMd, pyramidMD);
      console.log('[LLM提取] ✅ 经验已追加到 STIGMERGY.md');
      return true;
    } catch (error) {
      console.error('[LLM提取] ❌ 追加失败:', error.message);
      return false;
    }
  }
}

module.exports = LLMInsightExtractor;
