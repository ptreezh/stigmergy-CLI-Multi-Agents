#!/usr/bin/env node
/**
 * 自动记忆 Hook
 *
 * 在各个 CLI 会话结束时自动触发
 * 提取经验教训，更新共享记忆
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class AutoMemoryHook {
  constructor() {
    this.projectDir = process.cwd();
    this.stigmergyMd = path.join(this.projectDir, 'STIGMERGY.md');
    this.soulMd = path.join(this.projectDir, 'SOUL.md');
  }

  /**
   * 在会话结束时自动调用
   */
  async onSessionEnd(sessionData) {
    console.log('\n🧠 [自动记忆] 会话结束，提取经验...');

    try {
      // 1. 分析会话内容
      const insights = this.analyzeSession(sessionData);

      if (insights.length > 0) {
        // 2. 更新共享记忆
        await this.updateSharedMemory(insights);

        // 3. 对齐 SOUL.md
        await this.alignWithSoul(insights);

        console.log(`   ✅ 提取 ${insights.length} 条经验，已更新共享记忆`);
      }

    } catch (error) {
      console.error('   ❌ 自动记忆失败:', error.message);
    }
  }

  /**
   * 分析会话，提取有价值的洞察
   */
  analyzeSession(sessionData) {
    const insights = [];

    // 从会话消息中提取信息
    const messages = sessionData.messages || sessionData.conversation || [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      const content = this.extractContent(msg);

      // 检测成功的模式
      if (this.detectSuccess(content, i, messages)) {
        insights.push({
          type: 'success',
          content: content.substring(0, 200),
          confidence: 0.8
        });
      }

      // 检测问题
      if (this.detectProblem(content)) {
        insights.push({
          type: 'problem',
          content: content.substring(0, 200),
          confidence: 0.7
        });
      }

      // 检测解决方案
      if (this.detectSolution(content)) {
        insights.push({
          type: 'solution',
          content: content.substring(0, 200),
          confidence: 0.9
        });
      }

      // 检测学习内容
      if (this.detectLearning(content)) {
        insights.push({
          type: 'learning',
          content: content.substring(0, 200),
          confidence: 0.7
        });
      }
    }

    return insights;
  }

  /**
   * 提取消息内容
   */
  extractContent(msg) {
    if (typeof msg === 'string') {
      return msg;
    }

    if (msg && typeof msg === 'object') {
      return msg.message?.content ||
             msg.content ||
             msg.text ||
             JSON.stringify(msg);
    }

    return '';
  }

  /**
   * 检测成功模式
   */
  detectSuccess(content, index, messages) {
    const successIndicators = [
      '成功', '完成', '✅', 'works', 'solved', 'fixed',
      'success', 'completed', 'done', 'achieved'
    ];

    return successIndicators.some(indicator =>
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * 检测问题
   */
  detectProblem(content) {
    const problemIndicators = [
      '错误', '失败', '问题', 'bug', 'error', 'issue',
      '不能', '无法', '失败', 'exception'
    ];

    return problemIndicators.some(indicator =>
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * 检测解决方案
   */
  detectSolution(content) {
    const solutionIndicators = [
      '解决', '修复', '改进', '优化', '方案',
      'solve', 'fix', 'improve', 'optimize', 'solution'
    ];

    return solutionIndicators.some(indicator =>
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * 检测学习内容
   */
  detectLearning(content) {
    const learningIndicators = [
      '学习', '发现', '理解', '领悟', '明白',
      'learn', 'discover', 'understand', 'realize'
    ];

    return learningIndicators.some(indicator =>
      content.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  /**
   * 更新共享记忆
   */
  async updateSharedMemory(insights) {
    const timestamp = new Date().toISOString();
    const cli = process.env.STIGMERGY_CLI_NAME || 'unknown';

    // 追加到 STIGMERGY.md
    const memoryEntry = `
## 独立运行会话 - ${Date.now()}
**CLI**: ${cli}
**时间**: ${timestamp}
**洞察数量**: ${insights.length}

### 经验教训
${insights.map((insight, i) => `${i + 1}. **${insight.type}**: ${insight.content.substring(0, 100)}...`).join('\n')}

---

`;

    fs.appendFileSync(this.stigmergyMd, memoryEntry);
  }

  /**
   * 对齐 SOUL.md
   */
  async alignWithSoul(insights) {
    // 读取当前的 SOUL.md
    let soulContent = '';
    if (fs.existsSync(this.soulMd)) {
      soulContent = fs.readFileSync(this.soulMd, 'utf-8');
    }

    // 分析是否需要更新 SOUL.md
    const needsUpdate = this.checkSoulAlignment(soulContent, insights);

    if (needsUpdate) {
      // 可以根据洞察自动更新 SOUL.md
      // 当前实现：记录需要更新
      console.log('   💡 建议：更新 SOUL.md 以反映新的经验');
    }
  }

  /**
   * 检查与 SOUL.md 的对齐情况
   */
  checkSoulAlignment(soulContent, insights) {
    // 简单实现：检查洞察是否包含 SOUL.md 中的关键词
    const soulKeywords = extractKeywords(soulContent);
    const insightKeywords = insights.flatMap(i => extractKeywords(i.content));

    const aligned = insightKeywords.some(k => soulKeywords.includes(k));
    return !aligned; // 如果没有对齐，需要更新
  }

  /**
   * 从文本中提取关键词
   */
  extractKeywords(text) {
    // 简单的关键词提取
    const words = text.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3)
      .filter(w => !/^[0-9]+$/.test(w));

    // 去重
    return [...new Set(words)];
  }
}

/**
 * 简化的关键词提取函数
 */
function extractKeywords(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  return text.toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3)
    .filter(w => !/^[0-9]+$/.test(w));
}

// 导出
module.exports = { AutoMemoryHook };

// 如果直接运行
if (require.main === module) {
  const hook = new AutoMemoryHook();

  // 模拟会话数据
  const mockSessionData = {
    messages: [
      { role: 'user', content: '帮我优化这段代码' },
      { role: 'assistant', content: '✅ 代码优化成功，性能提升了30%' },
      { role: 'user', content: '太好了，学到了很多' }
    ]
  };

  hook.onSessionEnd(mockSessionData).then(() => {
    console.log('\n✅ 自动记忆 Hook 测试完成');
    process.exit(0);
  }).catch(error => {
    console.error('❌ 测试失败:', error);
    process.exit(1);
  });
}
