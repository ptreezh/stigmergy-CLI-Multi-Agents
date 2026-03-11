/**
 * Collaboration Coordinator for Multi-CLI Collaboration
 *
 * This coordinator handles indirect collaboration requests by:
 * - Reading PROJECT_SPEC.json for context
 * - Analyzing collaboration background and requirements
 * - Selecting the most suitable agents
 * - Updating collaboration state
 * - Recording collaboration history
 *
 * @module CollaborationCoordinator
 */

const fs = require("fs");
const fsPromises = require("fs").promises;
const path = require("path");
const { EventEmitter } = require("events");

class CollaborationCoordinator extends EventEmitter {
  // Static constants for configuration
  static get DEFAULTS() {
    return {
      MAX_HISTORY_SIZE: 100,
      MAX_ACTIVE_COLLABORATIONS: 50,
      COLLABORATION_TTL: 24 * 60 * 60 * 1000, // 24 hours
      STATE_SAVE_DEBOUNCE: 1000, // 1 second
      HISTORY_SAVE_DEBOUNCE: 500, // 500ms
      CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hour
    };
  }

  // Static keyword patterns for task classification (cached for performance)
  static get TASK_KEYWORDS() {
    return {
      "code-generation": [
        "write",
        "create",
        "generate",
        "implement",
        "develop",
      ],
      "code-analysis": ["analyze", "review", "audit", "inspect", "examine"],
      "code-optimization": ["optimize", "improve", "refactor", "enhance"],
      testing: ["test", "verify", "validate", "check"],
      documentation: ["document", "write docs", "create documentation"],
      debugging: ["debug", "fix", "resolve", "troubleshoot"],
      deployment: ["deploy", "release", "publish"],
    };
  }

  static get COMPLEXITY_INDICATORS() {
    return {
      high: [
        "architecture",
        "system",
        "framework",
        "integration",
        "multiple",
        "complex",
      ],
      medium: ["feature", "module", "component", "function", "class"],
      low: ["fix", "update", "change", "small", "simple"],
    };
  }

  static get SKILL_KEYWORDS() {
    return {
      programming: ["code", "function", "class", "algorithm", "programming"],
      analysis: ["analyze", "review", "audit", "inspect"],
      testing: ["test", "verify", "validate"],
      documentation: ["document", "write", "explain"],
      debugging: ["debug", "fix", "resolve"],
      optimization: ["optimize", "improve", "refactor"],
      architecture: ["design", "architecture", "system", "framework"],
    };
  }

  static get EFFORT_MAP() {
    return {
      low: { minHours: 1, maxHours: 2, complexity: 1 },
      medium: { minHours: 2, maxHours: 4, complexity: 2 },
      high: { minHours: 4, maxHours: 8, complexity: 3 },
    };
  }

  constructor(options = {}) {
    super();

    this.options = {
      projectSpecPath: options.projectSpecPath || "./PROJECT_SPEC.json",
      enableHistory: options.enableHistory !== false,
      historyPath: options.historyPath || "./logs/collaboration-history.json",
      enableLogging: options.enableLogging !== false,
      enableStateManagement: options.enableStateManagement !== false,
      statePath: options.statePath || "./logs/collaboration-state.json",
      maxHistorySize:
        options.maxHistorySize ||
        CollaborationCoordinator.DEFAULTS().MAX_HISTORY_SIZE,
      maxActiveCollaborations:
        options.maxActiveCollaborations ||
        CollaborationCoordinator.DEFAULTS().MAX_ACTIVE_COLLABORATIONS,
      collaborationTTL:
        options.collaborationTTL ||
        CollaborationCoordinator.DEFAULTS().COLLABORATION_TTL,
      stateSaveDebounce:
        options.stateSaveDebounce ||
        CollaborationCoordinator.DEFAULTS().STATE_SAVE_DEBOUNCE,
      historySaveDebounce:
        options.historySaveDebounce ||
        CollaborationCoordinator.DEFAULTS().HISTORY_SAVE_DEBOUNCE,
      ...options,
    };

    // Collaboration state
    this.state = {
      activeCollaborations: new Map(),
      collaborationHistory: [],
      agentCapabilities: new Map(),
      lastCoordinationTime: null,
    };

    // Agent selection strategy
    this.agentSelectionStrategy =
      options.agentSelectionStrategy || "best-match";

    // Debounce timer for state saving
    this._stateSaveTimer = null;
    this._historySaveTimer = null;

    // ProjectSpec cache
    this._projectSpecCache = null;
    this._projectSpecCacheTime = 0;
    this._projectSpecCacheTTL = 60000; // 1 minute cache TTL

    // Cleanup interval
    this._cleanupInterval = null;

    // Load initial state
    if (this.options.enableStateManagement) {
      this._loadState();
    }

    // Load collaboration history
    if (this.options.enableHistory) {
      this._loadHistory();
    }

    // Initialize agent capabilities
    this._initializeAgentCapabilities();

    // Start cleanup interval
    this._startCleanupInterval();
  }

