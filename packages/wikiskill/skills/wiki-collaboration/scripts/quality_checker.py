#!/usr/bin/env python3
"""
Wiki内容质量检查器
评估Wiki内容的质量、完整性和专业性
"""

import json
import re
import sys
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass
from pathlib import Path

@dataclass
class QualityMetric:
    """质量指标数据结构"""
    name: str
    score: float
    max_score: float
    description: str
    suggestions: List[str]

class QualityChecker:
    """质量检查器主类"""
    
    def __init__(self):
        self.metrics = []
        self.weights = {
            'accuracy': 0.25,
            'completeness': 0.20,
            'clarity': 0.20,
            'structure': 0.15,
            'references': 0.10,
            'objectivity': 0.10
        }
    
    def check_content(self, content: str, topic: str = "") -> Dict[str, Any]:
        """检查内容质量"""
        results = {
            'overall_score': 0.0,
            'metrics': {},
            'suggestions': [],
            'issues': [],
            'strengths': []
        }
        
        # 执行各项检查
        accuracy_score = self._check_accuracy(content)
        completeness_score = self._check_completeness(content, topic)
        clarity_score = self._check_clarity(content)
        structure_score = self._check_structure(content)
        references_score = self._check_references(content)
        objectivity_score = self._check_objectivity(content)
        
        # 收集指标
        metrics = {
            'accuracy': accuracy_score,
            'completeness': completeness_score,
            'clarity': clarity_score,
            'structure': structure_score,
            'references': references_score,
            'objectivity': objectivity_score
        }
        
        # 计算总分
        overall_score = sum(score * self.weights[metric] for metric, score in metrics.items())
        
        results['overall_score'] = overall_score
        results['metrics'] = metrics
        
        # 生成建议和问题
        results['suggestions'] = self._generate_suggestions(metrics)
        results['issues'] = self._identify_issues(metrics)
        results['strengths'] = self._identify_strengths(metrics)
        
        return results
    
    def _check_accuracy(self, content: str) -> QualityMetric:
        """检查准确性"""
        score = 0.0
        suggestions = []
        
        # 检查是否有明确的事实陈述
        factual_statements = len(re.findall(r'\d{4}年|\d+%', content))
        if factual_statements > 0:
            score += 0.3
        
        # 检查是否有引用或参考
        has_references = bool(re.search(r'参考|引用|来源|据.*报道', content))
        if has_references:
            score += 0.4
        
        # 检查是否有模糊表述
        vague_phrases = len(re.findall(r'可能|大概|据说|似乎|也许', content))
        if vague_phrases == 0:
            score += 0.3
        elif vague_phrases <= 2:
            score += 0.1
        
        if vague_phrases > 3:
            suggestions.append("减少模糊表述，提供更确切的信息")
        
        if not has_references:
            suggestions.append("添加引用和参考资料以提高可信度")
        
        return QualityMetric(
            name="准确性",
            score=score,
            max_score=1.0,
            description="内容的准确性和可信度",
            suggestions=suggestions
        )
    
    def _check_completeness(self, content: str, topic: str) -> QualityMetric:
        """检查完整性"""
        score = 0.0
        suggestions = []
        
        # 检查内容长度
        if len(content) > 500:
            score += 0.2
        elif len(content) > 200:
            score += 0.1
        
        # 检查是否有定义部分
        has_definition = bool(re.search(r'定义|是指|概念|含义', content))
        if has_definition:
            score += 0.2
        
        # 检查是否有应用或案例
        has_applications = bool(re.search(r'应用|案例|实例|使用', content))
        if has_applications:
            score += 0.2
        
        # 检查是否有技术细节
        has_technical = bool(re.search(r'技术|方法|实现|原理', content))
        if has_technical:
            score += 0.2
        
        # 检查是否有总结
        has_summary = bool(re.search(r'总结|结论|总之|综上', content))
        if has_summary:
            score += 0.2
        
        if not has_definition:
            suggestions.append("添加核心概念的定义")
        
        if not has_applications:
            suggestions.append("补充实际应用案例")
        
        if not has_technical and len(content) > 300:
            suggestions.append("添加技术细节或实现方法")
        
        return QualityMetric(
            name="完整性",
            score=score,
            max_score=1.0,
            description="内容的完整性和覆盖面",
            suggestions=suggestions
        )
    
    def _check_clarity(self, content: str) -> QualityMetric:
        """检查清晰度"""
        score = 0.0
        suggestions = []
        
        # 检查句子长度
        sentences = re.split(r'[。！？]', content)
        long_sentences = sum(1 for s in sentences if len(s) > 50)
        if long_sentences / max(len(sentences), 1) < 0.3:
            score += 0.3
        
        # 检查段落结构
        paragraphs = content.split('\n\n')
        if len(paragraphs) > 1:
            score += 0.2
        
        # 检查专业术语解释
        technical_terms = len(re.findall(r'[A-Z]{2,}|专业|术语', content))
        if technical_terms > 0:
            # 假设有解释（实际应用中需要更复杂的逻辑）
            score += 0.2
        
        # 检查逻辑连接词
        connectors = len(re.findall(r'因此|然而|所以|首先|其次|最后', content))
        if connectors > 0:
            score += 0.3
        
        if long_sentences / max(len(sentences), 1) > 0.5:
            suggestions.append("缩短过长的句子以提高可读性")
        
        if len(paragraphs) == 1 and len(content) > 200:
            suggestions.append("将长文本分段以提高可读性")
        
        return QualityMetric(
            name="清晰度",
            score=score,
            max_score=1.0,
            description="内容的清晰度和可读性",
            suggestions=suggestions
        )
    
    def _check_structure(self, content: str) -> QualityMetric:
        """检查结构"""
        score = 0.0
        suggestions = []
        
        # 检查标题结构
        headers = len(re.findall(r'^#+\s', content, re.MULTILINE))
        if headers > 0:
            score += 0.3
        
        # 检查列表结构
        lists = len(re.findall(r'^\s*[-*+]\s|^\s*\d+\.', content, re.MULTILINE))
        if lists > 0:
            score += 0.3
        
        # 检查层次结构
        if headers > 1:
            score += 0.2
        
        # 检查开头和结尾
        if content.startswith('#') or re.search(r'引言|概述|背景', content[:100]):
            score += 0.1
        
        if re.search(r'总结|结论|参考', content[-100:]):
            score += 0.1
        
        if headers == 0 and len(content) > 200:
            suggestions.append("添加标题和子标题来组织内容")
        
        if lists == 0 and len(content) > 300:
            suggestions.append("使用列表来呈现要点")
        
        return QualityMetric(
            name="结构性",
            score=score,
            max_score=1.0,
            description="内容的组织结构和层次",
            suggestions=suggestions
        )
    
    def _check_references(self, content: str) -> QualityMetric:
        """检查参考文献"""
        score = 0.0
        suggestions = []
        
        # 检查链接
        links = len(re.findall(r'http[s]?://\S+', content))
        if links > 0:
            score += 0.4
        
        # 检查引用格式
        citations = len(re.findall(r'\[\d+\]|\([^)]+\d{4}\)', content))
        if citations > 0:
            score += 0.3
        
        # 检查参考部分
        has_reference_section = bool(re.search(r'参考|引用|文献|参考资料', content[-200:]))
        if has_reference_section:
            score += 0.3
        
        if links == 0 and len(content) > 200:
            suggestions.append("添加相关的外部链接")
        
        if citations == 0 and len(content) > 300:
            suggestions.append("添加适当的引用和参考文献")
        
        return QualityMetric(
            name="参考文献",
            score=score,
            max_score=1.0,
            description="引用和参考资料的质量",
            suggestions=suggestions
        )
    
    def _check_objectivity(self, content: str) -> QualityMetric:
        """检查客观性"""
        score = 0.0
        suggestions = []
        
        # 检查主观表述
        subjective_phrases = len(re.findall(r'我认为|在我看来|显然|毫无疑问', content))
        if subjective_phrases == 0:
            score += 0.4
        elif subjective_phrases <= 2:
            score += 0.2
        
        # 检查多角度呈现
        perspective_markers = len(re.search(r'另一方面|同时|然而|从.*角度|不同观点', content))
        if perspective_markers > 0:
            score += 0.3
        
        # 检查平衡表述
        balanced_phrases = len(re.search(r'既有.*也有|不仅.*而且|一方面.*另一方面', content))
        if balanced_phrases > 0:
            score += 0.3
        
        if subjective_phrases > 3:
            suggestions.append("减少主观表述，保持客观中立")
        
        if perspective_markers == 0 and len(content) > 300:
            suggestions.append("考虑从多个角度呈现观点")
        
        return QualityMetric(
            name="客观性",
            score=score,
            max_score=1.0,
            description="内容的客观性和中立性",
            suggestions=suggestions
        )
    
    def _generate_suggestions(self, metrics: Dict[str, QualityMetric]) -> List[str]:
        """生成改进建议"""
        suggestions = []
        
        for metric_name, metric in metrics.items():
            if metric.score < 0.6:
                suggestions.extend(metric.suggestions)
        
        # 去重
        return list(set(suggestions))
    
    def _identify_issues(self, metrics: Dict[str, QualityMetric]) -> List[str]:
        """识别主要问题"""
        issues = []
        
        for metric_name, metric in metrics.items():
            if metric.score < 0.4:
                issues.append(f"{metric.name}需要显著改进")
            elif metric.score < 0.6:
                issues.append(f"{metric.name}有待提升")
        
        return issues
    
    def _identify_strengths(self, metrics: Dict[str, QualityMetric]) -> List[str]:
        """识别优势"""
        strengths = []
        
        for metric_name, metric in metrics.items():
            if metric.score >= 0.8:
                strengths.append(f"{metric.name}表现优秀")
            elif metric.score >= 0.6:
                strengths.append(f"{metric.name}表现良好")
        
        return strengths
    
    def generate_report(self, results: Dict[str, Any]) -> str:
        """生成质量报告"""
        report = []
        report.append("# Wiki内容质量报告\n")
        
        # 总体评分
        overall_score = results['overall_score']
        report.append(f"## 总体评分: {overall_score:.2f}/1.00\n")
        
        if overall_score >= 0.8:
            report.append("评价: 优秀 ✅")
        elif overall_score >= 0.6:
            report.append("评价: 良好 👍")
        elif overall_score >= 0.4:
            report.append("评价: 一般 ⚠️")
        else:
            report.append("评价: 需要改进 ❌")
        
        report.append("")
        
        # 详细指标
        report.append("## 详细指标\n")
        for metric_name, metric in results['metrics'].items():
            report.append(f"### {metric.name}: {metric.score:.2f}/1.00")
            
            # 进度条
            bar_length = 20
            filled_length = int(metric.score * bar_length)
            bar = '█' * filled_length + '░' * (bar_length - filled_length)
            report.append(f"`{bar}` {metric.score * 100:.0f}%")
            
            if metric.suggestions:
                report.append("**建议:**")
                for suggestion in metric.suggestions:
                    report.append(f"- {suggestion}")
            
            report.append("")
        
        # 优势总结
        if results['strengths']:
            report.append("## 内容优势 ✨\n")
            for strength in results['strengths']:
                report.append(f"- {strength}")
            report.append("")
        
        # 问题总结
        if results['issues']:
            report.append("## 主要问题 ⚠️\n")
            for issue in results['issues']:
                report.append(f"- {issue}")
            report.append("")
        
        # 改进建议
        if results['suggestions']:
            report.append("## 改进建议 💡\n")
            for suggestion in results['suggestions']:
                report.append(f"- {suggestion}")
            report.append("")
        
        return "\n".join(report)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python quality_checker.py --content '内容文本'")
        print("       python quality_checker.py --file '文件路径'")
        print("       python quality_checker.py --topic '主题' --file '文件路径'")
        sys.exit(1)
    
    checker = QualityChecker()
    
    # 解析参数
    content = ""
    topic = ""
    
    if sys.argv[1] == "--content":
        content = sys.argv[2]
    elif sys.argv[1] == "--file":
        filename = sys.argv[2]
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查是否有主题参数
        if len(sys.argv) > 3 and sys.argv[3] == "--topic":
            topic = sys.argv[4]
    
    # 执行质量检查
    results = checker.check_content(content, topic)
    
    # 生成报告
    report = checker.generate_report(results)
    
    # 输出报告
    print(report)
    
    # 保存报告
    with open("quality_report.md", 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 保存详细结果
    with open("quality_results.json", 'w', encoding='utf-8') as f:
        # 转换QualityMetric对象为字典
        serializable_results = {
            'overall_score': results['overall_score'],
            'metrics': {
                name: {
                    'name': metric.name,
                    'score': metric.score,
                    'max_score': metric.max_score,
                    'description': metric.description,
                    'suggestions': metric.suggestions
                }
                for name, metric in results['metrics'].items()
            },
            'suggestions': results['suggestions'],
            'issues': results['issues'],
            'strengths': results['strengths']
        }
        json.dump(serializable_results, f, ensure_ascii=False, indent=2)
    
    print("\n质量报告已保存到 quality_report.md")
    print("详细结果已保存到 quality_results.json")

if __name__ == "__main__":
    main()