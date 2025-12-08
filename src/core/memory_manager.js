// src/core/memory_manager.js

const fs = require("fs/promises");
const path = require("path");
const os = require("os");

/**
 * Memory Manager - Handles global memory and context sharing between CLI tools
 */
class MemoryManager {
  constructor() {
    this.globalMemoryFile = path.join(
      os.homedir(),
      ".stigmergy",
      "memory.json",
    );
    this.projectMemoryFile = path.join(process.cwd(), "STIGMERGY.md");
  }

  /**
   * Get global memory data
   * @returns {Promise<Object>} Memory data
   */
  async getGlobalMemory() {
    try {
      const data = await fs.readFile(this.globalMemoryFile, "utf8");
      return JSON.parse(data);
    } catch (error) {
      // Return default memory structure if file doesn't exist or is invalid
      return {
        version: "1.0.0",
        lastUpdated: new Date().toISOString(),
        interactions: [],
        collaborations: [],
      };
    }
  }

  /**
   * Update global memory data
   * @param {Function} updateFn - Function that takes current memory and returns updated memory
   * @returns {Promise<Object>} Updated memory data
   */
  async updateGlobalMemory(updateFn) {
    const memory = await this.getGlobalMemory();
    const updatedMemory = updateFn(memory);
    updatedMemory.lastUpdated = new Date().toISOString();

    // Ensure directory exists
    const dir = path.dirname(this.globalMemoryFile);
    await fs.mkdir(dir, { recursive: true });

    // Write updated memory
    await fs.writeFile(
      this.globalMemoryFile,
      JSON.stringify(updatedMemory, null, 2),
    );
    return updatedMemory;
  }

  /**
   * Add an interaction record to memory
   * @param {string} tool - CLI tool name
   * @param {string} prompt - User prompt
   * @param {string} response - Tool response
   * @param {number} duration - Execution duration in milliseconds
   * @returns {Promise<void>}
   */
  async addInteraction(tool, prompt, response, duration = 0) {
    await this.updateGlobalMemory((memory) => {
      memory.interactions.push({
        timestamp: new Date().toISOString(),
        tool,
        prompt,
        response,
        duration,
      });
      return memory;
    });
  }
}

module.exports = MemoryManager;
