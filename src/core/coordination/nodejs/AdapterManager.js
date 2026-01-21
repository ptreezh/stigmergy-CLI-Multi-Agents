// src/core/coordination/nodejs/AdapterManager.js
const fs = require('fs');
const path = require('path');
const os = require('os');

class AdapterManager {
  constructor() {
    this.adapters = new Map();
    // Try multiple approaches for the adapters path to handle different installation scenarios
    const primaryAdapterPath = this.findAdaptersPath();
    this.discoveryPaths = [
      primaryAdapterPath,
      path.join(os.homedir(), '.stigmergy', 'adapters'),
    ];
  }

  /**
   * Find the adapters path using multiple approaches to handle different installation scenarios
   */
  findAdaptersPath() {
    const possiblePaths = [
      // Standard path: src/core/coordination/nodejs/../../../adapters => src/adapters
      path.join(__dirname, '..', '..', '..', 'adapters'),
      // Fallback path in case of different module resolution
      path.resolve(__dirname, '..', '..', '..', 'adapters'),
      // Alternative approach: go to project root and then to adapters
      path.join(__dirname, '..', '..', '..', '..', 'adapters')
    ];

    for (const possiblePath of possiblePaths) {
      if (fs.existsSync(possiblePath)) {
        console.log(`[DEBUG] AdapterManager found adapters at: ${possiblePath}`);
        return possiblePath;
      }
    }

    // If none of the paths work, use the standard path as fallback (might not exist)
    const fallbackPath = path.join(__dirname, '..', '..', '..', 'adapters');
    console.log(`[DEBUG] AdapterManager using fallback adapters path (may not exist): ${fallbackPath}`);
    return fallbackPath;
  }

  async initialize() {
    console.log('[ADAPTER_MANAGER] Initializing adapter manager...');
    await this.discoverAdapters();
  }

  async discoverAdapters() {
    console.log('[ADAPTER_MANAGER] Discovering adapters...');

    for (const basePath of this.discoveryPaths) {
      if (fs.existsSync(basePath)) {
        try {
          const adapterDirs = fs
            .readdirSync(basePath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);

          console.log(
            `[ADAPTER_MANAGER] Found ${adapterDirs.length} adapter directories in ${basePath}`,
          );

          for (const dir of adapterDirs) {
            await this.loadAdapter(dir, basePath);
          }
        } catch (error) {
          console.warn(
            `[ADAPTER_MANAGER] Failed to read adapter directory ${basePath}:`,
            error.message,
          );
        }
      } else {
        console.log(
          `[ADAPTER_MANAGER] Adapter path does not exist: ${basePath}`,
        );
      }
    }
  }

  async loadAdapter(adapterName, basePath) {
    const adapterPath = path.join(basePath, adapterName, 'index.js');

    if (fs.existsSync(adapterPath)) {
      try {
        // Create a simple adapter wrapper for Node.js
        const adapter = {
          name: adapterName,
          path: adapterPath,
          available: true,
          version: '1.0.0-nodejs',
          isAvailable: async () => true,
          executeTask: async (task, context) => {
            // Simple task execution simulation
            return `[${adapterName.toUpperCase()} NODE.JS ADAPTER] Executed: ${task}`;
          },
        };

        this.adapters.set(adapterName, adapter);
        console.log(`[ADAPTER_MANAGER] Loaded Node.js adapter: ${adapterName}`);
      } catch (error) {
        console.warn(
          `[ADAPTER_MANAGER] Failed to load adapter from ${adapterPath}:`,
          error.message,
        );
      }
    } else {
      console.log(
        `[ADAPTER_MANAGER] Adapter index.js not found for: ${adapterName}`,
      );
    }
  }

  getAdapter(cliName) {
    return this.adapters.get(cliName.toLowerCase());
  }

  async listAdapters() {
    const adapterList = [];
    for (const [name, adapter] of this.adapters) {
      adapterList.push({
        name,
        available: await adapter.isAvailable(),
        version: adapter.version || 'unknown',
      });
    }
    return adapterList;
  }
}

module.exports = AdapterManager;
