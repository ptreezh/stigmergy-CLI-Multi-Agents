# Wiki协同编辑技能使用指南

## 技能概述

Wiki协同编辑技能是一个专为Claude Skills设计的单网页Wiki创建和编辑系统。它能够根据用户需求快速生成功能完整的Wiki页面，支持编辑、搜索、主题切换等功能。

## 核心特性

### 单网页设计
- 所有内容集成在一个HTML文件中
- 内置CSS样式和JavaScript功能
- 无需服务器依赖，便于分享和部署
- 支持本地打开和离线使用

### 丰富的交互功能
- 智能搜索：实时搜索内容并高亮显示
- 编辑模式：支持直接编辑Wiki内容
- 主题切换：支持亮色/暗色主题
- 目录导航：自动生成并支持快速跳转
- 打印优化：专门的打印样式

### 响应式设计
- 适配桌面和移动设备
- 灵活的布局系统
- 触摸友好的交互设计
- 优化的阅读体验

## 使用方法

### 基本使用流程

1. **任务分析**
   ```
   使用命令：python scripts/task_analyzer.py "任务描述"
   示例：python scripts/task_analyzer.py "创建机器学习Wiki"
   ```

2. **Wiki生成**
   ```
   使用命令：python scripts/wiki_generator.py create "Wiki标题"
   示例：python scripts/wiki_generator.py create "Python编程指南"
   ```

3. **查看和编辑**
   - 在浏览器中打开生成的HTML文件
   - 使用编辑模式修改内容
   - 保存修改后的文件

### 高级功能

#### 创建示例Wiki
```
python scripts/wiki_generator.py example
```
这将创建一个完整的机器学习入门指南示例。

#### 批量创建
可以通过脚本批量创建多个Wiki页面，适合构建知识体系。

## 技能目录结构

```
wiki-collaboration/
├── SKILL.md                 # 技能定义文件
├── scripts/                 # 脚本目录
│   ├── task_analyzer.py     # 任务分析器
│   └── wiki_generator.py    # Wiki生成器
├── references/              # 参考资料
│   └── usage_guide.md       # 使用指南
└── generated/               # 生成的Wiki文件（建议）
```

## 最佳实践

### 内容组织
1. **清晰的层次结构**
   - 使用合理的标题层级
   - 保持章节逻辑清晰
   - 提供完整的目录导航

2. **内容质量**
   - 确保信息准确性
   - 提供丰富的示例
   - 包含参考资料

3. **用户体验**
   - 使用简洁的语言
   - 提供必要的解释
   - 保持一致的格式

### 技术优化
1. **文件大小控制**
   - 避免过长的单个页面
   - 合理使用图片和媒体
   - 优化CSS和JavaScript

2. **浏览器兼容性**
   - 使用标准HTML5标签
   - 避免实验性功能
   - 提供降级方案

## 常见问题

### Q: 如何编辑已创建的Wiki？
A: 打开HTML文件，点击"编辑模式"按钮即可直接编辑内容。

### Q: 如何保存编辑的内容？
A: 在编辑模式下使用浏览器的保存功能（Ctrl+S）或复制内容到其他编辑器。

### Q: 能否添加更多交互功能？
A: 可以修改JavaScript部分添加更多功能，如评论系统、协作编辑等。

### Q: 如何自定义样式？
A: 修改CSS部分即可自定义颜色、字体、布局等样式。

## 扩展开发

### 添加新的章节类型
```python
# 在wiki_generator.py中添加新的章节模板
def generate_custom_section(self, topic):
    return WikiSection(
        title="自定义章节",
        content="<p>自定义内容</p>",
        level=1
    )
```

### 集成外部数据源
```python
# 添加数据获取功能
def fetch_external_data(self, topic):
    # 从API或数据库获取数据
    pass
```

### 自定义主题
```css
/* 在CSS部分添加新主题 */
.custom-theme {
    background-color: #f0f0f0;
    color: #333;
}
```

## 技术规格

### 支持的浏览器
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### 文件格式
- HTML5
- CSS3
- JavaScript ES6+

### 性能指标
- 首次加载时间：< 2秒
- 搜索响应时间：< 100ms
- 编辑响应时间：< 50ms

## 更新日志

### v1.0.0 (2025-12-14)
- 初始版本发布
- 基础Wiki创建功能
- 编辑和搜索功能
- 响应式设计支持

## 技术支持

如遇到问题或需要帮助，请：
1. 检查浏览器兼容性
2. 查看控制台错误信息
3. 参考本文档的常见问题部分

## 版权信息

本技能遵循MIT许可证，可自由使用和修改。