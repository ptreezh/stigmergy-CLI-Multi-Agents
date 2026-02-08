#!/bin/bash

# 网页更新部署脚本
# 用于更新 socienceai.com 网站的 stigmergy 文档

echo "========================================="
echo "  Stigmergy 网页更新部署脚本"
echo "========================================="
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 配置
ORIGINAL_HTML="index.html"
BACKUP_HTML="index.html.backup.$(date +%Y%m%d_%H%M%S)"
REVISED_HTML="index_revised.html"
VERSION="v1.3.77-beta.0"

echo -e "${YELLOW}📋 部署前检查${NC}"
echo "===================="

# 1. 检查当前目录
if [ ! -f "$ORIGINAL_HTML" ]; then
    echo -e "${RED}❌ 错误: 找不到 index.html${NC}"
    echo "请确保在正确的网站目录中运行此脚本"
    exit 1
fi
echo -e "${GREEN}✅ 当前目录正确${NC}"

# 2. 检查修订版文件
if [ ! -f "$REVISED_HTML" ]; then
    echo -e "${RED}❌ 错误: 找不到 index_revised.html${NC}"
    echo "请先确保修订文件已生成"
    exit 1
fi
echo -e "${GREEN}✅ 修订文件存在${NC}"

# 3. 备份原文件
echo ""
echo -e "${YELLOW}💾 备份原文件${NC}"
echo "==============="
cp "$ORIGINAL_HTML" "$BACKUP_HTML"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 已备份到: $BACKUP_HTML${NC}"
else
    echo -e "${RED}❌ 备份失败${NC}"
    exit 1
fi

# 4. 对比文件差异
echo ""
echo -e "${YELLOW}📊 文件差异分析${NC}"
echo "==============="
ORIGINAL_LINES=$(wc -l < "$ORIGINAL_HTML")
REVISED_LINES=$(wc -l < "$REVISED_HTML")
ADDED_LINES=$((REVISED_LINES - ORIGINAL_LINES))

echo "原文件行数: $ORIGINAL_LINES"
echo "修订文件行数: $REVISED_LINES"
echo "新增行数: $ADDED_LINES"

# 5. 验证关键内容
echo ""
echo -e "${YELLOW}🔍 关键内容验证${NC}"
echo "==============="

# 检查版本号
if grep -q "$VERSION" "$REVISED_HTML"; then
    echo -e "${GREEN}✅ 版本号正确 ($VERSION)${NC}"
else
    echo -e "${RED}❌ 版本号未找到${NC}"
fi

# 检查新功能
NEW_FEATURES=("交互模式" "并发模式" "项目状态看板" "stigmergy interactive" "stigmergy concurrent")
for feature in "${NEW_FEATURES[@]}"; do
    if grep -q "$feature" "$REVISED_HTML"; then
        echo -e "${GREEN}✅ 新功能包含: $feature${NC}"
    else
        echo -e "${RED}❌ 新功能缺失: $feature${NC}"
    fi
done

# 检查链接完整性
LINK_COUNT=$(grep -o 'href=' "$REVISED_HTML" | wc -l)
echo -e "${GREEN}✅ 链接总数: $LINK_COUNT${NC}"

# 6. 确认部署
echo ""
echo -e "${YELLOW}🚀 准备部署${NC}"
echo "=========="
echo ""
echo "版本: $VERSION"
echo "备份: $BACKUP_HTML"
echo "新增行数: $ADDED_LINES"
echo ""
echo -e "${YELLOW}即将执行:${NC}"
echo "1. 备份原文件: $BACKUP_HTML"
echo "2. 替换为修订版: $ORIGINAL_HTML"
echo ""
read -p "确认部署? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "部署已取消"
    exit 0
fi

# 7. 执行部署
echo ""
echo -e "${YELLOW}⚡ 正在部署...${NC}"
cp "$REVISED_HTML" "$ORIGINAL_HTML"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ 部署成功！${NC}"
    echo ""
    echo "已更新: $ORIGINAL_HTML"
    echo "版本: $VERSION"
    echo "备份: $BACKUP_HTML"
    echo ""
    echo -e "${YELLOW}下一步:${NC}"
    echo "1. 在浏览器中测试页面"
    echo "2. 验证所有链接正常"
    echo "3. 检查新功能展示正确"
    echo "4. 提交到版本控制系统"
    echo ""
    echo -e "${GREEN}git add $ORIGINAL_HTML${NC}"
    echo -e "${GREEN}git commit -m \"docs: update to ${VERSION} with new features\"${NC}"
    echo -e "${GREEN}git push${NC}"
else
    echo -e "${RED}❌ 部署失败${NC}"
    echo "恢复备份..."
    cp "$BACKUP_HTML" "$ORIGINAL_HTML"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}  ✅ 部署完成！${NC}"
echo -e "${GREEN}=========================================${NC}"
