# 电商 AI 实训平台 - Skills 使用场景与 CLI 关系说明

**版本**: v1.0  
**创建日期**: 2026-03-30  
**状态**: 已验证可用

---

## 一、Skills 与 CLI 的关系

### 1.1 架构关系图

```
┌─────────────────────────────────────────────────────────────────┐
│  学员 (学生/教师)                                                │
│  自然语言："帮我上架这件商品" / "我要做实训"                     │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  AI CLI (qwen/opencode/kilocode/codebuddy)                      │
│  - LLM 理解用户意图                                             │
│  - 匹配 Skill                                                   │
│  - 提取参数                                                     │
└───────────────────┬─────────────────────────────────────────────┘
                    │ 调用
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Stigmergy Skills                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 传统 Skills (18 个)                                       │   │
│  │  - 直接调用 CLI 命令                                      │   │
│  │  - 例如：stigmergy eb-edu medusa product create         │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 能力培养型 Skills (2 个)                                  │   │
│  │  - 先引导思考（不调用 CLI）                               │   │
│  │  - 学生决策后，调用 CLI 执行                              │   │
│  │  - 例如：product-listing-training                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└───────────────────┬─────────────────────────────────────────────┘
                    │ 执行
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  stigmergy eb-edu CLI (平台后台命令)                            │
│  - medusa product create                                       │
│  - medusa order create                                         │
│  - class create                                                │
│  - project create                                              │
│  - ...                                                         │
└───────────────────┬─────────────────────────────────────────────┘
                    │ 调用 API
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  medusa-backend API (后端服务)                                  │
│  - POST /api/v1/products                                       │
│  - POST /api/v1/orders                                         │
│  - POST /api/v1/classes                                        │
│  - ...                                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 关键说明

| 组件 | 职责 | 是否必须 |
|------|------|---------|
| **AI CLI** | LLM 理解、参数提取 | 可选（可直接调用 Skill） |
| **Skills** | 封装 CLI 命令、引导交互 | ✅ 核心 |
| **stigmergy eb-edu CLI** | 封装 API 调用 | ✅ 核心 |
| **medusa-backend API** | 业务逻辑、数据存储 | ✅ 必须运行 |

---

## 二、使用场景详解

### 场景 1: 传统 Skills - 快速操作

**学员需求**: "帮我上架一件商品"

**流程**:
```
学员 → AI CLI → Skill → CLI → API → 完成

1. 学员："帮我上架这件商品"
2. AI CLI (qwen): 匹配 Skill → eb-edu-medusa-create-product
3. AI CLI: 提取参数 → title="夏季连衣裙", price=199
4. Skill 执行：调用 stigmergy eb-edu medusa product create
5. CLI 调用 API: POST /api/v1/products
6. API 返回：商品创建成功
7. AI CLI 输出：✅ 商品已上架
```

**命令**:
```bash
# 方式 1: 通过 AI CLI（自然语言）
qwen "帮我上架一件夏季连衣裙，价格 199 元"

# 方式 2: 直接调用 Skill
stigmergy skill call eb-edu-medusa-create-product \
    --title "夏季连衣裙" \
    --price 199

# 方式 3: 直接调用 CLI
stigmergy eb-edu medusa product create \
    --title "夏季连衣裙" \
    --price 199
```

**前提条件**:
- ✅ medusa-backend API 正在运行
- ✅ stigmergy eb-edu CLI 已配置
- ✅ 学员已认证（token 有效）

---

### 场景 2: 能力培养型 Skills - 实训教学

**学员需求**: "我要学习商品上架"

**流程**:
```
学员 → AI CLI → Skill → 引导思考 → 学员决策 → 调用 CLI → API → 完成

1. 学员："我要做商品上架实训"
2. AI CLI: 匹配 Skill → eb-edu-product-listing-training
3. Skill 启动实训:
   - 阶段 1: 情境导入（你是运营专员）
   - 阶段 2: 市场分析（查看竞品数据）
   - 阶段 3: 定价决策（学生制定价格，说明理由）
   - 阶段 4: 卖点提炼（学生提炼 3 个卖点）
   - 阶段 5: **调用 CLI 执行上架** ← 关键！
   - 阶段 6: 复盘总结（评估决策过程）
