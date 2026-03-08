const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
process.chdir(projectRoot);

console.log("Working directory:", projectRoot);

// Read current version
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
console.log("Current version:", pkg.version);

// Bump version
console.log("\n=== 1. NPM Version Bump ===");
try {
  const version = execSync("npm version prerelease --preid=beta", {
    encoding: "utf8",
    stdio: "inherit",
  });
  console.log("Version:", version.toString().trim());
} catch (e) {
  console.log("Error:", e.message);
}

// Git operations
console.log("\n=== 2. Git Add ===");
try {
  execSync("git add -A", { encoding: "utf8", stdio: "inherit" });
  console.log("Added");
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n=== 3. Git Commit ===");
try {
  const newPkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  execSync('git commit -m "release: v' + newPkg.version + '"', {
    encoding: "utf8",
    stdio: "inherit",
  });
  console.log("Committed");
} catch (e) {
  console.log("Nothing to commit or error:", e.message);
}

console.log("\n=== 4. Git Push ===");
try {
  execSync("git push origin main", { encoding: "utf8", stdio: "inherit" });
  console.log("Pushed");
} catch (e) {
  console.log("Push error:", e.message);
}

console.log("\n=== 5. NPM Publish ===");
try {
  execSync("npm publish --tag beta", { encoding: "utf8", stdio: "inherit" });
  console.log("Published to npm!");
} catch (e) {
  console.log("Error:", e.message);
}

console.log("\n=== Complete ===");
