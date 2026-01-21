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

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');

class CollaborationCoordinator extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.options = {
      projectSpecPath: options.projectSpecPath || './PROJECT_SPEC.json',
      enableHistory: options.enableHistory !== false,
      historyPath: options.historyPath || './logs/collaboration-history.json',
      enableLogging: options.enableLogging !== false,
      enableStateManagement: options.enableStateManagement !== false,
      statePath: options.statePath || './logs/collaboration-state.json',
      ...options
    };
    
    // Collaboration state
    this.state = {
      activeCollaborations: new Map(),
      collaborationHistory: [],
      agentCapabilities: new Map(),
      lastCoordinationTime: null
    };
    
    // Agent selection strategy
    this.agentSelectionStrategy = options.agentSelectionStrategy || 'best-match';
    
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
      if (!collaborationRequest || !collaborationRequest.involvedCLIs || collaborationRequest.involvedCLIs.length < 2) {
        throw new Error('Collaboration request requires at least 2 CLI tools');
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
        context
      );
      
      // Select agents for collaboration
      const selectedAgents = await this._selectAgents(
        collaborationRequest.involvedCLIs,
        collaborationContext
      );
      
      // Create collaboration session
      const collaborationSession = {
        id: this._generateCollaborationId(),
        request: collaborationRequest,
        context: collaborationContext,
        agents: selectedAgents,
        status: 'active',
        startTime: new Date().toISOString(),
        endTime: null,
        tasks: []
      };
      
      // Update state
      this.state.activeCollaborations.set(collaborationSession.id, collaborationSession);
      this.state.lastCoordinationTime = Date.now();
      
      // Record collaboration history
      if (this.options.enableHistory) {
        this._recordCollaboration(collaborationSession);
      }
      
      // Save state
      if (this.options.enableStateManagement) {
        this._saveState();
      }
      
      // Emit coordination event
      this.emit('coordinated', {
        session: collaborationSession,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: true,
        collaborationId: collaborationSession.id,
        agents: selectedAgents,
        context: collaborationContext,
        estimatedDuration: this._estimateDuration(collaborationContext),
        recommendations: this._generateRecommendations(collaborationContext)
      };
      
    } catch (error) {
      // Log coordination error
      if (this.options.enableLogging) {
        this._logCoordinationError(collaborationRequest, error, context);
      }
      
      // Emit error event
      this.emit('error', {
        request: collaborationRequest,
        error: error,
        context: context,
        timestamp: new Date().toISOString()
      });
      
      return {
        success: false,
        error: error.message,
        agents: [],
        context: null
      };
    }
  }

  /**
   * Read PROJECT_SPEC.json for context
   * 
   * @returns {Promise<Object>} PROJECT_SPEC data
   * @private
   */
  async _readProjectSpec() {
    try {
      const specPath = path.resolve(this.options.projectSpecPath);
      
      if (!fs.existsSync(specPath)) {
        if (this.options.enableLogging) {
          console.log(`[CollaborationCoordinator] PROJECT_SPEC not found at ${specPath}, using default configuration`);
        }
        return this._getDefaultProjectSpec();
      }
      
      const specContent = fs.readFileSync(specPath, 'utf8');
      const projectSpec = JSON.parse(specContent);
      
      if (this.options.enableLogging) {
        console.log(`[CollaborationCoordinator] Successfully loaded PROJECT_SPEC from ${specPath}`);
      }
      
      return projectSpec;
      
    } catch (error) {
      console.error(`[CollaborationCoordinator] Error reading PROJECT_SPEC: ${error.message}`);
      return this._getDefaultProjectSpec();
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
        name: 'Stigmergy Multi-Agents',
        description: 'Multi-CLI AI collaboration system',
        version: '1.0.0'
      },
      agents: [],
      skills: [],
      collaboration: {
        enabled: true,
        maxConcurrentCollaborations: 5,
        defaultTimeout: 300000 // 5 minutes
      }
    };
  }

  /**
   * Analyze collaboration context and requirements
   * 
   * @param {Object} collaborationRequest - Collaboration request
   * @param {Object} projectSpec - PROJECT_SPEC data
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} Collaboration context
   * @private
   */
  async _analyzeCollaborationContext(collaborationRequest, projectSpec, context) {
    const analysis = {
      taskType: this._classifyTaskType(collaborationRequest.task),
      complexity: this._assessComplexity(collaborationRequest.task),
      requiredSkills: this._identifyRequiredSkills(collaborationRequest.task),
      estimatedEffort: this._estimateEffort(collaborationRequest.task),
      dependencies: this._identifyDependencies(collaborationRequest, projectSpec),
      constraints: this._identifyConstraints(projectSpec),
      priority: this._assessPriority(collaborationRequest, context)
    };
    
    return analysis;
  }

  /**
   * Classify task type
   * 
   * @param {string} task - Task description
   * @returns {string} Task type
   * @private
   */
  _classifyTaskType(task) {
    const taskKeywords = {
      'code-generation': ['write', 'create', 'generate', 'implement', 'develop'],
      'code-analysis': ['analyze', 'review', 'audit', 'inspect', 'examine'],
      'code-optimization': ['optimize', 'improve', 'refactor', 'enhance'],
      'testing': ['test', 'verify', 'validate', 'check'],
      'documentation': ['document', 'write docs', 'create documentation'],
      'debugging': ['debug', 'fix', 'resolve', 'troubleshoot'],
      'deployment': ['deploy', 'release', 'publish'],
      'general': []
    };
    
    const taskLower = task.toLowerCase();
    
    for (const [type, keywords] of Object.entries(taskKeywords)) {
      if (keywords.some(keyword => taskLower.includes(keyword))) {
        return type;
      }
    }
    
    return 'general';
  }

  /**
   * Assess task complexity
   * 
   * @param {string} task - Task description
   * @returns {string} Complexity level (low, medium, high)
   * @private
   */
  _assessComplexity(task) {
    const complexityIndicators = {
      high: ['architecture', 'system', 'framework', 'integration', 'multiple', 'complex'],
      medium: ['feature', 'module', 'component', 'function', 'class'],
      low: ['fix', 'update', 'change', 'small', 'simple']
    };
    
    const taskLower = task.toLowerCase();
    
    if (complexityIndicators.high.some(indicator => taskLower.includes(indicator))) {
      return 'high';
    } else if (complexityIndicators.medium.some(indicator => taskLower.includes(indicator))) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Identify required skills
   * 
   * @param {string} task - Task description
   * @returns {Array<string>} List of required skills
   * @private
   */
  _identifyRequiredSkills(task) {
    const skillKeywords = {
      'programming': ['code', 'function', 'class', 'algorithm', 'programming'],
      'analysis': ['analyze', 'review', 'audit', 'inspect'],
      'testing': ['test', 'verify', 'validate'],
      'documentation': ['document', 'write', 'explain'],
      'debugging': ['debug', 'fix', 'resolve'],
      'optimization': ['optimize', 'improve', 'refactor'],
      'architecture': ['design', 'architecture', 'system', 'framework']
    };
    
    const taskLower = task.toLowerCase();
    const requiredSkills = new Set();
    
    for (const [skill, keywords] of Object.entries(skillKeywords)) {
      if (keywords.some(keyword => taskLower.includes(keyword))) {
        requiredSkills.add(skill);
      }
    }
    
    return Array.from(requiredSkills);
  }

  /**
   * Estimate effort
   * 
   * @param {string} task - Task description
   * @returns {Object} Effort estimation
   * @private
   */
  _estimateEffort(task) {
    const complexity = this._assessComplexity(task);
    
    const effortMap = {
      low: { hours: 1-2, complexity: 1 },
      medium: { hours: 2-4, complexity: 2 },
      high: { hours: 4-8, complexity: 3 }
    };
    
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
      dependencies.push('multi-cli-coordination');
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
        constraints.push(`max-concurrent: ${projectSpec.collaboration.maxConcurrentCollaborations}`);
      }
      if (projectSpec.collaboration.defaultTimeout) {
        constraints.push(`timeout: ${projectSpec.collaboration.defaultTimeout}ms`);
      }
    }
    
    return constraints;
  }

  /**
   * Assess priority
   * 
   * @param {Object} collaborationRequest - Collaboration request
   * @param {Object} context - Execution context
   * @returns {string} Priority level (high, medium, low)
   * @private
   */
  _assessPriority(collaborationRequest, context) {
    // Check for explicit priority in context
    if (context.priority) {
      return context.priority;
    }
    
    // Assess priority based on task complexity and urgency
    const complexity = this._assessComplexity(collaborationRequest.task);
    
    if (complexity === 'high') {
      return 'high';
    } else if (complexity === 'medium') {
      return 'medium';
    } else {
      return 'low';
    }
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
        status: 'available'
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
      'claude': 'primary-analyst',
      'qwen': 'code-generator',
      'iflow': 'orchestrator',
      'codex': 'code-completer',
      'codebuddy': 'assistant',
      'qodercli': 'reviewer'
    };
    
    return roleMap[cli] || 'contributor';
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
    
    const matchingSkills = requiredSkills.filter(skill => 
      agentCapabilities.includes(skill)
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
    return `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Estimate collaboration duration
   * 
   * @param {Object} collaborationContext - Collaboration context
   * @returns {number} Estimated duration in milliseconds
   * @private
   */
  _estimateDuration(collaborationContext) {
    const effort = collaborationContext.estimatedEffort || { hours: 2 };
    return effort.hours * 60 * 60 * 1000; // Convert hours to milliseconds
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
    
    if (collaborationContext.complexity === 'high') {
      recommendations.push('Consider breaking down into smaller sub-tasks');
      recommendations.push('Increase timeout duration for complex tasks');
    }
    
    if (collaborationContext.dependencies.length > 0) {
      recommendations.push('Ensure all dependencies are available before starting');
    }
    
    if (collaborationContext.requiredSkills.length > 3) {
      recommendations.push('Consider adding more agents for specialized skills');
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
      'claude': ['analysis', 'documentation', 'architecture', 'debugging'],
      'qwen': ['programming', 'code-generation', 'testing'],
      'iflow': ['orchestration', 'coordination', 'workflow'],
      'codex': ['code-completion', 'programming', 'debugging'],
      'codebuddy': ['assistance', 'documentation', 'testing'],
      'qodercli': ['review', 'analysis', 'documentation']
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
      agents: collaborationSession.agents.map(a => a.name),
      task: collaborationSession.request.task,
      status: collaborationSession.status
    };
    
    this.state.collaborationHistory.push(historyEntry);
    
    // Keep only last 100 entries
    if (this.state.collaborationHistory.length > 100) {
      this.state.collaborationHistory = this.state.collaborationHistory.slice(-100);
    }
    
    // Save history
    this._saveHistory();
  }

  /**
   * Load collaboration history
   * 
   * @private
   */
  _loadHistory() {
    try {
      if (fs.existsSync(this.options.historyPath)) {
        const historyContent = fs.readFileSync(this.options.historyPath, 'utf8');
        this.state.collaborationHistory = JSON.parse(historyContent);
      }
    } catch (error) {
      console.error(`[CollaborationCoordinator] Error loading history: ${error.message}`);
    }
  }

  /**
   * Save collaboration history
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
        JSON.stringify(this.state.collaborationHistory, null, 2)
      );
    } catch (error) {
      console.error(`[CollaborationCoordinator] Error saving history: ${error.message}`);
    }
  }

  /**
   * Load state
   * 
   * @private
   */
  _loadState() {
    try {
      if (fs.existsSync(this.options.statePath)) {
        const stateContent = fs.readFileSync(this.options.statePath, 'utf8');
        const loadedState = JSON.parse(stateContent);
        
        // Convert agentCapabilities back to Map
        if (loadedState.agentCapabilities) {
          this.state.agentCapabilities = new Map(Object.entries(loadedState.agentCapabilities));
        }
      }
    } catch (error) {
      console.error(`[CollaborationCoordinator] Error loading state: ${error.message}`);
    }
  }

  /**
   * Save state
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
        agentCapabilities: Object.fromEntries(this.state.agentCapabilities)
      };
      
      fs.writeFileSync(
        this.options.statePath,
        JSON.stringify(stateToSave, null, 2)
      );
    } catch (error) {
      console.error(`[CollaborationCoordinator] Error saving state: ${error.message}`);
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
    console.log(`[CollaborationCoordinator] Coordinating collaboration request`);
    console.log(`  Involved CLIs: ${collaborationRequest.involvedCLIs.join(', ')}`);
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
    console.error(`[CollaborationCoordinator] Coordination error: ${error.message}`);
    console.error(`  Involved CLIs: ${collaborationRequest.involvedCLIs?.join(', ') || 'N/A'}`);
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
      agentCapabilities: Object.fromEntries(this.state.agentCapabilities)
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