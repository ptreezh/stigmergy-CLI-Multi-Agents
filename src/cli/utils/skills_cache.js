/**
 * Skills/Agents Cache Management Utilities
 * Provides centralized cache initialization and management for skills and agents
 */

const LocalSkillScanner = require('../../core/local_skill_scanner');

/**
 * Initialize or update skills/agents cache
 * This function checks if cache exists, and if not, generates it.
 * If cache exists, it performs incremental update (only scans changed directories).
 *
 * Called during: scan, install, setup, init, upgrade commands
 *
 * @param {Object} options - Options
 * @param {boolean} options.verbose - Show detailed output
 * @param {boolean} options.force - Force full rescan
 * @returns {Promise<Object>} Cache statistics
 */
async function ensureSkillsCache(options = {}) {
  const { verbose = false, force = false } = options;

  try {
    const scanner = new LocalSkillScanner();

    // Check if cache exists
    const hasCache = await scanner.hasCache();

    if (!hasCache) {
      // First time - generate cache
      console.log('[CACHE] Generating skills/agents cache (first time)...');
      await scanner.initialize();
      const results = scanner.getScanResults();

      if (results) {
        const totalSkills = Object.values(results.skills || {}).flat().length;
        const totalAgents = Object.values(results.agents || {}).flat().length;
        console.log(`[CACHE] Cache generated: ${totalSkills} skills, ${totalAgents} agents`);

        return {
          success: true,
          skills: totalSkills,
          agents: totalAgents,
          action: 'generated'
        };
      }
    } else if (force) {
      // Force refresh requested
      console.log('[CACHE] Refreshing skills/agents cache...');
      await scanner.initialize(true);
      const results = scanner.getScanResults();

      if (results) {
        const totalSkills = Object.values(results.skills || {}).flat().length;
        const totalAgents = Object.values(results.agents || {}).flat().length;
        console.log(`[CACHE] Cache refreshed: ${totalSkills} skills, ${totalAgents} agents`);

        return {
          success: true,
          skills: totalSkills,
          agents: totalAgents,
          action: 'refreshed'
        };
      }
    } else {
      // Incremental update - only scan changed directories
      if (verbose || process.env.DEBUG === 'true') {
        console.log('[CACHE] Updating skills/agents cache (incremental)...');
      }
      await scanner.scanIncremental();

      return {
        success: true,
        action: 'updated'
      };
    }
  } catch (error) {
    // Cache initialization is not critical - don't fail the command
    if (verbose || process.env.DEBUG === 'true') {
      console.log(`[CACHE] Warning: ${error.message}`);
    }

    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  ensureSkillsCache
};
