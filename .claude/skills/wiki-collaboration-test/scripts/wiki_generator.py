#!/usr/bin/env python3
"""
Wiki生成器 - 创建单网页Wiki系统
"""

import os
import re
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class WikiConfig:
    """Wiki配置"""
    title: str
    description: str
    author: str = "Wiki Collaborator"
    theme: str = "default"
    language: str = "zh-CN"

@dataclass
class WikiSection:
    """Wiki章节"""
    title: str
    content: str
    level: int = 1
    subsections: List['WikiSection'] = None

class WikiGenerator:
    """Wiki生成器"""
    
    def __init__(self):
        self.templates = self._load_templates()
    
    def _load_templates(self) -> Dict[str, str]:
        """加载模板"""
        return {
            'html': '''<!DOCTYPE html>
<html lang="{language}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{description}">
    <meta name="author" content="{author}">
    <style>{css}</style>
</head>
<body>
    <div class="wiki-container">
        <header class="wiki-header">
            <h1>{title}</h1>
            <div class="meta">
                <span>创建时间: {created_time}</span> | 
                <span>作者: {author}</span> | 
                <span>最后修改: {modified_time}</span>
            </div>
        </header>
        
        <nav class="wiki-nav">
            <div class="search-box">
                <input type="text" id="search-input" placeholder="搜索词条..." />
            </div>
            <div class="nav-buttons">
                <button onclick="toggleEditMode()">编辑模式</button>
                <button onclick="toggleTheme()">主题切换</button>
                <button onclick="printWiki()">打印</button>
            </div>
        </nav>
        
        <aside class="wiki-toc">
            <h3>目录</h3>
            <div id="toc-content">{toc}</div>
        </aside>
        
        <main class="wiki-content">
            {content}
        </main>
        
        <footer class="wiki-footer">
            <div class="references">
                <h3>参考资料</h3>
                {references}
            </div>
            <div class="tags">
                <h3>标签</h3>
                {tags}
            </div>
        </footer>
    </div>
    
    <script>{javascript}</script>
</body>
</html>''',
            
            'css': '''/* Wiki样式 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    background-color: #f8f9fa;
}

.wiki-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: white;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    border-radius: 8px;
    margin-top: 20px;
    margin-bottom: 20px;
}

/* 头部样式 */
.wiki-header {
    border-bottom: 2px solid #e9ecef;
    padding-bottom: 20px;
    margin-bottom: 30px;
}

.wiki-header h1 {
    font-size: 2.5em;
    color: #2c3e50;
    margin-bottom: 10px;
}

.wiki-header .meta {
    color: #6c757d;
    font-size: 0.9em;
}

/* 导航样式 */
.wiki-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 5px;
}

.search-box input {
    width: 300px;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.nav-buttons button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    margin-left: 10px;
    font-size: 14px;
}

.nav-buttons button:hover {
    background-color: #0056b3;
}

/* 目录样式 */
.wiki-toc {
    position: sticky;
    top: 20px;
    float: right;
    width: 250px;
    margin-left: 30px;
    padding: 20px;
    background-color: #f8f9fa;
    border-radius: 5px;
    border-left: 4px solid #007bff;
}

.wiki-toc h3 {
    margin-bottom: 15px;
    color: #2c3e50;
}

.wiki-toc ul {
    list-style: none;
}

.wiki-toc li {
    margin-bottom: 5px;
}

.wiki-toc a {
    color: #007bff;
    text-decoration: none;
    font-size: 14px;
}

.wiki-toc a:hover {
    text-decoration: underline;
}

/* 内容样式 */
.wiki-content {
    margin-right: 300px;
    padding: 20px;
}

.wiki-content h1,
.wiki-content h2,
.wiki-content h3,
.wiki-content h4,
.wiki-content h5,
.wiki-content h6 {
    margin-top: 30px;
    margin-bottom: 15px;
    color: #2c3e50;
}

.wiki-content h1 { font-size: 2em; }
.wiki-content h2 { font-size: 1.8em; }
.wiki-content h3 { font-size: 1.6em; }
.wiki-content h4 { font-size: 1.4em; }
.wiki-content h5 { font-size: 1.2em; }
.wiki-content h6 { font-size: 1em; }

.wiki-content p {
    margin-bottom: 15px;
    text-align: justify;
}

.wiki-content ul,
.wiki-content ol {
    margin-bottom: 15px;
    padding-left: 30px;
}

.wiki-content li {
    margin-bottom: 5px;
}

.wiki-content blockquote {
    margin: 20px 0;
    padding: 15px 20px;
    background-color: #f8f9fa;
    border-left: 5px solid #007bff;
    font-style: italic;
}

.wiki-content pre {
    background-color: #f8f9fa;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 14px;
    border: 1px solid #e9ecef;
}

.wiki-content code {
    background-color: #f8f9fa;
    padding: 2px 5px;
    border-radius: 3px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    font-size: 0.9em;
    border: 1px solid #e9ecef;
}

.wiki-content table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.wiki-content th,
.wiki-content td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
}

.wiki-content th {
    background-color: #f8f9fa;
    font-weight: bold;
}

/* 页脚样式 */
.wiki-footer {
    margin-top: 50px;
    padding-top: 30px;
    border-top: 2px solid #e9ecef;
    clear: both;
}

.wiki-footer h3 {
    margin-bottom: 15px;
    color: #2c3e50;
}

.references {
    margin-bottom: 30px;
}

.references ul {
    list-style-type: none;
}

.references li {
    margin-bottom: 8px;
    padding-left: 20px;
    text-indent: -20px;
}

.tags {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.tag {
    background-color: #007bff;
    color: white;
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
}

/* 编辑模式 */
.edit-mode .wiki-content {
    border: 2px dashed #007bff;
    outline: none;
}

.edit-mode .wiki-content:focus {
    border-color: #0056b3;
    box-shadow: 0 0 5px rgba(0,123,255,0.5);
}

/* 暗色主题 */
.dark-theme {
    background-color: #1a1a1a;
    color: #e0e0e0;
}

.dark-theme .wiki-container {
    background-color: #2d2d2d;
    color: #e0e0e0;
}

.dark-theme .wiki-header h1,
.dark-theme .wiki-content h1,
.dark-theme .wiki-content h2,
.dark-theme .wiki-content h3,
.dark-theme .wiki-content h4,
.dark-theme .wiki-content h5,
.dark-theme .wiki-content h6,
.dark-theme .wiki-footer h3 {
    color: #e0e0e0;
}

.dark-theme .wiki-nav,
.dark-theme .wiki-toc,
.dark-theme .wiki-content pre,
.dark-theme .wiki-content code {
    background-color: #3d3d3d;
}

.dark-theme .wiki-content blockquote {
    background-color: #3d3d3d;
    border-left-color: #4a9eff;
}

.dark-theme .search-box input {
    background-color: #3d3d3d;
    border-color: #555;
    color: #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .wiki-container {
        margin: 10px;
        padding: 15px;
    }
    
    .wiki-nav {
        flex-direction: column;
        gap: 15px;
    }
    
    .search-box input {
        width: 100%;
    }
    
    .wiki-toc {
        float: none;
        width: 100%;
        margin: 20px 0;
    }
    
    .wiki-content {
        margin-right: 0;
    }
    
    .wiki-header h1 {
        font-size: 2em;
    }
}

@media (max-width: 480px) {
    .wiki-header h1 {
        font-size: 1.8em;
    }
    
    .nav-buttons {
        flex-wrap: wrap;
        gap: 5px;
    }
    
    .nav-buttons button {
        margin-left: 0;
        font-size: 12px;
        padding: 6px 10px;
    }
}

/* 打印样式 */
@media print {
    body {
        background-color: white;
        color: black;
    }
    
    .wiki-container {
        box-shadow: none;
        margin: 0;
        padding: 0;
    }
    
    .wiki-nav,
    .wiki-toc,
    .wiki-footer {
        display: none;
    }
    
    .wiki-content {
        margin-right: 0;
    }
}''',
            
            'javascript': '''// Wiki交互功能
let isEditMode = false;
let isDarkTheme = false;

// 搜索功能
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const content = document.querySelector('.wiki-content');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const sections = content.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li');
        
        sections.forEach(section => {
            const text = section.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                section.style.backgroundColor = searchTerm ? '#fff3cd' : 'transparent';
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}

// 编辑模式切换
function toggleEditMode() {
    const content = document.querySelector('.wiki-content');
    const button = event.target;
    
    isEditMode = !isEditMode;
    
    if (isEditMode) {
        content.contentEditable = true;
        content.classList.add('edit-mode');
        button.textContent = '预览模式';
        
        // 添加保存提示
        if (!document.getElementById('save-hint')) {
            const hint = document.createElement('div');
            hint.id = 'save-hint';
            hint.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 10px 15px;
                border-radius: 5px;
                z-index: 1000;
            `;
            hint.textContent = '编辑模式已开启，请使用Ctrl+S保存';
            document.body.appendChild(hint);
            
            setTimeout(() => hint.remove(), 3000);
        }
    } else {
        content.contentEditable = false;
        content.classList.remove('edit-mode');
        button.textContent = '编辑模式';
    }
}

// 主题切换
function toggleTheme() {
    const body = document.body;
    isDarkTheme = !isDarkTheme;
    
    if (isDarkTheme) {
        body.classList.add('dark-theme');
    } else {
        body.classList.remove('dark-theme');
    }
}

// 打印功能
function printWiki() {
    window.print();
}

// 目录生成
function generateTOC() {
    const tocContent = document.getElementById('toc-content');
    const content = document.querySelector('.wiki-content');
    const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
    
    let tocHTML = '<ul>';
    headings.forEach((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        
        const level = parseInt(heading.tagName.charAt(1));
        const indent = (level - 1) * 15;
        
        tocHTML += `<li style="margin-left: ${indent}px;">`;
        tocHTML += `<a href="#${id}">${heading.textContent}</a></li>`;
    });
    tocHTML += '</ul>';
    
    tocContent.innerHTML = tocHTML;
}

// 平滑滚动
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 键盘快捷键
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+E: 切换编辑模式
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            toggleEditMode();
        }
        
        // Ctrl+D: 切换主题
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            toggleTheme();
        }
        
        // Ctrl+P: 打印
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            printWiki();
        }
        
        // Ctrl+F: 聚焦搜索
        if (e.ctrlKey && e.key === 'f') {
            e.preventDefault();
            document.getElementById('search-input').focus();
        }
    });
}

// 保存功能（仅提示）
function initSavePrompt() {
    document.addEventListener('keydown', function(e) {
        if (isEditMode && e.ctrlKey && e.key === 's') {
            e.preventDefault();
            alert('请使用浏览器的保存功能或复制内容到其他编辑器中保存。');
        }
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initSearch();
    generateTOC();
    initSmoothScroll();
    initKeyboardShortcuts();
    initSavePrompt();
    
    // 添加加载完成提示
    console.log('Wiki页面加载完成');
    console.log('快捷键：');
    console.log('Ctrl+E: 切换编辑模式');
    console.log('Ctrl+D: 切换主题');
    console.log('Ctrl+P: 打印');
    console.log('Ctrl+F: 搜索');
});'''
        }
    
    def generate_wiki(self, config: WikiConfig, sections: List[WikiSection], 
                     references: List[str] = None, tags: List[str] = None) -> str:
        """生成Wiki页面"""
        
        # 生成内容
        content = self._generate_content(sections)
        
        # 生成目录
        toc = self._generate_toc(sections)
        
        # 生成参考资料
        references_html = self._generate_references(references or [])
        
        # 生成标签
        tags_html = self._generate_tags(tags or [])
        
        # 获取时间
        now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        # 填充模板
        html = self.templates['html'].format(
            title=config.title,
            description=config.description,
            author=config.author,
            language=config.language,
            css=self.templates['css'],
            javascript=self.templates['javascript'],
            created_time=now,
            modified_time=now,
            toc=toc,
            content=content,
            references=references_html,
            tags=tags_html
        )
        
        return html
    
    def _generate_content(self, sections: List[WikiSection]) -> str:
        """生成内容HTML"""
        content = ""
        
        for section in sections:
            content += f'<h{section.level}>{section.title}</h{section.level}>\n'
            content += f'<div class="section-content">\n'
            content += section.content
            content += '\n</div>\n'
            
            if section.subsections:
                content += self._generate_content(section.subsections)
        
        return content
    
    def _generate_toc(self, sections: List[WikiSection]) -> str:
        """生成目录HTML"""
        toc = '<ul>'
        
        for section in sections:
            toc += f'<li><a href="#{self._to_anchor(section.title)}">{section.title}</a></li>'
            
            if section.subsections:
                toc += self._generate_toc_subsections(section.subsections)
        
        toc += '</ul>'
        return toc
    
    def _generate_toc_subsections(self, sections: List[WikiSection]) -> str:
        """生成子目录HTML"""
        toc = '<ul>'
        
        for section in sections:
            toc += f'<li><a href="#{self._to_anchor(section.title)}">{section.title}</a></li>'
            
            if section.subsections:
                toc += self._generate_toc_subsections(section.subsections)
        
        toc += '</ul>'
        return toc
    
    def _generate_references(self, references: List[str]) -> str:
        """生成参考资料HTML"""
        if not references:
            return '<p>暂无参考资料</p>'
        
        html = '<ul>'
        for ref in references:
            html += f'<li>{ref}</li>'
        html += '</ul>'
        
        return html
    
    def _generate_tags(self, tags: List[str]) -> str:
        """生成标签HTML"""
        if not tags:
            return '<p>暂无标签</p>'
        
        html = ''
        for tag in tags:
            html += f'<span class="tag">{tag}</span>'
        
        return html
    
    def _to_anchor(self, text: str) -> str:
        """转换为锚点"""
        # 移除特殊字符，只保留字母数字和中文
        anchor = re.sub(r'[^\w\u4e00-\u9fff]', '-', text)
        # 移除多余的连字符
        anchor = re.sub(r'-+', '-', anchor).strip('-')
        return anchor.lower()
    
    def save_wiki(self, html: str, filename: str) -> str:
        """保存Wiki文件"""
        # 确保文件名以.html结尾
        if not filename.endswith('.html'):
            filename += '.html'
        
        # 如果文件名包含路径，创建目录
        dir_path = os.path.dirname(filename)
        if dir_path:
            os.makedirs(dir_path, exist_ok=True)
        
        # 保存文件
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(html)
        
        return filename

