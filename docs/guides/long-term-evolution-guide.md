# Stigmergy 长时自主进化系统 - 快速指南

**版本**: 1.0.0
**更新**: 2026-03-06

---

## 🎯 系统概述

这是一个**长期运行的自主进化系统**，旨在实现：
- ✅ 双 Agent Loop 协作
- ✅ 自我能力评估和改进
- ✅ 持续技能进化
- ✅ 最小化人工干预

---

## 🚀 快速开始

### 1. 查看进度

```bash
cd /path/to/stigmergy
node scripts/track-progress.js
```

**输出**:
```
╔════════════════════════════════════════════════════════════╗
║   Stigmergy 自主进化进度报告                              ║
╚════════════════════════════════════════════════════════════╝

📊 整体进度
  [███████░░░░░░░░░░░░░░░░░░░░] 23.5%

📈 各维度进度

  反思记录:
    [███░░░░░░░░░░░░] 30.0%
    实际: 3 / 目标: 10

  进化技能:
    [███░░░░░░░░░░░░] 10.0%
    实际: 1 / 目标: 10
```

### 2. 启动进化

```bash
node scripts/start-evolution.js
```

**输出**:
```
╔════════════════════════════════════════════════════════════╗
║   Stigmergy 自主进化系统启动                              ║
║   Stigmergy Autonomous Evolution System                   ║
╚════════════════════════════════════════════════════════════╝

📊 系统状态检查

  ✅ 记忆目录: 已创建
  ✅ 反思目录: 已创建
  ✅ 进化技能目录: 已创建

  💾 会话记忆: 15 条
  🧠 反思记录: 3 条
  ⚡ 进化技能: 1 个

🚀 启动模式: AUTO

✅ 自主进化系统已启动！

💡 提示:
  • 系统将每分钟自动执行进化任务
  • 所有进化过程将被记录
  • 使用 Ctrl+C 停止系统
```

### 3. 查看状态

```bash
node src/core/soul_engine/cli.js status
```

### 4. 查看详细计划

```bash
cat docs/planning/task_plan.md
cat docs/planning/findings.md
cat docs/planning/progress.md
```

---

## 📋 进化阶段

### 阶段 1: 双 Agent Loop 基础架构 (2-3 周)
- [ ] Planner Agent - 任务规划和分解
- [ ] Executor Agent - 技能执行和反馈
- [ ] Agent 通信 - 协议和消息传递
- [ ] 协作测试 - 验证协作效果

### 阶段 2: 自我评估系统 (3-4 周)
- [ ] 能力评估框架 - 多维度评分
- [ ] 自我评估 Agent - 性能分析
- [ ] 改进建议生成 - 优先级排序
- [ ] 评估报告 - 自动生成

### 阶段 3: 闭环进化系统 (4-6 周)
- [ ] 进化循环 - 评估→改进→验证
- [ ] 自动技能生成 - 代码生成
- [ ] 技能验证 - 质量检查
- [ ] A/B 测试 - 对比实验

### 阶段 4: 自主学习系统 (6-8 周)
- [ ] 知识源集成 - 多源学习
- [ ] 知识提取 - 模式识别
- [ ] 技能合成 - 整合优化
- [ ] 学习计划 - 目标设定

### 阶段 5: 长时运行系统 (4-6 周)
- [ ] 资源管理 - 内存优化
- [ ] 健康检查 - 自动恢复
- [ ] 持久化增强 - 备份恢复
- [ ] 性能优化 - 并发处理

### 阶段 6: 社区集成 (6-8 周)
- [ ] 技能市场 - 发布订阅
- [ ] 评分系统 - 质量评估
- [ ] 技能推荐 - 智能匹配
- [ ] 社区指南 - 贡献规范

---

## 🎛️ 控制命令

### 启动模式

```bash
# 交互模式（手动控制）
EVOLUTION_MODE=interactive node scripts/start-evolution.js

# 自动模式（持续进化）
EVOLUTION_MODE=auto node scripts/start-evolution.js

# 监控模式（只监控）
EVOLUTION_MODE=monitor node scripts/start-evolution.js

# 调试模式（详细输出）
DEBUG=1 node scripts/start-evolution.js
```

### 灵魂引擎命令

```bash
# 反思
node src/core/soul_engine/cli.js reflect

# 进化
node src/core/soul_engine/cli.js evolve

# 状态
node src/core/soul_engine/cli.js status

# 启动
node src/core/soul_engine/cli.js start
```

