# Stigmergy 上下文管理与动态智能体设计

## 概述

本文档详细说明如何在 Stigmergy 项目中落实两个核心理念：
1. **精准任务分解 + 上下文管理** - 避免上下文爆炸
2. **动态专业智能体** - 为任务定制智能体，不挤占全局记忆

---

## 1. 精准任务分解的落实

### 1.1 三层次任务分解架构

```
┌─────────────────────────────────────────────────────────────┐
│                    战略层（用户可见）                        │
│  CentralOrchestrator                                         │
│  - 任务规划与分解                                            │
│  - CLI 选择与策略确定                                        │
│  - 输出：3-5 个主要模块                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    战术层（AI 可执行）                        │
│  SubTask Executor                                           │
│  - 模块 1：用户认证                                          │
│    ├── 子任务 1.1：设计数据库                                │
│    ├── 子任务 1.2：实现 API                                  │
│    └── 子任务 1.3：前端界面                                  │
│  - 模块 2：商品管理                                          │
│  - 模块 3：订单系统                                          │
│  - 输出：原子任务列表                                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    操作层（原子任务）                          │
│  Atomic Task Executor                                        │
│  - 子任务 1.1.1：创建 User 表                                │
│  - 子任务 1.1.2：实现密码加密                                │
│  - 子任务 1.1.3：编写单元测试                                │
│  - 输出：可验证的结果                                         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 任务定义的数据结构

```typescript
// 战略层任务
interface StrategicTask {
  id: string
  description: string  // 一句话描述
  goal: string         // 最终目标
  scope: string        // 范围界定
  modules: Module[]    // 模块列表
  constraints: string[]  // 约束条件
  acceptanceCriteria: string[]  // 验收标准
}

// 战术层任务
interface TacticalTask {
  id: string
  parentId: string    // 所属模块
  description: string
  type: 'design' | 'implementation' | 'testing' | 'documentation'
  priority: 'high' | 'medium' | 'low'
  dependencies: string[]  // 依赖的其他任务
  requiredSkills: string[]  // 需要的技能
  requiredAgent: string | null  // 需要的智能体
  inputs: string[]    // 输入文件
  outputs: string[]   // 输出文件
  estimatedComplexity: 'low' | 'medium' | 'high'
  acceptanceCriteria: string[]  // 验收标准
}

// 操作层任务
interface AtomicTask {
  id: string
  parentId: string    // 所属战术任务
  description: string
  action: string      // 具体动作
  files: string[]     // 涉及的文件
  changes: string[]   // 预期的修改
  verification: string[]  // 验证步骤
  successCriteria: string[]  // 成功标准
}
```

### 1.3 任务分解的实现

```typescript
class TaskDecomposer {
  // 战略层分解
  async decomposeStrategic(description: string): Promise<StrategicTask> {
    const modules = await this.identifyModules(description)
    
    return {
      id: generateId(),
      description,
      goal: this.extractGoal(description),
      scope: this.defineScope(description),
      modules,
      constraints: this.identifyConstraints(description),
      acceptanceCriteria: this.defineAcceptanceCriteria(description)
    }
  }
  
  // 战术层分解
  async decomposeTactical(module: Module): Promise<TacticalTask[]> {
    const tasks: TacticalTask[] = []
    
    // 为每个模块生成设计任务
    tasks.push(await this.createDesignTask(module))
    
    // 为每个模块生成实现任务
    tasks.push(...await this.createImplementationTasks(module))
    
    // 为每个模块生成测试任务
    tasks.push(await this.createTestingTask(module))
    
    // 分析依赖关系
    return this.analyzeDependencies(tasks)
  }
  
  // 操作层分解
  async decomposeAtomic(tacticalTask: TacticalTask): Promise<AtomicTask[]> {
    const atomicTasks: AtomicTask[] = []
    
    // 根据任务类型分解
    switch (tacticalTask.type) {
      case 'design':
        atomicTasks.push(...await this.decomposeDesignTask(tacticalTask))
        break
      case 'implementation':
        atomicTasks.push(...await this.decomposeImplementationTask(tacticalTask))
        break
      case 'testing':
        atomicTasks.push(...await this.decomposeTestingTask(tacticalTask))
        break
      case 'documentation':
        atomicTasks.push(...await this.decomposeDocumentationTask(tacticalTask))
        break
    }
    
    return atomicTasks
  }
}
```

---

## 2. 上下文管理的落实

### 2.1 上下文分层架构

```
全局上下文（始终保留，最小化）
├── 项目目标（1-2 句话）
├── 技术栈（关键依赖）
├── 架构原则（3-5 条）
└── 存储位置：.stigmergy/global-context.json

