import fs from 'fs/promises';
import path from 'path';

export interface TaskPlanUpdate {
  currentPhase?: string;
  phases?: Phase[];
  keyQuestions?: string[];
  decisions?: Decision[];
  errors?: ErrorEntry[];
  notes?: string[];
}

export interface Finding {
  category: 'requirement' | 'research' | 'decision' | 'issue' | 'resource';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ProgressEntry {
  phase: string;
  status: 'in_progress' | 'completed' | 'failed';
  action: string;
  files?: string[];
  timestamp: Date;
}

export interface ErrorEntry {
  error: string;
  attempt: number;
  resolution?: string;
  timestamp: Date;
}

export interface Phase {
  name: string;
  tasks: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

export interface Decision {
  decision: string;
  rationale: string;
  timestamp: Date;
}

export interface TaskPlanningFiles {
  taskPlan: string;
  findings: string;
  progress: string;
}

export interface TaskState {
  currentPhase: string;
  completedPhases: string[];
  findings: Finding[];
  progress: ProgressEntry[];
  errors: ErrorEntry[];
}

export class TaskPlanningFilesManager {
  private baseDir: string;

  constructor(baseDir: string = '.stigmergy/planning-files') {
    this.baseDir = baseDir;
  }

  /**
   * 初始化任务的三文件系统
   */
  async initializeTask(
    taskId: string,
    description: string,
    worktreePath: string
  ): Promise<TaskPlanningFiles> {
    const taskDir = path.join(this.baseDir, taskId);
    
    // 确保目录存在
    await fs.mkdir(taskDir, { recursive: true });
    
    // 创建三文件
    const taskPlanPath = path.join(taskDir, 'task_plan.md');
    const findingsPath = path.join(taskDir, 'findings.md');
    const progressPath = path.join(taskDir, 'progress.md');
    
    await this.createDefaultTaskPlan(taskPlanPath, description);
    await this.createDefaultFindings(findingsPath);
    await this.createDefaultProgress(progressPath);
    
    return {
      taskPlan: taskPlanPath,
      findings: findingsPath,
      progress: progressPath
    };
  }

