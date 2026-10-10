# Stigmergy CLI 改进计划

**生成时间**: 2026-03-26
**基于分析**: 成功模式深度分析 + 失败模式深度分析
**目标**: 将失败模式转化为成功模式,建立系统性改进机制

---

## 改进计划总览

### 核心策略

**1. 立即纠正** - 修复当前最严重的问题(今天必须完成)
**2. 短期改进** - 建立基础流程和工具(1-2周)
**3. 中期目标** - 系统化和自动化(1个月)
**4. 长期发展** - 文化建设和生态发展(3个月)

### 优先级矩阵

| 改进项 | 紧急程度 | 重要程度 | 实施难度 | ROI |
|--------|---------|---------|---------|-----|
| 门禁钩子系统 | 🔴 紧急 | 🔴 关键 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| 测试覆盖率提升 | 🔴 紧急 | 🔴 关键 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| 依赖升级流程 | 🔴 紧急 | 🟡 重要 | ⭐⭐ | ⭐⭐⭐⭐ |
| Level 3压力测试 | 🟡 重要 | 🔴 关键 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 用户文档完善 | 🟢 一般 | 🟡 重要 | ⭐⭐ | ⭐⭐⭐ |
| 技能生态建设 | 🟢 一般 | 🟡 重要 | ⭐⭐⭐⭐ | ⭐⭐⭐ |

---

## 立即纠正(今天必须完成)

### 🔴 纠正1: 实施门禁钩子系统

**背景**: SOUL.md已定义门禁检查清单,但缺少强制执行机制

**具体行动**:

- [ ] **行动1.1**: 创建 `.gates` 目录和门禁文件
  - 验证方法: 检查目录和文件是否存在
  - 完成标准: `.gates/GATEKEEPER.md` 和 `.gates/gatekeeper.js` 已创建

- [ ] **行动1.2**: 实现自动门禁检查脚本
  ```javascript
  // .gates/gatekeeper.js 核心功能
  - 检查测试真实性(是否使用模拟)
  - 检查验证等级(是否准确标注)
  - 检查局限性说明(是否明确列出)
  - 检查证据完整性(是否有可验证数据)
  - 检查标题准确性(是否误导)
  ```
  - 验证方法: 运行 `node .gates/gatekeeper.js --test` 验证功能
  - 完成标准: 所有5个检查点都能正确检测

- [ ] **行动1.3**: 集成到pre-commit hook
  ```bash
  # .git/hooks/pre-commit
  node .gates/gatekeeper.js || exit 1
  ```
  - 验证方法: 尝试提交不符合门禁的文档
  - 完成标准: 不符合门禁的提交被自动拦截

- [ ] **行动1.4**: 修复2026-03-22错误案例标注
  - 验证方法: 检查SOUL.md中案例标注是否完整
  - 完成标准: 所有错误报告都标注了正确的验证等级

**预期成果**: 所有未来的报告都必须通过门禁检查,杜绝"模拟冒充真实"的错误

---

### 🔴 纠正2: 提升核心功能测试覆盖率

**背景**: 当前测试覆盖率仅1.48%,核心功能无测试保障

**具体行动**:

- [ ] **行动2.1**: 为CLI路径检测编写测试
  ```javascript
  // tests/unit/cli_path_detector.test.js
  describe('CLI Path Detector', () => {
    it('should detect Claude CLI path on Windows', () => {
      // 测试Windows路径检测
    });
    it('should fallback to alternative paths', () => {
      // 测试降级路径
    });
    it('should handle permission errors gracefully', () => {
      // 测试权限错误处理
    });
  });
  ```
  - 验证方法: 运行 `npm test -- tests/unit/cli_path_detector.test.js`
  - 完成标准: 测试覆盖率≥80%,所有测试通过

- [ ] **行动2.2**: 为CLI适配器编写测试
  ```javascript
  // tests/unit/cli_adapters.test.js
  describe('CLI Adapters', () => {
    it('should generate correct args for Claude one-time mode', () => {
      const args = CLI_ADAPTERS.claude.oneTime('test');
      expect(args).toEqual(['-p', 'test']);
    });
    it('should handle all supported CLIs', () => {
      // 测试所有9个CLI工具
    });
  });
  ```
  - 验证方法: 运行测试并检查覆盖率
  - 完成标准: 覆盖率≥90%,所有CLI工具都有测试

