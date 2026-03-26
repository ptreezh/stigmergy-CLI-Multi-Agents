# WeChat 多模态对话与任务执行架构设计

> **创建日期**: 2026-03-24
> **设计目标**: 实现完整的多模态对话系统和任务执行引擎
> **核心要求**: 文本、语音、图片 + 任务执行、命令指令

---

## 1. 系统架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    WeChat Hub (核心)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  多Bot管理器  │  │  会话管理器  │  │  事件路由器   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              多模态消息处理层 (Multimodal Layer)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  文本处理器   │  │  语音处理器  │  │  图片处理器   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              任务执行引擎 (Task Engine)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  命令解析器   │  │  任务调度器  │  │  执行处理器   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              CLI 集成层 (CLI Integration)                    │
│  Claude │ Gemini │ Qwen │ iFlow │ QoderCLI │ ...             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 多模态消息处理

### 2.1 文本消息处理

```javascript
class TextMessageHandler {
  async handle(message) {
    // 1. 文本预处理
    const cleaned = this.preprocess(message.content);

    // 2. 命令检测
    if (this.isCommand(cleaned)) {
      return this.commandHandler.handle(cleaned);
    }

    // 3. 任务检测
    if (this.isTask(cleaned)) {
      return this.taskHandler.handle(cleaned);
    }

    // 4. 普通对话
    return this.conversationHandler.handle(cleaned);
  }
}
```

### 2.2 语音消息处理

```javascript
class VoiceMessageHandler {
  constructor() {
    this.silkDecoder = new SILKDecoder();
    this.sttService = new SpeechToTextService();
  }

  async handle(message) {
    try {
      // 1. 下载语音文件
      const voiceData = await this.downloadVoice(message.voice);

      // 2. 解码SILK格式
      const pcmData = await this.silkDecoder.decode(voiceData);

      // 3. 转换为文本
      const text = await this.sttService.transcribe(pcmData);

      // 4. 转发给文本处理器
      return this.textHandler.handle({
        ...message,
        content: text,
        originalFormat: 'voice'
      });
    } catch (error) {
      // Fallback: 发送文字转语音提示
      return this.sendVoiceFallbackMessage(message);
    }
  }

  async downloadVoice(voiceUrl) {
    // 处理AES-128-ECB加密的CDN文件
    const encrypted = await this.cdnClient.download(voiceUrl);
    return this.decryptAES128ECB(encrypted);
  }
}
```

### 2.3 图片消息处理

```javascript
class ImageMessageHandler {
  async handle(message) {
    try {
      // 1. 下载图片
      const imageData = await this.downloadImage(message.image);

      // 2. 图片内容识别（OCR/视觉理解）
      const analysis = await this.analyzeImage(imageData);

      // 3. 构建增强消息
      const enhancedMessage = {
        ...message,
        content: analysis.text || '',
        imageDescription: analysis.description,
        visualContext: analysis.context,
        originalFormat: 'image'
      };

      // 4. 转发给文本处理器
      return this.textHandler.handle(enhancedMessage);
    } catch (error) {
      return this.sendImageFallbackMessage(message);
    }
  }
}
```

---

## 3. 任务执行引擎

### 3.1 命令解析器

```javascript
class CommandParser {
  constructor() {
    this.patterns = {
      // CLI选择命令
      cliSelect: /^(?:切换|使用|use)\s+(.+?)\s+(?:cli|CLI)$/i,

      // 任务执行命令
      taskExecute: /^(?:执行|运行|run|execute)\s+(.+)$/i,

      // 查询命令
      query: /^(?:查询|搜索|search|query)\s+(.+)$/i,

      // 设置命令
      config: /^(?:设置|配置|config|set)\s+(.+)$/i,

      // 状态命令
      status: /^(?:状态|status|查看状态)$/i,
    };
  }

  parse(message) {
    for (const [type, pattern] of Object.entries(this.patterns)) {
      const match = message.match(pattern);
      if (match) {
        return {
          type: 'command',
          commandType: type,
          params: match[1],
          confidence: 0.95
        };
      }
    }

    // 使用NLP进行自然语言意图识别
    return this.nlpParse(message);
  }
}
```

### 3.2 任务调度器

