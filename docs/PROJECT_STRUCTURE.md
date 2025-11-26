# AI CLI Universal Integration System
## Project Structure (项目结构)

**Project ID:** AI-CLI-UNIFIED-001
**Structure Version:** 1.0
**Date:** 2025-01-22

---

## 📁 目录结构

```
smart-cli-router/
├── 📄 核心文档
│   ├── README.md                    # 项目介绍和快速开始
│   ├── PROJECT_REQUIREMENTS.md      # 统一需求规范
│   ├── PROJECT_CONSTITUTION.md      # 项目宪法（约束条件）
│   ├── UNIFIED_TECHNICAL_ARCHITECTURE.md  # 统一技术架构
│   ├── NATIVE_INTEGRATION_GUIDE.md  # 原生集成实现指南
│   ├── PROJECT_STRUCTURE.md         # 项目结构说明（本文件）
│   ├── CONTRIBUTING.md              # 贡献指南
│   ├── LICENSE                      # 开源许可证
│   └── requirements.txt             # Python依赖
│
├── 🔧 核心代码 (src/)
│   ├── core/                        # 核心框架
│   │   ├── __init__.py
│   │   ├── base_adapter.py          # 适配器基类
│   │   ├── factory.py               # 适配器工厂
│   │   ├── parser.py                # 自然语言解析器
│   │   ├── router.py                # 意图路由器
│   │   └── collaboration.py         # 协作协调器
│   │
│   ├── adapters/                    # CLI适配器实现
│   │   ├── claude/                  # Claude CLI适配器
│   │   │   ├── __init__.py
│   │   │   ├── hook_adapter.py      # Hook系统适配器
│   │   │   └── config.json          # Claude CLI配置
│   │   │
│   │   ├── qwencode/                # QwenCodeCLI适配器
│   │   │   ├── __init__.py
│   │   │   ├── class_adapter.py     # 类继承适配器
│   │   │   └── config.json          # QwenCodeCLI配置
│   │   │
│   │   ├── gemini/                  # Gemini CLI适配器
│   │   │   ├── __init__.py
│   │   │   ├── module_adapter.py    # 模块扩展适配器
│   │   │   └── config.json          # Gemini CLI配置
│   │   │
│   │   ├── iflow/                   # iFlowCLI适配器
│   │   │   ├── __init__.py
│   │   │   ├── workflow_adapter.py  # 工作流脚本适配器
│   │   │   ├── workflow.yml         # iFlowCLI工作流
│   │   │   └── config.json          # iFlowCLI配置
│   │   │
│   │   ├── qoder/                   # QoderCLI适配器
│   │   │   ├── __init__.py
│   │   │   ├── plugin_adapter.py    # Plugin系统适配器
│   │   │   └── config.json          # QoderCLI配置
│   │   │
│   │   ├── codebuddy/               # CodeBuddyCLI适配器
│   │   │   ├── __init__.py
│   │   │   ├── buddy_adapter.py     # Buddy系统适配器
│   │   │   └── config.json          # CodeBuddyCLI配置
│   │   │
│   │   └── codex/                   # Codex CLI适配器
│   │       ├── __init__.py
│   │       ├── extension_adapter.py # Extension系统适配器
│   │       └── config.json          # Codex CLI配置
│   │
│   └── utils/                       # 工具模块
│       ├── __init__.py
│       ├── logger.py                # 日志工具
│       ├── config.py                # 配置管理
│       ├── atomic_state.py          # 原子状态管理
│       └── protocols.py             # 协议定义
│
├── 🧪 测试代码 (tests/)
│   ├── unit/                        # 单元测试
│   │   ├── __init__.py
│   │   ├── test_core/               # 核心框架测试
│   │   │   ├── test_base_adapter.py
│   │   │   ├── test_factory.py
│   │   │   ├── test_parser.py
│   │   │   └── test_router.py
│   │   │
│   │   └── adapters/                # 适配器单元测试
│   │       ├── test_claude_adapter.py
│   │       ├── test_qwencode_adapter.py
│   │       ├── test_gemini_adapter.py
│   │       ├── test_iflow_adapter.py
│   │       ├── test_qoder_adapter.py
│   │       ├── test_codebuddy_adapter.py
│   │       └── test_codex_adapter.py
│   │
│   ├── integration/                 # 集成测试
│   │   ├── __init__.py
│   │   ├── test_cross_cli_calls.py  # 跨CLI调用测试
│   │   ├── test_collaboration.py    # 间接协作测试
│   │   └── adapters/                # 适配器集成测试
│   │       ├── test_claude_integration.py
│   │       ├── test_qwencode_integration.py
│   │       └── ...
│   │
│   ├── fixtures/                    # 测试数据
│   │   ├── sample_requests.json
│   │   ├── mock_responses.json
│   │   └── test_configs/
│   │
│   └── conftest.py                  # pytest配置
│
├── 📚 文档 (docs/)
│   ├── api/                         # API文档
│   │   ├── core.md                  # 核心API
│   │   └── adapters.md              # 适配器API
│   │
│   ├── user_guide/                  # 用户指南
│   │   ├── installation.md          # 安装指南
│   │   ├── usage.md                 # 使用指南
│   │   └── troubleshooting.md       # 故障排除
│   │
│   └── developer_guide/             # 开发者指南
│       ├── contributing.md          # 贡献指南
│       ├── testing.md               # 测试指南
│       └── architecture.md          # 架构说明
│
├── 🚀 部署和配置
│   ├── install_unix.sh              # Unix安装脚本
│   ├── install_windows.bat          # Windows安装脚本
│   ├── config.json                  # 全局配置文件
│   ├── pyproject.toml               # Python项目配置
│   └── setup.py                     # 安装脚本
│
├── 🌐 网站 (website/)
│   ├── index.html                   # 主页
│   ├── css/                         # 样式文件
│   ├── js/                          # JavaScript文件
│   └── docs/                        # 网站文档
│
├── 🗄️ 存档 (archive/)
│   ├── obsolete_files/              # 过时文件存档
│   └── old_versions/                # 旧版本存档
│
├── 📋 项目管理
│   ├── PROJECT_SPEC.json            # 项目规范
│   └── .gitignore                   # Git忽略文件
│
└── 🔒 配置和缓存
    ├── .git/                        # Git仓库
    ├── .claude/                     # Claude配置
    └── __pycache__/                 # Python缓存
```