4. Skill 调用 CLI: stigmergy eb-edu medusa product create
5. CLI 调用 API: POST /api/v1/products
6. API 返回：商品创建成功
7. Skill 输出：✅ 实训完成 + 评分
```

**命令**:
```bash
# 方式 1: 通过 AI CLI
qwen "我要做商品上架实训"

# 方式 2: 直接调用 Skill
stigmergy skill call eb-edu-product-listing-training

# 方式 3: 选择场景
stigmergy skill call eb-edu-product-listing-training \
    --scenario dress  # dress, headphones, juicer
```

**前提条件**:
- ✅ medusa-backend API 正在运行（阶段 5 需要）
- ✅ stigmergy eb-edu CLI 已配置
- ✅ 学员已认证

**交互示例**:
```
$ stigmergy skill call eb-edu-product-listing-training

╔══════════════════════════════════════════════════════════╗
║               电商 AI 实训平台 - 商品上架实训               ║
╚══════════════════════════════════════════════════════════╝

📋 阶段 1: 情境导入
你是运营专员，要上架夏季连衣裙（成本 80 元）

📋 阶段 2: 市场分析
竞品 1: 《夏季新款连衣裙女》- 159 元 - 月销 3000+
竞品 2: 《法式复古连衣裙》- 259 元 - 月销 1000+
竞品 3: 《简约气质连衣裙》- 189 元 - 月销 2000+

❓ 问题 1: 竞品的主要价格带是什么？
> 159-259 元

❓ 问题 2: 你发现什么市场机会？
> 法式风格有市场，但价格偏高

📋 阶段 3: 定价决策
你的定价是多少？说明理由
> 219 元，比竞品 2 低，有价格优势

📊 定价评估：85/100 - 合理

📋 阶段 4: 卖点提炼
你的 3 个核心卖点？
> 法式复古，收腰显瘦，透气面料

📊 卖点评估：90/100 - 差异化明显

📋 阶段 5: 执行上架
🔧 执行命令：stigmergy eb-edu medusa product create
✅ 商品创建成功！
   商品 ID: prod_abc123
   标题：法式复古连衣裙
   价格：219 元

📋 阶段 6: 复盘总结
综合评分：87/100 - 优秀！
```

---

### 场景 3: 无后台 API 时 - 纯模拟实训

**前提**: medusa-backend API **未运行**

**流程**:
```
学员 → Skill → 引导思考 → 学员决策 → CLI 调用失败 → 模拟成功 → 复盘

阶段 5 执行上架时:
- CLI 调用 API 失败（API 未运行）
- Skill 捕获异常，显示"模拟上架完成"
- 继续阶段 6: 复盘总结
```

**输出**:
```
📋 阶段 5: 执行上架
⏳ 正在创建商品...
🔧 执行命令：stigmergy eb-edu medusa product create
⚠️ CLI 执行异常：[Errno 111] Connection refused
模拟上架完成（后台服务可能未启动）

📋 阶段 6: 复盘总结
综合评分：87/100 - 优秀！
```

**教学价值**:
- ✅ 学生仍然完成了**思考过程**
- ✅ 学会了市场分析方法
- ✅ 练习了定价策略
- ⚠️ 但没有真正上架商品

---

## 三、Skills 分类与使用

### 3.1 Skills 分类

| 类别 | Skills 数量 | 是否调用 CLI | 是否需要 API |
|------|-----------|------------|------------|
| **传统 Skills** | 18 个 | ✅ 总是调用 | ✅ 必须 |
| **能力培养型 Skills** | 2 个 | ✅ 阶段 5 调用 | ⚠️ 最好有（无则模拟） |

### 3.2 使用建议

| 场景 | 推荐 Skill 类型 | 是否需要 API |
|------|--------------|------------|
| **真实业务操作** | 传统 Skills | ✅ 必须 |
| **教学实训** | 能力培养型 | ⚠️ 最好有 |
| **离线学习** | 能力培养型 | ❌ 不需要 |
| **技能考核** | 能力培养型 | ⚠️ 最好有 |

---

## 四、部署与验证

### 4.1 部署步骤

```bash
# 1. 部署 medusa-backend API
cd medusa-backend
npm install
npm run dev  # 启动 API 服务

