/**
 * Soul Hook Integration Example - Claude CLI
 *
 * 如何在Claude CLI的Hook系统中集成Soul对齐机制
 *
 * 使用方式:
 * const soulIntegration = require('./src/core/soul_cli_integration');
 * await soulIntegration.integrateToClaudeHook(claudeHookAdapter);
 */

const { createSoulSystem } = require("./soul_system");
const DeadLetterQueue = require("./soul/DeadLetterQueue");

/**
 * 集成到Claude Hook适配器
 */
async function integrateToClaudeHook(hookAdapter) {
  console.log("[SoulIntegration] Starting integration with Claude Hook...");

  // 1. 查找Claude的skills目录
  const skillsPath = findClaudeSkillsPath();

  if (!skillsPath) {
    console.log("[SoulIntegration] Claude skills path not found");
    return null;
  }

  console.log("[SoulIntegration] Found skills path:", skillsPath);

  // 2. 创建Soul系统
  const soulSystem = await createSoulSystem({
    cliName: "claude",
    skillsPath,
    autoLearn: true,
    learningIntervalHours: 24,
  });

  if (!soulSystem) {
    console.log("[SoulIntegration] No soul.md found, skipping integration");
    return null;
  }

  console.log("[SoulIntegration] ✅ Soul system initialized");
  console.log("[SoulIntegration]    Identity:", soulSystem.identity.name);
  console.log("[SoulIntegration]    Role:", soulSystem.identity.role);

  // 3. 覆盖Hook方法以集成对齐检查
  _patchHookMethods(hookAdapter, soulSystem);

  // 4. 设置Scheduler事件监听
  _setupEventListeners(soulSystem, hookAdapter);

  return soulSystem;
}

/**
 * 查找Claude skills路径
 */
function findClaudeSkillsPath() {
  const homedir = process.env.HOME || process.env.USERPROFILE;
  const possiblePaths = [
    `${homedir}/.claude/skills`,
    `${homedir}/.agent/skills`,
    "./.agent/skills",
    "./skills",
  ];

  for (const p of possiblePaths) {
    try {
      const fs = require("fs");
      if (fs.existsSync(p)) {
        return p;
      }
    } catch (err) {
      const { PreconditionError } = require('./coordination/error_handler');
      const classified = new PreconditionError(err.message, { operation: 'checkSkillsPath', path: p });
      console.error(`[SoulCLIIntegration] PreconditionError: skills path not found: ${classified.message}`);
      const dlq = new DeadLetterQueue();
      try { dlq.push(classified, { operation: 'checkSkillsPath' }); } catch (_) {}
      throw classified;
    }
  }

  return null;
}

/**
 * 覆盖Hook方法
 */
function _patchHookMethods(hookAdapter, soulSystem) {
  // 保存原始方法
  const originalOnUserPromptSubmit =
    hookAdapter.onUserPromptSubmit?.bind(hookAdapter);
  const originalOnResponseGenerated =
    hookAdapter.onResponseGenerated?.bind(hookAdapter);
  const originalOnToolUsePost = hookAdapter.onToolUsePost?.bind(hookAdapter);

  // 1. 用户提交提示时 - 检查是否需要触发学习
  hookAdapter.onUserPromptSubmit = async function (context) {
    // 执行原始逻辑
    if (originalOnUserPromptSubmit) {
      await originalOnUserPromptSubmit(context);
    }

    // Soul对齐：检查是否与当前任务相关
    if (soulSystem.alignmentChecker) {
      const alignment = await soulSystem.checkAlignment(context.prompt || "");

      if (!alignment.aligned) {
        console.log(
          "[SoulIntegration] ⚠️ Prompt alignment warning:",
          alignment.warnings,
        );
        context.soulWarning = alignment;
      }
    }

    return context;
  };

  // 2. 响应生成后 - 对齐检查
  hookAdapter.onResponseGenerated = async function (context) {
    // 执行原始逻辑
    if (originalOnResponseGenerated) {
      await originalOnResponseGenerated(context);
    }

    // Soul对齐：检查响应
    if (soulSystem.alignmentChecker) {
      const response = context.response || "";
      const alignment = await soulSystem.checkAlignment(response);

      if (!alignment.aligned) {
        console.log(
          "[SoulIntegration] ⚠️ Response alignment warning:",
          alignment.warnings,
        );

        // 可以选择修改响应或添加警告
        context.soulWarning = alignment;
        context.responseWithWarning =
          response + "\n\n⚠️ 注意: 输出可能需要更严格地对齐人设";
      }
    }

    return context;
  };

  // 3. 工具使用后 - 记录学习
  hookAdapter.onToolUsePost = async function (context) {
    if (originalOnToolUsePost) {
      await originalOnToolUsePost(context);
    }

    // 记录工具使用，可以用于后续学习
    const toolName = context.toolName || "unknown";
    const toolInput = context.toolInput || "";

    // 可以添加到知识库
    if (soulSystem.knowledgeBase && toolInput.length > 50) {
      // 简单记录
      console.log("[SoulIntegration] 📝 Learning from tool:", toolName);
    }

    return context;
  };

  console.log("[SoulIntegration] ✅ Hook methods patched");
}

/**
 * 设置事件监听
 */
function _setupEventListeners(soulSystem, hookAdapter) {
  const scheduler = soulSystem.scheduler;

  // 进化完成事件
  scheduler.on("evolveComplete", (data) => {
    console.log("[SoulIntegration] 🎉 Evolution complete:", {
      knowledgeAdded: data.result?.knowledgeAdded?.length || 0,
      skillsCreated: data.result?.skillsCreated?.length || 0,
    });
  });

  // 对齐警告事件
  scheduler.on("alignmentWarning", (data) => {
    console.log("[SoulIntegration] ⚠️ Alignment warning:", {
      score: data.result?.overallScore,
      warnings: data.result?.warnings,
    });
  });

  // Subagent通知事件
  scheduler.on("subagentNotify", (data) => {
    console.log("[SoulIntegration] 📡 Subagent notification:", data.event);
  });

  console.log("[SoulIntegration] ✅ Event listeners set up");
}

/**
 * 启动独立Soul系统（不依赖Hook）
 */
async function startStandaloneSoulSystem(options) {
  const { skillsPath, autoLearn = true } = options;

  const soulSystem = await createSoulSystem({
    cliName: "standalone",
    skillsPath,
    autoLearn,
  });

  return soulSystem;
}

module.exports = {
  integrateToClaudeHook,
  createSoulSystem,
  startStandaloneSoulSystem,
};
