/**
 * AutoStarter - 系统服务注册与开机自启
 *
 * 支持:
 * - Windows: 注册表 + 计划任务
 * - Linux: systemd + cron
 * - macOS: launchd
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const os = require("os");

class AutoStarter {
  constructor() {
    this.platform = os.platform();
    this.appName = "stigmergy";
    this.appDisplayName = "Stigmergy Auto-Supervisor";
  }

  /**
   * 检查是否已注册开机自启
   */
  isRegistered() {
    switch (this.platform) {
      case "win32":
        return this._checkWindows();
      case "linux":
        return this._checkLinux();
      case "darwin":
        return this._checkMacOS();
      default:
        return false;
    }
  }

  /**
   * 注册开机自启
   */
  register() {
    console.log(`\n🚀 注册开机自启 (${this.platform})...`);

    switch (this.platform) {
      case "win32":
        return this._registerWindows();
      case "linux":
        return this._registerLinux();
      case "darwin":
        return this._registerMacOS();
      default:
        console.log("⚠️ 不支持的平台");
        return false;
    }
  }

  /**
   * 取消注册开机自启
   */
  unregister() {
    console.log(`\n🗑️ 取消开机自启 (${this.platform})...`);

    switch (this.platform) {
      case "win32":
        return this._unregisterWindows();
      case "linux":
        return this._unregisterLinux();
      case "darwin":
        return this._unregisterMacOS();
      default:
        return false;
    }
  }

  // ========== Windows 实现 ==========

  _checkWindows() {
    try {
      // 检查注册表
      const result = execSync(
        `reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v StigmergyAutoSupervisor`,
        { encoding: "utf-8", stdio: "pipe" },
      );
      return result.includes("StigmergyAutoSupervisor");
    } catch (e) {
      return false;
    }
  }

  _registerWindows() {
    try {
      const exePath = process.execPath;
      const scriptPath = path.join(
        os.homedir(),
        ".stigmergy",
        "bin",
        "auto-supervisor.bat",
      );

      // 创建启动脚本
      const binDir = path.dirname(scriptPath);
      if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir, { recursive: true });
      }

      const batContent = `@echo off
cd /d "${path.dirname(require.main?.filename || __dirname)}"
start /b node "${path.join(__dirname, "..", "src", "index.js")}" auto-supervisor start > NUL 2>&1
`;
      fs.writeFileSync(scriptPath, batContent, "utf-8");

      // 注册到启动项
      const regCommand = `reg add "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v StigmergyAutoSupervisor /t REG_SZ /d "\\"${exePath}\\" \\"${scriptPath}\\"" /f`;
      execSync(regCommand, { encoding: "utf-8", stdio: "pipe" });

      console.log("✅ Windows开机自启已注册");
      console.log(`   脚本: ${scriptPath}`);
      return true;
    } catch (e) {
      console.log(`⚠️ 注册失败: ${e.message}`);
      return false;
    }
  }

  _unregisterWindows() {
    try {
      execSync(
        `reg delete "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run" /v StigmergyAutoSupervisor /f`,
        { encoding: "utf-8", stdio: "pipe" },
      );
      console.log("✅ Windows开机自启已取消");
      return true;
    } catch (e) {
      console.log("⚠️ 取消注册失败 (可能未注册)");
      return false;
    }
  }

  // ========== Linux 实现 ==========

  _checkLinux() {
    try {
      // 检查systemd
      const result = execSync("systemctl is-enabled stigmergy-supervisor", {
        encoding: "utf-8",
        stdio: "pipe",
      });
      return result.trim() === "enabled";
    } catch (e) {
      // 检查cron
      try {
        const crontab = execSync("crontab -l", {
          encoding: "utf-8",
          stdio: "pipe",
        });
        return crontab.includes("@reboot") && crontab.includes("stigmergy");
      } catch (e2) {
        return false;
      }
    }
  }

  _registerLinux() {
    try {
      const exePath = process.execPath;
      const serviceContent = `[Unit]
Description=Stigmergy Auto-Supervisor
After=network.target

[Service]
Type=simple
User=${os.userInfo().username}
WorkingDirectory=${os.homedir()}
ExecStart=${exePath} ${path.join(__dirname, "..", "src", "index.js")} auto-supervisor start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
`;

      // 写入systemd服务文件
      const servicePath = "/etc/systemd/system/stigmergy-supervisor.service";
      fs.writeFileSync(servicePath, serviceContent, "utf-8");

      // 启用服务
      execSync("systemctl daemon-reload", { stdio: "pipe" });
      execSync("systemctl enable stigmergy-supervisor", { stdio: "pipe" });
      execSync("systemctl start stigmergy-supervisor", { stdio: "pipe" });

      console.log("✅ Linux systemd服务已注册");
      return true;
    } catch (e) {
      // 如果systemd失败，使用cron
      console.log("⚠️ systemd注册失败，使用cron...");
      return this._registerLinuxCron();
    }
  }

  _registerLinuxCron() {
    try {
      const exePath = process.execPath;
      const scriptPath = path.join(
        os.homedir(),
        ".stigmergy",
        "bin",
        "auto-supervisor.sh",
      );

      // 创建启动脚本
      const binDir = path.dirname(scriptPath);
      if (!fs.existsSync(binDir)) {
        fs.mkdirSync(binDir, { recursive: true });
      }

      const shContent = `#!/bin/bash
${exePath} "${path.join(__dirname, "..", "src", "index.js")}" auto-supervisor start
`;
      fs.writeFileSync(scriptPath, shContent, "utf-8");
      fs.chmodSync(scriptPath, "755");

      // 添加到crontab
      const cronEntry = `@reboot ${scriptPath}`;
      try {
        const current = execSync("crontab -l", {
          encoding: "utf-8",
          stdio: "pipe",
        });
        if (!current.includes(cronEntry)) {
          execSync(`(echo "${current}"; echo "${cronEntry}") | crontab -`, {
            stdio: "pipe",
          });
        }
      } catch (e) {
        execSync(`echo "${cronEntry}" | crontab -`, { stdio: "pipe" });
      }

      console.log("✅ Linux cron开机自启已注册");
      return true;
    } catch (e) {
      console.log(`⚠️ 注册失败: ${e.message}`);
      return false;
    }
  }

  _unregisterLinux() {
    try {
      // 尝试systemd
      execSync("systemctl stop stigmergy-supervisor", { stdio: "pipe" });
      execSync("systemctl disable stigmergy-supervisor", { stdio: "pipe" });
      execSync("rm -f /etc/systemd/system/stigmergy-supervisor.service", {
        stdio: "pipe",
      });
      console.log("✅ systemd服务已移除");
    } catch (e) {
      // 忽略
    }

    try {
      // 移除cron
      const current = execSync("crontab -l", {
        encoding: "utf-8",
        stdio: "pipe",
      });
      const lines = current.split("\n").filter((l) => !l.includes("stigmergy"));
      execSync(`echo "${lines.join("\n")}" | crontab -`, { stdio: "pipe" });
      console.log("✅ cron任务已移除");
    } catch (e) {
      // 忽略
    }

    return true;
  }

  // ========== macOS 实现 ==========

  _checkMacOS() {
    try {
      const result = execSync("launchctl list | grep stigmergy", {
        encoding: "utf-8",
        stdio: "pipe",
      });
      return result.includes("stigmergy");
    } catch (e) {
      return false;
    }
  }

  _registerMacOS() {
    try {
      const exePath = process.execPath;
      const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.stigmergy.supervisor</string>
    <key>ProgramArguments</key>
    <array>
        <string>${exePath}</string>
        <string>${path.join(__dirname, "..", "src", "index.js")}</string>
        <string>auto-supervisor</string>
        <string>start</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
</dict>
</plist>`;

      const plistPath = path.join(
        os.homedir(),
        "Library",
        "LaunchAgents",
        "com.stigmergy.supervisor.plist",
      );

      // 创建目录
      const dir = path.dirname(plistPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(plistPath, plistContent, "utf-8");

      // 加载
      execSync(`launchctl load ${plistPath}`, { stdio: "pipe" });

      console.log("✅ macOS launchd服务已注册");
      return true;
    } catch (e) {
      console.log(`⚠️ 注册失败: ${e.message}`);
      return false;
    }
  }

  _unregisterMacOS() {
    try {
      const plistPath = path.join(
        os.homedir(),
        "Library",
        "LaunchAgents",
        "com.stigmergy.supervisor.plist",
      );
      execSync(`launchctl unload ${plistPath}`, { stdio: "pipe" });
      fs.unlinkSync(plistPath);
      console.log("✅ macOS服务已移除");
      return true;
    } catch (e) {
      console.log("⚠️ 移除失败 (可能未注册)");
      return false;
    }
  }

  /**
   * 获取状态信息
   */
  getStatus() {
    const registered = this.isRegistered();

    return {
      platform: this.platform,
      registered,
      appName: this.appDisplayName,
      commands: {
        register: "stigmergy service install",
        unregister: "stigmergy service uninstall",
        start: "stigmergy auto-supervisor start",
        stop: "stigmergy auto-supervisor stop",
      },
    };
  }
}

// CLI入口
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || "status";

  const starter = new AutoStarter();

  switch (command) {
    case "install":
    case "register":
      starter.register();
      break;

    case "uninstall":
    case "remove":
      starter.unregister();
      break;

    case "status":
    default:
      const status = starter.getStatus();
      console.log("\n📋 Stigmergy Auto-Supervisor 状态\n");
      console.log(`平台: ${status.platform}`);
      console.log(`注册: ${status.registered ? "✅ 已注册" : "❌ 未注册"}`);
      console.log(`\n命令:`);
      console.log(`   注册: ${status.commands.register}`);
      console.log(`   卸载: ${status.commands.unregister}`);
      console.log(`   启动: ${status.commands.start}`);
      console.log(`   停止: ${status.commands.stop}\n`);
  }
}

module.exports = AutoStarter;
