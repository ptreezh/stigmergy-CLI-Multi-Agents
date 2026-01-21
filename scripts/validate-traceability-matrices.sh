#!/bin/bash
# validate-traceability-matrices.sh
# 验证追溯矩阵约束

echo "验证追溯矩阵约束..."

# 检查追溯矩阵章节
for doc in refractdoc/*.md; do
  if [ -f "$doc" ]; then
    if ! grep -q "## 追溯矩阵" "$doc"; then
      echo "❌ 错误: $doc 缺少'追溯矩阵'章节"
      exit 1
    fi
  fi
done

# 检查需求到设计的追溯
if [ -f "refractdoc/REQUIREMENTS.md" ]; then
  if ! grep -q "### 需求到设计的追溯" refractdoc/REQUIREMENTS.md; then
    echo "❌ 错误: REQUIREMENTS.md 缺少'需求到设计的追溯'章节"
    exit 1
  fi
fi

# 检查设计到实施的追溯
if [ -f "refractdoc/DESIGN.md" ]; then
  if ! grep -q "### 设计到实施的追溯" refractdoc/DESIGN.md; then
    echo "❌ 错误: DESIGN.md 缺少'设计到实施的追溯'章节"
    exit 1
  fi
fi

# 检查需求到测试的追溯
if [ -f "refractdoc/IMPLEMENTATION.md" ]; then
  if ! grep -q "### 需求到测试的追溯" refractdoc/IMPLEMENTATION.md; then
    echo "❌ 错误: IMPLEMENTATION.md 缺少'需求到测试的追溯'章节"
    exit 1
  fi
fi

# 检查覆盖率（简化版）
if [ -f "refractdoc/REQUIREMENTS.md" ]; then
  requirements_count=$(grep -c "^#### FR-" refractdoc/REQUIREMENTS.md | head -1)
  design_count=$(grep -c "| FR-" refractdoc/REQUIREMENTS.md | head -1)
  
  if [ -n "$requirements_count" ] && [ -n "$design_count" ]; then
    if [ "$requirements_count" -gt 0 ] && [ "$design_count" -gt 0 ]; then
      if [ "$requirements_count" -gt "$design_count" ]; then
        echo "❌ 错误: 需求到设计的追溯覆盖率不足"
        echo "   需求数量: $requirements_count"
        echo "   追溯数量: $design_count"
        exit 1
      fi
    fi
  fi
fi

echo "✅ 追溯矩阵约束验证通过"
exit 0