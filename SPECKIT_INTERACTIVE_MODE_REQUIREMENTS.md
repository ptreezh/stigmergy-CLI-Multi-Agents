# SPECKIT: Stigmergy Interactive Mode Requirements

## 规格信息
- **版本**: 1.0.0
- **状态**: Draft
- **创建日期**: 2026-01-15
- **作者**: Stigmergy CLI Team
- **优先级**: Critical

## 1. 需求概述

### 1.1 背景
当前Stigmergy CLI系统在跨CLI协作时存在以下问题：
1. CLI任务失败时没有自动委托机制
2. 路由到其他CLI时在同一终端执行，无法并行处理
3. 使用非交互模式调用CLI，限制了CLI的shell执行能力
4. 缺少交互式对话模式，用户体验不佳

### 1.2 目标
实现一个完整的交互式对话模式，支持：
- 自动失败委托机制
- 多终端并行执行
- 交互式CLI调用
- 实时进度反馈

## 2. 功能需求

### 2.1 交互式对话模式 (FR-001)

**需求描述**: Stigmergy启动后进入交互式对话模式

**验收标准**:
- [ ] 启动stigmergy后自动进入对话模式
- [ ] 显示欢迎信息和可用命令
- [ ] 支持用户输入自然语言指令
- [ ] 支持多轮对话
- [ ] 保持会话上下文
- [ ] 支持退出命令

**用户故事**:
```
作为一个用户
我希望stigmergy启动后进入交互式对话模式
这样我可以像聊天一样使用stigmergy
而不是每次都要输入完整的命令
```

### 2.2 自动失败委托机制 (FR-002)

**需求描述**: 当某个CLI任务失败时，自动委托给其他可用的CLI

**验收标准**:
- [ ] 检测CLI任务失败
- [ ] 识别失败原因（网络、token限制、超时等）
- [ ] 根据失败原因选择合适的替代CLI
- [ ] 自动重新路由任务到替代CLI
- [ ] 记录委托历史
- [ ] 提供委托日志

**用户故事**:
```
作为一个用户
当某个CLI任务失败时
我希望系统能自动尝试其他CLI
这样我就不需要手动重试
```

**委托规则**:
```javascript
const delegationRules = {
  'network-error': {
    priority: ['qwen', 'iflow', 'claude', 'codebuddy'],
    reason: 'Network connectivity issues'
  },
  'token-limit': {
    priority: ['codebuddy', 'iflow', 'qwen', 'claude'],
    reason: 'Token limit exceeded'
  },
  'timeout': {
    priority: ['claude', 'qwen', 'iflow', 'codebuddy'],
    reason: 'Execution timeout'
  },
  'api-error': {
    priority: ['iflow', 'qwen', 'claude', 'codebuddy'],
    reason: 'API error'
  }
};
```

### 2.3 多终端并行执行 (FR-003)

**需求描述**: 路由到其他CLI时，在新终端窗口中执行

**验收标准**:
- [ ] 为每个CLI任务创建新终端窗口
- [ ] 支持终端窗口管理（打开、关闭、切换）
- [ ] 显示终端窗口状态
- [ ] 支持终端窗口日志收集
- [ ] 支持并行执行多个CLI任务
- [ ] 支持终端窗口清理

**用户故事**:
```
作为一个用户
当stigmergy路由到其他CLI时
我希望在新终端窗口中执行
这样可以看到完整的执行过程
并且可以并行处理多个任务
```

**终端窗口管理**:
```javascript
const terminalManager = {
  // 创建新终端
  createTerminal(cliName, task) {
    return {
      id: generateTerminalId(),
      cliName,
      task,
      status: 'starting',
      createdAt: Date.now(),
      output: []
    };
  },
  
  // 列出所有终端
  listTerminals() {
    return Array.from(this.terminals.values());
  },
  
  // 获取终端状态
  getTerminalStatus(terminalId) {
    return this.terminals.get(terminalId);
  },
  
  // 关闭终端
  closeTerminal(terminalId) {
    // 终止进程
    // 清理资源
  }
};
```

### 2.4 交互式CLI调用 (FR-004)

**需求描述**: 使用交互模式调用CLI，支持shell工具执行

**验收标准**:
- [ ] 使用交互模式启动CLI
- [ ] 支持stdin/stdout/stderr完整交互
- [ ] 支持CLI执行shell命令
- [ ] 支持CLI创建和修改文件
- [ ] 支持CLI调用系统工具
- [ ] 提供完整的执行环境

**用户故事**:
```
作为一个用户
当stigmergy调用其他CLI时
我希望使用交互模式
这样CLI可以执行shell命令
创建文件、运行脚本等
```

