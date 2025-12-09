const path = require('path');
const os = require('os');
const { errorHandler, ERROR_TYPES } = require('./error_handler');

// AI CLI Tools Configuration
const CLI_TOOLS = {
  claude: {
    name: 'Claude CLI',
    version: 'claude --version',
    install: 'npm install -g @anthropic-ai/claude-cli',
    hooksDir: path.join(os.homedir(), '.claude', 'hooks'),
    config: path.join(os.homedir(), '.claude', 'config.json'),
  },
  gemini: {
    name: 'Gemini CLI',
    version: 'gemini --version',
    install: 'npm install -g @google/generative-ai-cli',
    hooksDir: path.join(os.homedir(), '.gemini', 'extensions'),
    config: path.join(os.homedir(), '.gemini', 'config.json'),
  },
  qwen: {
    name: 'Qwen CLI',
    version: 'qwen --version',
    install: 'npm install -g @alibaba/qwen-cli',
    hooksDir: path.join(os.homedir(), '.qwen', 'hooks'),
    config: path.join(os.homedir(), '.qwen', 'config.json'),
  },
  iflow: {
    name: 'iFlow CLI',
    version: 'iflow --version',
    install: 'npm install -g iflow-cli',
    hooksDir: path.join(os.homedir(), '.iflow', 'hooks'),
    config: path.join(os.homedir(), '.iflow', 'config.json'),
  },
  qodercli: {
    name: 'Qoder CLI',
    version: 'qodercli --version',
    install: 'npm install -g @qoder-ai/qodercli',
    hooksDir: path.join(os.homedir(), '.qoder', 'hooks'),
    config: path.join(os.homedir(), '.qoder', 'config.json'),
  },
  codebuddy: {
    name: 'CodeBuddy CLI',
    version: 'codebuddy --version',
    install: 'npm install -g codebuddy-cli',
    hooksDir: path.join(os.homedir(), '.codebuddy', 'hooks'),
    config: path.join(os.homedir(), '.codebuddy', 'config.json'),
  },
  copilot: {
    name: 'GitHub Copilot CLI',
    version: 'copilot --version',
    install: 'npm install -g @github/copilot-cli',
    hooksDir: path.join(os.homedir(), '.copilot', 'mcp'),
    config: path.join(os.homedir(), '.copilot', 'config.json'),
  },
  codex: {
    name: 'OpenAI Codex CLI',
    version: 'codex --version',
    install: 'npm install -g openai-codex-cli',
    hooksDir: path.join(os.homedir(), '.config', 'codex', 'slash_commands'),
    config: path.join(os.homedir(), '.codex', 'config.json'),
  },
};

/**
 * Validate CLI tool configuration
 * @param {string} toolName - Name of the tool to validate
 * @throws {StigmergyError} If validation fails
 */
function validateCLITool(toolName) {
  if (!CLI_TOOLS[toolName]) {
    throw errorHandler.createError(
      `CLI tool '${toolName}' is not configured`,
      ERROR_TYPES.CONFIGURATION,
      'INVALID_CLI_TOOL',
    );
  }

  const tool = CLI_TOOLS[toolName];
  if (!tool.name || !tool.version || !tool.install) {
    throw errorHandler.createError(
      `CLI tool '${toolName}' has invalid configuration`,
      ERROR_TYPES.CONFIGURATION,
      'INCOMPLETE_CLI_CONFIG',
    );
  }
}

module.exports = { CLI_TOOLS, validateCLITool };
