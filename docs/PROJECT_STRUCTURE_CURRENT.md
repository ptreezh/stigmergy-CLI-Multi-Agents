# 项目结构说明

## 📁 整理后的目录结构

```
smart-cli-router/
├── 📄 README.md                    # 项目主要说明文档
├── 📄 CLAUDE.md                    # Claude Code 项目指导文档
├── 📄 INSTALL.md                   # 安装说明
├── 📄 INTEGRATION_GUIDE.md         # 集成指南
├── 📄 PROJECT_SPEC.json            # 项目规范（空文件，待填充）
├── 📄 setup.py                     # Python 包配置
├── 📄 package.json                 # Node.js 配置
├── 📄 pytest.ini                   # pytest 配置
├── 📁 src/                          # 核心源代码
│   ├── 📁 adapters/                 # CLI适配器实现
│   ├── 📁 core/                     # 核心框架组件
│   └── 📁 utils/                    # 工具函数
├── 📁 tests/                        # 测试文件
│   ├── 📁 unit/                     # 单元测试
│   └── 📁 integration/              # 集成测试
├── 📁 docs/                         # 技术文档
│   ├── 📄 PROJECT_CONSTITUTION.md    # 项目宪法
│   ├── 📄 PROJECT_REQUIREMENTS.md   # 需求规范
│   ├── 📄 UNIFIED_TECHNICAL_ARCHITECTURE.md # 技术架构
│   ├── 📄 NATIVE_INTEGRATION_GUIDE.md # 原生集成指南
│   └── 📄 PROJECT_STRUCTURE.md      # 项目结构说明
├── 📁 scripts/                      # 构建和部署脚本
├── 📁 templates/                    # 模板文件
├── 📁 deployment/                   # 部署相关文件
├── 📁 test-deployment/              # 部署测试
├── 📁 archive/                      # 🗂️ 存档目录（冗余文件）
│   ├── 📄 README.md                  # 存档说明
│   ├── 📁 obsolete_docs/            # 废弃文档
│   ├── 📁 obsolete_scripts/         # 废弃脚本
│   ├── 📁 obsolete_configs/         # 废弃配置
│   ├── 📁 demo_scripts/             # 演示脚本
│   ├── 📁 reports/                  # 报告文件
│   └── 📁 obsolete_files/           # 历史文件
└── 📁 node_modules/                 # Node.js依赖
```

## 🧹 项目整理说明

### 已移动到存档的文件类型

1. **重复文档** - 多个版本的README、安装指南、部署文档
2. **过时脚本** - 旧版本的安装脚本、部署脚本
3. **测试报告** - TDD报告、验证报告、部署报告
4. **演示代码** - 功能演示脚本、示例代码
5. **临时文件** - 开发过程中的临时配置和脚本

### 保留的核心文件

- **项目文档**: README.md, CLAUDE.md, INSTALL.md, INTEGRATION_GUIDE.md
- **技术文档**: 移动到 `docs/` 目录统一管理
- **核心代码**: `src/` 目录下的所有源代码
- **测试代码**: `tests/` 目录下的所有测试文件
- **配置文件**: package.json, setup.py, pytest.ini
- **脚本模板**: `scripts/`, `templates/` 目录

## 📋 文件组织原则

1. **根目录简洁** - 只保留必要的项目配置和说明文档
2. **功能分类** - 按功能将文件组织到不同目录
3. **历史保留** - 废弃文件移至存档而非删除
4. **文档统一** - 技术文档集中在 `docs/` 目录
5. **依赖分离** - 第三方依赖使用标准目录结构

## 🔍 快速导航

- **新用户** → 阅读 `README.md` 开始使用
- **开发者** → 查看 `CLAUDE.md` 了解开发指南
- **安装部署** → 参考 `INSTALL.md` 和 `deployment/` 目录
- **技术架构** → 查看 `docs/` 目录下的技术文档
- **源代码** → 浏览 `src/` 目录
- **测试** → 运行 `tests/` 目录下的测试
- **历史文件** → 查看 `archive/` 目录

---
*项目结构整理于 2025-11-26*