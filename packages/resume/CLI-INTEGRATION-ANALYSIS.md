# CLI集成代码真实需求分析

基于对各CLI工具的真实使用方法和文件结构的研究，制定完整的集成代码实现方案。

## 1. Qwen CLI

### 真实结构
- **会话路径**: `~/.qwen/projects/<项目名>/chats/*.jsonl`
- **格式**: JSONL（每行一个JSON对象）
- **Hooks目录**: `~/.qwen/hooks/`
- **配置文件**: `~/.qwen/config.json`

### 会话文件格式
```json
{"uuid":"...","sessionId":"...","timestamp":"...","type":"user","cwd":"...","message":{"role":"user","parts":[{"text":"..."}]}}
```

### 集成方案
- 需要嵌入完整的SessionScanner、SessionFilter、HistoryFormatter、HistoryQuery
- 支持JSONL格式解析
- 支持项目路径匹配
- 提供斜杠命令 `/history`

---

## 2. IFlow CLI (Stigmergy)

### 真实结构
- **会话路径**: `~/.iflow/projects/<项目名>/session-*.jsonl`
- **格式**: JSONL
- **Hooks目录**: `stigmergy/commands/`（项目级）

### 会话文件格式
```json
{"uuid":"...","sessionId":"...","timestamp":"...","type":"user","cwd":"...","message":{"role":"user","content":"..."}}
```

### 集成方案
- 嵌入完整核心功能
- JSONL格式解析
- 通过stigmergy命令系统集成

---

## 3. CodeBuddy CLI

### 真实结构
- **会话路径**: `~/.codebuddy/history.jsonl`（单文件）
- **格式**: JSONL
- **Hooks目录**: `~/.codebuddy/hooks/`

### 特点
- 所有会话在一个文件中
- 需要按项目过滤

### 集成方案
- 嵌入完整核心功能
- 单文件JSONL解析
- 按项目路径过滤会话

---

## 4. QoderCLI

### 真实结构
- **状态**: 未安装/未配置（目录不存在）
- **预期路径**: `~/.qodercli/sessions/` 或 `~/.qodercli/chats/`

### 集成方案
- 提供通用模板
- 等待真实安装后验证

---

## 5. Codex CLI

### 真实结构
- **会话路径**: `~/.codex/sessions/YYYY/MM/DD/*.jsonl`
- **格式**: JSONL
- **特点**: 按日期分层存储

### 集成方案
- 嵌入完整核心功能
- 支持日期分层目录扫描
- JSONL格式解析

---

## 实现优先级

### 第一优先级（已有真实数据）
1. ✅ **Claude CLI** - 已完整实现（7128字符）
2. ✅ **Gemini CLI** - 已完整实现（13854字符）
3. ✅ **IFlow CLI** - 已修复SessionScanner支持
4. 🔧 **Qwen CLI** - 需要完整实现（有14个真实会话）
5. 🔧 **Codex CLI** - 需要完整实现（有3个真实会话）
6. 🔧 **CodeBuddy CLI** - 需要完整实现（有history.jsonl文件）

### 第二优先级（无真实数据）
7. ⏸️ **QoderCLI** - 提供通用模板（目录不存在）

---

## 实现策略

### 方案A: 完全嵌入（推荐）
像Gemini一样，将SessionScanner、SessionFilter、HistoryFormatter、HistoryQuery完全嵌入到生成的集成代码中。

**优点**:
- 完全独立，无需外部依赖
- 功能完整
- 易于部署

**缺点**:
- 代码量大（~14KB）
- 维护成本高

### 方案B: 引用共享模块
生成的代码引用ResumeSession的核心模块。

**优点**:
- 代码量小
- 易于维护

**缺点**:
- 需要安装ResumeSession包
- 依赖管理复杂

**决定**: 采用方案A（完全嵌入），因为：
1. Gemini已验证可行
2. 用户体验更好（无需额外安装）
3. 符合"集成代码"的定义

---

## 下一步行动

1. 为Qwen CLI实现完整集成代码（基于Gemini模板）
2. 为Codex CLI实现完整集成代码（需要支持日期分层）
3. 为CodeBuddy CLI实现完整集成代码（需要处理单文件）
4. 为IFlow CLI实现完整集成代码（基于Gemini模板）
5. 为QoderCLI提供通用模板（待真实环境验证）
6. 运行真实场景测试验证所有集成代码
