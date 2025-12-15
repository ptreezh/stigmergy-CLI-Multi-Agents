#!/usr/bin/env python3
"""
战略规划层（L1）- 自顶向下任务分解的顶层规划
"""

import json
import sys
import os
from datetime import datetime
from typing import Dict, List, Any

class StrategicPlanner:
    """战略规划器 - L1层任务分解"""
    
    def __init__(self):
        self.task_templates = self._load_task_templates()
    
    def plan_wiki_creation(self, topic: str) -> Dict[str, Any]:
        """规划Wiki创建任务"""
        print(f"🎯 L1战略规划：{topic}")
        
        # 1. 目标受众分析
        audience = self._analyze_audience(topic)
        
        # 2. 内容范围界定
        scope = self._define_scope(topic, audience)
        
        # 3. 质量标准制定
        quality = self._set_quality_standards(topic, scope)
        
        # 4. 资源需求评估
        resources = self.estimate_resources(topic, scope)
        
        # 5. 时间规划制定
        timeline = self.create_timeline(resources)
        
        # 6. 风险评估
        risks = self.assess_risks(topic, scope, resources)
        
        # 7. 任务分解
        task_breakdown = self.decompose_task(topic, scope)
        
        plan = {
            "level": "strategic",
            "topic": topic,
            "timestamp": datetime.now().isoformat(),
            "audience": audience,
            "scope": scope,
            "quality_standards": quality,
            "resources": resources,
            "timeline": timeline,
            "risks": risks,
            "task_breakdown": task_breakdown
        }
        
        # 保存规划结果
        plan_file = f"strategic_plan_{topic}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(plan_file, 'w', encoding='utf-8') as f:
            json.dump(plan, f, ensure_ascii=False, indent=2)
        
        print(f"   ✓ 规划已保存: {plan_file}")
        
        return plan
    
    def _analyze_audience(self, topic: str) -> Dict[str, Any]:
        """分析目标受众"""
        # 定量分析
        audience_types = {
            "academic": {
                "complexity": "high",
                "depth": "theoretical",
                "requirements": ["严谨性", "引用", "学术价值"]
            },
            "technical": {
                "complexity": "medium",
                "depth": "practical",
                "requirements": ["实用性", "实现细节", "性能指标"]
            },
            "general": {
                "complexity": "low",
                "depth": "overview",
                "requirements": ["易懂性", "基础概念", "应用实例"]
            }
        }
        
        # 基于主题关键词判断受众类型
        topic_lower = topic.lower()
        if any(keyword in topic_lower for keyword in ["理论", "研究", "学术", "原理"]):
            audience_type = "academic"
        elif any(keyword in topic_lower for keyword in ["技术", "实现", "方法", "工具"]):
            audience_type = "technical"
        else:
            audience_type = "general"
        
        audience_info = audience_types[audience_type]
        audience_info["type"] = audience_type
        
        print(f"   📊 受众分析: {audience_type} - 复杂度: {audience_info['complexity']}")
        
        return audience_info
    
    def _define_scope(self, topic: str, audience: Dict[str, Any]) -> Dict[str, Any]:
        """定义内容范围"""
        complexity = audience["complexity"]
        
        scopes = {
            "high": {
                "sections": [
                    "理论基础",
                    "技术细节",
                    "应用案例",
                    "前沿发展",
                    "争议观点",
                    "参考文献"
                ],
                "word_count": 2000,
                "depth": "comprehensive"
            },
            "medium": {
                "sections": [
                    "概述",
                    "核心原理",
                    "主要应用",
                    "发展趋势"
                ],
                "word_count": 1200,
                "depth": "detailed"
            },
            "low": {
                "sections": [
                    "简介",
                    "基本概念",
                    "应用场景"
                ],
                "word_count": 800,
                "depth": "overview"
            }
        }
        
        scope_info = scopes[complexity]
        scope_info["estimated_time"] = self._estimate_time_by_complexity(complexity)
        
        print(f"   📐 范围定义: {scope_info['word_count']}字, {scope_info['depth']}深度")
        
        return scope_info
    
    def _set_quality_standards(self, topic: str, scope: Dict[str, Any]) -> Dict[str, Any]:
        """设定质量标准"""
        standards = {
            "content_quality": {
                "accuracy": 0.9,
                "completeness": 0.85,
                "clarity": 0.9,
                "professionalism": 0.85
            },
            "technical_requirements": {
                "min_sources": 5,
                "min_references": 3,
                "structured_format": True,
                "cross_references": True
            },
            "evaluation_metrics": {
                "information_density": 0.8,
                "logical_flow": 0.85,
                "expertise_level": 0.8
            }
        }
        
        # 根据复杂度调整标准
        if scope["depth"] == "comprehensive":
            standards["technical_requirements"]["min_sources"] = 10
            standards["technical_requirements"]["min_references"] = 5
        
        print(f"   📏 质量标准: 准确性{standards['content_quality']['accuracy']}, 完整性{standards['content_quality']['completeness']}")
        
        return standards
    
    def estimate_resources(self, topic: str, scope: Dict[str, Any]) -> Dict[str, Any]:
        """评估资源需求"""
        # 基于复杂度估算资源
        complexity_multipliers = {
            "low": 1.0,
            "medium": 1.5,
            "high": 2.0
        }
        
        # 深度级别映射
        depth_mapping = {
            "overview": "low",
            "detailed": "medium", 
            "comprehensive": "high"
        }
        
        base_resources = {
            "search_time": 300,  # 秒
            "analysis_time": 600,
            "writing_time": 900,
            "review_time": 300
        }
        
        depth_level = scope["depth"]
        complexity_level = depth_mapping.get(depth_level, "medium")
        multiplier = complexity_multipliers[complexity_level]
        
        resources = {}
        for key, base_time in base_resources.items():
            resources[key] = int(base_time * multiplier)
        
        resources["total_time"] = sum(resources.values())
        resources["estimated_cost"] = self._estimate_cost(resources)
        
        print(f"   💰 资源需求: 总时间{resources['total_time']}秒")
        
        return resources
    
    def _estimate_cost(self, resources: Dict[str, Any]) -> Dict[str, Any]:
        """估算成本"""
        # 简化的成本估算
        cost_per_minute = 0.01  # 假设每分钟成本
        total_minutes = resources["total_time"] / 60
        
        return {
            "time_minutes": total_minutes,
            "estimated_cost": total_minutes * cost_per_minute,
            "currency": "USD"
        }
    
    def create_timeline(self, resources: Dict[str, Any]) -> Dict[str, Any]:
        """创建时间规划"""
        total_seconds = resources["total_time"]
        
        timeline = {
            "total_seconds": total_seconds,
            "phases": [
                {
                    "name": "信息收集",
                    "duration": resources["search_time"],
                    "start": 0,
                    "end": resources["search_time"]
                },
                {
                    "name": "深度分析",
                    "duration": resources["analysis_time"],
                    "start": resources["search_time"],
                    "end": resources["search_time"] + resources["analysis_time"]
                },
                {
                    "name": "内容生成",
                    "duration": resources["writing_time"],
                    "start": resources["search_time"] + resources["analysis_time"],
                    "end": total_seconds
                },
                {
                    "name": "质量检查",
                    "duration": resources["review_time"],
                    "start": total_seconds - resources["review_time"],
                    "end": total_seconds
                }
            ]
        }
        
        print(f"   ⏱️ 时间规划: {total_seconds//60}分钟")
        
        return timeline
    
    def assess_risks(self, topic: str, scope: Dict[str, Any], resources: Dict[str, Any]) -> List[Dict[str, Any]]:
        """风险评估"""
        risks = []
        
        # 通用风险
        general_risks = [
            {
                "type": "data_quality",
                "probability": "medium",
                "impact": "medium",
                "mitigation": "多源验证，质量检查"
            },
            {
                "type": "time_constraint",
                "probability": "low",
                "impact": "medium",
                "mitigation": "优先级调整"
            },
            {
                "type": "content_quality",
                "probability": "medium",
                "impact": "high",
                "mitigation": "多轮审核，专家验证"
            }
        ]
        
        # 特定风险
        if scope["depth"] == "comprehensive":
            risks.append({
                "type": "complexity_overload",
                "probability": "medium",
                "impact": "high",
                "mitigation": "分阶段交付"
            })
        
        print(f"   ⚠️ 风险评估: {len(risks)}个风险项")
        
        return risks
    
    def decompose_task(self, topic: str, scope: Dict[str, Any]) -> Dict[str, Any]:
        """任务分解"""
        decomposition = {
            "main_task": f"创建{topic}Wiki百科",
            "total_phases": 4,
            "phases": [
                {
                    "phase_id": 1,
                    "name": "信息收集",
                    "type": "tactical",
                    "description": "收集和分析相关信息",
                    "subtasks": [
                        {
                            "task_id": "1.1",
                            "name": "网络搜索",
                            "type": "quantitative",
                            "command": "python scripts/data_collector.py --topic '{topic}' --mode 'search'",
                            "expected_output": "搜索结果列表"
                        },
                        {
                            "task_id": "1.2",
                            "name": "文献分析",
                            "type": "qualitative",
                            "command": "python scripts/data_collector.py --topic '{topic}' --mode 'analysis'",
                            "expected_output": "分析报告"
                        }
                    ]
                },
                {
                    "phase_id": 2,
                    "name": "深度分析",
                    "type": "tactical",
                    "description": "深度分析和专业见解",
                    "subtasks": [
                        {
                            "task_id": "2.1",
                            "name": "专家观点生成",
                            "type": "qualitative",
                            "command": "python scripts/content_generator.py --topic '{topic}' --mode 'insights'",
                            "expected_output": "专家见解"
                        },
                        {
                            "task_id": "2.2",
                            "name": "深度思考分析",
                            "type": "qualitative",
                            "command": "python scripts/content_generator.py --topic '{topic}' --mode 'deep_analysis'",
                            "expected_output": "深度分析"
                        }
                    ]
                },
                {
                    "phase_id": 3,
                    "name": "内容生成",
                    "type": "operational",
                    "description": "生成和优化内容",
                    "subtasks": [
                        {
                            "task_id": "3.1",
                            "name": "结构化生成",
                            "type": "quantitative",
                            "command": "python scripts/content_generator.py --topic '{topic}' --mode 'structured'",
                            "expected_output": "结构化内容"
                        },
                        {
                            "task_id": "3.2",
                            "name": "专业撰写",
                            "type": "qualitative",
                            "command": "python scripts/content_generator.py --topic '{topic}' --mode 'professional'",
                            "expected_output": "专业内容"
                        }
                    ]
                },
                {
                    "phase_id": 4,
                    "name": "质量控制",
                    "type": "operational",
                    "description": "质量检查和优化",
                    "subtasks": [
                        {
                            "task_id": "4.1",
                            "name": "质量评估",
                            "type": "quantitative",
                            "command": "python scripts/quality_controller.py --mode 'assessment'",
                            "expected_output": "质量报告"
                        },
                        {
                            "task_id": "4.2",
                            "name": "最终优化",
                            "type": "qualitative",
                            "command": "python scripts/quality_controller.py --mode 'optimization'",
                            "expected_output": "优化建议"
                        }
                    ]
                }
            ]
        }
        
        print(f"   📋 任务分解: {decomposition['total_phases']}个阶段，{sum(len(p['subtasks']) for p in decomposition['phases'])}个子任务")
        
        return decomposition
    
    def _estimate_time_by_complexity(self, complexity: str) -> int:
        """根据复杂度估算时间"""
        time_estimates = {
            "low": 1200,      # 20分钟
            "medium": 2100,   # 35分钟
            "high": 3600     # 60分钟
        }
        return time_estimates.get(complexity, 1800)
    
    def _load_task_templates(self) -> Dict[str, Any]:
        """加载任务模板"""
        return {
            "wiki_creation": {
                "name": "Wiki创建任务",
                "default_phases": ["收集", "分析", "生成", "质量控制"],
                "default_duration": 1800
            }
        }

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python strategic_planner.py <主题>")
        print("示例: python strategic_planner.py 量子计算")
        return
    
    topic = sys.argv[1]
    
    planner = StrategicPlanner()
    plan = planner.plan_wiki_creation(topic)
    
    print(f"\n✅ L1战略规划完成！")
    print(f"📊 目标受众: {plan['audience']['type']}")
    print(f"📐 内容范围: {plan['scope']['word_count']}字")
    print(f"⏱️ 预计时间: {plan['timeline']['total_seconds']//60}分钟")
    print(f"⚠️ 风险数量: {len(plan['risks'])}")
    print(f"📋 任务分解: {plan['task_breakdown']['total_phases']}个阶段")

if __name__ == "__main__":
    main()