  /**
   * 创建默认的任务规划文件
   */
  private async createDefaultTaskPlan(filePath: string, description: string): Promise<void> {
    const content = `# Task Plan: ${description}

## Goal
[One sentence describing the end state]

## Current Phase
Phase 1

## Phases

### Phase 1: Requirements & Discovery
- [ ] Understand user intent
- [ ] Identify constraints and requirements
- [ ] Document findings in findings.md
- **Status:** in_progress

### Phase 2: Planning & Structure
- [ ] Define technical approach
- [ ] Create project structure if needed
- [ ] Document decisions with rationale
- **Status:** pending

### Phase 3: Implementation
- [ ] Execute the plan step by step
- [ ] Write code to files before executing
- [ ] Test incrementally
- **Status:** pending

### Phase 4: Testing & Verification
- [ ] Verify all requirements met
- [ ] Document test results in progress.md
- [ ] Fix any issues found
- **Status:** pending

### Phase 5: Delivery
- [ ] Review all output files
- [ ] Ensure deliverables are complete
- [ ] Deliver to user
- **Status:** pending

## Key Questions
1. [Question to answer]
2. [Question to answer]

## Decisions Made
| Decision | Rationale |
|----------|-----------|
|          |           |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
|       | 1       |            |

## Notes
- Update phase status as you progress: pending → in_progress → complete
- Re-read this plan before major decisions (attention manipulation)
- Log ALL errors - they help avoid repetition
`;
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * 创建默认的研究发现文件
   */
  private async createDefaultFindings(filePath: string): Promise<void> {
    const content = `# Findings & Decisions

## Requirements
<!-- Captured from user request -->
-

## Research Findings
<!-- Key discoveries during exploration -->
-

## Technical Decisions
<!-- Decisions made with rationale -->
| Decision | Rationale |
|----------|-----------|
|          |           |

## Issues Encountered
<!-- Errors and how they were resolved -->
| Issue | Resolution |
|-------|------------|
|       |            |

## Resources
<!-- URLs, file paths, API references -->
-

## Visual/Browser Findings
<!-- CRITICAL: Update after every 2 view/browser operations -->
<!-- Multimodal content must be captured as text immediately -->
-

---
*Update this file after every 2 view/browser/search operations*
*This prevents visual information from being lost*
`;
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * 创建默认的进度日志文件
   */
  private async createDefaultProgress(filePath: string): Promise<void> {
    const content = `# Progress Log

## Session: ${new Date().toISOString()}

### Phase 1: [Title]
- **Status:** in_progress
- **Started:** ${new Date().toISOString()}
- Actions taken:
  -
- Files created/modified:
  -

### Phase 2: [Title]
- **Status:** pending
- Actions taken:
  -
- Files created/modified:
  -

## Test Results

| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
|      |       |          |        |        |

## Error Log

<!-- Keep ALL errors - they help avoid repetition -->
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
|           |       | 1       |            |

## 5-Question Reboot Check
<!-- If you can answer these, context is solid -->
| Question | Answer |
|----------|--------|
| Where am I? | Phase X |
| Where am I going? | Remaining phases |
| What's the goal? | [goal statement] |
| What have I learned? | See findings.md |
| What have I done? | See above |

---
*Update after completing each phase or encountering errors*
`;
    await fs.writeFile(filePath, content, 'utf8');
  }

  /**
   * 更新任务规划文件
   */
  async updateTaskPlan(taskId: string, updates: TaskPlanUpdate): Promise<void> {
    const taskPlanPath = path.join(this.baseDir, taskId, 'task_plan.md');
    let content = await fs.readFile(taskPlanPath, 'utf8');
    
    // 更新当前阶段
    if (updates.currentPhase) {
      content = content.replace(
        /## Current Phase\n.+/,
        `## Current Phase\n${updates.currentPhase}`
      );
    }
    
    // 更新阶段状态
    if (updates.phases) {
      for (const phase of updates.phases) {
        const escapedName = phase.name.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&');
        const phaseRegex = new RegExp(
          `### Phase [0-9]+: ${escapedName}.*?- \\*\\*Status:\\*\\* (pending|in_progress|completed)`,
          's'
        );
        content = content.replace(
          phaseRegex,
          `### Phase ${phase.name}\n- **Status:** ${phase.status}`
        );
      }
    }
    
    // 更新关键问题
    if (updates.keyQuestions) {
      let questionsSection = '## Key Questions\n';
      updates.keyQuestions.forEach((question, index) => {
        questionsSection += `${index + 1}. ${question}\n`;
      });
      content = content.replace(
        /## Key Questions\n(?:[0-9]+\..+\n)*/,
        questionsSection
      );
    }
    
    // 更新决策
    if (updates.decisions) {
      let decisionTable = '## Decisions Made\n| Decision | Rationale |\n|----------|-----------|\n';
      updates.decisions.forEach(decision => {
        decisionTable += `| ${decision.decision} | ${decision.rationale} |\n`;
      });
      content = content.replace(
        /## Decisions Made\n(?:\|.+\n)*/,
        decisionTable
      );
    }
    
    // 更新错误
    if (updates.errors) {
      let errorTable = '## Errors Encountered\n| Error | Attempt | Resolution |\n|-------|---------|------------|\n';
      updates.errors.forEach(error => {
        errorTable += `| ${error.error} | ${error.attempt} | ${error.resolution || ''} |\n`;
      });
      content = content.replace(
        /## Errors Encountered\n(?:\|.+\n)*/,
        errorTable
      );
    }
    
    await fs.writeFile(taskPlanPath, content, 'utf8');
  }

  /**
   * 添加研究发现
   */
  async addFinding(taskId: string, finding: Finding): Promise<void> {
    const findingsPath = path.join(this.baseDir, taskId, 'findings.md');
    let content = await fs.readFile(findingsPath, 'utf8');
    
    const timestamp = finding.timestamp.toISOString();
    const entry = `\n- **[${finding.category}]** ${finding.content} (${timestamp})`;
    
    // 根据类别添加到相应部分
    const categoryMap: Record<string, string> = {
      requirement: '## Requirements',
      research: '## Research Findings',
      decision: '## Technical Decisions',
      issue: '## Issues Encountered',
      resource: '## Resources'
    };
    
    const section = categoryMap[finding.category];
    if (section) {
      const sectionIndex = content.indexOf(section);
      if (sectionIndex !== -1) {
        const nextSectionIndex = content.indexOf('\n##', sectionIndex + 1);
        if (nextSectionIndex !== -1) {
          content = content.slice(0, nextSectionIndex) + entry + content.slice(nextSectionIndex);
        } else {
          content += entry;
        }
      }
    }
    
    await fs.writeFile(findingsPath, content, 'utf8');
  }

  /**
   * 添加进度条目
   */
  async addProgressEntry(taskId: string, entry: ProgressEntry): Promise<void> {
    const progressPath = path.join(this.baseDir, taskId, 'progress.md');
    let content = await fs.readFile(progressPath, 'utf8');
    
    const timestamp = entry.timestamp.toISOString();
    let entryText = `
### ${entry.phase}
- **Status:** ${entry.status}
- **Started:** ${timestamp}
- Actions taken:
  - ${entry.action}
`;
    
    if (entry.files && entry.files.length > 0) {
      entryText += `- Files created/modified:\n`;
      entry.files.forEach(file => {
        entryText += `  - ${file}\n`;
      });
    }
    
    // 添加到进度日志
    const sessionIndex = content.indexOf('## Session');
    if (sessionIndex !== -1) {
      content = content.slice(0, sessionIndex) + entryText + content.slice(sessionIndex);
    }
    
    await fs.writeFile(progressPath, content, 'utf8');
  }

  /**
   * 获取任务状态
   */
  async getTaskState(taskId: string): Promise<TaskState> {
    const taskPlanPath = path.join(this.baseDir, taskId, 'task_plan.md');
    const findingsPath = path.join(this.baseDir, taskId, 'findings.md');
    const progressPath = path.join(this.baseDir, taskId, 'progress.md');
    
    const taskPlanContent = await fs.readFile(taskPlanPath, 'utf8');
    
    // 提取当前阶段
    const currentPhaseMatch = taskPlanContent.match(/## Current Phase\n(.+)/);
    const currentPhase = currentPhaseMatch ? currentPhaseMatch[1].trim() : 'Unknown';
    
    // 提取已完成的阶段
    const completedPhases: string[] = [];
    const phaseMatches = taskPlanContent.matchAll(/### Phase [0-9]+: (.+?)\n.*?- \*\*Status:\*\* completed/g);
    for (const match of phaseMatches) {
      completedPhases.push(match[1]);
    }
    
    // 提取错误
    const errors: ErrorEntry[] = [];
    const errorMatches = taskPlanContent.matchAll(/\| (.+?) \| (\d+) \| (.+?) \|/g);
    for (const match of errorMatches) {
      if (match[1] !== 'Error') {
        errors.push({
          error: match[1],
          attempt: parseInt(match[2]),
          resolution: match[3] || undefined,
          timestamp: new Date()
        });
      }
    }
    
    return {
      currentPhase,
      completedPhases,
      findings: [],
      progress: [],
      errors
    };
  }

  /**
   * 读取任务规划文件
   */
  async readTaskPlan(taskId: string): Promise<string> {
    const taskPlanPath = path.join(this.baseDir, taskId, 'task_plan.md');
    return await fs.readFile(taskPlanPath, 'utf8');
  }

  /**
   * 读取研究发现文件
   */
  async readFindings(taskId: string): Promise<string> {
    const findingsPath = path.join(this.baseDir, taskId, 'findings.md');
    return await fs.readFile(findingsPath, 'utf8');
  }

  /**
   * 读取进度日志文件
   */
  async readProgress(taskId: string): Promise<string> {
    const progressPath = path.join(this.baseDir, taskId, 'progress.md');
    return await fs.readFile(progressPath, 'utf8');
  }

  /**
   * 清理任务文件
   */
  async cleanupTask(taskId: string): Promise<void> {
    const taskDir = path.join(this.baseDir, taskId);
    try {
      await fs.rm(taskDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略清理错误
    }
  }
}