```javascript
class TaskScheduler {
  constructor() {
    this.taskQueue = new PriorityQueue();
    this.runningTasks = new Map();
    this.cliPool = new CLIPool();
  }

  async schedule(task) {
    // 1. 任务优先级评估
    const priority = await this.assessPriority(task);

    // 2. CLI选择
    const targetCLI = await this.selectBestCLI(task);

    // 3. 资源检查
    if (!await this.checkAvailability(targetCLI)) {
      return this.queueTask(task, priority);
    }

    // 4. 执行任务
    return this.executeTask(task, targetCLI);
  }

  async selectBestCLI(task) {
    // 基于任务类型和CLI能力匹配
    const cliCapabilities = {
      claude: { code: 0.95, reasoning: 0.95, conversation: 0.90 },
      gemini: { multimodal: 0.95, conversation: 0.90, reasoning: 0.85 },
      qwen: { code: 0.85, chinese: 0.95, conversation: 0.90 },
      // ... 其他CLI
    };

    // 任务需求分析
    const requirements = this.analyzeRequirements(task);

    // 最佳匹配
    return this.findBestMatch(requirements, cliCapabilities);
  }
}
```

### 3.3 执行处理器

```javascript
class TaskExecutor {
  async execute(task, targetCLI) {
    const taskId = this.generateTaskId();

    try {
      // 1. 创建执行上下文
      const context = await this.createContext(task, targetCLI);

      // 2. 发送到目标CLI
      const result = await this.sendToCLI(targetCLI, task);

      // 3. 监控执行进度
      const progress = await this.monitorExecution(taskId);

      // 4. 收集结果
      const finalResult = await this.collectResult(taskId);

      // 5. 格式化响应
      return this.formatResponse(finalResult);

    } catch (error) {
      return this.handleExecutionError(taskId, error);
    }
  }

  async sendToCLI(cli, task) {
    // 使用stigmergy call机制
    const response = await this.stigmergyClient.call({
      tool: cli,
      task: task.description,
      mode: task.interactive ? 'interactive' : 'one-time'
    });

    return response;
  }
}
```

---

## 4. 消息路由与处理流程

### 4.1 路由决策

```javascript
class MessageRouter {
  async route(message) {
    // 1. 消息类型检测
    const messageType = this.detectMessageType(message);

    // 2. 获取处理器
    const handler = this.getHandler(messageType);

    // 3. 预处理
    const preprocessed = await this.preprocess(message);

    // 4. 委托给处理器
    const result = await handler.handle(preprocessed);

    // 5. 后处理
    return this.postprocess(result, messageType);
  }

  detectMessageType(message) {
    if (message.voice) return 'voice';
    if (message.image) return 'image';
    if (message.content) return 'text';
    return 'unknown';
  }
}
```

### 4.2 处理流程

```
微信消息接收
    ↓
消息类型检测
    ↓
┌───────────┬───────────┬───────────┐
│  文本消息  │  语音消息  │  图片消息  │
└─────┬─────┴─────┬─────┴─────┬─────┘
      │           │           │
      ↓           ↓           ↓
  文本预处理   SILK解码   图片下载
      │           │           │
      └───────────┴───────────┘
                  ↓
         命令/任务/对话检测
                  ↓
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
命令处理      任务处理      对话处理
    ↓             ↓             ↓
 CLI执行      任务调度      AI对话
    └─────────────┴─────────────┘
                  ↓
         结果格式化与响应
```

---

## 5. CLI集成策略

### 5.1 多CLI协作模式

```javascript
class CLICoordinator {
  constructor() {
    this.cliInstances = new Map();
    this.loadBalancer = new LoadBalancer();
  }

  async distribute(task) {
    // 1. 分析任务特征
    const features = this.analyzeTaskFeatures(task);

    // 2. CLI能力匹配
    const candidates = this.matchCLICapabilities(features);

    // 3. 负载均衡
    const selected = this.loadBalancer.select(candidates);

    // 4. 执行任务
    return this.executeOnCLI(selected, task);
  }

  analyzeTaskFeatures(task) {
    return {
      requiresCode: this.containsCode(task),
      requiresMultimodal: this.hasMultimodal(task),
      requiresChinese: this.isChinese(task),
      requiresReasoning: this.isComplexReasoning(task),
      interactive: this.needsConversation(task)
    };
  }
}
```

### 5.2 会话管理

