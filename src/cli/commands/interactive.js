/**
 * Interactive Mode Command Handler
 * Handles the interactive mode for Stigmergy CLI
 */

const { InteractiveModeController } = require('../../interactive/InteractiveModeController');

/**
 * Handle interactive mode command
 * @param {Object} options - Command options
 */
async function handleInteractiveCommand(options) {
  try {
    const controller = new InteractiveModeController({
      autoEnterLoop: true,  // 自动进入命令循环
      cliTimeout: options.timeout || 0,  // 默认无超时限制
      autoSave: options.save !== false
    });

    console.log('Starting Stigmergy Interactive Mode...\n');

    await controller.start();

  } catch (error) {
    console.error('Failed to start interactive mode:', error.message);
    process.exit(1);
  }
}

module.exports = {
  handleInteractiveCommand
};