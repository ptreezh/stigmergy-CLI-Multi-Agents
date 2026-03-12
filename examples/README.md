# Stigmergy 示例项目库

本目录包含多个示例项目，展示 Stigmergy 的各种使用场景和最佳实践。

---

## 📁 示例项目列表

### 1. REST API 完整开发
**路径**: `examples/rest-api-demo/`  
**难度**: ⭐⭐ 中级  
**时间**: 15 分钟

展示如何使用 Stigmergy 协调多个 AI 完成完整的 REST API 开发：
- 架构设计（Claude）
- 代码实现（Qwen）
- API 文档（Gemini）
- 单元测试（Claude）
- 性能优化建议（Gemini）

```bash
cd examples/rest-api-demo/
stigmergy call "complete project setup"
```

---

### 2. 数据分析管道
**路径**: `examples/data-pipeline/`  
**难度**: ⭐⭐⭐ 高级  
**时间**: 30 分钟

构建完整的数据分析管道：
- 数据清洗（Python + Pandas）
- 探索性数据分析（EDA）
- 可视化图表生成
- 统计检验
- 报告自动生成

```bash
cd examples/data-pipeline/
stigmergy call "analyze this dataset and generate report"
```

---

### 3. 多语言文档系统
**路径**: `examples/multilingual-docs/`  
**难度**: ⭐ 初级  
**时间**: 10 分钟

展示 12 语言支持：
- 自动生成多语言 README
- 跨语言 API 文档
- 本地化最佳实践

```bash
cd examples/multilingual-docs/
stigmergy call "generate documentation in Chinese, Japanese, and Spanish"
```

---

### 4. 远程协作演示
**路径**: `examples/remote-collaboration/`  
**难度**: ⭐⭐ 中级  
**时间**: 20 分钟

展示 Stigmergy Gateway 远程编排：
- Feishu/Telegram 集成
- 团队共享 AI 能力
- 异步协作流程

```bash
# 启动网关
stigmergy gateway --telegram --port 3000

# 然后从 Telegram 发送命令
```

---

### 5. 技能开发教程
**路径**: `examples/custom-skill/`  
**难度**: ⭐⭐ 中级  
**时间**: 25 分钟

学习如何创建和分享自定义技能：
- 技能结构设计
- SKILL.md 编写规范
- 发布到 GitHub
- 跨 CLI 共享

```bash
cd examples/custom-skill/
stigmergy skill validate ./my-skill/
```

---

### 6. 微服务项目
**路径**: `examples/microservices/`  
**难度**: ⭐⭐⭐⭐ 高级  
**时间**: 60 分钟

多状态板协作模式：
- 每个微服务独立状态板
- 服务间协调
- 统一监控仪表板

```bash
cd examples/microservices/
stigmergy interactive
> board init multi
> board create api-gateway ./gateway
> board create user-service ./users
> board create order-service ./orders
```

---

### 7. 自动化测试套件
**路径**: `examples/test-automation/`  
**难度**: ⭐⭐ 中级  
**时间**: 20 分钟

展示 AI 辅助测试：
- 单元测试生成
- 集成测试设计
- E2E 测试脚本
- 测试覆盖率分析

```bash
cd examples/test-automation/
stigmergy call "generate comprehensive test suite"
```

---

### 8. 机器学习项目
**路径**: `examples/ml-project/`  
**难度**: ⭐⭐⭐ 高级  
**时间**: 45 分钟

端到端机器学习工作流：
- 问题定义和数据探索
- 特征工程
- 模型选择和训练
- 评估和优化
- 部署建议

```bash
cd examples/ml-project/
stigmergy call "build a classification model for this dataset"
```

---

## 🚀 快速开始

### 前提条件
```bash
# 安装 Stigmergy
npm install -g stigmergy@beta

# 完成设置
stigmergy setup

# 验证安装
stigmergy status
```

### 运行示例
```bash
# 克隆仓库
git clone https://github.com/ptreezh/stigmergy-CLI-Multi-Agents.git
cd stigmergy-CLI-Multi-Agents/examples

# 选择示例
cd rest-api-demo

# 运行演示
stigmergy call "complete project setup"
```

---

## 📚 学习路径

### 初学者路径
1. ✅ `multilingual-docs/` - 了解基本命令
2. ✅ `custom-skill/` - 学习技能系统
3. ✅ `rest-api-demo/` - 体验多 AI 协作

### 中级路径
1. ✅ `data-pipeline/` - 复杂工作流
2. ✅ `test-automation/` - 测试最佳实践
3. ✅ `remote-collaboration/` - 远程编排

### 高级路径
1. ✅ `ml-project/` - 端到端 ML
2. ✅ `microservices/` - 多状态板架构
3. 🔜 创建你自己的示例项目！

---

## 🤝 贡献示例

欢迎提交你的示例项目！

### 提交指南
1. Fork 仓库
2. 在 `examples/` 下创建新目录
3. 添加 `README.md` 说明
4. 包含所有必需文件
5. 创建 Pull Request

### 示例模板
```
examples/your-example/
├── README.md          # 项目说明
├── setup.sh          # 设置脚本
├── run.sh            # 运行命令
├── .stigmergy/       # Stigmergy 配置
└── src/              # 源代码
```

---

## 📊 示例统计

| 示例 | 难度 | 时间 | AI 工具 | 核心功能 |
|------|------|------|--------|----------|
| REST API | ⭐⭐ | 15min | Claude, Qwen, Gemini | 智能路由 |
| Data Pipeline | ⭐⭐⭐ | 30min | Claude, Gemini | 数据分析 |
| Multilingual | ⭐ | 10min | All | 12 语言支持 |
| Remote Collab | ⭐⭐ | 20min | Gateway | 远程编排 |
| Custom Skill | ⭐⭐ | 25min | All | 技能系统 |
| Microservices | ⭐⭐⭐⭐ | 60min | All | 多状态板 |
| Test Automation | ⭐⭐ | 20min | Claude, Qwen | 测试生成 |
| ML Project | ⭐⭐⭐ | 45min | Claude, Gemini | ML 工作流 |

---

## 🎓 教学资源

### 视频系列
- [ ] 示例 1: 5 分钟创建 REST API
- [ ] 示例 2: 数据分析实战
- [ ] 示例 3: 多语言文档生成
- [ ] 示例 4: 远程控制演示

### 互动教程
- [ ] Stigmergy 入门挑战
- [ ] 技能开发工作坊
- [ ] 高级编排模式

---

## ❓ 常见问题

### Q: 运行示例需要付费的 AI 订阅吗？
**A**: 部分 AI CLI 需要订阅（如 Claude Pro），但也有免费选项（如 Qwen）。每个示例都标注了推荐的 AI 工具。

### Q: 示例代码可以商用吗？
**A**: 可以！所有示例都是 MIT 许可，可自由使用。

### Q: 如何修改示例适应我的项目？
**A**: 每个示例的 README 都有"扩展思路"部分，提供定制化建议。

### Q: 示例运行失败怎么办？
**A**: 
1. 检查 `stigmergy status` 确认 AI CLI 已安装
2. 查看示例的 `prerequisites.md`
3. 在 GitHub Issues 报告问题

---

## 🔗 相关资源

- [主文档](../README.md)
- [API 参考](../docs/API_REFERENCE.md)
- [技能开发指南](../docs/SKILL_DEVELOPMENT.md)
- [社区论坛](https://github.com/ptreezh/stigmergy-CLI-Multi-Agents/discussions)

---

*最后更新：2026 年 3 月 9 日*