**交互模式实现**:
```javascript
const interactiveExecutor = {
  // 交互式执行
  async executeInteractively(cliName, task, options = {}) {
    const terminal = await this.createTerminal(cliName);
    
    // 启动CLI交互模式
    const process = spawn(cliName, ['-i'], {
      cwd: options.cwd || process.cwd(),
      env: options.env || process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // 发送任务
    process.stdin.write(task + '\n');
    
    // 等待响应
    const response = await this.waitForResponse(process, options.timeout);
    
    return response;
  },
  
  // 等待响应
  async waitForResponse(process, timeout = 300000) {
    return new Promise((resolve, reject) => {
      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
        
        // 检测响应完成
        if (this.isResponseComplete(output)) {
          resolve(output);
        }
      });
      
      // 超时处理
      setTimeout(() => {
        process.kill();
        reject(new Error('Timeout waiting for response'));
      }, timeout);
    });
  }
};
```

### 2.5 实时进度反馈 (FR-005)

**需求描述**: 提供实时的执行进度反馈

**验收标准**:
- [ ] 显示当前执行的CLI
- [ ] 显示终端窗口状态
- [ ] 显示任务进度
- [ ] 显示执行时间
- [ ] 显示输出摘要
- [ ] 支持进度暂停/继续

**用户故事**:
```
作为一个用户
当stigmergy执行任务时
我希望看到实时的进度反馈
这样我可以知道任务的状态
```

## 3. 非功能需求

### 3.1 性能需求 (NFR-001)
- 终端窗口创建时间 < 1秒
- 委托决策时间 < 100ms
- 并发执行支持 ≥ 5个终端
- 内存使用 < 500MB

### 3.2 可靠性需求 (NFR-002)
- 终端窗口崩溃率 < 1%
- 委托成功率 > 90%
- 自动恢复时间 < 5秒
- 数据持久化保证

### 3.3 可用性需求 (NFR-003)
- 交互模式启动时间 < 2秒
- 命令响应时间 < 100ms
- 错误信息清晰易懂
- 提供帮助文档

### 3.4 安全性需求 (NFR-004)
- 终端窗口权限控制
- 敏感信息保护
- 审计日志记录
- 输入验证

## 4. 约束条件

### 4.1 技术约束
- 必须支持Windows、macOS、Linux
- 必须支持主流CLI工具（claude, qwen, iflow等）
- 必须保持向后兼容
- 必须支持现有命令行参数

### 4.2 业务约束
- 不能增加用户学习成本
- 必须保持简单易用
- 必须提供清晰的反馈
- 必须支持降级方案

## 5. 依赖关系

### 5.1 外部依赖
- Node.js >= 16.0.0
- 终端窗口管理库
- CLI工具（claude, qwen, iflow等）

### 5.2 内部依赖
- CrossCLIExecutor
- IntentRouter
- GracefulDegradation
- ErrorHandler

## 6. 风险和缓解

### 6.1 风险1: 终端窗口管理复杂性
**风险**: 不同操作系统的终端窗口管理API差异大
**缓解**: 使用跨平台的终端管理库

### 6.2 风险2: 资源消耗
**风险**: 多终端并行可能导致资源消耗过大
**缓解**: 限制并发数量，实现资源监控

### 6.3 风险3: 交互模式稳定性
**风险**: 交互模式可能不稳定或难以控制
**缓解**: 实现超时和强制终止机制

## 7. 成功指标

### 7.1 功能指标
- 交互模式成功率 > 95%
- 委托成功率 > 90%
- 终端窗口创建成功率 > 95%

### 7.2 性能指标
- 交互模式启动时间 < 2秒
- 委托决策时间 < 100ms
- 终端窗口创建时间 < 1秒

### 7.3 用户满意度
- 用户满意度评分 > 4.0/5.0
- 任务完成时间减少 > 50%
- 错误重试次数减少 > 70%

## 8. 验收标准

### 8.1 功能验收
- [ ] 所有功能需求通过验收测试
- [ ] 所有用户场景验证成功
- [ ] 所有边缘情况处理正确

### 8.2 非功能验收
- [ ] 所有性能指标达标
- [ ] 所有可靠性指标达标
- [ ] 所有安全要求满足

### 8.3 用户验收
- [ ] 用户测试通过
- [ ] 用户反馈积极
- [ ] 用户接受度高

## 9. 实施优先级

### 9.1 Phase 1: 核心 (P0)
- FR-001: 交互式对话模式
- FR-003: 多终端并行执行
- FR-004: 交互式CLI调用

### 9.2 Phase 2: 增强 (P1)
- FR-002: 自动失败委托机制
- FR-005: 实时进度反馈

### 9.3 Phase 3: 优化 (P2)
- 性能优化
- 用户体验优化
- 错误处理优化

## 10. 附录

### 10.1 术语表
- **交互模式**: CLI工具的交互式执行模式，支持多轮对话
- **委托**: 将任务从一个CLI转移到另一个CLI
- **终端窗口**: 独立的终端实例，用于执行CLI任务
- **并行执行**: 同时执行多个任务

### 10.2 参考资料
- Stigmergy CLI Architecture
- CLI Tools Documentation
- Terminal Management Libraries

---
*规格版本*: 1.0.0  
*最后更新*: 2026-01-15  
*状态*: Draft  
*审批*: Pending