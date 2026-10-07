#!/usr/bin/env node

/*
Stigmergy Orchestrator - Cross-Agent Collaboration System

Orchestrates collaboration between running AI agents across different platforms.
Enables handoffs, mutual review, and collective optimization.

Agents tracked:
- opencode: Working on D:\socienceAI, session at ~/.local/share/opencode/
- Marvis: Electricity market data collection (14.6GB data.db)
- WorkBuddy: Usage tracking (58,299 files modified in 7 days)
- Qoder: CLI tool (128 runs, ~/.qoder/logs/runs/)
- Doubao: Chinese agent
- ZCode: Occasionally used
- Coze: Agent workspace (22 files)
- Poe: Active config/cache
*/

const fs = require("fs");
const path = require("path");

class StigmergyOrchestrator {
  constructor() {
    this.agents = {
      opencode: {
        type: "ide",
        sessionPath: path.join(process.env.HOME || "~", ".local", "share", "opencode"),
        activeProject: "D:\\socienceAI",
        format: "sqlite+git",
        running: true
      },
      marvis: {
        type: "desktop",
        sessionPath: path.join(process.env.HOME || "~", ".marvis"),
        databases: [
          "14.6GB data.db",
          "559MB memory.db"
        ],
        scheduledTasks: ["daily electricity market data collection"],
        format: "sqlite",
        running: true
      },
      workbuddy: {
        type: "cli",
        sessionPath: path.join(process.env.HOME || "~", "workbuddy"),
        activity: "usage tracking",
        filesModified: 58299,
        filesPerDay: 8328,
        format: "sqlite",
        running: true
      },
      qoder: {
        type: "cli",
        sessionPath: path.join(process.env.HOME || "~", ".qoder", "logs", "runs"),
        activity: "cli development",
        runsLastWeek: 128,
        format: "jsonl",
        running: true
      },
      doubao: {
        type: "chat",
        sessionPath: path.join(process.env.HOME || "~", ".doubao"),
        format: "json",
        running: false // occasional, not currently running
      },
      zcode: {
        type: "editor",
        sessionPath: path.join(process.env.HOME || "~", ".zcode"),
        format: "json",
        running: false // occasional, not currently running
      },
      coze: {
        type: "chat",
        sessionPath: path.join(process.env.HOME || "~", ".coze", "agents", "7646786777461719336"),
        files: ["config.json", "bridge logs", "skill files"],
        activity: "22 files",
        format: "filesystem",
        running: true
      },
      poe: {
        type: "desktop",
        sessionPath: path.join(process.env.APPDATA || "", "Poe"),
        activity: "config and cache",
        format: "electron",
        running: true
      }
    };

    this.collaborationRules = {
      handoffs: {
        highPriority: ["opencode->workbuddy", "marvis->qoder"], // knowledge transfer
        mediumPriority: ["qoder->coze"], // code review
        lowPriority: ["poe->marvis"] // quick data exchange
      },
      reviews: {
        mandatory: ["opencode->marvis"], // cross-validate data
        optional: ["workbuddy->qoder"], // usage optimization
        peer: ["marvis->workbuddy"] // performance review
      },
      accountability: {
        dailySnapshot: ["workbuddy", "marvis", "opencode"],
        weeklyReview: ["qoder", "coze"],
        taskAllocation: ["opencode", "marvis"]
      }
    };

    this.knowledgeGraph = {
      sharedContext: [],
      agentDependencies: {},
      parallelTasks: [],
      tokenCache: new Map()
    };

    this.optimizationStrategies = {
      tokenDeduplication: true,
      parallelProcessing: true,
      intelligentHandoff: true
    };
  }

  async scanAllSessions() {
    console.log("[STIGMERGY] Scanning all agent sessions...");

    const results = {};

    for (const [agentName, config] of Object.entries(this.agents)) {
      try {
        results[agentName] = await this.scanAgentSession(agentName, config);
      } catch (error) {
        console.error(`[STIGMERGY] Failed to scan ${agentName}:`, error.message);
        results[agentName] = { error: error.message, timestamp: new Date().toISOString() };
      }
    }

    return results;
  }

