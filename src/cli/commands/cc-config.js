#!/usr/bin/env node

/**
 * Stigmergy cc-connect 配置管理命令
 * 
 * 统一管理 IM 配置，一次配置，所有 CLI 共享
 * 
 * 用法:
 *   stigmergy cc-config init                    # 初始化配置
 *   stigmergy cc-config set feishu app_id xxx   # 设置 IM 凭证
 *   stigmergy cc-config generate                # 生成完整配置
 *   stigmergy cc-config start                   # 启动 cc-connect
 *   stigmergy cc-config status                  # 查看配置状态
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const { spawn } = require('child_process');

const CONFIG_DIR = path.join(os.homedir(), '.stigmergy', 'cc-connect');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.toml');
const TEMPLATE_FILE = path.join(__dirname, '..', '..', '..', 'config', 'cc-connect-config.toml');

/**
 * 初始化配置
 */
async function initConfig(options) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (fs.existsSync(CONFIG_FILE) && !options.force) {
    console.log(chalk.yellow('配置文件已存在，使用 --force 覆盖'));
    return;
  }

  if (fs.existsSync(TEMPLATE_FILE)) {
    fs.copyFileSync(TEMPLATE_FILE, CONFIG_FILE);
    console.log(chalk.green('✅ 配置文件已初始化'));
    console.log(chalk.gray(`   路径: ${CONFIG_FILE}`));
  } else {
    console.log(chalk.red('❌ 配置模板不存在'));
  }
}

/**
 * 设置 IM 凭证
 */
async function setCredential(platform, key, value) {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log(chalk.yellow('配置文件不存在，先运行: stigmergy cc-config init'));
    return;
  }

  let content = fs.readFileSync(CONFIG_FILE, 'utf-8');

  // 替换顶部模板变量
  const templatePatterns = {
    feishu: {
      app_id: /FEISHU_APP_ID = ".*"/,
      app_secret: /FEISHU_APP_SECRET = ".*"/
    },
    telegram: {
      token: /TELEGRAM_TOKEN = ".*"/
    },
    dingtalk: {
      client_id: /DINGTALK_CLIENT_ID = ".*"/,
      client_secret: /DINGTALK_CLIENT_SECRET = ".*"/
    }
  };

  // 替换所有 projects.platforms.options 中的值
  const platformPatterns = {
    feishu: {
      app_id: /app_id = "your-feishu-app-id"/g,
      app_secret: /app_secret = "your-feishu-app-secret"/g
    },
    telegram: {
      token: /token = "your-telegram-bot-token"/g
    },
    dingtalk: {
      client_id: /client_id = "your-dingtalk-client-id"/g,
      client_secret: /client_secret = "your-dingtalk-client-secret"/g
    }
  };

  // 替换模板变量
  const tplPlatform = templatePatterns[platform];
  if (tplPlatform && tplPlatform[key]) {
    content = content.replace(tplPlatform[key], `${key.toUpperCase()} = "${value}"`);
  }

  // 替换所有项目中的平台配置
  const platPlatform = platformPatterns[platform];
  if (platPlatform && platPlatform[key]) {
    const searchValue = platPlatform[key];
    if (searchValue) {
      content = content.replace(searchValue, `${key} = "${value}"`);
    }
  }

  fs.writeFileSync(CONFIG_FILE, content, 'utf-8');

  console.log(chalk.green(`✅ 已设置 ${platform}.${key}`));
  console.log(chalk.gray(`   已更新 7 个 CLI 项目的 ${platform} 配置`));
}

/**
 * 生成完整配置
 */
async function generateConfig(options) {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log(chalk.yellow('配置文件不存在，先运行: stigmergy cc-config init'));
    return;
  }

  let content = fs.readFileSync(CONFIG_FILE, 'utf-8');

  // 读取环境变量覆盖
  const envVars = {
    FEISHU_APP_ID: process.env.FEISHU_APP_ID,
    FEISHU_APP_SECRET: process.env.FEISHU_APP_SECRET,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    DINGTALK_CLIENT_ID: process.env.DINGTALK_CLIENT_ID,
    DINGTALK_CLIENT_SECRET: process.env.DINGTALK_CLIENT_SECRET
  };

  for (const [key, value] of Object.entries(envVars)) {
    if (value) {
      const pattern = new RegExp(`${key} = ".*"`);
      content = content.replace(pattern, `${key} = "${value}"`);
    }
  }

  // 替换 work_dir 为实际路径
  const workDir = options.workDir || process.cwd();
  content = content.replace(/work_dir = ".*"/g, `work_dir = "${workDir}"`);

  fs.writeFileSync(CONFIG_FILE, content, 'utf-8');

  console.log(chalk.green('✅ 配置已生成'));
  console.log(chalk.gray(`   路径: ${CONFIG_FILE}`));
  console.log(chalk.gray(`   工作目录: ${workDir}`));
}

/**
 * 启动 cc-connect
 */
async function startCCConnect(options) {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log(chalk.yellow('配置文件不存在，先运行: stigmergy cc-config init'));
    return;
  }

  console.log(chalk.cyan('🚀 启动 cc-connect...'));
  console.log(chalk.gray(`   配置: ${CONFIG_FILE}`));

  const child = spawn('cc-connect', ['--config', CONFIG_FILE], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  child.on('error', (err) => {
    console.log(chalk.red(`❌ 启动失败: ${err.message}`));
    console.log(chalk.gray('   请确保已安装: npm install -g cc-connect'));
  });
}

/**
 * 查看配置状态
 */
async function showStatus() {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log(chalk.yellow('配置文件不存在'));
    console.log(chalk.gray('运行: stigmergy cc-config init'));
    return;
  }

  const content = fs.readFileSync(CONFIG_FILE, 'utf-8');

  console.log(chalk.cyan('📋 cc-connect 配置状态\n'));

  // 检查 IM 平台配置
  const platforms = [
    { name: '飞书', key: 'FEISHU_APP_ID', pattern: /app_id = "(?!your-feishu-app-id)[^"]+"/ },
    { name: 'Telegram', key: 'TELEGRAM_TOKEN', pattern: /token = "(?!your-telegram-bot-token)[^"]+"/ },
    { name: '钉钉', key: 'DINGTALK_CLIENT_ID', pattern: /client_id = "(?!your-dingtalk-client-id)[^"]+"/ }
  ];

  console.log('IM 平台配置:');
  for (const p of platforms) {
    const match = content.match(p.pattern);
    const configured = match !== null;
    console.log(`  ${configured ? '✅' : '❌'} ${p.name}: ${configured ? '已配置' : '未配置'}`);
  }

  // 检查 CLI 项目
  const projects = content.match(/\[\[projects\]\]/g);
  console.log(`\nCLI 项目数: ${projects ? projects.length : 0}`);

  console.log(`\n配置文件: ${CONFIG_FILE}`);
}

module.exports = {
  initConfig,
  setCredential,
  generateConfig,
  startCCConnect,
  showStatus
};
