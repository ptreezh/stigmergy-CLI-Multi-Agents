# eb-edu Phase 3 开发计划

**阶段**: Phase 3 - 教师工具+学生自测
**开始日期**: 2026-04-08
**目标**: 教师可自主出题，学生可个性化反复学习测试

---

## Phase 3.1: 教师出题工具 (teacher-question-creator)

### 功能需求
- [ ] 创建题目（选择/案例/开放/场景诊断）
- [ ] 设置评分标准（关键词+逻辑+完整度权重）
- [ ] 设置难度等级（基础/进阶/高级）
- [ ] 关联能力维度（6维度）
- [ ] 预览题目效果
- [ ] 批量导入题目（JSON格式）
- [ ] 题目管理（查看/编辑/删除/启用/禁用）

### 交付物
- `teacher-question-creator/SKILL.md`
- `teacher-question-creator/question_creator.js`
- `teacher-question-creator/test_creator.js`

### 验收标准
- 教师能创建4种题型
- 题目自动保存到题库文件
- 支持批量导入
- 测试通过

---

## Phase 3.2: 学生自测模块 (student-self-test)

### 功能需求
- [ ] 查看个人能力雷达图
- [ ] 选择薄弱维度专项练习
- [ ] 错题回顾+重新测试
- [ ] 难度自适应（根据水平出题）
- [ ] 学习进度追踪
- [ ] 个性化学习建议

### 交付物
- `student-self-test/SKILL.md`
- `student-self-test/self_test.js`
- `student-self-test/test_self_test.js`

### 验收标准
- 学生能查看能力雷达图
- 能选择维度专项练习
- 能查看错题和重新测试
- 测试通过

---

## Phase 3.3: 错题本功能 (wrong-question-book)

### 功能需求
- [ ] 自动记录错误题目
- [ ] 按维度分类查看
- [ ] 错题重做
- [ ] 错误原因分析
- [ ] 掌握程度追踪

### 交付物
- `wrong-question-book/SKILL.md`
- `wrong-question-book/wrong_book.js`
- `wrong-question-book/test_wrong_book.js`

### 验收标准
- 错题自动记录
- 能按维度筛选
- 能重做错题
- 测试通过

---

## Phase 3.4: 智能组卷 (smart-paper-generator)

### 功能需求
- [ ] 根据学生水平自动出题
- [ ] 控制题目难度分布
- [ ] 控制维度覆盖
- [ ] 生成A/B卷
- [ ] 导出试卷

### 交付物
- `smart-paper-generator/SKILL.md`
- `smart-paper-generator/paper_generator.js`
- `smart-paper-generator/test_paper_generator.js`

### 验收标准
- 根据能力分自动调整难度
- 题目不重复
- 维度分布合理
- 测试通过

---

## 执行顺序

1. teacher-question-creator (教师出题)
2. student-self-test (学生自测)
3. wrong-question-book (错题本)
4. smart-paper-generator (智能组卷)

---

## 时间估算

| 模块 | 预计时间 | 状态 |
|------|----------|------|
| 教师出题 | 1天 | ⏳ 待执行 |
| 学生自测 | 1天 | ⏳ 待执行 |
| 错题本 | 0.5天 | ⏳ 待执行 |
| 智能组卷 | 1天 | ⏳ 待执行 |
| 集成测试 | 0.5天 | ⏳ 待执行 |

---

**状态**: 计划已创建，等待执行
**下次更新**: 模块1完成后
