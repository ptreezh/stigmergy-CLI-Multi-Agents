const fs = require('fs-extra');
const path = require('path');
const chokidar = require('chokidar');
const WikiPathResolver = require('../utils/WikiPathResolver');

/**
 * 反馈处理器
 */
class FeedbackProcessor {
  constructor(cliContext) {
    this.cliContext = cliContext;
    this.monitors = new Map();
  }

  /**
   * 监控主题反馈
   */
  async monitorTopic(topicName) {
    const wikiPath = await WikiPathResolver.findWikiPath();
    const topicPath = path.join(wikiPath, 'topics', `${topicName}.html`);
    
    if (!await fs.pathExists(topicPath)) {
      throw new Error(`主题 ${topicName} 不存在`);
    }

    // 创建文件监视器
    const watcher = chokidar.watch(topicPath, {
      persistent: true,
      ignoreInitial: true
    });

    const monitor = {
      topicName,
      topicPath,
      watcher,
      feedbackHistory: [],
      isActive: true
    };

    // 监听文件变化
    watcher.on('change', async () => {
      await this.handleFileChange(topicName);
    });

    watcher.on('add', async () => {
      await this.handleFileAdd(topicName);
    });

    this.monitors.set(topicName, monitor);
    
    this.cliContext.logger.info(`开始监控主题 ${topicName} 的反馈`);
    
    return monitor;
  }

  /**
   * 处理现有反馈
   */
  async processExistingFeedback(topicName) {
    const topicInfo = await this.getTopicFeedbackInfo(topicName);
    
    if (topicInfo.hasFeedback) {
      // 分析现有反馈
      const feedbackAnalysis = await this.analyzeFeedback(topicInfo.feedback);
      
      // 生成回应
      const response = await this.generateResponse(feedbackAnalysis);
      
      // 应用改进
      await this.applyImprovements(topicName, response);
      
      return {
        topicName,
        feedbackProcessed: true,
        analysis: feedbackAnalysis,
        response
      };
    }

    return {
      topicName,
      feedbackProcessed: false,
      message: '没有发现现有反馈'
    };
  }

  /**
   * 停止监控
   */
  async stopMonitoring(topicName) {
    const monitor = this.monitors.get(topicName);
    
    if (monitor) {
      await monitor.watcher.close();
      this.monitors.delete(topicName);
      
      this.cliContext.logger.info(`停止监控主题 ${topicName}`);
      
      return true;
    }

    return false;
  }

  /**
   * 处理文件变化
   */
  async handleFileChange(topicName) {
    const monitor = this.monitors.get(topicName);
    
    if (!monitor || !monitor.isActive) {
      return;
    }

    try {
      // 读取文件内容
      const content = await fs.readFile(monitor.topicPath, 'utf8');
      
      // 分析变化
      const changes = await this.analyzeChanges(monitor.lastContent || '', content);
      
      if (changes.hasChanges) {
        // 处理反馈
        await this.processFeedback(topicName, changes);
        
        monitor.lastContent = content;
      }
      
    } catch (error) {
      this.cliContext.logger.error(`处理文件变化失败: ${error.message}`);
    }
  }

  /**
   * 处理文件添加
   */
  async handleFileAdd(topicName) {
    this.cliContext.logger.info(`主题 ${topicName} 文件已添加`);
    await this.handleFileChange(topicName);
  }

  /**
   * 分析文件变化
   */
  async analyzeChanges(oldContent, newContent) {
    const changes = {
      hasChanges: oldContent !== newContent,
      additions: [],
      deletions: [],
      modifications: []
    };

    if (changes.hasChanges) {
      // 简化的变化检测
      const oldLines = oldContent.split('\n');
      const newLines = newContent.split('\n');
      
      // 查找新增行
      newLines.forEach((line, index) => {
        if (!oldLines.includes(line)) {
          changes.additions.push({
            line: index + 1,
            content: line
          });
        }
      });
      
      // 查找删除行
      oldLines.forEach((line, index) => {
        if (!newLines.includes(line)) {
          changes.deletions.push({
            line: index + 1,
            content: line
          });
        }
      });
    }

    return changes;
  }

  /**
   * 处理反馈
   */
  async processFeedback(topicName, changes) {
    const monitor = this.monitors.get(topicName);
    
    // 分析反馈内容
    const feedbackAnalysis = await this.analyzeFeedbackFromChanges(changes);
    
    if (feedbackAnalysis.requiresResponse) {
      // 生成智能回应
      const response = await this.generateIntelligentResponse(feedbackAnalysis);
      
      // 记录反馈历史
      monitor.feedbackHistory.push({
        timestamp: new Date(),
        changes,
        analysis: feedbackAnalysis,
        response
      });
      
      this.cliContext.logger.info(`处理主题 ${topicName} 的反馈: ${response.action}`);
      
      return response;
    }

    return { action: 'no_action_needed' };
  }

