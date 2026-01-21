import fs from 'fs/promises';
import path from 'path';
import { OrchestratedTask, SharedContext } from '../types';
import { TaskPlanningFilesManager } from '../managers/TaskPlanningFiles';

export interface HistoryEvent {
  id: string;
  timestamp: Date;
  type: string;
  data: any;
}

export class ResumeSessionIntegration {
  private sessionsDir: string = '.stigmergy/coordination/sessions';
  private historyDir: string = '.stigmergy/coordination/history';
  private planningFilesManager: TaskPlanningFilesManager = new TaskPlanningFilesManager();

  /**
   * 保存任务状态
   */
  async saveTaskState(taskId: string, task: OrchestratedTask): Promise<void> {
    const sessionFile = path.join(this.sessionsDir, `${taskId}.json`);
    
    const sessionData = {
      taskId,
      task,
      savedAt: new Date(),
      status: task.status
    };
    
    await fs.mkdir(this.sessionsDir, { recursive: true });
    await fs.writeFile(sessionFile, JSON.stringify(sessionData, null, 2));
    
    // 保存三文件系统状态（如果存在）
    try {
      const taskState = await this.planningFilesManager.getTaskState(taskId);
      const planningStateFile = path.join(this.sessionsDir, `${taskId}-planning.json`);
      await fs.writeFile(planningStateFile, JSON.stringify(taskState, null, 2));
    } catch (error) {
      // 如果三文件系统不存在，忽略错误
      console.debug('No planning files to save for task:', taskId);
    }
  }

  /**
   * 恢复任务状态
   */
  async restoreTaskState(taskId: string): Promise<OrchestratedTask | null> {
    const sessionFile = path.join(this.sessionsDir, `${taskId}.json`);
    
    try {
      const content = await fs.readFile(sessionFile, 'utf8');
      const sessionData = JSON.parse(content);
      
      const task = sessionData.task as OrchestratedTask;
      
      // 尝试恢复三文件系统状态
      try {
        const planningStateFile = path.join(this.sessionsDir, `${taskId}-planning.json`);
        const planningContent = await fs.readFile(planningStateFile, 'utf8');
        const planningState = JSON.parse(planningContent);
        
        // 将规划状态添加到任务对象中
        (task as any).currentPhase = planningState.currentPhase;
        (task as any).completedPhases = planningState.completedPhases;
        (task as any).findings = planningState.findings;
        (task as any).progress = planningState.progress;
        (task as any).errors = planningState.errors;
      } catch (error) {
        // 如果三文件系统状态不存在，忽略错误
        console.debug('No planning files to restore for task:', taskId);
      }
      
      return task;
    } catch (error) {
      return null;
    }
  }

  /**
   * 传递上下文到子任务
   */
  async passContextToSubtask(
    taskId: string,
    subtaskId: string,
    context: SharedContext
  ): Promise<void> {
    const contextFile = path.join(
      this.sessionsDir,
      `${taskId}-${subtaskId}-context.json`
    );
    
    await fs.mkdir(this.sessionsDir, { recursive: true });
    await fs.writeFile(contextFile, JSON.stringify(context, null, 2));
  }

  /**
   * 收集子任务上下文
   */
  async collectSubtaskContext(
    taskId: string,
    subtaskId: string
  ): Promise<SharedContext> {
    const contextFile = path.join(
      this.sessionsDir,
      `${taskId}-${subtaskId}-context.json`
    );
    
    try {
      const content = await fs.readFile(contextFile, 'utf8');
      return JSON.parse(content) as SharedContext;
    } catch (error) {
      throw new Error(`Context not found for ${taskId}/${subtaskId}`);
    }
  }

  /**
   * 记录历史
   */
  async recordHistory(taskId: string, event: HistoryEvent): Promise<void> {
    const historyFile = path.join(this.historyDir, `${taskId}.jsonl`);
    
    await fs.mkdir(this.historyDir, { recursive: true });
    await fs.appendFile(
      historyFile,
      JSON.stringify(event) + '\n',
      'utf8'
    );
  }

  /**
   * 查询历史
   */
  async queryHistory(taskId: string): Promise<HistoryEvent[]> {
    const historyFile = path.join(this.historyDir, `${taskId}.jsonl`);
    
    try {
      const content = await fs.readFile(historyFile, 'utf8');
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (error) {
      return [];
    }
  }

  /**
   * 生成恢复命令
   */
  async generateResumeCommand(taskId: string): Promise<string> {
    const task = await this.restoreTaskState(taskId);
    
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    
    return `stigmergy coord resume ${taskId}`;
  }

  /**
   * 列出可恢复的任务
   */
  async listResumableTasks(): Promise<string[]> {
    try {
      const files = await fs.readdir(this.sessionsDir);
      return files
        .filter(f => f.endsWith('.json'))
        .map(f => f.replace('.json', ''));
    } catch (error) {
      return [];
    }
  }

  /**
   * 清理会话
   */
  async cleanupSession(taskId: string): Promise<void> {
    const sessionFile = path.join(this.sessionsDir, `${taskId}.json`);
    const historyFile = path.join(this.historyDir, `${taskId}.jsonl`);
    
    await fs.unlink(sessionFile).catch(() => {});
    await fs.unlink(historyFile).catch(() => {});
  }
}