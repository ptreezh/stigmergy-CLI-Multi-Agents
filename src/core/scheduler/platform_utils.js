/**
 * PlatformUtils - 跨平台工具
 */

const os = require("os");

function getPlatform() {
  const platform = os.platform();
  return {
    os: platform,
    isWindows: platform === "win32",
    isLinux: platform === "linux",
    isMacOS: platform === "darwin",
    isWSL: detectWSL(),
  };
}

function detectWSL() {
  if (os.platform() !== "linux") return false;
  try {
    return (
      fs.existsSync("/proc/sys/kernel/osrelease") &&
      fs
        .readFileSync("/proc/sys/kernel/osrelease", "utf8")
        .toLowerCase()
        .includes("wsl")
    );
  } catch {
    return false;
  }
}

function detectLinuxDistro() {
  if (os.platform() !== "linux") return null;
  try {
    if (fs.existsSync("/etc/os-release")) {
      const content = fs.readFileSync("/etc/os-release", "utf8");
      const match = content.match(/^ID="?([^"\n]+)"?/m);
      return match ? match[1] : "linux";
    }
  } catch {}
  return "linux";
}

const fs = require("fs");

module.exports = {
  getPlatform,
  detectWSL,
  detectLinuxDistro,
};
