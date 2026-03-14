/**
 * Soul Cross-Platform Compatibility Checker
 *
 * **跨系统兼容性检查器**
 *
 * 确保所有技能在 Windows/Linux/macOS 上都能正常工作
 *
 * 检查项目：
 * - 文件路径分隔符
 * - 环境变量访问
 * - 命令执行方式
 * - 文件系统操作
 * - 行尾符处理
 * - 权限和用户目录
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * 跨平台兼容性检查器
 */
class CrossPlatformChecker {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';
    this.isMac = this.platform === 'darwin';
    this.isLinux = this.platform.startsWith('linux');

    this.issues = [];
    this.warnings = [];
  }

  /**
   * 检查所有技能文件
   */
  async checkSkills(skillsDir = './skills') {
    console.log('\n🔍 [跨平台兼容性检查]');
    console.log(`当前平台: ${this.platform}`);
    console.log('====================\n');

    const skills = await this.findSkillFiles(skillsDir);

    for (const skillFile of skills) {
      console.log(`检查: ${path.basename(skillFile)}`);
      await this.checkSkillFile(skillFile);
    }

    // 生成报告
    return this.generateReport();
  }

  /**
   * 查找技能文件
   */
  async findSkillFiles(skillsDir) {
    const skills = [];

    if (!fs.existsSync(skillsDir)) {
      console.log(`⚠️ 技能目录不存在: ${skillsDir}`);
      return skills;
    }

    const files = fs.readdirSync(skillsDir);

    for (const file of files) {
      const filePath = path.join(skillsDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.md'))) {
        skills.push(filePath);
      }
    }

    return skills;
  }

  /**
   * 检查单个技能文件
   */
  async checkSkillFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. 检查路径分隔符
    this.checkPathSeparators(content, filePath);

    // 2. 检查硬编码路径
    this.checkHardcodedPaths(content, filePath);

    // 3. 检查环境变量访问
    this.checkEnvironmentVariables(content, filePath);

    // 4. 检查命令执行
    this.checkCommandExecution(content, filePath);

    // 5. 检查文件系统操作
    this.checkFileOperations(content, filePath);

    // 6. 检查行尾符
    this.checkLineEndings(content, filePath);

    // 7. 检查用户目录
    this.checkUserDirectory(content, filePath);
  }

  /**
   * 检查路径分隔符
   */
  checkPathSeparators(content, filePath) {
    const issues = [];

    // 检查硬编码的 Windows 路径分隔符
    const windowsPaths = content.match(/'[C-Z]:\\[^']+'/g);
    if (windowsPaths) {
      windowsPaths.forEach(wp => {
        issues.push({
          type: 'error',
          category: 'path_separator',
          message: `发现硬编码的 Windows 路径: ${wp}`,
          suggestion: '使用 path.join() 或 path.resolve() 代替',
          fix: '使用 path.join() 构建跨平台路径'
        });
      });
    }

    // 检查是否正确使用 path.join
    if (!content.includes('path.join') && content.includes('/')) {
      issues.push({
        type: 'warning',
        category: 'path_separator',
        message: '使用硬编码的路径分隔符',
        suggestion: '使用 path.join() 确保跨平台兼容',
        fix: '将 "/" 替换为 path.join()'
      });
    }

    this.issues.push(...issues);
  }

  /**
   * 检查硬编码路径
   */
  checkHardcodedPaths(content, filePath) {
    const problematicPatterns = [
      /['"`]\/home\/[^'"`]+/g,  // Linux 路径
      /['"`]\/Users\/[^'"`]+/g,  // macOS 路径
      /['"`]C:\\\\[^'"`]+/g,     // Windows 路径
    ];

    problematicPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.push({
            type: 'error',
            category: 'hardcoded_path',
            file: filePath,
            message: `硬编码平台特定路径: ${match}`,
            suggestion: '使用 os.homedir(), path.join() 或环境变量',
            fix: '使用跨平台的路径方法'
          });
        });
      }
    });

    // 检查是否使用了正确的跨平台方法
    const goodPractices = [
      'os.homedir()',
      'os.tmpdir()',
      'path.join(',
      'path.resolve(',
      'process.env.HOME',  // Unix
      'process.env.USERPROFILE'  // Windows
    ];

    const hasGoodPractices = goodPractices.some(practice => content.includes(practice));

    if (!hasGoodPractices && (content.includes('home') || content.includes('user'))) {
      this.warnings.push({
        type: 'warning',
        category: 'hardcoded_path',
        file: filePath,
        message: '可能使用硬编码的用户目录',
        suggestion: '使用 os.homedir() 获取跨平台用户目录'
      });
    }
  }

  /**
   * 检查环境变量访问
   */
  checkEnvironmentVariables(content, filePath) {
    // Windows 特定的环境变量
    const windowsEnvVars = [
      'process.env.USERPROFILE',
      'process.env.APPDATA',
      'process.env.LOCALAPPDATA'
    ];

    // Unix 特定的环境变量
    const unixEnvVars = [
      'process.env.HOME',
      'process.env.USER'
    ];

    const hasWindowsOnly = windowsEnvVars.some(env => content.includes(env));
    const hasUnixOnly = unixEnvVars.some(env => content.includes(env));

    if (hasWindowsOnly && !hasUnixOnly) {
      this.warnings.push({
        type: 'warning',
        category: 'environment_variable',
        file: filePath,
        message: '仅使用 Windows 环境变量',
        suggestion: '同时支持 Unix 环境变量',
        fix: '使用 os.homedir() 代替 process.env.HOME/USERPROFILE'
      });
    }

    if (hasUnixOnly && !hasWindowsOnly) {
      this.warnings.push({
        type: 'warning',
        category: 'environment_variable',
        file: filePath,
        message: '仅使用 Unix 环境变量',
        suggestion: '同时支持 Windows 环境变量',
        fix: '使用 os.homedir() 代替 process.env.HOME'
      });
    }
  }

  /**
   * 检查命令执行
   */
  checkCommandExecution(content, filePath) {
    // 检查直接使用 execSync 或 spawn
    const execPatterns = [
      /execSync\s*\(\s*['"`]([^'"`]+)['"`]/g,
      /spawn\s*\(\s*['"`]([^'"`]+)['"`]/g,
    ];

    execPatterns.forEach(pattern => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach(match => {
        const command = match[1];
        const isWindowsCommand = ['cmd', 'powershell', 'dir'].some(cmd =>
          command.toLowerCase().includes(cmd)
        );
        const isUnixCommand = ['ls', 'grep', 'cat', 'sudo'].some(cmd =>
          command.toLowerCase().includes(cmd)
        );

        if (isWindowsCommand) {
          this.issues.push({
            type: 'error',
            category: 'command_execution',
            file: filePath,
            message: `使用 Windows 特定命令: ${command}`,
            suggestion: '使用跨平台的 Node.js API 或库',
            fix: '替换为跨平台替代方案'
          });
        }

        if (isUnixCommand && !this.isUnix()) {
          this.warnings.push({
            type: 'warning',
            category: 'command_execution',
            file: filePath,
            message: `使用 Unix 特定命令: ${command}`,
            suggestion: '在 Windows 上可能不工作',
            fix: '使用跨平台替代方案'
          });
        }
      });
    });
  }

  /**
   * 检查文件系统操作
   */
  checkFileOperations(content, filePath) {
    // 检查文件系统操作是否使用正确的模块
    const hasFsOperations = content.includes('fs.') || content.includes('require("fs")');

    if (hasFsOperations) {
      // 检查是否处理了文件系统错误
      const hasErrorHandling =
        content.includes('try') &&
        content.includes('catch') &&
        (content.includes('ENOENT') || content.includes('EACCES'));

      if (!hasErrorHandling) {
        this.warnings.push({
          type: 'warning',
          category: 'file_operations',
          file: filePath,
          message: '文件系统操作缺少错误处理',
          suggestion: '添加 try-catch 和特定错误码处理',
          fix: '处理 ENOENT, EACCES 等常见错误'
        });
      }
    }

    // 检查文件权限操作
    if (content.includes('chmod') || content.includes('chown')) {
      this.warnings.push({
        type: 'warning',
        category: 'file_operations',
        file: filePath,
        message: '使用 Unix 特定的文件权限操作',
        suggestion: '在 Windows 上可能不工作或行为不同',
        fix: '使用跨平台的权限设置方法'
      });
    }
  }

  /**
   * 检查行尾符
   */
  checkLineEndings(content, filePath) {
    const hasWindowsLineEndings = content.includes('\r\n');
    const hasUnixLineEndings = content.includes('\n') && !hasWindowsLineEndings;

    if (hasWindowsLineEndings && !this.isWindows) {
      this.warnings.push({
        type: 'info',
        category: 'line_endings',
        file: filePath,
        message: '文件使用 Windows 行尾符 (CRLF)',
        suggestion: '在 Unix 系统上可能导致问题',
        fix: '转换为 LF 行尾符'
      });
    }
  }

  /**
   * 检查用户目录
   */
  checkUserDirectory(content, filePath) {
    // 检查是否正确使用 os.homedir()
    const usesOsHomedir = content.includes('os.homedir()');

    if (!usesOsHomedir && (content.includes('~') || content.includes('home'))) {
      this.warnings.push({
        type: 'warning',
        category: 'user_directory',
        file: filePath,
        message: '可能使用 ~ 或 home 作为用户目录',
        suggestion: '使用 os.homedir() 确保跨平台兼容',
        fix: '替换为 os.homedir()'
      });
    }
  }

  /**
   * 生成报告
   */
  generateReport() {
    const report = {
      platform: this.platform,
      timestamp: Date.now(),
      summary: {
        errors: this.issues.filter(i => i.type === 'error').length,
        warnings: this.warnings.length,
        totalIssues: this.issues.length
      },
      issues: this.issues,
      warnings: this.warnings
    };

    return report;
  }

  /**
   * 格式化报告输出
   */
  formatReport(report) {
    let output = '\n📊 跨平台兼容性检查报告\n';
    output += '============================\n\n';

    output += `🖥️ 检查平台: ${report.platform}\n`;
    output += `⏰ 检查时间: ${new Date(report.timestamp).toLocaleString()}\n\n`;

    output += '📈 统计:\n';
    output += `  ❌ 错误: ${report.summary.errors}\n`;
    output += `  ⚠️ 警告: ${report.summary.warnings}\n`;
    output += `  📋 总问题: ${report.summary.totalIssues}\n\n`;

    if (report.issues.length > 0) {
      output += '🚨 错误详情:\n';
      report.issues.forEach((issue, index) => {
        output += `\n${index + 1}. [${issue.category}] ${issue.message}\n`;
        if (issue.file) output += `   文件: ${issue.file}\n`;
        output += `   建议: ${issue.suggestion}\n`;
        if (issue.fix) output += `   修复: ${issue.fix}\n`;
      });
    }

    if (report.warnings.length > 0) {
      output += '\n⚠️ 警告详情:\n';
      report.warnings.forEach((warning, index) => {
        output += `\n${index + 1}. [${warning.category}] ${warning.message}\n`;
        if (warning.file) output += `   文件: ${warning.file}\n`;
        output += `   建议: ${warning.suggestion}\n`;
        if (warning.fix) output += `   修复: ${warning.fix}\n`;
      });
    }

    if (report.summary.errors === 0 && report.summary.warnings === 0) {
      output += '\n✅ 恭喜！没有发现跨平台兼容性问题\n';
    }

    return output;
  }

  /**
   * 自动修复常见问题
   */
  async autoFix(filePath, dryRun = true) {
    console.log(`\n🔧 自动修复: ${path.basename(filePath)}`);

    let content = fs.readFileSync(filePath, 'utf-8');
    const fixes = [];

    // 1. 修复硬编码路径
    const originalContent = content;

    // 替换常见的硬编码路径
    content = content.replace(/process\.env\.HOME/g, 'os.homedir()');
    content = content.replace(/process\.env\.USERPROFILE/g, 'os.homedir()');

    // 2. 修复路径分隔符
    // 这个需要更智能的替换，暂时跳过

    // 3. 添加必要的导入
    if (content.includes('os.homedir()') && !content.includes("require('os')")) {
      const importMatch = content.match(/const os = require\(['"]os['"]\)/);
      if (!importMatch) {
        // 在其他 require 语句后添加
        const requireMatch = content.match(/const \w+ = require\(['"][^'"]+['"]\);/);
        if (requireMatch) {
          content = content.replace(
            requireMatch[0],
            requireMatch[0] + '\nconst os = require("os");'
          );
          fixes.push('添加 os 模块导入');
        }
      }
    }

    if (content !== originalContent) {
      if (!dryRun) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ 已应用 ${fixes.length} 个修复`);
      } else {
        console.log(`  📋 将应用 ${fixes.length} 个修复 (dry-run)`);
      }
      return fixes;
    }

    console.log('  ℹ️ 没有需要自动修复的问题');
    return [];
  }

  /**
   * 创建跨平台工具函数
   */
  static getCrossPlatformUtils() {
    return {
      /**
       * 获取用户目录
       */
      getUserHome: () => os.homedir(),

      /**
       * 获取临时目录
       */
      getTempDir: () => os.tmpdir(),

      /**
       * 构建路径
       */
      buildPath: (...segments) => path.join(...segments),

      /**
       * 获取环境变量（跨平台）
       */
      getEnv: (key) => {
        // Windows 和 Unix 的环境变量映射
        const envMap = {
          'HOME': process.env.HOME || process.env.USERPROFILE,
          'USER': process.env.USER || process.env.USERNAME,
          'HOME_PATH': os.homedir(),
        };

        return envMap[key] || process.env[key];
      },

      /**
       * 执行命令（跨平台）
       */
      execCommand: (command) => {
        const isWindows = os.platform() === 'win32';

        if (isWindows) {
          // Windows: 使用 cmd
          return {
            command: `cmd /c "${command}"`,
            shell: true
          };
        } else {
          // Unix: 直接执行
          return {
            command: command,
            shell: false
          };
        }
      },

      /**
       * 检查文件是否存在（跨平台）
       */
      fileExists: (filePath) => {
        try {
          return fs.existsSync(filePath);
        } catch {
          return false;
        }
      },

      /**
       * 创建目录（跨平台）
       */
      ensureDir: (dirPath) => {
        try {
          fs.mkdirSync(dirPath, { recursive: true });
          return true;
        } catch (error) {
          console.error(`创建目录失败: ${dirPath}`, error);
          return false;
        }
      }
    };
  }
}

module.exports = CrossPlatformChecker;
