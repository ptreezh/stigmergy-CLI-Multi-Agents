/**
 * SoulReflector - 自我反思与经验提炼系统
 *
 * 核心功能：
 * 1. 从历史会话中提炼经验教训
 * 2. 识别成功模式和失败模式
 * 3. 清理/归档旧会话，避免历史爆炸
 * 4. 生成反思报告和行动建议
 */

const fs = require("fs");
const path = require("path");
const { spawn, execSync } = require("child_process");
const os = require("os");

class SoulReflector {
  constructor(options = {}) {
    this.soulIdentity = options.soulIdentity;
    this.knowledgeBase = options.knowledgeBase;

    // 配置
    this.config = {
      // 会话来源配置
      cliList: options.cliList || [
        "claude",
        "qwen",
        "gemini",
        "iflow",
        "codebuddy",
        "codex",
        "qoder",
        "opencode",
      ],

      // 会话历史配置
      maxSessionAge: options.maxSessionAge || 7 * 24 * 60 * 60 * 1000, // 7天
      maxSessionsToAnalyze: options.maxSessionsToAnalyze || 10,
      sessionsToKeep: options.sessionsToKeep || 3, // 每个CLI保留最近3个

      // 反思配置
      reflectionPrompt:
        options.reflectionPrompt || this._defaultReflectionPrompt(),

      // 清理配置
      enableCleanup: options.enableCleanup !== false,
      cleanupDryRun: options.cleanupDryRun || false,

      // 存储路径
      reflectionDir: options.reflectionDir || this._getDefaultReflectionDir(),
      ...options,
    };

    // 状态
    this.lastReflectionTime = null;
    this.reflectionHistory = [];
    this.lessonsLearned = [];

    // 确保目录存在
    this._ensureDirs();
  }

  _getDefaultReflectionDir() {
    const home = process.env.HOME || process.env.USERPROFILE || "";
    return path.join(home, ".stigmergy", "reflection");
  }

  _ensureDirs() {
    const dirs = [
      this.config.reflectionDir,
      path.join(this.config.reflectionDir, "reports"),
      path.join(this.config.reflectionDir, "lessons"),
      path.join(this.config.reflectionDir, "archive"),
    ];
    for (const dir of dirs) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  }

  _defaultReflectionPrompt() {
    return `你是一个专业的AI助手反思分析器。请分析以下AI会话历史，提取有价值的经验教训。

请从以下角度进行分析：
1. **成功模式**：哪些做法效果好？成功的原因是什么？
2. **失败模式**：哪些尝试失败了？失败的原因是什么？
3. **改进建议**：下次可以如何做得更好？
4. **关键洞察**：有哪些重要的发现或领悟？

请用JSON格式返回分析结果：
{
  "successPatterns": ["模式1", "模式2"],
  "failurePatterns": ["问题1", "问题2"],
  "improvements": ["建议1", "建议2"],
  "keyInsights": ["洞察1", "洞察2"],
  "overallReflection": "总体反思摘要"
}`;
  }

  /**
   * 执行完整反思流程
   */
  async reflect() {
    console.log("\n[SoulReflector] 🧠 开始自我反思...");
    const startTime = Date.now();

    try {
      // 1. 收集各CLI的最近会话
      const sessions = await this._collectSessions();
      console.log(`[SoulReflector] 收集到 ${sessions.length} 个会话`);

      if (sessions.length === 0) {
        console.log("[SoulReflector] 没有找到历史会话，跳过反思");
        return {
          success: true,
          sessionsAnalyzed: 0,
          reason: "no_sessions",
        };
      }

      // 2. 分析会话，提炼经验教训
      const analysis = await this._analyzeSessions(sessions);

      // 3. 保存反思结果
      await this._saveReflection(analysis);

      // 4. 提取可执行的教训到知识库
      if (this.knowledgeBase && analysis.lessons?.length > 0) {
        for (const lesson of analysis.lessons) {
          this.knowledgeBase.add({
            title: lesson.title,
            content: lesson.content,
            source: "self-reflection",
            tags: ["reflection", "lesson-learned", ...(lesson.tags || [])],
            expertise: [this.soulIdentity?.expertise?.core?.[0] || "general"],
          });
        }
        console.log(
          `[SoulReflector] 添加了 ${analysis.lessons.length} 条教训到知识库`,
        );
      }

      // 5. 清理旧会话（如需要）
      if (this.config.enableCleanup) {
        const cleanupResult = await this._cleanupOldSessions();
        console.log(`[SoulReflector] 清理了 ${cleanupResult.cleaned} 个旧会话`);
      }

      const duration = Date.now() - startTime;
      this.lastReflectionTime = new Date();

      console.log(`[SoulReflector] ✅ 反思完成 (${duration}ms)`);
      console.log(
        `[SoulReflector]    分析: ${analysis.sessionsAnalyzed} 个会话`,
      );
      console.log(
        `[SoulReflector]    成功模式: ${analysis.successPatterns?.length || 0}`,
      );
      console.log(
        `[SoulReflector]    失败模式: ${analysis.failurePatterns?.length || 0}`,
      );

      return {
        success: true,
        duration,
        sessionsAnalyzed: analysis.sessionsAnalyzed,
        successPatterns: analysis.successPatterns,
        failurePatterns: analysis.failurePatterns,
        improvements: analysis.improvements,
        lessonsAdded: analysis.lessons?.length || 0,
      };
    } catch (e) {
      console.error(`[SoulReflector] ❌ 反思失败: ${e.message}`);
      return { success: false, error: e.message };
    }
  }

