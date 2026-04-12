/**
 * Stigmergy OpenCLI 集成命令
 * 
 * 将 OpenCLI 的 453+ 网站命令集成到 Stigmergy 中
 * 用户通过 IM 直接调用任何网站数据
 */

const { execSync } = require('child_process');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

/**
 * 安装 OpenCLI 浏览器扩展
 */
function installBrowserExtension() {
  try {
    const scriptPath = path.join(__dirname, '..', '..', '..', 'scripts', 'install-opencli-extension.ps1');
    
    if (!fs.existsSync(scriptPath)) {
      console.log(chalk.red('❌ 安装脚本不存在'));
      return;
    }

    console.log(chalk.cyan('\n🚀 正在启动 OpenCLI 浏览器扩展安装器...\n'));
    
    // 运行 PowerShell 脚本
    execSync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, {
      stdio: 'inherit',
      timeout: 120000
    });
  } catch (error) {
    if (error.status !== 1) {
      console.log(chalk.red(`❌ 安装失败: ${error.message}`));
    }
  }
}

/**
 * 处理 opencli 命令
 * stigmergy opencli <site> <command> [options]
 */
async function handleOpenCLICommand(site, command, options = {}) {
  try {
    // 检查 OpenCLI 是否安装
    try {
      execSync('opencli --version', { stdio: 'pipe' });
    } catch {
      console.log(chalk.red('❌ OpenCLI 未安装'));
      console.log(chalk.yellow('安装命令: npm install -g @jackwener/opencli'));
      return;
    }

    // 构建 OpenCLI 命令
    const args = [site];
    if (command) args.push(command);
    // 处理剩余参数（URL、关键词等）
    if (options._args && options._args.length > 0) {
      args.push(...options._args);
    }
    if (options.limit) args.push('--limit', options.limit);
    if (options.json) args.push('-f', 'json');
    if (options.url) args.push('--url', options.url);

    console.log(chalk.gray(`[OpenCLI] opencli ${args.join(' ')}`));

    // 执行命令
    const output = execSync(`opencli ${args.join(' ')}`, {
      encoding: 'utf-8',
      timeout: parseInt(options.timeout, 10) || 60000,
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });

    console.log(output);

  } catch (error) {
    if (error.status === 69) {
      // 浏览器扩展未连接
      console.log(chalk.yellow('\n⚠️  浏览器扩展未连接'));
      console.log(chalk.yellow('   公共API（HackerNews/Google/Wikipedia等）立即可用'));
      console.log(chalk.yellow('   需要登录的网站需安装扩展\n'));
      console.log(chalk.cyan('   一键安装: stigmergy opencli --install-ext'));
      console.log(chalk.gray('   安装后扩展自动复用已登录的浏览器会话，无需重新登录\n'));
    } else if (error.stdout) {
      console.log(error.stdout);
    } else {
      console.log(chalk.red(`❌ OpenCLI 执行失败: ${error.message}`));
    }
  }
}

/**
 * 列出 OpenCLI 可用的网站
 */
function listOpenCLISites(options = {}) {
  try {
    const output = execSync('opencli list', {
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024
    });

    if (options.json) {
      // 解析为JSON
      const sites = {};
      const lines = output.split('\n');
      let currentSite = null;

      for (const line of lines) {
        const siteMatch = line.match(/^  (\S+)$/);
        if (siteMatch && !line.includes('—') && !line.includes('external')) {
          currentSite = siteMatch[1];
          sites[currentSite] = [];
        } else if (currentSite && line.includes('—')) {
          const cmdMatch = line.match(/    (\S+)\s+\[.*?\]\s*—\s*(.*)/);
          if (cmdMatch) {
            sites[currentSite].push({
              command: cmdMatch[1],
              description: cmdMatch[2].trim()
            });
          }
        }
      }

      console.log(JSON.stringify(sites, null, 2));
    } else {
      console.log(output);
    }
  } catch (error) {
    console.log(chalk.red(`❌ 获取网站列表失败: ${error.message}`));
  }
}

/**
 * 探索新网站并生成 CLI
 */
async function exploreAndGenerate(url, options = {}) {
  try {
    console.log(chalk.cyan(`🔍 正在探索: ${url}`));
    
    // 运行 explore
    const exploreOutput = execSync(`opencli explore ${url}`, {
      encoding: 'utf-8',
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024
    });
    console.log(exploreOutput);

    // 运行 synthesize
    console.log(chalk.cyan('🔧 正在生成 CLI...'));
    const synthesizeOutput = execSync(`opencli synthesize ${url}`, {
      encoding: 'utf-8',
      timeout: 120000,
      maxBuffer: 10 * 1024 * 1024
    });
    console.log(synthesizeOutput);

    console.log(chalk.green('✅ 网站 CLI 化完成！'));
  } catch (error) {
    console.log(chalk.red(`❌ 探索/生成失败: ${error.message}`));
  }
}

module.exports = {
  handleOpenCLICommand,
  listOpenCLISites,
  exploreAndGenerate,
  installBrowserExtension
};
