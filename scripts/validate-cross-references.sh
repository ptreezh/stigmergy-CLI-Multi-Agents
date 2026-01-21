#!/bin/bash
# validate-cross-references.sh
# 验证交叉引用约束

echo "验证交叉引用约束..."

# 检查相关文档章节
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    if ! grep -q "## 相关文档" "$doc"; then
      echo "❌ 错误: $doc 缺少'相关文档'章节"
      exit 1
    fi
  fi
done

# 检查引用格式
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    if ! grep -q "\[.*\](\.\/.*\.md)" "$doc"; then
      echo "❌ 错误: $doc 缺少 Markdown 链接格式的引用"
      exit 1
    fi
  fi
done

# 检查引用有效性（简化版）
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    links=$(grep -o "\[.*\](\.\/[^)]*\.md)" "$doc" 2>/dev/null | sed 's/.*(\.\/\([^)]*\)\.md)/\1.md/' | head -20)
    for link in $links; do
      if [ -n "$link" ] && [ ! -f "refractdoc/$link" ]; then
        echo "⚠️ 警告: $doc 可能引用了不存在的文档 $link"
      fi
    done
  fi
done

echo "✅ 交叉引用约束验证通过"
exit 0