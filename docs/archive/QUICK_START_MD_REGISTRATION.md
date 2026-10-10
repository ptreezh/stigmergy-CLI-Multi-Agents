# .md文档自动注册 - 快速指南

## 🎯 功能说明

为**iflow**, **codebuddy**, **qwen**三个CLI自动在.md文档中注册skill。

✅ **无需手动编辑.md文档**
✅ **部署时自动注册**
✅ **支持批量注册**

---

## 🚀 快速开始

### 方法1: 使用ConfigDeployer (推荐)

```javascript
const ConfigDeployer = require('./src/core/config/ConfigDeployer');

const deployer = new ConfigDeployer({
  packageDir: './config/bundle',
  verbose: true
});

await deployer.run();
// 自动为iflow, codebuddy, qwen注册skills
```

### 方法2: 直接注册方法

```javascript
const deployer = new ConfigDeployer();

// 注册单个skill
await deployer.registerSkillsInCLIDoc('qwen', ['my-skill']);

// 批量注册
await deployer.registerSkillsInCLIDoc('iflow', [
  'skill-1',
  'skill-2',
  'skill-3'
]);
```

### 方法3: 注销skill

```javascript
const deployer = new ConfigDeployer();

// 注销单个skill
await deployer.unregisterSkillsFromCLIDoc('qwen', ['my-skill']);

// 批量注销
await deployer.unregisterSkillsFromCLIDoc('iflow', [
  'skill-1',
  'skill-2'
]);
```

---

## 📋 支持的CLI

| CLI | 支持 | 说明 |
|-----|------|------|
| iflow | ✅ | 完全支持.md注册 |
| codebuddy | ✅ | 完全支持.md注册 |
| qwen | ✅ | 完全支持.md注册 |
| gemini | ⏳ | 需重测 |
| claude | ❌ | 不支持.md注册 |
| qodercli | ❌ | 不支持.md注册 |
| copilot | ❌ | 不支持.md注册 |
| codex | ❌ | 不支持.md注册 |

---

## 📝 .md文档格式

### 注册前

```markdown
<!-- SKILLS_START -->
<skills_system priority="1">

<available_skills>

</available_skills>

</skills_system>
<!-- SKILLS_END -->
```

### 注册后

```markdown
<!-- SKILLS_START -->
<skills_system priority="1">

<available_skills>

<skill>
<name>my-skill</name>
<description>Skill deployed from Stigmergy CLI coordination layer</description>
<location>stigmergy</location>
</skill>

</available_skills>

</skills_system>
<!-- SKILLS_END -->
```

---

## ⚙️ 配置选项

### ConfigDeployer选项

```javascript
const deployer = new ConfigDeployer({
  packageDir: './config/bundle',  // 配置包目录
  verbose: true,                   // 详细输出
  force: false,                    // 强制覆盖
  dryRun: false                    // 试运行模式
});
```

---

## 🔍 验证注册

### 方法1: 检查.md文档

```bash
grep "<name>skill-name</name>" qwen.md
```

### 方法2: 使用CLI测试

```bash
qwen "请使用skill-name技能"
```

---

## 📊 返回值

```javascript
{
  successCount: 2,  // 成功注册数量
  skipCount: 1,     // 跳过数量（已存在）
  failCount: 0      // 失败数量
}
```

---

## 🧪 测试

```bash
# 运行测试
node test-md-registration.js
```

---

## 📚 相关文档

- **详细实现报告**: `docs/MD_REGISTRATION_IMPLEMENTATION.md`
- **测试结果报告**: `docs/FINAL_SKILL_ACTIVATION_REPORT.md`
- **源代码**: `src/core/config/ConfigDeployer.js`

---

## ⚠️ 注意事项

1. **.md文档位置**: 假设在项目根目录
2. **Skill名称**: 从路径自动提取
3. **重复注册**: 自动检测并跳过
4. **备份**: 建议部署前备份.md文档

---

## 🐛 故障排除

### 问题: 注册失败

**检查**:
- .md文档是否存在
- `</available_skills>`标签是否存在
- 文件权限是否正确

### 问题: Skill未激活

**检查**:
- CLI是否支持.md注册
- 是否需要重启CLI
- Skill名称是否正确

---

## 🎉 成功案例

```
📦 Deploying qwen configuration...
  Deploying to qwen/skills...
    Results: 5 written, 0 skipped, 0 failed

  Registering 5 skill(s) in qwen.md...
    ✓ Registered: skill-1
    ✓ Registered: skill-2
    ✓ Registered: skill-3
    ✓ Registered: skill-4
    ✓ Registered: skill-5
  ✓ Updated qwen.md (5 skill(s) registered)
    Results: 5 registered, 0 skipped, 0 failed
```

---

**更新时间**: 2025-01-25
**版本**: 1.0.0
