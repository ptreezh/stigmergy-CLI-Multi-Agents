/**
 * Local Skills and Agents Scanner
 *
 * This module scans local directories for skills and agents configuration,
 * and provides them to the smart routing system for intelligent parameter configuration.
 *
 * FEATURES:
 * - Persistent caching with NO expiration (cache is valid until file changes)
 * - Incremental updates based on file modification time
 * - Trigger-based scanning (only when necessary)
 * - Fast in-memory access for cached data
 * - Automatic cache generation during setup/install/scan commands
 */

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const os = require('os');
const crypto = require('crypto');

class LocalSkillScanner {
  constructor() {
    this.cacheDir = path.join(os.homedir(), '.stigmergy', 'cache');
    this.cacheFile = path.join(this.cacheDir, 'skills-agents-cache.json');
    this.scanResults = null;
    this.initialized = false;
  }

  /**
   * Initialize the scanner (lazy loading with cache)
   * - Loads from cache if available (no expiration)
   * - Only scans if cache doesn't exist or forceRefresh=true
   * - Uses persistent cache for fast subsequent access
   */
  async initialize(forceRefresh = false) {
    if (this.initialized && !forceRefresh) {
      return this.scanResults;
    }

    // Ensure cache directory exists
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      // Ignore error
    }

    // Try to load from cache (no expiration check - cache is valid until file changes)
    if (!forceRefresh) {
      const cached = await this.loadFromCache();
      if (cached) {
        this.scanResults = cached;
        this.initialized = true;
        if (process.env.DEBUG === 'true') {
          console.log('[SKILL-SCANNER] Loaded skills/agents from cache');
        }
        return this.scanResults;
      }
    }

    // Cache miss, perform scan
    const results = await this.scanAll();
    await this.saveToCache(results);
    this.scanResults = results;
    this.initialized = true;

    if (process.env.DEBUG === 'true') {
      console.log('[SKILL-SCANNER] Performed fresh scan and cached results');
    }

