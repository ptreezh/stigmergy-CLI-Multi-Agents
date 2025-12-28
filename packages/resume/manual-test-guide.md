# ResumeSession 手动交互测试指南

## 测试目标
在每个CLI的交互环境中手动验证 `/history` 命令的功能。

---

## 测试准备

### 1. 确认集成文件已部署
所有集成文件已生成到正确位置：
- ✅ Claude: `.claude/hooks/resumesession-history.js`
- ✅ Gemini: `.gemini/extensions/resumesession-history.js`
- ✅ Qwen: `.qwen/plugins/resumesession-history.js`
- ✅ IFlow: `stigmergy/commands/history.js`
- ✅ CodeBuddy: `.codebuddy/integrations/resumesession.js`
- ✅ QoderCLI: `.qodercli/extensions/history.js`
- ✅ Codex: `.codex/plugins/resumesession-history.js`

### 2. 测试命令清单
每个CLI需要测试以下命令：

```bash
# 基本命令
/history

# 带参数
/history --cli claude
/history --search "react"
/history --limit 5
/history --format timeline
/history --today
```

---

## CLI 1: Claude CLI

### 启动方式
```bash
cd D:\stigmergy-CLI-Multi-Agents
claude
```

### 测试步骤
1. 在交互环境中输入：`/history`
2. 观察输出是否显示项目历史会话
3. 测试参数：`/history --format timeline`
4. 测试搜索：`/history --search "test"`

### 预期结果
- 显示 "🔍 Searching cross-CLI history..."
- 列出当前项目的会话
- 按CLI分组显示

### 实际结果
[ ] 成功 / [ ] 失败
备注：

---

## CLI 2: Gemini CLI

### 启动方式
```bash
cd D:\stigmergy-CLI-Multi-Agents
gemini
```

### 测试步骤
1. 在交互环境中输入：`/history`
2. 检查是否识别命令
3. 测试不同格式

### 预期结果
- Gemini扩展系统加载集成代码
- 执行 `GeminiHistoryHandler.handleCommand()`
- 显示格式化的历史记录

### 实际结果
[ ] 成功 / [ ] 失败
备注：

---

## CLI 3: Qwen CLI

### 启动方式
```bash
cd D:\stigmergy-CLI-Multi-Agents
qwen
```

### 测试步骤
1. 在交互环境中输入：`/history`
2. 验证插件是否被加载
3. 测试命令执行

### 预期结果
- Qwen插件系统识别 `/history`
- 执行 `QwenHistoryHandler.handleCommand()`
- 返回会话列表

### 实际结果
[ ] 成功 / [ ] 失败
备注：

---

## CLI 4: IFlow CLI

### 启动方式
```bash
cd D:\stigmergy-CLI-Multi-Agents
iflow
```

### 注意事项
- IFlow需要登录认证
- 使用 stigmergy 命令系统

### 测试步骤
1. 确保已登录
2. 在交互环境中输入：`/history`
3. 验证 stigmergy 命令注册

### 预期结果
- stigmergy.addCommand() 成功注册
- 执行 `IFlowHistoryCommand.execute()`
- 显示跨CLI历史

### 实际结果
[ ] 成功 / [ ] 失败
备注：

---

## CLI 5: CodeBuddy CLI

### 启动方式
```bash
cd D:\stigmergy-CLI-Multi-Agents
codebuddy
```

### 测试步骤
1. 在交互环境中输入：`/history`
2. 检查集成加载
3. 验证命令响应

### 预期结果
- CodeBuddy集成系统加载
- 执行 `CodeBuddyHistoryHandler.handleCommand()`
- 显示历史记录

### 实际结果
[ ] 成功 / [ ] 失败
备注：

---

## CLI 6: QoderCLI

### 启动方式
```bash
cd D:\stigmergy-CLI-Multi-Agents
qodercli
```

### 测试步骤
1. 在交互环境中输入：`/history`
2. 验证扩展系统
3. 测试命令功能

### 预期结果
- QoderCLI扩展加载
- 执行 `QoderHistoryHandler.handleCommand()`
- 返回会话数据

### 实际结果
[ ] 成功 / [ ] 失败
备注：

---

## CLI 7: Codex CLI

### 启动方式
```bash
cd D:\stigmergy-CLI-Multi-Agents
codex
```

### 注意事项
- Codex不支持非交互式stdin
- 必须在交互环境中测试

### 测试步骤
1. 启动交互环境
2. 输入：`/history`
3. 观察插件响应

### 预期结果
- Codex插件系统识别
- 执行 `CodexHistoryHandler.handleCommand()`
- 显示格式化输出

### 实际结果
[ ] 成功 / [ ] 失败
备注：

---

## 命令冲突检查

### 检查方法
在每个CLI中：
1. 输入 `/help` 或 `help` 查看内置命令
2. 检查是否已有 `/history` 命令
3. 如有冲突，记录并准备使用 `/stigmergy-history`

### 冲突记录表

| CLI | 是否有 /history | 冲突类型 | 使用命令 |
|-----|----------------|---------|---------|
| Claude | [ ] 是 / [ ] 否 | | `/history` |
| Gemini | [ ] 是 / [ ] 否 | | `/history` |
| Qwen | [ ] 是 / [ ] 否 | | `/history` |
| IFlow | [ ] 是 / [ ] 否 | | `/history` |
| CodeBuddy | [ ] 是 / [ ] 否 | | `/history` |
| QoderCLI | [ ] 是 / [ ] 否 | | `/history` |
| Codex | [ ] 是 / [ ] 否 | | `/history` |

---

## 测试结果汇总

### 成功的CLI（✅）


### 部分成功的CLI（⚠️）


### 失败的CLI（❌）


### 需要使用 /stigmergy-history 的CLI


---

## 问题记录

### 问题 1
**CLI**: 
**现象**: 
**原因**: 
**解决方案**: 

### 问题 2
**CLI**: 
**现象**: 
**原因**: 
**解决方案**: 

---

## 下一步行动

根据测试结果：

1. **如果全部成功**
   - 更新文档
   - 发布新版本

2. **如果有失败**
   - 分析失败原因
   - 修复模板或集成方式
   - 重新生成并测试

3. **如果有命令冲突**
   - 更新模板使用 `/stigmergy-history`
   - 重新生成集成文件
   - 再次测试

---

## 测试完成日期
**日期**: ___________
**测试人**: ___________
**总体结果**: [ ] 通过 / [ ] 需要改进