### 进度跟踪

```bash
# 查看进度报告
node scripts/track-progress.js

# 更新进度
# 编辑 docs/planning/progress.md

# 查看计划
cat docs/planning/task_plan.md
```

---

## 📊 监控指标

### 核心指标

| 指标 | 目标 | 当前 | 状态 |
|------|------|------|------|
| 反思记录 | 10+ | 3 | 🟡 进行中 |
| 进化技能 | 10+ | 1 | 🔴 需加强 |
| 会话记忆 | 50+ | 15 | 🟡 进行中 |
| 进化次数 | 20+ | 2 | 🔴 需加强 |

### 性能指标

- **响应时间**: < 100ms
- **内存使用**: < 500MB
- **CPU 使用**: < 50%
- **磁盘使用**: < 1GB

### 质量指标

- **技能可用率**: > 80%
- **任务完成率**: > 70%
- **系统稳定性**: > 95%

---

## 🔧 故障排除

### 问题 1: 系统不启动

**症状**: 运行 `start-evolution.js` 无响应

**解决方案**:
```bash
# 检查 Node.js 版本
node --version  # 应该 >= 16.0.0

# 检查依赖
npm install

# 检查权限
chmod +x scripts/*.js

# 查看详细错误
DEBUG=1 node scripts/start-evolution.js
```

### 问题 2: 进化停滞

**症状**: 长时间无新技能生成

**解决方案**:
```bash
# 检查日志
cat ~/.stigmergy/soul-state/evolution-log.jsonl

# 手动触发进化
node src/core/soul_engine/cli.js evolve

# 查看错误
cat ~/.stigmergy/soul-state/events_*.jsonl
```

### 问题 3: 资源耗尽

**症状**: 内存或磁盘使用过高

**解决方案**:
```bash
# 清理旧日志
find ~/.stigmergy/soul-state -name "*.jsonl" -mtime +30 -delete

# 归档旧数据
# 实现中...

# 重启系统
# Ctrl+C 停止，然后重新启动
```

---

## 📈 最佳实践

### 1. 定期检查进度

```bash
# 每周检查
node scripts/track-progress.js

# 更新计划
# 编辑 docs/planning/progress.md
```

### 2. 监控系统健康

```bash
# 查看状态
node src/core/soul_engine/cli.js status

# 检查日志
tail -f ~/.stigmergy/soul-state/events_*.jsonl
```

### 3. 审查关键决策

```bash
# 查看进化日志
cat ~/.stigmergy/soul-state/evolution-log.jsonl

# 审查新生成的技能
cat ~/.stigmergy/soul-state/evolved-skills/*.json
```

### 4. 备份重要数据

```bash
# 备份 soul-state
cp -r ~/.stigmergy/soul-state ~/.stigmergy/soul-state.backup

# 或使用自动化脚本
# 实现中...
```

---

## 🎓 学习资源

### 文档

- `docs/planning/task_plan.md` - 详细计划
- `docs/planning/findings.md` - 研究发现
- `docs/planning/progress.md` - 进度日志
- `src/core/soul_engine/README.md` - Soul Engine 文档

### 示例

- `scripts/start-evolution.js` - 启动脚本
- `scripts/track-progress.js` - 进度跟踪
- `src/core/soul_engine/cli.js` - CLI 工具

### 参考资料

- OpenClaw 架构文档
- Agent 设计模式
- 人工智能自主系统研究

---

## 🤝 贡献

欢迎贡献！

**贡献方式**:
1. 报告问题
2. 提出改进建议
3. 提交代码
4. 分享经验

**贡献流程**:
1. Fork 项目
2. 创建分支
3. 提交更改
4. 创建 PR

---

## 📞 支持

**问题反馈**:
- GitHub Issues
- 邮件支持

**功能请求**:
- GitHub Discussions
- 社区论坛

---

## 📝 更新日志

### v1.0.0 (2026-03-06)

**新增**:
- ✅ 长时进化计划
- ✅ 双 Agent Loop 设计
- ✅ 进度跟踪系统
- ✅ 自动化启动脚本

**改进**:
- ✅ 文档完善
- ✅ 示例代码
- ✅ 故障排除指南

---

**版本**: 1.0.0
**最后更新**: 2026-03-06
**状态**: ✅ 活跃开发中