- [ ] **行动2.3**: 为智能路由编写测试
  ```javascript
  // tests/unit/smart_router.test.js
  describe('Smart Router', () => {
    it('should route code tasks to Claude', () => {
      const cli = smartRouter.selectCLI('写一个React组件');
      expect(cli).toBe('claude');
    });
    it('should fallback when primary CLI unavailable', () => {
      // 测试降级逻辑
    });
  });
  ```
  - 验证方法: 运行测试并检查覆盖率
  - 完成标准: 覆盖率≥85%,主要路由规则都有测试

- [ ] **行动2.4**: 设置CI/CD自动化测试
  ```yaml
  # .github/workflows/test.yml
  name: Test
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - run: npm install
        - run: npm test -- --coverage
        - run: npm run test:unit
  ```
  - 验证方法: 提交代码触发GitHub Actions
  - 完成标准: CI自动运行并显示测试结果

**预期成果**: 核心功能测试覆盖率从1.48%提升到≥60%

---

### 🔴 纠正3: 建立依赖升级安全流程

**背景**: inquirer ESM兼容性问题暴露了依赖升级流程缺陷

**具体行动**:

- [ ] **行动3.1**: 创建依赖升级检查清单
  ```markdown
  # docs/DEPENDENCY_UPGRADE_CHECKLIST.md
  ## 升级前检查
  - [ ] 查看CHANGELOG,了解breaking changes
  - [ ] 检查新版本的模块系统(ESM vs CommonJS)
  - [ ] 检查依赖的依赖是否变化
  - [ ] 在package-lock.json中查看依赖树
  - [ ] 创建新分支进行升级
  ```
  - 验证方法: 检查文档是否存在且完整
  - 完成标准: 文档包含完整的检查清单和示例

- [ ] **行动3.2**: 锁定关键依赖版本
  ```json
  // package.json
  {
    "dependencies": {
      // 使用精确版本锁定关键依赖
      "inquirer": "8.2.6",
      "commander": "11.1.0",
      "chalk": "4.1.2"
    }
  }
  ```
  - 验证方法: 运行 `npm install` 验证无冲突
  - 完成标准: 关键依赖使用精确版本,无意外升级

- [ ] **行动3.3**: 创建依赖回滚脚本
  ```bash
  # scripts/rollback-dependency.sh
  PACKAGE=$1
  VERSION=$2
  echo "Rolling back $PACKAGE to $VERSION..."
  npm install "$PACKAGE@$VERSION"
  npm install --package-lock-only
  git commit -am "chore: rollback $PACKAGE to $VERSION"
  ```
  - 验证方法: 测试回滚脚本功能
  - 完成标准: 脚本能正确回滚依赖并提交

- [ ] **行动3.4**: 集成npm audit到CI
  ```yaml
  # .github/workflows/security.yml
  - name: Run npm audit
    run: npm audit --audit-level=moderate
  ```
  - 验证方法: 提交代码触发安全检查
  - 完成标准: CI自动检测依赖漏洞

**预期成果**: 建立安全的依赖升级流程,避免模块系统兼容性问题

---

## 短期改进(1-2周)

### 🟡 改进1: 实现Level 3压力测试

**背景**: 当前只有单元测试,缺少压力测试

**具体行动**:

- [ ] **行动1.1**: 并发CLI调用测试
  ```javascript
  // tests/stress/concurrent-cli.test.js
  describe('Stress Test: Concurrent CLI calls', () => {
    it('should handle 10 concurrent CLI calls', async () => {
      const clis = Array(10).fill('claude');
      const prompts = Array(10).fill('test prompt');

      const startTime = Date.now();
      const results = await Promise.all(
        clis.map((cli, i) => callCLI(cli, prompts[i]))
      );
      const duration = Date.now() - startTime;

      expect(results).toHaveLength(10);
      expect(duration).toBeLessThan(30000); // 30秒内完成
    });
  });
  ```
  - 验证方法: 运行压力测试
  - 完成标准: 10个并发CLI调用在30秒内完成

- [ ] **行动1.2**: 长时间运行稳定性测试
  ```javascript
  // tests/stress/long-running.test.js
  it('should run for 1 hour without memory leak', async () => {
    const initialMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < 3600; i++) {
      await callCLI('claude', 'test');
      await sleep(1000);

      // 每10分钟检查内存
      if (i % 600 === 0) {
        const currentMemory = process.memoryUsage().heapUsed;
        const growth = (currentMemory - initialMemory) / initialMemory;
        expect(growth).toBeLessThan(0.5); // 内存增长<50%
      }
    }
  });
  ```
  - 验证方法: 运行长时间测试
  - 完成标准: 1小时运行无内存泄漏