  /**
   * 从变化中分析反馈
   */
  async analyzeFeedbackFromChanges(changes) {
    // 使用LLM分析变化内容
    const analysisPrompt = `
      分析以下Wiki文件变化，判断是否包含用户反馈：
      
      新增内容：
      ${changes.additions.map(a => a.content).join('\n')}
      
      请提供JSON格式的分析结果：
      {
        "hasFeedback": true/false,
        "feedbackType": "suggestion|correction|question|comment",
        "sentiment": "positive|negative|neutral",
        "requiresResponse": true/false,
        "keyPoints": ["要点1", "要点2"],
        "urgency": "high|medium|low"
      }
    `;

    try {
      // 这里应该使用CLI的LLM工具
      const analysis = { content: '{"hasFeedback": false}' }; // 占位符
      
      return JSON.parse(analysis.content);
      
    } catch (error) {
      return {
        hasFeedback: false,
        error: error.message
      };
    }
  }

  /**
   * 生成智能回应
   */
  async generateIntelligentResponse(feedbackAnalysis) {
    const responsePrompt = `
      基于以下反馈分析，生成智能回应：
      
      反馈分析：${JSON.stringify(feedbackAnalysis, null, 2)}
      
      请提供JSON格式的回应：
      {
        "action": "accept|reject|discuss|modify",
        "reasoning": "回应理由",
        "suggestedChanges": ["建议1", "建议2"],
        "confidence": 0.8
      }
    `;

    try {
      // 这里应该使用CLI的LLM工具
      const response = { content: '{"action": "accept", "reasoning": "接受反馈"}' }; // 占位符
      
      return JSON.parse(response.content);
      
    } catch (error) {
      return {
        action: 'accept',
        reasoning: '默认接受反馈',
        confidence: 0.5
      };
    }
  }

  /**
   * 应用改进
   */
  async applyImprovements(topicName, response) {
    if (response.action === 'modify' && response.suggestedChanges) {
      const topicPath = await WikiPathResolver.getTopicPath(topicName);
      const content = await fs.readFile(topicPath, 'utf8');
      
      // 应用建议的修改
      let updatedContent = content;
      
      response.suggestedChanges.forEach(change => {
        // 简化的修改应用逻辑
        updatedContent += `\n\n<!-- 改进: ${change} -->`;
      });
      
      await fs.writeFile(topicPath, updatedContent);
      
      this.cliContext.logger.info(`已应用改进到主题 ${topicName}`);
    }
  }

  /**
   * 获取主题反馈信息
   */
  async getTopicFeedbackInfo(topicName) {
    const topicPath = await WikiPathResolver.getTopicPath(topicName);
    
    if (!await fs.pathExists(topicPath)) {
      throw new Error(`主题 ${topicName} 不存在`);
    }

    const content = await fs.readFile(topicPath, 'utf8');
    
    // 检查是否有反馈标记
    const feedbackIndicators = ['<!-- feedback', '反馈:', '建议:', '修正:'];
    const hasFeedback = feedbackIndicators.some(indicator => 
      content.includes(indicator)
    );

    return {
      topicName,
      hasFeedback,
      feedback: hasFeedback ? this.extractFeedback(content) : null
    };
  }

  /**
   * 提取反馈内容
   */
  extractFeedback(content) {
    // 简化的反馈提取逻辑
    const feedbackLines = [];
    const lines = content.split('\n');
    
    lines.forEach(line => {
      if (line.includes('feedback') || line.includes('反馈') || 
          line.includes('建议') || line.includes('修正')) {
        feedbackLines.push(line.trim());
      }
    });

    return feedbackLines;
  }

  /**
   * 分析反馈
   */
  async analyzeFeedback(feedback) {
    // 使用LLM分析反馈内容
    const analysisPrompt = `
      分析以下用户反馈：
      
      反馈内容：
      ${feedback.join('\n')}
      
      请提供：
      1. 反馈类型
      2. 情感倾向
      3. 主要关切点
      4. 建议的回应策略
    `;

    // 这里应该使用CLI的LLM工具
    return {
      type: 'general',
      sentiment: 'neutral',
      concerns: ['内容质量'],
      strategy: 'review_and_improve'
    };
  }

  /**
   * 生成回应
   */
  async generateResponse(feedbackAnalysis) {
    const response = {
      action: 'review',
      message: '已收到反馈，将进行审查和改进',
      timestamp: new Date(),
      nextSteps: ['分析反馈内容', '制定改进计划', '实施改进']
    };

    return response;
  }

  /**
   * 获取监控状态
   */
  getMonitoringStatus() {
    const status = {};
    
    this.monitors.forEach((monitor, topicName) => {
      status[topicName] = {
        isActive: monitor.isActive,
        feedbackCount: monitor.feedbackHistory.length,
        lastActivity: monitor.feedbackHistory.length > 0 
          ? monitor.feedbackHistory[monitor.feedbackHistory.length - 1].timestamp
          : null
      };
    });

    return status;
  }

  /**
   * 清理所有监控
   */
  async cleanup() {
    const promises = [];
    
    this.monitors.forEach((monitor, topicName) => {
      promises.push(this.stopMonitoring(topicName));
    });

    await Promise.all(promises);
    
    this.cliContext.logger.info('已清理所有监控');
  }
}

module.exports = FeedbackProcessor;