# 2. 配置 stigmergy eb-edu CLI
stigmergy config set eb-edu.api_url http://localhost:9000
stigmergy auth login --username admin --password admin

# 3. 安装 Skills
cp -r skills/eb-edu C:\Users\Zhang/.stigmergy/skills/
pip install -r C:\Users\Zhang/.stigmergy/skills/eb-edu/requirements.txt

# 4. 验证 Skills
stigmergy skill list | grep eb-edu

# 5. 测试传统 Skill
stigmergy skill call eb-edu-medusa-create-product \
    --title "测试商品" --price 99

# 6. 测试能力培养型 Skill
stigmergy skill call eb-edu-product-listing-training
```

### 4.2 验证清单

| 验证项 | 命令 | 预期结果 |
|--------|------|---------|
| API 运行 | `curl http://localhost:9000/health` | `{"status":"ok"}` |
| CLI 配置 | `stigmergy eb-edu --help` | 显示帮助 |
| 传统 Skill | `stigmergy skill call eb-edu-medusa-create-product` | ✅ 商品创建成功 |
| 能力培养型 Skill | `stigmergy skill call eb-edu-product-listing-training` | ✅ 实训流程完整 |

---

## 五、常见问题

### Q1: 学员决策后真的能执行上架吗？

**A**: ✅ **能**！

能力培养型 Skills 在阶段 5 会**真正调用 CLI**执行上架：
```python
# skill.py 第 268 行
cli_cmd = f'stigmergy eb-edu medusa product create --title "{title}" --price {pricing_answer}'
result = subprocess.run(cli_cmd, shell=True, capture_output=True, text=True, timeout=30)
```

**前提**:
- ✅ medusa-backend API 正在运行
- ✅ CLI 已正确配置
- ✅ 学员有权限

### Q2: 如果 API 未运行，实训还能用吗？

**A**: ⚠️ **可以用，但只能模拟**

能力培养型 Skills 有异常处理：
```python
except Exception as e:
    print(f"⚠️ CLI 执行异常：{e}")
    print("模拟上架完成（后台服务可能未启动）")
```

学生仍然能：
- ✅ 学习市场分析方法
- ✅ 练习定价策略
- ✅ 学习卖点提炼
- ⚠️ 但不能真正上架商品

### Q3: AI CLI（qwen/opencode）必须吗？

**A**: ❌ **不是必须**

可以直接调用 Skill：
```bash
# 不需要 AI CLI
stigmergy skill call eb-edu-product-listing-training
```

但有了 AI CLI，体验更好：
```bash
# 自然语言调用
qwen "我要做商品上架实训"
```

---

## 六、总结

### 6.1 核心要点

1. **Skills 与 CLI 的关系**:
   - Skills **封装**CLI 命令
   - 能力培养型 Skills 在**阶段 5**调用 CLI
   - 传统 Skills **总是**调用 CLI

2. **学员决策后可以执行吗**:
   - ✅ **可以**！阶段 5 真正调用 CLI 执行
   - 前提是 API 正在运行

3. **使用场景**:
   - 真实业务操作 → 传统 Skills
   - 教学实训 → 能力培养型 Skills
   - 离线学习 → 能力培养型 Skills（模拟模式）

### 6.2 部署检查清单

- [ ] medusa-backend API 正在运行
- [ ] stigmergy eb-edu CLI 已配置
- [ ] Skills 已安装
- [ ] 学员已认证
- [ ] 测试传统 Skill
- [ ] 测试能力培养型 Skill

---

**文档版本**: v1.0  
**创建日期**: 2026-03-30  
**维护者**: 电商 AI 实训平台技术团队