  /**
   * 收集各CLI的历史会话
   */
  async _collectSessions() {
    const allSessions = [];

    for (const cliName of this.config.cliList) {
      try {
        const sessions = await this._getSessionsFromCLI(cliName);
        allSessions.push(...sessions);
      } catch (e) {
        // 忽略单个CLI的错误
      }
    }

    // 按时间排序，最新的在前
    allSessions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // 限制数量
    return allSessions.slice(0, this.config.maxSessionsToAnalyze);
  }

  /**
   * 从单个CLI获取会话
   */
  async _getSessionsFromCLI(cliName) {
    const sessions = [];

    // 尝试使用resumesession获取会话
    const sessionData = await this._callResumeSession(cliName);

    if (sessionData && sessionData.length > 0) {
      for (const session of sessionData.slice(0, 5)) {
        // 每个CLI最多5个
        sessions.push({
          cli: cliName,
          id: session.id || session.sessionId,
          timestamp:
            session.timestamp || session.time || new Date().toISOString(),
          content: session.content || session.summary || "",
          project: session.project || "unknown",
        });
      }
    }

    return sessions;
  }

  /**
   * 调用resumesession获取会话
   */
  async _callResumeSession(cliName) {
    return new Promise((resolve) => {
      try {
        // 尝试调用stigmergy resume
        const proc = spawn(
          "node",
          [
            path.join(
              __dirname,
              "..",
              "..",
              "skills",
              "resumesession",
              "resume.js",
            ),
            cliName,
            "3", // 获取最近3个
          ],
          {
            stdio: ["pipe", "pipe", "pipe"],
            timeout: 30000,
          },
        );

        let output = "";
        proc.stdout.on("data", (data) => {
          output += data.toString();
        });
        proc.stderr.on("data", (data) => {
          output += data.toString();
        });

        proc.on("close", () => {
          // 简单解析输出
          try {
            // 尝试解析为JSON
            const parsed = JSON.parse(output);
            resolve(Array.isArray(parsed) ? parsed : [parsed]);
          } catch (e) {
            // 如果不是JSON，返回包含输出的对象
            resolve([
              {
                id: cliName,
                timestamp: new Date().toISOString(),
                content: output.slice(0, 2000),
                summary: "从resumesession获取",
              },
            ]);
          }
        });

        proc.on("error", () => {
          resolve([]);
        });

        setTimeout(() => {
          proc.kill();
          resolve([]);
        }, 15000);
      } catch (e) {
        resolve([]);
      }
    });
  }

  /**
   * 分析会话，提炼经验教训
   */
  async _analyzeSessions(sessions) {
    const analysis = {
      sessionsAnalyzed: sessions.length,
      timestamp: new Date().toISOString(),
      cliInvolved: [...new Set(sessions.map((s) => s.cli))],
      successPatterns: [],
      failurePatterns: [],
      improvements: [],
      keyInsights: [],
      lessons: [],
    };

    // 简单规则-based分析（可替换为LLM调用）
    for (const session of sessions) {
      const content = (session.content || "").toLowerCase();

      // 检测成功信号
      if (
        content.includes("success") ||
        content.includes("完成") ||
        content.includes("✅") ||
        content.includes("solved") ||
        content.includes("fixed")
      ) {
        analysis.successPatterns.push(`${session.cli}: 成功完成任务`);
      }

      // 检测失败信号
      if (
        content.includes("error") ||
        content.includes("失败") ||
        content.includes("❌") ||
        content.includes("failed") ||
        content.includes("bug")
      ) {
        analysis.failurePatterns.push(`${session.cli}: 遇到问题`);
      }

      // 检测学习信号
      if (
        content.includes("learn") ||
        content.includes("学习") ||
        content.includes("掌握了")
      ) {
        analysis.keyInsights.push(`${session.cli}: 持续学习`);
      }
    }

    // 生成教训
    if (analysis.successPatterns.length > 0) {
      analysis.lessons.push({
        title: "成功模式总结",
        content: analysis.successPatterns.join("; "),
        tags: ["success", "pattern"],
        type: "positive",
      });
    }

    if (analysis.failurePatterns.length > 0) {
      analysis.lessons.push({
        title: "失败模式识别",
        content: analysis.failurePatterns.join("; ") + "。需要改进。",
        tags: ["failure", "improvement"],
        type: "negative",
      });
    }

    // 生成改进建议
    if (analysis.failurePatterns.length > analysis.successPatterns.length) {
      analysis.improvements.push("需要加强学习和练习");
      analysis.improvements.push("建议查看官方文档提升技能");
    }

    if (analysis.successPatterns.length > analysis.failurePatterns.length) {
      analysis.improvements.push("当前方法有效，继续保持");
    }

    return analysis;
  }

