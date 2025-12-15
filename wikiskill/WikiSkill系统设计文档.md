# WikiSkill 系统设计文档

## 🎯 系统概述

WikiSkill是一个基于提示词的技能扩展系统，支持多用户Wiki协同编辑，通过智能审核和反馈机制，将自然语言描述自动转化为可执行的AI技能。

## 🏗️ 核心架构

### 系统架构图
```
┌─────────────────────────────────────────────────────────────┐
│                    WikiSkill 系统                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  前端编辑器   │  │  审核引擎     │  │  技能生成器   │         │
│  │             │  │             │  │             │         │
│  │ • Monaco    │  │ • 流程审核   │  │ • 代码生成   │         │
│  │ • Yjs协作    │  │ • 置信度评估 │  │ • 安全检查   │         │
│  │ • 实时预览   │  │ • 反馈生成   │  │ • 自动优化   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │               │
│         ▼                ▼                ▼               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Wiki协同平台                             │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  实时同步    │  │  版本控制    │  │  权限管理    │  │   │
│  │  │             │  │             │  │             │  │   │
│  │  │ • WebSocket │  │ • Git集成   │  │ • RBAC      │  │   │
│  │  │ • CRDT算法   │  │ • 分支管理   │  │ • 角色继承   │  │   │
│  │  │ • 冲突解决   │  │ • 历史追踪   │  │ • 审计日志   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│         │                │                │               │
│         ▼                ▼                ▼               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              AI处理引擎                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │   │
│  │  │  约束对齐    │  │  上下文分析   │  │  任务分解    │  │   │
│  │  │             │  │             │  │             │  │   │
│  │  │ • 逻辑验证   │  │ • 结构化     │  │ • 递归分解   │  │   │
│  │  │ • 歧义消除   │  │ • 渐进披露   │  │ • 结果聚合   │  │   │
│  │  │ • 一致性检查│  │ • 智能提示   │  │ • 对齐验证   │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 核心功能模块

### 1. Wiki协同编辑模块

#### 1.1 实时协同编辑
```javascript
class WikiCollaborativeEditor {
  constructor() {
    this.editor = monaco.editor.create(container, {
      theme: 'vs-dark',
      language: 'markdown',
      automaticLayout: true
    });
    
    // Yjs协同编辑集成
    this.yDoc = new Y.Doc();
    this.yText = this.yDoc.getText('skill-content');
    this.websocket = new WebSocket(wsUrl);
    this.bindCollaboration();
  }
  
  bindCollaboration() {
    // Monaco Editor与Yjs绑定
    const binding = new MonacoBinding(this.yText, this.editor);
    
    // 实时同步
    this.yDoc.on('update', (update) => {
      this.websocket.send(JSON.stringify(update));
    });
    
    // 用户状态同步
    this.awareness = new Awareness(this.yDoc);
    this.awareness.setLocalStateField('user', {
      name: currentUser.name,
      color: currentUser.color,
      cursor: { position: 0 }
    });
  }
}
```

#### 1.2 版本控制系统
```javascript
class WikiVersionControl {
  constructor(repoPath) {
    this.repo = simpleGit(repoPath);
    this.branchManager = new BranchManager();
  }
  
