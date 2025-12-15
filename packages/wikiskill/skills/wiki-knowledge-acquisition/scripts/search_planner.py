#!/usr/bin/env python3
"""
Wiki搜索规划器
制定智能化的搜索策略和计划
"""

import json
import re
import sys
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime, timedelta

@dataclass
class SearchPlan:
    """搜索计划数据结构"""
    topic: str
    search_type: str
    keywords: List[str]
    sources: List[str]
    strategies: List[str]
    filters: Dict[str, Any]
    timeline: str
    priority: int

class SearchPlanner:
    """搜索规划器主类"""
    
    def __init__(self):
        self.search_types = {
            'academic': {
                'sources': ['google_scholar', 'arxiv', 'ieee', 'pubmed', 'acm'],
                'strategies': ['exact_phrase', 'boolean_search', 'citation_analysis'],
                'filters': {'year_range': 5, 'peer_reviewed': True}
            },
            'technical': {
                'sources': ['official_docs', 'github', 'stackoverflow', 'medium', 'devblogs'],
                'strategies': ['site_search', 'code_examples', 'api_reference'],
                'filters': {'updated_within': 2, 'min_stars': 10}
            },
            'practical': {
                'sources': ['forums', 'reddit', 'quora', 'case_studies', 'blogs'],
                'strategies': ['experience_search', 'problem_solution', 'best_practices'],
                'filters': {'min_answers': 3, 'recent_activity': True}
            },
            'general': {
                'sources': ['web_search', 'wikipedia', 'news', 'reports'],
                'strategies': ['broad_search', 'trending_topics', 'comprehensive'],
                'filters': {'language': 'en', 'safe_search': True}
            }
        }
        
        self.keyword_generators = {
            'academic': self._generate_academic_keywords,
            'technical': self._generate_technical_keywords,
            'practical': self._generate_practical_keywords,
            'general': self._generate_general_keywords
        }
    
    def create_search_plan(self, topic: str, search_type: str = "") -> SearchPlan:
        """创建搜索计划"""
        # 确定搜索类型
        if not search_type:
            search_type = self._determine_search_type(topic)
        
        # 生成关键词
        keywords = self._generate_keywords(topic, search_type)
        
        # 选择搜索源
        sources = self._select_sources(search_type, keywords)
        
        # 制定搜索策略
        strategies = self._select_strategies(search_type, keywords)
        
        # 设置过滤条件
        filters = self._set_filters(search_type)
        
        # 确定时间范围
        timeline = self._determine_timeline(search_type)
        
        # 计算优先级
        priority = self._calculate_priority(topic, search_type)
        
        return SearchPlan(
            topic=topic,
            search_type=search_type,
            keywords=keywords,
            sources=sources,
            strategies=strategies,
            filters=filters,
            timeline=timeline,
            priority=priority
        )
    
    def _determine_search_type(self, topic: str) -> str:
        """确定搜索类型"""
        topic_lower = topic.lower()
        
        academic_indicators = ['研究', '论文', '学术', '理论', '方法', '分析', '实验']
        technical_indicators = ['技术', '开发', '编程', '系统', '架构', '工具', '框架']
        practical_indicators = ['实践', '案例', '经验', '问题', '解决方案', '最佳实践']
        
        scores = {
            'academic': sum(1 for indicator in academic_indicators if indicator in topic_lower),
            'technical': sum(1 for indicator in technical_indicators if indicator in topic_lower),
            'practical': sum(1 for indicator in practical_indicators if indicator in topic_lower)
        }
        
        if max(scores.values()) == 0:
            return 'general'
        
        return max(scores, key=scores.get)
    
    def _generate_keywords(self, topic: str, search_type: str) -> List[str]:
        """生成搜索关键词"""
        generator = self.keyword_generators.get(search_type, self._generate_general_keywords)
        return generator(topic)
    
    def _generate_academic_keywords(self, topic: str) -> List[str]:
        """生成学术搜索关键词"""
        keywords = []
        
        # 基础关键词
        base_keywords = topic.split()
        keywords.extend(base_keywords)
        
        # 学术修饰词
        academic_modifiers = ['research', 'study', 'analysis', 'method', 'approach', 'theory', 'framework']
        for modifier in academic_modifiers:
            for keyword in base_keywords[:2]:  # 只与前两个关键词组合
                keywords.append(f"{keyword} {modifier}")
        
        # 领域限定词
        domain_qualifiers = ['recent', 'latest', 'current', 'emerging', 'state-of-the-art']
        for qualifier in domain_qualifiers:
            keywords.append(f"{qualifier} {topic}")
        
        # 方法论关键词
        methodology_keywords = ['systematic review', 'meta-analysis', 'empirical study', 'case study']
        for method in methodology_keywords:
            keywords.append(f"{topic} {method}")
        
        return list(set(keywords))  # 去重
    
    def _generate_technical_keywords(self, topic: str) -> List[str]:
        """生成技术搜索关键词"""
        keywords = []
        
        # 基础关键词
        base_keywords = topic.split()
        keywords.extend(base_keywords)
        
        # 技术修饰词
        technical_modifiers = ['tutorial', 'guide', 'documentation', 'implementation', 'example', 'code']
        for modifier in technical_modifiers:
            for keyword in base_keywords[:2]:
                keywords.append(f"{keyword} {modifier}")
        
        # 实现相关词
        implementation_keywords = ['how to', 'best practices', 'optimization', 'performance', 'architecture']
        for impl in implementation_keywords:
            keywords.append(f"{topic} {impl}")
        
        # 工具和平台
        tool_keywords = ['open source', 'framework', 'library', 'tool', 'platform', 'solution']
        for tool in tool_keywords:
            keywords.append(f"{topic} {tool}")
        
        return list(set(keywords))
    
    def _generate_practical_keywords(self, topic: str) -> List[str]:
        """生成实践搜索关键词"""
        keywords = []
        
        # 基础关键词
        base_keywords = topic.split()
        keywords.extend(base_keywords)
        
        # 问题导向词
        problem_keywords = ['problem', 'challenge', 'issue', 'solution', 'fix', 'troubleshoot']
        for problem in problem_keywords:
            for keyword in base_keywords[:2]:
                keywords.append(f"{keyword} {problem}")
        
        # 经验相关词
        experience_keywords = ['experience', 'lessons learned', 'case study', 'real world', 'practical']
        for exp in experience_keywords:
            keywords.append(f"{topic} {exp}")
        
        # 社区相关词
        community_keywords = ['discussion', 'forum', 'reddit', 'stackoverflow', 'community']
        for comm in community_keywords:
            keywords.append(f"{topic} {comm}")
        
        return list(set(keywords))
    
    def _generate_general_keywords(self, topic: str) -> List[str]:
        """生成通用搜索关键词"""
        keywords = []
        
        # 基础关键词
        base_keywords = topic.split()
        keywords.extend(base_keywords)
        
        # 通用修饰词
        general_modifiers = ['overview', 'introduction', 'basics', 'fundamentals', 'getting started']
        for modifier in general_modifiers:
            keywords.append(f"{topic} {modifier}")
        
        # 综合搜索词
        comprehensive_keywords = ['comprehensive', 'complete', 'detailed', 'in-depth']
        for comp in comprehensive_keywords:
            keywords.append(f"{comp} {topic}")
        
        return list(set(keywords))
    
    def _select_sources(self, search_type: str, keywords: List[str]) -> List[str]:
        """选择搜索源"""
        sources = self.search_types.get(search_type, {}).get('sources', [])
        
        # 根据关键词特点调整源选择
        if any('code' in kw.lower() or 'programming' in kw.lower() for kw in keywords):
            if 'github' not in sources:
                sources.append('github')
        
        if any('research' in kw.lower() or 'paper' in kw.lower() for kw in keywords):
            if 'google_scholar' not in sources:
                sources.append('google_scholar')
        
        return sources
    
    def _select_strategies(self, search_type: str, keywords: List[str]) -> List[str]:
        """选择搜索策略"""
        strategies = self.search_types.get(search_type, {}).get('strategies', [])
        
        # 根据关键词数量和复杂度调整策略
        if len(keywords) > 10:
            if 'boolean_search' not in strategies:
                strategies.append('boolean_search')
        
        if any(len(kw.split()) > 2 for kw in keywords):
            if 'exact_phrase' not in strategies:
                strategies.append('exact_phrase')
        
        return strategies
    
    def _set_filters(self, search_type: str) -> Dict[str, Any]:
        """设置过滤条件"""
        base_filters = self.search_types.get(search_type, {}).get('filters', {})
        
        # 添加通用过滤条件
        base_filters.update({
            'max_results': 50,
            'language': 'en',
            'sort_by': 'relevance'
        })
        
        return base_filters
    
    def _determine_timeline(self, search_type: str) -> str:
        """确定时间范围"""
        timelines = {
            'academic': 'last_5_years',
            'technical': 'last_2_years',
            'practical': 'last_1_year',
            'general': 'last_3_years'
        }
        
        return timelines.get(search_type, 'last_3_years')
    
    def _calculate_priority(self, topic: str, search_type: str) -> int:
        """计算优先级"""
        base_priority = {
            'academic': 8,
            'technical': 7,
            'practical': 6,
            'general': 5
        }
        
        priority = base_priority.get(search_type, 5)
        
        # 根据主题复杂度调整
        if len(topic.split()) > 5:
            priority += 1
        
        # 根据主题特定性调整
        specific_terms = ['latest', 'current', 'new', 'recent', 'emerging']
        if any(term in topic.lower() for term in specific_terms):
            priority += 1
        
        return min(priority, 10)
    
    def generate_search_queries(self, plan: SearchPlan) -> List[Dict[str, Any]]:
        """生成具体搜索查询"""
        queries = []
        
        for keyword in plan.keywords[:10]:  # 限制关键词数量
            for strategy in plan.strategies:
                query = self._build_query(keyword, strategy, plan.filters)
                queries.append({
                    'query': query,
                    'keyword': keyword,
                    'strategy': strategy,
                    'sources': plan.sources,
                    'priority': plan.priority
                })
        
        # 按优先级排序
        queries.sort(key=lambda x: x['priority'], reverse=True)
        
        return queries
    
    def _build_query(self, keyword: str, strategy: str, filters: Dict[str, Any]) -> str:
        """构建搜索查询"""
        query = keyword
        
        # 应用策略
        if strategy == 'exact_phrase':
            query = f'"{keyword}"'
        elif strategy == 'boolean_search':
            terms = keyword.split()
            if len(terms) > 1:
                query = f'({terms[0]} AND {terms[1]})'
        elif strategy == 'site_search':
            query = f'{keyword} site:github.com'
        
        # 应用时间过滤
        if 'year_range' in filters:
            years = filters['year_range']
            current_year = datetime.now().year
            query += f' after:{current_year - years}'
        
        return query
    
    def generate_plan_report(self, plan: SearchPlan) -> str:
        """生成搜索计划报告"""
        report = []
        report.append(f"# {plan.topic} - 搜索计划\n")
        
        report.append("## 基本信息\n")
        report.append(f"- **搜索类型**: {plan.search_type}")
        report.append(f"- **时间范围**: {plan.timeline}")
        report.append(f"- **优先级**: {plan.priority}/10\n")
        
        report.append("## 搜索关键词\n")
        for i, keyword in enumerate(plan.keywords, 1):
            report.append(f"{i}. {keyword}")
        report.append("")
        
        report.append("## 搜索源\n")
        for source in plan.sources:
            report.append(f"- {source}")
        report.append("")
        
        report.append("## 搜索策略\n")
        for strategy in plan.strategies:
            report.append(f"- {strategy}")
        report.append("")
        
        report.append("## 过滤条件\n")
        for key, value in plan.filters.items():
            report.append(f"- {key}: {value}")
        report.append("")
        
        # 生成具体查询
        queries = self.generate_search_queries(plan)
        report.append("## 具体搜索查询\n")
        for i, query_info in enumerate(queries[:10], 1):  # 只显示前10个
            report.append(f"{i}. **查询**: `{query_info['query']}`")
            report.append(f"   - 策略: {query_info['strategy']}")
            report.append(f"   - 优先级: {query_info['priority']}")
            report.append("")
        
        return "\n".join(report)
    
    def export_to_json(self, plan: SearchPlan, filename: str):
        """导出为JSON格式"""
        queries = self.generate_search_queries(plan)
        
        data = {
            'topic': plan.topic,
            'search_type': plan.search_type,
            'keywords': plan.keywords,
            'sources': plan.sources,
            'strategies': plan.strategies,
            'filters': plan.filters,
            'timeline': plan.timeline,
            'priority': plan.priority,
            'queries': queries,
            'created_at': datetime.now().isoformat()
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python search_planner.py --topic '搜索主题' [--type '搜索类型']")
        sys.exit(1)
    
    planner = SearchPlanner()
    
    # 解析参数
    topic = ""
    search_type = ""
    
    if sys.argv[1] == "--topic":
        topic = sys.argv[2]
        
        if len(sys.argv) > 3 and sys.argv[3] == "--type":
            search_type = sys.argv[4]
    
    # 创建搜索计划
    plan = planner.create_search_plan(topic, search_type)
    
    # 生成报告
    report = planner.generate_plan_report(plan)
    
    # 输出报告
    print(report)
    
    # 保存报告
    with open("search_plan_report.md", 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 导出JSON
    planner.export_to_json(plan, "search_plan.json")
    
    print(f"\n搜索计划已保存到 search_plan_report.md")
    print("详细数据已保存到 search_plan.json")

if __name__ == "__main__":
    main()