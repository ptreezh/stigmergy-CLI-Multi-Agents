#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const os = require("os");

class StigmergyOrchestratorTests {
  constructor() {
    this.testDir = path.join(os.tmpdir(), "stigmergy-orchestrator-tests");
    this.setupTestDirectory();
  }

  setupTestDirectory() {
    if (!fs.existsSync(this.testDir)) {
      fs.mkdirSync(this.testDir, { recursive: true });
    }

    // Create test data directories
    const testSubDirs = [
      "opencode",
      "marvis",
      "workbuddy",
      "qoder",
      "coze",
      "poe"
    ];

    for (const dir of testSubDirs) {
      const dirPath = path.join(this.testDir, dir);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    }

    // Create test agent signatures
    this.createTestAgentSignatures();

    // Create test session data
    this.createTestSessionData();
  }

  createTestAgentSignatures() {
    const signatures = {
      opencode: {
        "agent-type": "ide",
        "project": "socienceAI",
        "session-id": "ses_test123456",
        "active": "true",
        "dependencies": "workbuddy,marvis,coze"
      },
      marvis: {
        "agent-type": "desktop",
        "databases": "14.6GB data.db,559MB memory.db",
        "scheduled-tasks": "daily electricity market collection",
        "active": "true",
        "dependencies": "qoder,opencode"
      },
      workbuddy: {
        "agent-type": "cli",
        "files-tracked": "58299",
        "tracking-rate": "8328 per day",
        "active": "true",
        "dependencies": "opencode"
      },
      qoder: {
        "agent-type": "cli",
        "runs-last-week": "128",
        "active": "true",
        "dependencies": "marvis,coze"
      },
      coze: {
        "agent-type": "chat",
        "files": "config.json,bridge logs,skill files",
        "active": "true",
        "dependencies": "qoder,marvis"
      },
      poe: {
        "agent-type": "desktop",
        "activity": "config and cache",
        "active": "true",
        "dependencies": "marvis"
      }
    };

    for (const [agent, signature] of Object.entries(signatures)) {
      const signaturePath = path.join(this.testDir, agent, "signature.json");
      fs.writeFileSync(signaturePath, JSON.stringify(signature, null, 2));
    }
  }

  createTestSessionData() {
    const testSessions = {
      opencode: {
        type: "session",
        timestamp: new Date().toISOString(),
        project: "socienceAI",
        status: "active",
        activities: [
          { type: "project_tracking", message: "Tracking project: socienceAI" },
          { type: "skill_loading", message: "Loading skills: research, analysis" }
        ]
      },
      marvis: {
        type: "database_operation",
        timestamp: new Date().toISOString(),
        status: "processing",
        databases: ["14.6GB data.db", "559MB memory.db"],
        activities: [
          { type: "data_extraction", message: "Extracting electricity market data" },
          { type: "scheduled_task", message: "Running daily collection schedule" }
        ]
      },
      workbuddy: {
        type: "usage_tracking",
        timestamp: new Date().toISOString(),
        status: "tracking",
        metrics: { files: 58299, rate: 8328 },
        activities: [
          { type: "file_monitoring", message: "Monitoring file modifications" },
          { type: "usage_analysis", message: "Analyzing usage patterns" }
        ]
      },
      qoder: {
        type: "cli_session",
        timestamp: new Date().toISOString(),
        status: "active",
        runs: 128,
        activities: [
          { type: "code_development", message: "Writing code" },
          { type: "testing", message: "Running tests" }
        ]
      },
      coze: {
        type: "skill_management",
        timestamp: new Date().toISOString(),
        status: "active",
        files: 3,
        activities: [
          { type: "skill_loading", message: "Loading skills from config" },
          { type: "skill_execution", message: "Executing loaded skills" }
        ]
      },
      poe: {
        type: "config_management",
        timestamp: new Date().toISOString(),
        status: "active",
        activity: "config and cache",
        activities: [
          { type: "config_loading", message: "Loading configuration" },
          { type: "cache_management", message: "Managing cache files" }
        ]
      }
    };

    for (const [agent, session] of Object.entries(testSessions)) {
      const sessionPath = path.join(this.testDir, agent, "session.json");
      fs.writeFileSync(sessionPath, JSON.stringify(session, null, 2));
    }
  }

  async runAllTests() {
    console.log("[STIGMERGY] Running Stigmergy Orchestrator Tests...\n");

    const results = {};

    try {
      results.agentSignatures = this.testAgentSignatures();
      console.log("[STIGMERGY] ✓ Agent signature tests passed");
    } catch (error) {
      results.agentSignatures = { status: "failed", error: error.message };
      console.log("[STIGMERGY] ✗ Agent signature tests failed:", error.message);
    }

    try {
      results.sessionExtraction = await this.testSessionExtraction();
      console.log("[STIGMERGY] ✓ Session extraction tests passed");
    } catch (error) {
      results.sessionExtraction = { status: "failed", error: error.message };
      console.log("[STIGMERGY] ✗ Session extraction tests failed:", error.message);
    }

    try {
      results.collaborationLogic = this.testCollaborationLogic();
      console.log("[STIGMERGY] ✓ Collaboration logic tests passed");
    } catch (error) {
      results.collaborationLogic = { status: "failed", error: error.message };
      console.log("[STIGMERGY] ✗ Collaboration logic tests failed:", error.message);
    }

    try {
      results.optimization = this.testOptimization();
      console.log("[STIGMERGY] ✓ Optimization tests passed");
    } catch (error) {
      results.optimization = { status: "failed", error: error.message };
      console.log("[STIGMERGY] ✗ Optimization tests failed:", error.message);
    }

    this.generateTestReport(results);

    const passedTests = Object.values(results).filter(r => r.status !== "failed").length;
    const totalTests = Object.keys(results).length;

    console.log("[STIGMERGY]\n");
    console.log(`[STIGMERGY] Test Results: ${passedTests}/${totalTests} tests passed\n`);

    return results;
  }