- [ ] **行动1.3**: 大量数据处理测试
  ```javascript
  // tests/stress/large-data.test.js
  it('should handle 1000 skills without performance degradation', async () => {
    const skills = generateMockSkills(1000);

    const startTime = Date.now();
    const result = await processSkills(skills);
    const duration = Date.now() - startTime;

    expect(result).toHaveLength(1000);
    expect(duration).toBeLessThan(5000); // 5秒内完成
  });
  ```
  - 验证方法: 运行大数据测试
  - 完成标准: 处理1000个技能<5秒

**预期成果**: 建立完整的压力测试套件,验证系统稳定性

---

### 🟡 改进2: 完善用户文档

**背景**: 缺少用户友好的文档,新用户上手困难

**具体行动**:

- [ ] **行动2.1**: 编写5分钟快速开始指南
  ```markdown
  # docs/QUICK_START.md
  ## 5分钟快速开始

  ### 步骤1: 安装(1分钟)
  npm install -g @stigmergy/cli

  ### 步骤2: 扫描CLI工具(1分钟)
  stigmergy scan

  ### 步骤3: 部署hooks(2分钟)
  stigmergy deploy

  ### 步骤4: 测试(1分钟)
  stigmergy call "hello world"
  ```
  - 验证方法: 新用户按照指南能在5分钟内完成
  - 完成标准: 包含完整的步骤和预期输出

- [ ] **行动2.2**: 创建常见问题FAQ
  ```markdown
  # docs/FAQ.md
  ## 常见问题

### Q: 如何切换默认CLI?
A: 使用环境变量 `STIGMERGY_DEFAULT_CLI=qwen`

### Q: 如何查看已安装的CLI?
A: 运行 `stigmergy scan`

### Q: 如何解决权限问题?
A: 使用 `stigmergy deploy --user-only`
  ```
  - 验证方法: 覆盖用户最常问的20个问题
  - 完成标准: 每个问题都有清晰的答案和示例

- [ ] **行动2.3**: 编写故障排除指南
  ```markdown
  # docs/TROUBLESHOOTING.md
  ## 常见问题及解决方案

### 问题1: CLI未找到
**症状**: `Error: CLI not found`
**原因**: CLI未安装或不在PATH中
**解决方案**:
1. 检查CLI是否安装: `claude --version`
2. 检查PATH: `echo $PATH`
3. 重新安装CLI
  ```
  - 验证方法: 覆盖10个最常见问题
  - 完成标准: 每个问题都有症状、原因、解决方案

**预期成果**: 新用户能够自助解决90%的常见问题

---

### 🟡 改进3: 启动技能生态建设

**背景**: 当前仅4个技能,与OpenClaw的13,729个技能差距巨大

**具体行动**:

- [ ] **行动3.1**: 集成Wechaty技能
  ```javascript
  // skills/wechaty-client.js
  class WechatySkill {
    async start() {
      const bot = new Wechaty();
      bot.on('scan', this.onScan);
      bot.on('login', this.onLogin);
      await bot.start();
    }
  }
  ```
  - 验证方法: 运行技能并测试微信登录
  - 完成标准: 能够扫码登录并接收消息

- [ ] **行动3.2**: 创建技能模板生成器
  ```bash
  # scripts/create-skill.sh
  $ stigmergy skill create my-skill

  ✅ Created: skills/my-skill/
  ✅ Created: skills/my-skill/SKILL.md
  ✅ Created: skills/my-skill/index.js
  ✅ Created: skills/my-skill/test.js
  ```
  - 验证方法: 生成一个新技能并测试
  - 完成标准: 生成的技能包含所有必需文件

- [ ] **行动3.3**: 编写技能贡献指南
  ```markdown
  # docs/SKILL_CONTRIBUTION.md
  ## 如何贡献技能

### 步骤1: 创建技能
使用 `stigmergy skill create` 生成模板

### 步骤2: 实现功能
在 `index.js` 中实现技能逻辑

### 步骤3: 编写测试
在 `test.js` 中编写测试用例

### 步骤4: 提交PR
Fork仓库,修改代码,提交PR
  ```
  - 验证方法: 按照指南创建一个新技能
  - 完成标准: 指南清晰易懂,新手可操作

**预期成果**: 技能数量从4个提升到20个

---

## 中期目标(1个月)

### 🟢 目标1: 建立社区反馈渠道

**具体行动**:

- [ ] **行动1.1**: 设置GitHub Issues模板
  ```yaml
  # .github/ISSUE_TEMPLATE/bug_report.md
  ## Bug报告
  - 描述问题
  - 复现步骤
  - 期望行为
  - 环境信息
  ```
  - 验证方法: 创建一个测试Issue
  - 完成标准: 模板覆盖Bug报告和功能请求

