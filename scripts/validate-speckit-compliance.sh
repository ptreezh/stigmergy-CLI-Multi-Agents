#!/bin/bash
# validate-speckit-compliance.sh
# 验证 Speckit 规范约束

echo "验证 Speckit 规范约束..."

# 检查文档结构
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    if ! grep -q "^## 1\. 概述" "$doc"; then
      echo "❌ 错误: $doc 缺少'概述'章节"
      exit 1
    fi
  fi
done

# 检查变更历史
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    if ! grep -q "## 变更历史" "$doc"; then
      echo "⚠️ 警告: $doc 缺少'变更历史'章节"
    fi
  fi
done

# 检查变更记录格式
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    if grep -q "## 变更历史" "$doc"; then
      if ! grep -q "| 版本 | 日期 | 作者 |" "$doc"; then
        echo "⚠️ 警告: $doc 的变更记录格式可能不正确"
      fi
    fi
  fi
done

echo "✅ Speckit 规范约束验证通过"
exit 0