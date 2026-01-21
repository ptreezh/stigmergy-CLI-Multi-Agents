# Stigmergy CLI 安装器架构文档

## 📋 概述

本文档定义了 Stigmergy CLI 中各个安装器类的职责边界和使用场景，帮助开发者理解何时使用哪个安装器类。

## 🏗️ 安装器架构概览

```
Stigmergy CLI 安装器体系
├── StigmergyInstaller (完整安装器)
│   ├── 继承 EnhancedCLIInstaller 的所有功能
│   ├── 扫描和检测功能
│   ├── 基础安装功能
│   ├── 项目管理功能
│   └── Cross-CLI Hooks 生成
├── EnhancedCLIInstaller (增强安装器)
│   ├── 权限处理
│   ├── 批量安装
│   ├── 升级功能
│   └── 错误重试
├── BaseInstaller (抽象基类)
│   └── 定义标准接口
└── EnhancedInstaller (已弃用)
    └── 功能已整合到 EnhancedCLIInstaller
```

## 📊 详细职责对比

| 功能/类 | StigmergyInstaller | EnhancedCLIInstaller | BaseInstaller | EnhancedInstaller |
|---------|-------------------|---------------------|---------------|-------------------|
| **继承关系** | 继承 EnhancedCLIInstaller | 独立实现 | 抽象基类 | 继承 BaseInstaller |
| **扫描 CLI 工具** | ✅ `scanCLI()` | ❌ | ✅ 抽象方法 | ❌ |
| **检测 CLI 工具** | ✅ `checkCLI()` | ❌ | ✅ 抽象方法 | ❌ |
| **基础安装** | ✅ 调用父类 `installTools()` | ✅ `installTools()` | ✅ 抽象方法 | ❌ |
| **权限处理** | ✅ 继承自父类 | ✅ `setupPermissions()` | ❌ | ❌ |
| **批量安装** | ✅ 继承自父类 | ✅ `installTools()` | ❌ | ❌ |
| **升级功能** | ✅ 继承自父类 | ✅ `upgradeTools()` | ❌ | ❌ |
| **重试机制** | ✅ 继承自父类 | ✅ 自动重试 | ❌ | ❌ |
| **部署 hooks** | ✅ `deployHooks()` | ❌ | ✅ 抽象方法 | ❌ |
| **项目文件创建** | ✅ `createProjectFiles()` | ❌ | ❌ | ❌ |
| **Cross-CLI Hooks** | ✅ `generateToolHook()` | ❌ | ❌ | ❌ |
| **工具集成配置** | ✅ `installToolIntegration()` | ❌ | ❌ | ❌ |
| **错误处理** | 高级 (继承权限感知) | 高级 (权限感知) | 抽象 | 基础 |
| **推荐使用场景** | 完整功能和向后兼容 | 高级功能和权限处理 | 接口定义 | 不推荐使用 |

## 🎯 职责详细说明

### 1. StigmergyInstaller (完整安装器)

**文件位置：** `src/core/installer.js`

**继承关系：** 继承自 `EnhancedCLIInstaller`

**主要职责：**
- **继承自 EnhancedCLIInstaller**：所有高级功能（权限处理、批量安装、升级、重试）
- **CLI 工具扫描和检测**：`scanCLI()` 和 `checkCLI()`
- **Cross-CLI Hooks 生成**：`generateToolHook()` 和 `createToolHooks()`
- **项目管理和配置**：`createProjectFiles()` 和 `deployHooks()`
- **工具集成配置**：`installToolIntegration()` 和各种工具特定配置方法
- **向后兼容性**：保持所有原有功能不变

**推荐使用场景：**
- 需要完整功能的 CLI 工具管理
- 需要保持向后兼容的项目
- 需要项目管理、配置和 Hooks 部署的复杂场景
- 工具集成配置

**使用场景：**
- 扫描已安装的 CLI 工具
- 创建项目文件
- 部署集成 hooks
- 基础安装需求

**核心方法：**
```javascript
- scanCLI()           // 扫描所有 CLI 工具
- checkCLI(toolName)  // 检查单个 CLI 工具
- installTools()      // 基础安装 (无权限处理)
- deployHooks()       // 部署 hooks
- createProjectFiles() // 创建项目文件
- installToolIntegration() // 工具集成配置
```

### 2. EnhancedCLIInstaller (增强安装器)

**文件位置：** `src/core/enhanced_cli_installer.js`

