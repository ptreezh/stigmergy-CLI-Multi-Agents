const { spawn } = require("child_process");

async function executeCommand(command, args = [], options = {}) {
  const opts = {
    stdio: "inherit",
    shell: true,
    ...options,
  };

  const timeoutValue = options.timeout || 300000;

  return new Promise((resolve, reject) => {
    if (process.env.DEBUG === "true") {
      console.log(`[EXEC] Running: ${command} ${args.join(" ")}`);
    }

    try {
      if (!command || typeof command !== "string") {
        reject({
          error: new Error("Invalid command: command must be a non-empty string"),
          message: "Invalid command: command must be a non-empty string",
          stdout: "",
          stderr: "",
        });
        return;
      }

      if (!Array.isArray(args)) {
        reject({
          error: new Error("Invalid arguments: args must be an array"),
          message: "Invalid arguments: args must be an array",
          stdout: "",
          stderr: "",
        });
        return;
      }

      if (command.endsWith(".js") || command.endsWith(".cjs")) {
        const nodeArgs = [command, ...args];
        command = process.execPath;
        args = nodeArgs;
        opts.shell = false;
      }

      const child = spawn(command, args, opts);

      if (process.platform === "win32" && process.env.DEBUG === "true") {
        console.log(`[DEBUG] Spawned process with command: ${command}`);
        console.log(`[DEBUG] Spawned process with args: ${JSON.stringify(args)}`);
      }

      let stdout = "";
      let stderr = "";

      if (child.stdout) {
        child.stdout.on("data", (data) => {
          stdout += data.toString();
        });
      }

      if (child.stderr) {
        child.stderr.on("data", (data) => {
          stderr += data.toString();
        });
      }

      let timeoutId = null;
      let timeoutCleared = false;
      let promiseResolved = false;

      const clearTimeoutSafely = () => {
        if (timeoutId && !timeoutCleared) {
          clearTimeout(timeoutId);
          timeoutCleared = true;
        }
      };

      const safeResolve = (result) => {
        if (!promiseResolved) {
          promiseResolved = true;
          resolve(result);
        }
      };

      const safeReject = (error) => {
        if (!promiseResolved) {
          promiseResolved = true;
          reject(error);
        }
      };

      child.on("exit", (code, signal) => {
        clearTimeoutSafely();
        safeResolve({ code, signal, stdout, stderr, success: code === 0 });
      });

      child.on("close", (code, signal) => {
        clearTimeoutSafely();
        if (!promiseResolved) {
          safeResolve({ code, signal, stdout, stderr, success: code === 0 });
        }
      });

      child.on("error", (error) => {
        clearTimeoutSafely();
        let errorMessage = error.message;
        if (error.code === "ENOENT") {
          errorMessage = `Command not found: ${command}. Please check if the command is installed and in your PATH.`;
        } else if (error.code === "EACCES") {
          errorMessage = `Permission denied: Cannot execute ${command}. Please check file permissions.`;
        } else if (error.code === "EISDIR") {
          errorMessage = `Cannot execute directory: ${command}. This might be a file path issue.`;
        }
        reject({ error, message: `Failed to execute command: ${errorMessage}`, stdout, stderr });
      });

      if (timeoutValue) {
        timeoutId = setTimeout(() => {
          child.kill();
          reject({
            error: new Error("Command timeout"),
            message: `Command timed out after ${timeoutValue}ms`,
            stdout,
            stderr,
          });
        }, timeoutValue);
      }
    } catch (error) {
      reject({ error, message: `Failed to spawn command: ${error.message}` });
    }
  });
}

async function executeJSFile(jsFilePath, args = [], options = {}) {
  const fs = require("fs").promises;
  const path = require("path");

  try {
    await fs.access(jsFilePath);
    const stats = await fs.stat(jsFilePath);
    if (!stats.isFile()) {
      throw new Error(`Path is not a file: ${jsFilePath}`);
    }
    const ext = path.extname(jsFilePath).toLowerCase();
    if (ext !== ".js" && ext !== ".cjs") {
      throw new Error(`File is not a JavaScript file: ${jsFilePath}`);
    }
    const nodePath = process.execPath;
    return await executeCommand(nodePath, [jsFilePath, ...args], options);
  } catch (error) {
    throw new Error(`Failed to execute JS file '${jsFilePath}': ${error.message}`);
  }
}

module.exports = { executeCommand, executeJSFile };