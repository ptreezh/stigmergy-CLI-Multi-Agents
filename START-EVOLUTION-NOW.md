# 🚀 启动真实的 AI 进化系统

## 立即开始

### 方式 1: 自主进化系统 (推荐)
```bash
node autonomous-evolution-system.js
```

**预期输出**:
```
╔════════════════════════════════════════════════════════════╗
║   真实的 AI 自主进化系统                                     ║
║   使用 Stigmergy 多 CLI 协调                                 ║
╚════════════════════════════════════════════════════════════╝

╔════════════════════════════════════════════════════════════╗
║   进化迭代 #1                                          ║
╚════════════════════════════════════════════════════════════╝

📋 策略: crossValidation
🔍 策略 A: 交叉验证
──────────────────────────────────────────────────────────────────────
📄 目标文件: src/core/coordination/collaboration_coordinator.js

✅ 迭代 #1 完成
💡 等待 30 秒后进行下一轮...
```

**特点**:
- ✅ 完全自主运行
- ✅ 无需人工干预
- ✅ 自动轮换三种进化策略
- ✅ 持久化进化日志
- ✅ 30 秒间隔自动迭代

### 方式 2: 快速演示
```bash
node quick-start-evolution.js
```

**预期输出**:
```
╔════════════════════════════════════════════════════════════╗
║   快速启动 - 真实的 AI 进化系统                               ║
║   使用 Qwen CLI 进行自主进化                                 ║
╚════════════════════════════════════════════════════════════╝

📌 Demo 1: 并发代码分析
──────────────────────────────────────────────────────────────────────
执行任务: 代码复杂度分析...

✅ 结果:
[真实的 AI 分析输出]

💾 结果已保存: C:\bde\stigmergy\evolution-demos\demo1-analysis.json
```

### 方式 3: 并发执行测试
```bash
stigmergy concurrent "Analyze this code and provide improvements" -c 3
```

**预期输出**:
```
========================================
  Stigmergy 并发执行
========================================

📋 任务: Analyze this code...
⚙️  选项:
   并发数: 3
   超时: 0 ms
   模式: parallel
──────────────────────────────────────────────────────────────────────

🤖 选中 CLI: qwen, codebuddy, kilo

🚀 启动 CLI 进程 (带上下文协调)...

⏳ 等待所有 CLI 完成...

[qwen] [真实的 AI 分析输出]

========================================
  执行完成
========================================

📊 总计: 3 个 CLI
✅ 成功: 1
❌ 失败: 2
```

## 监控进化过程

### 实时查看日志
```bash
tail -f evolution-log.jsonl
```

**输出示例**:
```json
{"timestamp":"2026-03-07T02:47:51.225Z","iteration":1,"strategy":"crossValidation","result":{"success":false,"error":"Not enough valid analyses"}}
{"timestamp":"2026-03-07T03:18:21.478Z","iteration":2,"strategy":"collaboration","result":{"success":true,"strategy":"collaboration","tasksCompleted":2,"totalTasks":2}}
```

### 查看进化状态
```bash
cat evolution-state.json
```

**输出示例**:
```json
{
  "iterations": 2,
  "lastStrategy": "collaboration",
  "lastSuccess": true
}
```

### 查看共享上下文
```bash
cat STIGMERGY.md
```

## 演示脚本

### 协作进化演示
```bash
node demonstrate-collaboration.js
```

**演示内容**:
- CLI 1: 生成 Fibonacci 函数
- CLI 2: 编写单元测试
- CLI 3: 优化性能

### 竞争进化演示
```bash
node demonstrate-competition.js
```

**演示内容**:
- 多个 CLI 竞争解决同一问题
- 自动评分 (正确性 40分, 健壮性 30分, 文档 20分, 最佳实践 10分)
- 选择最优解

## 系统要求

### 必需
- Node.js >= 16.0.0
- Stigmergy CLI
- 至少 1 个可用的 AI CLI (当前: Qwen)

### 可选
- 多个 AI CLI (用于真正的多 LLM 进化)
- API keys / OAuth tokens (某些 CLI 需要)

### 当前可用 CLI
```
✅ qwen        - 工作正常
❌ iflow       - 需要认证
❌ opencode    - 参数适配问题
❌ gemini      - 参数冲突
❌ qodercli    - 需要认证
❌ codebuddy   - 需要认证
❌ codex       - 参数解析问题
❌ kilo        - 命令未识别
```

## 停止进化系统

### 如果在前台运行
```bash
Ctrl + C
```

### 如果在后台运行
```bash
# 查找进程
ps aux | grep autonomous-evolution-system

# 终止进程
kill <PID>
```

## 故障排除

### 问题 1: CLI 认证失败
**解决方案**:
```bash
# 登录到 CLI
stigmergy login

# 或设置环境变量
export QODER_PERSONAL_ACCESS_TOKEN=your_token
```

### 问题 2: 没有可用的 CLI
**解决方案**:
```bash
# 扫描可用的 CLI
stigmergy scan

# 安装缺失的 CLI
stigmergy install
```

### 问题 3: 进化日志为空
**解决方案**:
```bash
# 检查系统是否正在运行
ps aux | grep autonomous-evolution-system

# 查看错误日志
cat evolution-error.log
```

## 进阶配置

### 自定义进化间隔
编辑 `autonomous-evolution-system.js`:
```javascript
// 默认 30 秒
await this.sleep(30000);

// 改为 5 分钟
await this.sleep(300000);
```

### 自定义进化策略
编辑 `autonomous-evolution-system.js`:
```javascript
strategies = {
  crossValidation: this.runCrossValidation.bind(this),
  collaboration: this.runCollaboration.bind(this),
  competition: this.runCompetition.bind(this),
  // 添加自定义策略
  customStrategy: this.runCustomStrategy.bind(this)
};
```

### 自定义评分标准
编辑 `demonstrate-competition.js`:
```javascript
score = {
  correctness: 0,    // 40 分
  robustness: 0,     // 30 分
  documentation: 0,  // 20 分
  bestPractices: 0,  // 10 分
  // 添加新的评分维度
  performance: 0,    // 20 分
  security: 0        // 20 分
};
```

## 性能优化

### 并发优化
```bash
# 增加并发数
stigmergy concurrent "task" -c 5

# 设置超时
stigmergy concurrent "task" -t 120000
```

### 内存优化
```bash
# 定期清理日志
> evolution-log.jsonl

# 压缩旧日志
gzip evolution-log-old.jsonl
```

## 文档

- **完整报告**: `REAL-EVOLUTION-DEMO.md`
- **系统总结**: `EVOLUTION-SYSTEM-SUMMARY.md`
- **项目文档**: `STIGMERGY.md`

## 支持

### 问题反馈
```bash
# 检查系统状态
stigmergy status

# 查看版本
stigmergy --version
```

### 日志位置
```
evolution-log.jsonl          # 进化日志
evolution-state.json         # 进化状态
STIGMERGY.md                 # 共享上下文
.stigmergy/status/PROJECT_STATUS.md  # 项目状态
```

## 🎉 开始进化！

```bash
node autonomous-evolution-system.js
```

**祝您的代码进化愉快！** 🚀

---

**注意**: 这是一个真实的 AI 进化系统，使用真实的 LLM 推理，不是脚本自动化。请确保您理解系统的行为后再运行。

**版本**: 1.0.0
**日期**: 2026-03-07
**状态**: 🟢 运行中
