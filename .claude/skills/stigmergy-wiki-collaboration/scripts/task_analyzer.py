#!/usr/bin/env python3
"""
Stigmergy Wiki任务分析器
深度分析用户Wiki任务需求，提供智能化的任务处理建议
"""

import json
import re
import sys
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime

@dataclass
class TaskAnalysis:
    """任务分析结果"""
    original_task: str
    task_type: str
    complexity: str
    domain: str
    collaborative: bool
    objectives: List[str]
    required_roles: List[str]
    knowledge_sources: List[str]
    estimated_time: str
    priority: int
    workflow: List[str]

class TaskAnalyzer:
    """任务分析器主类"""
    
    def __init__(self):
        self.task_patterns = {
            'create': ['创建', '建立', '新建', '生成', '制作'],
            'edit': ['编辑', '修改', '更新', '改进', '完善'],
            'integrate': ['整合', '集成', '合并', '汇总', '综合'],
            'analyze': ['分析', '研究', '评估', '审查', '检查'],
            'organize': ['组织', '整理', '归类', '规划', '架构']
        }
        
        self.complexity_indicators = {
            'simple': ['简单', '基础', '入门', '简介'],
            'medium': ['中等', '一般', '标准', '常规'],
            'complex': ['复杂', '高级', '深入', '全面', '系统']
        }
        
        self.domains = {
            'technical': ['技术', '编程', '开发', '系统', '架构', '算法'],
            'academic': ['学术', '研究', '理论', '论文', '学科', '方法'],
            'practical': ['实践', '应用', '案例', '经验', '操作', '流程'],
            'business': ['商业', '管理', '市场', '产品', '运营', '战略']
        }
    
    def analyze_task(self, task: str, collaborative: bool = False) -> TaskAnalysis:
        """分析任务需求"""
        # 确定任务类型
        task_type = self._determine_task_type(task)
        
        # 评估复杂度
        complexity = self._assess_complexity(task)
        
        # 识别领域
        domain = self._identify_domain(task)
        
        # 提取目标
        objectives = self._extract_objectives(task, task_type)
        
        # 确定所需角色
        required_roles = self._determine_required_roles(domain, complexity)
        
        # 识别知识源
        knowledge_sources = self._identify_knowledge_sources(domain, task_type)
        
        # 估算时间
        estimated_time = self._estimate_time(complexity, collaborative)
        
        # 计算优先级
        priority = self._calculate_priority(task_type, complexity, domain)
        
        # 生成工作流程
        workflow = self._generate_workflow(task_type, complexity, collaborative)
        
        return TaskAnalysis(
            original_task=task,
            task_type=task_type,
            complexity=complexity,
            domain=domain,
            collaborative=collaborative,
            objectives=objectives,
            required_roles=required_roles,
            knowledge_sources=knowledge_sources,
            estimated_time=estimated_time,
            priority=priority,
            workflow=workflow
        )
    
    def _determine_task_type(self, task: str) -> str:
        """确定任务类型"""
        task_lower = task.lower()
        scores = {}
        
        for task_type, indicators in self.task_patterns.items():
            score = sum(1 for indicator in indicators if indicator in task_lower)
            scores[task_type] = score
        
        if max(scores.values()) == 0:
            return 'general'
        
        return max(scores, key=scores.get)
    
    def _assess_complexity(self, task: str) -> str:
        """评估任务复杂度"""
        task_lower = task.lower()
        
        for complexity, indicators in self.complexity_indicators.items():
            if any(indicator in task_lower for indicator in indicators):
                return complexity
        
        # 基于任务长度和关键词判断
        if len(task) < 20:
            return 'simple'
        elif len(task) < 50:
            return 'medium'
        else:
            return 'complex'
    
    def _identify_domain(self, task: str) -> str:
        """识别领域"""
        task_lower = task.lower()
        scores = {}
        
        for domain, indicators in self.domains.items():
            score = sum(1 for indicator in indicators if indicator in task_lower)
            scores[domain] = score
        
        if max(scores.values()) == 0:
            return 'general'
        
        return max(scores, key=scores.get)
    
    def _extract_objectives(self, task: str, task_type: str) -> List[str]:
        """提取任务目标"""
        objectives = []
        
        # 基于任务类型的通用目标
        type_objectives = {
            'create': ['建立新的Wiki主题', '创建内容结构', '定义核心概念'],
            'edit': ['改进现有内容', '更新信息', '优化结构'],
            'integrate': ['整合多源信息', '建立关联', '统一格式'],
            'analyze': ['深度分析内容', '评估质量', '识别问题'],
            'organize': ['组织内容结构', '建立分类', '优化导航']
        }
        
        objectives.extend(type_objectives.get(task_type, ['完成任务目标']))
        
        # 从任务描述中提取具体目标
        # 这里可以使用更复杂的NLP技术
        task_words = re.findall(r'[\u4e00-\u9fff]+|[a-zA-Z]+', task)
        if len(task_words) > 3:
            objectives.append(f"处理{task_words[0]}相关内容")
        
        return objectives[:5]  # 限制目标数量
    
    def _determine_required_roles(self, domain: str, complexity: str) -> List[str]:
        """确定所需角色"""
        base_roles = {
            'technical': ['技术专家', '系统架构师', '开发工程师'],
            'academic': ['学者', '研究员', '专家顾问'],
            'practical': ['实践专家', '行业顾问', '经验分享者'],
            'business': ['商业分析师', '产品经理', '战略顾问']
        }
        
        roles = base_roles.get(domain, ['内容编辑', '知识专家'])
        
        # 根据复杂度调整角色
        if complexity == 'complex':
            roles.append('项目经理')
            roles.append('质量审核员')
        
        return roles
    
    def _identify_knowledge_sources(self, domain: str, task_type: str) -> List[str]:
        """识别知识源"""
        base_sources = {
            'technical': ['官方文档', '技术博客', '开源项目', 'API文档'],
            'academic': ['学术论文', '研究期刊', '学术会议', '专业书籍'],
            'practical': ['实践案例', '经验分享', '行业报告', '操作指南'],
            'business': ['市场报告', '行业分析', '商业案例', '管理指南']
        }
        
        sources = base_sources.get(domain, ['通用资料', '参考文档'])
        
        # 根据任务类型调整知识源
        if task_type == 'create':
            sources.append('模板库')
            sources.append('最佳实践')
        elif task_type == 'edit':
            sources.append('版本历史')
            sources.append('编辑记录')
        
        return sources
    
    def _estimate_time(self, complexity: str, collaborative: bool) -> str:
        """估算时间"""
        base_time = {
            'simple': '30分钟',
            'medium': '2小时',
            'complex': '1天'
        }
        
        time_str = base_time.get(complexity, '2小时')
        
        # 协作任务通常需要更多时间
        if collaborative:
            if complexity == 'simple':
                time_str = '1小时'
            elif complexity == 'medium':
                time_str = '半天'
            else:
                time_str = '2-3天'
        
        return time_str
    
    def _calculate_priority(self, task_type: str, complexity: str, domain: str) -> int:
        """计算优先级"""
        base_priority = {
            'create': 8,
            'edit': 7,
            'integrate': 9,
            'analyze': 6,
            'organize': 5
        }
        
        priority = base_priority.get(task_type, 5)
        
        # 复杂度调整
        if complexity == 'complex':
            priority += 1
        elif complexity == 'simple':
            priority -= 1
        
        # 领域调整
        if domain in ['technical', 'academic']:
            priority += 1
        
        return min(10, max(1, priority))
    
    def _generate_workflow(self, task_type: str, complexity: str, collaborative: bool) -> List[str]:
        """生成工作流程"""
        base_workflow = {
            'create': [
                '需求分析和主题规划',
                '知识收集和学习',
                '内容结构设计',
                '初稿创建',
                '质量检查和优化'
            ],
            'edit': [
                '现有内容分析',
                '编辑需求确定',
                '内容修改和更新',
                '质量验证',
                '版本发布'
            ],
            'integrate': [
                '多源信息收集',
                '信息整理和分类',
                '关联关系建立',
                '内容整合',
                '一致性检查'
            ],
            'analyze': [
                '内容深度分析',
                '质量评估',
                '问题识别',
                '改进建议',
                '分析报告'
            ],
            'organize': [
                '内容结构分析',
                '分类体系设计',
                '内容重新组织',
                '导航优化',
                '用户体验测试'
            ]
        }
        
        workflow = base_workflow.get(task_type, [
            '任务理解',
            '内容处理',
            '质量检查',
            '任务完成'
        ])
        
        # 协作流程调整
        if collaborative:
            collaborative_steps = [
                '团队协作规划',
                '角色分配',
                '协作执行',
                '冲突解决',
                '协作总结'
            ]
            
            # 在适当位置插入协作步骤
            if len(workflow) > 2:
                workflow.insert(2, collaborative_steps[2])  # 协作执行
                workflow.insert(0, collaborative_steps[0])  # 协作规划
                workflow.append(collaborative_steps[4])      # 协作总结
        
        # 复杂度调整
        if complexity == 'complex':
            workflow.insert(-1, '专家审核')
            workflow.insert(-1, '多轮迭代')
        
        return workflow
    
    def generate_analysis_report(self, analysis: TaskAnalysis) -> str:
        """生成分析报告"""
        report = []
        report.append(f"# {analysis.original_task} - 任务分析报告\n")
        
        report.append("## 基本信息\n")
        report.append(f"- **任务类型**: {analysis.task_type}")
        report.append(f"- **复杂程度**: {analysis.complexity}")
        report.append(f"- **专业领域**: {analysis.domain}")
        report.append(f"- **协作模式**: {'是' if analysis.collaborative else '否'}")
        report.append(f"- **优先级**: {analysis.priority}/10")
        report.append(f"- **预估时间**: {analysis.estimated_time}\n")
        
        report.append("## 任务目标\n")
        for i, objective in enumerate(analysis.objectives, 1):
            report.append(f"{i}. {objective}")
        report.append("")
        
        report.append("## 所需角色\n")
        for role in analysis.required_roles:
            report.append(f"- {role}")
        report.append("")
        
        report.append("## 知识来源\n")
        for source in analysis.knowledge_sources:
            report.append(f"- {source}")
        report.append("")
        
        report.append("## 工作流程\n")
        for i, step in enumerate(analysis.workflow, 1):
            report.append(f"{i}. {step}")
        report.append("")
        
        report.append("## 执行建议\n")
        if analysis.complexity == 'complex':
            report.append("- 建议分阶段执行，每个阶段进行质量检查")
            report.append("- 考虑增加专业角色参与")
        if analysis.collaborative:
            report.append("- 建议制定详细的协作计划")
            report.append("- 注意团队沟通和冲突解决")
        if analysis.priority >= 8:
            report.append("- 高优先级任务，建议优先处理")
        
        return "\n".join(report)
    
    def export_to_json(self, analysis: TaskAnalysis, filename: str):
        """导出为JSON格式"""
        data = {
            'original_task': analysis.original_task,
            'task_type': analysis.task_type,
            'complexity': analysis.complexity,
            'domain': analysis.domain,
            'collaborative': analysis.collaborative,
            'objectives': analysis.objectives,
            'required_roles': analysis.required_roles,
            'knowledge_sources': analysis.knowledge_sources,
            'estimated_time': analysis.estimated_time,
            'priority': analysis.priority,
            'workflow': analysis.workflow,
            'analyzed_at': datetime.now().isoformat()
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python task_analyzer.py --task '任务描述' [--collaborative]")
        sys.exit(1)
    
    analyzer = TaskAnalyzer()
    
    # 解析参数
    task = ""
    collaborative = False
    
    if sys.argv[1] == "--task":
        task = sys.argv[2]
        
        if len(sys.argv) > 3 and sys.argv[3] == "--collaborative":
            collaborative = True
    
    # 执行分析
    analysis = analyzer.analyze_task(task, collaborative)
    
    # 生成报告
    report = analyzer.generate_analysis_report(analysis)
    
    # 输出报告
    print(report)
    
    # 保存报告
    with open("task_analysis_report.md", 'w', encoding='utf-8') as f:
        f.write(report)
    
    # 导出JSON
    analyzer.export_to_json(analysis, "task_analysis.json")
    
    print(f"\n任务分析报告已保存到 task_analysis_report.md")
    print("详细数据已保存到 task_analysis.json")

if __name__ == "__main__":
    main()