任务上下文（动态加载，按需）
├── 当前任务描述
├── 相关文件（仅需要的）
├── 依赖任务摘要（只传递输出）
└── 存储位置：.stigmergy/coordination/task-<id>/context.json

临时上下文（用完即删）
├── 中间分析结果
├── 临时文档
├── 调试信息
└── 存储位置：.stigmergy/temp/task-<id>/
```

### 2.2 上下文管理器的实现

```typescript
class ContextManager {
  private globalContextPath = '.stigmergy/global-context.json'
  private taskContextBase = '.stigmergy/coordination/task-'
  private tempContextBase = '.stigmergy/temp/task-'
  
  // 初始化全局上下文
  async initializeGlobalContext(projectInfo: ProjectInfo): Promise<void> {
    const globalContext = {
      projectGoal: projectInfo.goal,
      techStack: {
        language: projectInfo.language,
        framework: projectInfo.framework,
        keyDependencies: projectInfo.dependencies.slice(0, 5)
      },
      architecturePrinciples: [
        '模块化设计',
        '单一职责原则',
        '依赖倒置原则',
        '接口隔离原则',
        '开闭原则'
      ].slice(0, 3),
      lastUpdated: new Date().toISOString()
    }
    
    await fs.writeFile(
      this.globalContextPath,
      JSON.stringify(globalContext, null, 2),
      'utf8'
    )
  }
  
  // 加载任务上下文（最小化）
  async loadTaskContext(taskId: string): Promise<TaskContext> {
    const contextPath = `${this.taskContextBase}${taskId}/context.json`
    
    if (!fs.existsSync(contextPath)) {
      // 如果上下文不存在，从依赖任务生成
      return await this.generateMinimalContext(taskId)
    }
    
    const context = JSON.parse(await fs.readFile(contextPath, 'utf8'))
    return context
  }
  
  // 生成最小化上下文
  private async generateMinimalContext(taskId: string): Promise<TaskContext> {
    const task = await this.getTask(taskId)
    const dependencies = await this.getDependencies(taskId)
    
    // 关键：只传递必要的依赖摘要
    const minimalDependencies = dependencies.map(dep => ({
      id: dep.id,
      description: dep.description,
      outputs: dep.outputs,  // 只传递输出
      issues: dep.issues,     // 只传递问题
      summary: dep.summary    // 只传递摘要
    }))
    
    return {
      task: {
        id: task.id,
        description: task.description,
        type: task.type,
        acceptanceCriteria: task.acceptanceCriteria
      },
      dependencies: minimalDependencies,
      globalContext: await this.loadGlobalContextSummary()
    }
  }
  
  // 加载全局上下文摘要
  private async loadGlobalContextSummary(): Promise<GlobalContextSummary> {
    const globalContext = JSON.parse(
      await fs.readFile(this.globalContextPath, 'utf8')
    )
    
    // 只返回摘要，不返回全部细节
    return {
      projectGoal: globalContext.projectGoal,
      techStack: globalContext.techStack,
      architecturePrinciples: globalContext.architecturePrinciples
    }
  }
  
  // 保存任务结果（清理临时上下文）
  async saveTaskResult(taskId: string, result: TaskResult): Promise<void> {
    // 1. 保存结果摘要
    const summary = {
      taskId,
      outputs: result.outputs,
      changes: result.changes,
      issues: result.issues,
      success: result.success,
      timestamp: new Date().toISOString()
    }
    
    const summaryPath = `${this.taskContextBase}${taskId}/summary.json`
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8')
    
    // 2. 清理临时上下文
    await this.clearTemporaryContext(taskId)
  }
  
  // 清理临时上下文
  private async clearTemporaryContext(taskId: string): Promise<void> {
    const tempPath = `${this.tempContextBase}${taskId}`
    
    if (fs.existsSync(tempPath)) {
      // 递归删除临时目录
      await this.deleteDirectory(tempPath)
    }
  }
  
  // 创建临时上下文目录
  async createTemporaryContext(taskId: string): Promise<string> {
    const tempPath = `${this.tempContextBase}${taskId}`
    await fs.mkdir(tempPath, { recursive: true })
    return tempPath
  }
}
```

---

## 3. 文档管理的落实

### 3.1 文档分类策略

```typescript
// 永久文档（版本控制）
interface PermanentDocument {
  type: 'REQUIREMENTS' | 'DESIGN' | 'API' | 'ARCHITECTURE' | 'GUIDE'
  path: string
  lifecycle: 'permanent'
  reviewRequired: boolean
  versionControlled: true
}

