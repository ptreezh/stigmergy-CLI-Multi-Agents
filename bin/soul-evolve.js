#!/usr/bin/env node
/**
 * Soul Evolve CLI Script
 *
 * 被定时任务调用，执行技能进化
 *
 * 用法: node soul-evolve.js [cli-name]
 */

const path = require("path");

async function main() {
  const cliName = process.argv[2] || "auto";

  console.log(`⚡ Running Soul evolution for: ${cliName}\n`);

  try {
    // 动态加载Soul系统
    let SoulAdapter;

    if (cliName === "claude" || cliName === "auto") {
      try {
        const {
          ClaudeSoulAdapter,
        } = require("../packages/core/src/integrations/claude_soul");
        SoulAdapter = ClaudeSoulAdapter;
      } catch (e) {
        const { ClaudeSoulAdapter } = require("./integrations/claude_soul");
        SoulAdapter = ClaudeSoulAdapter;
      }
    } else if (cliName === "qwen") {
      try {
        const {
          QwenSoulAdapter,
        } = require("../packages/core/src/integrations/qwen_soul");
        SoulAdapter = QwenSoulAdapter;
      } catch (e) {
        const { QwenSoulAdapter } = require("./integrations/qwen_soul");
        SoulAdapter = QwenSoulAdapter;
      }
    } else if (cliName === "opencode") {
      try {
        const {
          OpenCodeSoulAdapter,
        } = require("../packages/core/src/integrations/opencode_soul");
        SoulAdapter = OpenCodeSoulAdapter;
      } catch (e) {
        const { OpenCodeSoulAdapter } = require("./integrations/opencode_soul");
        SoulAdapter = OpenCodeSoulAdapter;
      }
    } else {
      console.error(`Unknown CLI: ${cliName}`);
      process.exit(1);
    }

    // 创建适配器
    const adapter = new SoulAdapter();

    // 初始化
    await adapter.initialize();

    if (!adapter.isInitialized) {
      console.log(`⚠️ No soul.md found for ${cliName}`);
      process.exit(0);
    }

    // 触发进化
    const result = await adapter.evolve();

    console.log("\n✅ Evolution complete:");
    console.log(`   CLI: ${cliName}`);
    console.log(`   Identity: ${adapter.soulSystem.identity.name}`);
    console.log(`   Knowledge added: ${result?.knowledgeAdded?.length || 0}`);
    console.log(`   Skills created: ${result?.skillsCreated?.length || 0}`);
    console.log(`   Skills updated: ${result?.skillsUpdated?.length || 0}`);

    if (result?.errors?.length) {
      console.log("\n⚠️ Errors:");
      result.errors.forEach((e) => console.log(`   - ${e}`));
    }

    process.exit(0);
  } catch (e) {
    console.error("❌ Evolution failed:", e.message);
    process.exit(1);
  }
}

main();
