#!/usr/bin/env python3
"""
专业角色智能体系统
为Wiki创建提供专业角色支持和智能分析
"""

import json
import re
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from enum import Enum

class RoleType(Enum):
    """角色类型枚举"""
    ACADEMIC_RESEARCHER = "academic_researcher"
    INDUSTRY_EXPERT = "industry_expert"
    TECHNICAL_SPECIALIST = "technical_specialist"
    ANALYST = "analyst"
    EDITOR = "editor"

@dataclass
class ProfessionalRole:
    """专业角色定义"""
    name: str
    role_type: RoleType
    expertise: List[str]
    perspective: str
    communication_style: str
    biases: List[str]
    strengths: List[str]
    tools: List[str]
    analysis_focus: List[str]

@dataclass
class Viewpoint:
    """观点定义"""
    author: str
    role: str
    content: str
    evidence: List[str]
    confidence: float
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class DebateResult:
    """辩论结果"""
    winning_viewpoint: Viewpoint
    synthesis: str
    confidence_level: float
    supporting_evidence: List[str]
    counterarguments_addressed: List[str]

class ProfessionalRoleAgent:
    """专业角色智能体"""
    
    def __init__(self):
        self.roles = self._initialize_roles()
        self.current_role = None
        self.debate_history = []
    
    def _initialize_roles(self) -> Dict[RoleType, ProfessionalRole]:
        """初始化专业角色库"""
        return {
            RoleType.ACADEMIC_RESEARCHER: ProfessionalRole(
                name="学术研究员",
                role_type=RoleType.ACADEMIC_RESEARCHER,
                expertise=["理论研究", "文献综述", "方法论", "统计分析"],
                perspective="学术严谨，注重理论基础和实证研究",
                communication_style="正式、客观、数据驱动",
                biases=["理论偏好", "方法保守"],
                strengths=["深度分析", "文献掌握", "逻辑严谨"],
                tools=["文献检索", "统计分析", "实验设计"],
                analysis_focus=["理论基础", "研究方法", "数据验证"]
            ),
            RoleType.INDUSTRY_EXPERT: ProfessionalRole(
                name="行业专家",
                role_type=RoleType.INDUSTRY_EXPERT,
                expertise=["实践应用", "案例分析", "市场趋势", "商业价值"],
                perspective="实用导向，关注实际应用和商业价值",
                communication_style="直接、务实、案例丰富",
                biases=["经验主义", "商业偏好"],
                strengths=["实践经验", "案例丰富", "市场洞察"],
                tools=["市场分析", "案例研究", "ROI评估"],
                analysis_focus=["应用场景", "商业价值", "实施可行性"]
            ),
            RoleType.TECHNICAL_SPECIALIST: ProfessionalRole(
                name="技术专家",
                role_type=RoleType.TECHNICAL_SPECIALIST,
                expertise=["技术实现", "系统架构", "性能优化", "技术细节"],
                perspective="技术深度，关注实现细节和技术可行性",
                communication_style="精确、技术化、逻辑清晰",
                biases=["技术崇拜", "完美主义"],
                strengths=["技术深度", "实现能力", "问题解决"],
                tools=["技术评估", "架构设计", "性能测试"],
                analysis_focus=["技术架构", "实现方案", "性能指标"]
            ),
            RoleType.ANALYST: ProfessionalRole(
                name="分析师",
                role_type=RoleType.ANALYST,
                expertise=["数据分析", "趋势预测", "风险评估", "综合评估"],
                perspective="数据驱动，注重客观分析和量化评估",
                communication_style="数据化、图表化、结论明确",
                biases=["数据依赖", "简化倾向"],
                strengths=["数据分析", "趋势判断", "风险评估"],
                tools=["数据挖掘", "统计分析", "可视化"],
                analysis_focus=["数据支撑", "趋势分析", "风险评估"]
            ),
            RoleType.EDITOR: ProfessionalRole(
                name="编辑",
                role_type=RoleType.EDITOR,
                expertise=["内容组织", "逻辑梳理", "表达优化", "质量控制"],
                perspective="读者导向，注重内容质量和可读性",
                communication_style="清晰、简洁、结构化",
                biases=["完美主义", "主观判断"],
                strengths=["内容组织", "逻辑梳理", "质量控制"],
                tools=["文本编辑", "结构优化", "质量检查"],
                analysis_focus=["内容结构", "逻辑连贯", "表达清晰"]
            )
        }
    
    def select_role(self, topic: str, task_type: str) -> ProfessionalRole:
        """根据主题和任务类型选择最适合的角色"""
        # 基于主题关键词和任务类型的角色选择逻辑
        topic_lower = topic.lower()
        
        # 技术类主题优先选择技术专家
        if any(keyword in topic_lower for keyword in ['编程', '算法', '系统', '架构', '技术']):
            return self.roles[RoleType.TECHNICAL_SPECIALIST]
        
        # 学术研究类选择学术研究员
        if any(keyword in topic_lower for keyword in ['理论', '研究', '学术', '科学']):
            return self.roles[RoleType.ACADEMIC_RESEARCHER]
        
        # 商业应用类选择行业专家
        if any(keyword in topic_lower for keyword in ['商业', '市场', '应用', '行业']):
            return self.roles[RoleType.INDUSTRY_EXPERT]
        
        # 分析评估类选择分析师
        if any(keyword in topic_lower for keyword in ['分析', '评估', '趋势', '预测']):
            return self.roles[RoleType.ANALYST]
        
        # 默认选择学术研究员
        return self.roles[RoleType.ACADEMIC_RESEARCHER]
    
    def adopt_role(self, role: ProfessionalRole):
        """采用特定角色"""
        self.current_role = role
        print(f"🎭 采用角色: {role.name}")
        print(f"📚 专业领域: {', '.join(role.expertise)}")
        print(f"🔍 分析视角: {role.perspective}")
    
    def analyze_from_role_perspective(self, topic: str, information: Dict[str, Any]) -> Dict[str, Any]:
        """从当前角色视角分析主题"""
        if not self.current_role:
            raise ValueError("未选择专业角色")
        
        analysis = {
            "role": self.current_role.name,
            "perspective": self.current_role.perspective,
            "key_insights": [],
            "concerns": [],
            "recommendations": [],
            "confidence_level": 0.8
        }
        
        # 根据角色类型进行不同的分析
        if self.current_role.role_type == RoleType.ACADEMIC_RESEARCHER:
            analysis = self._academic_analysis(topic, information, analysis)
        elif self.current_role.role_type == RoleType.INDUSTRY_EXPERT:
            analysis = self._industry_analysis(topic, information, analysis)
        elif self.current_role.role_type == RoleType.TECHNICAL_SPECIALIST:
            analysis = self._technical_analysis(topic, information, analysis)
        elif self.current_role.role_type == RoleType.ANALYST:
            analysis = self._analyst_analysis(topic, information, analysis)
        elif self.current_role.role_type == RoleType.EDITOR:
            analysis = self._editor_analysis(topic, information, analysis)
        
        return analysis
    
    def _academic_analysis(self, topic: str, information: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """学术研究员分析"""
        search_results = information.get('search_results', [])
        
        # 提取理论相关内容
        theoretical_insights = []
        for result in search_results:
            content = result.get('content', '')
            if any(term in content for term in ['理论', '原理', '概念', '定义']):
                theoretical_insights.append(content[:150] + "...")
        
        analysis["key_insights"] = theoretical_insights
        analysis["concerns"] = [
            "需要更多的实证研究支持",
            "理论基础需要更深入的阐述",
            "研究方法论的严谨性有待验证"
        ]
        analysis["recommendations"] = [
            "建议增加文献综述部分",
            "需要更多的理论框架支撑",
            "建议添加研究方法论说明"
        ]
        
        return analysis
    
    def _industry_analysis(self, topic: str, information: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """行业专家分析"""
        applications = information.get('applications', [])
        
        analysis["key_insights"] = applications if applications else ["缺乏明确的应用案例"]
        analysis["concerns"] = [
            "实际应用场景不够明确",
            "商业价值评估不足",
            "实施可行性需要进一步验证"
        ]
        analysis["recommendations"] = [
            "建议增加具体的案例分析",
            "需要评估投资回报率",
            "建议提供实施指南"
        ]
        
        return analysis
    
    def _technical_analysis(self, topic: str, information: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """技术专家分析"""
        key_concepts = information.get('key_concepts', [])
        
        analysis["key_insights"] = [
            f"技术核心概念: {', '.join(key_concepts)}" if key_concepts else "技术概念定义不清晰"
        ]
        analysis["concerns"] = [
            "技术架构描述不够详细",
            "性能指标缺失",
            "技术实现细节需要补充"
        ]
        analysis["recommendations"] = [
            "建议添加技术架构图",
            "需要提供性能基准测试",
            "建议包含代码示例"
        ]
        
        return analysis
    
    def _analyst_analysis(self, topic: str, information: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """分析师分析"""
        analysis["key_insights"] = [
            "缺乏量化数据分析",
            "趋势预测基于有限信息"
        ]
        analysis["concerns"] = [
            "数据支撑不足",
            "分析方法论不够明确",
            "风险评估缺失"
        ]
        analysis["recommendations"] = [
            "建议添加数据图表",
            "需要提供详细的统计分析",
            "建议包含风险评估矩阵"
        ]
        
        return analysis
    
    def _editor_analysis(self, topic: str, information: Dict[str, Any], analysis: Dict[str, Any]) -> Dict[str, Any]:
        """编辑分析"""
        analysis["key_insights"] = [
            "内容结构需要优化",
            "逻辑流程可以改进"
        ]
        analysis["concerns"] = [
            "内容组织不够清晰",
            "部分表述存在歧义",
            "章节衔接需要加强"
        ]
        analysis["recommendations"] = [
            "建议重新组织内容结构",
            "需要优化表达方式",
            "建议添加过渡段落"
        ]
        
        return analysis
    
    def create_viewpoint(self, topic: str, analysis: Dict[str, Any]) -> Viewpoint:
        """创建观点"""
        content = f"""
基于{self.current_role.name}的视角分析：

核心观点：
{chr(10).join([f"• {insight}" for insight in analysis['key_insights']])}

主要关切：
{chr(10).join([f"• {concern}" for concern in analysis['concerns']])}

建议改进：
{chr(10).join([f"• {rec}" for rec in analysis['recommendations']])}

置信度：{analysis['confidence_level']:.2f}
        """.strip()
        
        return Viewpoint(
            author=self.current_role.name,
            role=self.current_role.role_type.value,
            content=content,
            evidence=analysis['key_insights'],
            confidence=analysis['confidence_level']
        )

class DebateManager:
    """辩论管理器"""
    
    def __init__(self):
        self.viewpoints = []
        self.debate_history = []
    
    def add_viewpoint(self, viewpoint: Viewpoint):
        """添加观点"""
        self.viewpoints.append(viewpoint)
        print(f"💬 添加观点: {viewpoint.author} (置信度: {viewpoint.confidence:.2f})")
    
    def conduct_debate(self, topic: str) -> DebateResult:
        """进行辩论"""
        if len(self.viewpoints) < 2:
            raise ValueError("需要至少两个观点才能进行辩论")
        
        print(f"\n🔥 开始关于'{topic}'的辩论...")
        print("=" * 50)
        
        # 评估观点强度
        scored_viewpoints = []
        for vp in self.viewpoints:
            score = self._evaluate_viewpoint_strength(vp)
            scored_viewpoints.append((vp, score))
            print(f"📊 {vp.author}: 强度评分 {score:.2f}")
        
        # 找出最强观点
        winning_viewpoint, max_score = max(scored_viewpoints, key=lambda x: x[1])
        
        # 生成综合分析
        synthesis = self._generate_synthesis(topic, self.viewpoints, winning_viewpoint)
        
        # 收集支撑证据
        supporting_evidence = []
        for vp in self.viewpoints:
            supporting_evidence.extend(vp.evidence)
        
        # 识别已处理的反论点
        counterarguments = self._identify_counterarguments(self.viewpoints)
        
        result = DebateResult(
            winning_viewpoint=winning_viewpoint,
            synthesis=synthesis,
            confidence_level=min(max_score, 0.95),  # 限制最大置信度
            supporting_evidence=list(set(supporting_evidence)),  # 去重
            counterarguments_addressed=counterarguments
        )
        
        print(f"\n🏆 辩胜观点: {winning_viewpoint.author}")
        print(f"📈 综合置信度: {result.confidence_level:.2f}")
        
        return result
    
    def _evaluate_viewpoint_strength(self, viewpoint: Viewpoint) -> float:
        """评估观点强度"""
        base_score = viewpoint.confidence
        
        # 基于证据数量调整
        evidence_bonus = min(len(viewpoint.evidence) * 0.1, 0.3)
        
        # 基于内容长度调整（假设更详细的内容更有价值）
        content_bonus = min(len(viewpoint.content) / 1000, 0.2)
        
        # 基于角色专业性调整
        role_bonus = 0.1 if viewpoint.role in ['academic_researcher', 'technical_specialist'] else 0.05
        
        total_score = base_score + evidence_bonus + content_bonus + role_bonus
        return min(total_score, 1.0)
    
    def _generate_synthesis(self, topic: str, viewpoints: List[Viewpoint], winning_viewpoint: Viewpoint) -> str:
        """生成综合分析"""
        synthesis = f"""
关于'{topic}'的综合分析：

主要观点总结：
{chr(10).join([f"• {vp.author}: {vp.content[:100]}..." for vp in viewpoints])}

最优方案（基于{winning_viewpoint.author}的视角）：
{winning_viewpoint.content}

综合建议：
1. 采纳{winning_viewpoint.author}的核心建议作为主要方向
2. 整合其他观点的合理要素作为补充
3. 针对识别出的关切点制定改进计划
4. 建立持续的评估和优化机制

结论：通过多角度分析和辩论，形成了更加全面和可靠的认识。
        """.strip()
        
        return synthesis
    
    def _identify_counterarguments(self, viewpoints: List[Viewpoint]) -> List[str]:
        """识别已处理的反论点"""
        counterarguments = []
        
        for vp in viewpoints:
            if '关切' in vp.content or 'concern' in vp.content.lower():
                # 提取关切点作为已处理的反论点
                concerns = re.findall(r'• (.+?)(?=\n|$)', vp.content)
                counterarguments.extend(concerns)
        
        return counterarguments[:5]  # 返回最多5个主要反论点

def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python professional_agent.py <主题>")
        print("示例: python professional_agent.py 机器学习")
        return
    
    topic = sys.argv[1]
    
    # 创建专业角色智能体
    agent = ProfessionalRoleAgent()
    
    # 选择角色
    role = agent.select_role(topic, "wiki_creation")
    agent.adopt_role(role)
    
    # 模拟信息收集
    mock_information = {
        "search_results": [
            {"content": "机器学习是人工智能的重要分支，具有广泛的应用前景"},
            {"content": "深度学习在图像识别和自然语言处理方面取得突破"},
            {"content": "机器学习算法需要大量数据支撑，计算资源消耗较大"}
        ],
        "key_concepts": ["算法", "模型", "训练", "预测"],
        "applications": ["图像识别", "自然语言处理", "推荐系统"]
    }
    
    # 分析主题
    analysis = agent.analyze_from_role_perspective(topic, mock_information)
    
    # 创建观点
    viewpoint = agent.create_viewpoint(topic, analysis)
    
    # 创建辩论管理器
    debate_manager = DebateManager()
    debate_manager.add_viewpoint(viewpoint)
    
    # 添加第二个角色的观点进行辩论
    second_role = agent.roles[RoleType.INDUSTRY_EXPERT]
    agent.adopt_role(second_role)
    second_analysis = agent.analyze_from_role_perspective(topic, mock_information)
    second_viewpoint = agent.create_viewpoint(topic, second_analysis)
    debate_manager.add_viewpoint(second_viewpoint)
    
    # 进行辩论
    debate_result = debate_manager.conduct_debate(topic)
    
    # 保存结果
    result = {
        "topic": topic,
        "timestamp": datetime.now().isoformat(),
        "debate_result": {
            "winning_viewpoint": {
                "author": debate_result.winning_viewpoint.author,
                "content": debate_result.winning_viewpoint.content,
                "confidence": debate_result.winning_viewpoint.confidence
            },
            "synthesis": debate_result.synthesis,
            "confidence_level": debate_result.confidence_level,
            "supporting_evidence": debate_result.supporting_evidence,
            "counterarguments_addressed": debate_result.counterarguments_addressed
        }
    }
    
    output_file = f"debate_result_{topic}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 辩论结果已保存到: {output_file}")

if __name__ == "__main__":
    main()