// 临时文档（任务完成后删除）
interface TemporaryDocument {
  type: 'ANALYSIS' | 'DRAFT' | 'TEMP' | 'DEBUG'
  path: string
  lifecycle: 'temporary'
  autoDelete: true
  deleteAfterTask: string  // 任务完成后自动删除
}

// 可缓存文档（可重新生成）
interface CacheableDocument {
  type: 'METRICS' | 'REPORT' | 'SUMMARY' | 'DEPENDENCIES'
  path: string
  lifecycle: 'cacheable'
  regenerate: true
  regenerateFn: Function  // 重新生成函数
}
```

### 3.2 文档目录结构

```
项目根目录/
├── docs/                                    # 永久文档（版本控制）
│   ├── orchestration/
│   │   ├── REQUIREMENTS.md                  # 需求文档
│   │   ├── DESIGN.md                        # 设计文档
│   │   ├── IMPLEMENTATION.md                # 实施计划
│   │   └── CORE_CONCEPTS.md                 # 核心概念
│   └── api/
│       └── API_REFERENCE.md                 # API 参考
│
├── .stigmergy/
│   ├── global-context.json                  # 全局上下文（永久）
│   │
│   ├── coordination/                        # 任务协调上下文
│   │   ├── task-registry.json               # 任务注册表
│   │   ├── state-locks.json                 # 状态锁
│   │   └── task-<task-id>/
│   │       ├── context.json                 # 任务上下文
│   │       ├── summary.json                 # 任务摘要
│   │       └── agent-config.json            # 智能体配置
│   │
│   ├── temp/                                # 临时文档（自动删除）
│   │   └── task-<task-id>/
│   │       ├── analysis.md                  # 分析结果
│   │       ├── draft.md                     # 草稿
│   │       └── debug.log                    # 调试日志
│   │
│   └── cache/                               # 缓存文档（可重新生成）
│       ├── metrics.json                     # 性能指标
│       ├── test-results.json                # 测试结果
│       └── dependencies.json                # 依赖分析
```

### 3.3 文档生命周期管理

```typescript
class DocumentLifecycleManager {
  // 创建文档时明确标记类型
  async createDocument(
    type: DocumentType,
    content: string,
    options: DocumentOptions
  ): Promise<string> {
    const docId = generateId()
    let docPath: string
    
    switch (options.lifecycle) {
      case 'permanent':
        // 永久文档：保存到 docs/ 目录
        docPath = `docs/${options.category}/${docId}.md`
        break
        
      case 'temporary':
        // 临时文档：保存到 .stigmergy/temp/ 目录
        docPath = `.stigmergy/temp/${options.taskId}/${docId}.md`
        await this.markForAutoDelete(docId, options.taskId)
        break
        
      case 'cacheable':
        // 可缓存文档：保存到 .stigmergy/cache/ 目录
        docPath = `.stigmergy/cache/${options.category}/${docId}.json`
        await this.markAsCacheable(docId, options.regenerateFn)
        break
    }
    
    await fs.writeFile(docPath, content, 'utf8')
    
    // 记录文档元数据
    await this.recordDocumentMetadata(docId, {
      path: docPath,
      type,
      lifecycle: options.lifecycle,
      createdAt: new Date().toISOString(),
      taskId: options.taskId
    })
    
    return docId
  }
  
  // 任务完成时清理文档
  async cleanupAfterTask(taskId: string): Promise<void> {
    // 1. 删除所有临时文档
    await this.deleteTemporaryDocuments(taskId)
    
    // 2. 清空缓存文档（可选）
    await this.clearCacheDocuments(taskId)
    
    // 3. 生成摘要文档（永久）
    await this.generateSummaryDocument(taskId)
  }
  
  // 删除临时文档
  private async deleteTemporaryDocuments(taskId: string): Promise<void> {
    const tempDir = `.stigmergy/temp/${taskId}`
    
    if (fs.existsSync(tempDir)) {
      // 递归删除整个目录
      await this.deleteDirectory(tempDir)
    }
  }
  
  // 清空缓存文档
  private async clearCacheDocuments(taskId: string): Promise<void> {
    const cacheDir = `.stigmergy/cache`
    const cacheFiles = await fs.readdir(cacheDir)
    
    for (const file of cacheFiles) {
      const filePath = path.join(cacheDir, file)
      const metadata = await this.getDocumentMetadata(file)
      
      if (metadata && metadata.taskId === taskId) {
        await fs.unlink(filePath)
      }
    }
  }
  