**主要职责：**
- 高级权限处理
- 批量安装优化
- 工具升级功能
- 自动重试机制
- 跨平台权限提升

**使用场景：**
- 需要权限处理的安装
- 批量安装多个工具
- 升级现有工具
- 权限受限环境下的安装

**核心方法：**
```javascript
- setupPermissions()              // 权限设置和检测
- installTools()                  // 批量安装 (有权限处理)
- upgradeTools()                  // 批量升级
- installTool()                   // 单工具安装
- executeElevatedInstallation()   // 权限提升安装
- isPermissionError()             // 权限错误检测
```

### 3. BaseInstaller (抽象基类)

**文件位置：** `src/core/base_installer.js`

**主要职责：**
- 定义安装器标准接口
- 提供基础实现
- 确保继承类实现必需方法

**使用场景：**
- 作为其他安装器的基础
- 定义统一接口
- 代码复用

## 🚀 使用指南

### 何时使用 StigmergyInstaller？

```javascript
// 场景 1: 扫描和检测
const installer = new StigmergyInstaller();
const { available, missing } = await installer.scanCLI();

// 场景 2: 部署 hooks
await installer.deployHooks(availableTools);

// 场景 3: 创建项目文件
await installer.createProjectFiles();
```

### 何时使用 EnhancedCLIInstaller？

```javascript
// 场景 1: 需要权限处理的安装
const enhancedInstaller = new EnhancedCLIInstaller({
  verbose: true,
  autoRetry: true,
  maxRetries: 2
});

// 场景 2: 批量安装
const result = await enhancedInstaller.installTools(toolNames, toolInfos);

// 场景 3: 升级工具
const upgradeResult = await enhancedInstaller.upgradeTools(toolNames, toolInfos);
```

## 🔄 集成模式

### 模式 1: 分离式使用
```javascript
// 扫描使用基础安装器
const baseInstaller = new StigmergyInstaller();
const scanResult = await baseInstaller.scanCLI();

// 安装使用增强安装器
const enhancedInstaller = new EnhancedCLIInstaller();
await enhancedInstaller.installTools(missingTools);
```

### 模式 2: 根据需求选择
```javascript
function createInstaller(options) {
  if (options.needPermissions) {
    return new EnhancedCLIInstaller(options);
  } else {
    return new StigmergyInstaller();
  }
}
```

## ⚠️ 注意事项

### 避免的陷阱

1. **不要混淆 installTools 方法**
   - `StigmergyInstaller.installTools()`: 基础安装
   - `EnhancedCLIInstaller.installTools()`: 权限感知的安装

2. **不要在权限受限环境使用 StigmergyInstaller**
   - 在系统目录中使用可能失败
   - 应该使用 EnhancedCLIInstaller

3. **不要混合使用安装器方法**
   - 每个安装器都有完整的功能
   - 不需要从一个调用另一个的方法

### 性能考虑

- **扫描操作**: 使用 StigmergyInstaller (更轻量)
- **安装操作**: 使用 EnhancedCLIInstaller (功能更完整)
- **批量操作**: 优先使用 EnhancedCLIInstaller

## 🔧 配置建议

### 开发环境
```javascript
const installer = new StigmergyInstaller({
  verbose: true  // 开发时需要详细日志
});
```

### 生产环境
```javascript
const installer = new EnhancedCLIInstaller({
  verbose: false,
  autoRetry: true,
  maxRetries: 2
});
```

### 权限受限环境
```javascript
const installer = new EnhancedCLIInstaller({
  autoRetry: true,
  maxRetries: 3,
  timeout: 600000  // 增加超时时间
});
```

## 📈 未来改进计划

### 短期 (1-2 个月)
- [ ] 统一 installTools 接口
- [ ] 消除功能重复
- [ ] 添加安装器工厂模式

### 中期 (3-6 个月)
- [ ] 插件化安装器系统
- [ ] 配置文件驱动的安装器选择
- [ ] 安装器性能监控

### 长期 (6+ 个月)
- [ ] 动态安装器加载
- [ ] 云端安装器配置
- [ ] 智能安装器选择算法

## 📝 总结

Stigmergy CLI 的安装器架构设计遵循单一职责原则：

- **StigmergyInstaller**: 负责扫描、检测、基础安装、项目管理
- **EnhancedCLIInstaller**: 负责权限处理、批量操作、升级、重试
- **BaseInstaller**: 提供统一接口和基础实现

选择合适的安装器类可以确保最佳的性能和用户体验。