```javascript
class SessionManager {
  constructor() {
    this.sessions = new Map(); // userId -> session
    this.sessionTimeout = 30 * 60 * 1000; // 30分钟
  }

  async getSession(userId) {
    let session = this.sessions.get(userId);

    if (!session || this.isExpired(session)) {
      session = await this.createSession(userId);
    }

    return session;
  }

  async createSession(userId) {
    // 为用户选择最佳CLI
    const preferredCLI = await this.selectPreferredCLI(userId);

    const session = {
      userId,
      cli: preferredCLI,
      context: new ConversationContext(),
      createdAt: Date.now(),
      lastActiveAt: Date.now()
    };

    this.sessions.set(userId, session);
    return session;
  }

  async selectPreferredCLI(userId) {
    // 基于用户历史和任务模式选择CLI
    const history = await this.getUserHistory(userId);
    const patterns = this.analyzePatterns(history);

    return this.recommendCLI(patterns);
  }
}
```

---

## 6. 实现优先级

### Phase 1: 核心框架 (当前重点)
- [x] WeChat客户端基础
- [x] Hub架构设计
- [ ] 多模态消息处理框架
- [ ] 命令解析器
- [ ] 任务调度器基础

### Phase 2: 语音支持
- [ ] SILK解码器集成
- [ ] CDN文件下载（AES-128-ECB解密）
- [ ] STT服务集成
- [ ] TTS响应生成

### Phase 3: 图片支持
- [ ] 图片下载和解密
- [ ] 图片内容识别
- [ ] OCR文本提取
- [ ] 视觉理解

### Phase 4: 任务执行
- [ ] 命令解析完善
- [ ] CLI能力评估
- [ ] 任务调度优化
- [ ] 执行监控和反馈

### Phase 5: 高级功能
- [ ] 多轮对话管理
- [ ] 上下文记忆
- [ ] 个性化CLI推荐
- [ ] 性能优化

---

## 7. 技术栈

### 核心依赖
- **Node.js**: >= 16.0.0
- **WebSocket**: ws库（iLink API）
- **SILK解码**: silk-wasm或silk-v3-decoder
- **加密**: crypto库（AES-128-ECB）
- **图片处理**: sharp或jimp
- **OCR**: tesseract.js
- **视觉理解**: @anthropic-ai/claude-code或@google/gemini-cli

### CLI集成
- **stigmergy call**: 跨CLI调用机制
- **Hook部署**: stigmergy deploy
- **OAuth**: Qwen等需要OAuth的CLI

---

## 8. 示例场景

### 场景1: 语音任务执行
```
用户: [语音消息] "帮我用Claude写一个快速排序"

系统处理:
1. 接收语音消息
2. SILK解码 → PCM
3. STT转文字: "帮我用Claude写一个快速排序"
4. 命令解析: { type: 'task', target: 'claude', task: '写一个快速排序' }
5. CLI选择: Claude
6. 任务执行: stigmergy call claude "写一个快速排序"
7. 结果返回: 代码 + 解释
8. TTS响应: [语音消息]
```

### 场景2: 图片理解
```
用户: [图片] "这个错误怎么修？"

系统处理:
1. 接收图片
2. 下载和解密
3. 视觉理解: 识别错误信息
4. OCR提取: "TypeError: Cannot read property 'x' of undefined"
5. 上下文分析: JavaScript错误
6. CLI选择: Claude（擅长代码调试）
7. 任务执行: 分析并生成修复方案
8. 响应: 文字解释 + 修复代码
```

### 场景3: 多轮对话
```
用户: "帮我分析一下这个项目的架构"
系统: [使用Gemini分析项目结构]

用户: "太复杂了，用中文再解释一遍"
系统: [切换到Qwen，用中文重新解释]

用户: "给我画个架构图"
系统: [使用支持图形生成的CLI]
```

---

## 9. 性能与监控

### 性能指标
- **消息响应时间**: < 3秒
- **语音转文字**: < 5秒
- **图片分析**: < 10秒
- **任务执行**: 取决于CLI，但监控超时
- **并发支持**: 5+ CLI同时运行

### 监控指标
```javascript
class PerformanceMonitor {
  track(message) {
    return {
      messageType: message.type,
      processingTime: Date.now() - message.receivedAt,
      cliUsed: message.targetCLI,
      success: message.success,
      errors: message.errors
    };
  }

  async report() {
    const metrics = {
      totalMessages: this.count,
      avgResponseTime: this.avgResponseTime,
      cliUsage: this.cliDistribution,
      errorRate: this.errorRate
    };

    return metrics;
  }
}
```

---

## 10. 下一步行动

1. **立即**: 实现多模态消息处理框架
2. **短期**: 集成SILK解码器，实现语音支持
3. **中期**: 实现图片处理和OCR
4. **长期**: 完善任务执行引擎和优化性能

---

**架构版本**: 1.0.0
**状态**: 🎯 设计完成，待实现
**下一步**: 开始实现Phase 1核心框架