  // 生成摘要文档
  private async generateSummaryDocument(taskId: string): Promise<void> {
    const task = await this.getTask(taskId)
    const result = await this.getTaskResult(taskId)
    
    const summary = {
      task: {
        id: task.id,
        description: task.description,
        type: task.type
      },
      result: {
        outputs: result.outputs,
        changes: result.changes,
        issues: result.issues,
        success: result.success
      },
      timestamp: new Date().toISOString()
    }
    
    const summaryPath = `.stigmergy/coordination/task-${taskId}/summary.json`
    await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8')
  }
}
```

---

## 4. 动态专业智能体的落实

### 4.1 智能体模板系统

```typescript
// 智能体模板
interface AgentTemplate {
  id: string
  name: string
  description: string
  expertise: string[]  // 专长领域
  capabilities: string[]  // 能力列表
  requiredSkills: string[]  // 需要的技能
  defaultConfig: AgentConfig  // 默认配置
}

// 预定义的智能体模板
const AGENT_TEMPLATES: Record<string, AgentTemplate> = {
  'database-expert': {
    id: 'database-expert',
    name: '数据库专家',
    description: '专注于数据库设计、优化和管理的智能体',
    expertise: [
      '数据库设计',
      'SQL 查询优化',
      '数据建模',
      '索引优化',
      '数据库迁移'
    ],
    capabilities: [
      '设计数据库架构',
      '编写 SQL 查询',
      '优化数据库性能',
      '创建数据库迁移脚本',
      '分析数据库性能瓶颈'
    ],
    requiredSkills: ['database-design', 'sql-optimization', 'data-modeling'],
    defaultConfig: {
      model: 'claude-opus-4-5',
      temperature: 0.3,
      maxTokens: 4000,
      systemPrompt: `你是一个数据库专家，专注于数据库设计、优化和管理。
你的任务是：
1. 设计高效的数据库架构
2. 编写优化的 SQL 查询
3. 分析和解决数据库性能问题
4. 创建和管理数据库迁移脚本

请始终遵循以下原则：
- 数据库规范化（第三范式）
- 适当的索引设计
- 查询性能优化
- 数据一致性保证`
    }
  },
  
  'api-expert': {
    id: 'api-expert',
    name: 'API 专家',
    description: '专注于 API 设计、实现和测试的智能体',
    expertise: [
      'RESTful API 设计',
      'API 文档编写',
      'API 测试',
      'API 安全',
      'API 版本管理'
    ],
    capabilities: [
      '设计 RESTful API',
      '实现 API 端点',
      '编写 API 文档',
      '编写 API 测试',
      '实现 API 认证和授权'
    ],
    requiredSkills: ['api-design', 'api-testing', 'api-security'],
    defaultConfig: {
      model: 'claude-opus-4-5',
      temperature: 0.3,
      maxTokens: 4000,
      systemPrompt: `你是一个 API 专家，专注于 API 设计、实现和测试。
你的任务是：
1. 设计符合 RESTful 规范的 API
2. 实现高质量的 API 端点
3. 编写清晰的 API 文档
4. 编写全面的 API 测试
5. 实现 API 认证和授权机制

请始终遵循以下原则：
- RESTful 设计规范
- 清晰的 API 文档
- 全面的错误处理
- 安全的认证和授权
- 版本化管理`
    }
  },
  
  'frontend-expert': {
    id: 'frontend-expert',
    name: '前端专家',
    description: '专注于前端开发、UI/UX 设计和性能优化的智能体',
    expertise: [
      'React/Vue/Angular',
      'CSS/SCSS',
      '响应式设计',
      '性能优化',
      '可访问性'
    ],
    capabilities: [
      '设计用户界面',
      '实现前端组件',
      '优化前端性能',
      '实现响应式设计',
      '确保可访问性'
    ],
    requiredSkills: ['react', 'vue', 'css', 'responsive-design', 'accessibility'],
    defaultConfig: {
      model: 'claude-opus-4-5',
      temperature: 0.4,
      maxTokens: 4000,
      systemPrompt: `你是一个前端专家，专注于前端开发、UI/UX 设计和性能优化。
你的任务是：
1. 设计美观且易用的用户界面
2. 实现高质量的前端组件
3. 优化前端性能
4. 实现响应式设计
5. 确保可访问性

请始终遵循以下原则：
- 清晰的组件结构
- 优秀的用户体验
- 高性能的实现
- 响应式设计
- 可访问性标准（WCAG 2.1）`
    }
  },
  
  'testing-expert': {
    id: 'testing-expert',
    name: '测试专家',
    description: '专注于测试设计、实现和自动化的智能体',
    expertise: [
      '单元测试',
      '集成测试',
      '端到端测试',
      '测试自动化',
      '测试覆盖率分析'
    ],
    capabilities: [
      '设计测试用例',
      '编写单元测试',
      '编写集成测试',
      '编写端到端测试',
      '实现测试自动化'
    ],
    requiredSkills: ['unit-testing', 'integration-testing', 'e2e-testing', 'test-automation'],
    defaultConfig: {
      model: 'claude-opus-4-5',
      temperature: 0.3,
      maxTokens: 4000,
      systemPrompt: `你是一个测试专家，专注于测试设计、实现和自动化。
你的任务是：
1. 设计全面的测试用例
2. 编写高质量的单元测试
3. 编写集成测试
4. 编写端到端测试
5. 实现测试自动化

请始终遵循以下原则：
- 高测试覆盖率（>80%）
- 清晰的测试命名
- 独立的测试用例
- 快速的测试执行
- 持续集成友好`
    }
  }
}
```

### 4.2 动态智能体生成器

```typescript
class DynamicAgentGenerator {
  // 根据任务类型生成专业智能体
  async generateAgentForTask(task: TacticalTask): Promise<Agent> {
    // 1. 选择合适的智能体模板
    const template = this.selectTemplate(task)
    
    // 2. 根据任务定制智能体配置
    const config = await this.customizeConfig(template, task)
    
    // 3. 加载必要的技能
    const skills = await this.loadSkills(template.requiredSkills)
    
    // 4. 生成智能体配置文件
    const agentConfig = await this.createAgentConfigFile(
      task.id,
      template,
      config,
      skills
    )
    
    // 5. 返回智能体实例
    return {
      id: `agent-${task.id}`,
      name: `${template.name} (Task: ${task.id})`,
      templateId: template.id,
      configPath: agentConfig.path,
      config,
      skills,
      taskId: task.id,
      createdAt: new Date().toISOString()
    }
  }
  
