---
name: strict-test-skill
description: 严格测试技能 - 用于验证CLI的真实激活机制
author: stigmergy
version: 1.0.0
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