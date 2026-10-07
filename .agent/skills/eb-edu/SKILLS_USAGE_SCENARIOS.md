# 电商 AI 实训平台 - Skills 应用场景区分

**版本**: v11.0 (全场景覆盖)  
**创建日期**: 2026-03-30  
**状态**: 所有 Skills 都有应用场景

---

## 一、Skills 分类与用途

### 1.1 引导型 Skills（学生实训用）

**用途**: 学生能力培养实训  
**特点**: LLM 智能引导，培养专业思维  
**使用者**: 学生

| Skill | 应用场景 | 状态 |
|-------|---------|------|
| `eb-edu-create-product-guided` | 商品上架实训 | ✅ 已实现 |
| `eb-edu-product-listing-ai-training` | 商品上架深度实训 | ✅ 已实现 |
| `eb-edu-create-order-guided` | 订单处理实训 | ✅ 已实现 |
| `eb-edu-batch-products-guided` | 批量上架实训 | ✅ 已实现 |
| `eb-edu-submit-project-guided` | 提交实训作业 | ✅ 已实现 |
| `eb-edu-analyze-grades-guided` | 成绩分析实训 | ✅ 已实现 |
| `eb-edu-competitor-analysis-training` | 竞品分析实训 | ✅ 已实现 |

---

### 1.2 基础型 Skills（被引导型调用）

**用途**: 真正执行操作  
**特点**: 快速执行，无引导  
**使用者**: 引导型 Skills 内部调用

| Skill | 功能 | 被谁调用 | 状态 |
|-------|------|---------|------|
| `eb-edu-medusa-create-product` | 创建商品 | `create-product-guided` | ✅ 已实现 |
| `eb-edu-medusa-create-order` | 创建订单 | `create-order-guided` | ✅ 已实现 |
| `eb-edu-medusa-batch-products` | 批量上架 | `batch-products-guided` | ✅ 已实现 |
| `eb-edu-submit-project` | 提交实训 | `submit-project-guided` | ✅ 已实现 |

---

### 1.3 教师 Skills（教学管理用）

**用途**: 教师日常教学管理  
**特点**: 快速操作，无需引导  
**使用者**: 教师

| Skill | 功能 | 应用场景 | 状态 |
|-------|------|---------|------|
| `eb-edu-create-project` | 创建实训 | 布置实训任务 | ✅ 已实现 |
| `eb-edu-grade-project` | 批改实训 | 批改学生作业 | ✅ 已实现 |
| `eb-edu-create-class` | 创建班级 | 新建教学班级 | ✅ 已实现 |
| `eb-edu-import-students` | 导入学生 | 批量导入学生 | ✅ 已实现 |
| `eb-edu-send-notification` | 发送通知 | 通知学生 | ✅ 已实现 |
| `eb-edu-create-exam` | 创建考试 | 安排考试 | ✅ 已实现 |
| `eb-edu-list-classes` | 查看班级 | 查看所教班级 | ✅ 已实现 |
| `eb-edu-view-stats` | 查看统计 | 查看学校统计 | ✅ 已实现 |
| `eb-edu-export-grades` | 导出成绩 | 导出成绩报表 | ✅ 已实现 |

---

### 1.4 学生查询 Skills（日常查询用）

**用途**: 学生日常查询操作  
**特点**: 快速查询，无需引导  
**使用者**: 学生

| Skill | 功能 | 应用场景 | 状态 |
|-------|------|---------|------|
| `eb-edu-login` | 登录 | 系统登录 | ✅ 已实现 |
| `eb-edu-join-class` | 加入班级 | 加入教学班级 | ✅ 已实现 |
| `eb-edu-view-projects` | 查看实训 | 查看我的实训 | ✅ 已实现 |
| `eb-edu-view-grades` | 查看成绩 | 查看我的成绩 | ✅ 已实现 |
| `eb-edu-view-notifications` | 查看通知 | 查看我的通知 | ✅ 已实现 |

---

## 二、完整应用场景流程

### 场景 1: 学期开始 - 教师准备

```
教师操作:
1. eb-edu-create-class → 创建班级
2. eb-edu-import-students → 批量导入学生
3. eb-edu-create-project → 创建实训任务
4. eb-edu-send-notification → 通知学生

┌─────────────────────────────────────────┐
│ 教师： "创建电商运营 2301 班"            │
│   ↓ eb-edu-create-class                 │
│   ✅ 班级创建成功                        │
│                                         │
│ 教师： "导入 50 名学生"                  │
│   ↓ eb-edu-import-students --file ...   │
│   ✅ 成功导入 50 名学生                   │
│                                         │
│ 教师： "创建商品上架实训"                │
│   ↓ eb-edu-create-project               │
│   ✅ 实训创建成功                        │
│                                         │
│ 教师： "通知学生查看实训"                │
│   ↓ eb-edu-send-notification            │
│   ✅ 通知已发送                          │
└─────────────────────────────────────────┘
```

---

### 场景 2: 学生实训 - 能力培养

```
学生操作:
1. eb-edu-login → 登录系统
2. eb-edu-join-class → 加入班级
3. eb-edu-view-projects → 查看实训任务
4. eb-edu-create-product-guided → 商品上架实训（LLM 引导）
5. eb-edu-submit-project-guided → 提交实训（LLM 引导）

┌─────────────────────────────────────────┐
│ 学生： "登录"                           │
│   ↓ eb-edu-login                        │
│   ✅ 登录成功                           │
│                                         │
│ 学生： "加入电商运营 2301 班"             │
│   ↓ eb-edu-join-class                   │
│   ✅ 加入成功                           │
│                                         │
│ 学生： "查看我的实训"                    │
│   ↓ eb-edu-view-projects                │
│   📋 商品上架实训（待完成）              │
│                                         │
│ 学生： "我要做商品上架实训"              │
│   ↓ eb-edu-create-product-guided        │
│   🤖 LLM 引导：标题优化 → 定价 → 卖点    │
│   ✅ 商品创建成功                        │
│                                         │
│ 学生： "提交实训"                        │
│   ↓ eb-edu-submit-project-guided        │
│   🤖 LLM 引导：成果整理 → 展示 → 反思   │
│   ✅ 提交成功                           │
└─────────────────────────────────────────┘
```