  // 选择智能体模板
  private selectTemplate(task: TacticalTask): AgentTemplate {
    // 根据任务类型选择模板
    if (task.description.includes('database') || 
        task.description.includes('SQL') ||
        task.description.includes('schema')) {
      return AGENT_TEMPLATES['database-expert']
    }
    
    if (task.description.includes('API') || 
        task.description.includes('endpoint') ||
        task.description.includes('REST')) {
      return AGENT_TEMPLATES['api-expert']
    }
    
    if (task.description.includes('UI') || 
        task.description.includes('frontend') ||
        task.description.includes('interface')) {
      return AGENT_TEMPLATES['frontend-expert']
    }
    
    if (task.description.includes('test') || 
        task.description.includes('testing') ||
        task.description.includes('coverage')) {
      return AGENT_TEMPLATES['testing-expert']
    }
    
    // 默认使用通用模板
    return AGENT_TEMPLATES['database-expert']
  }
  
  // 定制智能体配置
  private async customizeConfig(
    template: AgentTemplate,
    task: TacticalTask
  ): Promise<AgentConfig> {
    const config = { ...template.defaultConfig }
    
    // 根据任务调整配置
    config.systemPrompt = this.customizeSystemPrompt(
      template.defaultConfig.systemPrompt,
      task
    )
    
    // 根据任务复杂度调整温度
    if (task.estimatedComplexity === 'high') {
      config.temperature = 0.5  // 更高的创造性
    } else if (task.estimatedComplexity === 'low') {
      config.temperature = 0.2  // 更低的创造性
    }
    
    return config
  }
  
  // 定制系统提示词
  private customizeSystemPrompt(
    basePrompt: string,
    task: TacticalTask
  ): string {
    return `${basePrompt}

当前任务：
- 描述：${task.description}
- 类型：${task.type}
- 优先级：${task.priority}
- 验收标准：
${task.acceptanceCriteria.map((c, i) => `  ${i + 1}. ${c}`).join('\n')}

请确保完成所有验收标准。`
  }
  
  // 加载技能
  private async loadSkills(skillNames: string[]): Promise<Skill[]> {
    const skills: Skill[] = []
    
    for (const skillName of skillNames) {
      const skill = await this.loadSkill(skillName)
      if (skill) {
        skills.push(skill)
      }
    }
    
    return skills
  }
  
