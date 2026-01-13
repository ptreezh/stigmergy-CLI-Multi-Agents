#!/bin/bash
# validate-document-relationships.sh
# 验证文档关系约束

echo "验证文档关系约束..."

# 检查文档层次结构
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    if ! grep -q "## 文档层次结构" "$doc"; then
      echo "❌ 错误: $doc 缺少'文档层次结构'章节"
      exit 1
    fi
  fi
done

# 检查依赖关系
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    if ! grep -q "### 依赖关系" "$doc"; then
      echo "❌ 错误: $doc 缺少'依赖关系'章节"
      exit 1
    fi
  fi
done

# 检查文档用途
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    if ! grep -q "### 文档用途" "$doc"; then
      echo "❌ 错误: $doc 缺少'文档用途'章节"
      exit 1
    fi
  fi
done

echo "✅ 文档关系约束验证通过"
exit 0