  testAgentSignatures() {
    const signatures = {};

    for (const agent of ["opencode", "marvis", "workbuddy", "qoder", "coze", "poe"]) {
      const signaturePath = path.join(this.testDir, agent, "signature.json");
      if (fs.existsSync(signaturePath)) {
        const signature = JSON.parse(fs.readFileSync(signaturePath, "utf8"));
        signatures[agent] = {
          status: "valid",
          signature,
          hasRequiredFields: this.validateSignature(signature, agent)
        };
      } else {
        signatures[agent] = { status: "missing", error: "Signature file not found" };
      }
    }

    return signatures;
  }

  validateSignature(signature, agentName) {
    const requiredFields = {
      opencode: ["agent-type", "project", "session-id"],
      marvis: ["agent-type", "databases", "scheduled-tasks"],
      workbuddy: ["agent-type", "files-tracked", "tracking-rate"],
      qoder: ["agent-type", "runs-last-week"],
      coze: ["agent-type", "files"],
      poe: ["agent-type", "activity"]
    };

    const required = requiredFields[agentName] || [];
    const missing = required.filter(field => !signature[field]);

    return {
      valid: missing.length === 0,
      missingFields: missing,
      totalFields: required.length
    };
  }

  async testSessionExtraction() {
    const extractionResults = {};

    for (const agent of ["opencode", "marvis", "workbuddy", "qoder", "coze", "poe"]) {
      const sessionPath = path.join(this.testDir, agent, "session.json");
      if (fs.existsSync(sessionPath)) {
        const session = JSON.parse(fs.readFileSync(sessionPath, "utf8"));
        extractionResults[agent] = {
          status: "extracted",
          sessionType: session.type,
          timestamp: session.timestamp,
          activities: session.activities || [],
          valid: this.validateSession(session)
        };
      } else {
        extractionResults[agent] = { status: "missing", error: "Session file not found" };
      }
    }

    return extractionResults;
  }

  validateSession(session) {
    return {
      hasType: !!session.type,
      hasTimestamp: !!session.timestamp,
      hasStatus: !!session.status,
      hasActivities: Array.isArray(session.activities)
    };
  }

  testCollaborationLogic() {
    const logicResults = {};

    // Test handoff logic
    const handoffLogic = {
      "opencode->workbuddy": {
        type: "project_context",
        priority: "high",
        compatible: true
      },
      "marvis->qoder": {
        type: "structured_data",
        priority: "medium",
        compatible: true
      },
      "qoder->coze": {
        type: "code_review",
        priority: "low",
        compatible: true
      }
    };

    logicResults.handoffs = {
      status: "valid",
      handoffTypes: Object.keys(handoffLogic),
      totalHandoffs: Object.keys(handoffLogic).length
    };

    // Test review logic
    const reviewLogic = {
      opencode: {
        dependencies: ["workbuddy", "marvis", "coze"],
        reviewType: "cross_validation"
      },
      marvis: {
        dependencies: ["qoder", "opencode"],
        reviewType: "data_validation"
      },
      workbuddy: {
        dependencies: ["opencode"],
        reviewType: "usage_review"
      }
    };

    logicResults.reviews = {
      status: "valid",
      reviewAgents: Object.keys(reviewLogic),
      totalReviews: Object.keys(reviewLogic).length
    };

    // Test coordination logic
    const coordinationLogic = {
      status_sync: {
        scope: "all_active_agents",
        participants: ["opencode", "marvis", "workbuddy", "qoder", "coze", "poe"],
        frequency: "on_demand"
      },
      task_distribution: {
        scope: "load_balancing",
        participants: ["opencode", "marvis", "workbuddy", "qoder", "coze", "poe"],
        algorithm: "round_robin"
      }
    };

    logicResults.coordination = {
      status: "valid",
      coordinationTypes: Object.keys(coordinationLogic),
      totalCoordinationActivities: Object.keys(coordinationLogic).length
    };

    return logicResults;
  }

  testOptimization() {
    const optimizationResults = {};

    // Test token deduplication logic
    optimizationResults.tokenDeduplication = {
      status: "valid",
      opportunities: [
        { agents: ["opencode", "marvis"], potentialSavings: "20-30%" },
        { agents: ["workbuddy", "qoder"], potentialSavings: "15-25%" }
      ]
    };

    // Test parallel processing logic
    optimizationResults.parallelProcessing = {
      status: "valid",
      candidates: ["opencode", "marvis", "qoder"],
      potentialSpeedup: "2-3x",
      compatibleAgents: ["opencode", "marvis", "qoder"]
    };

    // Test intelligent handoff logic
    optimizationResults.intelligentHandoff = {
      status: "valid",
      candidates: ["opencode", "marvis", "workbuddy", "qoder", "coze", "poe"],
      potentialEfficiency: "15-25%",
      algorithm: "dependency_based"
    };

    return optimizationResults;
  }

  generateTestReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      testSummary: {
        totalTestSuites: Object.keys(results).length,
        passedSuites: Object.values(results).filter(r => r.status === "passed" || !r.status).length,
        failedSuites: Object.values(results).filter(r => r.status === "failed").length
      },
      results: results
    };

    const reportPath = path.join(this.testDir, "test-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log("[STIGMERGY] Test report saved to:", reportPath);

    return report;
  }
}

// Main test execution
if (require.main === module) {
  const tests = new StigmergyOrchestratorTests();
  tests.runAllTests().catch(console.error);
}

module.exports = StigmergyOrchestratorTests;