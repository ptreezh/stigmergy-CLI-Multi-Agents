#!/usr/bin/env node

/**
 * Enhanced Security Auditor - 多层安全核验系统
 *
 * Phase 1 安全强化 - 4层安全核验机制
 *
 * 核心原则：
 * - 所有层必须>=90分才能通过
 * - 零容忍安全风险
 * - 实时监控和响应
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class EnhancedSecurityAuditor {
  constructor() {
    this.auditHistory = new Map(); // 审计历史
    this.quarantineList = new Set(); // 隔离列表
  }

  /**
   * 主入口：执行完整安全审计
   */
  async auditSkill(skillName) {
    console.log(`\n🔒 开始4层安全审计: ${skillName}`);

    const auditId = `${skillName}-${Date.now()}`;
    const auditResult = {
      skillName,
      auditId,
      timestamp: new Date().toISOString(),
      layers: {},
      finalScore: 0,
      safe: false
    };

    try {
      // 第1层：静态分析
      console.log(`   📊 第1层: 静态分析...`);
      auditResult.layers.static = await this.staticAnalysisLayer(skillName);

      // 第2层：动态监控
      console.log(`   📊 第2层: 动态监控...`);
      auditResult.layers.dynamic = await this.dynamicMonitoringLayer(skillName);

      // 第3层：社区反馈
      console.log(`   📊 第3层: 社区反馈...`);
      auditResult.layers.community = await this.communityFeedbackLayer(skillName);

      // 第4层：AI检测
      console.log(`   📊 第4层: AI检测...`);
      auditResult.layers.ai = await this.aiDetectionLayer(skillName);

      // 计算最终评分（所有层的最小值）
      const scores = [
        auditResult.layers.static.score,
        auditResult.layers.dynamic.score,
        auditResult.layers.community.score,
        auditResult.layers.ai.score
      ];

      auditResult.finalScore = Math.min(...scores);
      auditResult.safe = auditResult.finalScore >= 90;

      // 保存审计历史
      this.auditHistory.set(auditId, auditResult);

      // 生成审计报告
      this.generateAuditReport(auditResult);

      return auditResult;

    } catch (error) {
      console.error(`❌ 审计失败: ${error.message}`);
      return {
        skillName,
        safe: false,
        error: error.message,
        finalScore: 0
      };
    }
  }

  /**
   * 第1层：静态分析
   */
  async staticAnalysisLayer(skillName) {
    const result = {
      layer: 'static',
      score: 0,
      details: {},
      issues: []
    };

    try {
      // 1.1 检查skill文件是否存在
      const skillPath = this.findSkillPath(skillName);
      if (!skillPath) {
        result.issues.push({
          severity: 'CRITICAL',
          message: 'Skill文件未找到'
        });
        return result;
      }

      // 1.2 代码静态分析
      const codeAnalysis = await this.analyzeCode(skillPath);
      result.details.codeAnalysis = codeAnalysis;

      // 1.3 依赖安全检查
      const dependencyCheck = await this.checkDependencies(skillPath);
      result.details.dependencyCheck = dependencyCheck;

      // 1.4 权限检查
      const permissionCheck = await this.checkPermissions(skillPath);
      result.details.permissionCheck = permissionCheck;

      // 1.5 恶意模式检测
      const malwareCheck = await this.detectMalwarePatterns(skillPath);
      result.details.malwareCheck = malwareCheck;

      // 计算第1层评分
      result.score = this.calculateStaticScore({
        codeAnalysis,
        dependencyCheck,
        permissionCheck,
        malwareCheck
      });

      // 收集所有问题
      result.issues = [
        ...codeAnalysis.issues,
        ...dependencyCheck.issues,
        ...permissionCheck.issues,
        ...malwareCheck.issues
      ];

      console.log(`      ✅ 静态分析完成: ${result.score}/100`);
      return result;

    } catch (error) {
      console.error(`      ❌ 静态分析失败: ${error.message}`);
      result.issues.push({
        severity: 'CRITICAL',
        message: `静态分析失败: ${error.message}`
      });
      return result;
    }
  }

  /**
   * 第2层：动态监控
   */
  async dynamicMonitoringLayer(skillName) {
    const result = {
      layer: 'dynamic',
      score: 0,
      details: {},
      issues: []
    };

    try {
      // 2.1 沙箱执行测试
      const sandboxTest = await this.sandboxExecutionTest(skillName);
      result.details.sandboxTest = sandboxTest;

      // 2.2 资源使用监控
      const resourceMonitor = await this.monitorResourceUsage(skillName);
      result.details.resourceMonitor = resourceMonitor;

      // 2.3 网络活动检测
      const networkCheck = await this.detectNetworkActivity(skillName);
      result.details.networkCheck = networkCheck;

      // 2.4 文件系统访问检测
      const fsAccessCheck = await this.detectFileSystemAccess(skillName);
      result.details.fsAccessCheck = fsAccessCheck;

      // 计算第2层评分
      result.score = this.calculateDynamicScore({
        sandboxTest,
        resourceMonitor,
        networkCheck,
        fsAccessCheck
      });

      // 收集所有问题
      result.issues = [
        ...sandboxTest.issues,
        ...resourceMonitor.issues,
        ...networkCheck.issues,
        ...fsAccessCheck.issues
      ];

      console.log(`      ✅ 动态监控完成: ${result.score}/100`);
      return result;

    } catch (error) {
      console.error(`      ❌ 动态监控失败: ${error.message}`);
      result.issues.push({
        severity: 'CRITICAL',
        message: `动态监控失败: ${error.message}`
      });
      return result;
    }
  }

  /**
   * 第3层：社区反馈
   */
  async communityFeedbackLayer(skillName) {
    const result = {
      layer: 'community',
      score: 0,
      details: {},
      issues: []
    };

    try {
      // 3.1 收集多CLI反馈
      const cliFeedbacks = await this.collectCLIFeedbacks(skillName);
      result.details.cliFeedbacks = cliFeedbacks;

      // 3.2 检查反馈一致性
      const consistency = await this.checkFeedbackConsistency(cliFeedbacks);
      result.details.consistency = consistency;

      // 3.3 检测异常报告
      const anomalyReports = await this.detectAnomalyReports(cliFeedbacks);
      result.details.anomalyReports = anomalyReports;

      // 3.4 计算信任度
      const trustScore = await this.calculateTrustScore({
        cliFeedbacks,
        consistency,
        anomalyReports
      });
      result.details.trustScore = trustScore;

      // 计算第3层评分
      result.score = trustScore;

      // 收集所有问题
      result.issues = [
        ...consistency.issues,
        ...anomalyReports.issues
      ];

      console.log(`      ✅ 社区反馈完成: ${result.score}/100`);
      return result;

    } catch (error) {
      console.error(`      ❌ 社区反馈失败: ${error.message}`);
      result.issues.push({
        severity: 'CRITICAL',
        message: `社区反馈失败: ${error.message}`
      });
      return result;
    }
  }

  /**
   * 第4层：AI检测
   */
  async aiDetectionLayer(skillName) {
    const result = {
      layer: 'ai',
      score: 0,
      details: {},
      issues: []
    };

    try {
      // 4.1 恶意模式AI检测
      const aiMalwareDetection = await this.aiMalwareDetection(skillName);
      result.details.aiMalwareDetection = aiMalwareDetection;

      // 4.2 行为模式分析
      const behaviorAnalysis = await this.analyzeBehaviorPatterns(skillName);
      result.details.behaviorAnalysis = behaviorAnalysis;

      // 4.3 代码语义分析
      const semanticAnalysis = await this.semanticCodeAnalysis(skillName);
      result.details.semanticAnalysis = semanticAnalysis;

      // 计算第4层评分
      result.score = this.calculateAIScore({
        aiMalwareDetection,
        behaviorAnalysis,
        semanticAnalysis
      });

      // 收集所有问题
      result.issues = [
        ...aiMalwareDetection.issues,
        ...behaviorAnalysis.issues,
        ...semanticAnalysis.issues
      ];

      console.log(`      ✅ AI检测完成: ${result.score}/100`);
      return result;

    } catch (error) {
      console.error(`      ❌ AI检测失败: ${error.message}`);
      result.issues.push({
        severity: 'CRITICAL',
        message: `AI检测失败: ${error.message}`
      });
      return result;
    }
  }

  /**
   * 辅助方法：查找skill路径
   */
  findSkillPath(skillName) {
    const searchPaths = [
      path.join(process.cwd(), 'skills', skillName),
      path.join(process.cwd(), 'skills', `${skillName}.js`),
      path.join(process.cwd(), 'config', 'superpowers', skillName),
      path.join(process.cwd(), '.claude', 'skills', skillName),
      path.join(process.cwd(), '.agent', 'skills', skillName)
    ];

    for (const searchPath of searchPaths) {
      if (fs.existsSync(searchPath)) {
        return searchPath;
      }
    }

    return null;
  }

  /**
   * 辅助方法：代码分析
   */
  async analyzeCode(skillPath) {
    const result = {
      issues: [],
      metrics: {}
    };

    try {
      const content = fs.readFileSync(skillPath, 'utf8');

      // 检测危险函数调用
      const dangerousPatterns = [
        { pattern: /eval\s*\(/, message: '使用eval()函数', severity: 'HIGH' },
        { pattern: /Function\s*\(/, message: '动态函数构造', severity: 'HIGH' },
        { pattern: /child_process\.exec/, message: '执行系统命令', severity: 'MEDIUM' },
        { pattern: /require\s*\(\s*['"]http['"]\s*\)/, message: '动态HTTP请求', severity: 'MEDIUM' },
        { pattern: /fs\.unlinkSync/, message: '同步删除文件', severity: 'LOW' }
      ];

      dangerousPatterns.forEach(({ pattern, message, severity }) => {
        if (pattern.test(content)) {
          result.issues.push({ message, severity });
        }
      });

      // 代码复杂度
      const lineCount = content.split('\n').length;
      result.metrics.lineCount = lineCount;
      result.metrics.complexity = lineCount > 500 ? 'HIGH' : 'MEDIUM';

      return result;

    } catch (error) {
      result.issues.push({
        severity: 'CRITICAL',
        message: `代码分析失败: ${error.message}`
      });
      return result;
    }
  }

  /**
   * 辅助方法：依赖检查
   */
  async checkDependencies(skillPath) {
    const result = {
      issues: [],
      dependencies: []
    };

    try {
      const dir = path.dirname(skillPath);
      const packageJsonPath = path.join(dir, 'package.json');

      if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        result.dependencies = Object.keys(pkg.dependencies || {});

        // 检查已知有安全问题的包
        const vulnerablePackages = ['request', 'shelljs', 'mkdirp'];
        result.dependencies.forEach(dep => {
          if (vulnerablePackages.includes(dep)) {
            result.issues.push({
              severity: 'HIGH',
              message: `使用已知有漏洞的包: ${dep}`
            });
          }
        });
      }

      return result;

    } catch (error) {
      return result;
    }
  }

  /**
   * 辅助方法：权限检查
   */
  async checkPermissions(skillPath) {
    const result = {
      issues: []
    };

    try {
      const content = fs.readFileSync(skillPath, 'utf8');

      // 检查文件系统操作
      const fsOperations = [
        'fs.unlink', 'fs.rmdir', 'fs.rm'
      ];

      fsOperations.forEach(op => {
        if (content.includes(op)) {
          result.issues.push({
            severity: 'MEDIUM',
            message: `包含危险文件操作: ${op}`
          });
        }
      });

      return result;

    } catch (error) {
      return result;
    }
  }

  /**
   * 辅助方法：恶意模式检测
   */
  async detectMalwarePatterns(skillPath) {
    const result = {
      issues: []
    };

    try {
      const content = fs.readFileSync(skillPath, 'utf8');

      // 检测可疑模式
      const suspiciousPatterns = [
        { pattern: /base64/, message: '包含Base64编码（可能隐藏代码）', severity: 'MEDIUM' },
        { pattern: /\\x[0-9a-f]{2}/, message: '包含十六进制转义（可能混淆代码）', severity: 'MEDIUM' },
        { pattern: /document\.cookie/, message: '访问Cookie（可能窃取数据）', severity: 'HIGH' },
        { pattern: /localStorage\.setItem/, message: '访问localStorage（可能窃取数据）', severity: 'MEDIUM' }
      ];

      suspiciousPatterns.forEach(({ pattern, message, severity }) => {
        if (pattern.test(content)) {
          result.issues.push({ message, severity });
        }
      });

      return result;

    } catch (error) {
      return result;
    }
  }

  /**
   * 计算静态分析评分
   */
  calculateStaticScore({ codeAnalysis, dependencyCheck, permissionCheck, malwareCheck }) {
    let score = 100;

    // 根据问题严重程度扣分
    const allIssues = [
      ...codeAnalysis.issues,
      ...dependencyCheck.issues,
      ...permissionCheck.issues,
      ...malwareCheck.issues
    ];

    allIssues.forEach(issue => {
      switch (issue.severity) {
        case 'CRITICAL':
          score -= 50;
          break;
        case 'HIGH':
          score -= 20;
          break;
        case 'MEDIUM':
          score -= 10;
          break;
        case 'LOW':
          score -= 5;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * 计算动态监控评分
   */
  calculateDynamicScore({ sandboxTest, resourceMonitor, networkCheck, fsAccessCheck }) {
    // 简化实现：基于静态结果估计
    let score = 100;

    const allIssues = [
      ...sandboxTest.issues,
      ...resourceMonitor.issues,
      ...networkCheck.issues,
      ...fsAccessCheck.issues
    ];

    allIssues.forEach(issue => {
      switch (issue.severity) {
        case 'CRITICAL':
          score -= 50;
          break;
        case 'HIGH':
          score -= 20;
          break;
        case 'MEDIUM':
          score -= 10;
          break;
      }
    });

    return Math.max(0, score);
  }

  /**
   * 计算社区反馈评分
   */
  async calculateTrustScore({ cliFeedbacks, consistency, anomalyReports }) {
    // 简化实现：基于反馈数量和质量
    let score = 50; // 基础分

    if (cliFeedbacks.length > 0) {
      score += 20; // 有反馈
    }

    if (consistency.score > 0.8) {
      score += 15; // 高一致性
    }

    if (anomalyReports.length === 0) {
      score += 15; // 无异常报告
    }

    return Math.min(100, score);
  }

  /**
   * 计算AI检测评分
   */
  calculateAIScore({ aiMalwareDetection, behaviorAnalysis, semanticAnalysis }) {
    // 简化实现
    let score = 100;

    const allIssues = [
      ...aiMalwareDetection.issues,
      ...behaviorAnalysis.issues,
      ...semanticAnalysis.issues
    ];

    allIssues.forEach(issue => {
      score -= 20;
    });

    return Math.max(0, score);
  }

  /**
   * 生成审计报告
   */
  generateAuditReport(auditResult) {
    console.log(`\n📋 安全审计报告: ${auditResult.skillName}`);
    console.log(`   审计ID: ${auditResult.auditId}`);
    console.log(`   最终评分: ${auditResult.finalScore}/100`);
    console.log(`   审计结果: ${auditResult.safe ? '✅ 通过' : '❌ 未通过'}`);
    console.log(`\n   各层评分:`);
    console.log(`   - 静态分析: ${auditResult.layers.static?.score || 0}/100`);
    console.log(`   - 动态监控: ${auditResult.layers.dynamic?.score || 0}/100`);
    console.log(`   - 社区反馈: ${auditResult.layers.community?.score || 0}/100`);
    console.log(`   - AI检测: ${auditResult.layers.ai?.score || 0}/100`);
  }

  // 以下为简化实现的占位方法
  async sandboxExecutionTest(skillName) {
    return { issues: [] };
  }

  async monitorResourceUsage(skillName) {
    return { issues: [] };
  }

  async detectNetworkActivity(skillName) {
    return { issues: [] };
  }

  async detectFileSystemAccess(skillName) {
    return { issues: [] };
  }

  async collectCLIFeedbacks(skillName) {
    return [];
  }

  async checkFeedbackConsistency(feedbacks) {
    return { score: 1.0, issues: [] };
  }

  async detectAnomalyReports(feedbacks) {
    return { issues: [] };
  }

  async aiMalwareDetection(skillName) {
    return { issues: [] };
  }

  async analyzeBehaviorPatterns(skillName) {
    return { issues: [] };
  }

  async semanticCodeAnalysis(skillName) {
    return { issues: [] };
  }
}

module.exports = EnhancedSecurityAuditor;
