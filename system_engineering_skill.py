# 系统工程任务分解技能核心逻辑

from typing import Dict, List, Optional, Any, Callable
from enum import Enum
import json
import time
import re
from token_monitor import (
    TokenBudgetManager, TaskMonitor, ContextManager, 
    TaskInfo, TaskStatus, TokenUsage, create_system_engineering_monitor
)


class DecompositionMethod(Enum):
    """分解方法枚举"""
    FUNCTIONAL = "functional"           # 功能分解
    TEMPORAL = "temporal"               # 时序分解
    HIERARCHICAL = "hierarchical"       # 层次分解
    GOAL_ORIENTED = "goal_oriented"     # 目标导向分解
    RESOURCE_BASED = "resource_based"   # 资源约束分解
    RISK_DRIVEN = "risk_driven"         # 风险驱动分解


class SystemEngineeringSkill:
    """系统工程任务分解技能核心类"""
    
    def __init__(self, max_context_size: int = 128000):
        """
        初始化系统工程技能
        
        Args:
            max_context_size: 最大上下文大小，默认128k tokens
        """
        self.max_context_size = max_context_size
        self.token_manager, self.monitor, self.context_manager = create_system_engineering_monitor()
        
        # 分解方法映射
        self.decomposition_methods = {
            DecompositionMethod.FUNCTIONAL: self._functional_decomposition,
            DecompositionMethod.TEMPORAL: self._temporal_decomposition,
            DecompositionMethod.HIERARCHICAL: self._hierarchical_decomposition,
            DecompositionMethod.GOAL_ORIENTED: self._goal_oriented_decomposition,
            DecompositionMethod.RESOURCE_BASED: self._resource_based_decomposition,
            DecompositionMethod.RISK_DRIVEN: self._risk_driven_decomposition,
        }
    
    def execute_task_decomposition(
        self, 
        task_description: str, 
        available_resources: Dict[str, Any] = None,
        constraints: Dict[str, Any] = None,
        decomposition_method: DecompositionMethod = DecompositionMethod.HIERARCHICAL,
        optimization_objectives: List[str] = None
    ) -> Dict[str, Any]:
        """
        执行任务分解
        
        Args:
            task_description: 任务描述
            available_resources: 可用资源
            constraints: 约束条件
            decomposition_method: 分解方法
            optimization_objectives: 优化目标
            
        Returns:
            分解结果
        """
        if available_resources is None:
            available_resources = {}
        if constraints is None:
            constraints = {}
        if optimization_objectives is None:
            optimization_objectives = ["efficiency", "quality"]
        
        # 1. 任务分析
        analysis_result = self._analyze_task(task_description, available_resources, constraints)
        
        # 2. 创建根任务
        root_task_id = f"task-{int(time.time())}"
        root_task = TaskInfo(
            task_id=root_task_id,
            name="Root Task",
            description=task_description,
            token_budget=self._calculate_root_budget(analysis_result)
        )
        self.monitor.register_task(root_task)
        
        # 3. 执行分解
        decomposition_result = self.decomposition_methods[decomposition_method](
            task_description, analysis_result, available_resources, constraints
        )
        
        # 4. 创建子任务
        self._create_subtasks_from_decomposition(decomposition_result, root_task_id)
        
        # 5. 生成执行计划
        execution_plan = self._generate_execution_plan(decomposition_result)
        
        # 6. 生成质量保证计划
        qa_plan = self._generate_quality_assurance_plan(decomposition_result)
        
        # 7. 返回完整结果
        return {
            "task_id": root_task_id,
            "complexity_analysis": analysis_result,
            "decomposition_strategy": {
                "method": decomposition_method.value,
                "optimization_objectives": optimization_objectives,
                "granularity_optimization": self._calculate_granularity(decomposition_result)
            },
            "subtask_breakdown": decomposition_result,
            "execution_plan": execution_plan,
            "quality_assurance": qa_plan,
            "monitoring_data": {
                "initial_status": self.monitor.get_global_status(),
                "hierarchy_summary": self.monitor.get_hierarchy_summary(root_task_id)
            }
        }
    
    def _analyze_task(
        self, 
        task_description: str, 
        available_resources: Dict[str, Any], 
        constraints: Dict[str, Any]
    ) -> Dict[str, Any]:
        """分析任务复杂度"""
        # 评估认知复杂度
        cognitive_load = self._assess_cognitive_load(task_description)
        
        # 评估结构复杂度
        structural_complexity = self._analyze_structural_complexity(task_description)
        
        # 评估不确定性水平
        uncertainty_level = self._evaluate_uncertainty(task_description)
        
        # 评估范围
        scope_analysis = self._analyze_scope(task_description)
        
        # 估算资源需求
        resource_requirements = self._estimate_resources(cognitive_load, structural_complexity)
        
        # 识别风险因素
        risk_factors = self._identify_risks(task_description, cognitive_load, structural_complexity)
        
        # 计算整体复杂度
        overall_complexity = self._classify_complexity(cognitive_load, structural_complexity, uncertainty_level)
        
        return {
            "overall_complexity": overall_complexity,
            "cognitive_load": cognitive_load,
            "structural_complexity": structural_complexity,
            "uncertainty_level": uncertainty_level,
            "scope_analysis": scope_analysis,
            "resource_requirements": resource_requirements,
            "risk_factors": risk_factors,
            "recommended_depth": self._recommend_decomposition_depth(overall_complexity)
        }
    
    def _assess_cognitive_load(self, task_description: str) -> str:
        """评估认知负载"""
        low_indicators = ["简单", "常规", "基础", "routine", "basic", "simple", "easy"]
        moderate_indicators = ["中等", "标准", "适中", "moderate", "standard", "intermediate"]
        high_indicators = ["复杂", "困难", "挑战", "complex", "difficult", "challenging"]
        very_high_indicators = ["极其复杂", "高难度", "专家级", "very_complex", "expert_level"]
        
        desc_lower = task_description.lower()
        
        if any(indicator in desc_lower for indicator in very_high_indicators):
            return "very_high"
        elif any(indicator in desc_lower for indicator in high_indicators):
            return "high"
        elif any(indicator in desc_lower for indicator in moderate_indicators):
            return "moderate"
        elif any(indicator in desc_lower for indicator in low_indicators):
            return "low"
        else:
            return "moderate"  # 默认中等复杂度
    
    def _analyze_structural_complexity(self, task_description: str) -> str:
        """分析结构复杂度"""
        linear_indicators = ["顺序", "步骤", "sequential", "step_by_step", "linear", "first.*then"]
        parallel_indicators = ["并行", "同时", "concurrent", "parallel", "simultaneous", "and.*both"]
        hierarchical_indicators = ["层级", "分级", "hierarchical", "layered", "nested", "structure"]
        networked_indicators = ["网络化", "相互依赖", "interconnected", "networked", "interdependent", "relationship"]
        dynamic_indicators = ["动态", "变化", "dynamic", "changing", "adaptive", "evolving"]
        
        desc_lower = task_description.lower()
        
        indicators_found = []
        if any(re.search(indicator, desc_lower) for indicator in linear_indicators):
            indicators_found.append("linear")
        if any(re.search(indicator, desc_lower) for indicator in parallel_indicators):
            indicators_found.append("parallel")
        if any(re.search(indicator, desc_lower) for indicator in hierarchical_indicators):
            indicators_found.append("hierarchical")
        if any(re.search(indicator, desc_lower) for indicator in networked_indicators):
            indicators_found.append("networked")
        if any(re.search(indicator, desc_lower) for indicator in dynamic_indicators):
            indicators_found.append("dynamic")
        
        if not indicators_found:
            return "linear"  # 默认线性结构
        
        # 如果有多种结构特征，返回最复杂的那个
        priority = ["dynamic", "networked", "hierarchical", "parallel", "linear"]
        for p in priority:
            if p in indicators_found:
                return p
        
        return "linear"
    
    def _evaluate_uncertainty(self, task_description: str) -> str:
        """评估不确定性水平"""
        known_indicators = ["明确", "清晰", "well_defined", "clear", "well_understood", "defined"]
        knowable_indicators = ["可预测", "可推导", "predictable", "derivable", "estimable"]
        unknown_indicators = ["未知", "不确定", "unknown", "uncertain", "ambiguous"]
        unknowable_indicators = ["不可预测", "随机", "unpredictable", "stochastic", "chaotic"]
        
        desc_lower = task_description.lower()
        
        if any(indicator in desc_lower for indicator in unknowable_indicators):
            return "unknowable"
        elif any(indicator in desc_lower for indicator in unknown_indicators):
            return "unknown"
        elif any(indicator in desc_lower for indicator in knowable_indicators):
            return "knowable"
        elif any(indicator in desc_lower for indicator in known_indicators):
            return "known"
        else:
            return "knowable"  # 默认可预测
    
    def _analyze_scope(self, task_description: str) -> Dict[str, str]:
        """分析任务范围"""
        # 简单的启发式分析，实际应用中可能需要更复杂的NLP
        word_count = len(task_description.split())
        
        if word_count < 20:
            breadth = "narrow"
            depth = "shallow"
        elif word_count < 50:
            breadth = "medium"
            depth = "shallow"
        elif word_count < 100:
            breadth = "medium"
            depth = "medium"
        else:
            breadth = "wide"
            depth = "deep"
        
        return {
            "breadth": breadth,
            "depth": depth
        }
    
    def _estimate_resources(self, cognitive_load: str, structural_complexity: str) -> Dict[str, Any]:
        """估算资源需求"""
        resource_multiplier = {
            "low": 1.0,
            "moderate": 1.5,
            "high": 2.5,
            "very_high": 4.0
        }
        
        complexity_multiplier = {
            "linear": 1.0,
            "parallel": 1.2,
            "hierarchical": 1.5,
            "networked": 2.0,
            "dynamic": 2.5
        }
        
        base_resources = {
            "time": 10,  # 基础时间单位
            "personnel": 1,  # 基础人员数
            "computing": 1,  # 基础计算资源
            "tools": ["basic"]  # 基础工具
        }
        
        load_mult = resource_multiplier.get(cognitive_load, 1.5)
        struct_mult = complexity_multiplier.get(structural_complexity, 1.5)
        total_mult = load_mult * struct_mult
        
        estimated_resources = {
            "time": int(base_resources["time"] * total_mult),
            "personnel": max(1, int(base_resources["personnel"] * load_mult)),
            "computing": max(1, int(base_resources["computing"] * struct_mult)),
            "tools": self._determine_required_tools(cognitive_load, structural_complexity)
        }
        
        return estimated_resources
    
    def _determine_required_tools(self, cognitive_load: str, structural_complexity: str) -> List[str]:
        """确定所需工具"""
        tools = ["basic_project_management"]
        
        if cognitive_load in ["high", "very_high"]:
            tools.extend(["advanced_analysis", "expert_consultation"])
        
        if structural_complexity in ["hierarchical", "networked", "dynamic"]:
            tools.extend(["dependency_management", "visualization_tools"])
        
        if structural_complexity == "dynamic":
            tools.append("adaptive_management")
        
        return tools
    
    def _identify_risks(self, task_description: str, cognitive_load: str, structural_complexity: str) -> List[Dict[str, str]]:
        """识别风险因素"""
        risks = []
        
        if cognitive_load in ["high", "very_high"]:
            risks.append({
                "type": "cognitive",
                "description": "任务复杂度过高可能导致执行困难",
                "severity": cognitive_load
            })
        
        if structural_complexity in ["networked", "dynamic"]:
            risks.append({
                "type": "coordination",
                "description": "复杂的依赖关系可能导致协调困难",
                "severity": structural_complexity
            })
        
        # 检查是否有时间、资源等约束相关词汇
        desc_lower = task_description.lower()
        if any(word in desc_lower for word in ["紧急", "紧迫", "tight", "urgent", "deadline"]):
            risks.append({
                "type": "time_constraint",
                "description": "时间约束可能导致任务无法按时完成",
                "severity": "high"
            })
        
        if any(word in desc_lower for word in ["有限", "稀缺", "limited", "scarce", "restricted"]):
            risks.append({
                "type": "resource_constraint",
                "description": "资源限制可能影响任务执行",
                "severity": "moderate"
            })
        
        return risks if risks else [{"type": "none", "description": "未识别到明显风险", "severity": "low"}]
    
    def _classify_complexity(self, cognitive_load: str, structural_complexity: str, uncertainty_level: str) -> str:
        """分类整体复杂度"""
        # 简单的复杂度分类逻辑
        complexity_scores = {
            "low": 1,
            "moderate": 2,
            "high": 3,
            "very_high": 4
        }
        
        # 结构复杂度通常影响更大
        struct_score = {
            "linear": 1,
            "parallel": 1.5,
            "hierarchical": 2,
            "networked": 3,
            "dynamic": 4
        }
        
        load_score = complexity_scores.get(cognitive_load, 2)
        struct_score = struct_score.get(structural_complexity, 2)
        
        # 计算综合得分
        total_score = (load_score * 0.4) + (struct_score * 0.6)
        
        if total_score <= 1.5:
            return "simple"
        elif total_score <= 2.5:
            return "moderate"
        elif total_score <= 3.5:
            return "complex"
        else:
            return "very_complex"
    
    def _recommend_decomposition_depth(self, overall_complexity: str) -> int:
        """推荐分解深度"""
        depth_map = {
            "simple": 2,
            "moderate": 3,
            "complex": 4,
            "very_complex": 5
        }
        return depth_map.get(overall_complexity, 3)
    
    def _calculate_root_budget(self, analysis_result: Dict[str, Any]) -> int:
        """计算根任务预算"""
        complexity = analysis_result["overall_complexity"]
        
        budget_map = {
            "simple": 10000,
            "moderate": 25000,
            "complex": 50000,
            "very_complex": 80000
        }
        
        return budget_map.get(complexity, 30000)  # 默认30k
    
    def _functional_decomposition(
        self, 
        task_description: str, 
        analysis_result: Dict[str, Any], 
        available_resources: Dict[str, Any], 
        constraints: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """功能分解方法"""
        # 这里简化处理，实际应用中需要更复杂的逻辑
        # 基于任务描述提取功能点
        functions = self._extract_functions_from_task(task_description)
        
        subtasks = []
        for i, func in enumerate(functions[:5]):  # 限制最多5个子任务作为示例
            subtasks.append({
                "id": f"func_subtask_{i+1}",
                "name": f"功能子任务 {i+1}: {func}",
                "description": f"实现{func}功能",
                "type": "functional",
                "estimated_effort": self._estimate_effort(func, analysis_result),
                "dependencies": [],
                "resources_needed": self._allocate_resources_for_subtask(func, available_resources)
            })
        
        return subtasks
    
    def _temporal_decomposition(
        self, 
        task_description: str, 
        analysis_result: Dict[str, Any], 
        available_resources: Dict[str, Any], 
        constraints: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """时序分解方法"""
        phases = ["准备阶段", "执行阶段", "验证阶段", "收尾阶段"]
        
        subtasks = []
        for i, phase in enumerate(phases):
            subtasks.append({
                "id": f"phase_subtask_{i+1}",
                "name": phase,
                "description": f"{task_description}的{phase}",
                "type": "temporal",
                "estimated_effort": self._estimate_effort(phase, analysis_result),
                "dependencies": [f"phase_subtask_{i}"] if i > 0 else [],
                "resources_needed": self._allocate_resources_for_subtask(phase, available_resources)
            })
        
        return subtasks
    
    def _hierarchical_decomposition(
        self, 
        task_description: str, 
        analysis_result: Dict[str, Any], 
        available_resources: Dict[str, Any], 
        constraints: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """层次分解方法"""
        # 创建多层结构
        level1_tasks = ["任务规划", "任务执行", "任务验收"]
        level2_tasks = {
            "任务规划": ["需求分析", "方案设计"],
            "任务执行": ["开发实现", "测试验证"], 
            "任务验收": ["成果评估", "文档归档"]
        }
        
        subtasks = []
        task_counter = 1
        
        for level1 in level1_tasks:
            # 添加一级任务
            subtasks.append({
                "id": f"hier_subtask_{task_counter}",
                "name": level1,
                "description": f"{task_description}的{level1}",
                "type": "hierarchical_level1",
                "estimated_effort": self._estimate_effort(level1, analysis_result),
                "dependencies": [],
                "resources_needed": self._allocate_resources_for_subtask(level1, available_resources)
            })
            task_counter += 1
            
            # 添加二级任务
            for level2 in level2_tasks.get(level1, []):
                subtasks.append({
                    "id": f"hier_subtask_{task_counter}",
                    "name": level2,
                    "description": f"{level1}中的{level2}",
                    "type": "hierarchical_level2",
                    "estimated_effort": self._estimate_effort(level2, analysis_result),
                    "dependencies": [f"hier_subtask_{task_counter-1}"],  # 依赖于上级任务
                    "resources_needed": self._allocate_resources_for_subtask(level2, available_resources)
                })
                task_counter += 1
        
        return subtasks
    
    def _goal_oriented_decomposition(
        self, 
        task_description: str, 
        analysis_result: Dict[str, Any], 
        available_resources: Dict[str, Any], 
        constraints: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """目标导向分解方法"""
        # 识别任务中的目标
        goals = self._extract_goals_from_task(task_description)
        
        subtasks = []
        for i, goal in enumerate(goals[:5]):
            subtasks.append({
                "id": f"goal_subtask_{i+1}",
                "name": f"目标子任务 {i+1}: {goal}",
                "description": f"实现{goal}目标",
                "type": "goal_oriented",
                "estimated_effort": self._estimate_effort(goal, analysis_result),
                "dependencies": [],
                "resources_needed": self._allocate_resources_for_subtask(goal, available_resources),
                "success_criteria": self._define_success_criteria(goal)
            })
        
        return subtasks
    
    def _resource_based_decomposition(
        self, 
        task_description: str, 
        analysis_result: Dict[str, Any], 
        available_resources: Dict[str, Any], 
        constraints: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """资源约束分解方法"""
        # 根据可用资源进行分解
        resource_types = list(available_resources.keys()) if available_resources else ["default"]
        
        subtasks = []
        for i, resource_type in enumerate(resource_types[:5]):
            resource_detail = available_resources.get(resource_type, {})
            subtasks.append({
                "id": f"resource_subtask_{i+1}",
                "name": f"基于{resource_type}的子任务",
                "description": f"利用{resource_type}资源完成{task_description}的一部分",
                "type": "resource_based",
                "estimated_effort": self._estimate_effort(f"{resource_type}_task", analysis_result),
                "dependencies": [],
                "resources_needed": {resource_type: resource_detail},
                "constraints": constraints
            })
        
        return subtasks
    
    def _risk_driven_decomposition(
        self, 
        task_description: str, 
        analysis_result: Dict[str, Any], 
        available_resources: Dict[str, Any], 
        constraints: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """风险驱动分解方法"""
        risks = analysis_result.get("risk_factors", [])
        
        subtasks = []
        for i, risk in enumerate(risks[:5]):
            if risk["type"] != "none":  # 跳过无风险条目
                subtasks.append({
                    "id": f"risk_subtask_{i+1}",
                    "name": f"风险缓解子任务: {risk['type']}",
                    "description": f"针对{risk['description']}风险的缓解措施",
                    "type": "risk_driven",
                    "estimated_effort": self._estimate_effort(f"risk_{risk['type']}", analysis_result),
                    "dependencies": [],
                    "resources_needed": self._allocate_resources_for_subtask(f"risk_{risk['type']}", available_resources),
                    "risk_mitigation_strategy": self._define_risk_mitigation_strategy(risk)
                })
        
        # 如果没有识别到风险，创建通用子任务
        if not [r for r in risks if r["type"] != "none"]:
            subtasks.append({
                "id": "risk_subtask_1",
                "name": "通用风险评估",
                "description": f"对{task_description}进行全面风险评估",
                "type": "risk_driven",
                "estimated_effort": self._estimate_effort("general_risk", analysis_result),
                "dependencies": [],
                "resources_needed": self._allocate_resources_for_subtask("general_risk", available_resources),
                "risk_mitigation_strategy": "Standard risk assessment and mitigation"
            })
        
        return subtasks
    
    def _extract_functions_from_task(self, task_description: str) -> List[str]:
        """从任务描述中提取功能点"""
        # 简化的功能提取，实际应用中需要更复杂的NLP
        import re
        
        # 查找常见的功能动词
        function_patterns = [
            r"实现\s*(\w+)",  # 实现XXX
            r"开发\s*(\w+)",  # 开发XXX
            r"设计\s*(\w+)",  # 设计XXX
            r"创建\s*(\w+)",  # 创建XXX
            r"构建\s*(\w+)",  # 构建XXX
            r"分析\s*(\w+)",  # 分析XXX
            r"优化\s*(\w+)",  # 优化XXX
            r"测试\s*(\w+)",  # 测试XXX
        ]
        
        functions = []
        for pattern in function_patterns:
            matches = re.findall(pattern, task_description)
            functions.extend(matches)
        
        # 如果没有找到特定功能，使用通用功能
        if not functions:
            functions = ["需求分析", "系统设计", "开发实现", "测试验证", "部署上线"]
        
        return list(set(functions))[:5]  # 去重并限制数量
    
    def _extract_goals_from_task(self, task_description: str) -> List[str]:
        """从任务描述中提取目标"""
        # 简化的目标提取
        import re
        
        goal_patterns = [
            r"目标\s*是\s*(.+?)[。！？,.]",  # 目标是XXX
            r"旨在\s*(.+?)[。！？,.]",      # 旨在XXX
            r"为了\s*(.+?)[。！？,.]",      # 为了XXX
            r"达到\s*(.+?)[。！？,.]",      # 达到XXX
        ]
        
        goals = []
        for pattern in goal_patterns:
            matches = re.findall(pattern, task_description)
            goals.extend([g.strip() for g in matches])
        
        # 如果没有找到特定目标，使用通用目标
        if not goals:
            goals = ["完成任务", "达到预期效果", "满足需求", "实现价值"]
        
        return list(set(goals))[:4]  # 去重并限制数量
    
    def _estimate_effort(self, component: str, analysis_result: Dict[str, Any]) -> Dict[str, int]:
        """估算工作量"""
        base_effort = {
            "person_hours": 8,
            "tokens_required": 2000
        }
        
        # 根据复杂度调整
        complexity_multipliers = {
            "simple": 0.5,
            "moderate": 1.0,
            "complex": 2.0,
            "very_complex": 3.0
        }
        
        mult = complexity_multipliers.get(analysis_result["overall_complexity"], 1.0)
        
        return {
            "person_hours": int(base_effort["person_hours"] * mult),
            "tokens_required": int(base_effort["tokens_required"] * mult)
        }
    
    def _allocate_resources_for_subtask(self, component: str, available_resources: Dict[str, Any]) -> Dict[str, Any]:
        """为子任务分配资源"""
        # 简化的资源分配
        if not available_resources:
            return {"default": {"quantity": 1, "type": "generic"}}
        
        # 返回可用资源的一个子集
        allocated = {}
        for key, value in list(available_resources.items())[:2]:  # 最多分配2种资源
            allocated[key] = value
        
        return allocated if allocated else {"default": {"quantity": 1, "type": "generic"}}
    
    def _define_success_criteria(self, goal: str) -> List[str]:
        """定义成功标准"""
        return [
            f"{goal}已按要求完成",
            f"{goal}质量符合预期标准",
            f"{goal}在规定时间内完成"
        ]
    
    def _define_risk_mitigation_strategy(self, risk: Dict[str, str]) -> str:
        """定义风险缓解策略"""
        return f"针对{risk['type']}风险采取预防和缓解措施，包括定期监控、预案准备和应急响应"
    
    def _create_subtasks_from_decomposition(self, decomposition_result: List[Dict[str, Any]], parent_task_id: str):
        """根据分解结果创建子任务"""
        for i, subtask_data in enumerate(decomposition_result):
            subtask = TaskInfo(
                task_id=subtask_data["id"],
                name=subtask_data["name"],
                description=subtask_data["description"],
                parent_task_id=parent_task_id,
                token_budget=subtask_data["estimated_effort"]["tokens_required"]
            )
            self.monitor.register_task(subtask)
    
    def _generate_execution_plan(self, decomposition_result: List[Dict[str, Any]]) -> Dict[str, Any]:
        """生成执行计划"""
        # 识别关键路径
        critical_path = self._identify_critical_path(decomposition_result)
        
        # 识别并行机会
        parallel_opportunities = self._identify_parallel_opportunities(decomposition_result)
        
        # 识别瓶颈点
        bottleneck_points = self._identify_bottlenecks(decomposition_result)
        
        # 生成应急预案
        contingency_plans = self._generate_contingency_plans(decomposition_result)
        
        return {
            "critical_path": critical_path,
            "parallel_opportunities": parallel_opportunities,
            "bottleneck_points": bottleneck_points,
            "contingency_plans": contingency_plans,
            "timeline_estimate": self._estimate_timeline(decomposition_result)
        }
    
    def _identify_critical_path(self, decomposition_result: List[Dict[str, Any]]) -> List[str]:
        """识别关键路径"""
        # 简化的关键路径识别
        # 在真实实现中，这需要分析依赖关系图
        if not decomposition_result:
            return []
        
        # 返回最长的依赖链
        return [task["id"] for task in decomposition_result if not task.get("dependencies")]
    
    def _identify_parallel_opportunities(self, decomposition_result: List[Dict[str, Any]]) -> List[Dict[str, List[str]]]:
        """识别并行机会"""
        # 简化的并行机会识别
        independent_tasks = [task["id"] for task in decomposition_result if not task.get("dependencies")]
        
        if len(independent_tasks) > 1:
            return [{"group": "independent_tasks", "tasks": independent_tasks}]
        else:
            return []
    
    def _identify_bottlenecks(self, decomposition_result: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """识别瓶颈点"""
        # 简化的瓶颈识别
        high_effort_tasks = [
            task for task in decomposition_result 
            if task["estimated_effort"]["person_hours"] > 20
        ]
        
        return [
            {"task_id": task["id"], "reason": "工作量大", "severity": "high"}
            for task in high_effort_tasks
        ]
    
    def _generate_contingency_plans(self, decomposition_result: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """生成应急预案"""
        return [
            {
                "trigger": "任务延期",
                "action": "重新评估资源分配，调整优先级",
                "fallback": "缩小任务范围或延长截止日期"
            },
            {
                "trigger": "资源不足", 
                "action": "寻求替代资源或重新分配",
                "fallback": "推迟非关键任务"
            }
        ]
    
    def _estimate_timeline(self, decomposition_result: List[Dict[str, Any]]) -> str:
        """估算时间线"""
        if not decomposition_result:
            return "未确定"
        
        total_effort = sum(task["estimated_effort"]["person_hours"] for task in decomposition_result)
        
        # 假设每天8小时工作制
        days = max(1, total_effort // 8)
        return f"预计 {days} 个工作日"
    
    def _generate_quality_assurance_plan(self, decomposition_result: List[Dict[str, Any]]) -> Dict[str, List[str]]:
        """生成质量保证计划"""
        validation_criteria = []
        progress_metrics = []
        risk_mitigation = []
        success_indicators = []
        
        for task in decomposition_result:
            validation_criteria.append(f"{task['name']}完成标准验证")
            progress_metrics.append(f"{task['name']}进度跟踪")
            success_indicators.append(f"{task['name']}成功完成")
        
        risk_mitigation.extend([
            "定期风险评估",
            "质量门检查",
            "阶段性评审"
        ])
        
        return {
            "validation_criteria": validation_criteria,
            "progress_metrics": progress_metrics,
            "risk_mitigation": risk_mitigation,
            "success_indicators": success_indicators
        }
    
    def _calculate_granularity(self, decomposition_result: List[Dict[str, Any]]) -> Dict[str, int]:
        """计算分解粒度"""
        if not decomposition_result:
            return {"subtasks_count": 0, "average_effort_per_task": 0}
        
        return {
            "subtasks_count": len(decomposition_result),
            "average_effort_per_task": sum(
                task["estimated_effort"]["person_hours"] for task in decomposition_result
            ) // len(decomposition_result)
        }


# 使用示例
if __name__ == "__main__":
    # 创建系统工程技能实例
    skill = SystemEngineeringSkill()
    
    # 示例任务
    task_desc = "开发一个电商平台的用户管理系统，包含用户注册、登录、个人信息管理等功能"
    resources = {
        "developers": {"count": 3, "skill_level": "mid"},
        "time": {"available_days": 30},
        "tools": ["IDE", "version_control", "testing_framework"]
    }
    constraints = {
        "deadline": "2023-12-31",
        "budget": "medium",
        "technology": ["Python", "Django", "PostgreSQL"]
    }
    
    # 执行任务分解
    result = skill.execute_task_decomposition(
        task_description=task_desc,
        available_resources=resources,
        constraints=constraints,
        decomposition_method=DecompositionMethod.HIERARCHICAL
    )
    
    # 输出结果
    print("任务分解结果:")
    print(json.dumps(result, indent=2, ensure_ascii=False))