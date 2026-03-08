#!/usr/bin/env node
/**
 * 增强版经验管理器
 * 基于CLI模型算力的智能经验提取和管理
 */

const fs = require("fs");
const path = require("path");
const os = require("os");
const LLMInsightExtractor = require("../extraction/LLMInsightExtractor");

class EnhancedExperienceManager {
  constructor() {
    this.projectDir = process.cwd();
    this.stigmergyMd = path.join(this.projectDir, "STIGMERGY.md");
    this.skillsDir = path.join(os.homedir(), ".stigmergy", "skills");
    this.extractor = new LLMInsightExtractor();

    // 经验积累阈值
    this.skillGenerationThreshold = 5; // 积累5个相关经验后生成技能
  }

  /**
   * 扫描并分析CLI会话
   */
  async scanAndAnalyzeSessions() {
    console.log("\n🧠 增强版经验提取系统启动...\n");

    const cliHistoryPaths = {
      qwen: path.join(os.homedir(), ".qwen", "projects"),
      codebuddy: path.join(os.homedir(), ".codebuddy"),
      claude: path.join(os.homedir(), ".claude", "projects"),
      iflow: path.join(os.homedir(), ".iflow", "projects"),
    };

    let totalSessions = 0;
    let analyzedSessions = 0;
    let extractedInsights = 0;

    for (const [cliName, historyPath] of Object.entries(cliHistoryPaths)) {
      try {
        console.log(`\n📂 扫描 ${cliName} 会话...`);
        const sessions = this.scanCLISessions(cliName, historyPath);
        totalSessions += sessions.length;

        if (sessions.length > 0) {
          console.log(`   📖 找到 ${sessions.length} 个会话文件`);

          // 分析最近的会话
          const recentSessions = sessions.slice(0, 3); // 只分析最近的3个
          for (const session of recentSessions) {
            try {
              console.log(`   🔍 分析会话: ${path.basename(session.file)}`);

              // 读取会话内容
              const sessionContent = this.readSessionContent(session);
              if (!sessionContent) continue;

              // 使用LLM提取经验
              const insights = await this.extractor.extractFromSession(
                sessionContent,
                cliName,
              );

              if (insights && insights.hasValidContent) {
                // 格式化为金字塔MD
                const pyramidMD = this.extractor.formatAsPyramidMD(insights);

                // 追加到STIGMERGY.md
                if (await this.extractor.appendToMemory(pyramidMD)) {
                  analyzedSessions++;
                  extractedInsights++;
                  console.log(`   ✅ 经验已提取并存储`);
                }
              }
            } catch (error) {
              console.log(`   ⚠️  分析失败: ${error.message}`);
            }
          }
        }
      } catch (error) {
        console.log(`   ❌ ${cliName} 扫描失败: ${error.message}`);
      }
    }

    console.log(`\n📊 提取统计:`);
    console.log(`   - 总会话数: ${totalSessions}`);
    console.log(`   - 已分析: ${analyzedSessions}`);
    console.log(`   - 提取洞察: ${extractedInsights}`);

    return { totalSessions, analyzedSessions, extractedInsights };
  }