  /**
   * Coordinate a collaboration request
   *
   * @param {Object} collaborationRequest - Collaboration request object
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Coordination result with selected agents
   */
  async coordinateCollaboration(collaborationRequest, context = {}) {
    const startTime = Date.now();

    try {
      // Validate collaboration request
      if (
        !collaborationRequest ||
        !collaborationRequest.involvedCLIs ||
        collaborationRequest.involvedCLIs.length < 2
      ) {
        throw new Error("Collaboration request requires at least 2 CLI tools");
      }

      // Log coordination request
      if (this.options.enableLogging) {
        this._logCoordinationRequest(collaborationRequest, context);
      }

      // Read PROJECT_SPEC for context
      const projectSpec = await this._readProjectSpec();

      // Analyze collaboration background and requirements
      const collaborationContext = await this._analyzeCollaborationContext(
        collaborationRequest,
        projectSpec,
        context,
      );

      // Select agents for collaboration
      const selectedAgents = await this._selectAgents(
        collaborationRequest.involvedCLIs,
        collaborationContext,
      );

      // Create collaboration session
      const collaborationSession = {
        id: this._generateCollaborationId(),
        request: collaborationRequest,
        context: collaborationContext,
        agents: selectedAgents,
        status: "active",
        startTime: new Date().toISOString(),
        endTime: null,
        tasks: [],
      };

      // Update state
      this.state.activeCollaborations.set(
        collaborationSession.id,
        collaborationSession,
      );
      this.state.lastCoordinationTime = Date.now();

      // Record collaboration history
      if (this.options.enableHistory) {
        this._recordCollaboration(collaborationSession);
      }

      // Save state (debounced)
      if (this.options.enableStateManagement) {
        this._debouncedSaveState();
      }

      // Emit coordination event
      this.emit("coordinated", {
        session: collaborationSession,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        collaborationId: collaborationSession.id,
        agents: selectedAgents,
        context: collaborationContext,
        estimatedDuration: this._estimateDuration(collaborationContext),
        recommendations: this._generateRecommendations(collaborationContext),
      };
    } catch (error) {
      // Log coordination error
      if (this.options.enableLogging) {
        this._logCoordinationError(collaborationRequest, error, context);
      }

      // Emit error event
      this.emit("error", {
        request: collaborationRequest,
        error: error,
        context: context,
        timestamp: new Date().toISOString(),
      });

      return {
        success: false,
        error: error.message,
        agents: [],
        context: null,
      };
    }
  }

  /**
   * Read PROJECT_SPEC.json for context with caching
   *
   * @returns {Promise<Object>} PROJECT_SPEC data
   * @private
   */
  async _readProjectSpec() {
    const now = Date.now();

    // Return cached version if still valid
    if (
      this._projectSpecCache &&
      now - this._projectSpecCacheTime < this._projectSpecCacheTTL
    ) {
      return this._projectSpecCache;
    }

    try {
      const specPath = path.resolve(this.options.projectSpecPath);

      try {
        await fsPromises.access(specPath);
      } catch {
        if (this.options.enableLogging) {
          console.log(
            `[CollaborationCoordinator] PROJECT_SPEC not found at ${specPath}, using default configuration`,
          );
        }
        const defaultSpec = this._getDefaultProjectSpec();
        this._projectSpecCache = defaultSpec;
        this._projectSpecCacheTime = now;
        return defaultSpec;
      }

      const specContent = await fsPromises.readFile(specPath, "utf8");
      const projectSpec = JSON.parse(specContent);

      // Update cache
      this._projectSpecCache = projectSpec;
      this._projectSpecCacheTime = now;

      if (this.options.enableLogging) {
        console.log(
          `[CollaborationCoordinator] Successfully loaded PROJECT_SPEC from ${specPath}`,
        );
      }

      return projectSpec;
    } catch (error) {
      console.error(
        `[CollaborationCoordinator] Error reading PROJECT_SPEC: ${error.message}`,
      );
      const defaultSpec = this._getDefaultProjectSpec();
      this._projectSpecCache = defaultSpec;
      this._projectSpecCacheTime = now;
      return defaultSpec;
    }
  }

  /**
   * Get default PROJECT_SPEC
   *
   * @returns {Object} Default PROJECT_SPEC
   * @private
   */
  _getDefaultProjectSpec() {
    return {
      project: {
        name: "Stigmergy Multi-Agents",
        description: "Multi-CLI AI collaboration system",
        version: "1.0.0",
      },
      agents: [],
      skills: [],
      collaboration: {
        enabled: true,
        maxConcurrentCollaborations: 5,
        defaultTimeout: 300000, // 5 minutes
      },
    };
  }

  /**
   * Analyze collaboration context and requirements
   * Optimized to cache lowercase task string
   *
   * @param {Object} collaborationRequest - Collaboration request
   * @param {Object} projectSpec - PROJECT_SPEC data
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Collaboration context
   * @private
   */
  async _analyzeCollaborationContext(
    collaborationRequest,
    projectSpec,
    context,
  ) {
    const task = collaborationRequest.task;
    // Cache lowercase version to avoid repeated calls
    const taskLower =
      task && typeof task === "string" ? task.toLowerCase() : "";

    // Compute complexity once and reuse
    const complexity = this._assessComplexityOptimized(taskLower);

    const analysis = {
      taskType: this._classifyTaskTypeOptimized(taskLower),
      complexity: complexity,
      requiredSkills: this._identifyRequiredSkillsOptimized(taskLower),
      estimatedEffort: this._estimateEffortFromComplexity(complexity),
      dependencies: this._identifyDependencies(
        collaborationRequest,
        projectSpec,
      ),
      constraints: this._identifyConstraints(projectSpec),
      priority: this._assessPriority(collaborationRequest, taskLower),
    };

    return analysis;
  }

  /**
   * Classify task type (optimized version with cached keywords)
   *
   * @param {string} taskLower - Lowercase task description
   * @returns {string} Task type
   * @private
   */
  _classifyTaskTypeOptimized(taskLower) {
    if (!taskLower) {
      return "general";
    }

    const taskKeywords = CollaborationCoordinator.TASK_KEYWORDS;
    for (const [type, keywords] of Object.entries(taskKeywords)) {
      if (keywords.some((keyword) => taskLower.includes(keyword))) {
        return type;
      }
    }

    return "general";
  }

  /**
   * Assess task complexity (optimized version with cached indicators)
   *
   * @param {string} taskLower - Lowercase task description
   * @returns {string} Complexity level (low, medium, high)
   * @private
   */
  _assessComplexityOptimized(taskLower) {
    if (!taskLower) {
      return "medium";
    }

    const indicators = CollaborationCoordinator.COMPLEXITY_INDICATORS();
    if (indicators.high.some((indicator) => taskLower.includes(indicator))) {
      return "high";
    } else if (
      indicators.medium.some((indicator) => taskLower.includes(indicator))
    ) {
      return "medium";
    }
    return "low";
  }

  /**
   * Identify required skills (optimized version with pre-lowercased input)
   *
   * @param {string} taskLower - Lowercase task description
   * @returns {Array<string>} List of required skills
   * @private
   */
  _identifyRequiredSkillsOptimized(taskLower) {
    if (!taskLower) {
      return [];
    }

    const skillKeywords = CollaborationCoordinator.SKILL_KEYWORDS();
    const requiredSkills = new Set();

    for (const [skill, keywords] of Object.entries(skillKeywords)) {
      if (keywords.some((keyword) => taskLower.includes(keyword))) {
        requiredSkills.add(skill);
      }
    }

    return Array.from(requiredSkills);
  }

  /**
   * Estimate effort from pre-computed complexity (optimized)
   *
   * @param {string} complexity - Pre-computed complexity level
   * @returns {Object} Effort estimation
   * @private
   */
  _estimateEffortFromComplexity(complexity) {
    const effortMap = CollaborationCoordinator.EFFORT_MAP();
    return effortMap[complexity] || effortMap.medium;
  }

  /**
   * Identify dependencies
   *
   * @param {Object} collaborationRequest - Collaboration request
   * @param {Object} projectSpec - PROJECT_SPEC data
   * @returns {Array<string>} List of dependencies
   * @private
   */
  _identifyDependencies(collaborationRequest, projectSpec) {
    const dependencies = [];

    // Check for dependencies in PROJECT_SPEC
    if (projectSpec.dependencies) {
      dependencies.push(...projectSpec.dependencies);
    }

    // Check for inter-CLI dependencies
    const involvedCLIs = collaborationRequest.involvedCLIs;
    if (involvedCLIs.length > 2) {
      dependencies.push("multi-cli-coordination");
    }

    return dependencies;
  }

  /**
   * Identify constraints
   *
   * @param {Object} projectSpec - PROJECT_SPEC data
   * @returns {Array<string>} List of constraints
   * @private
   */
  _identifyConstraints(projectSpec) {
    const constraints = [];

    if (projectSpec.collaboration) {
      if (projectSpec.collaboration.maxConcurrentCollaborations) {
        constraints.push(
          `max-concurrent: ${projectSpec.collaboration.maxConcurrentCollaborations}`,
        );
      }
      if (projectSpec.collaboration.defaultTimeout) {
        constraints.push(
          `timeout: ${projectSpec.collaboration.defaultTimeout}ms`,
        );
      }
    }

    return constraints;
  }

  /**
   * Assess priority (uses optimized complexity check)
   *
   * @param {Object} collaborationRequest - Collaboration request
   * @param {string} taskLower - Lowercase task description
   * @returns {string} Priority level (high, medium, low)
   * @private
   */
  _assessPriority(collaborationRequest, taskLower) {
    // Check for explicit priority in request
    if (collaborationRequest.priority) {
      return collaborationRequest.priority;
    }

    // Assess priority based on task complexity
    const complexity = this._assessComplexityOptimized(taskLower);

    return complexity; // complexity maps directly to priority
  }

  /**
   * Select agents for collaboration
   *
   * @param {Array<string>} involvedCLIs - List of involved CLI tools
   * @param {Object} collaborationContext - Collaboration context
   * @returns {Promise<Array<Object>>} Selected agents
   * @private
   */
  async _selectAgents(involvedCLIs, collaborationContext) {
    const selectedAgents = [];

    for (const cli of involvedCLIs) {
      const agent = {
        name: cli,
        capabilities: this.state.agentCapabilities.get(cli) || [],
        role: this._assignAgentRole(cli, collaborationContext),
        tasks: [],
        status: "available",
      };

      selectedAgents.push(agent);
    }

    // Sort agents by capability match
    selectedAgents.sort((a, b) => {
      const aMatch = this._calculateCapabilityMatch(a, collaborationContext);
      const bMatch = this._calculateCapabilityMatch(b, collaborationContext);
      return bMatch - aMatch;
    });

    return selectedAgents;
  }

  /**
   * Assign agent role
   *
   * @param {string} cli - CLI tool name
   * @param {Object} collaborationContext - Collaboration context
   * @returns {string} Agent role
   * @private
   */
  _assignAgentRole(cli, collaborationContext) {
    const roleMap = {
      claude: "primary-analyst",
      qwen: "code-generator",
      iflow: "orchestrator",
      codex: "code-completer",
      codebuddy: "assistant",
      qodercli: "reviewer",
    };

    return roleMap[cli] || "contributor";
  }

  /**
   * Calculate capability match score
   *
   * @param {Object} agent - Agent object
   * @param {Object} collaborationContext - Collaboration context
   * @returns {number} Match score (0-1)
   * @private
   */
  _calculateCapabilityMatch(agent, collaborationContext) {
    const requiredSkills = collaborationContext.requiredSkills || [];
    const agentCapabilities = agent.capabilities || [];

    if (requiredSkills.length === 0) {
      return 0.5; // Default score when no requirements
    }

    const matchingSkills = requiredSkills.filter((skill) =>
      agentCapabilities.includes(skill),
    );

    return matchingSkills.length / requiredSkills.length;
  }

  /**
   * Generate collaboration ID
   *
   * @returns {string} Unique collaboration ID
   * @private
   */
  _generateCollaborationId() {
    return `collab-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }

  /**
   * Estimate collaboration duration
   *
   * @param {Object} collaborationContext - Collaboration context
   * @returns {number} Estimated duration in milliseconds
   * @private
   */
  _estimateDuration(collaborationContext) {
    const effort = collaborationContext.estimatedEffort || {
      minHours: 2,
      maxHours: 4,
    };
    const avgHours = (effort.minHours + effort.maxHours) / 2;
    return avgHours * 60 * 60 * 1000; // Convert hours to milliseconds
  }

  /**
   * Generate recommendations
   *
   * @param {Object} collaborationContext - Collaboration context
   * @returns {Array<string>} List of recommendations
   * @private
   */
  _generateRecommendations(collaborationContext) {
    const recommendations = [];

    if (collaborationContext.complexity === "high") {
      recommendations.push("Consider breaking down into smaller sub-tasks");
      recommendations.push("Increase timeout duration for complex tasks");
    }

    if (collaborationContext.dependencies.length > 0) {
      recommendations.push(
        "Ensure all dependencies are available before starting",
      );
    }

    if (collaborationContext.requiredSkills.length > 3) {
      recommendations.push(
        "Consider adding more agents for specialized skills",
      );
    }

    return recommendations;
  }

  /**
   * Initialize agent capabilities
   *
   * @private
   */
  _initializeAgentCapabilities() {
    const defaultCapabilities = {
      claude: ["analysis", "documentation", "architecture", "debugging"],
      qwen: ["programming", "code-generation", "testing"],
      iflow: ["orchestration", "coordination", "workflow"],
      codex: ["code-completion", "programming", "debugging"],
      codebuddy: ["assistance", "documentation", "testing"],
      qodercli: ["review", "analysis", "documentation"],
    };

    for (const [cli, capabilities] of Object.entries(defaultCapabilities)) {
      this.state.agentCapabilities.set(cli, capabilities);
    }
  }

  /**
   * Record collaboration to history
   *
   * @param {Object} collaborationSession - Collaboration session
   * @private
   */
  _recordCollaboration(collaborationSession) {
    const historyEntry = {
      id: collaborationSession.id,
      timestamp: collaborationSession.startTime,
      agents: collaborationSession.agents.map((a) => a.name),
      task: collaborationSession.request.task,
      status: collaborationSession.status,
    };

    this.state.collaborationHistory.push(historyEntry);

    // Keep only configured max entries
    const maxSize = this.options.maxHistorySize;
    if (this.state.collaborationHistory.length > maxSize) {
      this.state.collaborationHistory =
        this.state.collaborationHistory.slice(-maxSize);
    }

    // Debounced save history
    this._debouncedSaveHistory();
  }

  /**
   * Debounced save history
   *
   * @private
   */
  _debouncedSaveHistory() {
    if (this._historySaveTimer) {
      clearTimeout(this._historySaveTimer);
    }
    const debounceTime = this.options.historySaveDebounce;
    this._historySaveTimer = setTimeout(() => {
      this._saveHistoryAsync();
    }, debounceTime);
  }

  /**
   * Debounced save state
   *
   * @private
   */
  _debouncedSaveState() {
    if (this._stateSaveTimer) {
      clearTimeout(this._stateSaveTimer);
    }
    this._stateSaveTimer = setTimeout(() => {
      this._saveStateAsync();
    }, this.options.stateSaveDebounce);
  }

  /**
   * Load collaboration history (sync version for initialization)
   *
   * @private
   */
  _loadHistory() {
    try {
      if (fs.existsSync(this.options.historyPath)) {
        const historyContent = fs.readFileSync(
          this.options.historyPath,
          "utf8",
        );
        this.state.collaborationHistory = JSON.parse(historyContent);
      }
    } catch (error) {
      console.error(
        `[CollaborationCoordinator] Error loading history: ${error.message}`,
      );
    }
  }

  /**
   * Save collaboration history (async version)
   *
   * @private
   */
  async _saveHistoryAsync() {
    try {
      const historyDir = path.dirname(this.options.historyPath);
      await fsPromises.mkdir(historyDir, { recursive: true });

      await fsPromises.writeFile(
        this.options.historyPath,
        JSON.stringify(this.state.collaborationHistory, null, 2),
      );
    } catch (error) {
      console.error(
        `[CollaborationCoordinator] Error saving history: ${error.message}`,
      );
    }
  }

  /**
   * Save collaboration history (sync version for shutdown)
   *
   * @private
   */
  _saveHistory() {
    try {
      const historyDir = path.dirname(this.options.historyPath);
      if (!fs.existsSync(historyDir)) {
        fs.mkdirSync(historyDir, { recursive: true });
      }

      fs.writeFileSync(
        this.options.historyPath,
        JSON.stringify(this.state.collaborationHistory, null, 2),
      );
    } catch (error) {
      console.error(
        `[CollaborationCoordinator] Error saving history: ${error.message}`,
      );
    }
  }

  /**
   * Load state (sync version for initialization)
   *
   * @private
   */
  _loadState() {
    try {
      if (fs.existsSync(this.options.statePath)) {
        const stateContent = fs.readFileSync(this.options.statePath, "utf8");
        const loadedState = JSON.parse(stateContent);

        // Convert agentCapabilities back to Map
        if (loadedState.agentCapabilities) {
          this.state.agentCapabilities = new Map(
            Object.entries(loadedState.agentCapabilities),
          );
        }
      }
    } catch (error) {
      console.error(
        `[CollaborationCoordinator] Error loading state: ${error.message}`,
      );
    }
  }

  /**
   * Save state (async version)
   *
   * @private
   */
  async _saveStateAsync() {
    try {
      const stateDir = path.dirname(this.options.statePath);
      await fsPromises.mkdir(stateDir, { recursive: true });

      const stateToSave = {
        ...this.state,
        agentCapabilities: Object.fromEntries(this.state.agentCapabilities),
      };

      await fsPromises.writeFile(
        this.options.statePath,
        JSON.stringify(stateToSave, null, 2),
      );
    } catch (error) {
      console.error(
        `[CollaborationCoordinator] Error saving state: ${error.message}`,
      );
    }
  }

  /**
   * Save state (sync version for shutdown)
   *
   * @private
   */
  _saveState() {
    try {
      const stateDir = path.dirname(this.options.statePath);
      if (!fs.existsSync(stateDir)) {
        fs.mkdirSync(stateDir, { recursive: true });
      }

      const stateToSave = {
        ...this.state,
        agentCapabilities: Object.fromEntries(this.state.agentCapabilities),
      };

      fs.writeFileSync(
        this.options.statePath,
        JSON.stringify(stateToSave, null, 2),
      );
    } catch (error) {
      console.error(
        `[CollaborationCoordinator] Error saving state: ${error.message}`,
      );
    }
  }

  /**
   * Start cleanup interval for expired collaborations
   *
   * @private
   */
  _startCleanupInterval() {
    this._cleanupInterval = setInterval(() => {
      this._cleanupExpiredCollaborations();
    }, CollaborationCoordinator.DEFAULTS().CLEANUP_INTERVAL);

    // Don't prevent the process from exiting
    if (this._cleanupInterval.unref) {
      this._cleanupInterval.unref();
    }
  }

  /**
   * Cleanup expired collaborations
   *
   * @private
   */
  _cleanupExpiredCollaborations() {
    const now = Date.now();
    const ttl = this.options.collaborationTTL;
    let cleaned = 0;

    for (const [id, collaboration] of this.state.activeCollaborations) {
      const startTime = new Date(collaboration.startTime).getTime();
      if (now - startTime > ttl) {
        this.state.activeCollaborations.delete(id);
        cleaned++;
      }
    }

    if (cleaned > 0 && this.options.enableLogging) {
      console.log(
        `[CollaborationCoordinator] Cleaned up ${cleaned} expired collaborations`,
      );
    }

    // Emit cleanup event
    if (cleaned > 0) {
      this.emit("cleanup", { cleaned, timestamp: new Date().toISOString() });
    }
  }

  /**
   * Destroy the coordinator and cleanup resources
   */
  destroy() {
    // Clear all timers
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
      this._cleanupInterval = null;
    }

    if (this._stateSaveTimer) {
      clearTimeout(this._stateSaveTimer);
      this._stateSaveTimer = null;
    }

    if (this._historySaveTimer) {
      clearTimeout(this._historySaveTimer);
      this._historySaveTimer = null;
    }

    // Save state synchronously before destroying
    this._saveState();
    this._saveHistory();

    // Clear state
    this.state.activeCollaborations.clear();
    this.removeAllListeners();

    if (this.options.enableLogging) {
      console.log(
        "[CollaborationCoordinator] Coordinator destroyed and resources cleaned up",
      );
    }
  }

  /**
   * Log coordination request
   *
   * @param {Object} collaborationRequest - Collaboration request
   * @param {Object} context - Execution context
   * @private
   */
  _logCoordinationRequest(collaborationRequest, context) {
    console.log(
      `[CollaborationCoordinator] Coordinating collaboration request`,
    );
    console.log(
      `  Involved CLIs: ${collaborationRequest.involvedCLIs.join(", ")}`,
    );
    console.log(`  Task: ${collaborationRequest.task}`);
    console.log(`  Confidence: ${collaborationRequest.confidence}`);
  }

  /**
   * Log coordination error
   *
   * @param {Object} collaborationRequest - Collaboration request
   * @param {Error} error - Error object
   * @param {Object} context - Execution context
   * @private
   */
  _logCoordinationError(collaborationRequest, error, context) {
    console.error(
      `[CollaborationCoordinator] Coordination error: ${error.message}`,
    );
    console.error(
      `  Involved CLIs: ${collaborationRequest.involvedCLIs?.join(", ") || "N/A"}`,
    );
  }

  /**
   * Get collaboration statistics
   *
   * @returns {Object} Collaboration statistics
   */
  getStatistics() {
    return {
      totalCollaborations: this.state.collaborationHistory.length,
      activeCollaborations: this.state.activeCollaborations.size,
      lastCoordinationTime: this.state.lastCoordinationTime,
      agentCapabilities: Object.fromEntries(this.state.agentCapabilities),
    };
  }

  /**
   * Get collaboration history
   *
   * @param {number} limit - Maximum number of entries to return
   * @returns {Array<Object>} Collaboration history
   */
  getHistory(limit = 10) {
    return this.state.collaborationHistory.slice(-limit);
  }

  /**
   * Clear collaboration history
   */
  clearHistory() {
    this.state.collaborationHistory = [];
    this._saveHistory();
  }

  /**
   * Update agent capabilities
   *
   * @param {string} agentName - Agent name
   * @param {Array<string>} capabilities - List of capabilities
   */
  updateAgentCapabilities(agentName, capabilities) {
    this.state.agentCapabilities.set(agentName, capabilities);
    this._saveState();
  }
}

module.exports = CollaborationCoordinator;
