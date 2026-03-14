/**
 * Soul Security Auditor - 技能安全核验系统
 *
 * **重要**: 所有外部下载的技能必须先经过安全核验！
 *
 * 功能：
 * - 恶意代码扫描
 * - 依赖漏洞检测
 * - 权限分析
 * - 代码质量检查
 * - 安全评分
 *
 * 借鉴：OpenClaw 的安全审计机制
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const CrossPlatformUtils = require('../src/utils/cross-platform-utils');

/**
 * SoulSecurityAuditor 技能类
 */
class SoulSecurityAuditor {
  constructor() {
    this.name = 'soul-security-auditor';
    this.description = '技能安全核验和审计';
    this.triggers = ['audit', '审计', 'security check', '安全检查', 'verify', '验证'];

    // 安全检查规则
    this.securityRules = {
      // 危险函数和模式
      dangerousPatterns: [
        { pattern: /eval\s*\(/, severity: 'critical', desc: 'eval() 执行动态代码' },
        { pattern: /Function\s*\(/, severity: 'critical', desc: 'Function 构造器' },
        { pattern: /require\s*\(\s*['"`]child_process['"`]\s*\)/, severity: 'high', desc: 'child_process 模块' },
        { pattern: /require\s*\(\s*['"`]fs['"`]\s*\)/, severity: 'medium', desc: '文件系统操作' },
        { pattern: /\.exec\s*\(/, severity: 'high', desc: '执行命令' },
        { pattern: /\.spawn\s*\(/, severity: 'high', desc: '进程生成' },
        { pattern: /http\.request\s*\(/, severity: 'medium', desc: 'HTTP 请求' },
        { pattern: /https\.request\s*\(/, severity: 'medium', desc: 'HTTPS 请求' },
        { pattern: /process\.env\./, severity: 'low', desc: '环境变量访问' },
        { pattern: /document\.cookie/, severity: 'medium', desc: 'Cookie 访问（浏览器）' },
        { pattern: /localStorage\./, severity: 'low', desc: '本地存储访问' },
        { pattern: /innerHTML\s*=/, severity: 'medium', desc: 'innerHTML 操作（XSS风险）' },
      ],

      // 可疑的导入
      suspiciousImports: [
        'axios',
        'node-fetch',
        'request',
        'cheerio',
        'puppeteer',
        'playwright',
        'ws',
        'socket.io'
      ],

      // 需要审查的 API 调用
      apiCallsToCheck: [
        'fetch(',
        'XMLHttpRequest',
        'WebSocket(',
        'postMessage',
        'localStorage',
        'sessionStorage',
        'IndexedDB'
      ]
    };

    // 安全评分权重
    this.scoringWeights = {
      critical: 50,
      high: 20,
      medium: 10,
      low: 5
    };
  }

  /**
   * 判断是否可以处理该任务
   */
  canHandle(task, context) {
    const taskLower = task.toLowerCase();
    return this.triggers.some(trigger => taskLower.includes(trigger));
  }

  /**
   * 执行安全审计
   */
  async execute(task, context, { memory, eventStream }) {
    console.log('\n🔒 [Soul Security Auditor] 开始安全审计...');

    // 获取要审计的技能路径
    const skillPath = this.extractSkillPath(task, context);

    if (!skillPath) {
      return {
        done: true,
        output: '❌ 未找到要审计的技能路径\n使用方法: audit <skill-path>'
      };
    }

    try {
      // 执行完整的安全检查
      const auditResult = await this.auditSkill(skillPath);

      // 保存审计结果
      await this.saveAuditResult(auditResult);

      // 推送事件
      eventStream.push({
        type: 'security_audit_complete',
        data: {
          skill: skillPath,
          safe: auditResult.safe,
          score: auditResult.score
        }
      });

      return {
        done: true,
        output: this.formatAuditOutput(auditResult),
        context: {
          auditedSkill: skillPath,
          auditResult: auditResult.safe ? 'SAFE' : 'UNSAFE',
          securityScore: auditResult.score
        }
      };
    } catch (error) {
      console.error('❌ Security audit error:', error);
      return {
        done: true,
        output: `⚠️ 安全审计失败: ${error.message}`
      };
    }
  }

  /**
   * 提取技能路径
   */
  extractSkillPath(task, context) {
    // 从任务描述中提取路径
    const match = task.match(/audit\s+(.+)/i) || task.match(/审计\s+(.+)/);
    if (match) {
      return match[1].trim();
    }

    // 从上下文中获取
    if (context.skillPath) {
      return context.skillPath;
    }

    return null;
  }

  /**
   * 审计技能
   */
  async auditSkill(skillPath) {
    console.log(`  🔍 审计技能: ${skillPath}`);

    const result = {
      skillPath,
      timestamp: Date.now(),
      safe: true,
      score: 100,
      issues: [],
      warnings: [],
      info: [],
      files: []
    };

    // 1. 检查路径是否存在
    if (!CrossPlatformUtils.fileExists(skillPath)) {
      result.safe = false;
      result.score = 0;
      result.issues.push({
        severity: 'critical',
        message: '技能路径不存在',
        recommendation: '请检查路径是否正确'
      });
      return result;
    }

    // 2. 扫描文件
    const files = await this.scanFiles(skillPath);
    result.files = files;

    // 3. 分析每个文件
    for (const file of files) {
      const fileResult = await this.analyzeFile(file);
      result.issues.push(...fileResult.issues);
      result.warnings.push(...fileResult.warnings);
      result.info.push(...fileResult.info);
    }

    // 4. 检查依赖
    if (CrossPlatformUtils.fileExists(CrossPlatformUtils.buildPath(skillPath, 'package.json'))) {
      const depsResult = await this.checkDependencies(skillPath);
      result.issues.push(...depsResult.issues);
      result.warnings.push(...depsResult.warnings);
      result.info.push(...depsResult.info);
    }

    // 5. 检查权限
    const permsResult = await this.checkPermissions(skillPath);
    result.issues.push(...permsResult.issues);
    result.warnings.push(...permsResult.warnings);

    // 6. 计算安全评分
    result.score = this.calculateSecurityScore(result);

    // 7. 判断是否安全
    result.safe = this.isSafe(result);

    return result;
  }

  /**
   * 扫描文件
   */
  async scanFiles(dirPath) {
    const files = [];
    const allowedExtensions = ['.js', '.ts', '.jsx', '.tsx', '.md', '.json'];

    const scan = (currentPath) => {
      const entries = CrossPlatformUtils.safeReaddir(currentPath, { withFileTypes: true }).files || [];

      for (const entry of entries) {
        const fullPath = CrossPlatformUtils.buildPath(currentPath, entry.name);

        // 跳过 node_modules 和隐藏目录
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
          continue;
        }

        if (entry.isDirectory()) {
          scan(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (allowedExtensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    scan(dirPath);
    return files;
  }

  /**
   * 分析文件
   */
  async analyzeFile(filePath) {
    const result = {
      filePath,
      issues: [],
      warnings: [],
      info: []
    };

    try {
      const content = CrossPlatformUtils.safeReadFile(filePath).content || '';

      // 1. 检查危险模式
      for (const rule of this.securityRules.dangerousPatterns) {
        const matches = content.match(rule.pattern);
        if (matches) {
          const severity = rule.severity;
          result[severity === 'critical' || severity === 'high' ? 'issues' : 'warnings'].push({
            severity,
            file: path.basename(filePath),
            line: this.findLineNumber(content, matches[0]),
            message: `发现 ${rule.desc}`,
            code: matches[0].substring(0, 50)
          });
        }
      }

      // 2. 检查可疑导入
      for (const imp of this.securityRules.suspiciousImports) {
        const pattern = new RegExp(`require\\s*\\(\\s*['"\`]${imp}['"\`]\\s*\\)|import\\s.+from\\s+['"\`]${imp}['"\`]`);
        if (pattern.test(content)) {
          result.warnings.push({
            severity: 'medium',
            file: path.basename(filePath),
            message: `使用可疑模块: ${imp}`,
            recommendation: '审查该模块的使用场景'
          });
        }
      }

      // 3. 检查 API 调用
      for (const apiCall of this.securityRules.apiCallsToCheck) {
        if (content.includes(apiCall)) {
          result.info.push({
            severity: 'low',
            file: path.basename(filePath),
            message: `使用敏感 API: ${apiCall}`,
            recommendation: '确保正确使用'
          });
        }
      }

      // 4. 检查代码质量
      const qualityIssues = this.checkCodeQuality(content, filePath);
      result.warnings.push(...qualityIssues);

    } catch (error) {
      result.warnings.push({
        severity: 'low',
        file: path.basename(filePath),
        message: `无法读取文件: ${error.message}`
      });
    }

    return result;
  }

  /**
   * 查找行号
   */
  findLineNumber(content, pattern) {
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(pattern)) {
        return i + 1;
      }
    }
    return -1;
  }

  /**
   * 检查依赖
   */
  async checkDependencies(skillPath) {
    const result = {
      issues: [],
      warnings: [],
      info: []
    };

    try {
      const packageJsonPath = CrossPlatformUtils.buildPath(skillPath, 'package.json');
      const packageJson = JSON.parse(CrossPlatformUtils.safeReadFile(packageJsonPath).content || '');

      const deps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // 检查已知有漏洞的包
      const knownVulnerable = [
        'lodash@<4.17.21',
        'axios@<0.21.1',
        'request@<2.88.0'
      ];

      for (const [name, version] of Object.entries(deps)) {
        for (const vulnerable of knownVulnerable) {
          if (vulnerable.startsWith(name)) {
            result.issues.push({
              severity: 'critical',
              message: `依赖包含已知漏洞: ${name}@${version}`,
              recommendation: `升级到安全版本`
            });
          }
        }
      }

      // 检查依赖数量
      const depCount = Object.keys(deps).length;
      if (depCount > 20) {
        result.warnings.push({
          severity: 'low',
          message: `依赖数量过多: ${depCount}`,
          recommendation: '考虑减少依赖'
        });
      }

      result.info.push({
        severity: 'low',
        message: `总依赖数: ${depCount}`
      });

    } catch (error) {
      result.warnings.push({
        severity: 'low',
        message: `无法检查依赖: ${error.message}`
      });
    }

    return result;
  }

  /**
   * 检查权限
   */
  async checkPermissions(skillPath) {
    const result = {
      issues: [],
      warnings: []
    };

    try {
      // 检查是否有网络访问
      const files = await this.scanFiles(skillPath);
      for (const file of files) {
        const content = CrossPlatformUtils.safeReadFile(file).content || '';
        if (content.includes('http') || content.includes('fetch') || content.includes('request')) {
          result.warnings.push({
            severity: 'medium',
            message: `技能可能进行网络访问: ${path.basename(file)}`,
            recommendation: '审查网络访问的必要性'
          });
        }
      }

      // 检查文件系统访问
      for (const file of files) {
        const content = CrossPlatformUtils.safeReadFile(file).content || '';
        if (content.includes('fs.') || content.includes('require(')) {
          result.warnings.push({
            severity: 'medium',
            message: `技能可能访问文件系统: ${path.basename(file)}`,
            recommendation: '审查文件系统访问的必要性'
          });
        }
      }

    } catch (error) {
      result.warnings.push({
        severity: 'low',
        message: `无法检查权限: ${error.message}`
      });
    }

    return result;
  }

  /**
   * 检查代码质量
   */
  checkCodeQuality(content, filePath) {
    const issues = [];

    // 检查文件大小
    if (content.length > 10000) {
      issues.push({
        severity: 'low',
        file: path.basename(filePath),
        message: '文件过大，建议拆分',
        recommendation: '考虑模块化'
      });
    }

    // 检查 console.log（生产代码不应该有）
    const consoleLogCount = (content.match(/console\.log/g) || []).length;
    if (consoleLogCount > 5) {
      issues.push({
        severity: 'low',
        file: path.basename(filePath),
        message: `存在 ${consoleLogCount} 个 console.log`,
        recommendation: '移除调试代码'
      });
    }

    // 检查注释率
    const codeLines = content.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*');
    }).length;

    const commentLines = content.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.startsWith('//') || trimmed.startsWith('*');
    }).length;

    if (codeLines > 50 && commentLines === 0) {
      issues.push({
        severity: 'low',
        file: path.basename(filePath),
        message: '缺少注释',
        recommendation: '添加文档注释'
      });
    }

    return issues;
  }

  /**
   * 计算安全评分
   */
  calculateSecurityScore(result) {
    let score = 100;

    // 根据问题严重程度扣分
    for (const issue of result.issues) {
      score -= this.scoringWeights[issue.severity] || 10;
    }

    for (const warning of result.warnings) {
      score -= this.scoringWeights[warning.severity] || 5;
    }

    return Math.max(0, score);
  }

  /**
   * 判断是否安全
   */
  isSafe(result) {
    // 1. 必须没有 critical 问题
    const hasCritical = result.issues.some(i => i.severity === 'critical');
    if (hasCritical) return false;

    // 2. 分数必须 >= 60
    if (result.score < 60) return false;

    // 3. high 问题不能超过 2 个
    const highCount = result.issues.filter(i => i.severity === 'high').length;
    if (highCount > 2) return false;

    return true;
  }

  /**
   * 保存审计结果
   */
  async saveAuditResult(auditResult) {
    const soulStateDir = CrossPlatformUtils.buildPath(CrossPlatformUtils.getUserHome(), '.stigmergy', 'soul-state');
    const auditDir = CrossPlatformUtils.buildPath(soulStateDir, 'security-audits');

    await fs.promises.mkdir(auditDir, { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const auditFile = CrossPlatformUtils.buildPath(auditDir, `audit_${timestamp}.json`);

    await fs.promises.writeFile(
      auditFile,
      JSON.stringify(auditResult, null, 2)
    );

    console.log(`💾 审计结果已保存: ${auditFile}`);
  }

  /**
   * 格式化审计输出
   */
  formatAuditOutput(auditResult) {
    let output = '\n🔒 安全审计报告\n';
    output += '================\n\n';

    // 总体评估
    const safeIcon = auditResult.safe ? '✅' : '❌';
    output += `${safeIcon} 总体评估: ${auditResult.safe ? '安全' : '不安全'}\n`;
    output += `📊 安全评分: ${auditResult.score}/100\n\n`;

    // 严重问题
    if (auditResult.issues.length > 0) {
      output += '🚨 严重问题:\n';
      for (const issue of auditResult.issues) {
        const icon = issue.severity === 'critical' ? '🔴' : '🟠';
        output += `  ${icon} [${issue.severity.toUpperCase()}] ${issue.message}\n`;
        if (issue.file) output += `     文件: ${issue.file}\n`;
        if (issue.line > 0) output += `     行号: ${issue.line}\n`;
        if (issue.code) output += `     代码: ${issue.code}\n`;
        if (issue.recommendation) output += `     建议: ${issue.recommendation}\n`;
      }
      output += '\n';
    }

    // 警告
    if (auditResult.warnings.length > 0) {
      output += '⚠️ 警告:\n';
      for (const warning of auditResult.warnings.slice(0, 10)) {
        const icon = warning.severity === 'high' ? '🟠' : warning.severity === 'medium' ? '🟡' : '🟢';
        output += `  ${icon} [${warning.severity.toUpperCase()}] ${warning.message}\n`;
        if (warning.recommendation) output += `     建议: ${warning.recommendation}\n`;
      }
      if (auditResult.warnings.length > 10) {
        output += `  ... 还有 ${auditResult.warnings.length - 10} 个警告\n`;
      }
      output += '\n';
    }

    // 信息
    if (auditResult.info.length > 0) {
      output += 'ℹ️ 信息:\n';
      for (const info of auditResult.info.slice(0, 5)) {
        output += `  • ${info.message}\n`;
      }
      output += '\n';
    }

    // 建议
    if (!auditResult.safe) {
      output += '💡 修复建议:\n';
      output += '  1. 移除或修复所有严重问题\n';
      output += '  2. 减少危险函数的使用\n';
      output += '  3. 添加输入验证和错误处理\n';
      output += '  4. 重新审计后再使用\n\n';
    }

    output += `📁 扫描文件: ${auditResult.files.length} 个\n`;
    output += `⏰ 审计时间: ${new Date(auditResult.timestamp).toLocaleString()}\n`;

    return output;
  }

  /**
   * 快速安全检查（用于下载前预检）
   */
  async quickCheck(content) {
    const issues = [];

    // 检查最危险的模式
    const criticalPatterns = [
      /eval\s*\(/,
      /child_process/,
      /\.exec\s*\(/,
      /\.spawn\s*\(/
    ];

    for (const pattern of criticalPatterns) {
      if (pattern.test(content)) {
        issues.push({
          severity: 'critical',
          pattern: pattern.toString()
        });
      }
    }

    return {
      safe: issues.length === 0,
      issues
    };
  }
}

module.exports = SoulSecurityAuditor;
