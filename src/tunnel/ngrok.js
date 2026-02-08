/**
 * Ngrok Manager - ngrok 隧道管理
 * 自动下载、启动和管理 ngrok 隧道
 */

const { spawn, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const https = require("https");
const { URL } = require("url");

class NgrokManager {
  constructor(options = {}) {
    this.options = {
      installDir:
        options.installDir ||
        path.join(os.homedir(), ".stigmergy", "tools", "ngrok"),
      binName:
        options.binName || (os.platform() === "win32" ? "ngrok.exe" : "ngrok"),
      autostart: options.autostart !== false,
      region: options.region || "us",
      configPath:
        options.configPath || path.join(os.homedir(), ".ngrok2", "ngrok.yml"),
    };

    this.binPath = path.join(this.options.installDir, this.options.binName);
    this.process = null;
    this.apiUrl = null;
    this.publicUrl = null;
    this.running = false;
  }

  /**
   * 检查 ngrok 是否已安装
   */
  isInstalled() {
    return fs.existsSync(this.binPath);
  }

  /**
   * 检查 ngrok 是否正在运行
   */
  isRunning() {
    return this.running && this.process && !this.process.killed;
  }

  /**
   * 获取 ngrok 下载 URL
   */
  getDownloadUrl() {
    const platform = os.platform();

    if (platform === "linux") {
      return "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.zip";
    } else if (platform === "darwin") {
      return "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-darwin-amd64.zip";
    } else if (platform === "win32") {
      return "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip";
    }

    throw new Error(`Unsupported platform: ${platform}`);
  }

  /**
   * 下载 ngrok
   */
  async download() {
    if (this.isInstalled()) {
      console.log("[Ngrok] Already installed");
      return true;
    }

    console.log("[Ngrok] Downloading...");

    const installDir = this.options.installDir;
    if (!fs.existsSync(installDir)) {
      fs.mkdirSync(installDir, { recursive: true });
    }

    const downloadUrl = this.getDownloadUrl();
    const zipPath = path.join(installDir, "ngrok.zip");

    return new Promise((resolve, reject) => {
      const file = fs.createWriteStream(zipPath);

      https
        .get(downloadUrl, (response) => {
          if (response.statusCode === 302 || response.statusCode === 301) {
            return https.get(
              new URL(response.headers.location, downloadUrl).toString(),
              (redirectResponse) => {
                redirectResponse.pipe(file);
                file.on("finish", () => {
                  file.close();
                  this.extract(zipPath, installDir)
                    .then(() => {
                      fs.unlinkSync(zipPath);
                      console.log("[Ngrok] Downloaded successfully");
                      resolve(true);
                    })
                    .catch(reject);
                });
              },
            );
          } else {
            response.pipe(file);
            file.on("finish", () => {
              file.close();
              this.extract(zipPath, installDir)
                .then(() => {
                  fs.unlinkSync(zipPath);
                  console.log("[Ngrok] Downloaded successfully");
                  resolve(true);
                })
                .catch(reject);
            });
          }
        })
        .on("error", (err) => {
          fs.unlinkSync(zipPath);
          reject(err);
        });
    });
  }

  /**
   * 解压 zip 文件
   */
  async extract(zipPath, extractDir) {
    console.log("[Ngrok] Extracting...");

    const platform = os.platform();

    if (platform === "win32") {
      try {
        execSync(
          `powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${extractDir}' -Force"`,
        );
      } catch (error) {
        throw new Error(`Failed to extract: ${error.message}`);
      }
    } else {
      execSync(`unzip -o ${zipPath} -d ${extractDir}`);
    }

    fs.chmodSync(this.binPath, 0o755);
    console.log("[Ngrok] Extracted successfully");
  }

  /**
   * 启动 ngrok 隧道
   */
  async start(port, options = {}) {
    if (this.isRunning()) {
      console.log("[Ngrok] Already running");
      return this.publicUrl;
    }

    if (!this.isInstalled()) {
      console.log("[Ngrok] Not installed, downloading...");
      await this.download();
    }

    console.log(`[Ngrok] Starting tunnel on port ${port}...`);

    const args = [
      "http",
      port.toString(),
      "--region",
      options.region || this.options.region,
      "--log",
      "stdout",
    ];

    if (options.host_header) {
      args.push("--host-header", options.host_header);
    }

    this.process = spawn(this.binPath, args, {
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
    });

    let output = "";

    this.process.stdout.on("data", (data) => {
      output += data.toString();
    });

    this.process.stderr.on("data", (data) => {
      const text = data.toString();
      output += text;

      const urlMatch = text.match(/url=(https:\/\/[^\\s]+)/);
      if (urlMatch && !this.publicUrl) {
        this.publicUrl = urlMatch[1];
        this.apiUrl = this.publicUrl.replace(
          "https://",
          "http://localhost:4040/api/",
        );
        this.running = true;
        console.log(`[Ngrok] Tunnel established: ${this.publicUrl}`);
      }
    });

    this.process.on("error", (error) => {
      console.error("[Ngrok] Process error:", error.message);
      this.running = false;
    });

    this.process.on("exit", (code) => {
      console.log(`[Ngrok] Process exited with code ${code}`);
      this.running = false;
    });

    await this.waitForTunnel(10000);

    return this.publicUrl;
  }

  /**
   * 等待隧道建立
   */
  async waitForTunnel(timeout = 10000) {
    const start = Date.now();
    while (!this.publicUrl && Date.now() - start < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    if (!this.publicUrl) {
      throw new Error("Failed to establish ngrok tunnel");
    }
  }

  /**
   * 停止 ngrok
   */
  stop() {
    if (this.process && !this.process.killed) {
      this.process.kill("SIGTERM");
      this.process = null;
      this.publicUrl = null;
      this.apiUrl = null;
      this.running = false;
      console.log("[Ngrok] Stopped");
    }
  }

  /**
   * 获取隧道状态
   */
  async getStatus() {
    if (!this.running || !this.apiUrl) {
      return { running: false };
    }

    try {
      const response = await fetch(this.apiUrl + "tunnels");
      const data = await response.json();
      return {
        running: true,
        tunnels: data.tunnels || [],
        publicUrl: this.publicUrl,
      };
    } catch (error) {
      return { running: this.running, publicUrl: this.publicUrl };
    }
  }

  /**
   * 检查更新
   */
  async checkUpdate() {
    if (!this.isInstalled()) {
      return { installed: false };
    }

    try {
      const version = execSync(`"${this.binPath}" version`).toString().trim();
      return { installed: true, version };
    } catch (error) {
      return { installed: true, version: "unknown" };
    }
  }

  /**
   * 静态方法：便捷启动
   */
  static async startTunnel(port, options = {}) {
    const manager = new NgrokManager(options);
    const url = await manager.start(port, options);
    return { manager, url };
  }
}

module.exports = { NgrokManager };
