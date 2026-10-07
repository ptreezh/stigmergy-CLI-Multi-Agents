# Ralph Loop Skill

## Trigger Phrases

- "ralph"
- "/ralph"
- "ralph loop"
- "autonomous loop"
- "循环执行"
- "自主执行"

## What is Ralph?

Ralph is an **autonomous task execution system** that:

1. Reads a task plan (plan.md)
2. Executes tasks iteratively
3. Records errors and learnings
4. Continues until all tasks complete

## How to Use Ralph

### Method 1: Direct Command

In any CLI (Claude, Qwen, etc.):

```bash
stigmergy ralph claude init
stigmergy ralph claude start
```

### Method 2: Via Skill

Say in conversation:

```
Use Ralph to create a REST API
```

Ralph will:

1. Create plan.md with tasks
2. Execute tasks in loop
3. Learn from errors

## Ralph Workflow

```
┌─────────────────┐
│  1. Create     │
│  plan.md       │
└────────┬────────┘
         ▼
┌─────────────────┐
│  2. Execute    │
│  task 1        │
└────────┬────────┘
         ▼
┌─────────────────┐
│  3. Success?   │
│    ┌────┐      │
│    │Yes │      │
│    └────┘      │
└────────┬────────┘
         ▼
┌─────────────────┐
│  4. Record     │
│  learning      │
└────────┬────────┘
         ▼
┌─────────────────┐
│  5. Next task  │
└────────┬────────┘
         ▼
    ... until done
```

## Ralph in Stigmergy

Stigmergy provides Ralph integration:

- `stigmergy ralph <cli> init` - Create task plan
- `stigmergy ralph <cli> start` - Start loop
- `stigmergy ralph <cli> status` - Check progress
- `stigmergy ralph list` - List all tasks

## Task Plan Format

```markdown
# My Tasks

## 任务列表

- [ ] 任务1: 创建文件
- [ ] 任务2: 添加功能
- [ ] 任务3: 写测试

## 质量检查

- 运行测试验证
```

## Evolution

Ralph learns from each iteration:

- Error patterns → improve handling
- Success patterns → reuse
- Task complexity → better estimation

## Examples

### Example 1: Create API

```
User: Use Ralph to create a REST API with user CRUD
→ Ralph: Creating plan.md
→ Ralph: Task 1/5: Create server.js ✓
→ Ralph: Task 2/5: Add user model ✓
→ Ralph: Task 3/5: Add CRUD routes ✓
→ Ralph: Task 4/5: Add validation ✓
→ Ralph: Task 5/5: Write tests ✓
→ Ralph: All tasks complete!
```

### Example 2: Debug Issue

```
User: Use Ralph to fix the login bug
→ Ralph: Analyzing error logs...
→ Ralph: Creating debug plan
→ Ralph: Task 1/3: Reproduce bug ✓
→ Ralph: Task 2/3: Find root cause (token expiry) ✓
→ Ralph: Task 3/3: Implement fix ✓
→ Ralph: Bug fixed and documented!
```

## Integration Points

- **Storage**: `C:\Users\Zhang/.stigmergy/ralph/<cli>/`
- **Plan**: `C:\Users\Zhang/.stigmergy/ralph/<cli>/plan.md`
- **State**: `C:\Users\Zhang/.stigmergy/ralph/<cli>/state.json`
- **Progress**: `C:\Users\Zhang/.stigmergy/ralph/<cli>/progress.md`

## Tips

1. Break tasks into small pieces (< 30 min each)
2. Add verification steps
3. Use clear, specific descriptions
4. Review progress regularly
