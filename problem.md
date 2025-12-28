# Stigmergy CLI技能触发机制深度调查报告

## 调查概述

本报告基于对Stigmergy CLI多智能体跨AI工具协作系统技能部署与触发机制的全面、严格、深入的调查。

**调查时间**: 2025年12月18日
**调查范围**: Claude CLI、Gemini CLI、Qwen CLI的技能集成现状
**调查方法**: 文件系统分析、配置文件检查、调试日志分析、实际测试验证

---

## 核心发现：系统性架构缺陷

### 🚨 关键问题：钩子从未被触发

**确认事实：经过极其严格的深度调查，确认这些钩子文件从来没有被激发过，包括基本的跨CLI通信时也没有触发。**

#### 证据链

1. **Claude CLI调试日志显示**：
   ```
   2025-12-18T14:14:30.404Z [DEBUG] Hooks: Found 0 total hooks in registry
   2025-12-18T14:14:30.407Z [DEBUG] Found 0 hook matchers in settings
   2025-12-18T14:14:30.407Z [DEBUG] Matched 0 unique hooks for query
   ```

2. **历史记录分析**：
   - 查看最近20条Claude对话记录
   - 没有任何跨CLI模式匹配
   - 没有stigmergy路由请求
   - 没有"请用gemini"、"调用qwen"等模式

3. **实际测试结果**：
   - 使用明确的跨CLI触发模式："use qwen to process"
   - 启用hooks调试模式：`-d hooks`
   - 结果：完全没有任何hook活动

---

## 根本原因分析

### 1. 不是单个CLI的格式问题，而是系统性设计缺陷

**所有CLI都使用相同的错误格式**：
- ❌ **Claude**: `{"cross_cli_adapter": {"enabled": true, ...}}`
- ❌ **Gemini**: `{"cross_cli_adapter": {"enabled": true, ...}}`
- ❌ **Qwen**: `{"cross_cli_adapter": {"enabled": true, ...}}`

**正确格式应该是**：
- ✅ **Claude**:
  ```json
  {
    "hooks": {
      "UserPromptSubmit": [
        {
          "hooks": [
            {
              "type": "command",
              "command": "node /path/to/hook.js"
            }
          ]
        }
      ]
    }
  }
  ```

### 2. 各CLI都有原生扩展系统但未被使用

**真相：每个CLI都有完整的原生扩展机制！**
- ✅ **Claude**: 有标准的hooks.json格式和plugin系统
  - 支持 `hooks` 调试模式：`-d hooks`
  - 有完整的事件类型：SessionStart, UserPromptSubmit, SubagentStart等
  - 有hook注册和匹配机制

- ✅ **Gemini**: 有extension系统
  - 命令：`gemini extensions <command>`
  - 选项：`--list-extensions`, `--extensions`

- ✅ **Qwen**: 有extension系统
  - 命令：`qwen extensions <command>`
  - 选项：`--list-extensions`, `--extensions`

### 3. 完全错误的集成策略

**Stigmergy的假设错误**：
1. ❌ 假设所有CLI都使用相同的自定义格式
2. ❌ 没有使用各CLI的原生扩展机制
3. ❌ 创建了一个完全独立的并行系统
4. ❌ 从未连接到任何CLI的实际执行路径

---

## 部署现状分析

### 已部署但无效的文件

1. **技能文件** ✅ 存在且完整
   - 17个专业技能存储在 `~/.stigmergy/skills/`
   - 技能内容可以通过stigmergy命令读取
   - 包含完整的PDF、Excel、前端设计等专业技能

2. **配置文件** ❌ 格式错误
   - 各CLI目录中的 `hooks.json` 使用自定义格式
   - 完全不被CLI工具识别

3. **钩子文件** ❌ 从未被调用
   - JavaScript/Python钩子文件存在但从未执行
   - 包含完整的技能检测逻辑但处于"休眠"状态
   - 没有任何日志或执行痕迹

4. **技能同步** ❌ 只是信息展示
   - 技能信息同步到CLI配置文件（claude.md, qwen.md等）
   - 但只是静态信息，不是功能集成

---

## 用户实际体验

**当前状态**：
- ✅ 用户可以通过 `stigmergy skill-l` 查看已安装技能
- ✅ 用户可以通过 `stigmergy skill-r pdf` 读取技能内容
- ❌ 用户在各CLI中**完全无法自动触发技能**
- ❌ 用户必须手动调用stigmergy命令
- ❌ 跨CLI请求没有实际效果

**用户反馈验证**：
- "在各个CLI里面看不到技能反应"
- "技能部署后是否真的可以让这些CLI触发这些技能"
- "为何无法触发这些技能"

---

## 解决方案建议

### 立即行动方案

1. **修复Claude CLI集成**
   ```json
   // 正确的 ~/.claude/hooks.json 格式
   {
     "hooks": {
       "UserPromptSubmit": [
         {
           "hooks": [
             {
               "type": "command",
               "command": "node ~/.claude/hooks/skill_trigger.js",
               "matcher": "PDF|Excel|frontend|表格处理"
             }
           ]
         }
       ]
     }
   }
   ```

2. **创建Gemini标准扩展**
   - 创建符合Gemini extension API的插件
   - 部署到 `~/.gemini/extensions/` 目录

3. **创建Qwen标准扩展**
   - 创建符合Qwen extension API的插件
   - 部署到 `~/.qwen/extensions/` 目录

### 长期架构重构

1. **使用原生机制**
   - 每个CLI使用其官方的扩展机制
   - 放弃通用自定义格式的设想

2. **创建专用适配器**
   - 为每个CLI创建专门的集成适配器
   - 利用各CLI的独特功能

3. **测试验证体系**
   - 建立完整的技能触发测试
   - 确保真实用户场景下的功能可用性

---

## 结论

**这不是"只是Claude的hooks格式问题"，而是系统性的架构错误。**

Stigmergy部署了一个完整的技能检测系统，但这个系统与各CLI工具的实际执行路径**没有任何连接**。就像造了一辆完美的汽车，但是忘记连接发动机和轮子。

**关键教训**：
1. 不能假设可以使用自定义格式替代官方标准
2. 必须深入理解各CLI的原生机制
3. 部署文件存在不等于功能可用
4. 必须建立真实的功能验证测试

**建议**：
立即停止当前的部署方式，重新设计基于各CLI原生扩展机制的正确集成方案。

---

## 技术附录

### 调试命令示例

```bash
# Claude CLI hooks调试
claude -d hooks -p "use qwen to process this PDF"

# 检查hook注册
grep "Found.*hooks" ~/.claude/debug/*.txt

# 查看原生hook格式
cat ~/.claude/plugins/marketplaces/claude-plugins-official/plugins/security-guidance/hooks/hooks.json
```

### 文件路径参考

- Claude配置：`~/.claude/hooks.json`
- Gemini配置：`~/.gemini/config.json`
- Qwen配置：`~/.qwen/config.json`
- 技能存储：`~/.stigmergy/skills/`
- 调试日志：`~/.claude/debug/`

---

**报告生成时间**: 2025年12月18日
**调查结论**: 钩子从未触发，需要完全重构集成方案