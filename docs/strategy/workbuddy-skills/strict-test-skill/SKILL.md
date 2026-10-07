---
name: strict-test-skill
description: Strict test skill - verifies the real activation mechanism of the CLI skill system by confirming whether the skill is actually loaded and executed.
description_zh: 严格测试技能 - 用于验证CLI的真实激活机制，确认技能系统是否正确加载并执行本技能。
description_en: Strict test skill - verifies the real activation mechanism of the CLI skill system.
version: 1.0.0
display_name: 严格测试激活验证 (Strict Test)
category: testing
author: stigmergy
---

# 严格测试技能

## 重要标识
- 技能名称: strict-test-skill
- 唯一标识: STRICT_TEST_1769304776818

## 功能说明
如果qwen成功加载了这个技能，会在响应中明确提到"strict-test-skill已成功激活"。

## 测试步骤
1. 当用户请求使用此技能时，系统应返回确认消息
2. 确认消息必须包含唯一标识符以验证激活
3. 验证技能系统是否正确加载和执行此技能

## 验证信息
- 激活状态: 待验证
- 验证结果: 未完成
- 最后验证时间: 2026-01-25