  /**
   * 扫描特定CLI的会话文件
   */
  scanCLISessions(cliName, historyPath) {
    const sessions = [];
    const cutoffTime = Date.now() - 24 * 60 * 60 * 1000; // 最近1天

    if (!fs.existsSync(historyPath)) {
      return sessions;
    }

    const scanDir = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          scanDir(fullPath);
        } else if (
          entry.isFile() &&
          (entry.name.endsWith(".jsonl") || entry.name.endsWith(".json"))
        ) {
          try {
            const stats = fs.statSync(fullPath);
            if (stats.mtimeMs >= cutoffTime) {
              sessions.push({
                cli: cliName,
                file: fullPath,
                timestamp: stats.mtimeMs,
                size: stats.size,
              });
            }
          } catch (error) {
            // 忽略无法读取的文件
          }
        }
      }
    };

    scanDir(historyPath);
    return sessions.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 读取会话内容
   */
  readSessionContent(session) {
    try {
      let content = fs.readFileSync(session.file, "utf-8");

      // 处理JSONL格式
      if (session.file.endsWith(".jsonl")) {
        const lines = content.split("\n").filter((l) => l.trim());
        const messages = lines
          .map((line) => {
            try {
              const data = JSON.parse(line);
              // 提取用户和助手的消息
              if (data.message && data.message.parts) {
                const role = data.message.role || data.type;
                const text = data.message.parts
                  .map((p) => p.text || "")
                  .join("");
                return `${role}: ${text}`;
              }
              return null;
            } catch (e) {
              return null;
            }
          })
          .filter((m) => m !== null)
          .join("\n\n");
        return messages;
      }

      // 处理JSON格式
      if (session.file.endsWith(".json")) {
        const data = JSON.parse(content);
        if (data.messages) {
          return data.messages
            .map((m) => `${m.role}: ${m.content}`)
            .join("\n\n");
        }
      }

      return content;
    } catch (error) {
      console.log(`   ⚠️  读取会话失败: ${error.message}`);
      return null;
    }
  }

  /**
   * 分析STIGMERGY.md中的经验，生成新技能
   */
  async analyzeAndGenerateSkills() {
    console.log("\n🎨 分析经验并生成技能...\n");

    // 读取STIGMERGY.md中的所有经验
    const experiences = this.extractExperiencesFromMemory();

    if (experiences.length === 0) {
      console.log("   ℹ️  未找到足够的经验，跳过技能生成");
      return;
    }

    console.log(`   📖 找到 ${experiences.length} 条经验`);

    // 按主题分组经验
    const groupedExperiences = this.groupExperiencesByTopic(experiences);

    console.log(
      `   📂 识别出 ${Object.keys(groupedExperiences).length} 个主题`,
    );

    // 为每个主题生成技能
    for (const [topic, topicExperiences] of Object.entries(
      groupedExperiences,
    )) {
      if (topicExperiences.length >= this.skillGenerationThreshold) {
        console.log(`\n   🎯 为主题 "${topic}" 生成技能...`);

        try {
          const skill = await this.generateSkillFromExperiences(
            topic,
            topicExperiences,
          );
          if (skill) {
            await this.deploySkill(skill);
            console.log(`   ✅ 技能已部署: ${skill.name}`);
          }
        } catch (error) {
          console.log(`   ❌ 技能生成失败: ${error.message}`);
        }
      } else {
        console.log(
          `   ⏭️  主题 "${topic}" 经验不足 (${topicExperiences.length}/${this.skillGenerationThreshold})，跳过`,
        );
      }
    }
  }

  /**
   * 从STIGMERGY.md中提取经验
   */
  extractExperiencesFromMemory() {
    const content = fs.readFileSync(this.stigmergyMd, "utf-8");
    const experiences = [];

    // 查找金字塔格式的经验
    const experienceBlocks = content.split(
      /## 并发任务|## 独立运行会话|## 协同进化会话/,
    );

    for (const block of experienceBlocks) {
      if (block.includes("经验层级 1")) {
        experiences.push({
          content: block.trim(),
          topics: this.extractTopics(block),
          confidence: this.extractConfidence(block),
        });
      }
    }

    return experiences;
  }

  /**
   * 提取经验的主题/关键词
   */
  extractTopics(experienceContent) {
    const topics = [];

    // 从"经验层级 2：核心要点"中提取
    const coreSection = experienceContent.match(/# 经验层级 2[^#]*?(?=#|$)/s);
    if (coreSection) {
      // 提取关键词
      const keywords = coreSection[0].match(
        /(?:问题|方案|场景)[:：]\s*([^\n]+)/g,
      );
      if (keywords) {
        keywords.forEach((kw) => {
          const topic = kw.replace(/^(?:问题|方案|场景)[:：]\s*/, "").trim();
          if (topic && topic.length > 2 && topic.length < 50) {
            topics.push(topic);
          }
        });
      }
    }

    return topics.length > 0 ? topics : ["通用技术"];
  }

  /**
   * 提取置信度
   */
  extractConfidence(experienceContent) {
    const confidenceMatch =
      experienceContent.match(/(?:置信度|可信度).*?(\d+)/);
    if (confidenceMatch) {
      return parseInt(confidenceMatch[1]) / 100;
    }

    // 默认中等置信度
    return 0.7;
  }

  /**
   * 按主题分组经验
   */
  groupExperiencesByTopic(experiences) {
    const groups = {};

    for (const exp of experiences) {
      for (const topic of exp.topics) {
        if (!groups[topic]) {
          groups[topic] = [];
        }
        groups[topic].push(exp);
      }
    }

    return groups;
  }

  /**
   * 从经验生成技能
   */
  async generateSkillFromExperiences(topic, experiences) {
    // 使用LLM生成技能
    const prompt = `
你是一个技能生成专家。请基于以下经验，生成一个新的技能。

## 主题: ${topic}
## 经验数量: ${experiences.length}

## 经验内容:
${experiences
  .map(
    (exp, i) => `
### 经验 ${i + 1}
${exp.content.substring(0, 500)}...
`,
  )
  .join("\n")}

## 技能生成要求

请生成一个agentskills.io格式的技能文件，包含：

1. **技能元数据** (YAML frontmatter)
   - name: 技能名称（简洁，用连字符）
   - description: 简短描述
   - version: 1.0.0
   - author: Stigmergy Auto-Generated
   - triggers: 触发词列表

2. **技能描述** (Markdown内容)
   ## 用途
   <什么情况下使用这个技能>

   ## 能力
   <这个技能提供什么能力>

   ## 使用方法
   <如何应用>

   ## 示例
   <具体使用示例>

3. **核心知识**
   ## 关键概念
   <从经验中提取的关键概念>

   ## 最佳实践
   <从经验中总结的最佳实践>

   ## 常见模式
   <从经验中识别的常见模式>

请严格按照上述格式输出技能内容。
`;

    // 选择合适的CLI生成技能
    const skillContent = await this.callCLIForAnalysis("claude", prompt);

    if (!skillContent || skillContent.length < 100) {
      throw new Error("技能生成失败：内容太短");
    }

    // 解析技能内容
    const skill = this.parseGeneratedSkill(topic, skillContent);

    return skill;
  }

  /**
   * 解析生成的技能内容
   */
  parseGeneratedSkill(topic, content) {
    // 提取YAML frontmatter
    const yamlMatch = content.match(/^---\n([\s\S]+?)\n---/);
    let metadata = {};
    if (yamlMatch) {
      try {
        // 简单解析（实际应该用yaml解析库）
        metadata.name =
          this.extractYAMLField(yamlMatch[1], "name") ||
          topic.toLowerCase().replace(/\s+/g, "-");
        metadata.description =
          this.extractYAMLField(yamlMatch[1], "description") || `${topic}技能`;
        metadata.version =
          this.extractYAMLField(yamlMatch[1], "version") || "1.0.0";
      } catch (e) {
        // 使用默认值
        metadata = {
          name: topic.toLowerCase().replace(/\s+/g, "-"),
          description: `${topic}技能`,
          version: "1.0.0",
        };
      }
    }

    return {
      metadata,
      content: content.replace(/^---[\s\S]+?---\n/, ""),
      name: metadata.name || topic.toLowerCase().replace(/\s+/g, "-"),
      topic: topic,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * 从YAML中提取字段
   */
  extractYAMLField(yamlContent, fieldName) {
    const match = yamlContent.match(new RegExp(`${fieldName}\\s*:\\s*(.+)`));
    return match ? match[1].trim() : null;
  }

  /**
   * 部署技能到skills目录
   */
  async deploySkill(skill) {
    const skillDir = path.join(this.skillsDir, skill.name);

    // 创建技能目录
    if (!fs.existsSync(skillDir)) {
      fs.mkdirSync(skillDir, { recursive: true });
    }

    // 写入技能文件
    const skillFile = path.join(skillDir, "SKILL.md");
    const fullContent = `---
name: ${skill.name}
description: ${skill.metadata.description || skill.name}
version: ${skill.metadata.version || "1.0.0"}
author: Stigmergy Auto-Generated
generatedAt: ${skill.generatedAt}
sourceExperience: ${skill.topic}
autoGenerated: true
---

${skill.content}
`;

    fs.writeFileSync(skillFile, fullContent, "utf-8");

    console.log(`   📁 技能已创建: ${skillFile}`);

    return skillFile;
  }

  /**
   * 调用CLI进行分析（复用extractor的方法）
   */
  async callCLIForAnalysis(cliName, prompt) {
    return this.extractor.callCLIForAnalysis(cliName, prompt);
  }
}

module.exports = EnhancedExperienceManager;