---

## 🎯 目录设计原则

### 1. **CLI专用目录结构**
每个CLI工具都有独立的适配器目录：
- **独立的适配器实现** - 避免代码耦合
- **专用配置文件** - 每个CLI的特定配置
- **独立测试** - 针对性的单元测试和集成测试

### 2. **TDD驱动结构**
测试先行，代码后实现：
- **单元测试** - 每个组件的独立测试
- **集成测试** - 跨组件功能测试
- **测试数据** - 标准化的测试数据集

### 3. **模块化设计**
清晰的模块划分：
- **core/** - 核心框架和通用功能
- **adapters/** - CLI特定的适配器实现
- **utils/** - 通用工具和辅助功能

### 4. **文档分层**
面向不同用户的文档：
- **用户文档** - 安装、使用、故障排除
- **开发者文档** - API、架构、贡献指南
- **技术文档** - 详细的技术规范

---

## 📦 开发工作流

### TDD开发流程
1. **编写测试** - 在`tests/`中创建测试用例
2. **运行测试** - 测试应该失败（RED）
3. **实现代码** - 在`src/`中编写最小可行代码
4. **运行测试** - 测试应该通过（GREEN）
5. **重构优化** - 改进代码质量，保持测试通过（REFACTOR）

### CLI适配器开发流程
1. **创建适配器目录** - `src/adapters/{cli_name}/`
2. **编写适配器测试** - `tests/unit/adapters/test_{cli_name}_adapter.py`
3. **实现适配器类** - `src/adapters/{cli_name}/{type}_adapter.py`
4. **创建配置文件** - `src/adapters/{cli_name}/config.json`
5. **编写集成测试** - `tests/integration/adapters/test_{cli_name}_integration.py`

---

## 🔧 核心组件说明

### 1. **BaseAdapter** (`src/core/base_adapter.py`)
所有CLI适配器的基类，定义统一接口：
```python
class BaseCrossCLIAdapter(ABC):
    @abstractmethod
    async def execute_task(self, task: str, context: dict) -> str
    @abstractmethod
    def is_available(self) -> bool
```

### 2. **AdapterFactory** (`src/core/factory.py`)
适配器工厂，负责创建和管理适配器实例：
```python
class CrossCliAdapterFactory:
    def get_adapter(self, cli_name: str) -> BaseCrossCLIAdapter
    def list_available_adapters(self) -> Dict[str, bool]
```

### 3. **NaturalLanguageParser** (`src/core/parser.py`)
自然语言解析器，识别跨CLI调用意图：
```python
class NaturalLanguageParser:
    def parse_intent(self, user_input: str) -> IntentResult
    def detect_cross_cli_call(self, text: str) -> bool
```

### 4. **IntentRouter** (`src/core/router.py`)
意图路由器，根据解析结果路由到相应处理器：
```python
class IntentRouter:
    def route_request(self, intent: IntentResult) -> RequestTarget
    def select_adapter(self, target_cli: str) -> BaseCrossCLIAdapter
```

---

## 📋 开发优先级

基于原生集成可行性，开发优先级为：

### Phase 1: 高可行性CLI (Weeks 1-4)
1. **Claude CLI** - 官方Hook系统，文档完善
2. **QwenCodeCLI** - Python类继承，原生支持
3. **Gemini CLI** - 官方Extension接口

### Phase 2: 标准CLI (Weeks 5-8)
4. **CodeBuddyCLI** - 官方Buddy系统
5. **QoderCLI** - 官方Plugin架构
6. **Codex CLI** - 官方Extension系统

### Phase 3: 创新CLI (Weeks 9-12)
7. **iFlowCLI** - 官方Python工作流节点

---

## 🧪 测试策略

### 测试金字塔
```
    E2E Tests (5%)
      用户场景测试
    Integration Tests (25%)
      适配器集成测试
      跨CLI调用测试
    Unit Tests (70%)
      核心组件测试
      适配器单元测试
```

### 测试覆盖率目标
- **核心框架**: 95%+ 覆盖率
- **适配器代码**: 90%+ 覆盖率
- **工具模块**: 85%+ 覆盖率

### 测试环境
- **本地测试**: 单元测试和基础集成测试
- **CI/CD测试**: 全量测试套件
- **端到端测试**: 真实CLI环境测试

---

## 🚀 部署结构

### 包结构
```
ai_cli_unified/
├── __init__.py
├── core/
├── adapters/
├── utils/
└── __main__.py
```

### 配置管理
- **全局配置**: `~/.config/ai-cli-unified/config.yml`
- **CLI特定配置**: `~/.config/{cli}/config.yml`
- **用户配置**: `~/.ai-cli-unified/config.json`

---

*本项目结构设计遵循TDD原则、模块化设计和CLI专用化策略，确保代码的可维护性、可测试性和可扩展性。*