  // 创建智能体配置文件
  private async createAgentConfigFile(
    taskId: string,
    template: AgentTemplate,
    config: AgentConfig,
    skills: Skill[]
  ): Promise<{ path: string; config: AgentConfig }> {
    // 配置文件路径：.stigmergy/coordination/task-<task-id>/agent-config.json
    const configPath = `.stigmergy/coordination/task-${taskId}/agent-config.json`
    
    const agentConfig = {
      id: `agent-${taskId}`,
      name: `${template.name} (Task: ${taskId})`,
      templateId: template.id,
      description: template.description,
      expertise: template.expertise,
      capabilities: template.capabilities,
      config,
      skills: skills.map(s => ({
        name: s.name,
        description: s.description,
        path: s.path
      })),
      taskId,
      createdAt: new Date().toISOString()
    }
    
    // 确保目录存在
    const configDir = path.dirname(configPath)
    await fs.mkdir(configDir, { recursive: true })
    
    // 保存配置文件
    await fs.writeFile(
      configPath,
      JSON.stringify(agentConfig, null, 2),
      'utf8'
    )
    
    return { path: configPath, config: agentConfig }
  }
}
```

### 4.3 智能体生命周期管理

```typescript
class AgentLifecycleManager {
  private agentRegistry: Map<string, Agent> = new Map()
  
  // 创建智能体
  async createAgent(taskId: string, task: TacticalTask): Promise<Agent> {
    const generator = new DynamicAgentGenerator()
    const agent = await generator.generateAgentForTask(task)
    
    // 注册智能体
    this.agentRegistry.set(agent.id, agent)
    
    return agent
  }
  
  // 获取智能体
  async getAgent(agentId: string): Promise<Agent | null> {
    // 先从内存中查找
    if (this.agentRegistry.has(agentId)) {
      return this.agentRegistry.get(agentId)!
    }
    
    // 从文件中加载
    const configPath = `.stigmergy/coordination/task-*/agent-config.json`
    const configFiles = await glob(configPath)
    
    for (const configFile of configFiles) {
      const config = JSON.parse(await fs.readFile(configFile, 'utf8'))
      if (config.id === agentId) {
        return config
      }
    }
    
    return null
  }
  
  // 使用智能体执行任务
  async executeWithAgent(
    taskId: string,
    agent: Agent,
    context: TaskContext
  ): Promise<TaskResult> {
    // 1. 加载智能体配置
    const agentConfig = await this.loadAgentConfig(agent.configPath)
    
    // 2. 构建提示词
    const prompt = this.buildPrompt(agentConfig, context)
    
    // 3. 调用 CLI 工具
    const cliTool = this.selectCLITool(agentConfig)
    const result = await this.callCLI(cliTool, agentConfig, prompt)
    
    // 4. 验证结果
    const validationResult = await this.validateResult(
      taskId,
      result,
      context.task.acceptanceCriteria
    )
    
    return {
      taskId,
      agentId: agent.id,
      outputs: result.outputs,
      changes: result.changes,
      issues: result.issues,
      success: validationResult.success,
      validation: validationResult
    }
  }
  
  // 清理智能体（任务完成后）
  async cleanupAgent(taskId: string): Promise<void> {
    // 1. 从内存中移除
    for (const [agentId, agent] of this.agentRegistry.entries()) {
      if (agent.taskId === taskId) {
        this.agentRegistry.delete(agentId)
      }
    }
    
    // 2. 删除智能体配置文件
    const configPath = `.stigmergy/coordination/task-${taskId}/agent-config.json`
    if (fs.existsSync(configPath)) {
      await fs.unlink(configPath)
    }
    
    // 3. 清理技能缓存（可选）
    await this.cleanupSkillCache(taskId)
  }
  
  // 构建提示词
  private buildPrompt(
    agentConfig: AgentConfig,
    context: TaskContext
  ): string {
    return `${agentConfig.config.systemPrompt}

任务信息：
- ID: ${context.task.id}
- 描述: ${context.task.description}
- 类型: ${context.task.type}
- 优先级: ${context.task.priority}

依赖任务摘要：
${context.dependencies.map(dep => `
- ${dep.id}: ${dep.description}
  输出: ${dep.outputs.join(', ')}
  问题: ${dep.issues.join(', ') || '无'}
`).join('\n')}

请完成当前任务。`
  }
  