  // 自动保存版本
  async autoCommit(skillId, content, author, message) {
    const filename = `skills/${skillId}.md`;
    
    try {
      await fs.writeFile(filename, content);
      await this.repo.add(filename);
      await this.repo.commit(
        `${message}\n\nAuthor: ${author}\nTime: ${new Date().toISOString()}`
      );
      
      return { success: true, commit: await this.getLatestCommit() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // 创建合并请求
  async createMergeRequest(sourceBranch, targetBranch, reviewer) {
    await this.repo.checkoutBranch(targetBranch);
    await this.repo.merge([sourceBranch]);
    await this.repo.push('origin', targetBranch);
    
    // 通知审查者
    await this.notifyReviewer(reviewer, sourceBranch, targetBranch);
  }
}
```

### 2. 提示词审核与反馈模块

#### 2.1 自动审核引擎
```javascript
class PromptAuditEngine {
  constructor() {
    this.constraintAligner = new ConstraintAlignmentEngine();
    this.confidenceEvaluator = new ConfidenceEvaluator();
    this.feedbackGenerator = new FeedbackGenerator();
  }
  
  // 审核提示词
  async auditPrompt(prompt, context) {
    // 1. 约束对齐检查
    const alignment = await this.constraintAligner.alignConstraints(prompt);
    
    // 2. 置信度评估
    const confidence = await this.confidenceEvaluator.evaluate(prompt, alignment);
    
    // 3. 生成反馈
    const feedback = await this.feedbackGenerator.generate(prompt, alignment, confidence);
    
    return {
      prompt: prompt,
      alignment: alignment,
      confidence: confidence,
      feedback: feedback,
      status: this.determineStatus(confidence),
      timestamp: new Date().toISOString()
    };
  }
  
  // 确定审核状态
  determineStatus(confidence) {
    if (confidence.overall > 0.9) {
      return 'approved'; // 高置信度，自动批准
    } else if (confidence.overall > 0.7) {
      return 'review_needed'; // 中等置信度，需要人工审核
    } else {
      return 'feedback_required'; // 低置信度，需要反馈
    }
  }
}
```

#### 2.2 反馈生成器
```javascript
class FeedbackGenerator {
  constructor() {
    this.templateEngine = new Handlebars();
    this.suggestionEngine = new SuggestionEngine();
  }
  
  // 生成反馈
  async generate(prompt, alignment, confidence) {
    const feedback = {
      overall_score: confidence.overall,
      issues: [],
      suggestions: [],
      next_steps: []
    };
    
    // 识别问题
    if (alignment.constraints.missing.length > 0) {
      feedback.issues.push({
        type: 'missing_constraints',
        message: '缺少必要的约束条件',
        details: alignment.constraints.missing
      });
    }
    
    if (alignment.logic.inconsistencies.length > 0) {
      feedback.issues.push({
        type: 'logic_inconsistency',
        message: '存在逻辑不一致',
        details: alignment.logic.inconsistencies
      });
    }
    
    // 生成建议
    feedback.suggestions = await this.suggestionEngine.generate(
      prompt,
      alignment,
      confidence
    );
    
    // 确定下一步
    if (confidence.overall > 0.9) {
      feedback.next_steps.push('自动硬化为可执行代码');
    } else if (confidence.overall > 0.7) {
      feedback.next_steps.push('等待人工审核确认');
    } else {
      feedback.next_steps.push('根据反馈修改提示词');
    }
    
    return feedback;
  }
}
```

### 3. 技能自动生成模块

#### 3.1 代码生成器
```javascript
class SkillCodeGenerator {
  constructor() {
    this.templateEngine = new Handlebars();
    this.codeValidator = new CodeValidator();
    this.sandbox = new SecureSandbox();
  }
  
  // 生成技能代码
  async generateSkill(prompt, auditResult) {
    // 只有高置信度才自动生成
    if (auditResult.confidence.overall < 0.9) {
      throw new Error('置信度不足，无法自动生成代码');
    }
    
    // 1. 生成模板
    const template = await this.generateTemplate(prompt);
    
    // 2. 渲染代码
    const code = this.templateEngine.render(template, {
      prompt: prompt,
      constraints: auditResult.alignment.constraints,
      workflow: auditResult.alignment.workflow
    });
    
    // 3. 安全验证
    const validation = await this.codeValidator.validate(code);
    if (!validation.safe) {
      throw new Error('生成的代码存在安全风险');
    }
    
    // 4. 沙箱测试
    const testResult = await this.sandbox.execute(code);
    if (!testResult.success) {
      return this.generateFallback(prompt, auditResult);
    }
    
    return {
      code: code,
      validation: validation,
      test_result: testResult,
      confidence: auditResult.confidence.overall
    };
  }
}
```

### 4. 不确定性处理模块

#### 4.1 用户界面反馈
```javascript
class UncertaintyHandler {
  constructor() {
    this.uiManager = new UIManager();
    this.notificationSystem = new NotificationSystem();
  }
  
  // 处理不确定性
  async handleUncertainty(auditResult) {
    const uncertainty = this.identifyUncertainty(auditResult);
    
    switch (uncertainty.type) {
      case 'missing_constraints':
        await this.showConstraintWizard(auditResult);
        break;
      case 'logic_inconsistency':
        await this.showLogicAnalyzer(auditResult);
        break;
      case 'ambiguous_context':
        await this.showContextClarifier(auditResult);
        break;
      default:
        await this.showGeneralFeedback(auditResult);
    }
  }
  
  // 显示约束向导
  async showConstraintWizard(auditResult) {
    const wizard = new ConstraintWizard();
    const result = await wizard.show({
      missing_constraints: auditResult.alignment.constraints.missing,
      suggestions: auditResult.feedback.suggestions
    });
    
    if (result.completed) {
      // 更新提示词
      const updatedPrompt = await this.updatePrompt(result.updates);
      return await this.reauditPrompt(updatedPrompt);
    }
    
    return auditResult;
  }
}
```

## 📱 用户界面设计

### 1. 主编辑界面
```html
<div class="wiki-skill-editor">
  <!-- 顶部工具栏 -->
  <div class="editor-toolbar">
    <div class="toolbar-left">
      <h1 contenteditable="true" class="skill-title">{{ skill.name }}</h1>
      <span class="skill-status" :class="statusClass">{{ statusText }}</span>
    </div>
    
    <div class="toolbar-right">
      <button class="btn-save" @click="save">💾 保存</button>
      <button class="btn-audit" @click="audit">🔍 审核</button>
      <button class="btn-generate" @click="generate" :disabled="!canGenerate">⚡ 生成</button>
      <div class="active-users">
        <div v-for="user in activeUsers" :key="user.id" 
             class="user-avatar" 
             :style="{backgroundColor: user.color}">
          {{ user.initial }}
        </div>
      </div>
    </div>
  </div>
  
  <!-- 主编辑区域 -->
  <div class="editor-main">
    <!-- 左侧编辑器 -->
    <div class="editor-pane">
      <div class="editor-tabs">
        <div class="tab active" @click="switchTab('edit')">编辑</div>
        <div class="tab" @click="switchTab('preview')">预览</div>
        <div class="tab" @click="switchTab('audit')">审核</div>
        <div class="tab" @click="switchTab('code')">代码</div>
      </div>
      
      <div id="monaco-editor" class="monaco-editor"></div>
    </div>
    
    <!-- 右侧辅助面板 -->
    <div class="assistant-panel">
      <!-- 审核结果 -->
      <div class="audit-results" v-if="auditResult">
        <h3>审核结果</h3>
        <div class="confidence-score">
          <span>置信度：</span>
          <div class="score-bar">
            <div class="score-fill" :style="{width: auditResult.confidence.overall * 100 + '%'}"></div>
          </div>
          <span class="score-text">{{ Math.round(auditResult.confidence.overall * 100) }}%</span>
        </div>
        
        <div v-if="auditResult.feedback.issues.length > 0" class="issues">
          <h4>需要修复的问题：</h4>
          <div v-for="issue in auditResult.feedback.issues" 
               class="issue-item" 
               :key="issue.type">
            <span class="issue-type">{{ issue.type }}</span>
            <span class="issue-message">{{ issue.message }}</span>
          </div>
        </div>
        
        <div v-if="auditResult.feedback.suggestions.length > 0" class="suggestions">
          <h4>改进建议：</h4>
          <div v-for="suggestion in auditResult.feedback.suggestions" 
               class="suggestion-item" 
               :key="suggestion.id">
            <button @click="applySuggestion(suggestion)" class="btn-apply">
              应用
            </button>
            <span class="suggestion-text">{{ suggestion.text }}</span>
          </div>
        </div>
      </div>
      
      <!-- 协作者信息 -->
      <div class="collaborators">
        <h3>协作者</h3>
        <div v-for="user in collaborators" :key="user.id" class="collaborator">
          <div class="user-info">
            <span class="user-name">{{ user.name }}</span>
            <span class="user-role">{{ user.role }}</span>
          </div>
          <div class="user-status" :class="user.status">
            {{ user.status === 'online' ? '🟢' : '🔴' }}
          </div>
        </div>
      </div>
      
      <!-- 版本历史 -->
      <div class="version-history">
        <h3>版本历史</h3>
        <div v-for="version in versions" :key="version.hash" class="version-item">
          <div class="version-info">
            <span class="version-message">{{ version.message }}</span>
            <span class="version-author">{{ version.author }}</span>
            <span class="version-time">{{ formatTime(version.date) }}</span>
          </div>
          <div class="version-actions">
            <button @click="viewVersion(version.hash)" class="btn-view">
              查看
            </button>
            <button @click="restoreVersion(version.hash)" class="btn-restore">
              恢复
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 底部状态栏 -->
  <div class="editor-statusbar">
    <div class="status-left">
      <span>行: {{ cursorPosition.line }}, 列: {{ cursorPosition.column }}</span>
      <span>字数: {{ wordCount }}</span>
      <span>审核状态: {{ auditStatus }}</span>
    </div>
    <div class="status-right">
      <span v-if="isProcessing" class="processing-indicator">⚡ 处理中...</span>
      <span v-if="lastSaved" class="saved-indicator">
        ✅ 已保存于 {{ formatTime(lastSaved) }}
      </span>
      <span class="connection-status" :class="connectionStatus">
        {{ connectionStatus === 'connected' ? '🟢' : '🔴' }}
      </span>
    </div>
  </div>
</div>
```

### 2. 不确定性处理界面
```html
<!-- 不确定性处理模态框 -->
<div class="uncertainty-modal" v-if="showModal">
  <div class="modal-overlay" @click="closeModal"></div>
  <div class="modal-content">
    <div class="modal-header">
      <h2>需要您的确认</h2>
      <button class="btn-close" @click="closeModal">✕</button>
    </div>
    
    <div class="modal-body">
      <div class="uncertainty-info">
        <h3>{{ uncertainty.title }}</h3>
        <p>{{ uncertainty.description }}</p>
        
        <div v-if="uncertainty.options" class="uncertainty-options">
          <h4>请选择处理方式：</h4>
          <div v-for="option in uncertainty.options" 
               :key="option.id" 
               class="option-item">
            <input type="radio" 
                   :id="option.id" 
                   v-model="selectedOption" 
                   :value="option.id">
            <label :for="option.id">{{ option.text }}</label>
            <p class="option-description">{{ option.description }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="modal-footer">
      <button class="btn-cancel" @click="closeModal">取消</button>
      <button class="btn-confirm" @click="confirmChoice">确认</button>
    </div>
  </div>
</div>
```

## 🔄 工作流程

### 1. 技能创建流程
```
用户输入提示词 → 自动审核 → 置信度评估 → 
  ├─ 高置信度(>90%) → 自动生成代码 → 完成
  ├─ 中置信度(70-90%) → 人工审核 → 确认后生成
  └─ 低置信度(<70%) → 反馈修改 → 重新审核
```

### 2. 协同编辑流程
```
多用户同时编辑 → 实时同步 → 冲突检测 → 
  ├─ 无冲突 → 正常保存 → 版本记录
  └─ 有冲突 → 智能合并 → 用户确认 → 版本记录
```

### 3. 审核反馈流程
```
提示词提交 → 约束检查 → 逻辑验证 → 
  ├─ 通过 → 生成反馈 → 用户确认
  ├─ 警告 → 生成建议 → 用户修改
  └─ 错误 → 生成错误报告 → 用户重新提交
```

## 🌐 网页使用步骤

### 第一步：环境准备
1. 确保已安装Node.js环境
2. 安装Stigmergy CLI工具：`npm install -g stigmergy-cli`
3. 配置各个CLI工具的API密钥和认证信息

### 第二步：启动WikiSkill系统
1. 克隆项目仓库：`git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents`
2. 进入项目目录：`cd stigmergy-CLI-Multi-Agents`
3. 启动WikiSkill服务：`npm run start:wikiskill`
4. 访问Web界面：`http://localhost:3000`

### 第三步：创建新技能
1. 登录系统并点击"创建新技能"
2. 输入技能名称和描述
3. 在编辑器中编写提示词内容
4. 设置技能的权限和协作者

### 第四步：协同编辑
1. 邀请团队成员加入协作
2. 实时编辑技能定义
3. 查看审核结果和反馈
4. 根据建议优化提示词

### 第五步：技能部署（三种使用方式）

#### 方式一：Stigmergy命令直接使用（指定CLI + 任务）
```bash
# 使用特定CLI执行任务
stigmergy use claude to "创建一个Python脚本来处理数据分析"

# 指定具体任务和参数
stigmergy use gemini to "翻译以下文本为英文：你好世界"
```

#### 方式二：Stigmergy命令智能分配CLI（直接CALL任务）
```bash
# 系统自动选择最适合的CLI
stigmergy call "分析这段代码的性能瓶颈"

# 智能分配最佳工具执行复杂任务
stigmergy call "创建一个完整的Web应用项目结构"
```

#### 方式三：各CLI中自然语言激活钩子示范
```bash
# 在Claude CLI中激活钩子
claude> /wikiskill create "创建一个自动化测试技能"

# 在Gemini CLI中使用钩子
gemini> ask wikiskill to "优化现有代码结构"

# 在其他CLI中调用WikiSkill功能
any-cli> use wikiskill to "生成API文档"
```

### 第六步：CLI切换与会话恢复

#### 切换CLI工具
1. **保存当前会话**：
   ```bash
   # 在当前CLI中保存会话状态
   stigmergy session save --name "current-work"
   ```

2. **切换到新CLI**：
   ```bash
   # 切换到指定CLI环境
   stigmergy switch to claude
   
   # 或者使用智能切换
   stigmergy switch --auto "最适合当前任务的CLI"
   ```

3. **恢复会话状态**：
   ```bash
   # 在新CLI中恢复之前的会话
   stigmergy session restore --name "current-work"
   
   # 或者自动恢复最近的会话
   stigmergy session restore --latest
   ```

#### 会话状态同步
- **上下文保持**：任务历史、变量状态、工作流进度
- **工具链继承**：已安装的工具、配置参数、环境变量
- **协作状态**：当前协作者、权限级别、编辑锁状态

#### 智能切换建议
系统会根据以下因素推荐最佳CLI：
- 任务类型匹配度
- 历史使用偏好
- 当前工作负载
- 工具特长评估

### 第七步：监控与维护
1. 查看技能使用统计
2. 监控系统性能指标
3. 处理用户反馈和问题
4. 定期更新和优化技能

## 📊 性能指标

### 预期性能指标
| 指标 | 目标值 | 监控方式 |
|------|--------|----------|
| 并发用户数 | 1000+ | 实时监控 |
| 编辑延迟 | <100ms | 性能测试 |
| 审核响应时间 | <3s | 日志分析 |
| 代码生成时间 | <5s | 计时监控 |
| 系统可用性 | 99.9% | 健康检查 |
| 数据一致性 | 100% | 一致性检查 |

### 可扩展性指标
- **水平扩展**：支持多实例部署
- **垂直扩展**：支持资源动态调整
- **模块化设计**：各组件独立扩展

## 🛡️ 安全考虑

### 1. 代码生成安全
- 多层安全检查机制
- 沙箱执行环境
- 人工审核重要技能

### 2. 数据安全
- 用户权限控制
- 数据加密传输
- 审计日志记录

### 3. 系统安全
- 输入验证和清理
- SQL注入防护
- XSS攻击防护

---

**设计团队**：WikiSkill设计团队  
**设计日期**：2025年12月  
**版本**：v1.0