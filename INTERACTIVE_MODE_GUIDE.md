# Stigmergy Interactive Mode - User Guide

## What is the Project Status Board?

The Project Status Board is Stigmergy's core mechanism for **indirect collaboration** across different CLI sessions. It acts as a shared memory that enables:

- **Cross-Session Collaboration**: Multiple sessions work from the same project state
- **Context Injection**: Automatic injection of project history into tasks
- **Directory Isolation**: Each project has its own independent status board
- **Persistent State**: Work is saved to `.stigmergy/status/PROJECT_STATUS.md`

## Quick Start

### Starting Interactive Mode

```bash
cd your-project/
stigmergy interactive
# or use the alias
stigmergy i
```

### Basic Commands

```bash
# View project status board
status

# Show cross-CLI context
context

# Switch to specific CLI tool
use qwen
use claude
use iflow
use gemini

# Execute task (context auto-injected)
your task description here

# Exit interactive mode
exit
```

## Features

### 1. Project Status Board

The status board tracks:
- **Tasks**: Pending, in-progress, and completed tasks
- **Findings**: Key discoveries and insights from AI tools
- **Decisions**: Important decisions made during development
- **Collaboration History**: Timeline of all CLI tool activities

**Example Output:**

```
========================================
  项目全局状态看板
========================================

📁 项目信息:
  名称: my-project
  阶段: implementation
  创建时间: 2026-01-27

🎯 当前状态:
  活跃CLI: qwen
  最后活动: 2026-01-27T10:59:49.897Z

📋 任务统计:
  待处理: 14
  进行中: 0
  已完成: 10

💡 发现: 20条
🎯 决策: 6条
🤝 协作记录: 50条
```

### 2. Automatic Context Injection

When you execute a task, the status board automatically injects relevant context:

- Recent collaboration history
- Key findings from all CLI tools
- Important decisions made
- Current project state

This means every AI tool starts with full context of previous work!

### 3. Directory Isolation

Each project directory has its own independent status board:

```
projectA/.stigmergy/status/PROJECT_STATUS.md  ← Project A's state
projectB/.stigmergy/status/PROJECT_STATUS.md  ← Project B's state
```

**Guaranteed:** Work in `projectA` never affects `projectB`.

### 4. Cross-Session Collaboration

Multiple sessions can work on the same project simultaneously:

```bash
# Terminal 1
cd project/
stigmergy i
> use qwen
qwen> design user authentication
✓ Task recorded to status board

# Terminal 2 (simultaneously)
cd project/
stigmergy i
> status
# Shows: "design user authentication" in collaboration history
> use claude
claude> implement the authentication system
✓ Context includes qwen's design
```

## Usage Scenarios

### Scenario 1: Sequential Multi-CLI Collaboration

```bash
$ stigmergy i

> use qwen
qwen> 分析需求并设计数据库Schema
✓ Task recorded, findings saved

> use claude
claude> 根据设计实现数据库模型
✓ Context includes qwen's design
✓ Implementation recorded

> use iflow
iflow> 为数据库模型编写单元测试
✓ Context includes design + implementation
✓ Tests recorded

> status
# Shows complete collaboration history
```

### Scenario 2: Small Project (Single Board Mode)

**Best for:** Projects with < 10 modules, small teams, tight coupling

```bash
cd my-small-app/
stigmergy i

> use qwen
qwen> design API architecture
✓ All work in one status board

> use claude
claude> implement REST API
✓ Continues same board

> status
# Shows all work in one place
```

**File Structure:**
```
my-small-app/
├── .stigmergy/
│   └── status/
│       └── PROJECT_STATUS.md  ← Single status board
├── backend/
├── frontend/
└── docs/
```

### Scenario 3: Large Project (Multi-Board Mode)

**Best for:** Projects with > 10 modules, multiple teams, microservices

```bash
cd my-microservices/
stigmergy i

# Initialize multi-board mode
> board init multi
> board create user-service ./user-service
> board create order-service ./order-service
> board create payment-service ./payment-service

# Work on user-service
> board switch user-service
> use qwen
qwen> design user authentication
✓ Recorded to: user-service/.stigmergy/status/PROJECT_STATUS.md

# Work on order-service
> board switch order-service
> use iflow
iflow> implement order processing
✓ Recorded to: order-service/.stigmergy/status/PROJECT_STATUS.md

# View global status
> board switch default
> board status
# Shows summary of all service boards
```

