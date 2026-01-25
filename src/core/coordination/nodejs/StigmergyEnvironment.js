/**
 * Stigmergy Environment - 间接协同的环境层
 * 类似蚂蚁的信息素系统，CLI通过环境留下"痕迹"并感知其他CLI的痕迹
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class StigmergyEnvironment {
  constructor(options = {}) {
    this.workDir = options.workDir || process.cwd();
    this.stateDir = path.join(this.workDir, '.stigmergy', 'environment');
    this.stateFile = path.join(this.stateDir, 'state.json');
    this.tracesFile = path.join(this.stateDir, 'traces.jsonl');

    this.state = {
      sessionId: this._generateSessionId(),
      startTime: Date.now(),
      cliAgents: new Map(),      // 注册的CLI代理
      fileModifications: [],      // 文件修改历史
      taskAssignments: [],        // 任务分配记录
      resultsCache: new Map(),    // 结果缓存
      conflicts: [],              // 冲突记录
      metrics: {
        totalTasks: 0,
        completedTasks: 0,
        conflictsDetected: 0,
        collaborations: 0
      }
    };

    this.traces = [];  // 所有CLI留下的痕迹

    this._ensureStateDir();
    this._loadState();
  }

  /**
   * 生成会话ID
   */
  _generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * 确保状态目录存在
   */
  _ensureStateDir() {
    if (!fs.existsSync(this.stateDir)) {
      fs.mkdirSync(this.stateDir, { recursive: true });
    }
  }

  /**
   * 加载之前的状态
   */
  _loadState() {
    if (fs.existsSync(this.stateFile)) {
      try {
        const data = fs.readFileSync(this.stateFile, 'utf8');
        const saved = JSON.parse(data);

        // 先复制基本属性（不包括Map）
        this.state.sessionId = saved.sessionId || this.state.sessionId;
        this.state.startTime = saved.startTime || this.state.startTime;
        this.state.fileModifications = saved.fileModifications || [];
        this.state.taskAssignments = saved.taskAssignments || [];
        this.state.conflicts = saved.conflicts || [];
        this.state.metrics = saved.metrics || this.state.metrics;

        // 然后恢复Map对象（必须在最后，确保它们不被覆盖）
        this.state.cliAgents = new Map(saved.cliAgents || []);
        this.state.resultsCache = new Map(saved.resultsCache || []);
      } catch (error) {
        console.warn('[STIGMERGY] Failed to load state, starting fresh:', error.message);
      }
    }

    // 加载痕迹
    if (fs.existsSync(this.tracesFile)) {
      try {
        const traces = fs.readFileSync(this.tracesFile, 'utf8');
        this.traces = traces.split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));
      } catch (error) {
        console.warn('[STIGMERGY] Failed to load traces:', error.message);
      }
    }
  }

  /**
   * 保存状态
   */
  _saveState() {
    try {
      fs.writeFileSync(this.stateFile, JSON.stringify({
        sessionId: this.state.sessionId,
        startTime: this.state.startTime,
        cliAgents: Array.from(this.state.cliAgents.entries()),
        fileModifications: this.state.fileModifications,
        taskAssignments: this.state.taskAssignments,
        resultsCache: Array.from(this.state.resultsCache.entries()),
        conflicts: this.state.conflicts,
        metrics: this.state.metrics
      }, null, 2), 'utf8');
    } catch (error) {
      console.error('[STIGMERGY] Failed to save state:', error);
    }
  }

  /**
   * 添加痕迹 - CLI在环境中留下的标记
   */
  addTrace(trace) {
    const enrichedTrace = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sessionId: this.state.sessionId,
      ...trace
    };

    this.traces.push(enrichedTrace);

    // 追加到痕迹文件
    try {
      fs.appendFileSync(this.tracesFile, JSON.stringify(enrichedTrace) + '\n', 'utf8');
    } catch (error) {
      console.error('[STIGMERGY] Failed to write trace:', error);
    }

    this.state.metrics.collaborations++;
    this._saveState();

    return enrichedTrace;
  }

  /**
   * 读取痕迹 - 感知其他CLI留下的标记
   */
  readTraces(filter = {}) {
    let filtered = this.traces;

    if (filter.cliName) {
      filtered = filtered.filter(t => t.cliName === filter.cliName);
    }

    if (filter.type) {
      filtered = filtered.filter(t => t.type === filter.type);
    }

    if (filter.filePath) {
      filtered = filtered.filter(t => t.filePath === filter.filePath);
    }

    if (filter.since) {
      filtered = filtered.filter(t => t.timestamp >= filter.since);
    }

    return filtered;
  }

  /**
   * 注册CLI代理
   */
  registerAgent(cliName, capabilities) {
    const agent = {
      name: cliName,
      registeredAt: Date.now(),
      capabilities: capabilities || [],
      status: 'active',
      tasksCompleted: 0
    };

    this.state.cliAgents.set(cliName, agent);
    this._saveState();

    console.log(`[STIGMERGY] Agent registered: ${cliName}`);
    return agent;
  }

  /**
   * 记录文件修改
   */
  recordFileModification(cliName, filePath, operation, metadata = {}) {
    const modification = {
      cliName,
      filePath,
      operation,  // 'created', 'modified', 'deleted'
      timestamp: Date.now(),
      sessionId: this.state.sessionId,
      ...metadata
    };

    this.state.fileModifications.push(modification);

    // 添加痕迹
    this.addTrace({
      type: 'file_modification',
      cliName,
      filePath,
      operation,
      metadata
    });

    return modification;
  }

  /**
   * 检测文件冲突
   */
  detectConflicts() {
    const conflicts = [];
    const fileMap = new Map();

    // 按文件分组修改记录
    this.state.fileModifications.forEach(mod => {
      if (!fileMap.has(mod.filePath)) {
        fileMap.set(mod.filePath, []);
      }
      fileMap.get(mod.filePath).push(mod);
    });

    // 检测同一文件被多个CLI修改的情况
    fileMap.forEach((mods, filePath) => {
      if (mods.length > 1) {
        const uniqueCLIs = new Set(mods.map(m => m.cliName));
        if (uniqueCLIs.size > 1) {
          conflicts.push({
            type: 'concurrent_modification',
            filePath,
            modifiers: Array.from(uniqueCLIs),
            modifications: mods,
            severity: 'warning'
          });
        }
      }
    });

    this.state.conflicts = conflicts;
    this.state.metrics.conflictsDetected = conflicts.length;
    this._saveState();

    return conflicts;
  }

  /**
   * 缓存结果
   */
  cacheResult(taskId, cliName, result) {
    const cacheEntry = {
      taskId,
      cliName,
      result,
      timestamp: Date.now(),
      sessionId: this.state.sessionId
    };

    this.state.resultsCache.set(`${taskId}:${cliName}`, cacheEntry);
    this._saveState();

    return cacheEntry;
  }

  /**
   * 获取缓存的结果
   */
  getCachedResults(taskId) {
    const results = [];
    for (const [key, value] of this.state.resultsCache.entries()) {
      if (key.startsWith(taskId)) {
        results.push(value);
      }
    }
    return results;
  }

  /**
   * 分配任务
   */
  assignTask(taskId, cliName, taskDetails) {
    const assignment = {
      taskId,
      cliName,
      assignedAt: Date.now(),
      status: 'assigned',
      taskDetails
    };

    this.state.taskAssignments.push(assignment);
    this.state.metrics.totalTasks++;
    this._saveState();

    return assignment;
  }

  /**
   * 标记任务完成
   */
  completeTask(taskId, cliName, result) {
    const assignment = this.state.taskAssignments.find(
      a => a.taskId === taskId && a.cliName === cliName
    );

    if (assignment) {
      assignment.status = 'completed';
      assignment.completedAt = Date.now();
      assignment.result = result;

      // 更新代理统计
      const agent = this.state.cliAgents.get(cliName);
      if (agent) {
        agent.tasksCompleted++;
      }

      this.state.metrics.completedTasks++;
      this._saveState();

      return assignment;
    }

    return null;
  }

  /**
   * 获取环境状态摘要
   */
  getSummary() {
    return {
      sessionId: this.state.sessionId,
      uptime: Date.now() - this.state.startTime,
      agents: Array.from(this.state.cliAgents.values()).map(agent => ({
        name: agent.name,
        capabilities: agent.capabilities,
        tasksCompleted: agent.tasksCompleted,
        status: agent.status
      })),
      recentTraces: this.traces.slice(-10),
      conflicts: this.state.conflicts,
      metrics: this.state.metrics
    };
  }

  /**
   * 清理过期状态
   */
  cleanup(maxAge = 86400000) {  // 默认24小时
    const now = Date.now();
    const cutoff = now - maxAge;

    // 清理旧痕迹
    this.traces = this.traces.filter(t => t.timestamp > cutoff);

    // 清理旧修改记录
    this.state.fileModifications = this.state.fileModifications.filter(m => m.timestamp > cutoff);

    // 清理旧任务分配
    this.state.taskAssignments = this.state.taskAssignments.filter(t => t.assignedAt > cutoff);

    this._saveState();
    console.log(`[STIGMERGY] Cleaned up traces older than ${maxAge}ms`);
  }

  /**
   * 重置环境
   */
  reset() {
    this.state = {
      sessionId: this._generateSessionId(),
      startTime: Date.now(),
      cliAgents: new Map(),
      fileModifications: [],
      taskAssignments: [],
      resultsCache: new Map(),
      conflicts: [],
      metrics: {
        totalTasks: 0,
        completedTasks: 0,
        conflictsDetected: 0,
        collaborations: 0
      }
    };

    this.traces = [];
    this._saveState();

    console.log('[STIGMERGY] Environment reset');
  }
}

module.exports = StigmergyEnvironment;