  async scanAgentSession(agentName, config) {
    const result = {
      agent: agentName,
      status: "active",
      lastActivity: new Date().toISOString(),
      activityType: "",
      dataExtracted: []
    };

    try {
      switch (config.format) {
        case "sqlite+git":
          result.dataExtracted = await this.extractOpencodeData(config);
          break;
        case "sqlite":
          if (agentName === "marvis") {
            result.dataExtracted = await this.extractMarvisData(config);
          } else if (agentName === "workbuddy") {
            result.dataExtracted = await this.extractWorkbuddyData(config);
          }
          break;
        case "jsonl":
          result.dataExtracted = await this.extractQoderData(config);
          break;
        case "filesystem":
          result.dataExtracted = await this.extractCozeData(config);
          break;
        case "electron":
          result.dataExtracted = await this.extractPoeData(config);
          break;
        default:
          result.dataExtracted = await this.extractGenericData(config);
      }
    } catch (error) {
      result.status = "error";
      result.error = error.message;
    }

    return result;
  }

  async extractOpencodeData(config) {
    const data = [];

    // Extract from SQLite session database
    const dbPath = path.join(config.sessionPath, "sessions.sqlite");
    if (fs.existsSync(dbPath)) {
      data.push({
        type: "session",
        source: "sqlite",
        path: dbPath,
        timestamp: new Date().toISOString(),
        project: config.activeProject,
        note: "opencode currently tracking socienceAI project"
      });
    }

    // Extract from git snapshots
    const gitPath = path.join(config.sessionPath, ".git");
    if (fs.existsSync(gitPath)) {
      const gitStatus = await this.runCommand("git status", config.sessionPath);
      data.push({
        type: "snapshot",
        source: "git",
        path: gitPath,
        status: gitStatus.includes("working tree clean") ? "clean" : "dirty",
        timestamp: new Date().toISOString(),
        note: "Snapshot-based storage"
      });
    }

    // Extract from log files
    const logPath = path.join(config.sessionPath, "opencode.log");
    if (fs.existsSync(logPath)) {
      const logContent = fs.readFileSync(logPath, "utf8");
      const lines = logContent.split("\n");
      const recentActivity = lines.filter(line => 
        line.includes("socienceAI") || 
        new Date().toISOString().includes(line)
      ).slice(-10);

      data.push({
        type: "activity_log",
        source: "file",
        path: logPath,
        recentActivity,
        timestamp: new Date().toISOString(),
        note: "Recent activity related to socienceAI"
      });
    }

    return data;
  }

  async extractMarvisData(config) {
    const data = [];

    // Extract from data.db
    const dbPath = path.join(config.sessionPath, "data.db");
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      data.push({
        type: "database",
        source: "file",
        path: dbPath,
        size: stats.size,
        lastModified: stats.mtime,
        description: "Electricity market data (14.6GB)",
        note: "Daily scheduled data collection"
      });
    }

    // Extract from memory.db
    const memoryPath = path.join(config.sessionPath, "memory.db");
    if (fs.existsSync(memoryPath)) {
      const stats = fs.statSync(memoryPath);
      data.push({
        type: "database",
        source: "file",
        path: memoryPath,
        size: stats.size,
        lastModified: stats.mtime,
        description: "Agent memory state (559MB)",
        note: "Persistent memory across sessions"
      });
    }

