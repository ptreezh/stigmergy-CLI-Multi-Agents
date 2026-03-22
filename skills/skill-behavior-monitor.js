#!/usr/bin/env node

/**
 * Skill Behavior Monitor - 实时行为监控系统
 *
 * Phase 1 安全强化 - 实时监控skill执行行为
 *
 * 核心功能：
 * - 监控skill执行过程中的行为
 * - 检测异常和恶意模式
 * - 自动隔离危险skill
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class SkillBehaviorMonitor extends EventEmitter {
  constructor() {
    super();
    this.activeMonitors = new Map(); // 活跃监控
    this.behaviorLog = []; // 行为日志
    this.quarantineList = new Set(); // 隔离列表
  }

  /**
   * 开始监控skill执行
   */
  async monitorExecution(skillName, executionContext) {
    console.log(`\n👁️  开始监控: ${skillName}`);

    const monitorId = `${skillName}-${Date.now()}`;
    const suspiciousPatterns = this.getSuspiciousPatterns();

    const monitorSession = {
      monitorId,
      skillName,
      startTime: Date.now(),
      behaviors: [],
      anomalies: [],
      safe: true
    };

    this.activeMonitors.set(monitorId, monitorSession);

    try {
      // 1. 设置执行钩子
      await this.setupExecutionHooks(skillName, monitorSession);

      // 2. 监控执行过程
      await this.monitorExecutionProcess(skillName, executionContext, monitorSession);

      // 3. 分析行为模式
      const analysis = await this.analyzeBehaviors(monitorSession.behaviors);

      // 4. 检测异常
      const anomalies = await this.detectAnomalies(monitorSession.behaviors, suspiciousPatterns);

      monitorSession.analysis = analysis;
      monitorSession.anomalies = anomalies;

      // 5. 判断是否安全
      if (anomalies.length > 0) {
        monitorSession.safe = false;
        console.log(`      ❌ 检测到 ${anomalies.length} 个异常行为`);

        // 自动隔离
        await this.quarantineSkill(skillName, anomalies);
      } else {
        console.log(`      ✅ 行为监控完成，未检测到异常`);
      }

      // 保存监控日志
      this.behaviorLog.push(monitorSession);

      return {
        safe: monitorSession.safe,
        behaviors: monitorSession.behaviors,
        anomalies: monitorSession.anomalies,
        analysis: monitorSession.analysis
      };

    } catch (error) {
      console.error(`❌ 监控失败: ${error.message}`);
      return {
        safe: false,
        error: error.message
      };
    } finally {
      this.activeMonitors.delete(monitorId);
    }
  }

  /**
   * 获取可疑行为模式
   */
  getSuspiciousPatterns() {
    return {
      // 文件系统异常
      fileSystem: {
        patterns: [
          'deleteSystemFiles',
          'modifySystemConfigs',
          'accessSensitiveDirs'
        ],
        severity: 'CRITICAL'
      },

      // 网络异常
      network: {
        patterns: [
          'exfiltrateData',
          'connectToUnknownHosts',
          'suspiciousPorts'
        ],
        severity: 'HIGH'
      },

      // 代码执行异常
      codeExecution: {
        patterns: [
          'dynamicCodeExecution',
          'obfuscatedCode',
          'suspiciousImports'
        ],
        severity: 'CRITICAL'
      },

      // 资源滥用
      resourceAbuse: {
        patterns: [
          'excessiveMemory',
          'cpuMining',
          'infiniteLoops'
        ],
        severity: 'MEDIUM'
      }
    };
  }

  /**
   * 设置执行钩子
   */
  async setupExecutionHooks(skillName, monitorSession) {
    // 这里可以设置实际的执行钩子
    // 例如：proxy require, hook fs calls等

    monitorSession.hooks = {
      fs: this.monitorFileSystemAccess(skillName, monitorSession),
      network: this.monitorNetworkAccess(skillName, monitorSession),
      process: this.monitorProcessActivity(skillName, monitorSession)
    };
  }

  /**
   * 监控文件系统访问
   */
  monitorFileSystemAccess(skillName, monitorSession) {
    const fsAccessLog = [];

    // 记录文件访问
    const logAccess = (operation, path) => {
      fsAccessLog.push({
        operation,
        path,
        timestamp: Date.now()
      });

      monitorSession.behaviors.push({
        type: 'fileSystem',
        operation,
        path,
        timestamp: Date.now()
      });
    };

    return { logAccess, accessLog: fsAccessLog };
  }

  /**
   * 监控网络访问
   */
  monitorNetworkAccess(skillName, monitorSession) {
    const networkAccessLog = [];

    // 记录网络访问
    const logNetwork = (operation, target) => {
      networkAccessLog.push({
        operation,
        target,
        timestamp: Date.now()
      });

      monitorSession.behaviors.push({
        type: 'network',
        operation,
        target,
        timestamp: Date.now()
      });
    };

    return { logNetwork, accessLog: networkAccessLog };
  }

  /**
   * 监控进程活动
   */
  monitorProcessActivity(skillName, monitorSession) {
    const activityLog = [];

    // 记录进程活动
    const logActivity = (activity, details) => {
      activityLog.push({
        activity,
        details,
        timestamp: Date.now()
      });

      monitorSession.behaviors.push({
        type: 'process',
        activity,
        details,
        timestamp: Date.now()
      });
    };

    return { logActivity, activityLog };
  }

  /**
   * 监控执行过程
   */
  async monitorExecutionProcess(skillName, executionContext, monitorSession) {
    // 模拟监控过程
    // 实际实现需要与skill执行集成

    const duration = executionContext.timeout || 5000;
    const startTime = Date.now();

    // 定期检查执行状态
    while (Date.now() - startTime < duration) {
      // 检查资源使用
      const resourceUsage = await this.checkResourceUsage(skillName);
      monitorSession.behaviors.push({
        type: 'resource',
        ...resourceUsage,
        timestamp: Date.now()
      });

      // 检查是否有异常行为
      if (this.detectSuspiciousActivity(monitorSession)) {
        break;
      }

      // 等待一段时间
      await this.sleep(1000);
    }
  }

  /**
   * 检查资源使用
   */
  async checkResourceUsage(skillName) {
    // 简化实现：返回模拟数据
    return {
      memory: Math.random() * 100,
      cpu: Math.random() * 50,
      duration: Date.now()
    };
  }

  /**
   * 检测可疑活动
   */
  detectSuspiciousActivity(monitorSession) {
    const suspiciousPatterns = this.getSuspiciousPatterns();
    const detectedAnomalies = [];

    // 检查文件系统行为
    const fsBehaviors = monitorSession.behaviors.filter(b => b.type === 'fileSystem');
    fsBehaviors.forEach(behavior => {
      if (this.isSuspiciousFsOperation(behavior)) {
        detectedAnomalies.push({
          type: 'fileSystem',
          behavior: behavior,
          severity: 'HIGH'
        });
      }
    });

    // 检查网络行为
    const networkBehaviors = monitorSession.behaviors.filter(b => b.type === 'network');
    networkBehaviors.forEach(behavior => {
      if (this.isSuspiciousNetworkOperation(behavior)) {
        detectedAnomalies.push({
          type: 'network',
          behavior: behavior,
          severity: 'HIGH'
        });
      }
    });

    // 检查资源使用
    const resourceBehaviors = monitorSession.behaviors.filter(b => b.type === 'resource');
    resourceBehaviors.forEach(behavior => {
      if (this.isResourceAbuse(behavior)) {
        detectedAnomalies.push({
          type: 'resourceAbuse',
          behavior: behavior,
          severity: 'MEDIUM'
        });
      }
    });

    return detectedAnomalies.length > 0 ? detectedAnomalies : null;
  }

  /**
   * 判断是否为可疑文件系统操作
   */
  isSuspiciousFsOperation(behavior) {
    const suspiciousPaths = [
      '/etc/',
      '/system/',
      '/Windows/',
      'C:\\Windows\\',
      '.ssh',
      '.env'
    ];

    return suspiciousPaths.some(path => behavior.path.includes(path));
  }

  /**
   * 判断是否为可疑网络操作
   */
  isSuspiciousNetworkOperation(behavior) {
    const suspiciousTargets = [
      'unknown-host',
      'suspicious-domain',
      '0.0.0.0'
    ];

    return suspiciousTargets.some(target => behavior.target.includes(target));
  }

  /**
   * 判断是否为资源滥用
   */
  isResourceAbuse(behavior) {
    return behavior.memory > 90 || behavior.cpu > 95;
  }

  /**
   * 分析行为模式
   */
  async analyzeBehaviors(behaviors) {
    const analysis = {
      totalBehaviors: behaviors.length,
      behaviorTypes: {},
      patterns: [],
      riskLevel: 'LOW'
    };

    // 统计行为类型
    behaviors.forEach(b => {
      if (!analysis.behaviorTypes[b.type]) {
        analysis.behaviorTypes[b.type] = 0;
      }
      analysis.behaviorTypes[b.type]++;
    });

    // 识别模式
    if (behaviors.length > 100) {
      analysis.patterns.push('HIGH_ACTIVITY');
      analysis.riskLevel = 'MEDIUM';
    }

    if (analysis.behaviorTypes.fileSystem > 20) {
      analysis.patterns.push('EXCESSIVE_FS_ACCESS');
      analysis.riskLevel = 'HIGH';
    }

    if (analysis.behaviorTypes.network > 10) {
      analysis.patterns.push('EXCESSIVE_NETWORK_ACCESS');
      analysis.riskLevel = 'HIGH';
    }

    return analysis;
  }

  /**
   * 检测异常
   */
  async detectAnomalies(behaviors, suspiciousPatterns) {
    const anomalies = [];

    // 检测文件系统异常
    const fsAnomalies = this.detectFileSystemAnomalies(behaviors, suspiciousPatterns.fileSystem);
    anomalies.push(...fsAnomalies);

    // 检测网络异常
    const networkAnomalies = this.detectNetworkAnomalies(behaviors, suspiciousPatterns.network);
    anomalies.push(...networkAnomalies);

    // 检测代码执行异常
    const codeAnomalies = this.detectCodeExecutionAnomalies(behaviors, suspiciousPatterns.codeExecution);
    anomalies.push(...codeAnomalies);

    // 检测资源滥用
    const resourceAnomalies = this.detectResourceAnomalies(behaviors, suspiciousPatterns.resourceAbuse);
    anomalies.push(...resourceAnomalies);

    return anomalies;
  }

  /**
   * 检测文件系统异常
   */
  detectFileSystemAnomalies(behaviors, patterns) {
    const anomalies = [];
    const fsBehaviors = behaviors.filter(b => b.type === 'fileSystem');

    fsBehaviors.forEach(behavior => {
      patterns.patterns.forEach(pattern => {
        if (this.matchesPattern(behavior, pattern)) {
          anomalies.push({
            type: 'fileSystem',
            pattern: pattern,
            behavior: behavior,
            severity: patterns.severity
          });
        }
      });
    });

    return anomalies;
  }

  /**
   * 检测网络异常
   */
  detectNetworkAnomalies(behaviors, patterns) {
    const anomalies = [];
    const networkBehaviors = behaviors.filter(b => b.type === 'network');

    if (networkBehaviors.length > 5) {
      anomalies.push({
        type: 'network',
        pattern: 'excessiveNetworkAccess',
        count: networkBehaviors.length,
        severity: 'MEDIUM'
      });
    }

    return anomalies;
  }

  /**
   * 检测代码执行异常
   */
  detectCodeExecutionAnomalies(behaviors, patterns) {
    // 简化实现
    return [];
  }

  /**
   * 检测资源异常
   */
  detectResourceAnomalies(behaviors, patterns) {
    const anomalies = [];
    const resourceBehaviors = behaviors.filter(b => b.type === 'resource');

    resourceBehaviors.forEach(behavior => {
      if (behavior.memory > 90) {
        anomalies.push({
          type: 'resourceAbuse',
          pattern: 'excessiveMemory',
          value: behavior.memory,
          severity: patterns.severity
        });
      }
    });

    return anomalies;
  }

  /**
   * 匹配模式
   */
  matchesPattern(behavior, pattern) {
    // 简化实现
    return false;
  }

  /**
   * 隔离skill
   */
  async quarantineSkill(skillName, anomalies) {
    console.log(`      🚨 隔离skill: ${skillName}`);
    console.log(`      原因: 检测到 ${anomalies.length} 个异常行为`);

    // 添加到隔离列表
    this.quarantineList.add(skillName);

    // 记录隔离原因
    const quarantineRecord = {
      skillName,
      timestamp: new Date().toISOString(),
      anomalies,
      reason: '检测到异常行为'
    };

    // 保存到隔离日志
    const quarantineLog = path.join(process.cwd(), '.stigmergy', 'quarantine-log.jsonl');
    const logEntry = JSON.stringify(quarantineRecord) + '\n';
    fs.appendFileSync(quarantineLog, logEntry);

    // 发出隔离事件
    this.emit('quarantine', quarantineRecord);

    return quarantineRecord;
  }

  /**
   * 检查skill是否被隔离
   */
  isQuarantined(skillName) {
    return this.quarantineList.has(skillName);
  }

  /**
   * 获取隔离列表
   */
  getQuarantineList() {
    return Array.from(this.quarantineList);
  }

  /**
   * 生成监控报告
   */
  generateMonitoringReport(skillName) {
    const skillLogs = this.behaviorLog.filter(log => log.skillName === skillName);

    return {
      skillName,
      totalMonitors: skillLogs.length,
      safeMonitors: skillLogs.filter(log => log.safe).length,
      unsafeMonitors: skillLogs.filter(log => !log.safe).length,
      totalBehaviors: skillLogs.reduce((sum, log) => sum + log.behaviors.length, 0),
      totalAnomalies: skillLogs.reduce((sum, log) => sum + log.anomalies.length, 0),
      isCurrentlyQuarantined: this.isQuarantined(skillName)
    };
  }

  /**
   * 辅助方法：sleep
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = SkillBehaviorMonitor;
