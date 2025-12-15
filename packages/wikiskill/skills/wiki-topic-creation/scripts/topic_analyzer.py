#!/usr/bin/env python3
"""
Wiki主题分析器
分析Wiki主题的特征、类型和结构需求
"""

import json
import re
import sys
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from pathlib import Path

@dataclass
class TopicAnalysis:
    """主题分析结果"""
    name: str
    type: str
    complexity: str
    scope: str
    audience: str
    key_concepts: List[str]
    suggested_structure: List[str]
    content_requirements: Dict[str, Any]
    resource_needs: List[str]

class TopicAnalyzer:
    """主题分析器主类"""
    
    def __init__(self):
        self.topic_types = {
            'technical': {
                'keywords': ['技术', '编程', '算法', '框架', '工具', '系统', '开发', '实现'],
                'structure': ['概述', '技术原理', '实现方法', '应用案例', '工具资源', '最佳实践'],
                'complexity_indicators': ['架构', '性能', '优化', '分布式', '并发']
            },
            'academic': {
                'keywords': ['理论', '研究', '学术', '方法', '分析', '模型', '框架', '文献'],
                'structure': ['研究背景', '理论基础', '研究方法', '结果分析', '讨论', '结论'],
                'complexity_indicators': ['数学', '统计', '实验', '验证', '假设']
            },
            'practical': {
                'keywords': ['实践', '指南', '操作', '步骤', '技巧', '经验', '方法', '流程'],
                'structure': ['准备工作', '操作步骤', '常见问题', '技巧分享', '案例分析', '总结'],
                'complexity_indicators': ['复杂', '高级', '深入', '专业']
            },
            'conceptual': {
                'keywords': ['概念', '定义', '原理', '思想', '理念', '观念', '认识', '理解'],
                'structure': ['概念定义', '核心要素', '关系分析', '应用场景', '发展历程', '意义价值'],
                'complexity_indicators': ['抽象', '哲学', '本质', '深层']
            }
        }
    
    def analyze_topic(self, topic_name: str, topic_type: str = "") -> TopicAnalysis:
        """分析主题特征"""
        # 确定主题类型
        if not topic_type:
            topic_type = self._determine_topic_type(topic_name)
        
        # 分析复杂度
        complexity = self._analyze_complexity(topic_name)
        
        # 确定范围
        scope = self._determine_scope(topic_name)
        
        # 识别目标受众
        audience = self._identify_audience(topic_name, complexity)
        
        # 提取关键概念
        key_concepts = self._extract_key_concepts(topic_name)
        
        # 建议结构
        suggested_structure = self._suggest_structure(topic_type, complexity)
        
        # 内容需求
        content_requirements = self._analyze_content_requirements(topic_name, topic_type)
        
        # 资源需求
        resource_needs = self._identify_resource_needs(topic_name, topic_type)
        
        return TopicAnalysis(
            name=topic_name,
            type=topic_type,
            complexity=complexity,
            scope=scope,
            audience=audience,
            key_concepts=key_concepts,
            suggested_structure=suggested_structure,
            content_requirements=content_requirements,
            resource_needs=resource_needs
        )
    
    def _determine_topic_type(self, topic_name: str) -> str:
        """确定主题类型"""
        topic_lower = topic_name.lower()
        scores = {}
        
        for topic_type, config in self.topic_types.items():
            score = sum(1 for keyword in config['keywords'] if keyword in topic_lower)
            scores[topic_type] = score
        
        # 返回得分最高的类型
        if max(scores.values()) == 0:
            return 'general'  # 默认类型
        
        return max(scores, key=scores.get)
    
    def _analyze_complexity(self, topic_name: str) -> str:
        """分析主题复杂度"""
        topic_lower = topic_name.lower()
        
        complexity_indicators = {
            'basic': ['基础', '入门', '简介', '概述', '基本', '简单'],
            'intermediate': ['进阶', '深入', '详细', '全面', '系统'],
            'advanced': ['高级', '复杂', '专业', '深度', '精通', '架构']
        }
        
        for level, indicators in complexity_indicators.items():
            if any(indicator in topic_lower for indicator in indicators):
                return level
        
        # 基于主题长度和关键词判断
        if len(topic_name) < 10:
            return 'basic'
        elif len(topic_name) < 20:
            return 'intermediate'
        else:
            return 'advanced'
    
    def _determine_scope(self, topic_name: str) -> str:
        """确定主题范围"""
        scope_indicators = {
            'narrow': ['入门', '基础', '简介', '概述', '介绍'],
            'medium': ['指南', '教程', '方法', '技术', '实践'],
            'broad': ['系统', '全面', '完整', '架构', '生态']
        }
        
        topic_lower = topic_name.lower()
        
        for scope, indicators in scope_indicators.items():
            if any(indicator in topic_lower for indicator in indicators):
                return scope
        
        return 'medium'  # 默认范围
    
    def _identify_audience(self, topic_name: str, complexity: str) -> str:
        """识别目标受众"""
        audience_mapping = {
            'basic': '初学者',
            'intermediate': '有一定基础的学习者',
            'advanced': '专业人士或研究者'
        }
        
        return audience_mapping.get(complexity, '一般学习者')
    
    def _extract_key_concepts(self, topic_name: str) -> List[str]:
        """提取关键概念"""
        # 简单的关键词提取
        words = re.findall(r'[\u4e00-\u9fff]+|[a-zA-Z]+', topic_name)
        
        # 过滤停用词
        stop_words = {'的', '和', '与', '或', '在', '是', '有', '关于', '如何', '什么'}
        key_concepts = [word for word in words if word not in stop_words and len(word) > 1]
        
        return key_concepts
    
    def _suggest_structure(self, topic_type: str, complexity: str) -> List[str]:
        """建议章节结构"""
        base_structure = self.topic_types.get(topic_type, {}).get('structure', [])
        
        # 根据复杂度调整结构
        if complexity == 'basic':
            return base_structure[:4]  # 简化结构
        elif complexity == 'advanced':
            return base_structure + ['深入探讨', '前沿发展', '专家观点']  # 扩展结构
        
        return base_structure
    
    def _analyze_content_requirements(self, topic_name: str, topic_type: str) -> Dict[str, Any]:
        """分析内容需求"""
        requirements = {
            'needs_examples': topic_type in ['technical', 'practical'],
            'needs_references': topic_type in ['academic', 'conceptual'],
            'needs_code_samples': topic_type == 'technical',
            'needs_case_studies': topic_type in ['practical', 'technical'],
            'needs_theoretical_background': topic_type in ['academic', 'conceptual'],
            'needs_step_by_step': topic_type == 'practical'
        }
        
        return requirements
    
    def _identify_resource_needs(self, topic_name: str, topic_type: str) -> List[str]:
        """识别资源需求"""
        resource_mapping = {
            'technical': ['技术文档', 'API参考', '代码示例', '工具下载'],
            'academic': ['学术论文', '研究数据', '统计资料', '理论文献'],
            'practical': ['操作手册', '视频教程', '实践案例', '工具软件'],
            'conceptual': ['理论资料', '哲学文献', '概念图', '分析框架']
        }
        
        return resource_mapping.get(topic_type, ['参考资料'])
    
    def generate_analysis_report(self, analysis: TopicAnalysis) -> str:
        """生成分析报告"""
        report = []
        report.append(f"# {analysis.name} - 主题分析报告\n")
        
        report.append("## 基本信息\n")
        report.append(f"- **主题类型**: {analysis.type}")
        report.append(f"- **复杂程度**: {analysis.complexity}")
        report.append(f"- **主题范围**: {analysis.scope}")
        report.append(f"- **目标受众**: {analysis.audience}\n")
        
        report.append("## 关键概念\n")
        for concept in analysis.key_concepts:
            report.append(f"- {concept}")
        report.append("")
        
        report.append("## 建议结构\n")
        for i, section in enumerate(analysis.suggested_structure, 1):
            report.append(f"{i}. {section}")
        report.append("")
        
        report.append("## 内容需求\n")
        for requirement, needed in analysis.content_requirements.items():
            status = "✅ 需要" if needed else "❌ 不需要"
            report.append(f"- {requirement}: {status}")
        report.append("")
        
        report.append("## 资源需求\n")
        for resource in analysis.resource_needs:
            report.append(f"- {resource}")
        report.append("")
        
        return "\n".join(report)
    
    def export_to_json(self, analysis: TopicAnalysis, filename: str):
        """导出为JSON格式"""
        data = {
            'name': analysis.name,
            'type': analysis.type,
            'complexity': analysis.complexity,
            'scope': analysis.scope,
            'audience': analysis.audience,
            'key_concepts': analysis.key_concepts,
            'suggested_structure': analysis.suggested_structure,
            'content_requirements': analysis.content_requirements,
            'resource_needs': analysis.resource_needs
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python topic_analyzer.py --topic '主题名称' [--type '主题类型']")
        sys.exit(1)
    
    analyzer = TopicAnalyzer()
    
    # 解析参数
    topic_name = ""
    topic_type = ""
    
    if sys.argv[1] == "--topic":
        topic_name = sys.argv[2]
        
        # 检查是否有类型参数
        if len(sys.argv) > 3 and sys.argv[3] == "--type":
            topic_type = sys.argv[4]
    
    # 执行分析
    analysis = analyzer.analyze_topic(topic_name, topic_type)
    
    # 生成报告
    report = analyzer.generate_analysis_report(analysis)
    
    # 输出报告
    print(report)
    
    # 保存报告
    with open("topic_analysis_report.md", 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 导出JSON
    analyzer.export_to_json(analysis, "topic_analysis.json")
    
    print(f"\n主题分析报告已保存到 topic_analysis_report.md")
    print("详细数据已保存到 topic_analysis.json")

if __name__ == "__main__":
    main()