#!/usr/bin/env node

const path = require("path");
const { handleAutoCoordinatorCommand } = require("../src/cli/commands/auto-coordinator");

const args = process.argv.slice(2);
if (args.length === 0) {
  args.push("status");
}

const options = parseOptions(args);
options._command = options._command || args[0];

handleAutoCoordinatorCommand(options).catch((error) => {
  console.error(`Auto-coordinator failed: ${error.message}`);
  process.exit(1);
});

function parseOptions(args) {
  const options = {};
  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const keyValue = arg.slice(2).split("=");
      if (keyValue.length === 2) {
        options[keyValue[0]] = keyValue[1];
      } else {
        const nextArg = args[i + 1];
        if (nextArg && !nextArg.startsWith("-")) {
          options[keyValue[0]] = nextArg;
          i++;
        } else {
          options[keyValue[0]] = true;
        }
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      const key = arg.slice(1);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith("-")) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    } else {
      if (!options._command) {
        options._command = arg;
      }
    }
    i++;
  }
  return options;
}