    return this.scanResults;
  }

  /**
   * Check if cache file exists
   */
  async hasCache() {
    try {
      await fs.access(this.cacheFile);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get cache file timestamp
   */
  async getCacheTimestamp() {
    try {
      const stats = await fs.stat(this.cacheFile);
      return stats.mtime;
    } catch {
      return null;
    }
  }

  /**
   * Load scan results from persistent cache
   */
  async loadFromCache() {
    try {
      const data = await fs.readFile(this.cacheFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * Save scan results to persistent cache
   */
  async saveToCache(results) {
    try {
      await fs.writeFile(this.cacheFile, JSON.stringify(results, null, 2), 'utf8');
    } catch (error) {
      // Cache save is not critical, ignore errors
      if (process.env.DEBUG === 'true') {
        console.log('[SKILL-SCANNER] Failed to save cache:', error.message);
      }
    }
  }

  /**
   * Perform incremental scan (only scan directories that changed)
   * Compares file modification times to determine if re-scanning is needed
   * - Cache is valid indefinitely until files change
   */
  async scanIncremental() {
    const cached = await this.loadFromCache();

    if (!cached) {
      return await this.initialize();
    }

    const cliTools = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'copilot', 'codex'];
    const results = {
      skills: { ...cached.skills },
      agents: { ...cached.agents },
      timestamp: new Date().toISOString()
    };

    let hasChanges = false;

    for (const cli of cliTools) {
      const cliConfigPath = path.join(os.homedir(), `.${cli}`);
      const skillsPath = path.join(cliConfigPath, 'skills');
      const agentsPath = path.join(cliConfigPath, 'agents');

      // Check if skills directory needs re-scanning (based on file modification time)
      if (await this.directoryChanged(skillsPath, cached.timestamp)) {
        results.skills[cli] = await this.scanDirectory(skillsPath, 'skill');
        hasChanges = true;
        if (process.env.DEBUG === 'true') {
          console.log(`[SKILL-SCANNER] Updated skills cache for ${cli}`);
        }
      }

      // Check if agents directory needs re-scanning
      if (await this.directoryChanged(agentsPath, cached.timestamp)) {
        results.agents[cli] = await this.scanDirectory(agentsPath, 'agent');
        hasChanges = true;
        if (process.env.DEBUG === 'true') {
          console.log(`[SKILL-SCANNER] Updated agents cache for ${cli}`);
        }
      }
    }

    if (hasChanges) {
      await this.saveToCache(results);
      if (process.env.DEBUG === 'true') {
        console.log('[SKILL-SCANNER] Saved updated cache');
      }
    } else {
      if (process.env.DEBUG === 'true') {
        console.log('[SKILL-SCANNER] No changes detected, cache is up-to-date');
      }
    }

    this.scanResults = results;
    return results;
  }

  /**
   * Check if a directory has changed since a given timestamp
   */
  async directoryChanged(dirPath, sinceTimestamp) {
    try {
      const stats = await fs.stat(dirPath);
      const sinceTime = new Date(sinceTimestamp);

      // Check directory modification time
      if (stats.mtime > sinceTime) {
        return true;
      }

      // Check if any files in the directory are newer
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const itemPath = path.join(dirPath, entry.name);
          try {
            const itemStats = await fs.stat(itemPath);
            if (itemStats.mtime > sinceTime) {
              return true;
            }
          } catch {
            // Ignore errors
          }
        }
      }

      return false;
    } catch (error) {
      // Directory doesn't exist or other error
      return false;
    }
  }

  /**
   * Scan all CLI tool directories for skills and agents
   * This is expensive and should only be called when necessary
   */
  async scanAll() {
    const cliTools = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'copilot', 'codex'];
    const results = {
      skills: {},
      agents: {},
      timestamp: new Date().toISOString()
    };

    for (const cli of cliTools) {
      const cliConfigPath = path.join(os.homedir(), `.${cli}`);
      const skillsPath = path.join(cliConfigPath, 'skills');
      const agentsPath = path.join(cliConfigPath, 'agents');

      results.skills[cli] = await this.scanDirectory(skillsPath, 'skill');
      results.agents[cli] = await this.scanDirectory(agentsPath, 'agent');
    }

    return results;
  }

  /**
   * Scan a directory for skills or agents
   */
  async scanDirectory(dirPath, type) {
    const items = [];

    try {
      const stats = await fs.stat(dirPath);
      if (!stats.isDirectory()) {
        return [];
      }
    } catch (error) {
      // Directory doesn't exist
      return [];
    }

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const itemPath = path.join(dirPath, entry.name);

          // Try to find SKILL.md or AGENT.md
          const skillMdPath = path.join(itemPath, 'SKILL.md');
          const agentMdPath = path.join(itemPath, 'AGENT.md');
          const readmePath = path.join(itemPath, 'README.md');

          let metadata = null;

          // Try to read metadata from markdown files
          if (type === 'skill') {
            metadata = await this.readSkillMetadata(itemPath, skillMdPath, readmePath);
          } else {
            metadata = await this.readAgentMetadata(itemPath, agentMdPath, readmePath);
          }

          if (metadata) {
            items.push({
              name: entry.name,
              path: itemPath,
              type,
              metadata,
              keywords: this.extractKeywords(metadata)
            });
          }
        }
      }
    } catch (error) {
      // Ignore errors
    }

    return items;
  }

  /**
   * Read skill metadata from markdown files
   */
  async readSkillMetadata(itemPath, skillMdPath, readmePath) {
    try {
      let content = '';
      let sourceFile = '';

      // Try SKILL.md first
      try {
        content = await fs.readFile(skillMdPath, 'utf8');
        sourceFile = 'SKILL.md';
      } catch {
        // Try README.md
        try {
          content = await fs.readFile(readmePath, 'utf8');
          sourceFile = 'README.md';
        } catch {
          return null;
        }
      }

      // Extract metadata
      const metadata = {
        name: this.extractName(content, path.basename(itemPath)),
        description: this.extractDescription(content),
        capabilities: this.extractCapabilities(content),
        usage: this.extractUsage(content),
        sourceFile
      };

      return metadata;
    } catch (error) {
      return null;
    }
  }

  /**
   * Read agent metadata from markdown files
   */
  async readAgentMetadata(itemPath, agentMdPath, readmePath) {
    try {
      let content = '';
      let sourceFile = '';

      // Try AGENT.md first
      try {
        content = await fs.readFile(agentMdPath, 'utf8');
        sourceFile = 'AGENT.md';
      } catch {
        // Try README.md
        try {
          content = await fs.readFile(readmePath, 'utf8');
          sourceFile = 'README.md';
        } catch {
          return null;
        }
      }

      // Extract metadata
      const metadata = {
        name: this.extractName(content, path.basename(itemPath)),
        description: this.extractDescription(content),
        capabilities: this.extractCapabilities(content),
        usage: this.extractUsage(content),
        sourceFile
      };

      return metadata;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract name from markdown content
   */
  extractName(content, fallbackName) {
    // Try to find name in frontmatter or heading
    const nameMatch = content.match(/name:\s*"([^"]+)"/i) ||
                     content.match(/^#\s+(.+)$/m) ||
                     content.match(/name:\s*([^#\n]+)/i);

    if (nameMatch) {
      return nameMatch[1].trim();
    }

    return fallbackName;
  }

  /**
   * Extract description from markdown content
   */
  extractDescription(content) {
    // Try to find description in frontmatter
    const descMatch = content.match(/description:\s*"([^"]+)"/i);
    if (descMatch) {
      return descMatch[1].trim();
    }

    // Try to find first paragraph after heading
    const firstParagraph = content.match(/^#\s+.+?\n+(.+?)(?:\n\n|\n#|$)/s);
    if (firstParagraph) {
      return firstParagraph[1].trim().substring(0, 200);
    }

    return '';
  }

  /**
   * Extract capabilities from markdown content
   */
  extractCapabilities(content) {
    const capabilities = [];

    // Look for lists in the content
    const listMatches = content.matchAll(/^[-*]\s+(.+?)$/gm);
    for (const match of listMatches) {
      const capability = match[1].trim();
      if (capability.length > 0 && capability.length < 200) {
        capabilities.push(capability);
      }
    }

    return capabilities.slice(0, 10); // Limit to 10 capabilities
  }

  /**
   * Extract usage examples from markdown content
   */
  extractUsage(content) {
    const usage = [];

    // Look for code blocks
    const codeBlockMatches = content.matchAll(/```[\w]*\n([\s\S]+?)```/g);
    for (const match of codeBlockMatches) {
      const example = match[1].trim();
      if (example.length > 0 && example.length < 500) {
        usage.push(example);
      }
    }

    return usage.slice(0, 5); // Limit to 5 usage examples
  }

  /**
   * Extract keywords from metadata
   */
  extractKeywords(metadata) {
    const keywords = new Set();

    // Add name and description words
    if (metadata.name) {
      metadata.name.split(/\s+/).forEach(word => {
        if (word.length > 2) keywords.add(word.toLowerCase());
      });
    }

    if (metadata.description) {
      metadata.description.split(/\s+/).forEach(word => {
        if (word.length > 3) keywords.add(word.toLowerCase());
      });
    }

    return Array.from(keywords);
  }

  /**
   * Get skills for a specific CLI
   */
  getSkillsForCLI(cliName) {
    if (!this.scanResults) {
      return [];
    }
    return this.scanResults.skills[cliName] || [];
  }

  /**
   * Get agents for a specific CLI
   */
  getAgentsForCLI(cliName) {
    if (!this.scanResults) {
      return [];
    }
    return this.scanResults.agents[cliName] || [];
  }

  /**
   * Quick pre-check for agent/skill mentions (Stage 1)
   * This is a FAST in-memory check that avoids cache I/O if no keywords are found
   * Only if this returns true should we proceed to load cache and do detailed matching
   *
   * @param {string} userInput - User's input text
   * @returns {Object} Quick detection result
   */
  quickDetectMention(userInput) {
    const inputLower = userInput.toLowerCase();

    // Quick keyword check (no cache needed, just string matching)
    const quickAgentKeywords = [
      'agent', '智能体', '专家', 'expert', 'specialist',
      '使用.*agent', '调用.*agent', '用.*agent'
    ];

    const quickSkillKeywords = [
      'skill', '技能', '能力', 'method', 'tool',
      '使用.*skill', '调用.*skill', '用.*skill'
    ];

    // Stage 1: Fast regex check (no I/O, <1ms)
    const hasAgentKeyword = quickAgentKeywords.some(keyword =>
      new RegExp(keyword, 'i').test(userInput)
    );

    const hasSkillKeyword = quickSkillKeywords.some(keyword =>
      new RegExp(keyword, 'i').test(userInput)
    );

    // Early exit if no keywords detected
    if (!hasAgentKeyword && !hasSkillKeyword) {
      return {
        hasMention: false,
        hasAgentMention: false,
        hasSkillMention: false,
        shouldLoadCache: false
      };
    }

    // Keywords detected, but we still need detailed matching (Stage 2)
    return {
      hasMention: true,
      hasAgentKeyword,
      hasSkillKeyword,
      shouldLoadCache: true // Proceed to Stage 2: load cache and match
    };
  }

  /**
   * Match user input to available skills (Stage 2 - Detailed)
   * Only called after quickDetectMention returns true
   * Requires cache to be loaded first
   */
  matchSkills(userInput, cliName) {
    const skills = this.getSkillsForCLI(cliName);
    const matches = [];

    const inputLower = userInput.toLowerCase();

    for (const skill of skills) {
      let score = 0;
      const reasons = [];

      // Check name match
      if (inputLower.includes(skill.name.toLowerCase())) {
        score += 0.5;
        reasons.push('Skill name mentioned');
      }

      // Check keyword matches
      for (const keyword of skill.keywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          score += 0.1;
          reasons.push(`Keyword match: ${keyword}`);
        }
      }

      // Check description matches
      if (skill.metadata.description) {
        const descWords = skill.metadata.description.toLowerCase().split(/\s+/);
        for (const word of descWords) {
          if (word.length > 4 && inputLower.includes(word)) {
            score += 0.05;
          }
        }
      }

      if (score > 0.3) {
        matches.push({
          skill,
          score: Math.min(score, 1.0),
          reasons
        });
      }
    }

    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Match user input to available agents (Stage 2 - Detailed)
   * Only called after quickDetectMention returns true
   * Requires cache to be loaded first
   */
  matchAgents(userInput, cliName) {
    const agents = this.getAgentsForCLI(cliName);
    const matches = [];

    const inputLower = userInput.toLowerCase();

    for (const agent of agents) {
      let score = 0;
      const reasons = [];

      // Check name match
      if (inputLower.includes(agent.name.toLowerCase())) {
        score += 0.5;
        reasons.push('Agent name mentioned');
      }

      // Check keyword matches
      for (const keyword of agent.keywords) {
        if (inputLower.includes(keyword.toLowerCase())) {
          score += 0.1;
          reasons.push(`Keyword match: ${keyword}`);
        }
      }

      // Check description matches
      if (agent.metadata.description) {
        const descWords = agent.metadata.description.toLowerCase().split(/\s+/);
        for (const word of descWords) {
          if (word.length > 4 && inputLower.includes(word)) {
            score += 0.05;
          }
        }
      }

      if (score > 0.3) {
        matches.push({
          agent,
          score: Math.min(score, 1.0),
          reasons
        });
      }
    }

    // Sort by score descending
    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Full explicit mention detection (Stage 2)
   * Only called after quickDetectMention returns true
   * This loads cache and performs detailed matching
   *
   * IMPORTANT: This should only be called after quickDetectMention() returns true
   */
  detectExplicitMention(userInput, cliName) {
    const inputLower = userInput.toLowerCase();

    const agentMatches = this.matchAgents(userInput, cliName);
    const skillMatches = this.matchSkills(userInput, cliName);

    // Check for explicit keywords
    const explicitAgentKeywords = [
      'agent', '智能体', '专家', 'expert', 'specialist',
      '使用.*agent', '调用.*agent', '用.*agent'
    ];

    const explicitSkillKeywords = [
      'skill', '技能', '能力', 'method', 'tool',
      '使用.*skill', '调用.*skill', '用.*skill'
    ];

    const hasExplicitAgentMention = explicitAgentKeywords.some(keyword =>
      new RegExp(keyword, 'i').test(userInput)
    ) || agentMatches.some(m => m.score > 0.5);

    const hasExplicitSkillMention = explicitSkillKeywords.some(keyword =>
      new RegExp(keyword, 'i').test(userInput)
    ) || skillMatches.some(m => m.score > 0.5);

    return {
      hasExplicitAgentMention,
      hasExplicitSkillMention,
      agentMatches: hasExplicitAgentMention ? agentMatches : [],
      skillMatches: hasExplicitSkillMention ? skillMatches : []
    };
  }

  /**
   * Generate CLI-specific parameter pattern for a skill
   */
  generateSkillParameterPattern(skillName, cliName) {
    const patterns = {
      'claude': `Bash("stigmergy skill read ${skillName}")`,
      'gemini': `--skill ${skillName}`,
      'qwen': `使用${skillName}技能`,
      'codebuddy': `-p "skill:${skillName}"`,
      'iflow': `-p "请使用${skillName}技能"`,
      'copilot': `--skill ${skillName}`,
      'codex': `--skill ${skillName}`,
      'qodercli': `-p "请使用${skillName}技能"`
    };

    return patterns[cliName] || `-p "${skillName}"`;
  }

  /**
   * Generate CLI-specific parameter pattern for an agent
   */
  generateAgentParameterPattern(agentName, cliName) {
    const patterns = {
      'claude': `Bash("stigmergy use ${agentName} agent")`,
      'gemini': `--agent ${agentName}`,
      'qwen': `使用${agentName}智能体`,
      'codebuddy': `-p "agent:${agentName}"`,
      'iflow': `-p "请使用${agentName}智能体"`,
      'copilot': `--agent ${agentName}`,
      'codex': `--agent ${agentName}`,
      'qodercli': `-p "请使用${agentName}智能体"`
    };

    return patterns[cliName] || `-p "${agentName}"`;
  }

  /**
   * Get cached scan results
   */
  getScanResults() {
    return this.scanResults;
  }

  /**
   * Refresh the scan
   */
  async refresh() {
    this.skillCache.clear();
    this.agentCache.clear();
    return await this.scanAll();
  }
}

module.exports = LocalSkillScanner;
