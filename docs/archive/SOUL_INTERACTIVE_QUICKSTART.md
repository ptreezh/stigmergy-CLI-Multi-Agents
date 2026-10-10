# 🚀 Soul交互式创建 - 快速开始

## ✅ 现在可以直接对话创建了！

### **最简单的方式（推荐）**

```bash
# 在你的项目目录中
cd my-project

# 运行交互式创建命令
stigmergy soul create --interactive

# 或者使用别名
stigmergy soul interactive
```

### **对话式创建过程**

```bash
$ stigmergy soul create --interactive

🤖 让我们通过对话来创建您的项目Soul...

? 请简单描述您的项目主要做什么？
> 这是一个帮助开发者管理代码片段的工具，支持多种编程语言

? 项目类型是什么？
  > 💻 技术开发型 - 专注于代码质量、架构设计、性能优化

? Soul名称（可选，直接回车自动生成）
> (CodeSnippetManager)

? 启用哪些功能？ (按空格选择，回车确认)
  > ◯ 🚀 自动进化
  > ◯ 📊 知识库管理
  > ◯ 🎯 对齐检查
  > ◯ 💾 记忆管理

? 确认创建？ (Y/n)
> Y

✅ Soul创建成功！

📁 位置: /home/user/my-project/.stigmergy/skills/soul.md
🎯 类型: 技术开发型
🤖 名称: CodeSnippetManager
⚙️  功能: autoEvolve, knowledgeBase, alignmentCheck, memoryManagement

💡 提示:
   - Soul将在下次启动CLI时自动激活
   - 您可以随时编辑 .stigmergy/skills/soul.md 来调整配置
   - 使用 'stigmergy soul status' 查看状态
   - 使用 'stigmergy soul evolve' 手动触发进化
```

---

## 📝 创建对比

### **❌ 旧方式（手工）**

```bash
# 1. 手工创建目录
mkdir -p .stigmergy/skills

# 2. 手工创建文件
cat > .stigmergy/skills/soul.md <<EOF
# Soul.md
## 身份
- **名称**: MyProject
...

# 3. 需要记住文件格式和字段
# ❌ 容易出错，不够友好
```

### **✅ 新方式（交互式）**

```bash
# 一个命令完成！
stigmergy soul create --interactive

# ✅ 友好的对话引导
# ✅ 自动生成配置
# ✅ 智能建议
# ✅ 无需记忆格式
```

---

## 🎯 项目类型说明

| 类型 | 图标 | 适用场景 | 示例 |
|------|------|----------|------|
| **技术开发型** | 💻 | 编程项目、Web应用、API | React应用、Node.js服务 |
| **学术研究型** | 🎓 | 论文、研究项目、实验 | 数据分析、理论研究 |
| **数据分析型** | 📊 | 机器学习、数据科学 | ML模型、数据处理 |
| **创意设计型** | 🎨 | UI/UX、视觉设计 | 网站设计、品牌设计 |
| **通用型** | 📝 | 其他项目 | 综合性项目 |

---

## 🚀 使用流程

### **第1步：创建Soul**
```bash
cd your-project
stigmergy soul create --interactive
# [完成对话...]
✅ Soul创建成功！
```

### **第2步：自动激活**
```bash
# 下次启动任何CLI工具时
claude
# 或
gemini
# 或
qwen

# 输出:
🧠 Soul detected: .stigmergy/skills/soul.md
🦸 Superpowers context injected | 🧠 Soul auto-initialized
```

### **第3步：开始使用**
```bash
# 现在CLI会根据你的Soul配置工作
# - 理解项目上下文
# - 遵循编码风格
# - 提供相关建议

# 自动进化也在后台运行
# - 夜间: 每30分钟学习一次
# - 白天: 每4小时学习一次
```

---

## 💡 高级用法

### **覆盖已有Soul**
```bash
stigmergy soul create --interactive --force

# 会提示是否覆盖
? 检测到已存在的Soul: .stigmergy/skills/soul.md
  是否覆盖？ (Y/n)
```

### **编辑已有Soul**
```bash
# 直接编辑配置文件
vim .stigmergy/skills/soul.md

# 下次启动CLI时自动加载新配置
```

### **查看Soul状态**
```bash
stigmergy soul status

# 输出:
📊 Soul System Status
📚 Registered Souls:
   ✅ CodeSnippetManager (项目本地)
```

---

## 🎉 总结

### **完全无需手工操作！**

```bash
# 就这么简单
cd my-project
stigmergy soul create --interactive
# [回答几个问题]
# ✅ 完成！

# Soul自动工作，智能进化
```

### **关键优势**

1. ✅ **零手工** - 对话式创建，无需编辑文件
2. ✅ **智能建议** - 自动生成合适的配置
3. ✅ **即时生效** - 创建后立即可以使用
4. ✅ **易于调整** - 可以随时编辑或重新创建
5. ✅ **项目本地** - 优先使用项目目录，无权限问题

---

**开始使用**：
```bash
stigmergy soul create --interactive
```

**就这么简单！** 🎉
