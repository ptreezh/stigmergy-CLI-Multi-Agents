// tests/factories/test_data_factory.js

const os = require('os');
const path = require('path');

class TestDataFactory {
  /**
   * Create a test interaction record
   * @param {string} tool - The CLI tool name
   * @param {string} prompt - The user prompt
   * @param {string} response - The tool response
   * @returns {Object} Interaction record
   */
  static createInteraction(tool = 'claude', prompt = 'test prompt', response = 'test response') {
    return {
      timestamp: new Date().toISOString(),
      tool,
      prompt,
      response,
      duration: Math.floor(Math.random() * 1000) // Random duration between 0-1000ms
    };
  }
  
  /**
   * Create a CLI tool configuration
   * @param {string} name - The tool name
   * @returns {Object} CLI configuration
   */
  static createCLIConfig(name = 'test-cli') {
    return {
      name: `${name} CLI`,
      version: `${name} --version`,
      install: `npm install -g ${name}-cli`,
      hooksDir: path.join(os.homedir(), `.${name}`, 'hooks'),
      config: path.join(os.homedir(), `.${name}`, 'config.json')
    };
  }
  
  /**
   * Create a CLI pattern analysis result
   * @param {string} cliName - The CLI tool name
   * @returns {Object} Analysis result
   */
  static createCLIAnalysis(cliName = 'test-cli') {
    return {
      success: true,
      cliName,
      cliType: 'generic',
      version: '1.0.0',
      helpMethod: `${cliName} --help`,
      patterns: {
        commands: [
          { name: 'analyze', description: 'Analyze input', syntax: 'analyze [options] <input>' },
          { name: 'generate', description: 'Generate output', syntax: 'generate [options] <template>' }
        ],
        options: ['--verbose', '--output', '--format'],
        subcommands: [
          { name: 'analyze', description: 'Analyze input', syntax: 'analyze [options] <input>' }
        ],
        arguments: [],
        flags: ['verbose', 'output', 'format']
      },
      commandStructure: {
        primaryCommand: '',
        commandFormat: 'cli <subcommand> [options] [args]',
        argumentStyle: '',
        optionStyle: '',
        interactiveMode: true,
        hasSubcommands: true,
        complexity: 'moderate'
      },
      examples: [
        { command: 'analyze file.txt', raw: '$ test-cli analyze file.txt', description: '' }
      ],
      interactionMode: 'chat',
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Create a memory state
   * @param {Array} interactions - Array of interactions
   * @param {Array} collaborations - Array of collaborations
   * @returns {Object} Memory state
   */
  static createMemoryState(interactions = [], collaborations = []) {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      interactions,
      collaborations
    };
  }
}

module.exports = TestDataFactory;