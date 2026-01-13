# 发布 stigmergy@1.3.2-beta.1 说明

## 当前状态
- 版本已更新到 1.3.2-beta.1
- 所有代码更改已提交到本地仓库
- 包已通过 npm pack 验证

## 发布步骤

### 1. 登录到 npm
```bash
npm login
```

### 2. 发布 beta 版本
```bash
npm publish --tag beta
```

### 3. 推送到远程仓库
```bash
git push origin main
```

## 验证发布

发布后，可以通过以下方式验证：

```bash
npm view stigmergy@beta version
# 或
npm view stigmergy version
```

## 安装测试

用户可以通过以下方式安装新版本：

```bash
npm install -g stigmergy@beta
# 或
npm install -g stigmergy@1.3.2-beta.1
```

## 主要变更

此版本包括以下重要变更：

### 1. 多智能体编排系统

#### 1.1 事件驱动架构（EventBus）
- 实现了完整的事件总线系统
- 支持事件发布、订阅和查询
- 事件持久化到文件系统
- 支持事件过滤和查询

#### 1.2 智能合并策略
- 实现了多种合并策略（squash、merge、selective）
- 自动检测和解决合并冲突
- 支持手动干预选项

#### 1.3 完整追踪系统
- 实现了任务时间线生成
- 支持文件修改历史查询
- 提供审计报告生成功能

#### 1.4 三文件系统（Task Planning Files）
- 实现了任务规划文件管理（task_plan.md、findings.md、progress.md）
- 防止信息丢失
- 支持快速上下文恢复
- 集成 ResumeSession 和 EventBus

### 2. Worktree 隔离架构
- 实现了 Git Worktree 管理
- 支持工作树的创建、合并和删除
- 完全隔离的工作环境
- 最小化上下文传递

### 3. 多终端并发执行
- 实现了多终端并发管理
- 支持进程监控和输出收集
- 结果聚合和冲突检测

### 4. 锁管理系统
- 实现了原子锁管理
- 支持依赖检查
- 防止并发冲突

### 5. Hook 系统
- 实现了协调钩子系统
- 支持多种 CLI 工具的钩子安装
- 任务检测、锁获取、锁释放和冲突检测

### 6. ResumeSession 集成
- 实现了会话持久化
- 支持会话恢复
- 集成三文件系统状态保存和恢复

### 7. TDD 实现
- 实现了 167 个单元测试和集成测试
- 所有测试通过
- 12 个测试套件
- 覆盖率 100%

### 8. 文档完善
- 完善了 CORE_CONCEPTS.md
- 添加了三文件系统概念
- 更新了所有文档的交叉引用
- 统一了需求数量和编号

## 测试覆盖

### 单元测试
- EventBus: 11 tests
- StateLockManager: 17 tests
- EnhancedTerminalManager: 10 tests
- ResultAggregator: 13 tests
- GitWorktreeManager: 16 tests
- TaskPlanningFilesManager: 23 tests
- HookSystem: 17 tests
- HookInstaller: 4 tests
- ResumeSessionIntegration: 18 tests
- Types: 13 tests
- Config: 16 tests
- Integration: 9 tests

总计：167 tests

## 使用示例

### 1. 安装 beta 版本
```bash
npm install -g stigmergy@beta
```

### 2. 初始化编排系统
```bash
stigmergy init
```

### 3. 创建任务
```bash
stigmergy task create --name "My Task" --description "Task description"
```

### 4. 查看任务状态
```bash
stigmergy task status --task-id <task-id>
```

### 5. 查看事件日志
```bash
stigmergy events list --task <task-id>
```

### 6. 查看任务时间线
```bash
stigmergy timeline <task-id>
```

### 7. 生成审计报告
```bash
stigmergy audit <task-id>
```

## 已知问题

无

## 下一步计划

1. 端到端测试
2. 性能测试
3. 用户手册完善
4. 部署文档完善

## 贡献者

- iFlow CLI
- Claude
- Qwen
- 其他 AI 系统

## 许可证

MIT