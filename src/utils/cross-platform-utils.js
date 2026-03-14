/**
 * 跨平台工具模块
 *
 * **确保所有技能在 Windows/Linux/macOS 上都能正常工作**
 *
 * 功能：
 * - 路径操作（跨平台）
 * - 环境变量访问
 * - 命令执行
 * - 文件系统操作（带错误处理）
 * - 用户目录获取
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

/**
 * 跨平台工具类
 */
class CrossPlatformUtils {
  /**
   * 获取用户目录
   * Windows: C:\Users\username
   * Linux/macOS: /home/username or /Users/username
   */
  static getUserHome() {
    return os.homedir();
  }

  /**
   * 获取临时目录
   * Windows: C:\Users\username\AppData\Local\Temp
   * Linux/macOS: /tmp
   */
  static getTempDir() {
    return os.tmpdir();
  }

  /**
   * 获取 Stigmergy 配置目录
   */
  static getStigmergyDir() {
    return path.join(this.getUserHome(), '.stigmergy');
  }

  /**
   * 获取 Soul 状态目录
   */
  static getSoulStateDir() {
    return path.join(this.getStigmergyDir(), 'soul-state');
  }

  /**
   * 构建路径（跨平台）
   * 自动使用正确的路径分隔符
   */
  static buildPath(...segments) {
    return path.join(...segments);
  }

  /**
   * 获取环境变量（跨平台）
   * 自动处理 Windows 和 Unix 的差异
   */
  static getEnv(key) {
    const envMap = {
      'HOME': process.env.HOME || process.env.USERPROFILE,
      'USER': process.env.USER || process.env.USERNAME,
    };

    return envMap[key] || process.env[key];
  }

  /**
   * 执行命令（跨平台）
   * 自动处理 Windows 和 Unix 的 shell 差异
   */
  static execCommand(command, options = {}) {
    try {
      const isWindows = os.platform() === 'win32';
      let execCommand = command;

      if (isWindows && !options.shell) {
        // Windows: 使用 cmd
        execCommand = `cmd /c "${command}"`;
        options.shell = true;
      }

      const result = execSync(execCommand, {
        encoding: 'utf-8',
        stdio: 'pipe',
        ...options
      });

      return {
        success: true,
        output: result,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        output: error.stdout || '',
        error: error.stderr || error.message
      };
    }
  }

  /**
   * 检查文件是否存在（带错误处理）
   */
  static fileExists(filePath) {
    try {
      return fs.existsSync(filePath);
    } catch (error) {
      console.error(`检查文件存在性失败: ${filePath}`, error.message);
      return false;
    }
  }

  /**
   * 安全读取文件（带错误处理）
   */
  static safeReadFile(filePath, encoding = 'utf-8') {
    try {
      return {
        success: true,
        content: fs.readFileSync(filePath, encoding),
        error: null
      };
    } catch (error) {
      // 处理特定的错误码
      let errorMessage = error.message;

      if (error.code === 'ENOENT') {
        errorMessage = `文件不存在: ${filePath}`;
      } else if (error.code === 'EACCES') {
        errorMessage = `没有权限访问文件: ${filePath}`;
      } else if (error.code === 'EISDIR') {
        errorMessage = `路径是目录，不是文件: ${filePath}`;
      }

      return {
        success: false,
        content: null,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * 安全写入文件（带错误处理）
   */
  static safeWriteFile(filePath, content, encoding = 'utf-8') {
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, encoding);

      return {
        success: true,
        error: null
      };
    } catch (error) {
      let errorMessage = error.message;

      if (error.code === 'ENOENT') {
        errorMessage = `目录不存在: ${path.dirname(filePath)}`;
      } else if (error.code === 'EACCES') {
        errorMessage = `没有权限写入文件: ${filePath}`;
      } else if (error.code === 'ENOSPC') {
        errorMessage = `磁盘空间不足`;
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * 安全创建目录（带错误处理）
   */
  static safeMkdir(dirPath) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });

      return {
        success: true,
        error: null
      };
    } catch (error) {
      let errorMessage = error.message;

      if (error.code === 'EACCES') {
        errorMessage = `没有权限创建目录: ${dirPath}`;
      } else if (error.code === 'ENOSPC') {
        errorMessage = `磁盘空间不足`;
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * 安全读取目录（带错误处理）
   */
  static safeReaddir(dirPath) {
    try {
      const files = fs.readdirSync(dirPath);

      return {
        success: true,
        files,
        error: null
      };
    } catch (error) {
      let errorMessage = error.message;

      if (error.code === 'ENOENT') {
        errorMessage = `目录不存在: ${dirPath}`;
      } else if (error.code === 'EACCES') {
        errorMessage = `没有权限访问目录: ${dirPath}`;
      } else if (error.code === 'ENOTDIR') {
        errorMessage = `路径不是目录: ${dirPath}`;
      }

      return {
        success: false,
        files: null,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * 获取文件统计信息（带错误处理）
   */
  static safeStat(filePath) {
    try {
      const stats = fs.statSync(filePath);

      return {
        success: true,
        stats,
        error: null
      };
    } catch (error) {
      let errorMessage = error.message;

      if (error.code === 'ENOENT') {
        errorMessage = `文件不存在: ${filePath}`;
      } else if (error.code === 'EACCES') {
        errorMessage = `没有权限访问: ${filePath}`;
      }

      return {
        success: false,
        stats: null,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * 安全删除文件（带错误处理）
   */
  static safeUnlink(filePath) {
    try {
      fs.unlinkSync(filePath);

      return {
        success: true,
        error: null
      };
    } catch (error) {
      let errorMessage = error.message;

      if (error.code === 'ENOENT') {
        errorMessage = `文件不存在: ${filePath}`;
      } else if (error.code === 'EACCES') {
        errorMessage = `没有权限删除文件: ${filePath}`;
      }

      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * 获取平台信息
   */
  static getPlatformInfo() {
    return {
      platform: os.platform(),
      type: os.type(),
      arch: os.arch(),
      isWindows: os.platform() === 'win32',
      isMac: os.platform() === 'darwin',
      isLinux: os.platform().startsWith('linux'),
      isUnix: os.platform() !== 'win32'
    };
  }

  /**
   * 规范化路径（处理 ~ 和环境变量）
   */
  static normalizePath(inputPath) {
    // 处理 ~
    if (inputPath.startsWith('~')) {
      inputPath = path.join(this.getUserHome(), inputPath.slice(1));
    }

    // 处理环境变量
    inputPath = inputPath.replace(/\$(\w+)|%(\w+)%/g, (match, p1, p2) => {
      const varName = p1 || p2;
      return process.env[varName] || match;
    });

    // 规范化路径
    return path.normalize(inputPath);
  }

  /**
   * 创建跨平台技能路径
   */
  static createSkillPath(skillName, type = 'user') {
    const basePath = type === 'user'
      ? this.getStigmergyDir()
      : process.cwd();

    return this.buildPath(basePath, 'skills', `${skillName}.js`);
  }

  /**
   * 创建跨平台数据路径
   */
  static createDataPath(...segments) {
    const basePath = this.getSoulStateDir();
    return this.buildPath(basePath, ...segments);
  }
}

module.exports = CrossPlatformUtils;
