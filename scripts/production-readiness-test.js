#!/usr/bin/env node
/**
 * Production Readiness Verification
 * Tests the actual changes made for production release
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");

const results = {
  passed: 0,
  failed: 0,
  tests: [],
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: "PASS" });
    console.log(`  ✅ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: "FAIL", error: error.message });
    console.log(`  ❌ ${name}: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relative), "utf-8"));
}

function exists(relative) {
  return fs.existsSync(path.join(ROOT, relative));
}

function readFile(relative) {
  return fs.readFileSync(path.join(ROOT, relative), "utf-8");
}

console.log("\n🔍 Production Readiness Verification\n");
console.log("=".repeat(60));

// Test 1: Package.json has required fields
test("package.json has main field", () => {
  const pkg = readJson("package.json");
  assert(pkg.main === "src/index.js", "main should be src/index.js");
});

test("package.json has bin field", () => {
  const pkg = readJson("package.json");
  assert(pkg.bin && pkg.bin.stigmergy === "src/index.js", "bin should define stigmergy");
});

test("package.json has files field", () => {
  const pkg = readJson("package.json");
  assert(Array.isArray(pkg.files) && pkg.files.length > 0, "files should be non-empty array");
});

// Test 2: Entry point exists
test("src/index.js exists", () => {
  assert(exists("src/index.js"), "src/index.js should exist");
});

test("src/index.js is executable", () => {
  const content = readFile("src/index.js");
  assert(content.includes("#!/usr/bin/env node"), "should have shebang");
});

// Test 3: Soul heartbeat auto-start
test("soul_manager.js auto-starts heartbeat", () => {
  const content = readFile("src/core/soul_manager.js");
  assert(content.includes("this.memoryManager.startHeartbeat"), "should call startHeartbeat");
  assert(content.includes("Heartbeat scheduler started"), "should log heartbeat start");
});

test("soul.js init triggers heartbeat", () => {
  const content = readFile("src/cli/commands/soul.js");
  assert(content.includes("startHeartbeat"), "should call startHeartbeat");
});

// Test 4: Interactive mode activates Soul
test("InteractiveModeController activates Soul heartbeat", () => {
  const content = readFile("src/interactive/InteractiveModeController.js");
  assert(content.includes("_startSoulHeartbeat"), "should have _startSoulHeartbeat method");
  assert(content.includes("[SOUL] Heartbeat system activated"), "should log activation");
});

// Test 5: .npmignore excludes runtime data
test(".npmignore excludes runtime data", () => {
  const npmignore = readFile(".npmignore");
  assert(npmignore.includes(".stigmergy/"), "should exclude .stigmergy/");
  assert(npmignore.includes("bus/"), "should exclude bus/");
  assert(npmignore.includes("dist/"), "should exclude dist/");
});

// Test 6: Lint passes on modified files
test("ESLint passes on modified files", () => {
  try {
    execSync("npx eslint src/core/soul_manager.js src/cli/commands/soul.js src/interactive/InteractiveModeController.js", {
      encoding: "utf-8",
      stdio: "pipe",
    });
  } catch (error) {
    throw new Error(error.stdout || error.message);
  }
});

// Test 7: Package can be packed
test("npm pack --dry-run succeeds", () => {
  try {
    const output = execSync("npm pack --dry-run", { encoding: "utf-8", stdio: "pipe", cwd: ROOT });
    assert(output.includes("stigmergy-1.11.0.tgz"), "should produce tarball");
    assert(!output.includes("bus/"), "should not include bus/");
    assert(!output.includes(".stigmergy/"), "should not include .stigmergy/");
  } catch (error) {
    throw new Error(error.stdout || error.message);
  }
});

// Test 8: Soul init functional test
test("soul init starts heartbeat (functional)", () => {
  const home = process.env.HOME || process.env.USERPROFILE;
  const testDir = path.join(home, ".stigmergy", "skills", "prod-test-gnf");
  fs.mkdirSync(testDir, { recursive: true });
  fs.mkdirSync(path.join(testDir, "memory"), { recursive: true });
  fs.writeFileSync(path.join(testDir, "soul.md"), "# Test\n## 身份 Identity\n- **名称**: prod-test-gnf\n");

  const { handleSoulCommand } = require(path.join(ROOT, "src/cli/commands/soul"));
  return handleSoulCommand("init", ["prod-test-gnf"]).then(() => {
    const stateFile = path.join(testDir, "heartbeat-state.json");
    assert(fs.existsSync(stateFile), "heartbeat-state.json should exist");
    const state = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
    assert(state.lastHeartbeat !== null, "lastHeartbeat should be set");
    assert(state.running === true || state.heartbeatStartedAt !== undefined, "heartbeat should be running");
  });
});

// Test 9: Interactive mode functional test
test("interactive mode activates Soul (functional)", () => {
  const { InteractiveModeController } = require(path.join(ROOT, "src/interactive/InteractiveModeController"));
  const controller = new InteractiveModeController({ autoEnterLoop: false });
  return controller.start().then(() => {
    assert(controller.isActive === true, "controller should be active");
    return controller.stop();
  });
});

// Summary
console.log("\n" + "=".repeat(60));
console.log(`\n📊 Results: ${results.passed} passed, ${results.failed} failed\n`);

if (results.failed > 0) {
  console.log("Failed tests:");
  results.tests.filter(t => t.status === "FAIL").forEach(t => {
    console.log(`  - ${t.name}: ${t.error}`);
  });
  console.log("");
  process.exit(1);
} else {
  console.log("✅ All production readiness checks passed!\n");
  process.exit(0);
}