def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python wiki_generator.py <command> [options]")
        print("命令:")
        print("  create <title> - 创建新的Wiki")
        print("  example - 创建示例Wiki")
        return
    
    command = sys.argv[1]
    generator = WikiGenerator()
    
    if command == 'create':
        if len(sys.argv) < 3:
            print("请提供Wiki标题")
            return
        
        title = sys.argv[2]
        
        # 创建配置
        config = WikiConfig(
            title=title,
            description=f"{title}相关的知识库",
            author="Wiki Collaborator"
        )
        
        # 创建示例章节
        sections = [
            WikiSection(
                title="简介",
                content=f"<p>{title}是一个重要的主题，本文档将详细介绍相关内容。</p>",
                level=1
            ),
            WikiSection(
                title="核心概念",
                content="<p>本节介绍{title}的核心概念和基本原理。</p>",
                level=1,
                subsections=[
                    WikiSection(
                        title="基本定义",
                        content="<p>这里是基本定义的详细说明。</p>",
                        level=2
                    ),
                    WikiSection(
                        title="关键特性",
                        content="<p>这里是关键特性的详细说明。</p>",
                        level=2
                    )
                ]
            ),
            WikiSection(
                title="实践应用",
                content="<p>本节介绍{title}的实际应用场景和案例。</p>",
                level=1
            )
        ]
        
        # 生成Wiki
        html = generator.generate_wiki(
            config=config,
            sections=sections,
            references=["参考资料1", "参考资料2"],
            tags=[title, "知识库", "技术文档"]
        )
        
        # 保存文件
        filename = generator.save_wiki(html, f"{title}.html")
        print(f"Wiki已创建: {filename}")
    
    elif command == 'example':
        # 创建示例配置
        config = WikiConfig(
            title="机器学习入门指南",
            description="机器学习基础知识和实践指南",
            author="Wiki Collaborator"
        )
        
        # 创建示例章节
        sections = [
            WikiSection(
                title="什么是机器学习",
                content='''<p>机器学习是人工智能的一个重要分支，它使计算机能够在没有明确编程的情况下学习和改进。</p>
<p>机器学习的核心思想是通过算法分析数据，识别模式，并基于这些模式做出预测或决策。</p>''',
                level=1
            ),
            WikiSection(
                title="机器学习的类型",
                content='<p>机器学习主要分为以下几种类型：</p>',
                level=1,
                subsections=[
                    WikiSection(
                        title="监督学习",
                        content='''<p>监督学习是最常见的机器学习类型，它使用标记的训练数据来学习输入和输出之间的映射关系。</p>
<p>常见算法包括：线性回归、逻辑回归、决策树、随机森林等。</p>''',
                        level=2
                    ),
                    WikiSection(
                        title="无监督学习",
                        content='''<p>无监督学习处理未标记的数据，试图发现数据中的隐藏模式或结构。</p>
<p>常见算法包括：聚类分析、主成分分析、关联规则挖掘等。</p>''',
                        level=2
                    ),
                    WikiSection(
                        title="强化学习",
                        content='''<p>强化学习通过与环境交互来学习最优策略，智能体通过奖励和惩罚来改进其行为。</p>
<p>应用领域包括：游戏AI、机器人控制、自动驾驶等。</p>''',
                        level=2
                    )
                ]
            ),
            WikiSection(
                title="机器学习工作流程",
                content='''<p>典型的机器学习项目包括以下步骤：</p>
<ol>
<li><strong>数据收集</strong>：收集相关的训练和测试数据</li>
<li><strong>数据预处理</strong>：清洗和准备数据</li>
<li><strong>特征工程</strong>：选择和提取有用的特征</li>
<li><strong>模型选择</strong>：选择合适的算法</li>
<li><strong>模型训练</strong>：使用训练数据训练模型</li>
<li><strong>模型评估</strong>：评估模型性能</li>
<li><strong>模型部署</strong>：将模型部署到生产环境</li>
</ol>''',
                level=1
            ),
            WikiSection(
                title="常见挑战和解决方案",
                content='''<p>机器学习项目面临的主要挑战包括：</p>
<ul>
<li><strong>数据质量问题</strong>：通过数据清洗和验证来解决</li>
<li><strong>过拟合</strong>：使用正则化和交叉验证来缓解</li>
<li><strong>特征选择</strong>：使用特征重要性分析来优化</li>
<li><strong>模型解释性</strong>：使用可解释AI技术来改善</li>
</ul>''',
                level=1
            )
        ]
        
        # 生成Wiki
        html = generator.generate_wiki(
            config=config,
            sections=sections,
            references=[
                "《机器学习》- 周志华著",
                "《Pattern Recognition and Machine Learning》- Christopher Bishop",
                "scikit-learn官方文档",
                "Kaggle机器学习课程"
            ],
            tags=["机器学习", "人工智能", "数据科学", "算法", "Python"]
        )
        
        # 保存文件
        filename = generator.save_wiki(html, "机器学习入门指南.html")
        print(f"示例Wiki已创建: {filename}")
    
    else:
        print(f"未知命令: {command}")

if __name__ == "__main__":
    main()