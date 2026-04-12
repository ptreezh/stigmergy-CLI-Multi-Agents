#!/usr/bin/env node

/**
 * IM 网关安装器
 * 
 * 专门用于安装 cc-connect 等 IM 网关基础设施
 * 与 AI CLI 安装逻辑分离，优先执行
 */

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

class IMGatewayInstaller {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 120000,
      verbose: options.verbose || false,
      ...options
    };
  }

  /**
   * 安装 IM 网关
   */
  async installIMGateway(gatewayName) {
    const imGateways = require("./cli_tools").IM_GATEWAYS;
    const gateway = imGateways[gatewayName];

    if (!gateway) {
      console.log(`❌ 未知的 IM 网关: ${gatewayName}`);
      return { success: false, error: "未知网关" };
    }

    console.log(`🚀 安装 IM 网关: ${gateway.name}...`);

    try {
      // 检查是否已安装
      const checkResult = await this.checkGatewayInstalled(gateway);
      if (checkResult.installed) {
        console.log(`✅ ${gateway.name} 已安装 (${checkResult.version})`);
        return { success: true, alreadyInstalled: true, version: checkResult.version };
      }

      // 执行安装
      console.log(`执行: ${gateway.install}`);
      const installCmd = gateway.install.split(" ");
      const result = await this.executeCommand(installCmd[0], installCmd.slice(1), {
        timeout: this.options.timeout
      });

      if (result.success) {
        // 创建配置目录
        if (gateway.configDir) {
          if (!fs.existsSync(gateway.configDir)) {
            fs.mkdirSync(gateway.configDir, { recursive: true });
          }
        }

        console.log(`✅ ${gateway.name} 安装成功`);
        return { success: true, name: gateway.name };
      } else {
        console.log(`❌ ${gateway.name} 安装失败: ${result.error}`);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.log(`❌ ${gateway.name} 安装异常: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * 检查是否已安装
   */
  async checkGatewayInstalled(gateway) {
    try {
      const cmd = gateway.version.split(" ");
      const result = await this.executeCommand(cmd[0], cmd.slice(1), {
        timeout: 10000
      });

      if (result.success && result.stdout) {
        const version = result.stdout.trim();
        return { installed: true, version };
      }
    } catch {}

    return { installed: false };
  }

  /**
   * 执行命令
   */
  executeCommand(cmd, args, options = {}) {
    return new Promise((resolve) => {
      const child = spawn(cmd, args, {
        stdio: ["pipe", "pipe", "pipe"],
        timeout: options.timeout || 60000,
        shell: true  // Windows 需要 shell
      });

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => { stdout += data.toString(); });
      child.stderr.on("data", (data) => { stderr += data.toString(); });

      child.on("close", (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr,
          code
        });
      });

      child.on("error", (err) => {
        resolve({
          success: false,
          error: err.message
        });
      });
    });
  }
}

module.exports = IMGatewayInstaller;
