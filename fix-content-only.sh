#!/bin/bash

# 文字内容修订脚本
# 只修改文字内容，保持所有样式、脚本和结构不变

echo "正在获取原始HTML..."
curl -s http://www.socienceai.com/Tech/heterogeneous-agent-collaboration-system/index.html > original_index.html

echo "应用文字修改..."

# 使用sed进行文字内容替换
sed -i 's/stigmergy install -g/stigmergy install -g stigmergy@beta/g' original_index.html
sed -i 's/npm install -g stigmergy/npm install -g stigmergy@beta/g' original_index.html
sed -i 's/npm install -g stigmergy\s*$/npm install -g stigmergy@beta/g' original_index.html

# 添加版本标识到标题
sed -i 's|<h1>Stigmergy AI 协作平台</h1>|<h1>Stigmergy AI 协作平台 <span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.85em; font-weight: bold; margin-left: 10px;">v1.3.77-beta.0</span></h1>|g' original_index.html

echo "文字修改完成！"
echo ""
echo "注意：此脚本只修改了安装命令，保持了所有原始样式"
echo ""
echo "下一步："
echo "1. 检查 original_index.html"
echo "2. 如果满意，替换原始的 index.html"
