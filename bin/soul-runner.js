#!/usr/bin/env node
/**
 * Soul Command Standalone Runner
 *
 * 直接运行此脚本测试Soul系统
 * 用法: node bin/soul-runner.js [action] [args...]
 */

const path = require("path");

// Change to project directory
process.chdir(path.join(__dirname, ".."));

// Add src to path
const srcPath = path.join(__dirname, "..", "src");
if (!module.paths.includes(srcPath)) {
  module.paths.unshift(srcPath);
}

const SoulCommand = require("../src/cli/commands/soul");
const soulCommand = new SoulCommand();

// Run command
const args = process.argv.slice(2);
soulCommand.execute(args).catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
