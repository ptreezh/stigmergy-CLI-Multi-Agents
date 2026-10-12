const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname);
process.chdir(projectRoot);

console.log("=== Step 1: Git Status ===");
try {
  const status = execSync("git status --short", {
    encoding: "utf8",
    stdio: "pipe",
  });
  console.log(status || "No changes");
} catch (e) {
  console.log("Git status error:", e.message);
}

console.log("\n=== Step 2: Git Add All ===");
try {
  execSync("git add -A", { encoding: "utf8", stdio: "inherit" });
  console.log("Added all files");
} catch (e) {
  console.log("Git add error:", e.message);
}

console.log("\n=== Step 3: Git Commit ===");
try {
  const date = new Date().toISOString().split("T")[0];
  execSync('git commit -m "feat: 内置 Superpowers + 自动部署 + 进化机制"', {
    encoding: "utf8",
    stdio: "inherit",
  });
  console.log("Committed");
} catch (e) {
  console.log("Git commit error (may be nothing to commit):", e.message);
}

console.log("\n=== Step 4: Git Push ===");
try {
  execSync("git push", { encoding: "utf8", stdio: "inherit" });
  console.log("Pushed");
} catch (e) {
  console.log("Git push error:", e.message);
}

console.log("\n=== Step 5: NPM Version Bump ===");
try {
  execSync("npm version prerelease --preid=beta", {
    encoding: "utf8",
    stdio: "inherit",
  });
  console.log("Version bumped");
} catch (e) {
  console.log("NPM version error:", e.message);
}

console.log("\n=== Step 6: NPM Publish Beta ===");
try {
  execSync("npm publish --tag beta", { encoding: "utf8", stdio: "inherit" });
  console.log("Published to npm");
} catch (e) {
  console.log("NPM publish error:", e.message);
}

console.log("\n=== Done ===");