  /**
   * 保存反思结果
   */
  async _saveReflection(analysis) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const reportPath = path.join(
      this.config.reflectionDir,
      "reports",
      `reflection_${timestamp}.json`,
    );

    const report = {
      soulName: this.soulIdentity?.name,
      timestamp: new Date().toISOString(),
      sessionsAnalyzed: analysis.sessionsAnalyzed,
      cliInvolved: analysis.cliInvolved,
      successPatterns: analysis.successPatterns,
      failurePatterns: analysis.failurePatterns,
      improvements: analysis.improvements,
      keyInsights: analysis.keyInsights,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf-8");

    // 保存教训
    for (const lesson of analysis.lessons || []) {
      const lessonPath = path.join(
        this.config.reflectionDir,
        "lessons",
        `${lesson.title.replace(/[^a-z0-9]/gi, "_")}_${timestamp}.json`,
      );
      fs.writeFileSync(lessonPath, JSON.stringify(lesson, null, 2), "utf-8");
    }

    // 更新历史
    this.reflectionHistory.push({
      timestamp: new Date().toISOString(),
      sessionsAnalyzed: analysis.sessionsAnalyzed,
      reportPath,
    });

    // 限制历史数量
    if (this.reflectionHistory.length > 50) {
      this.reflectionHistory = this.reflectionHistory.slice(-50);
    }
  }

  /**
   * 清理旧会话
   */
  async _cleanupOldSessions() {
    const result = {
      scanned: 0,
      cleaned: 0,
      kept: 0,
      details: [],
    };

    const maxAge = this.config.maxSessionAge;
    const keepCount = this.config.sessionsToKeep;
    const now = Date.now();

    for (const cliName of this.config.cliList) {
      try {
        // 查找会话目录
        const sessionDirs = this._findSessionDirs(cliName);

        for (const dir of sessionDirs) {
          if (!fs.existsSync(dir)) continue;

          const files = fs
            .readdirSync(dir)
            .filter((f) => f.endsWith(".json") || f.endsWith(".md"))
            .map((f) => ({
              name: f,
              path: path.join(dir, f),
              mtime: fs.statSync(path.join(dir, f)).mtime.getTime(),
            }))
            .sort((a, b) => b.mtime - a.mtime); // 最新的在前

          result.scanned += files.length;

          // 保留最近N个
          const toKeep = files.slice(0, keepCount);
          const toClean = files.slice(keepCount);

          result.kept += toKeep.length;

          // 清理旧的
          for (const file of toClean) {
            const age = now - file.mtime;

            if (age > maxAge) {
              if (!this.config.cleanupDryRun) {
                // 归档而非直接删除
                const archiveDir = path.join(
                  this.config.reflectionDir,
                  "archive",
                  cliName,
                );
                if (!fs.existsSync(archiveDir)) {
                  fs.mkdirSync(archiveDir, { recursive: true });
                }

                const destPath = path.join(
                  archiveDir,
                  `${file.name.replace(/\.[^.]+$/, "")}_${Date.now()}.json`,
                );

                try {
                  fs.renameSync(file.path, destPath);
                  result.cleaned++;
                  result.details.push(`归档: ${cliName}/${file.name}`);
                } catch (e) {
                  // 忽略
                }
              } else {
                result.cleaned++;
                result.details.push(`将删除: ${cliName}/${file.name}`);
              }
            }
          }
        }
      } catch (e) {
        // 忽略单个CLI错误
      }
    }

    return result;
  }

  /**
   * 查找会话目录
   */
  _findSessionDirs(cliName) {
    const home = os.homedir();
    const dirs = [];

    // 常见会话目录模式
    const patterns = {
      claude: [`${home}/.claude/sessions`, `${home}/.claude/history`],
      qwen: [`${home}/.qwen/sessions`, `${home}/.qwen/history`],
      gemini: [`${home}/.cache/gemini/history`],
      iflow: [`${home}/.iflow/sessions`],
      codebuddy: [`${home}/.codebuddy/sessions`],
      codex: [`${home}/.codex/history`],
      qoder: [`${home}/.qoder/sessions`],
      opencode: [`${home}/.opencode/sessions`],
    };

    const cliDirs = patterns[cliName] || [];
    for (const dir of cliDirs) {
      if (fs.existsSync(dir)) {
        dirs.push(dir);
      }
    }

    return dirs;
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      lastReflectionTime: this.lastReflectionTime,
      reflectionCount: this.reflectionHistory.length,
      config: {
        maxSessionAge: this.config.maxSessionAge,
        maxSessionsToAnalyze: this.config.maxSessionsToAnalyze,
        sessionsToKeep: this.config.sessionsToKeep,
        enableCleanup: this.config.enableCleanup,
      },
    };
  }

  /**
   * 获取反思历史
   */
  getHistory(limit = 10) {
    return this.reflectionHistory.slice(-limit);
  }
}

module.exports = SoulReflector;