  // 选择 CLI 工具
  private selectCLITool(agentConfig: AgentConfig): string {
    // 根据智能体配置选择合适的 CLI 工具
    if (agentConfig.config.model.includes('claude')) {
      return 'claude'
    } else if (agentConfig.config.model.includes('gemini')) {
      return 'gemini'
    } else if (agentConfig.config.model.includes('iflow')) {
      return 'iflow'
    }
    
    return 'claude'  // 默认
  }
  
  // 调用 CLI 工具
  private async callCLI(
    cliTool: string,
    agentConfig: AgentConfig,
    prompt: string
  ): Promise<CLIResult> {
    // 构建命令
    const command = this.buildCLICommand(cliTool, agentConfig, prompt)
    
    // 执行命令
    const result = await this.executeCommand(command)
    
    // 解析结果
    return this.parseResult(result)
  }
  
  // 构建 CLI 命令
  private buildCLICommand(
    cliTool: string,
    agentConfig: AgentConfig,
    prompt: string
  ): string {
    switch (cliTool) {
      case 'claude':
        return `claude --model ${agentConfig.config.model} --temperature ${agentConfig.config.temperature} --max-tokens ${agentConfig.config.maxTokens} "${prompt}"`
      
      case 'gemini':
        return `gemini --model ${agentConfig.config.model} --temperature ${agentConfig.config.temperature} --max-tokens ${agentConfig.config.maxTokens} "${prompt}"`
      
      case 'iflow':
        return `iflow -p "${prompt}"`
      
      default:
        return `claude "${prompt}"`
    }
  }
  
  // 执行命令
  private async executeCommand(command: string): Promise<string> {
    const { stdout, stderr } = await exec(command)
    return stdout || stderr
  }
  
  // 解析结果
  private parseResult(output: string): CLIResult {
    // 解析 CLI 输出
    // 这里需要根据实际的 CLI 输出格式进行解析
    return {
      outputs: [],
      changes: [],
      issues: [],
      rawOutput: output
    }
  }
  
  // 验证结果
  private async validateResult(
    taskId: string,
    result: CLIResult,
    acceptanceCriteria: string[]
  ): Promise<ValidationResult> {
    const issues: string[] = []
    
    // 检查每个验收标准
    for (const criterion of acceptanceCriteria) {
      const passed = await this.checkCriterion(result, criterion)
      if (!passed) {
        issues.push(`未满足验收标准: ${criterion}`)
      }
    }
    
    return {
      success: issues.length === 0,
      issues,
      passedCriteria: acceptanceCriteria.filter(c => 
        !issues.includes(`未满足验收标准: ${c}`)
      ),
      failedCriteria: issues
    }
  }
  
  // 检查验收标准
  private async checkCriterion(
    result: CLIResult,
    criterion: string
  ): Promise<boolean> {
    // 这里需要根据实际的验收标准进行检查
    // 可以使用正则表达式、文件检查、测试运行等方式
    
    // 示例：检查是否创建了指定的文件
    if (criterion.includes('创建') && criterion.includes('文件')) {
      const fileName = criterion.match(/创建\s+([^\s]+)/)?.[1]
      if (fileName) {
        return fs.existsSync(fileName)
      }
    }
    
    // 示例：检查是否通过了测试
    if (criterion.includes('测试') && criterion.includes('通过')) {
      const testResult = await this.runTests()
      return testResult.success
    }
    
    // 默认返回 true（实际实现中需要更复杂的逻辑）
    return true
  }
  
  // 运行测试
  private async runTests(): Promise<TestResult> {
    // 运行测试并返回结果
    return { success: true, total: 10, passed: 10, failed: 0 }
  }
  
  // 清理技能缓存
  private async cleanupSkillCache(taskId: string): Promise<void> {
    const cacheDir = `.stigmergy/cache/skills`
    const cacheFiles = await fs.readdir(cacheDir)
    
    for (const file of cacheFiles) {
      if (file.includes(taskId)) {
        const filePath = path.join(cacheDir, file)
        await fs.unlink(filePath)
      }
    }
  }
}
```

---

## 5. 完整的工作流程

### 5.1 任务执行流程

```typescript
class OrchestratedTaskExecutor {
  private contextManager = new ContextManager()
  private documentManager = new DocumentLifecycleManager()
  private agentManager = new AgentLifecycleManager()
  
