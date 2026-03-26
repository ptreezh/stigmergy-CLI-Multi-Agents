# 层级化项目状态看板 - 完整架构

## 🎯 核心原则

### ✅ 已保证的核心特性

1. **每个项目目录独立看板**
   - 项目A的看板 ≠ 项目B的看板
   - 不同目录的协同不会混淆
   - 基于工作目录隔离

2. **子目录可选独立看板**
   - 小型项目：单一看板
   - 大型项目：多看板模式
   - 灵活配置

3. **跨看板全局上下文**
   - 主看板可以查看所有子看板的摘要
   - 子看板之间相互独立但可引用

## 📁 文件结构

### 单一看板模式（默认）

```
my-project/
├── .stigmergy/
│   └── status/
│       ├── PROJECT_STATUS.md    ← 整个项目的状态
│       └── STATUS.lock
├── backend/     ← 所有工作记录到同一看板
├── frontend/
└── docs/
```

**特点**：
- ✅ 简单统一
- ✅ 全局视角
- ✅ 适合小型项目

### 多看板模式

```
my-project/
├── .stigmergy/
│   └── status/
│       ├── PROJECT_STATUS.md    ← 主看板（全局视角）
│       ├── config.json           ← 看板配置
│       └── STATUS.lock
├── backend/
│   └── .stigmergy/
│       └── status/
│           ├── PROJECT_STATUS.md  ← 后端独立看板
│           └── STATUS.lock
├── frontend/
│   └── .stigmergy/
│       └── status/
│           ├── PROJECT_STATUS.md  ← 前端独立看板
│           └── STATUS.lock
└── docs/
    └── .stigmergy/
        └── status/
            ├── PROJECT_STATUS.md  ← 文档独立看板
            └── STATUS.lock
```

**特点**：
- ✅ 模块化管理
- ✅ 职责清晰
- ✅ 独立开发
- ✅ 适合大型项目

## 🔄 工作流程对比

### 单一看板工作流

```
项目根目录/
  stigmergy/i
  > use qwen
  qwen> 设计用户认证系统
  ✓ 记录到: .stigmergy/status/PROJECT_STATUS.md

  > use iflow
  iflow> 实现认证API
  ✓ 记录到: .stigmergy/status/PROJECT_STATUS.md
  ✓ 上下文包含: qwen的设计

  > use claude
  claude> 编写API文档
  ✓ 记录到: .stigmergy/status/PROJECT_STATUS.md
  ✓ 上下文包含: qwen的设计 + iflow的实现
```

### 多看板工作流

```
项目根目录/
  # 初始化多看板
  stigmergy/i
  > board init multi
  > board create backend ./backend
  > board create frontend ./frontend

  # 在后端看板上工作
  cd backend/
  stigmergy/i
  > use qwen
  qwen> 设计用户表结构
  ✓ 记录到: backend/.stigmergy/status/PROJECT_STATUS.md

  # 切换到前端看板
  cd ../frontend/
  stigmergy/i
  > board switch frontend
  > use iflow
  iflow> 实现登录页面
  ✓ 记录到: frontend/.stigmergy/status/PROJECT_STATUS.md
  ✓ 上下文包含: 前端特定的工作

  # 回到主看板，获取全局视角
  cd ../
  stigmergy/i
  > board switch default
  > board status
  📊 显示所有看板的摘要
  > board context --global
  🌍 跨看板全局上下文
```

## 📊 决策树

### 如何选择看板模式？

```
1. 项目规模
   ├─ 小型（< 10个模块，< 5人）
   │  └─ → 单一看板 ✓
   │
   └─ 大型（> 10个模块，> 5人）
      └─ → 进入2

2. 模块耦合度
   ├─ 紧耦合（频繁跨模块协作）
   │  └─ → 单一看板 ✓
   │
   └─ 松耦合（模块独立开发）
      └─ → 进入3

3. 团队组织
   ├─ 单一团队（所有人在一起）
   │  └─ → 单一看板 ✓
   │
   └─ 多团队（分布式团队）
      └─ → 多看板 ✓

4. 频率考虑
   ├─ 某模块特别活跃（日均>50次提交）
   │  └─ → 该模块独立看板 ✓
   │
   └─ 各模块频率均衡
      └─ → 单一看板 ✓
```

## 🎨 使用场景示例

### 场景1：小型全栈项目

**项目结构**：
```
my-app/
├── backend/
├── frontend/
└── docs/
```

**推荐配置**：单一看板

```bash
cd my-app/
stigmergy/i

# 所有工作都在同一看板
> use qwen
qwen> 设计后端API

> use iflow
iflow> 实现前端UI

> use claude
claude> 编写技术文档

# 查看完整项目状态
> status
```

