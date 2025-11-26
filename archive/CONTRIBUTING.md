# 贡献指南

## 项目概述

智能体协作系统是一个基于共享项目背景的间接协同（Stigmergy）系统，允许多个AI CLI工具在内部实现自然语言协作。

## 贡献流程

### 1. 环境设置
```bash
# 克隆仓库
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Unix/Linux/macOS
# 或
venv\Scripts\activate     # Windows

# 安装依赖
pip install -r requirements.txt
```

### 2. 代码规范
- 遵循PEP 8 Python编码规范
- 添加适当的类型注解
- 确保文档字符串完整
- 使用有意义的变量名

### 3. 核心架构原则

#### Stigmergy协作机制
- 基于项目背景文件的间接协同
- 无需中央协调器的去中心化架构
- 环境驱动的智能体自主协作

#### 代码提交规范
- feat: 新功能
- fix: 修复错误
- docs: 文档更新
- style: 格式调整
- refactor: 代码重构
- test: 测试添加
- chore: 构建脚本等杂项

## 架构贡献方向

### 1. CLI工具集成
- 添加对新AI工具的支持
- 优化现有工具的协作能力
- 改进自然语言意图识别

### 2. Stigmergy机制优化
- 提高并发安全性
- 优化协作状态同步机制
- 增强任务委派智能

### 3. 项目背景管理
- 改进任务状态跟踪
- 优化协作历史记录
- 增强错误恢复机制

## 测试要求

所有贡献必须包含相应的测试验证：
```bash
# 运行单元测试
python -m unittest tests.test_unit -v

# 运行集成测试
python -m unittest tests.test_integration -v

# 运行完整测试套件
python tests/test_runner.py
```

## 代码审查

- 确保所有测试通过
- 验证Stigmergy协作机制的正确性
- 确认并发安全机制有效
- 检查文档完整性
- 验证向后兼容性