/**
 * Python Detection Module
 * 
 * This module detects Python environment and version:
 * - Checks if Python is installed
 * - Detects Python version
 * - Finds Python executable path
 * - Validates Python availability
 * - Supports multiple Python versions
 * 
 * @module PythonDetector
 */

const { EventEmitter } = require('events');
const { spawn, spawnSync } = require('child_process');
const { platform } = require('os');

class PythonDetector extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      detectionTimeout: options.detectionTimeout || 5000,
      enableCaching: options.enableCaching !== false,
      cacheTTL: options.cacheTTL || 60000, // 60 seconds
      preferredVersion: options.preferredVersion || null, // e.g., '3.9', '3.10'
      ...options
    };
    
    this.cache = new Map();
    this.cacheTimestamps = new Map();
    this.detectedPython = null;
  }

  /**
   * Detect Python environment
   * 
   * @returns {Promise<Object>} Detection result
   */
  async detectPython() {
    try {
      // Check cache first
      if (this.options.enableCaching) {
        const cached = this._getFromCache('python_detection');
        if (cached) {
          return cached;
        }
      }

      const result = {
        installed: false,
        version: null,
        path: null,
        executable: null,
        error: null,
        platforms: [],
        availableVersions: []
      };

      // Try to detect Python
      const detectionResult = await this._detectPythonExecutable();
      
      if (detectionResult.found) {
        result.installed = true;
        result.path = detectionResult.path;
        result.executable = detectionResult.executable;
        
        // Get version
        const versionResult = await this._getPythonVersion(detectionResult.executable);
        result.version = versionResult.version;
        result.versionString = versionResult.versionString;
        
        // Detect available versions
        result.availableVersions = await this._detectAvailableVersions();
        
        // Validate Python availability
        const validation = await this._validatePython(detectionResult.executable);
        result.valid = validation.valid;
        result.validationError = validation.error;
        
        this.detectedPython = result;
        this.emit('python-detected', result);
      } else {
        result.error = detectionResult.error;
        this.emit('python-not-detected', result);
      }

      // Cache the result
      if (this.options.enableCaching) {
        this._setToCache('python_detection', result);
      }

      return result;
    } catch (error) {
      const errorResult = {
        installed: false,
        version: null,
        path: null,
        executable: null,
        error: error.message,
        platforms: [],
        availableVersions: []
      };
      
      this.emit('detection-error', errorResult);
      return errorResult;
    }
  }

  /**
   * Detect Python executable
   * 
   * @returns {Promise<Object>} Detection result
   * @private
   */
  async _detectPythonExecutable() {
    const possibleCommands = this._getPossiblePythonCommands();
    
    for (const command of possibleCommands) {
      try {
        const result = await this._tryCommand(command);
        if (result.success) {
          return {
            found: true,
            executable: command,
            path: result.path
          };
        }
      } catch (error) {
        // Try next command
        continue;
      }
    }
    
    return {
      found: false,
      error: 'Python executable not found'
    };
  }

  /**
   * Get possible Python commands based on platform
   * 
   * @returns {Array<string>} List of possible Python commands
   * @private
   */
  _getPossiblePythonCommands() {
    const commands = ['python', 'python3'];
    
    // Add version-specific commands if preferred version is specified
    if (this.options.preferredVersion) {
      const majorMinor = this.options.preferredVersion.split('.').slice(0, 2).join('.');
      commands.unshift(`python${majorMinor}`, `python${majorMinor.replace('.', '')}`);
    }
    
    // Platform-specific commands
    if (platform() === 'win32') {
      commands.push('py'); // Python Launcher for Windows
    }
    
    return commands;
  }

  /**
   * Try to execute a Python command
   * 
   * @param {string} command - Python command to try
   * @returns {Promise<Object>} Execution result
   * @private
   */
  async _tryCommand(command) {
    return new Promise((resolve, reject) => {
      const args = ['--version'];
      
      const childProcess = spawn(command, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });
      
      let stdout = '';
      let stderr = '';
      
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      let timeoutHandle;
      
      childProcess.on('close', (code) => {
        clearTimeout(timeoutHandle);
        
        if (code === 0) {
          // Get the path to the executable
          const path = spawnSync(command, ['-c', 'import sys; print(sys.executable)'], {
            encoding: 'utf8',
            shell: true
          }).stdout.trim();
          
          resolve({
            success: true,
            path: path,
            versionOutput: stdout || stderr
          });
        } else {
          reject(new Error(`Command failed with exit code ${code}`));
        }
      });
      
      childProcess.on('error', (error) => {
        clearTimeout(timeoutHandle);
        reject(error);
      });
      
      // Timeout
      timeoutHandle = setTimeout(() => {
        childProcess.kill();
        reject(new Error('Command timeout'));
      }, this.options.detectionTimeout);
    });
  }

  /**
   * Get Python version
   * 
   * @param {string} executable - Python executable path
   * @returns {Promise<Object>} Version information
   * @private
   */
  async _getPythonVersion(executable) {
    return new Promise((resolve, reject) => {
      const childProcess = spawn(executable, ['-c', 'import sys; print(sys.version_info[:3])'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });
      
      let stdout = '';
      let stderr = '';
      
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      let timeoutHandle;
      
      childProcess.on('close', (code) => {
        clearTimeout(timeoutHandle);
        
        if (code === 0) {
          try {
            const versionTuple = JSON.parse(stdout.trim().replace(/\(/g, '[').replace(/\)/g, ']'));
            const versionString = `${versionTuple[0]}.${versionTuple[1]}.${versionTuple[2]}`;
            
            resolve({
              version: versionString,
              major: versionTuple[0],
              minor: versionTuple[1],
              patch: versionTuple[2],
              versionString: versionString
            });
          } catch (error) {
            reject(new Error('Failed to parse version'));
          }
        } else {
          reject(new Error(`Failed to get version: ${stderr}`));
        }
      });
      
      childProcess.on('error', (error) => {
        clearTimeout(timeoutHandle);
        reject(error);
      });
      
      timeoutHandle = setTimeout(() => {
        childProcess.kill();
        reject(new Error('Version detection timeout'));
      }, this.options.detectionTimeout);
    });
  }

  /**
   * Detect available Python versions
   * 
   * @returns {Promise<Array<string>>} List of available versions
   * @private
   */
  async _detectAvailableVersions() {
    const versions = [];
    
    if (platform() === 'win32') {
      // Windows: Use py launcher to list versions
      try {
        const result = spawnSync('py', ['-0', '-p'], {
          encoding: 'utf8',
          shell: true
        });
        
        if (result.stdout) {
          const lines = result.stdout.split('\n');
          for (const line of lines) {
            const match = line.match(/(\d+\.\d+\.\d+)/);
            if (match) {
              versions.push(match[1]);
            }
          }
        }
      } catch (error) {
        // Ignore errors
      }
    } else {
      // Unix-like systems: Try common version commands
      const versionCommands = ['python3.9', 'python3.10', 'python3.11', 'python3.12'];
      
      for (const cmd of versionCommands) {
        try {
          const result = spawnSync(cmd, ['--version'], {
            encoding: 'utf8',
            shell: true
          });
          
          if (result.status === 0) {
            const match = result.stdout.match(/(\d+\.\d+\.\d+)/);
            if (match) {
              versions.push(match[1]);
            }
          }
        } catch (error) {
          // Continue
        }
      }
    }
    
    return [...new Set(versions)]; // Remove duplicates
  }

  /**
   * Validate Python installation
   * 
   * @param {string} executable - Python executable path
   * @returns {Promise<Object>} Validation result
   * @private
   */
  async _validatePython(executable) {
    return new Promise((resolve, reject) => {
      const testScript = `
import sys
import json
result = {
  'executable': sys.executable,
  'version': f'{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}',
  'platform': sys.platform,
  'valid': True
}
print(json.dumps(result))
`;
      
      const childProcess = spawn(executable, ['-c', testScript], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });
      
      let stdout = '';
      let stderr = '';
      
      childProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      childProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      let timeoutHandle;
      
      childProcess.on('close', (code) => {
        clearTimeout(timeoutHandle);
        
        if (code === 0) {
          try {
            const result = JSON.parse(stdout.trim());
            resolve({
              valid: result.valid === true,
              details: result
            });
          } catch (error) {
            resolve({
              valid: false,
              error: 'Failed to parse validation result'
            });
          }
        } else {
          resolve({
            valid: false,
            error: stderr || 'Validation failed'
          });
        }
      });
      
      childProcess.on('error', (error) => {
        clearTimeout(timeoutHandle);
        resolve({
          valid: false,
          error: error.message
        });
      });
      
      timeoutHandle = setTimeout(() => {
        childProcess.kill();
        resolve({
          valid: false,
          error: 'Validation timeout'
        });
      }, this.options.detectionTimeout);
    });
  }

  /**
   * Check if Python is available
   * 
   * @returns {Promise<boolean>} True if Python is available
   */
  async isPythonAvailable() {
    const result = await this.detectPython();
    return result.installed && result.valid;
  }

  /**
   * Get Python executable path
   * 
   * @returns {Promise<string|null>} Python executable path or null
   */
  async getPythonPath() {
    if (this.detectedPython) {
      return this.detectedPython.path;
    }
    
    const result = await this.detectPython();
    return result.path;
  }

  /**
   * Get Python version
   * 
   * @returns {Promise<string|null>} Python version or null
   */
  async getPythonVersion() {
    if (this.detectedPython) {
      return this.detectedPython.version;
    }
    
    const result = await this.detectPython();
    return result.version;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    this.cacheTimestamps.clear();
    this.detectedPython = null;
  }

  /**
   * Get cache statistics
   * 
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      ttl: this.options.cacheTTL,
      enabled: this.options.enableCaching
    };
  }

  /**
   * Get result from cache
   * 
   * @param {string} key - Cache key
   * @returns {Object|null} Cached result or null
   * @private
   */
  _getFromCache(key) {
    const cached = this.cache.get(key);
    const timestamp = this.cacheTimestamps.get(key);
    
    if (cached && timestamp) {
      const age = Date.now() - timestamp;
      if (age < this.options.cacheTTL) {
        return cached;
      } else {
        // Cache expired
        this.cache.delete(key);
        this.cacheTimestamps.delete(key);
      }
    }
    
    return null;
  }

  /**
   * Set result to cache
   * 
   * @param {string} key - Cache key
   * @param {Object} result - Result to cache
   * @private
   */
  _setToCache(key, result) {
    this.cache.set(key, result);
    this.cacheTimestamps.set(key, Date.now());
  }
}

module.exports = PythonDetector;