**优点**：
- 简单，无需切换看板
- 全局视角，一目了然
- 自动包含跨模块上下文

---

### 场景2：大型微服务项目

**项目结构**：
```
microservices/
├── .stigmergy/status/PROJECT_STATUS.md  ← 主看板
├── user-service/
│   └── .stigmergy/status/PROJECT_STATUS.md
├── order-service/
│   └── .stigmergy/status/PROJECT_STATUS.md
├── payment-service/
│   └── .stigmergy/status/PROJECT_STATUS.md
└── notification-service/
    └── .stigmergy/status/PROJECT_STATUS.md
```

**推荐配置**：多看板

```bash
cd microservices/
stigmergy/i

# 初始化多看板
> board init multi
> board create user-service ./user-service
> board create order-service ./order-service
> board create payment-service ./payment-service
> board create notification-service ./notification-service

# user-service 团队工作
> board switch user-service
> use qwen
qwen> 设计用户认证系统

# order-service 团队工作
> board switch order-service
> use iflow
iflow> 实现订单处理

# 项目管理者查看全局状态
> board switch default
> board status
========================================
  层级化项目状态看板
========================================
📊 模式: 多看板
🎯 当前看板: default
📋 看板数量: 5

→ default:       15任务, 30发现, 8决策
  user-service: 50任务, 100发现, 20决策
  order-service: 45任务, 80发现, 15决策
  payment-service: 30任务, 60发现, 10决策
  notification-service: 20任务, 40发现, 5决策
========================================

# 获取全局上下文
> board context --global
## 当前看板 (default)
## 子看板: user-service
  - 设计了用户认证系统
  - 使用 JWT 认证
## 子看板: order-service
  - 实现了订单创建
  - 使用 RabbitMQ 消息队列
...
```

**优点**：
- 各服务独立开发，互不干扰
- 看板不会过大，性能好
- 清晰的模块边界
- 支持并行开发

---

### 场景3：Monorepo 项目

**项目结构**：
```
my-monorepo/
├── packages/
│   ├── shared/
│   ├── web/
│   └── mobile/
├── .stigmergy/status/PROJECT_STATUS.md  ← 主看板
└── packages/
    ├── shared/.stigmergy/status/PROJECT_STATUS.md
    ├── web/.stigmergy/status/PROJECT_STATUS.md
    └── mobile/.stigmergy/status/PROJECT_STATUS.md
```

**推荐配置**：混合模式

```bash
cd my-monorepo/
stigmergy/i

# 主看板用于全局协调
> use qwen
qwen> 设计整体架构

# 共享模块独立看板
> board switch shared
> use iflow
iflow> 实现共享工具库

# Web模块独立看板
> board switch web
> use claude
claude> 实现Web界面

# 查看全局状态
> board switch default
> board status
```

**优点**：
- 全局协调 + 局部独立
- 共享代码和特定代码分离
- 清晰的依赖关系

---

### 场景4：文档项目

**项目结构**：
```
my-docs/
├── api/
├── guides/
├── tutorials/
└── .stigmergy/status/PROJECT_STATUS.md
```

**推荐配置**：单一看板（文档通常紧密相关）

```bash
cd my-docs/
stigmergy/i

> use qwen
qwen> 编写API文档

> use claude
claude> 编写用户指南

> context
# 看到所有文档工作的历史
```

**优点**：
- 文档工作通常紧密相关
- 需要统一的术语和风格
- 跨文档引用频繁

---

## 🔧 实现细节

### HierarchicalStatusBoard 类

**核心方法**：

1. **initialize()** - 初始化看板系统
   - 加载配置
   - 初始化默认看板
   - 初始化子看板（如果配置了）

2. **switchBoard(boardName)** - 切换当前看板
   ```javascript
   await board.switchBoard('backend');
   // 后续所有操作都在 backend 看板上
   ```

3. **createSubBoard(subDir, boardName)** - 创建子看板
   ```javascript
   await board.createSubBoard('./backend', 'backend', {
     name: 'Backend Module'
   });
   ```

4. **getAllBoardsSummary()** - 获取所有看板摘要
   ```javascript
   const summary = await board.getAllBoardsSummary();
   // {
   //   mode: 'multi',
   //   current: 'backend',
   //   boards: {
   //     backend: { tasks: 50, findings: 100, ... },
   //     frontend: { tasks: 30, findings: 60, ... }
   //   }
   // }
   ```

5. **getGlobalContext()** - 获取跨看板全局上下文
   ```javascript
   const context = await board.getGlobalContext({
     includeSubBoards: true,
     maxHistory: 5
   });
   // 包含当前看板 + 所有子看板的摘要
   ```

