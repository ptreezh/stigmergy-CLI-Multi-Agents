# Stigmergy 自主进化系统 - 启动指南

**版本**: 1.0.0
**状态**: ✅ 已启动并运行
**当前进度**: 43.8%

---

## ✅ 系统状态

**整体进度**: 43.8%

- ✅ 反思记录: 11/10 (110%) - **超额完成**
- 🔄 进化次数: 11/20 (55%) - **超过一半**
- ⚠️ 进化技能: 1/10 (10%) - **需要加强**
- 🔄 会话记忆: 5/50 (10%) - **进行中**

---

## 🚀 快速启动

### 方式 1: 前台运行（推荐用于测试）

```bash
cd /c/bde/stigmergy
node src/core/soul_engine/cli.js start
```

**特点**:
- 实时看到输出
- 使用 Ctrl+C 停止
- 适合测试和调试

### 方式 2: 后台运行（推荐用于长期）

```bash
cd /c/bde/stigmergy
node src/core/soul_engine/cli.js start &
```

**特点**:
- 后台持续运行
- 不占用终端
- 适合长期运行

### 方式 3: 持久化运行（推荐用于生产）

```bash
cd /c/bde/stigmergy
node scripts/start-evolution-persistent.js
```

**特点**:
- 自动重启
- 错误恢复
- 完整日志

---

## 📊 监控命令

### 查看进度

```bash
node scripts/track-progress.js
```

### 查看状态

```bash
node src/core/soul_engine/cli.js status
```

### 实时监控

```bash
bash scripts/monitor-evolution.sh

# 或持续监控（每10秒更新）
watch -n 10 'bash scripts/monitor-evolution.sh'
```

### 查看日志

```bash
# 查看最新日志
tail -f ~/.stigmergy/soul-state/logs/evolution-*.log

# 查看所有日志
ls ~/.stigmergy/soul-state/logs/
```

---

## 🎯 当前运行状态

### ✅ 正在执行的任务

1. **Soul Reflection** - 每60秒自动执行
2. **Soul Auto Evolve** - 每60秒自动执行
3. **Memory Store** - 持续保存会话
4. **Event Stream** - 记录所有事件

### 📈 进化统计

- **总进化次数**: 11
- **生成反思**: 11
- **创建技能**: 1
- **保存会话**: 5

---

## 🔧 管理命令

### 停止系统

```bash
# 前台运行
Ctrl+C

# 后台运行
kill $(cat ~/.stigmergy/soul-state/evolution.pid)

# 强制停止
pkill -f "node src/core/soul_engine/cli.js start"
```

### 重启系统

```bash
# 停止后重新启动
kill $(cat ~/.stigmergy/soul-state/evolution.pid)
sleep 2
node src/core/soul_engine/cli.js start &
```

### 清理数据

```bash
# 清理旧日志（保留最近7天）
find ~/.stigmergy/soul-state/logs -name "*.log" -mtime +7 -delete

# 清理旧反思（保留最近30天）
find ~/.stigmergy/soul-state/reflections -name "*.json" -mtime +30 -delete

# 清理旧技能（保留最近10个）
cd ~/.stigmergy/soul-state/evolved-skills
ls -t | tail -n +11 | xargs rm -f
```

---

## 📁 重要文件位置

### 数据文件

```
~/.stigmergy/soul-state/
├── memory/
│   └── sessions.jsonl              # 会话记忆
├── reflections/
│   └── reflection_*.json           # 反思记录
├── evolved-skills/
│   └── soul-*.json                 # 进化的技能
├── evolution-log.jsonl             # 进化日志
└── logs/
    └── evolution-*.log             # 系统日志
```

### 配置文件

```
~/.stigmergy/
├── config/
│   ├── search-services.json        # 搜索配置
│   └── local-llm.json              # LLM配置
└── soul-state/
    └── evolution.pid               # 进程ID
```

---

## 🎓 使用示例

### 场景 1: 启动并监控

```bash
# 终端 1: 启动系统
node src/core/soul_engine/cli.js start

# 终端 2: 监控进度
watch -n 10 'node scripts/track-progress.js'

# 终端 3: 监控日志
tail -f ~/.stigmergy/soul-state/logs/evolution-*.log
```

### 场景 2: 查看进化结果

```bash
# 查看最新技能
ls -lt ~/.stigmergy/soul-state/evolved-skills/ | head -5
cat ~/.stigmergy/soul-state/evolved-skills/$(ls -t ~/.stigmergy/soul-state/evolved-skills/ | head -1)

# 查看最新反思
ls -lt ~/.stigmergy/soul-state/reflections/ | head -5
cat ~/.stigmergy/soul-state/reflections/$(ls -t ~/.stigmergy/soul-state/reflections/ | head -1)

# 查看进化日志
cat ~/.stigmergy/soul-state/evolution-log.jsonl | tail -20
```

### 场景 3: 手动触发进化

```bash
# 执行反思
node src/core/soul_engine/cli.js reflect

# 执行进化
node src/core/soul_engine/cli.js evolve

# 查看结果
node scripts/track-progress.js
```

---

## 📊 预期效果

### 短期（1周）

- 反思记录: 50+
- 进化次数: 20+
- 会话记忆: 20+

### 中期（1月）

- 反思记录: 200+
- 进化次数: 100+
- 进化技能: 10+
- 会话记忆: 100+

### 长期（3月）

- 反思记录: 600+
- 进化次数: 300+
- 进化技能: 30+
- 会话记忆: 300+

---

## ⚠️ 注意事项

### 资源使用

- **内存**: 约 100-200MB
- **磁盘**: 约 10MB/天（日志）
- **CPU**: 约 5-10%（空闲时）

### 性能优化

- 定期清理旧日志
- 限制会话记忆大小
- 归档旧数据

### 安全考虑

- 定期备份重要数据
- 监控系统资源
- 检查生成的技能质量

---

## 🎯 下一步

### 立即行动

1. ✅ 启动进化系统
2. ✅ 监控进度
3. ✅ 查看生成结果
4. ⏳ 开始阶段 1 实施

### 本周目标

- [ ] 完成阶段 1 规划
- [ ] 设计 Planner Agent
- [ ] 设计 Executor Agent
- [ ] 实现通信协议

### 月度目标

- [ ] 完成前 3 个阶段
- [ ] 实现基础进化循环
- [ ] 建立监控系统

---

## 📞 支持

**问题反馈**:
- GitHub Issues
- 查看日志文件

**功能请求**:
- GitHub Discussions

---

**版本**: 1.0.0
**最后更新**: 2026-03-06
**状态**: ✅ 运行中

---

## 🎉 总结

**自主进化系统已成功启动并运行！**

- ✅ Soul Engine 正常运行
- ✅ Heartbeat 每分钟执行进化任务
- ✅ 反思和进化自动执行
- ✅ 所有过程被记录
- ✅ 进度可追踪

**系统将持续运行，不断学习和改进！** 🚀