---

### 场景 3: 教师批改 - 教学反馈

```
教师操作:
1. eb-edu-view-projects → 查看学生实训
2. eb-edu-grade-project → 批改实训
3. eb-edu-export-grades → 导出成绩

┌─────────────────────────────────────────┐
│ 教师： "查看待批改实训"                  │
│   ↓ eb-edu-view-projects                │
│   📋 商品上架实训（15 人待批改）          │
│                                         │
│ 教师： "批改张三的作业"                  │
│   ↓ eb-edu-grade-project                │
│   ✅ 评分：95 分，评语：优秀！            │
│                                         │
│ 教师： "导出成绩报表"                    │
│   ↓ eb-edu-export-grades                │
│   ✅ 导出 grades.xlsx                    │
└─────────────────────────────────────────┘
```

---

### 场景 4: 学生查询 - 学习进度

```
学生操作:
1. eb-edu-view-grades → 查看成绩
2. eb-edu-view-notifications → 查看通知
3. eb-edu-analyze-grades-guided → 成绩分析实训

┌─────────────────────────────────────────┐
│ 学生： "查看我的成绩"                    │
│   ↓ eb-edu-view-grades                  │
│   📊 商品上架实训：95 分                 │
│                                         │
│ 学生： "查看我的通知"                    │
│   ↓ eb-edu-view-notifications           │
│   📬 新通知：下周考试安排                │
│                                         │
│ 学生： "分析我的成绩"                    │
│   ↓ eb-edu-analyze-grades-guided        │
│   🤖 LLM 引导：数据分析 → 诊断 → 改进   │
│   ✅ 分析完成                           │
└─────────────────────────────────────────┘
```

---

## 三、Skills 使用频率对比

| 类别 | Skills | 使用频率 | 说明 |
|------|--------|---------|------|
| **引导型** | 7 个 | ⭐⭐⭐⭐⭐ | 学生实训必用 |
| **基础型** | 4 个 | ⭐⭐⭐⭐ | 被引导型调用 |
| **教师型** | 9 个 | ⭐⭐⭐⭐ | 教师管理必用 |
| **学生查询型** | 5 个 | ⭐⭐⭐ | 日常查询用 |

---

## 四、为什么需要基础型 Skills？

### 4.1 设计原因

```
引导型 Skills = LLM 引导 + 基础 Skills

学生实训时:
- 需要 LLM 引导思考 → 培养能力
- 最终需要真正执行 → 调用基础 Skills

教师操作时:
- 不需要引导 → 直接使用基础 Skills
- 追求效率 → 快速完成操作
```

### 4.2 调用关系

```
eb-edu-create-product-guided (引导型)
    ↓ 阶段 5 调用
eb-edu-medusa-create-product (基础型)
    ↓ 调用 API
medusa-backend API
```

---

## 五、所有 Skills 都有应用场景

### 5.1 学生视角

| 场景 | 使用的 Skills |
|------|-------------|
| 登录系统 | `eb-edu-login` |
| 加入班级 | `eb-edu-join-class` |
| 查看实训 | `eb-edu-view-projects` |
| 做实训 | `eb-edu-*-guided` (引导型) |
| 提交实训 | `eb-edu-submit-project-guided` |
| 查看成绩 | `eb-edu-view-grades` |
| 分析成绩 | `eb-edu-analyze-grades-guided` |
| 查看通知 | `eb-edu-view-notifications` |

### 5.2 教师视角

| 场景 | 使用的 Skills |
|------|-------------|
| 创建班级 | `eb-edu-create-class` |
| 导入学生 | `eb-edu-import-students` |
| 创建实训 | `eb-edu-create-project` |
| 发送通知 | `eb-edu-send-notification` |
| 查看班级 | `eb-edu-list-classes` |
| 批改实训 | `eb-edu-grade-project` |
| 查看统计 | `eb-edu-view-stats` |
| 导出成绩 | `eb-edu-export-grades` |
| 创建考试 | `eb-edu-create-exam` |

---

## 六、总结

### 6.1 Skills 分类清晰

| 类别 | 数量 | 用途 | 使用者 |
|------|------|------|--------|
| 引导型 | 7 | 能力培养实训 | 学生 |
| 基础型 | 4 | 真正执行操作 | 引导型内部调用 |
| 教师型 | 9 | 教学管理 | 教师 |
| 学生查询型 | 5 | 日常查询 | 学生 |
| **总计** | **25** | **全场景覆盖** | **师生共用** |

### 6.2 所有 Skills 都有用

- ✅ **引导型** - 学生实训能力培养
- ✅ **基础型** - 被引导型调用执行
- ✅ **教师型** - 教师教学管理
- ✅ **学生查询型** - 学生日常查询

### 6.3 没有废 Skill

每个 Skill 都有明确的应用场景：
- 学生实训 → 引导型
- 教师管理 → 教师型
- 日常查询 → 查询型
- 真正执行 → 基础型

---

**维护者**: 电商 AI 实训平台教学团队  
**文档版本**: v11.0  
**更新日期**: 2026-03-30  
**状态**: 所有 Skills 都有应用场景 ✅
