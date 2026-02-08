/**
 * 项目全局状态看板管理器
 * 实现跨 CLI 会话的间接协同机制
 *
 * 核心思想：
 * - 文件系统 = 持久化共享内存
 * - 所有 CLI 会话读写同一个状态文件
 * - 状态驱动协同，而非直接通信
 */

const fs = require("fs").promises;
const path = require("path");

class ProjectStatusBoard {
  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.statusDir = path.join(projectRoot, ".stigmergy", "status");
    this.statusFilePath = path.join(this.statusDir, "PROJECT_STATUS.md");
    this.lockDir = path.join(this.statusDir, ".locks");
    this.lockTimeout = 30000;
    this.staleThreshold = 600000;
  }

  _getLockPath() {
    return path.join(this.lockDir, `lock-${process.pid}`);
  }

  /**
   * 初始化项目状态看板
   */
  async initialize(projectInfo = {}) {
    await fs.mkdir(this.statusDir, { recursive: true });

    const exists = await this._fileExists(this.statusFilePath);

    if (!exists) {
      const initialContent = this._generateInitialStatus(projectInfo);
      await fs.writeFile(this.statusFilePath, initialContent, "utf8");
      console.log(
        `[STATUS] Initialized project status board: ${this.statusFilePath}`,
      );
    }

    return this.statusFilePath;
  }

  /**
   * 读取项目状态
   */
  async readStatus() {
    try {
      const content = await fs.readFile(this.statusFilePath, "utf8");
      return this._parseStatus(content);
    } catch (error) {
      console.error(`[STATUS] Failed to read status:`, error.message);
      return null;
    }
  }

  /**
   * 更新项目状态
   */
  async updateStatus(updates) {
    await this._acquireLock();

    try {
      const currentStatus = await this.readStatus();
      const newStatus = this._mergeStatus(currentStatus, updates);
      const content = this._serializeStatus(newStatus);

      await fs.writeFile(this.statusFilePath, content, "utf8");

      if (process.env.DEBUG === "true") {
        console.log(`[STATUS] Updated status board`);
      }

      return newStatus;
    } finally {
      await this._releaseLock();
    }
  }

  /**
   * 记录 CLI 任务
   */
  async recordTask(cliName, task, result = {}) {
    const timestamp = new Date().toISOString();
    const timeStr = new Date().toLocaleString("zh-CN");

    await this.updateStatus({
      currentCLI: cliName,
      lastActivity: timestamp,
      tasks: {
        ongoing: {
          cli: cliName,
          task: task,
          startTime: timestamp,
        },
      },
      collaborationHistory: {
        type: "add",
        entry: {
          timestamp,
          cli: cliName,
          type: "task",
          content: task,
          result: result.success ? "SUCCESS" : "FAILED",
          executionTime: result.executionTime,
        },
      },
    });
  }

  /**
   * 记录发现
   */
  async recordFinding(cliName, category, content, metadata = {}) {
    const timestamp = new Date().toISOString();

    await this.updateStatus({
      findings: {
        type: "add",
        entry: {
          timestamp,
          cli: cliName,
          category,
          content,
          metadata,
        },
      },
    });
  }

  /**
   * 记录决策
   */
  async recordDecision(cliName, decision, rationale) {
    const timestamp = new Date().toISOString();

    await this.updateStatus({
      decisions: {
        type: "add",
        entry: {
          timestamp,
          cli: cliName,
          decision,
          rationale,
        },
      },
    });
  }

  /**
   * 切换当前 CLI
   */
  async switchCLI(cliName, context = {}) {
    await this.updateStatus({
      currentCLI: cliName,
      currentSession: {
        cli: cliName,
        startTime: new Date().toISOString(),
        context,
      },
    });
  }

  /**
   * 添加任务到队列
   */
  async addTaskToQueue(task, priority = "normal") {
    const taskId = `task-${Date.now()}`;

    await this.updateStatus({
      taskQueue: {
        type: "add",
        entry: {
          id: taskId,
          task,
          priority,
          status: "pending",
          createdAt: new Date().toISOString(),
        },
      },
    });

    return taskId;
  }

  /**
   * 完成任务
   */
  async completeTask(taskId, result) {
    const status = await this.readStatus();
    const task = status.taskQueue.find((t) => t.id === taskId);

    if (task) {
      await this.updateStatus({
        taskQueue: {
          type: "update",
          taskId,
          updates: {
            status: "completed",
            completedAt: new Date().toISOString(),
            result,
          },
        },
      });
    }
  }

  /**
   * 获取上下文摘要（用于注入到 CLI 任务）
   */
  async getContextSummary(options = {}) {
    const {
      maxHistory = 10,
      includeFindings = true,
      includeDecisions = true,
    } = options;

    const status = await this.readStatus();
    if (!status) return "";

    const sections = [];

    // 1. 当前状态
    sections.push(`## 当前状态`);
    sections.push(`- 当前CLI: ${status.currentCLI || "none"}`);
    sections.push(`- 项目阶段: ${status.projectInfo.phase || "initial"}`);
    sections.push(`- 最后活动: ${status.lastActivity || "never"}`);
    sections.push("");

    // 2. 任务概览
    if (status.taskQueue && status.taskQueue.length > 0) {
      sections.push(`## 任务队列`);
      const pending = status.taskQueue.filter((t) => t.status === "pending");
      const ongoing = status.taskQueue.filter((t) => t.status === "ongoing");
      const completed = status.taskQueue.filter(
        (t) => t.status === "completed",
      );

      if (pending.length > 0) {
        sections.push(`### 待处理 (${pending.length})`);
        pending.slice(0, 5).forEach((t) => {
          sections.push(`- [ ] ${t.task}`);
        });
        sections.push("");
      }

      if (ongoing.length > 0) {
        sections.push(`### 进行中`);
        ongoing.forEach((t) => {
          sections.push(`- [→] ${t.task} (${t.cli})`);
        });
        sections.push("");
      }
    }

    // 3. 关键发现
    if (includeFindings && status.findings && status.findings.length > 0) {
      sections.push(`## 关键发现 (${status.findings.length}条)`);
      status.findings.slice(-maxHistory).forEach((f) => {
        sections.push(`- **${f.category}** [${f.cli}]: ${f.content}`);
      });
      sections.push("");
    }

    // 4. 决策日志
    if (includeDecisions && status.decisions && status.decisions.length > 0) {
      sections.push(`## 决策日志 (${status.decisions.length}条)`);
      status.decisions.slice(-5).forEach((d) => {
        sections.push(`- ${d.decision} [${d.cli}]`);
      });
      sections.push("");
    }

    // 5. 协作历史（最近）
    if (status.collaborationHistory && status.collaborationHistory.length > 0) {
      sections.push(`## 协作历史`);
      status.collaborationHistory.slice(-maxHistory).forEach((h) => {
        const icon =
          h.type === "task" ? "📋" : h.type === "finding" ? "💡" : "🎯";
        sections.push(`- ${icon} [${h.cli}] ${h.content}`);
      });
      sections.push("");
    }

    return sections.join("\n");
  }

  /**
   * 生成状态报告（用于 status 命令）
   */
  async generateReport() {
    const status = await this.readStatus();
    if (!status) {
      return "No status information available.";
    }

    const lines = [];
    lines.push("========================================");
    lines.push("  项目全局状态看板");
    lines.push("========================================\n");

    // 项目信息
    lines.push("📁 项目信息:");
    lines.push(`  名称: ${status.projectInfo.name || "Unknown"}`);
    lines.push(`  阶段: ${status.projectInfo.phase || "initial"}`);
    lines.push(`  创建时间: ${status.projectInfo.createdAt || "Unknown"}`);
    lines.push("");

    // 当前状态
    lines.push("🎯 当前状态:");
    lines.push(`  活跃CLI: ${status.currentCLI || "none"}`);
    lines.push(`  最后活动: ${status.lastActivity || "never"}`);
    lines.push("");

    // 任务统计
    if (status.taskQueue) {
      const pending = status.taskQueue.filter(
        (t) => t.status === "pending",
      ).length;
      const ongoing = status.taskQueue.filter(
        (t) => t.status === "ongoing",
      ).length;
      const completed = status.taskQueue.filter(
        (t) => t.status === "completed",
      ).length;

      lines.push("📋 任务统计:");
      lines.push(`  待处理: ${pending}`);
      lines.push(`  进行中: ${ongoing}`);
      lines.push(`  已完成: ${completed}`);
      lines.push("");
    }

    // 发现统计
    if (status.findings) {
      lines.push(`💡 发现: ${status.findings.length}条`);
    }

    // 决策统计
    if (status.decisions) {
      lines.push(`🎯 决策: ${status.decisions.length}条`);
    }

    // 协作统计
    if (status.collaborationHistory) {
      lines.push(`🤝 协作记录: ${status.collaborationHistory.length}条`);
    }

    lines.push("\n========================================");

    return lines.join("\n");
  }

  /**
   * 生成初始状态内容
   * @private
   */
  _generateInitialStatus(projectInfo) {
    const now = new Date();
    const timestamp = now.toISOString();
    const timeStr = now.toLocaleString("zh-CN");

    return `# 项目全局状态看板

## 项目信息
- **项目名称**: ${projectInfo.name || path.basename(this.projectRoot)}
- **项目根目录**: \`${this.projectRoot}\`
- **创建时间**: ${timeStr}
- **会话ID**: ${projectInfo.sessionId || "session-" + Date.now()}
- **阶段**: ${projectInfo.phase || "initial"}

## 当前状态
- **活跃CLI**: none
- **当前任务**: 无
- **最后活动**: ${timeStr}

## 任务队列
### 待处理
- [ ] 初始化项目

### 进行中
无

### 已完成
无

## 关键发现
暂无

## 决策日志
暂无

## 协作历史
### 会话开始
- [${timestamp}] 项目状态看板初始化完成

---
*此文件由 Stigmergy 自动维护，请勿手动编辑*
*更新时间: ${timeStr}*
`;
  }

  /**
   * 解析状态文件
   * @private
   */
  _parseStatus(content) {
    const status = {
      projectInfo: {},
      currentCLI: "none",
      lastActivity: null,
      taskQueue: [],
      findings: [],
      decisions: [],
      collaborationHistory: [],
    };

    const lines = content.split("\n");
    let currentSection = "";
    let currentSubsection = "";

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // 检测章节标题
      if (line.startsWith("## ")) {
        currentSection = line.replace("## ", "").replace(":", "").trim();
        currentSubsection = "";
        continue;
      }

      // 检测小节标题
      if (line.startsWith("### ")) {
        currentSubsection = line.replace("### ", "").trim();
        continue;
      }

      // 解析项目信息
      if (currentSection === "项目信息" && line.startsWith("- **")) {
        const match = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          // 映射中文key到英文
          const keyMap = {
            项目名称: "name",
            项目根目录: "rootDir",
            创建时间: "createdAt",
            会话ID: "sessionId",
            阶段: "phase",
          };
          status.projectInfo[keyMap[key] || key] = value;
        }
      }

      // 解析当前状态
      if (currentSection === "当前状态" && line.startsWith("- **")) {
        const match = line.match(/\*\*(.+?)\*\*:\s*(.+)/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key === "活跃CLI") {
            status.currentCLI = value;
          } else if (key === "最后活动") {
            status.lastActivity = value;
          }
        }
      }

      // 解析任务队列
      if (currentSection === "任务队列") {
        // 待处理
        if (currentSubsection === "待处理" && line.startsWith("- [ ]")) {
          const task = line.replace("- [ ]", "").trim();
          status.taskQueue.push({
            id: `task-${Date.now()}-${Math.random()}`,
            task,
            status: "pending",
            priority: "normal",
            createdAt: new Date().toISOString(),
          });
        }
        // 进行中
        if (currentSubsection === "进行中" && line.startsWith("- [→]")) {
          const match = line.match(/\[→\]\s*(.+?)\s*\((.+?)\)/);
          if (match) {
            const task = match[1].trim();
            const cli = match[2].trim();
            status.taskQueue.push({
              id: `task-${Date.now()}-${Math.random()}`,
              task,
              status: "ongoing",
              cli,
              createdAt: new Date().toISOString(),
            });
          }
        }
        // 已完成
        if (currentSubsection === "已完成" && line.startsWith("- [x]")) {
          const match = line.match(/\[x\]\s*(.+?)\s*\((.+?)\)/);
          if (match) {
            const task = match[1].trim();
            const result = match[2].trim();
            status.taskQueue.push({
              id: `task-${Date.now()}-${Math.random()}`,
              task,
              status: "completed",
              result,
              completedAt: new Date().toISOString(),
            });
          }
        }
      }

      // 解析关键发现
      if (currentSection === "关键发现" && line.startsWith("- **")) {
        const match = line.match(/\*\*(.+?)\*\*\s*\[(.+?)\]:\s*(.+)/);
        if (match) {
          const category = match[1].trim();
          const cli = match[2].trim();
          const content = match[3].trim();
          status.findings.push({
            timestamp: new Date().toISOString(),
            cli,
            category,
            content,
          });
        }
      }

      // 解析决策日志
      if (currentSection === "决策日志" && line.startsWith("- ")) {
        const match = line.match(/-(.+?)\s*\[(.+?)\]/);
        if (match) {
          const decision = match[1].trim();
          const cli = match[2].trim();
          // 下一行是理由
          const nextLine = lines[++i] || "";
          const rationaleMatch = nextLine.match(/>\s*理由:\s*(.+)/);
          const rationale = rationaleMatch ? rationaleMatch[1].trim() : "";
          status.decisions.push({
            timestamp: new Date().toISOString(),
            cli,
            decision,
            rationale,
          });
        }
      }

      // 解析协作历史
      if (currentSection === "协作历史" && line.startsWith("- ")) {
        // 格式: - 📋 [qwen] 任务内容 (2026/1/27 10:00:00)
        const match = line.match(/([📋💡🎯])\s*\[(.+?)\]\s*(.+?)\s*\((.+?)\)/);
        if (match) {
          const typeIcon = match[1].trim();
          const cli = match[2].trim();
          const content = match[3].trim();
          const timeStr = match[4].trim();
          const type =
            typeIcon === "📋"
              ? "task"
              : typeIcon === "💡"
                ? "finding"
                : "decision";

          // 尝试解析时间
          let timestamp = new Date().toISOString();
          try {
            const date = new Date(timeStr);
            if (!isNaN(date)) {
              timestamp = date.toISOString();
            }
          } catch (e) {
            // 保持默认时间戳
          }

          status.collaborationHistory.push({
            timestamp,
            cli,
            type,
            content,
            result: "SUCCESS", // 默认值
          });
        }
      }
    }

    return status;
  }

  /**
   * 序列化状态为 Markdown
   * @private
   */
  _serializeStatus(status) {
    const lines = [];
    const now = new Date();
    const timeStr = now.toLocaleString("zh-CN");

    lines.push("# 项目全局状态看板");
    lines.push("");

    // 项目信息
    lines.push("## 项目信息");
    if (status.projectInfo) {
      Object.entries(status.projectInfo).forEach(([key, value]) => {
        if (value) lines.push(`- **${key}**: ${value}`);
      });
    }
    lines.push("");

    // 当前状态
    lines.push("## 当前状态");
    lines.push(`- **活跃CLI**: ${status.currentCLI || "none"}`);
    if (status.currentTask) {
      lines.push(`- **当前任务**: ${status.currentTask}`);
    }
    lines.push(`- **最后活动**: ${status.lastActivity || timeStr}`);
    lines.push("");

    // 任务队列
    lines.push("## 任务队列");
    if (status.taskQueue && status.taskQueue.length > 0) {
      const sections = {
        pending: status.taskQueue.filter((t) => t.status === "pending"),
        ongoing: status.taskQueue.filter((t) => t.status === "ongoing"),
        completed: status.taskQueue.filter((t) => t.status === "completed"),
      };

      if (sections.pending.length > 0) {
        lines.push("### 待处理");
        sections.pending.forEach((t) => {
          lines.push(`- [ ] ${t.task}`);
        });
        lines.push("");
      }

      if (sections.ongoing.length > 0) {
        lines.push("### 进行中");
        sections.ongoing.forEach((t) => {
          lines.push(`- [→] ${t.task} (${t.cli})`);
        });
        lines.push("");
      }

      if (sections.completed.length > 0) {
        lines.push("### 已完成");
        sections.completed.forEach((t) => {
          lines.push(`- [x] ${t.task} (${t.result || "done"})`);
        });
        lines.push("");
      }
    } else {
      lines.push("暂无任务\n");
    }

    // 关键发现
    lines.push("## 关键发现");
    if (status.findings && status.findings.length > 0) {
      status.findings.slice(-20).forEach((f) => {
        lines.push(`- **${f.category}** [${f.cli}]: ${f.content}`);
      });
    } else {
      lines.push("暂无");
    }
    lines.push("");

    // 决策日志
    lines.push("## 决策日志");
    if (status.decisions && status.decisions.length > 0) {
      status.decisions.slice(-20).forEach((d) => {
        lines.push(`- ${d.decision} [${d.cli}]`);
        lines.push(`  > 理由: ${d.rationale}`);
      });
    } else {
      lines.push("暂无");
    }
    lines.push("");

    // 协作历史
    lines.push("## 协作历史");
    if (status.collaborationHistory && status.collaborationHistory.length > 0) {
      status.collaborationHistory.slice(-50).forEach((h) => {
        const icon =
          h.type === "task" ? "📋" : h.type === "finding" ? "💡" : "🎯";
        const time = new Date(h.timestamp).toLocaleString("zh-CN");
        lines.push(`- ${icon} [${h.cli}] ${h.content} (${time})`);
      });
    } else {
      lines.push("暂无");
    }
    lines.push("");

    lines.push("---");
    lines.push(`*此文件由 Stigmergy 自动维护，请勿手动编辑*`);
    lines.push(`*更新时间: ${timeStr}*`);

    return lines.join("\n");
  }

  /**
   * 合并状态更新
   * @private
   */
  _mergeStatus(current, updates) {
    const merged = current || {
      projectInfo: {},
      currentCLI: "none",
      taskQueue: [],
      findings: [],
      decisions: [],
      collaborationHistory: [],
    };

    // 合并基本信息
    if (updates.currentCLI) merged.currentCLI = updates.currentCLI;
    if (updates.lastActivity) merged.lastActivity = updates.lastActivity;
    if (updates.projectInfo) {
      merged.projectInfo = { ...merged.projectInfo, ...updates.projectInfo };
    }

    // 合并任务队列
    if (updates.taskQueue) {
      if (updates.taskQueue.type === "add") {
        merged.taskQueue.push(updates.taskQueue.entry);
      } else if (updates.taskQueue.type === "update") {
        const idx = merged.taskQueue.findIndex(
          (t) => t.id === updates.taskQueue.taskId,
        );
        if (idx >= 0) {
          merged.taskQueue[idx] = {
            ...merged.taskQueue[idx],
            ...updates.taskQueue.updates,
          };
        }
      }
    }

    // 合并发现
    if (updates.findings && updates.findings.type === "add") {
      merged.findings.push(updates.findings.entry);
    }

    // 合并决策
    if (updates.decisions && updates.decisions.type === "add") {
      merged.decisions.push(updates.decisions.entry);
    }

    // 合并协作历史
    if (
      updates.collaborationHistory &&
      updates.collaborationHistory.type === "add"
    ) {
      merged.collaborationHistory.push(updates.collaborationHistory.entry);
    }

    return merged;
  }

  /**
   * 检查文件是否存在
   * @private
   */
  async _fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 获取文件锁
   * @private
   */
  async _acquireLock() {
    await fs.mkdir(this.lockDir, { recursive: true });
    await this._cleanupStaleLocks();

    const lockPath = this._getLockPath();
    const lockInfo = JSON.stringify({
      pid: process.pid,
      timestamp: Date.now(),
      hostname: require("os").hostname(),
    });

    const maxWait = this.lockTimeout;
    const start = Date.now();

    while (Date.now() - start < maxWait) {
      try {
        await fs.writeFile(lockPath, lockInfo, { flag: "wx" });
        return true;
      } catch (e) {
        if (e.code !== "EEXIST") throw e;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }

    return false;
  }

  /**
   * 清理过期锁
   * @private
   */
  async _cleanupStaleLocks() {
    try {
      if (!(await this._fileExists(this.lockDir))) return;

      const files = await fs.readdir(this.lockDir);
      const now = Date.now();

      for (const file of files) {
        const filePath = path.join(this.lockDir, file);
        try {
          const content = await fs.readFile(filePath, "utf8");
          const info = JSON.parse(content);
          const age = now - info.timestamp;

          if (age > this.staleThreshold) {
            const pidExists =
              info.pid === process.pid ||
              (await this._isProcessRunning(info.pid));

            if (!pidExists) {
              await fs.unlink(filePath);
            }
          }
        } catch (e) {
          await fs.unlink(filePath);
        }
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  }

  /**
   * 检查进程是否运行
   * @private
   */
  async _isProcessRunning(pid) {
    try {
      process.kill(pid, 0);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * 释放文件锁
   * @private
   */
  async _releaseLock() {
    try {
      const lockPath = this._getLockPath();
      if (await this._fileExists(lockPath)) {
        await fs.unlink(lockPath);
      }
    } catch {
      // 锁可能已不存在
    }
  }

  /**
   * 释放文件锁
   * @private
   */
  async _releaseLock() {
    try {
      const lockPath = this._getLockPath();
      if (await this._fileExists(lockPath)) {
        await fs.unlink(lockPath);
      }
    } catch {
      // 锁可能已不存在
    }
  }
}

module.exports = { ProjectStatusBoard };