- [ ] **行动1.2**: 启动GitHub Discussions
  - 验证方法: 发布5个讨论话题
  - 完成标准: 有用户参与讨论

- [ ] **行动1.3**: 创建Discord/微信群
  - 验证方法: 群组建立并发布邀请链接
  - 完成标准: 至少50个成员加入

**预期成果**: 建立多渠道反馈机制,用户能够便捷地提供反馈

---

### 🟢 目标2: 实现自动化降级系统

**背景**: 三级优先级降级模式成功,需系统化

**具体行动**:

- [ ] **行动2.1**: 创建通用降级管理器
  ```javascript
  // src/core/degradation_manager.js
  class DegradationManager {
    constructor(options = []) {
      this.options = options; // [{name, check, fallback}]
      this.degradationPath = [];
    }

    async execute() {
      for (const option of this.options) {
        try {
          if (await option.check()) {
            this.degradationPath.push(option.name);
            return await option.fallback();
          }
        } catch (error) {
          console.warn(`[Degradation] ${option.name} failed`);
        }
      }
      throw new Error('All options exhausted');
    }
  }
  ```
  - 验证方法: 编写单元测试
  - 完成标准: 测试覆盖所有降级路径

- [ ] **行动2.2**: 集成到CLI调用流程
  ```javascript
  // 应用降级管理器
  const cliManager = new DegradationManager([
    { name: 'claude', check: () => isCLIHealthy('claude'), fallback: () => callCLI('claude') },
    { name: 'qwen', check: () => isCLIHealthy('qwen'), fallback: () => callCLI('qwen') },
    { name: 'gemini', check: () => isCLIHealthy('gemini'), fallback: () => callCLI('gemini') },
  ]);
  ```
  - 验证方法: 测试CLI故障自动切换
  - 完成标准: CLI故障时自动降级到备用CLI

**预期成果**: 所有外部依赖都有自动降级机制

---

### 🟢 目标3: 制作视频教程

**具体行动**:

- [ ] **行动3.1**: 录制安装教程(5分钟)
  - 验证方法: 视频发布到YouTube/B站
  - 完成标准: 新手能跟着视频完成安装

- [ ] **行动3.2**: 录制基础使用教程(10分钟)
  - 验证方法: 视频覆盖核心功能
  - 完成标准: 包含扫描、部署、调用等操作

- [ ] **行动3.3**: 录制进阶功能教程(15分钟)
  - 验证方法: 视频展示高级特性
  - 完成标准: 包含技能开发、配置定制等

**预期成果**: 发布3个视频教程,累计观看≥1000次

---

## 长期发展(3个月)

### 🔵 发展1: 形成失败案例库

**具体行动**:

- [ ] **行动1.1**: 创建失败案例文档结构
  ```markdown
  # docs/FAILURE_CASES/
  ├── api-integration-failures.md
  ├── dependency-upgrade-failures.md
  ├── deployment-failures.md
  └── testing-failures.md
  ```
  - 验证方法: 目录和文件已创建
  - 完成标准: 至少10个失败案例文档

- [ ] **行动1.2**: 编写失败模式分析模板
  ```markdown
  ## 失败案例: [标题]

  ### 失败描述
  - 时间
  - 问题
  - 影响

  ### 根本原因
  - 技术原因
  - 流程原因
  - 决策原因

  ### 预防措施
  - 早期信号
  - 止损机制
  - 恢复策略

  ### 可复用教训
  - 教训1
  - 教训2
  - 教训3
  ```
  - 验证方法: 使用模板编写一个案例
  - 完成标准: 模板完整且易于使用

- [ ] **行动1.3**: 建立失败案例回顾机制
  - 验证方法: 每周回顾一次失败案例
  - 完成标准: 形成定期回顾的习惯

**预期成果**: 建立30+失败案例库,避免重复错误

---

### 🔵 发展2: 建立多CLI降级策略

**具体行动**:

- [ ] **行动2.1**: 实现CLI健康监控
  ```javascript
  class CLIHealthMonitor {
    async checkHealth(cli) {
      const checks = {
        installed: await this.isInstalled(cli),
        correctVersion: await this.isCorrectVersion(cli),
        responsive: await this.isResponsive(cli),
        authenticated: await this.isAuthenticated(cli),
      };
      const score = Object.values(checks).filter(Boolean).length;
      return { healthy: score >= 3, checks, score };
    }
  }
  ```
  - 验证方法: 监控所有CLI的健康状态
  - 完成标准: 每60秒检查一次

