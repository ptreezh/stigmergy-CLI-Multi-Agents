const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname);
process.chdir(projectRoot);

console.log("=== 1. Git Status ===");
try {
  const status = execSync("git status --short", {
    encoding: "utf8",
    stdio: "pipe",
  });
  console.log(status || "No changes");
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n=== 2. Git Add ===");
try {
  execSync("git add -A", { encoding: "utf8", stdio: "inherit" });
  console.log("Added all files");
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n=== 3. Git Commit ===");
try {
  execSync('git commit -m "feat: 内置 Superpowers + 自动部署 + 进化机制"', {
    encoding: "utf8",
    stdio: "inherit",
  });
  console.log("Committed");
} catch (e) {
  console.log("Nothing to commit or error:", e.message);
}

console.log("\n=== 4. Git Push ===");
try {
  execSync("git push", { encoding: "utf8", stdio: "inherit" });
  console.log("Pushed");
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n=== 5. NPM Version Bump ===");
try {
  const version = execSync("npm version prerelease --preid=beta", {
    encoding: "utf8",
    stdio: "inherit",
  });
  console.log("Version:", version.toString().trim());
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n=== 6. NPM Publish ===");
try {
  execSync("npm publish --tag beta", { encoding: "utf8", stdio: "inherit" });
  console.log("Published to npm!");
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n=== Complete ===");
