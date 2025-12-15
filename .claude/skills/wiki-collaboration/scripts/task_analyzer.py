#!/usr/bin/env python3
"""
Wiki任务分析器 - 分析用户需求并生成Wiki创建计划
"""

import re
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime

@dataclass
class TaskAnalysis:
    """任务分析结果"""
    original_task: str
    task_type: str
    topic: str
    domain: str
    complexity: str
    sections: List[str]
    keywords: List[str]
    suggestions: List[str]

class WikiTaskAnalyzer:
    """Wiki任务分析器"""
    
    def __init__(self):
        self.domain_keywords = {
            '技术': ['编程', '开发', '算法', '框架', '工具', '语言', '系统', '架构'],
            '学术': ['理论', '研究', '方法', '实验', '分析', '模型', '原理', '概念'],
            '实践': ['应用', '案例', '项目', '经验', '技巧', '最佳实践', '部署', '运维'],
            '教育': ['学习', '教程', '指南', '课程', '培训', '教学', '入门', '进阶']
        }
        
        self.complexity_indicators = {
            '简单': ['简介', '概述', '入门', '基础', '介绍'],
            '中等': ['详细', '全面', '完整', '深入', '系统'],
            '复杂': ['高级', '专业', '深度', '复杂', '综合', '权威']
        }
    
    def analyze_task(self, task_description: str) -> TaskAnalysis:
        """分析任务描述"""
        
        # 提取任务类型
        task_type = self._identify_task_type(task_description)
        
        # 提取主题
        topic = self._extract_topic(task_description)
        
        # 识别领域
        domain = self._identify_domain(task_description)
        
        # 评估复杂度
        complexity = self._assess_complexity(task_description)
        
        # 提取关键词
        keywords = self._extract_keywords(task_description)
        
        # 生成章节建议
        sections = self._generate_sections(topic, domain, complexity)
        
        # 生成建议
        suggestions = self._generate_suggestions(task_type, domain, complexity)
        
        return TaskAnalysis(
            original_task=task_description,
            task_type=task_type,
            topic=topic,
            domain=domain,
            complexity=complexity,
            sections=sections,
            keywords=keywords,
            suggestions=suggestions
        )
    
    def _identify_task_type(self, task: str) -> str:
        """识别任务类型"""
        create_patterns = ['创建', '新建', '生成', '制作', '构建', '开发']
        edit_patterns = ['编辑', '修改', '更新', '完善', '优化', '改进']
        integrate_patterns = ['整合', '合并', '汇总', '集成', '梳理', '组织']
        
        task_lower = task.lower()
        
        if any(pattern in task for pattern in create_patterns):
            return 'create'
        elif any(pattern in task for pattern in edit_patterns):
            return 'edit'
        elif any(pattern in task for pattern in integrate_patterns):
            return 'integrate'
        else:
            return 'general'
    
    def _extract_topic(self, task: str) -> str:
        """提取主题"""
        # 常见主题模式
        patterns = [
            r'创建(.+?)wiki',
            r'新建(.+?)wiki',
            r'生成(.+?)wiki',
            r'编辑(.+?)wiki',
            r'(.+?)wiki',
            r'关于(.+?)的',
            r'(.+?)相关的',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, task, re.IGNORECASE)
            if match:
                topic = match.group(1).strip()
                # 清理主题名称
                topic = re.sub(r'[的|相关|有关]', '', topic)
                return topic
        
        # 如果没有匹配到模式，尝试提取关键词
        keywords = self._extract_keywords(task)
        if keywords:
            return keywords[0]
        
        return '未知主题'
    
    def _identify_domain(self, task: str) -> str:
        """识别领域"""
        task_lower = task.lower()
        
        for domain, keywords in self.domain_keywords.items():
            if any(keyword in task_lower for keyword in keywords):
                return domain
        
        return '通用'
    
    def _assess_complexity(self, task: str) -> str:
        """评估复杂度"""
        task_lower = task.lower()
        
        for complexity, indicators in self.complexity_indicators.items():
            if any(indicator in task_lower for indicator in indicators):
                return complexity
        
        # 默认为中等复杂度
        return '中等'
    
    def _extract_keywords(self, task: str) -> List[str]:
        """提取关键词"""
        # 移除常见停用词
        stop_words = {'的', '了', '和', '是', '在', '有', '我', '你', '他', '她', '它', '们', '这', '那', '之', '与', '及', '或', '但', '而', '因为', '所以', '如果', '那么', '虽然', '可是'}
        
        # 分词（简单实现）
        words = re.findall(r'[\w\u4e00-\u9fff]+', task)
        
        # 过滤停用词和短词
        keywords = [word for word in words if len(word) > 1 and word not in stop_words]
        
        # 按长度排序，优先返回较长的关键词
        keywords.sort(key=len, reverse=True)
        
        return keywords[:5]  # 返回前5个关键词
    
    def _generate_sections(self, topic: str, domain: str, complexity: str) -> List[str]:
        """生成章节建议"""
        base_sections = ['简介', '核心概念', '实践应用']
        
        if domain == '技术':
            base_sections.extend(['安装配置', '使用方法', '常见问题', '最佳实践'])
        elif domain == '学术':
            base_sections.extend(['理论基础', '研究方法', '实验结果', '文献综述'])
        elif domain == '实践':
            base_sections.extend(['实施步骤', '案例分析', '经验分享', '注意事项'])
        elif domain == '教育':
            base_sections.extend(['学习目标', '课程内容', '练习题目', '参考资料'])
        
        if complexity == '复杂':
            base_sections.extend(['高级主题', '深入探讨', '专家观点'])
        
        return base_sections
    
    def _generate_suggestions(self, task_type: str, domain: str, complexity: str) -> List[str]:
        """生成建议"""
        suggestions = []
        
        if task_type == 'create':
            suggestions.append('建议先收集相关资料，确保内容准确性')
            suggestions.append('可以参考同类优秀Wiki的结构')
        elif task_type == 'edit':
            suggestions.append('建议先了解现有内容结构')
            suggestions.append('保持编辑风格的一致性')
        elif task_type == 'integrate':
            suggestions.append('建议先梳理各部分内容的逻辑关系')
            suggestions.append('注意避免内容重复')
        
        if complexity == '复杂':
            suggestions.append('复杂主题建议分模块处理')
            suggestions.append('考虑添加导航和索引')
        
        if domain == '技术':
            suggestions.append('技术类Wiki建议包含代码示例')
            suggestions.append('注意版本兼容性问题')
        elif domain == '学术':
            suggestions.append('学术类Wiki需要引用可靠的文献来源')
            suggestions.append('注意保持内容的中立性和客观性')
        
        return suggestions

def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python task_analyzer.py \"<任务描述>\"")
        return
    
    task_description = sys.argv[1]
    analyzer = WikiTaskAnalyzer()
    
    # 分析任务
    analysis = analyzer.analyze_task(task_description)
    
    # 输出结果
    print(f"任务分析结果:")
    print(f"原任务: {analysis.original_task}")
    print(f"任务类型: {analysis.task_type}")
    print(f"主题: {analysis.topic}")
    print(f"领域: {analysis.domain}")
    print(f"复杂度: {analysis.complexity}")
    print(f"关键词: {', '.join(analysis.keywords)}")
    print(f"\n建议章节:")
    for i, section in enumerate(analysis.sections, 1):
        print(f"  {i}. {section}")
    print(f"\n建议:")
    for i, suggestion in enumerate(analysis.suggestions, 1):
        print(f"  {i}. {suggestion}")
    
    # 保存分析结果
    result = {
        'analysis': analysis.__dict__,
        'timestamp': datetime.now().isoformat()
    }
    
    output_file = f"task_analysis_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n分析结果已保存到: {output_file}")

if __name__ == "__main__":
    main()