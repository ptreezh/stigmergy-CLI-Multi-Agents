// src/core/coordination/nodejs/utils/Logger.js
class Logger {
  constructor(component) {
    this.component = component;
  }

  info(message) {
    this.log('INFO', message);
  }

  warn(message) {
    this.log('WARN', message);
  }

  error(message) {
    this.log('ERROR', message);
  }

  debug(message) {
    this.log('DEBUG', message);
  }

  log(level, message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] [${this.component}] ${message}`);
  }
}

module.exports = Logger;
