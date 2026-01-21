#!/bin/bash
# validate-logic-consistency.sh
# 验证逻辑一致性约束

echo "验证逻辑一致性约束..."

# 检查需求数量
if [ -f "refractdoc/REQUIREMENTS.md" ]; then
  func_req_count=$(grep -c "^#### FR-" refractdoc/REQUIREMENTS.md | head -1)
  echo "功能需求数量: $func_req_count"
  
  if [ -n "$func_req_count" ] && [ "$func_req_count" -ne "22" ]; then
    echo "❌ 错误: 功能需求数量不一致"
    echo "   期望: 22"
    echo "   实际: $func_req_count"
    exit 1
  fi
fi

# 检查设计组件
if [ -f "refractdoc/DESIGN.md" ]; then
  design_components=$(grep -c "^### [0-9]\+\.[0-9]\+" refractdoc/DESIGN.md | head -1)
  echo "设计组件数量: $design_components"
  
  if [ -n "$design_components" ] && [ "$design_components" -ne "10" ]; then
    echo "⚠️ 警告: 设计组件数量不一致"
    echo "   期望: 10"
    echo "   实际: $design_components"
  fi
fi

# 检查架构层次
if [ -f "refractdoc/DESIGN.md" ]; then
  architecture_layers=$(grep -c "^## [0-9]\+\." refractdoc/DESIGN.md | head -1)
  echo "架构层次数量: $architecture_layers"
  
  if [ -n "$architecture_layers" ] && [ "$architecture_layers" -ne "13" ]; then
    echo "⚠️ 警告: 架构层次数量不一致"
    echo "   期望: 13"
    echo "   实际: $architecture_layers"
  fi
fi

echo "✅ 逻辑一致性约束验证通过"
exit 0