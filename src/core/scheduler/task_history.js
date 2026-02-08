/**
 * TaskHistory - 任务历史记录
 */

const fs = require("fs");
const path = require("path");

class TaskHistory {
  constructor(config = {}) {
    this.dataDir =
      config.dataDir || path.join(process.cwd(), ".stigmergy", "scheduler");
    this.maxHistory = config.maxHistory || 100;
    this.historyFile = path.join(this.dataDir, "history.json");
  }

  add(entry) {
    const history = this.load();
    history.unshift({
      ...entry,
      timestamp: new Date().toISOString(),
    });

    if (history.length > this.maxHistory) {
      history.splice(this.maxHistory);
    }

    this.save(history);
  }

  load() {
    if (!fs.existsSync(this.historyFile)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(this.historyFile, "utf8"));
    } catch {
      return [];
    }
  }

  save(data) {
    fs.writeFileSync(this.historyFile, JSON.stringify(data, null, 2));
  }

  get(taskId = null, limit = 50) {
    const history = this.load();
    if (taskId) {
      return history.filter((h) => h.taskId === taskId).slice(0, limit);
    }
    return history.slice(0, limit);
  }

  clear() {
    if (fs.existsSync(this.historyFile)) {
      fs.unlinkSync(this.historyFile);
    }
  }
}

module.exports = TaskHistory;