- [ ] **行动2.2**: 实现自动恢复机制
  ```javascript
  class AutoRecovery {
    async onHealthChange(cli, wasHealthy, isHealthy) {
      if (!wasHealthy && isHealthy) {
        console.log(`✅ ${cli} recovered`);
      } else if (wasHealthy && !isHealthy) {
        console.warn(`⚠️ ${cli} failed, switching to backup`);
        await this.switchToBackup(cli);
      }
    }
  }
  ```
  - 验证方法: 测试CLI故障自动切换
  - 完成标准: 故障CLI自动切换到备用CLI

**预期成果**: 实现完全自动化的多CLI降级和恢复

---

### 🔵 发展3: 构建技能市场

**具体行动**:

- [ ] **行动3.1**: 设计技能市场架构
  ```markdown
  # 技能市场结构
  ├── 技能列表
  ├── 技能详情
  ├── 技能评分
  ├── 技能评论
  └── 技能安装
  ```
  - 验证方法: 完成架构设计文档
  - 完成标准: 架构清晰可实施

- [ ] **行动3.2**: 实现技能发布功能
  ```bash
  $ stigmergy skill publish my-skill

  ✅ Published: my-skill v1.0.0
  🔗 https://stigmergy.dev/skills/my-skill
  ```
  - 验证方法: 发布一个技能到市场
  - 完成标准: 技能可以被其他用户安装

- [ ] **行动3.3**: 建立技能排行榜
  ```markdown
  ## 最受欢迎技能
  1. wechaty-client (1.2k 安装)
  2. puppeteer-automation (890 安装)
  3. data-analysis-helper (654 安装)
  ```
  - 验证方法: 排行榜实时更新
  - 完成标准: 基于安装量排序

**预期成果**: 技能数量≥100,形成活跃的技能生态

---

## 实施保证机制

### 每日检查清单

```markdown
## 今日改进检查

- [ ] 是否通过门禁检查?
- [ ] 测试覆盖率是否提升?
- [ ] 是否有新的失败案例记录?
- [ ] 是否按计划完成改进任务?
```

### 每周回顾机制

```markdown
## 周回顾报告

### 本周完成
- 完成的改进项
- 克服的困难
- 取得的成果

### 遇到的问题
- 问题描述
- 解决方案
- 经验教训

### 下周计划
- 计划完成的改进项
- 预期成果
- 所需资源
```

### 月度评估标准

```markdown
## 月度评估

### 测试覆盖率
- 目标: 1.48% → 60%
- 实际: ___%

### 技能数量
- 目标: 4 → 20
- 实际: ___个

### 失败案例
- 目标: 记录10+案例
- 实际: ___个

### 社区活跃度
- 目标: 50+成员
- 实际: ___人
```

---

## 成功指标

### 量化指标

| 指标 | 当前 | 1个月目标 | 3个月目标 |
|------|------|----------|----------|
| 测试覆盖率 | 1.48% | 60% | 80% |
| 技能数量 | 4 | 20 | 100 |
| 失败案例记录 | 5 | 15 | 30 |
| 社区成员 | 0 | 50 | 200 |
| 文档完整度 | 30% | 70% | 90% |

### 质量指标

- **可靠性**: 系统无故障运行时间≥99%
- **响应性**: Issue响应时间<24小时
- **易用性**: 新用户5分钟内上手
- **安全性**: 0个已知严重漏洞

---

## 风险管理

### 潜在风险

1. **时间不足**
   - 缓解措施: 优先级排序,先做高ROI项目

2. **资源限制**
   - 缓解措施: 寻求社区帮助,分阶段实施

3. **技术障碍**
   - 缓解措施: 提前验证可行性,准备备选方案

### 应急预案

```markdown
## 应急预案

### 如果某项改进无法按时完成
1. 评估影响范围
2. 调整优先级
3. 寻求替代方案
4. 更新计划

### 如果出现新的严重问题
1. 立即记录到失败案例
2. 分析根本原因
3. 制定纠正措施
4. 更新改进计划
```

---

## 结语

这个改进计划不是一成不变的,而是一个**持续迭代**的文档。

**核心原则**:
1. **小步快跑**: 每天都有进步
2. **数据驱动**: 用指标衡量进展
3. **诚实面对**: 坦然记录失败
4. **持续优化**: 根据反馈调整

**最终目标**:
将失败模式转化为成功模式,建立**可复制、可自动化、可扩展**的工程实践体系。

**开始行动**: 今天就完成"立即纠正"部分的3个任务!

---

**文档版本**: v1.0
**创建日期**: 2026-03-26
**维护者**: Subagent (Soul Reflection)
**状态**: ✅ 已生成

---

*本文档基于成功模式深度分析和失败模式深度分析自动生成*
