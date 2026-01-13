import { TerminalResult } from './EnhancedTerminalManager';

export interface AggregationResult {
  totalTasks: number;
  successfulTasks: number;
  failedTasks: number;
  successRate: number;
  totalDuration: number;
  subtaskDetails: {
    subtaskId: string;
    success: boolean;
    duration: number;
    error?: string;
  }[];
}

export interface ConflictDetectionResult {
  hasConflicts: boolean;
  conflicts: {
    file: string;
    subtasks: string[];
    type: 'modification' | 'deletion' | 'creation';
  }[];
}

export interface Recommendation {
  type: 'retry' | 'manual-review' | 'merge-strategy' | 'skip';
  priority: 'high' | 'medium' | 'low';
  description: string;
  subtaskId?: string;
}

export class ResultAggregator {
  private results: TerminalResult[] = [];

  /**
   * 收集终端结果
   */
  collectResults(results: TerminalResult[]): void {
    this.results.push(...results);
  }

  /**
   * 获取收集的结果
   */
  getCollectedResults(): TerminalResult[] {
    return [...this.results];
  }

  /**
   * 检测冲突
   */
  detectConflicts(): ConflictDetectionResult {
    const fileMap: Map<string, Set<string>> = new Map();
    
    // 分析输出，提取修改的文件
    for (const result of this.results) {
      const modifiedFiles = this.extractModifiedFiles(result.output);
      for (const file of modifiedFiles) {
        if (!fileMap.has(file)) {
          fileMap.set(file, new Set());
        }
        fileMap.get(file)!.add(result.subtaskId);
      }
    }
    
    // 检测冲突
    const conflicts: ConflictDetectionResult['conflicts'] = [];
    for (const [file, subtasks] of fileMap.entries()) {
      if (subtasks.size > 1) {
        conflicts.push({
          file,
          subtasks: Array.from(subtasks),
          type: 'modification'
        });
      }
    }
    
    return {
      hasConflicts: conflicts.length > 0,
      conflicts
    };
  }

  /**
   * 生成摘要
   */
  generateSummary(): AggregationResult {
    const successfulTasks = this.results.filter(r => r.success).length;
    const failedTasks = this.results.filter(r => !r.success).length;
    const totalTasks = this.results.length;
    const successRate = totalTasks > 0 ? successfulTasks / totalTasks : 0;
    const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
    
    const subtaskDetails = this.results.map(r => ({
      subtaskId: r.subtaskId,
      success: r.success,
      duration: r.duration,
      error: r.error
    }));
    
    return {
      totalTasks,
      successfulTasks,
      failedTasks,
      successRate,
      totalDuration,
      subtaskDetails
    };
  }

  /**
   * 生成建议
   */
  generateRecommendations(): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    // 检测冲突
    const conflicts = this.detectConflicts();
    if (conflicts.hasConflicts) {
      for (const conflict of conflicts.conflicts) {
        recommendations.push({
          type: 'manual-review',
          priority: 'high',
          description: `Manual review required for file: ${conflict.file} (modified by ${conflict.subtasks.join(', ')})`,
          subtaskId: conflict.subtasks[0]
        });
      }
    }
    
    // 检查失败的任务
    for (const result of this.results) {
      if (!result.success) {
        recommendations.push({
          type: 'retry',
          priority: 'high',
          description: `Retry failed task: ${result.subtaskId} - ${result.error}`,
          subtaskId: result.subtaskId
        });
      }
    }
    
    // 检查成功率
    const successRate = this.calculateSuccessRate();
    if (successRate < 0.5) {
      recommendations.push({
        type: 'manual-review',
        priority: 'medium',
        description: `Low success rate (${(successRate * 100).toFixed(0)}%), consider reviewing the task strategy`
      });
    }
    
    return recommendations;
  }

  /**
   * 计算成功率
   */
  calculateSuccessRate(): number {
    if (this.results.length === 0) {
      return 0;
    }
    
    const successfulTasks = this.results.filter(r => r.success).length;
    return successfulTasks / this.results.length;
  }

  /**
   * 清除结果
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * 从输出中提取修改的文件
   */
  private extractModifiedFiles(output: string): string[] {
    const files: string[] = [];
    
    // 匹配常见的文件修改模式
    const patterns = [
      /Modified:\s*([^\n]+)/gi,
      /Modified file:\s*([^\n]+)/gi,
      /创建了文件:\s*([^\n]+)/gi,
      /Deleted:\s*([^\n]+)/gi,
      /Changed:\s*([^\n]+)/gi,
      /更新了文件:\s*([^\n]+)/gi
    ];
    
    for (const pattern of patterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      const matches = output.matchAll(regex);
      for (const match of matches) {
        if (match[1]) {
          // 分割逗号分隔的文件列表
          const file = match[1].trim();
          const fileList = file.split(',').map((f: string) => f.trim());
          files.push(...fileList);
        }
      }
    }
    
    return [...new Set(files)]; // 去重
  }
}
