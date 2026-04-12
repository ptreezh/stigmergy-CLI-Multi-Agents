/**
 * Soul状态管理器
 * 每个项目有独立的Soul状态目录 (.soul/)
 */

const path = require('path');
const fs = require('fs');

class SoulStateManager {
  /**
   * @param {string} projectRoot - 项目根目录
   */
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.soulDir = path.join(projectRoot, '.soul');
  }

  /**
   * 获取Soul目录
   * @returns {string} Soul目录路径
   */
  getSoulDir() {
    return this.soulDir;
  }

  /**
   * 初始化Soul状态目录
   * @returns {Object} 初始化结果
   */
  initSoulState() {
    try {
      // 检查是否已存在
      if (fs.existsSync(this.soulDir)) {
        return {
          success: true,
          message: 'Soul状态目录已存在',
          soulDir: this.soulDir
        };
      }

      // 创建目录结构
      fs.mkdirSync(this.soulDir, { recursive: true });
      fs.mkdirSync(path.join(this.soulDir, 'memory'), { recursive: true });
      fs.mkdirSync(path.join(this.soulDir, 'evolution'), { recursive: true });
      fs.mkdirSync(path.join(this.soulDir, 'reflection'), { recursive: true });
      fs.mkdirSync(path.join(this.soulDir, 'skills'), { recursive: true });

      // 创建默认状态文件
      const defaultState = {
        soulName: null,
        version: '0.0.0',
        lastActive: null,
        evolutionCount: 0,
        reflectionCount: 0,
        initializedAt: new Date().toISOString()
      };

      fs.writeFileSync(
        path.join(this.soulDir, 'state.json'),
        JSON.stringify(defaultState, null, 2)
      );

      return {
        success: true,
        message: 'Soul状态目录初始化成功',
        soulDir: this.soulDir
      };
    } catch (error) {
      return {
        success: false,
        error: `初始化失败: ${error.message}`
      };
    }
  }

  /**
   * 保存Soul状态
   * @param {Object} state - 状态对象
   * @returns {Object} 保存结果
   */
  saveState(state) {
    try {
      const statePath = path.join(this.soulDir, 'state.json');
      
      // 更新最后活跃时间
      state.lastActive = new Date().toISOString();

      fs.writeFileSync(statePath, JSON.stringify(state, null, 2));

      return {
        success: true,
        message: '状态保存成功'
      };
    } catch (error) {
      return {
        success: false,
        error: `保存失败: ${error.message}`
      };
    }
  }

  /**
   * 加载Soul状态
   * @returns {Object} 状态对象
   */
  loadState() {
    const statePath = path.join(this.soulDir, 'state.json');

    try {
      if (!fs.existsSync(statePath)) {
        return this._getDefaultState();
      }

      const content = fs.readFileSync(statePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return this._getDefaultState();
    }
  }

  /**
   * 保存记忆
   * @param {Object} memory - 记忆对象
   * @param {string} type - 记忆类型 (short-term, mid-term, long-term)
   * @returns {Object} 保存结果
   */
  saveMemory(memory, type = 'short-term') {
    try {
      const memoryFile = path.join(
        this.soulDir,
        'memory',
        `${type}.jsonl`
      );

      // 追加写入
      const line = JSON.stringify(memory) + '\n';
      fs.appendFileSync(memoryFile, line);

      return {
        success: true,
        message: '记忆保存成功'
      };
    } catch (error) {
      return {
        success: false,
        error: `保存记忆失败: ${error.message}`
      };
    }
  }

  /**
   * 获取记忆列表
   * @param {string} type - 记忆类型
   * @returns {Array} 记忆列表
   */
  getMemories(type = 'short-term') {
    const memoryFile = path.join(this.soulDir, 'memory', `${type}.jsonl`);

    try {
      if (!fs.existsSync(memoryFile)) {
        return [];
      }

      const content = fs.readFileSync(memoryFile, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      return lines.map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  /**
   * 记录进化事件
   * @param {Object} evolution - 进化对象
   * @returns {Object} 记录结果
   */
  recordEvolution(evolution) {
    try {
      const logFile = path.join(this.soulDir, 'evolution', 'evolution-log.jsonl');
      
      const line = JSON.stringify(evolution) + '\n';
      fs.appendFileSync(logFile, line);

      // 更新进化计数
      const state = this.loadState();
      state.evolutionCount = (state.evolutionCount || 0) + 1;
      this.saveState(state);

      return {
        success: true,
        message: '进化记录成功'
      };
    } catch (error) {
      return {
        success: false,
        error: `记录进化失败: ${error.message}`
      };
    }
  }

  /**
   * 获取进化历史
   * @returns {Array} 进化历史列表
   */
  getEvolutionHistory() {
    const logFile = path.join(this.soulDir, 'evolution', 'evolution-log.jsonl');

    try {
      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      return lines.map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  /**
   * 记录反思事件
   * @param {Object} reflection - 反思对象
   * @returns {Object} 记录结果
   */
  recordReflection(reflection) {
    try {
      const logFile = path.join(this.soulDir, 'reflection', 'reflection-log.jsonl');
      
      const line = JSON.stringify(reflection) + '\n';
      fs.appendFileSync(logFile, line);

      // 更新反思计数
      const state = this.loadState();
      state.reflectionCount = (state.reflectionCount || 0) + 1;
      this.saveState(state);

      return {
        success: true,
        message: '反思记录成功'
      };
    } catch (error) {
      return {
        success: false,
        error: `记录反思失败: ${error.message}`
      };
    }
  }

  /**
   * 获取反思历史
   * @returns {Array} 反思历史列表
   */
  getReflectionHistory() {
    const logFile = path.join(this.soulDir, 'reflection', 'reflection-log.jsonl');

    try {
      if (!fs.existsSync(logFile)) {
        return [];
      }

      const content = fs.readFileSync(logFile, 'utf-8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      return lines.map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  /**
   * 获取默认状态
   * @private
   * @returns {Object} 默认状态
   */
  _getDefaultState() {
    return {
      soulName: null,
      version: '0.0.0',
      lastActive: null,
      evolutionCount: 0,
      reflectionCount: 0
    };
  }
}

module.exports = {
  SoulStateManager
};
