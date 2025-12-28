# ResumeSession Kode集成完整测试计划

## 1. 测试概述

### 1.1 测试目标
- 验证stigmergy CLI系统中resumesession包是否支持kode的历史会话恢复
- 验证kode CLI是否能够从其它CLI的历史会话中恢复
- 验证跨CLI会话恢复功能的完整性和正确性

### 1.2 测试范围
- 单元测试
- 代码全覆盖测试
- 回归测试
- 集成测试
- 真实场景测试
- npm包构建与安装测试

## 2. 测试环境准备

### 2.1 清理环境
```bash
# 创建干净的测试目录
mkdir -p D:\stigmergy-test-environment
cd D:\stigmergy-test-environment

# 确保没有残留的CLI配置
rm -rf ~/.claude ~/.gemini ~/.qwen ~/.iflow ~/.codebuddy ~/.qoder ~/.codex ~/.kode ~/.stigmergy ~/.resumesession
```

### 2.2 安装必需的CLI工具
```bash
npm install -g @shareai-lab/kode
npm install -g @anthropic-ai/claude-code
npm install -g @google/gemini-cli
npm install -g @qwen-code/qwen-code
npm install -g @iflow-ai/iflow-cli
npm install -g @qoder-ai/qodercli
npm install -g @tencent-ai/codebuddy-code
npm install -g @openai/codex
npm install -g @stigmergy/resume
```

## 3. 单元测试

### 3.1 核心功能单元测试
- [ ] SessionScanner类功能测试（包括kode路径扫描）
- [ ] SessionFilter类功能测试
- [ ] HistoryFormatter类功能测试
- [ ] HistoryQuery类功能测试
- [ ] PathConfigManager类功能测试（包括kode路径配置）

### 3.2 生成器单元测试
- [ ] ResumeSessionGenerator的kode集成代码生成测试
- [ ] CodeGenerator的kode模板生成测试
- [ ] 集成文件部署功能测试

### 3.3 CLI命令单元测试
- [ ] resume命令转发功能测试
- [ ] resumesession命令功能测试
- [ ] sg-resume命令功能测试

## 4. 代码全覆盖测试

### 4.1 覆盖率目标
- [ ] 整体代码覆盖率 >= 80%
- [ ] 核心模块覆盖率 >= 90%
- [ ] 新增kode功能覆盖率 >= 95%

### 4.2 覆盖测试执行
```bash
npm run test:coverage
```

## 5. 回归测试

### 5.1 现有功能回归测试
- [ ] 所有已支持的CLI工具（claude, gemini, qwen, iflow, codebuddy, qodercli, codex）的会话扫描功能
- [ ] 会话过滤和搜索功能
- [ ] 命令行参数解析功能
- [ ] 集成代码生成和部署功能

### 5.2 历史问题回归测试
- [ ] resumesession-core模块缺失问题修复验证
- [ ] 路径配置缓存功能验证
- [ ] 各CLI工具会话格式兼容性验证

## 6. 集成测试

### 6.1 跨CLI集成测试
- [ ] 在不同CLI环境中生成会话数据
- [ ] 验证跨CLI会话扫描功能
- [ ] 验证不同CLI工具间的会话恢复

### 6.2 Kode专项集成测试
- [ ] kode CLI的会话路径自动发现
- [ ] kode会话文件格式解析
- [ ] kode与其他CLI工具的会话共享
- [ ] kode中的`/stigmergy-resume`命令功能

### 6.3 真实场景集成测试
- [ ] 在真实项目中测试会话恢复
- [ ] 多CLI工具协同工作场景
- [ ] 会话搜索和过滤功能

## 7. 构建和安装测试

### 7.1 npm包构建
- [ ] 构建resumesession包
- [ ] 验证构建产物完整性
- [ ] 测试包依赖关系

### 7.2 安装和卸载测试
- [ ] 安装新版本包
- [ ] 卸载原有包
- [ ] 验证安装后功能完整性

## 8. 真实场景测试

### 8.1 会话创建测试
- [ ] 在claude CLI中创建会话
- [ ] 在gemini CLI中创建会话
- [ ] 在qwen CLI中创建会话
- [ ] 在kode CLI中创建会话
- [ ] 在其他CLI工具中创建会话

### 8.2 跨CLI恢复测试
- [ ] 在kode中通过`/stigmergy-resume`查看其他CLI的会话
- [ ] 在其他CLI中查看kode的会话
- [ ] 验证会话搜索功能
- [ ] 验证特定CLI过滤功能

### 8.3 项目感知测试
- [ ] 在不同项目目录中验证会话过滤
- [ ] 验证跨项目会话隔离

## 9. 具体测试步骤

### 9.1 初始化测试环境
```bash
# 安装stigmergy CLI
npm install -g stigmergy

# 初始化测试项目
mkdir -p D:\stigmergy-test-environment\test-project
cd D:\stigmergy-test-environment\test-project
stigmergy init
```

### 9.2 部署ResumeSession集成
```bash
# 运行resumesession初始化
resumesession init
# 选择所有支持的CLI工具，包括kode
```

### 9.3 创建测试数据
```bash
# 在当前项目中模拟创建各种CLI的会话数据
# 这将通过模拟会话文件创建来完成
```

### 9.4 功能验证测试
```bash
# 在shell中启动stigmergy并测试
stigmergy resume --help
stigmergy resumesession scan
stigmergy resumesession status
```

## 10. Kode特定测试用例

### 10.1 Kode会话生成测试
- [ ] 验证kode CLI能够生成符合格式的会话文件
- [ ] 验证会话文件存储在正确的路径
- [ ] 验证会话文件格式正确性

### 10.2 Kode会话扫描测试
- [ ] 验证ResumeSession能够扫描到kode的会话
- [ ] 验证kode会话内容正确解析
- [ ] 验证kode会话与其他CLI会话正确区分

### 10.3 跨CLI恢复测试（kode）
- [ ] 在其他CLI中恢复kode会话
- [ ] 在kode中恢复其他CLI的会话
- [ ] 验证跨CLI上下文恢复功能

## 11. 验收标准

### 11.1 功能验收标准
- [ ] 所有CLI工具（包括kode）能够正确集成resumesession
- [ ] 跨CLI会话恢复功能正常工作
- [ ] 会话搜索和过滤功能正常工作
- [ ] 代码覆盖率达标

### 11.2 性能验收标准
- [ ] 会话扫描响应时间 < 2秒
- [ ] 集成代码生成时间 < 1秒
- [ ] 命令执行无明显延迟

### 11.3 稳定性验收标准
- [ ] 无崩溃或异常退出
- [ ] 错误处理机制完善
- [ ] 异常路径安全处理

## 12. 测试报告

### 12.1 测试执行记录
- 单元测试结果
- 集成测试结果
- 覆盖率测试结果
- 回归测试结果

### 12.2 问题记录
- 发现的问题
- 问题严重程度
- 解决状态

### 12.3 最终结论
- 功能完整性评估
- 性能评估
- 稳定性评估
- 推荐是否发布

## 13. 备注

- 所有测试将在干净的测试环境中执行
- 测试前备份重要数据
- 记录详细测试日志以供后续分析
- 确保测试不影响生产环境