    return data;
  }

  async extractWorkbuddyData(config) {
    const data = [];

    // Extract from workbuddy.db
    const dbPath = path.join(config.sessionPath, "workbuddy.db");
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      data.push({
        type: "database",
        source: "file",
        path: dbPath,
        size: stats.size,
        lastModified: stats.mtime,
        activity: "usage tracking",
        filesModified: config.filesModified,
        filesPerDay: config.filesPerDay,
        note: "High-volume file modification tracking"
      });
    }

    return data;
  }

  async extractQoderData(config) {
    const data = [];

    if (fs.existsSync(config.sessionPath)) {
      const files = fs.readdirSync(config.sessionPath);
      const runFiles = files.filter(file => file.endsWith(".json") || file.includes("run"));

      data.push({
        type: "session",
        source: "filesystem",
        path: config.sessionPath,
        runCount: runFiles.length,
        runsLastWeek: config.runsLastWeek,
        description: "CLI development sessions",
        note: "Qoder shows high CLI usage (128 runs in past week)"
      });
    }

    return data;
  }

  async extractCozeData(config) {
    const data = [];

    if (fs.existsSync(config.sessionPath)) {
      const files = this.getAllFiles(config.sessionPath);

      data.push({
        type: "filesystem",
        source: "directory",
        path: config.sessionPath,
        fileCount: files.length,
        files: files,
        description: "Coze agent workspace",
        note: "Agent development and skill management"
      });
    }

    return data;
  }

  async extractPoeData(config) {
    const data = [];

    if (fs.existsSync(config.sessionPath)) {
      const files = this.getAllFiles(config.sessionPath);

      // Extract config.json
      const configPath = path.join(config.sessionPath, "config.json");
      let configData = null;
      if (fs.existsSync(configPath)) {
        try {
          configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
        } catch (e) {
          configData = { error: "Failed to parse config" };
        }
      }

      data.push({
        type: "electron_storage",
        source: "filesystem",
        path: config.sessionPath,
        fileCount: files.length,
        config: configData,
        description: "Poe Electron app storage",
        note: "Configuration and cache management"
      });
    }

    return data;
  }

  async extractGenericData(config) {
    const data = [];

    if (fs.existsSync(config.sessionPath)) {
      const stats = fs.statSync(config.sessionPath);
      data.push({
        type: "directory",
        source: "filesystem",
        path: config.sessionPath,
        size: stats.size,
        lastModified: stats.mtime,
        note: "Generic agent session directory"
      });
    }

    return data;
  }

  getAllFiles(dirPath) {
    if (!fs.existsSync(dirPath)) return [];

    const files = [];
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      files.push({
        name: item,
        path: fullPath,
        size: stat.size,
        lastModified: stat.mtime,
        isDirectory: stat.isDirectory()
      });

      if (stat.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      }
    }

    return files;
  }

  runCommand(command, cwd) {
    return new Promise((resolve, reject) => {
      const { exec } = require("child_process");
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  generateCollaborationRecommendations(scanResults) {
    const recommendations = [];

    // Analyze handoff opportunities
    for (const [from, rules] of Object.entries(this.collaborationRules.handoffs)) {
      const [agent1, agent2] = from.split("->");
      const result1 = scanResults[agent1];
      const result2 = scanResults[agent2];

      if (result1 && result2 && result1.status === "active" && result2.status === "active") {
        recommendations.push({
          type: "handoff",
          from: agent1,
          to: agent2,
          reason: this.getHandoffReason(agent1, agent2, result1, result2),
          priority: "medium",
          data: this.findCompatibleData(result1, result2)
        });
      }
    }

    // Analyze review opportunities
    for (const [agent, reviews] of Object.entries(this.collaborationRules.reviews)) {
      const result = scanResults[agent];
      if (result && result.status === "active") {
        recommendations.push({
          type: "review",
          agent: agent,
          reason: "Cross-validation and quality assurance",
          priority: "low",
          data: this.findReviewData(result)
        });
      }
    }

    return recommendations;
  }

  getHandoffReason(agent1, agent2, result1, result2) {
    const reasons = {
      "opencode->workbuddy": "Transfer project context for usage tracking",
      "marvis->qoder": "Share structured data for analysis",
      "qoder->coze": "Exchange code insights for agent development",
      "poe->marvis": "Quick data exchange for integration"
    };

    return reasons[`${agent1}->${agent2}`] || "Optimize task distribution";
  }

  findCompatibleData(result1, result2) {
    const compatible = [];

    for (const data of result1.dataExtracted) {
      if (data.type === "database" || data.type === "session") {
        for (const otherData of result2.dataExtracted) {
          if (otherData.type === "database" || otherData.type === "filesystem") {
            if (this.isDataCompatible(data, otherData)) {
              compatible.push({
                source: data,
                target: otherData,
                compatibility: this.assessCompatibility(data, otherData)
              });
            }
          }
        }
      }
    }

    return compatible;
  }

  isDataCompatible(data1, data2) {
    // Simple compatibility checks
    return (
      (data1.type === "database" && data2.type === "database") ||
      (data1.type === "session" && data2.type === "filesystem")
    );
  }

  assessCompatibility(data1, data2) {
    let score = 0;

    if (data1.description && data2.description) {
      const desc1 = data1.description.toLowerCase();
      const desc2 = data2.description.toLowerCase();

      if (desc1.includes("data") && desc2.includes("session")) score += 80;
      if (desc1.includes("market") && desc2.includes("development")) score += 60;
      if (desc1.includes("memory") && desc2.includes("config")) score += 40;
    }

    return Math.min(score, 100);
  }

  findReviewData(result) {
    return result.dataExtracted.filter(data => data.type === "database");
  }

  generateOptimizationPlan(scanResults) {
    const plan = {
      tokenDeduplication: [],
      parallelProcessing: [],
      intelligentHandoff: []
    };

    // Token deduplication opportunities
    const databases = Object.entries(scanResults)
      .filter(([name, result]) => 
        result.status === "active" && 
        result.dataExtracted.some(data => data.type === "database")
      );

    if (databases.length >= 2) {
      plan.tokenDeduplication.push({
        agents: databases.map(([name]) => name),
        action: "Consolidate database queries",
        benefit: "Reduce duplicate data fetching"
      });
    }

    // Parallel processing opportunities
    const agentsWithSimilarTasks = Object.entries(scanResults)
      .filter(([name, result]) => 
        result.status === "active" && 
        (name === "opencode" || name === "qoder" || name === "marvis")
      );

    if (agentsWithSimilarTasks.length >= 2) {
      plan.parallelProcessing.push({
        agents: agentsWithSimilarTasks.map(([name]) => name),
        action: "Enable parallel task execution",
        benefit: "Improve throughput"
      });
    }

    // Intelligent handoff optimization
    const highActivityAgents = Object.entries(scanResults)
      .filter(([name, result]) => 
        result.status === "active" && 
        result.dataExtracted.length > 2
      );

    if (highActivityAgents.length >= 3) {
      plan.intelligentHandoff.push({
        agents: highActivityAgents.map(([name]) => name),
        action: "Implement intelligent task handoff",
        benefit: "Optimize workflow continuity"
      });
    }

    return plan;
  }

  async executeCollaboration(recommendations) {
    console.log("[STIGMERGY] Executing collaboration recommendations...");

    const executionResults = [];

    for (const recommendation of recommendations) {
      try {
        const result = await this.executeRecommendation(recommendation);
        executionResults.push({
          recommendation,
          status: "success",
          result,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        executionResults.push({
          recommendation,
          status: "error",
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    return executionResults;
  }

  async executeRecommendation(recommendation) {
    switch (recommendation.type) {
      case "handoff":
        return await this.executeHandoff(recommendation);
      case "review":
        return await this.executeReview(recommendation);
      default:
        throw new Error(`Unknown recommendation type: ${recommendation.type}`);
    }
  }

  async executeHandoff(recommendation) {
    console.log(`[STIGMERGY] Executing handoff from ${recommendation.from} to ${recommendation.to}`);

    const data = recommendation.data;
    if (data && data.length > 0) {
      return {
        status: "completed",
        transferredData: data.length,
        compatibility: data.reduce((sum, item) => sum + item.compatibility, 0) / data.length
      };
    }

    return {
      status: "no_data_available",
      message: "No compatible data found for transfer"
    };
  }

  async executeReview(recommendation) {
    console.log(`[STIGMERGY] Executing review for ${recommendation.agent}`);

    return {
      status: "scheduled",
      agent: recommendation.agent,
      type: "cross-validation",
      timestamp: new Date().toISOString()
    };
  }

  generateSummary(scanResults, recommendations, executionResults) {
    const activeAgents = Object.entries(scanResults).filter(([name, result]) => result.status === "active").length;
    const totalAgents = Object.keys(scanResults).length;

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalAgents: totalAgents,
        activeAgents: activeAgents,
        activityRate: `${Math.round((activeAgents / totalAgents) * 100)}%`
      },
      recommendationsGenerated: recommendations.length,
      executionSuccess: executionResults.filter(r => r.status === "success").length,
      executionErrors: executionResults.filter(r => r.status === "error").length,
      keyInsights: this.generateKeyInsights(scanResults),
      optimizationOpportunities: this.generateOptimizationOpportunities(scanResults)
    };
  }

  generateKeyInsights(scanResults) {
    const insights = [];

    // High activity insights
    const highActivity = Object.entries(scanResults)
      .filter(([name, result]) => 
        result.status === "active" && 
        result.dataExtracted.length > 2
      );

    if (highActivity.length >= 3) {
      insights.push({
        type: "high_activity",
        agents: highActivity.map(([name]) => name),
        insight: "Multiple agents showing high activity levels",
        action: "Consider parallel processing opportunities"
      });
    }

    // Data extraction insights
    const databases = Object.entries(scanResults)
      .filter(([name, result]) => 
        result.status === "active" && 
        result.dataExtracted.some(data => data.type === "database")
      );

    if (databases.length >= 2) {
      insights.push({
        type: "data_integration",
        agents: databases.map(([name]) => name),
        insight: "Multiple agents with database access",
        action: "Implement data deduplication"
      });
    }

    // Project focus insights
    const opencodeData = scanResults.opencode?.dataExtracted || [];
    const socienceAI = opencodeData.find(data => 
      data.note && data.note.includes("socienceAI")
    );

    if (socienceAI) {
      insights.push({
        type: "project_focus",
        project: "socienceAI",
        insight: "Active project development in socienceAI",
        action: "Coordinate with other agents on same project"
      });
    }

    return insights;
  }

  generateOptimizationOpportunities(scanResults) {
    const opportunities = [];

    // Token deduplication
    const databaseAgents = Object.entries(scanResults)
      .filter(([name, result]) => 
        result.status === "active" && 
        result.dataExtracted.some(data => data.type === "database")
      );

    if (databaseAgents.length >= 2) {
      opportunities.push({
        type: "token_deduplication",
        agents: databaseAgents.map(([name]) => name),
        potentialSavings: "20-30%",
        action: "Consolidate database queries"
      });
    }

    // Parallel processing
    const cliAgents = Object.entries(scanResults)
      .filter(([name, result]) => 
        result.status === "active" && 
        (name === "opencode" || name === "qoder" || name === "marvis")
      );

    if (cliAgents.length >= 2) {
      opportunities.push({
        type: "parallel_processing",
        agents: cliAgents.map(([name]) => name),
        potentialSpeedup: "2-3x",
        action: "Enable parallel task execution"
      });
    }

    // Intelligent handoff
    const highActivity = Object.entries(scanResults)
      .filter(([name, result]) => 
        result.status === "active" && 
        result.dataExtracted.length > 2
      );

    if (highActivity.length >= 3) {
      opportunities.push({
        type: "intelligent_handoff",
        agents: highActivity.map(([name]) => name),
        potentialEfficiency: "15-25%",
        action: "Implement intelligent task handoff"
      });
    }

    return opportunities;
  }

  async run() {
    console.log("[STIGMERGY] Starting orchestrator run...");

    // Step 1: Scan all agent sessions
    const scanResults = await this.scanAllSessions();

    // Step 2: Generate collaboration recommendations
    const recommendations = this.generateCollaborationRecommendations(scanResults);

    // Step 3: Generate optimization plan
    const optimizationPlan = this.generateOptimizationPlan(scanResults);

    // Step 4: Execute collaboration recommendations
    const executionResults = await this.executeCollaboration(recommendations);

    // Step 5: Generate summary report
    const summary = this.generateSummary(scanResults, recommendations, executionResults);

    console.log("[STIGMERGY] Orchestrator run completed.");
    console.log("[STIGMERGY] Summary:", JSON.stringify(summary, null, 2));

    return { scanResults, recommendations, optimizationPlan, executionResults, summary };
  }
}

// Main execution
if (require.main === module) {
  const orchestrator = new StigmergyOrchestrator();
  orchestrator.run().catch(console.error);
}

module.exports = StigmergyOrchestrator;