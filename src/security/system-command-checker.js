/**
 * 系统命令安全检查器
 *
 * **重要安全规则**: 引入外部技能时，必须把所有依赖于特定操作系统的指令替换为跨系统的 Python 脚本
 * **禁止**: 在技能中直接使用特定操作系统的命令（如 ls, dir, grep, find, cat, cp, mv, rm 等）
 */

const os = require('os');

/**
 * 系统命令检查器
 */
class SystemCommandChecker {
  constructor() {
    this.platform = os.platform();
    this.isWindows = this.platform === 'win32';

    // Windows 特定命令（禁止使用）
    this.windowsCommands = [
      'dir', 'cls', 'type', 'copy', 'move', 'del', 'erase',
      'md', 'mkdir', 'rd', 'rmdir', 'ren', 'rename',
      'attrib', 'icacls', 'cipher', 'compact', 'convert',
      'format', 'chkdsk', 'defrag', 'diskpart', 'fdisk',
      'ping', 'tracert', 'pathping', 'nslookup', 'netstat',
      'tasklist', 'taskkill', 'sc', 'schtasks', 'wevtutil',
      'reg', 'regedit', 'gpedit', 'secpol', 'services.msc',
      'cmd', 'powershell', 'wscript', 'cscript'
    ];

    // Unix/Linux 特定命令（禁止使用）
    this.unixCommands = [
      'ls', 'dir', 'cat', 'less', 'more', 'tail', 'head',
      'grep', 'egrep', 'fgrep', 'sed', 'awk', 'cut',
      'find', 'locate', 'which', 'whereis', 'type',
      'cp', 'mv', 'rm', 'rmdir', 'mkdir', 'touch',
      'chmod', 'chown', 'chgrp', 'umask', 'stat',
      'tar', 'gzip', 'gunzip', 'zip', 'unzip',
      'ps', 'top', 'kill', 'killall', 'pkill',
      'ping', 'traceroute', 'nslookup', 'netstat',
      'ifconfig', 'ip', 'route', 'iptables',
      'sudo', 'su', 'doas', 'visudo',
      'bash', 'sh', 'csh', 'tcsh', 'zsh', 'fish'
    ];

    // 危险的系统调用模式
    this.dangerousPatterns = [
      /execSync\s*\(\s*['"`](ls|dir|grep|find|cat|cp|mv|rm|mkdir)\b/,
      /spawn\s*\(\s*['"`](ls|dir|grep|find|cat|cp|mv|rm|mkdir)\b/,
      /require\s*\(\s*['"`]child_process['"`]\s*\)/,
      /\.\s*exec\s*\(/,
      /\.\s*spawn\s*\(/,
    ];
  }

  /**
   * 检查技能是否包含系统特定的命令
   */
  checkSkill(content, skillName) {
    const issues = [];
    const warnings = [];

    // 1. 检查 Windows 命令
    for (const cmd of this.windowsCommands) {
      const regex = new RegExp(`\\b${cmd}\\b`, 'i');
      if (regex.test(content)) {
        issues.push({
          type: 'critical',
          category: 'windows_command',
          message: `包含 Windows 特定命令: ${cmd}`,
          suggestion: '使用跨平台的 Python 脚本替代',
          fix: '替换为 scripts/python/cross_platform_scripts.py 中的相应功能',
          forbidden: true
        });
      }
    }

    // 2. 检查 Unix 命令
    for (const cmd of this.unixCommands) {
      const regex = new RegExp(`\\b${cmd}\\b`, 'i');
      if (regex.test(content)) {
        issues.push({
          type: 'critical',
          category: 'unix_command',
          message: `包含 Unix 特定命令: ${cmd}`,
          suggestion: '使用跨平台的 Python 脚本替代',
          fix: '替换为 scripts/python/cross_platform_scripts.py 中的相应功能',
          forbidden: true
        });
      }
    }

    // 3. 检查危险模式
    for (const pattern of this.dangerousPatterns) {
      const match = content.match(pattern);
      if (match) {
        issues.push({
          type: 'critical',
          category: 'dangerous_pattern',
          message: `包含危险系统调用模式: ${match[0]}`,
          suggestion: '避免直接执行系统命令',
          fix: '使用 CrossPlatformUtils 或 Python 脚本',
          forbidden: true
        });
      }
    }

    // 4. 检查 child_process 导入
    if (content.includes('child_process')) {
      warnings.push({
        type: 'high',
        category: 'child_process_import',
        message: '导入了 child_process 模块',
        suggestion: '只有在绝对必要时才使用，并确保跨平台兼容',
        fix: '优先使用 Python 脚本或 CrossPlatformUtils'
      });
    }

    // 5. 检查是否使用了推荐的跨平台方法
    const usesCrossPlatform =
      content.includes('CrossPlatformUtils') ||
      content.includes('cross_platform_scripts.py') ||
      content.includes('path.join') ||
      content.includes('os.homedir()');

    if (!usesCrossPlatform && content.includes('execSync')) {
      warnings.push({
        type: 'medium',
        category: 'no_cross_platform',
        message: '使用 execSync 但没有使用跨平台方法',
        suggestion: '确保使用 CrossPlatformUtils 或 Python 脚本',
        fix: '检查所有系统调用是否跨平台兼容'
      });
    }

    // 6. 计算安全评分
    const score = this.calculateScore(issues, warnings);

    // 7. 判断是否安全
    const safe = this.isSafe(issues);

    return {
      safe,
      score,
      issues,
      warnings,
      skillName,
      platform: this.platform
    };
  }

  /**
   * 计算安全评分
   */
  calculateScore(issues, warnings) {
    let score = 100;

    // 每个严重问题扣 50 分
    score -= issues.filter(i => i.type === 'critical').length * 50;

    // 每个高危警告扣 20 分
    score -= warnings.filter(w => w.type === 'high').length * 20;

    // 每个中危警告扣 10 分
    score -= warnings.filter(w => w.type === 'medium').length * 10;

    // 每个低危警告扣 5 分
    score -= warnings.filter(w => w.type === 'low').length * 5;

    return Math.max(0, score);
  }

  /**
   * 判断是否安全
   */
  isSafe(issues) {
    // 有任何禁止项（forbidden: true）就不安全
    if (issues.some(issue => issue.forbidden)) {
      return false;
    }

    // 有严重问题就不安全
    if (issues.some(issue => issue.type === 'critical')) {
      return false;
    }

    return true;
  }

  /**
   * 生成修复建议
   */
  generateFixSuggestions(checkResult) {
    const suggestions = [];

    // 系统命令替换映射
    const commandReplacements = {
      'ls': 'CrossPlatformUtils.safeReaddir()',
      'dir': 'CrossPlatformUtils.safeReaddir()',
      'grep': 'CrossPlatformScripts.search_content()',
      'find': 'CrossPlatformScripts.find_files()',
      'cat': 'CrossPlatformUtils.safeReadFile()',
      'cp': 'CrossPlatformScripts.copy_file()',
      'mv': 'CrossPlatformScripts.move_file()',
      'rm': 'CrossPlatformScripts.delete_file()',
      'mkdir': 'CrossPlatformUtils.safeMkdir()',
      'chmod': '# 使用跨平台的权限设置方法',
      'stat': 'CrossPlatformUtils.safeStat()',
    };

    // 为每个问题生成具体的修复建议
    for (const issue of [...checkResult.issues, ...checkResult.warnings]) {
      if (issue.category === 'windows_command' || issue.category === 'unix_command') {
        const command = issue.message.split(': ')[1];
        const replacement = commandReplacements[command];

        if (replacement) {
          suggestions.push({
            issue: issue.message,
            replacement: replacement,
            example: this.generateFixExample(command, replacement)
          });
        }
      }
    }

    return suggestions;
  }

  /**
   * 生成修复示例
   */
  generateFixExample(command, replacement) {
    return {
      bad: `execSync('${command} /path/to/dir')`,
      good: replacement,
      note: '使用跨平台的 Python 脚本或 CrossPlatformUtils'
    };
  }

  /**
   * 检查外部技能包（下载前检查）
   */
  async checkExternalSkillPackage(packageJson, readme) {
    const issues = [];
    const warnings = [];

    // 1. 检查 package.json 中的脚本
    if (packageJson && packageJson.scripts) {
      for (const [name, script] of Object.entries(packageJson.scripts)) {
        const checkResult = this.checkSkill(script, `${name} script`);
        issues.push(...checkResult.issues);
        warnings.push(...checkResult.warnings);
      }
    }

    // 2. 检查 README 中的示例命令
    if (readme) {
      const readmeCheck = this.checkSkill(readme, 'README examples');
      // README 中的命令不作为强制要求，只作为警告
      warnings.push(...readmeCheck.issues.map(issue => ({
        ...issue,
        type: 'warning',
        message: `README 中包含: ${issue.message}`,
        suggestion: '在文档中说明使用跨平台方法'
      })));
    }

    return {
      safe: this.isSafe(issues),
      issues,
      warnings
    };
  }
}

module.exports = SystemCommandChecker;