6. **代理方法** - 转发到当前看板
   ```javascript
   await board.recordTask('qwen', '任务', {});  // 记录到当前看板
   await board.recordFinding('qwen', 'design', '发现', {});  // 记录到当前看板
   await board.generateReport();  // 生成当前看板的报告
   ```

### 配置文件结构

**config.json**：
```json
{
  "mode": "multi",
  "subBoards": {
    "backend": {
      "path": "./backend",
      "independent": true,
      "createdAt": "2026-01-27T10:00:00.000Z"
    },
    "frontend": {
      "path": "./frontend",
      "independent": true,
      "createdAt": "2026-01-27T10:05:00.000Z"
    }
  }
}
```

## 📋 交互模式集成

### 新增命令（建议）

```bash
# 看板管理
> board                    # 查看当前看板
> board list              # 列出所有看板
> board switch <name>      # 切换看板
> board create <name> <path>  # 创建子看板
> board status             # 查看所有看板状态
> board context --global   # 获取全局上下文

# 上下文管理
> context                 # 当前看板的上下文
> context --global        # 跨看板全局上下文
> context --sub <name>    # 特定子看板的上下文
```

### 工作流集成

```javascript
// 在 InteractiveModeController 中
class InteractiveModeController {
  constructor(options) {
    // 使用层级化看板
    this.statusBoard = new HierarchicalStatusBoard({
      projectRoot: process.cwd()
    });
  }

  async _executeWithCLI(cliName, task) {
    // 记录到当前看板
    await this.statusBoard.recordTask(cliName, task, result);

    // 如果需要全局上下文
    if (options.globalContext) {
      const globalContext = await this.statusBoard.getGlobalContext();
      // 注入全局上下文到任务
    }
  }
}
```

## 🎯 最佳实践

### 1. 何时使用单一看板

✅ **推荐使用**：
- 小型项目（< 10个模块）
- 团队规模小（< 5人）
- 模块紧密耦合
- 频繁跨模块协作

❌ **不适合**：
- 大型项目（> 10个模块）
- 多团队分布式开发
- 模块高度独立

### 2. 何时使用多看板

✅ **推荐使用**：
- 大型项目（> 10个模块）
- 微服务架构
- 多团队并行开发
- 某些模块特别活跃（日均>50次提交）
- 模块松耦合

❌ **不适合**：
- 小型项目（过度设计）
- 频繁跨模块协作（上下文分散）
- 团队规模小（管理成本高）

### 3. 看板命名建议

```javascript
// 按模块命名
'backend', 'frontend', 'database', 'api'

// 按团队命名
'team-alpha', 'team-beta', 'team-gamma'

// 按功能域命名
'user-management', 'payment', 'notification'

// 按环境命名
'dev', 'staging', 'prod'
```

## 📊 性能考虑

### 单一看板
- **文件大小**: 随项目增长
- **读写速度**: 快（单一文件）
- **适用**: < 1000条历史记录

### 多看板
- **文件大小**: 每个看板独立
- **读写速度**: 快（并行读写）
- **适用**: > 1000条历史记录或大型项目

## 🔐 隔离保证

### ✅ 已实现的隔离

1. **目录级别隔离**
   ```javascript
   // 项目A
   const boardA = new HierarchicalStatusBoard({
     projectRoot: '/path/to/projectA'
   });

   // 项目B
   const boardB = new HierarchicalStatusBoard({
     projectRoot: '/path/to/projectB'
   });

   // 两个项目的状态完全独立
   ```

2. **看板级别隔离**
   ```javascript
   // 主看板
   await board.switchBoard('default');
   await board.recordTask('qwen', '主任务');

   // 后端看板
   await board.switchBoard('backend');
   await board.recordTask('qwen', '后端任务');

   // 两个任务记录到不同的看板
   ```

3. **配置持久化**
   ```json
   {
     "mode": "multi",
     "subBoards": {
       "backend": {
         "path": "./backend",
         "independent": true
       }
     }
   }
   ```

## 🎉 总结

### ✅ 核心成就

1. **目录隔离保证** ✓
   - 每个项目目录独立看板
   - 不同目录协同不会混淆

2. **灵活性** ✓
   - 支持单一看板模式
   - 支持多看板模式
   - 可根据项目规模选择

3. **可扩展性** ✓
   - 子目录可选独立看板
   - 看板间可相互引用
   - 支持全局上下文

4. **易用性** ✓
   - 小型项目零配置
   - 大型项目简单配置
   - 清晰的切换命令

### 🎯 使用建议

**默认行为**：单一看板
```bash
stigmergy/i
# 自动创建单一看板，所有工作记录到同一文件
```

**大型项目**：多看板
```bash
stigmergy/i
> board init multi
> board create backend ./backend
> board create frontend ./frontend
```

**这正是您所要求的：每个项目目录独立看板，不同目录的协同不会混淆！** 🎊