**File Structure:**
```
my-microservices/
├── .stigmergy/
│   └── status/
│       ├── config.json
│       └── PROJECT_STATUS.md  ← Main board (global view)
├── user-service/
│   └── .stigmergy/
│       └── status/
│           └── PROJECT_STATUS.md  ← User service board
├── order-service/
│   └── .stigmergy/
│       └── status/
│           └── PROJECT_STATUS.md  ← Order service board
└── payment-service/
    └── .stigmergy/
        └── status/
            └── PROJECT_STATUS.md  ← Payment service board
```

## Advanced Features

### Recording Findings

```bash
> finding: Using JWT for stateless authentication
✓ Finding recorded to status board

> finding: Database connection pool needs optimization
✓ Finding recorded
```

### Making Decisions

```bash
> decision: Use PostgreSQL as primary database
✓ Decision recorded to status board
```

### Viewing Context

```bash
> context
## 当前状态
- 活跃CLI: qwen
- 会话ID: session-abc123

## 关键发现 (5条)
- **design** [qwen]: 使用 JWT 认证
- **design** [claude]: 使用 RESTful API 设计
- **performance** [iflow]: 需要添加缓存层

## 决策 (2条)
- 使用 PostgreSQL [system]
- 使用 JWT 认证 [qwen]

## 协作历史
- 🎯 [qwen] design user authentication (2026/1/27 10:00:00)
- 🎯 [claude] implement authentication API (2026/1/27 10:05:00)
```

## Tips and Best Practices

### 1. Switch CLI Tools Based on Task Type

```bash
> use qwen      # For design, architecture
> use claude     # For implementation, coding
> use iflow     # For workflows, automation
> use gemini    # For analysis, research
```

### 2. Check Status Before Starting Work

```bash
> status
# See what's been done
# Check pending tasks
# Review findings and decisions
```

### 3. Use Context to Understand History

```bash
> context
# Get full picture before starting
# Avoid repeating work
# Build on previous findings
```

### 4. Record Important Findings

```bash
> finding: Critical bug discovered in authentication flow
> finding: Performance bottleneck in database queries
```

### 5. Document Decisions

```bash
> decision: Use Redis for caching
> decision: Adopt microservices architecture
```

## Decision Tree: Single vs Multi-Board

```
1. Project Size
   ├─ Small (< 10 modules, < 5 people)
   │  └─ → Single Board ✓
   │
   └─ Large (> 10 modules, > 5 people)
      └─ → Go to 2

2. Module Coupling
   ├─ Tight coupling (frequent cross-module work)
   │  └─ → Single Board ✓
   │
   └─ Loose coupling (modules mostly independent)
      └─ → Go to 3

3. Team Organization
   ├─ Single team (everyone works together)
   │  └─ → Single Board ✓
   │
   └─ Multiple teams (distributed)
      └─ → Multi-Board ✓

4. Activity Level
   ├─ Some modules very active (>50 commits/day)
   │  └─ → Multi-Board ✓
   │
   └─ All modules similar activity
      └─ → Single Board ✓
```

## Troubleshooting

### Status Board Not Showing

```bash
# Check if status file exists
ls .stigmergy/status/PROJECT_STATUS.md

# If not exists, reinitialize
stigmergy init
```

### Context Not Injecting

```bash
# Verify status board has content
status

# Check context command
context

# If empty, manually add some findings
> finding: Initial project setup
```

### Multiple Projects Confusing

```bash
# Always check current directory
pwd

# Each project has its own board
cd project-a/
stigmergy i
> status  # Shows project-a's state

cd ../project-b/
stigmergy i
> status  # Shows project-b's state (different!)
```

## Technical Details

### Status Board Location

```
<project-root>/.stigmergy/status/PROJECT_STATUS.md
```

### Status Board Format

The status board is stored in Markdown format for:
- Human readability
- Git version control
- Easy manual editing (if needed)

### Automatic Updates

The status board is automatically updated:
- After every task execution
- When recording findings
- When making decisions
- When switching CLI tools

### Graceful Shutdown

```bash
> exit
[POOL] Shutting down persistent CLI processes...
✓ Session saved
✓ Status board updated
```

## Summary

The Project Status Board enables:
- ✅ Cross-session collaboration through shared state
- ✅ Automatic context injection into tasks
- ✅ Directory isolation (no project mixing)
- ✅ Persistent history tracking
- ✅ Support for both small and large projects

**Key Principle:** Different CLI sessions collaborate indirectly through the status board, not direct communication. This is the "stigmergy" mechanism - coordination through shared environment!
