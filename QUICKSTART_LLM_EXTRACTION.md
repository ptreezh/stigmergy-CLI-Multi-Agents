# 🚀 快速开始 - LLM驱动经验提取系统

## 一分钟上手

```bash
# 1. 进入项目目录
cd C:/bde/stigmergy

# 2. 运行测试，验证系统
node scripts/test-llm-extraction.js

# 3. 提取经验（自动）
stigmergy concurrent "测试任务"

# 4. 查看提取的经验
tail -100 STIGMERGY.md

# 5. 查看生成的技能
ls ~/.stigmergy/skills/
```

## 📋 前提条件

确保以下CLI可用：
- ✅ qwen (中文会话分析)
- ✅ claude (复杂代码分析)
- ✅ codebuddy (代码问题分析)

至少一个CLI可用即可工作。

## 🎯 三种使用方式

### 方式1: 自动提取（推荐）

```bash
# 在做任何工作时自动提取经验
stigmergy concurrent "你的实际任务"

# 系统会在后台：
# 1. 扫描最近的CLI会话
# 2. 使用LLM深度分析
# 3. 提取结构化经验
# 4. 更新STIGMERGY.md
# 5. (可选) 生成新技能
```

### 方式2: 手动提取

```bash
# 直接运行提取脚本
node scripts/extract-experiences.js

# 适合：
# - 定期维护
# - 批量处理历史会话
# - 手动触发技能生成
```

### 方式3: 专项提取

```bash
# 只分析特定CLI的会话
# (需要修改脚本指定CLI)
```

## 📝 查看结果

### 查看提取的经验

```bash
# 查看最新经验
tail -50 STIGMERGY.md

# 搜索特定主题
grep "Promise" STIGMERGY.md
grep "优化" STIGMERGY.md

# 统计经验数量
grep -c "经验层级" STIGMERGY.md
```

### 查看生成的技能

```bash
# 列出所有技能
ls ~/.stigmergy/skills/

# 查看技能内容
cat ~/.stigmergy/skills/<skill-name>/SKILL.md

# 查看自动生成的技能
grep -l "auto-generated: true" ~/.stigmergy/skills/*/SKILL.md
```

## 🎨 实际效果示例

### 场景：性能优化经验

**用户操作**:
```bash
qwen "这个异步代码太慢了，帮我优化"
# qwen建议使用Promise.all()

# 后台自动提取经验
stigmergy concurrent "其他任务"
```

**系统提取的经验** (存储在STIGMERGY.md):
```markdown
# 经验层级 1：快速概览
使用Promise.all()将串行异步操作改为并行执行

# 经验层级 2：核心要点
## 问题是什么
多个异步操作串行执行导致耗时过长
## 解决方案
使用Promise.all()并行执行
## 适用场景
异步优化, 性能提升

# 经验层级 3：详细说明
### 代码示例
[具体代码和说明]

# 经验层级 5：元数据
### 可信度
高 (90%) - 有验证数据
```

**自动生成的技能**:
```bash
~/.stigmergy/skills/async-optimization/SKILL.md
```

**下次使用**:
```bash
# 任何CLI都可以学习这个经验
claude "优化这段异步代码"

# Claude会自动加载技能并应用
```

## 💡 最佳实践

### 1. 定期维护

```bash
# 每周运行一次
node scripts/extract-experiences.js

# 清理重复或低质量经验
# 手动编辑 STIGMERGY.md
```

### 2. 验证技能质量

```bash
# 测试新生成的技能
stigmergy call "使用 async-optimization 技能"

# 如果技能不好，手动编辑或删除
rm -rf ~/.stigmergy/skills/async-optimization
```

### 3. 积累高质量经验

```bash
# 在CLI会话中：
# - 明确描述问题和解决方案
# - 包含代码示例
# - 说明验证方法
# - 讨论适用场景

这样提取的经验质量更高
```

## ⚙️ 配置选项

### 调整技能生成阈值

```javascript
// 编辑 src/core/memory/EnhancedExperienceManager.js
this.skillGenerationThreshold = 3; // 默认5，改为3更敏感
```

### 调整会话扫描范围

```javascript
// 编辑 src/core/extraction/LLMInsightExtractor.js
const cutoffTime = Date.now() - (7 * 24 * 60 * 60 * 1000); // 改为7天
```

### 禁用自动技能生成

```javascript
// 编辑 src/cli/commands/concurrent.js
// 注释掉这一行：
// await enhancedManager.analyzeAndGenerateSkills();
```

## 🐛 常见问题

### Q: 没有提取到经验？

**A**: 检查以下几点：
```bash
# 1. 是否有最近的CLI会话？
ls -lt ~/.qwen/projects/*/chats/ | head -5

# 2. 会话文件是否在时间范围内？
# 默认只分析最近1天的会话

# 3. CLI是否可用？
qwen "测试"  # 测试qwen是否可用
```

### Q: 提取的经验质量不高？

**A**:
- 确保会话内容足够丰富
- 包含具体的问题、解决方案、代码
- 系统会自动选择最合适的CLI分析

### Q: 技能没有自动生成？

**A**:
- 需要至少5个相关主题的经验
- 可以手动降低阈值
- 检查经验内容是否相关

### Q: CLI调用失败？

**A**:
- 系统会自动降级到基础分析
- 不影响整体功能
- 可以手动调用单个CLI

## 📚 进阶使用

### 手动调用特定CLI分析

```javascript
// 创建自定义脚本
const LLMInsightExtractor = require('./src/core/extraction/LLMInsightExtractor');
const extractor = new LLMInsightExtractor();

const sessionContent = "你的会话内容...";

// 强制使用claude分析
const insights = await extractor.extractFromSession(sessionContent, 'claude');
```

### 自定义分析提示词

```javascript
// 编辑 LLMInsightExtractor.js 的 buildAnalysisPrompt() 方法
// 添加你自己的要求和格式
```

### 扩展存储格式

```javascript
// 可以修改金字塔MD格式
// 或者添加新的层级
// 在 formatAsPyramidMD() 方法中
```

## 🎉 系统特点

1. **真正利用模型算力** - 调用qwen/claude/codebuddy的LLM
2. **智能理解** - 不只是关键词匹配
3. **结构化存储** - 金字塔式，便于AI学习
4. **自动进化** - 经验→技能→新经验
5. **非侵入** - 不需要修改现有CLI

## 🚀 下一步

1. **运行测试**: `node scripts/test-llm-extraction.js`
2. **提取经验**: `stigmergy concurrent "测试"`
3. **查看结果**: `tail -100 STIGMERGY.md`
4. **使用技能**: `stigmergy call "使用 <skill-name>"`

开始使用真正的AI进化系统吧！
