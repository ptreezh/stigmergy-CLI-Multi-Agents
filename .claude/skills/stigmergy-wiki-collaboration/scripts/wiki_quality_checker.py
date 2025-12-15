#!/usr/bin/env python3
"""
Stigmergy Wiki质量检查器
评估Wiki内容质量、协作效果、专业准确性
"""

import json
import re
import sys
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime

@dataclass
class QualityMetric:
    """质量指标数据结构"""
    name: str
    score: float
    max_score: float
    description: str
    issues: List[str]
    suggestions: List[str]

@dataclass
class QualityReport:
    """质量报告数据结构"""
    topic: str
    overall_score: float
    content_quality: QualityMetric
    collaboration_quality: QualityMetric
    technical_quality: QualityMetric
    accessibility_quality: QualityMetric
    recommendations: List[str]
    checked_at: datetime

class WikiQualityChecker:
    """Wiki质量检查器主类"""
    
    def __init__(self):
        self.quality_weights = {
            'content': 0.35,
            'collaboration': 0.25,
            'technical': 0.25,
            'accessibility': 0.15
        }
        
        self.quality_thresholds = {
            'excellent': 0.9,
            'good': 0.75,
            'acceptable': 0.6,
            'poor': 0.4
        }
    
    def check_quality(self, topic: str, content: str, metadata: Dict[str, Any] = None) -> QualityReport:
        """检查Wiki质量"""
        metadata = metadata or {}
        
        # 内容质量检查
        content_quality = self._check_content_quality(content)
        
        # 协作质量检查
        collaboration_quality = self._check_collaboration_quality(metadata)
        
        # 技术质量检查
        technical_quality = self._check_technical_quality(content, metadata)
        
        # 可访问性质量检查
        accessibility_quality = self._check_accessibility_quality(content)
        
        # 计算总分
        overall_score = (
            content_quality.score * self.quality_weights['content'] +
            collaboration_quality.score * self.quality_weights['collaboration'] +
            technical_quality.score * self.quality_weights['technical'] +
            accessibility_quality.score * self.quality_weights['accessibility']
        )
        
        # 生成建议
        recommendations = self._generate_recommendations([
            content_quality, collaboration_quality, technical_quality, accessibility_quality
        ])
        
        return QualityReport(
            topic=topic,
            overall_score=overall_score,
            content_quality=content_quality,
            collaboration_quality=collaboration_quality,
            technical_quality=technical_quality,
            accessibility_quality=accessibility_quality,
            recommendations=recommendations,
            checked_at=datetime.now()
        )
    
    def _check_content_quality(self, content: str) -> QualityMetric:
        """检查内容质量"""
        score = 0.0
        issues = []
        suggestions = []
        
        # 内容长度检查
        if len(content) < 200:
            issues.append("内容过短，可能缺乏深度")
            suggestions.append("扩展内容，增加更多详细信息")
        elif len(content) > 10000:
            issues.append("内容过长，可能影响可读性")
            suggestions.append("考虑拆分内容或精简表达")
        else:
            score += 0.2
        
        # 结构完整性检查
        headers = re.findall(r'^#+\s+(.+)$', content, re.MULTILINE)
        if len(headers) < 3:
            issues.append("章节结构不完整")
            suggestions.append("增加更多章节标题来组织内容")
        elif len(headers) > 15:
            issues.append("章节过多，可能过于分散")
            suggestions.append("合并相关章节，简化结构")
        else:
            score += 0.2
        
        # 列表项检查
        list_items = re.findall(r'^\s*[-*+]\s+(.+)$', content, re.MULTILINE)
        if len(list_items) < 5:
            issues.append("列表项较少，内容组织性不足")
            suggestions.append("使用列表来组织要点信息")
        else:
            score += 0.1
        
        # 代码示例检查
        code_blocks = re.findall(r'```[\w]*\n.*?```', content, re.DOTALL)
        if '代码' in content or '编程' in content or '技术' in content:
            if len(code_blocks) == 0:
                issues.append("技术内容缺少代码示例")
                suggestions.append("添加代码示例来支持技术说明")
            else:
                score += 0.1
        
        # 链接检查
        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        if len(links) == 0 and len(content) > 1000:
            issues.append("缺少相关链接和参考资料")
            suggestions.append("添加相关链接和参考资料")
        else:
            score += 0.1
        
        # 语言表达检查
        if self._has_repetitive_phrases(content):
            issues.append("存在重复表达")
            suggestions.append("优化语言表达，避免重复")
        else:
            score += 0.1
        
        # 专业术语检查
        if self._has_undefined_terms(content):
            issues.append("存在未解释的专业术语")
            suggestions.append("为专业术语添加解释")
        else:
            score += 0.1
        
        # 逻辑连贯性检查
        if self._has_logical_gaps(content):
            issues.append("内容逻辑存在跳跃")
            suggestions.append("改善内容逻辑连贯性")
        else:
            score += 0.1
        
        return QualityMetric(
            name="内容质量",
            score=score,
            max_score=1.0,
            description="内容的完整性、结构性和表达质量",
            issues=issues,
            suggestions=suggestions
        )
    
    def _check_collaboration_quality(self, metadata: Dict[str, Any]) -> QualityMetric:
        """检查协作质量"""
        score = 0.0
        issues = []
        suggestions = []
        
        # 协作者数量检查
        collaborators = metadata.get('collaborators', [])
        if len(collaborators) < 2:
            issues.append("协作者数量不足")
            suggestions.append("邀请更多协作者参与编辑")
        elif len(collaborators) > 10:
            issues.append("协作者过多，可能导致协调困难")
            suggestions.append("考虑设立核心协作者团队")
        else:
            score += 0.3
        
        # 编辑频率检查
        edit_history = metadata.get('edit_history', [])
        if len(edit_history) < 5:
            issues.append("编辑次数较少，协作活跃度不足")
            suggestions.append("增加编辑频率，提高协作活跃度")
        else:
            score += 0.2
        
        # 编辑分布检查
        if edit_history:
            user_edits = {}
            for edit in edit_history:
                user = edit.get('user_id', 'unknown')
                user_edits[user] = user_edits.get(user, 0) + 1
            
            if len(user_edits) == 1:
                issues.append("编辑过于集中，缺乏多元视角")
                suggestions.append("鼓励更多用户参与编辑")
            elif max(user_edits.values()) / sum(user_edits.values()) > 0.8:
                issues.append("主要用户编辑占比过高")
                suggestions.append("平衡编辑贡献分布")
            else:
                score += 0.2
        
        # 冲突解决检查
        conflicts = metadata.get('conflicts', [])
        unresolved_conflicts = [c for c in conflicts if not c.get('resolved', True)]
        if len(unresolved_conflicts) > 0:
            issues.append(f"存在{len(unresolved_conflicts)}个未解决的冲突")
            suggestions.append("及时解决编辑冲突")
        else:
            score += 0.1
        
        # 版本控制检查
        versions = metadata.get('versions', [])
        if len(versions) < 2:
            issues.append("版本控制不完善")
            suggestions.append("建立完善的版本控制机制")
        else:
            score += 0.1
        
        # 反馈机制检查
        feedback = metadata.get('feedback', [])
        if len(feedback) == 0:
            issues.append("缺少反馈机制")
            suggestions.append("建立用户反馈收集机制")
        else:
            score += 0.1
        
        return QualityMetric(
            name="协作质量",
            score=score,
            max_score=1.0,
            description="多用户协作的有效性和活跃度",
            issues=issues,
            suggestions=suggestions
        )
    
    def _check_technical_quality(self, content: str, metadata: Dict[str, Any]) -> QualityMetric:
        """检查技术质量"""
        score = 0.0
        issues = []
        suggestions = []
        
        # 格式规范检查
        if not self._has_proper_formatting(content):
            issues.append("格式不规范")
            suggestions.append("按照标准格式组织内容")
        else:
            score += 0.2
        
        # 标题层级检查
        if not self._has_proper_heading_hierarchy(content):
            issues.append("标题层级不规范")
            suggestions.append("使用正确的标题层级结构")
        else:
            score += 0.2
        
        # 代码质量检查
        code_blocks = re.findall(r'```[\w]*\n(.*?)```', content, re.DOTALL)
        for code in code_blocks:
            if not self._is_valid_code(code):
                issues.append("存在代码质量问题")
                suggestions.append("检查并修正代码示例")
                break
        else:
            if code_blocks:
                score += 0.2
        
        # 链接有效性检查
        links = re.findall(r'\[([^\]]+)\]\(([^)]+)\)', content)
        broken_links = []
        for text, url in links:
            if not self._is_valid_url(url):
                broken_links.append(url)
        
        if broken_links:
            issues.append(f"存在{len(broken_links)}个无效链接")
            suggestions.append("修复或移除无效链接")
        else:
            if links:
                score += 0.1
        
        # 图片和媒体检查
        images = re.findall(r'!\[([^\]]*)\]\(([^)]+)\)', content)
        if images:
            if not self._has_image_alt_text(images):
                issues.append("部分图片缺少alt文本")
                suggestions.append("为所有图片添加描述性alt文本")
            else:
                score += 0.1
        
        # 表格格式检查
        tables = re.findall(r'\|(.+)\|\n\|[-\s|]+\|', content)
        if tables:
            if not self._has_proper_table_format(content):
                issues.append("表格格式不规范")
                suggestions.append("使用标准Markdown表格格式")
            else:
                score += 0.1
        
        # 性能检查
        if len(content) > 5000:
            if not self._has_content_summary(content):
                issues.append("长内容缺少摘要")
                suggestions.append("添加内容摘要或目录")
            else:
                score += 0.1
        
        return QualityMetric(
            name="技术质量",
            score=score,
            max_score=1.0,
            description="技术实现的规范性和正确性",
            issues=issues,
            suggestions=suggestions
        )
    
    def _check_accessibility_quality(self, content: str) -> QualityMetric:
        """检查可访问性质量"""
        score = 0.0
        issues = []
        suggestions = []
        
        # 标题结构检查
        if not self._has_skip_links(content):
            issues.append("缺少跳转链接")
            suggestions.append("添加内容目录和跳转链接")
        else:
            score += 0.3
        
        # 语言表达检查
        if self._has_complex_language(content):
            issues.append("语言表达过于复杂")
            suggestions.append("简化语言表达，提高可读性")
        else:
            score += 0.2
        
        # 色色对比度检查
        if self._has_poor_color_contrast(content):
            issues.append("可能存在颜色对比度问题")
            suggestions.append("确保足够的颜色对比度")
        else:
            score += 0.2
        
        # 键盘导航检查
        if self._has_keyboard_navigation_issues(content):
            issues.append("可能存在键盘导航问题")
            suggestions.append("确保键盘导航可用性")
        else:
            score += 0.1
        
        # 多媒体替代文本检查
        if not self._has_media_alternatives(content):
            issues.append("多媒体内容缺少替代文本")
            suggestions.append("为多媒体内容提供替代方案")
        else:
            score += 0.1
        
        # 国际化检查
        if not self._has_i18n_support(content):
            issues.append("缺乏国际化支持")
            suggestions.append("考虑多语言支持")
        else:
            score += 0.1
        
        return QualityMetric(
            name="可访问性质量",
            score=score,
            max_score=1.0,
            description="内容的可访问性和包容性",
            issues=issues,
            suggestions=suggestions
        )
    
    def _has_repetitive_phrases(self, content: str) -> bool:
        """检查是否有重复表达"""
        sentences = re.split(r'[。！？]', content)
        phrases = {}
        
        for sentence in sentences:
            words = sentence.split()
            for i in range(len(words) - 1):
                phrase = ' '.join(words[i:i+2])
                phrases[phrase] = phrases.get(phrase, 0) + 1
        
        return any(count > 3 for count in phrases.values())
    
    def _has_undefined_terms(self, content: str) -> bool:
        """检查是否有未解释的专业术语"""
        # 简单实现：检查大写术语是否在附近有解释
        terms = re.findall(r'[A-Z][a-z]+(?:[A-Z][a-z]+)+', content)
        
        for term in terms:
            # 检查术语附近是否有解释
            term_pattern = re.compile(re.escape(term))
            matches = list(term_pattern.finditer(content))
            
            for match in matches:
                start = max(0, match.start() - 50)
                end = min(len(content), match.end() + 50)
                context = content[start:end]
                
                if ('是' in context or '指' in context or '即' in context):
                    break
            else:
                return True
        
        return False
    
    def _has_logical_gaps(self, content: str) -> bool:
        """检查是否有逻辑跳跃"""
        # 简单实现：检查段落间的逻辑连接词
        paragraphs = content.split('\n\n')
        connection_words = ['因此', '所以', '然而', '但是', '另外', '此外', '首先', '其次', '最后']
        
        for i in range(len(paragraphs) - 1):
            current = paragraphs[i]
            next_para = paragraphs[i + 1]
            
            # 检查段落间是否有逻辑连接
            has_connection = any(word in current or word in next_para for word in connection_words)
            
            if not has_connection and len(current) > 100 and len(next_para) > 100:
                return True
        
        return False
    
    def _has_proper_formatting(self, content: str) -> bool:
        """检查格式是否规范"""
        # 检查基本的Markdown格式
        has_headers = bool(re.search(r'^#+\s+', content, re.MULTILINE))
        has_paragraphs = len(content.split('\n\n')) > 1
        has_lists = bool(re.search(r'^\s*[-*+]\s+', content, re.MULTILINE))
        
        return has_headers and has_paragraphs
    
    def _has_proper_heading_hierarchy(self, content: str) -> bool:
        """检查标题层级是否规范"""
        headers = re.findall(r'^(#+)\s+(.+)$', content, re.MULTILINE)
        
        if not headers:
            return True
        
        # 检查标题层级是否跳跃
        levels = [len(header[0]) for header in headers]
        
        for i in range(1, len(levels)):
            if levels[i] - levels[i-1] > 1:
                return False
        
        return True
    
    def _is_valid_code(self, code: str) -> bool:
        """检查代码是否有效"""
        # 简单的代码有效性检查
        if not code.strip():
            return False
        
        # 检查是否有明显的语法错误
        brackets = {'(': ')', '[': ']', '{': '}'}
        stack = []
        
        for char in code:
            if char in brackets:
                stack.append(char)
            elif char in brackets.values():
                if not stack or brackets[stack.pop()] != char:
                    return False
        
        return not stack
    
    def _is_valid_url(self, url: str) -> bool:
        """检查URL是否有效"""
        import re
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        return url_pattern.match(url) is not None
    
    def _has_image_alt_text(self, images: List[Tuple[str, str]]) -> bool:
        """检查图片是否有alt文本"""
        return all(alt.strip() for alt, url in images)
    
    def _has_proper_table_format(self, content: str) -> bool:
        """检查表格格式是否规范"""
        table_pattern = re.compile(r'\|(.+)\|\n\|[-\s|]+\|((?:\n\|.+\|)*)', re.MULTILINE)
        tables = table_pattern.findall(content)
        
        for table in tables:
            header = table[0].split('|')
            if len(header) < 2:
                return False
        
        return True
    
    def _has_content_summary(self, content: str) -> bool:
        """检查是否有内容摘要"""
        # 检查开头是否有概述或目录
        first_lines = content.split('\n')[:10]
        
        for line in first_lines:
            if any(keyword in line for keyword in ['概述', '简介', '目录', '总结', '摘要']):
                return True
        
        return False
    
    def _has_skip_links(self, content: str) -> bool:
        """检查是否有跳转链接"""
        # 检查是否有目录或内部链接
        internal_links = re.findall(r'\[([^\]]+)\]\(#([^)]+)\)', content)
        return len(internal_links) > 0
    
    def _has_complex_language(self, content: str) -> bool:
        """检查语言是否过于复杂"""
        # 简单检查：句子长度和复杂词汇
        sentences = re.split(r'[。！？]', content)
        long_sentences = sum(1 for s in sentences if len(s) > 50)
        
        return long_sentences / max(len(sentences), 1) > 0.3
    
    def _has_poor_color_contrast(self, content: str) -> bool:
        """检查是否有颜色对比度问题"""
        # 简单检查：是否提到了颜色但没有考虑对比度
        color_words = ['红色', '绿色', '蓝色', '黄色', '黑色', '白色']
        has_colors = any(word in content for word in color_words)
        
        return has_colors and '对比度' not in content
    
    def _has_keyboard_navigation_issues(self, content: str) -> bool:
        """检查是否有键盘导航问题"""
        # 简单检查：是否有交互元素但没有键盘支持说明
        has_interactive = '点击' in content or '按钮' in content
        has_keyboard = '键盘' in content or 'Tab' in content
        
        return has_interactive and not has_keyboard
    
    def _has_media_alternatives(self, content: str) -> bool:
        """检查是否有媒体替代方案"""
        # 检查图片和视频是否有替代文本
        images = re.findall(r'!\[([^\]]*)\]', content)
        videos = re.findall(r'\[([^\]]*)\]\(([^)]*\.mp4)\)', content)
        
        return all(alt.strip() for alt in images) and len(videos) == 0
    
    def _has_i18n_support(self, content: str) -> bool:
        """检查是否有国际化支持"""
        # 简单检查：是否提到了多语言支持
        return '多语言' in content or '国际化' in content or 'i18n' in content
    
    def _generate_recommendations(self, metrics: List[QualityMetric]) -> List[str]:
        """生成改进建议"""
        recommendations = []
        
        # 收集所有建议
        all_suggestions = []
        for metric in metrics:
            all_suggestions.extend(metric.suggestions)
        
        # 去重并排序
        unique_suggestions = list(set(all_suggestions))
        
        # 按重要性排序
        priority_keywords = ['增加', '添加', '建立', '完善', '优化', '改进']
        prioritized = []
        
        for suggestion in unique_suggestions:
            priority = sum(1 for keyword in priority_keywords if keyword in suggestion)
            prioritized.append((priority, suggestion))
        
        prioritized.sort(key=lambda x: x[0], reverse=True)
        
        # 取前10个最重要的建议
        recommendations = [suggestion for _, suggestion in prioritized[:10]]
        
        return recommendations
    
    def generate_quality_report(self, report: QualityReport) -> str:
        """生成质量报告"""
        report_lines = []
        report_lines.append(f"# {report.topic} - Wiki质量报告\n")
        
        # 总体评分
        report_lines.append("## 总体评分\n")
        report_lines.append(f"**综合得分**: {report.overall_score:.2f}/1.00")
        
        # 评级
        if report.overall_score >= self.quality_thresholds['excellent']:
            grade = "优秀 ✅"
        elif report.overall_score >= self.quality_thresholds['good']:
            grade = "良好 👍"
        elif report.overall_score >= self.quality_thresholds['acceptable']:
            grade = "可接受 ⚠️"
        else:
            grade = "需要改进 ❌"
        
        report_lines.append(f"**质量等级**: {grade}\n")
        
        # 各项指标
        metrics = [
            ("内容质量", report.content_quality),
            ("协作质量", report.collaboration_quality),
            ("技术质量", report.technical_quality),
            ("可访问性质量", report.accessibility_quality)
        ]
        
        for name, metric in metrics:
            report_lines.append(f"## {name}\n")
            report_lines.append(f"**得分**: {metric.score:.2f}/1.00")
            
            # 进度条
            bar_length = 20
            filled_length = int(metric.score * bar_length)
            bar = '█' * filled_length + '░' * (bar_length - filled_length)
            report_lines.append(f"`{bar}` {metric.score * 100:.0f}%")
            
            # 问题和建议
            if metric.issues:
                report_lines.append("**问题**:")
                for issue in metric.issues:
                    report_lines.append(f"- {issue}")
            
            if metric.suggestions:
                report_lines.append("**建议**:")
                for suggestion in metric.suggestions:
                    report_lines.append(f"- {suggestion}")
            
            report_lines.append("")
        
        # 改进建议
        if report.recommendations:
            report_lines.append("## 优先改进建议\n")
            for i, recommendation in enumerate(report.recommendations, 1):
                report_lines.append(f"{i}. {recommendation}")
            report_lines.append("")
        
        # 检查信息
        report_lines.append("## 检查信息\n")
        report_lines.append(f"**检查时间**: {report.checked_at.strftime('%Y-%m-%d %H:%M:%S')}")
        report_lines.append(f"**检查主题**: {report.topic}")
        report_lines.append("")
        
        return "\n".join(report_lines)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python wiki_quality_checker.py --topic '主题' --file '文件路径'")
        print("       python wiki_quality_checker.py --topic '主题' --content '内容'")
        print("       python wiki_quality_checker.py --all '目录路径'")
        sys.exit(1)
    
    checker = WikiQualityChecker()
    
    if sys.argv[1] == "--topic":
        topic = sys.argv[2]
        
        if sys.argv[3] == "--file":
            # 从文件读取内容
            file_path = sys.argv[4]
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 尝试读取元数据
            metadata_path = file_path.replace('.md', '_metadata.json')
            metadata = {}
            if Path(metadata_path).exists():
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)
            
        elif sys.argv[3] == "--content":
            # 直接使用内容
            content = sys.argv[4]
            metadata = {}
        
        else:
            print("参数错误")
            sys.exit(1)
        
        # 执行质量检查
        report = checker.check_quality(topic, content, metadata)
        
        # 生成报告
        report_text = checker.generate_quality_report(report)
        
        # 输出报告
        print(report_text)
        
        # 保存报告
        report_file = f"{topic.replace(' ', '_')}_quality_report.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_text)
        
        print(f"\n质量报告已保存到 {report_file}")
        
        # 保存详细数据
        data_file = f"{topic.replace(' ', '_')}_quality_data.json"
        with open(data_file, 'w', encoding='utf-8') as f:
            json.dump({
                'topic': report.topic,
                'overall_score': report.overall_score,
                'content_quality': {
                    'score': report.content_quality.score,
                    'issues': report.content_quality.issues,
                    'suggestions': report.content_quality.suggestions
                },
                'collaboration_quality': {
                    'score': report.collaboration_quality.score,
                    'issues': report.collaboration_quality.issues,
                    'suggestions': report.collaboration_quality.suggestions
                },
                'technical_quality': {
                    'score': report.technical_quality.score,
                    'issues': report.technical_quality.issues,
                    'suggestions': report.technical_quality.suggestions
                },
                'accessibility_quality': {
                    'score': report.accessibility_quality.score,
                    'issues': report.accessibility_quality.issues,
                    'suggestions': report.accessibility_quality.suggestions
                },
                'recommendations': report.recommendations,
                'checked_at': report.checked_at.isoformat()
            }, f, ensure_ascii=False, indent=2)
        
        print(f"详细数据已保存到 {data_file}")
    
    elif sys.argv[1] == "--all":
        # 批量检查
        directory = sys.argv[2]
        
        # 查找所有Markdown文件
        md_files = list(Path(directory).glob("**/*.md"))
        
        if not md_files:
            print("未找到Markdown文件")
            sys.exit(1)
        
        # 汇总报告
        summary_report = ["# Wiki质量检查汇总报告\n"]
        summary_report.append(f"检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        summary_report.append(f"检查文件数: {len(md_files)}\n")
        
        all_scores = []
        
        for md_file in md_files:
            try:
                with open(md_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                topic = md_file.stem
                report = checker.check_quality(topic, content)
                all_scores.append(report.overall_score)
                
                summary_report.append(f"### {topic}")
                summary_report.append(f"- 得分: {report.overall_score:.2f}/1.00")
                summary_report.append(f"- 主要问题: {len(report.content_quality.issues + report.collaboration_quality.issues + report.technical_quality.issues + report.accessibility_quality.issues)}")
                summary_report.append("")
                
            except Exception as e:
                summary_report.append(f"### {md_file.name}")
                summary_report.append(f"- 检查失败: {str(e)}")
                summary_report.append("")
        
        # 统计信息
        if all_scores:
            avg_score = sum(all_scores) / len(all_scores)
            summary_report.append("## 统计信息\n")
            summary_report.append(f"- 平均得分: {avg_score:.2f}/1.00")
            summary_report.append(f"- 最高得分: {max(all_scores):.2f}/1.00")
            summary_report.append(f"- 最低得分: {min(all_scores):.2f}/1.00")
            summary_report.append("")
        
        # 输出汇总报告
        print("\n".join(summary_report))
        
        # 保存汇总报告
        with open("wiki_quality_summary.md", 'w', encoding='utf-8') as f:
            f.write("\n".join(summary_report))
        
        print(f"\n汇总报告已保存到 wiki_quality_summary.md")
    
    else:
        print("参数错误")

if __name__ == "__main__":
    main()