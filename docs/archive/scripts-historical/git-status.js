const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname);
console.log("Project root:", projectRoot);

// Check git status
try {
  const status = execSync("git status --short", {
    encoding: "utf8",
    cwd: projectRoot,
  });
  console.log("=== Git Status ===");
  console.log(status || "No changes");
} catch (e) {
  console.log("Git status error:", e.message);
}

// Check git log
try {
  const log = execSync("git log --oneline -5", {
    encoding: "utf8",
    cwd: projectRoot,
  });
  console.log("\n=== Recent Commits ===");
  console.log(log);
} catch (e) {
  console.log("Git log error:", e.message);
}

// Get current branch
try {
  const branch = execSync("git branch --show-current", {
    encoding: "utf8",
    cwd: projectRoot,
  }).trim();
  console.log("\n=== Current Branch ===");
  console.log(branch);
} catch (e) {
  console.log("Git branch error:", e.message);
}

console.log("\n=== Done ===");