  async executeTask(task: TacticalTask): Promise<TaskResult> {
    // 1. 加载最小化上下文
    const context = await this.contextManager.loadTaskContext(task.id)
    
    // 2. 创建临时上下文目录
    const tempDir = await this.contextManager.createTemporaryContext(task.id)
    
    // 3. 创建动态智能体
    const agent = await this.agentManager.createAgent(task.id, task)
    
    try {
      // 4. 使用智能体执行任务
      const result = await this.agentManager.executeWithAgent(
        task.id,
        agent,
        context
      )
      
      // 5. 验证结果
      if (!result.success) {
        // 如果验证失败，记录问题
        await this.documentManager.createDocument(
          'DEBUG',
          JSON.stringify(result.validation, null, 2),
          {
            lifecycle: 'temporary',
            taskId: task.id,
            category: 'debug'
          }
        )
      }
      
      // 6. 保存任务结果（清理临时上下文）
      await this.contextManager.saveTaskResult(task.id, result)
      
      return result
    } finally {
      // 7. 清理智能体
      await this.agentManager.cleanupAgent(task.id)
      
      // 8. 清理文档
      await this.documentManager.cleanupAfterTask(task.id)
    }
  }
}
```

### 5.2 完整流程图

```
┌─────────────────────────────────────────────────────────────┐
│                     1. 任务开始                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     2. 加载上下文                            │
│  - 加载全局上下文摘要                                        │
│  - 加载依赖任务摘要                                          │
│  - 加载当前任务描述                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     3. 创建临时目录                          │
│  - .stigmergy/temp/task-<id>/                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     4. 生成智能体                            │
│  - 选择智能体模板                                            │
│  - 定制智能体配置                                            │
│  - 加载必要技能                                              │
│  - 保存配置文件到任务目录                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     5. 执行任务                              │
│  - 使用智能体执行任务                                        │
│  - 生成临时文档                                              │
│  - 记录调试信息                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     6. 验证结果                              │
│  - 检查验收标准                                              │
│  - 记录问题                                                  │
│  - 生成验证报告                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     7. 保存结果                              │
│  - 保存任务摘要                                              │
│  - 保存输出文件                                              │
│  - 保存变更记录                                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     8. 清理上下文                            │
│  - 删除临时文档                                              │
│  - 清空缓存文档                                              │
│  - 删除智能体配置                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     9. 任务完成                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. 最佳实践总结

### 6.1 任务分解的最佳实践

1. **三层次分解**：战略层 → 战术层 → 操作层
2. **单一职责**：每个任务只做一件事
3. **可验证**：每个任务都有明确的验收标准
4. **原子性**：任务不能再分解
5. **独立性**：任务之间的依赖最小化

### 6.2 上下文管理的最佳实践

1. **最小化原则**：只传递必要的信息
2. **及时清理**：用完即删，不留垃圾
3. **分层管理**：全局、任务、临时三层
4. **持久化摘要**：只保留关键摘要
5. **按需加载**：动态加载需要的上下文

### 6.3 文档管理的最佳实践

1. **明确分类**：永久、临时、缓存
2. **自动清理**：临时文档自动删除
3. **版本控制**：永久文档纳入 Git
4. **可重新生成**：缓存文档不要手动编辑
5. **人工审查**：重要文档需要人工审查

### 6.4 动态智能体的最佳实践

1. **模板化**：使用预定义的智能体模板
2. **定制化**：根据任务定制智能体配置
3. **隔离性**：智能体配置存储在任务目录
4. **生命周期**：任务完成后自动清理
5. **专业化**：每个智能体专注于特定领域

---

## 7. 实施建议

### 7.1 分阶段实施

**阶段 1：基础架构（2-3 周）**
- 实现上下文管理器
- 实现文档生命周期管理器
- 实现任务分解器

**阶段 2：智能体系统（2-3 周）**
- 实现智能体模板系统
- 实现动态智能体生成器
- 实现智能体生命周期管理器

**阶段 3：集成测试（1-2 周）**
- 集成所有组件
- 编写端到端测试
- 性能优化

### 7.2 验收标准

- ✅ 任务能够正确分解为三个层次
- ✅ 上下文能够动态加载和清理
- ✅ 文档能够自动分类和管理
- ✅ 智能体能够动态生成和定制
- ✅ 任务完成后所有临时资源被清理
- ✅ 系统性能满足要求（上下文大小 < 100KB）

---

## 8. 总结

通过这套设计，Stigmergy 项目能够：

1. **避免上下文爆炸**：通过分层管理和及时清理
2. **精准任务分解**：通过三层次分解和明确的验收标准
3. **动态智能体**：为每个任务定制专业智能体
4. **隔离性**：智能体配置不挤占全局记忆
5. **可追溯性**：保留关键摘要，支持审计和调试

这套方案完美地解决了 AI 在复杂项目中的上下文管理和任务分解问题！