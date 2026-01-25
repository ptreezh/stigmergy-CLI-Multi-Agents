# 真实场景测试计划

## 测试目标

验证ConfigDeployer能否真实地将技能部署到各CLI并让CLI实际使用。

---

## 测试策略

### 选择真实技能
从现有CLI中选择一个已验证能工作的真实技能：
- **claude的ant技能** - 已确认存在且工作
- **位置**: `~/.claude/skills/ant/`

### 测试CLI
选择3个代表性CLI：
1. **qwen** (Type A: .md文档注册)
2. **codebuddy** (Type A: .md文档注册)
3. **claude** (Type B: Hooks机制 - 自身已有)

---

## 任务步骤

### 阶段1: 准备真实技能包

**任务1.1**: 读取ant技能的完整内容
```bash
# 读取ant技能的所有文件
ls -la ~/.claude/skills/ant/
cat ~/.claude/skills/ant/SKILL.md
```

**任务1.2**: 创建配置包目录结构
```bash
mkdir -p config/bundle/test-ant-deployment
```

**任务1.3**: 准备config-bundle.json
```json
{
  "sourceCLI": "claude",
  "targetCLIs": ["qwen", "codebuddy", "claude"],
  "generatedAt": "2025-01-25T12:00:00.000Z",
  "platform": "win32",
  "summary": {
    "totalItems": 1
  },
  "configs": {
    "claude": {
      "agents": {
        "items": []
      },
      "skills": {
        "items": [
          {
            "path": "skills/ant/skill.md",
            "content": "<实际的SKILL.md内容>"
          }
        ]
      },
      "markdown": {
        "exists": false
      }
    }
  }
}
```

**任务1.4**: 创建deployment-manifest.json
```json
{
  "version": "1.0.0-test",
  "generatedAt": "2025-01-25T12:00:00.000Z",
  "deployments": []
}
```

---

### 阶段2: 执行部署

**任务2.1**: 运行ConfigDeployer
```javascript
const ConfigDeployer = require('./src/core/config/ConfigDeployer');

const deployer = new ConfigDeployer({
  packageDir: './config/bundle/test-ant-deployment',
  verbose: true,
  dryRun: false
});

await deployer.run();
```

**任务2.2**: 验证文件部署
```bash
# 检查qwen
ls -la ~/.qwen/skills/ant/

# 检查codebuddy
ls -la ~/.codebuddy/skills/ant/

# 检查.md文档注册
grep -A 3 "<name>ant</name>" qwen.md
grep -A 3 "<name>ant</name>" codebuddy.md
```

---

### 阶段3: 真实场景验证

**任务3.1**: 测试qwen能否使用ant技能
```bash
# 运行qwen并请求使用ant技能
qwen "请使用ant技能帮我分析这个网络"

# 验证要点:
# 1. qwen是否识别ant技能
# 2. 是否正确执行技能功能
# 3. 输出是否合理
```

**任务3.2**: 测试codebuddy能否使用ant技能
```bash
# 运行codebuddy并请求使用ant技能
codebuddy "使用ant技能分析这些actor关系"

# 验证要点:
# 1. codebuddy是否识别ant技能
# 2. 是否正确执行
# 3. 输出质量
```

**任务3.3**: 验证claude能否识别（自身已有）
```bash
# claude应该已经能使用ant技能
claude "使用ant技能"

# 这是基准测试，确认ant技能本身工作正常
```

---

### 阶段4: 清理

**任务4.1**: 清理部署的文件
```bash
# 删除skills文件
rm -rf ~/.qwen/skills/ant/
rm -rf ~/.codebuddy/skills/ant/

# 从.md文档注销
# (使用ConfigDeployer的unregisterSkillsFromCLIDoc方法)
```

**任务4.2**: 删除测试配置包
```bash
rm -rf config/bundle/test-ant-deployment/
```

---

## 成功标准

### 必须满足
- ✅ 文件成功部署到目标CLI目录
- ✅ .md文档成功注册（qwen, codebuddy）
- ✅ CLI实际运行并识别技能
- ✅ 技能执行产生合理输出

### 期望满足
- ✅ 至少2/3的CLI能成功使用技能
- ✅ 清理后无残留文件
- ✅ 整个流程可重复

---

## 测试脚本实现

创建自动化测试脚本: `real-scenario-test.js`

```javascript
/**
 * 真实场景测试
 * 测试ConfigDeployer的完整工作流程
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const ConfigDeployer = require('./src/core/config/ConfigDeployer');

class RealScenarioTest {
  constructor() {
    this.testResults = {
      deployment: null,
      verification: {},
      activation: {},
      cleanup: {}
    };
  }

  async run() {
    console.log('🧪 真实场景测试开始\n');

    try {
      // 阶段1: 准备
      await this.prepareTestBundle();

      // 阶段2: 部署
      await this.deploySkills();

      // 阶段3: 验证文件
      await this.verifyFiles();

      // 阶段4: 测试激活
      await this.testActivation();

      // 阶段5: 清理
      await this.cleanup();

      // 打印结果
      this.printResults();

    } catch (error) {
      console.error('\n❌ 测试失败:', error);
      await this.cleanup();
      throw error;
    }
  }

  async prepareTestBundle() {
    console.log('阶段1: 准备测试包...');
    // TODO: 实现准备逻辑
  }

  async deploySkills() {
    console.log('\n阶段2: 部署技能...');
    // TODO: 实现部署逻辑
  }

  async verifyFiles() {
    console.log('\n阶段3: 验证文件...');
    // TODO: 实现验证逻辑
  }

  async testActivation() {
    console.log('\n阶段4: 测试激活...');
    // TODO: 实现激活测试逻辑
  }

  async cleanup() {
    console.log('\n阶段5: 清理...');
    // TODO: 实现清理逻辑
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('测试结果');
    console.log('='.repeat(60));
    // TODO: 打印结果
  }
}

// 运行测试
const test = new RealScenarioTest();
test.run().catch(error => {
  console.error(error);
  process.exit(1);
});
```

---

## 预期问题与应对

### 问题1: CLI响应慢
**应对**: 增加超时时间到60秒

### 问题2: .md文档格式冲突
**应对**: 备份原始.md文档，测试后恢复

### 问题3: 技能路径不匹配
**应对**: 记录原始技能结构，按需调整路径

### 问题4: 清理不完整
**应对**: 详细记录所有修改点，确保完全清理

---

## 时间估算

- 阶段1 (准备): 10分钟
- 阶段2 (部署): 5分钟
- 阶段3 (验证): 5分钟
- 阶段4 (激活测试): 15分钟
- 阶段5 (清理): 5分钟

**总计**: ~40分钟

---

## 后续行动

根据测试结果：
- **成功**: 记录最佳实践，编写用户文档
- **部分成功**: 分析失败原因，调整机制
- **失败**: 重新审视整个部署方案

---

**创建日期**: 2025-01-25
**状态**: 计划中
**优先级**: 高
