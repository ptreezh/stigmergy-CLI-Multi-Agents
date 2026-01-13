#!/bin/bash
# validate-all-constraints.sh
# 综合验证所有文档约束

echo "========================================="
echo "  Stigmergy 文档约束综合验证"
echo "========================================="
echo ""

FAILED=0

# 验证文档关系约束
echo "1. 验证文档关系约束..."
bash scripts/validate-document-relationships.sh
if [ $? -ne 0 ]; then
  echo "❌ 文档关系约束验证失败"
  FAILED=1
fi
echo ""

# 验证交叉引用约束
echo "2. 验证交叉引用约束..."
bash scripts/validate-cross-references.sh
if [ $? -ne 0 ]; then
  echo "❌ 交叉引用约束验证失败"
  FAILED=1
fi
echo ""

# 验证追溯矩阵约束
echo "3. 验证追溯矩阵约束..."
bash scripts/validate-traceability-matrices.sh
if [ $? -ne 0 ]; then
  echo "❌ 追溯矩阵约束验证失败"
  FAILED=1
fi
echo ""

# 验证逻辑一致性约束
echo "4. 验证逻辑一致性约束..."
bash scripts/validate-logic-consistency.sh
if [ $? -ne 0 ]; then
  echo "❌ 逻辑一致性约束验证失败"
  FAILED=1
fi
echo ""

# 验证 Speckit 规范约束
echo "5. 验证 Speckit 规范约束..."
bash scripts/validate-speckit-compliance.sh
if [ $? -ne 0 ]; then
  echo "❌ Speckit 规范约束验证失败"
  FAILED=1
fi
echo ""

echo "========================================="
if [ $FAILED -eq 0 ]; then
  echo "  ✅ 所有约束验证通过！"
else
  echo "  ❌ 部分约束验证失败！"
  exit 1
fi
echo "========================================="
exit 0