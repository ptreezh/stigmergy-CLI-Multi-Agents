#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
跨CLI协作映射表
定义不同CLI之间的协作关系、参数映射和调用模式
"""

import json
from pathlib import Path
from typing import Dict, List, Any, Tuple, Optional
from dataclasses import dataclass
from enum import Enum

class CollaborationType(Enum):
    """协作类型枚举"""
    CODE_REVIEW = "code_review"
    CODE_GENERATION = "code_generation"
    TRANSLATION = "translation"
    OPTIMIZATION = "optimization"
    DEBUGGING = "debugging"
    DOCUMENTATION = "documentation"
    REFACTORING = "refactoring"
    TESTING = "testing"
    ANALYSIS = "analysis"
    WORKFLOW = "workflow"
    TASK_DELEGATION = "task_delegation"
    ANALYSIS_FEEDBACK = "analysis_feedback"
    ORCHESTRATION = "orchestration"
    AUTOMATION = "automation"
    INTEGRATION = "integration"
    EDUCATION = "education"
    TUTORIAL = "tutorial"
    EXPLANATION = "explanation"
    PAIR_PROGRAMMING = "pair_programming"
    CODE_COMPLETION = "code_completion"
    SUGGESTION = "suggestion"
    PATTERN_DETECTION = "pattern_detection"
    MULTI_AGENT = "multi_agent"
    TASK_MANAGEMENT = "task_management"
    TOOL_EXECUTION = "tool_execution"
    CONFIGURATION = "configuration"
    DEPLOYMENT = "deployment"

class ParameterMappingType(Enum):
    """参数映射类型"""
    DIRECT = "direct"           # 直接映射
    TRANSFORM = "transform"      # 转换映射
    IGNORE = "ignore"           # 忽略映射
    CUSTOM = "custom"           # 自定义映射

@dataclass
class ParameterMapping:
    """参数映射定义"""
    source_param: str           # 源参数名
    target_param: str           # 目标参数名
    mapping_type: ParameterMappingType
    transform_function: str      # 转换函数名
    default_value: Any          # 默认值
    required: bool             # 是否必需
    description: str           # 描述

@dataclass
class CollaborationPattern:
    """协作模式定义"""
    pattern_id: str
    source_cli: str
    target_cli: str
    collaboration_type: CollaborationType
    trigger_phrases: List[str]     # 触发短语
    command_template: str          # 命令模板
    parameter_mappings: List[ParameterMapping]
    output_format: str            # 输出格式
    use_cases: List[str]          # 用例
    best_practices: List[str]     # 最佳实践

@dataclass
class CLICompatibility:
    """CLI兼容性信息"""
    cli_name: str
    supported_as_source: List[CollaborationType]
    supported_as_target: List[CollaborationType]
    strengths: List[str]         # 强项
    limitations: List[str]       # 限制
    preferred_contexts: List[str] # 偏好上下文

class CrossCLIMapper:
    """跨CLI映射器"""
    
    def __init__(self):
        self.cli_compatibility = self._initialize_cli_compatibility()
        self.collaboration_patterns = self._initialize_collaboration_patterns()
        self.parameter_transformers = self._initialize_parameter_transformers()
    
    def _initialize_cli_compatibility(self) -> Dict[str, CLICompatibility]:
        """初始化CLI兼容性信息"""
        compatibility = {}
        
        # Claude CLI
        compatibility['claude'] = CLICompatibility(
            cli_name='claude',
            supported_as_source=[
                CollaborationType.CODE_REVIEW,
                CollaborationType.ANALYSIS,
                CollaborationType.DOCUMENTATION,
                CollaborationType.DEBUGGING
            ],
            supported_as_target=[
                CollaborationType.CODE_GENERATION,
                CollaborationType.TRANSLATION,
                CollaborationType.REFACTORING
            ],
            strengths=[
                "代码审查和分析能力强",
                "理解复杂逻辑和架构",
                "详细的解释和建议",
                "自然语言理解优秀"
            ],
            limitations=[
                "代码生成速度相对较慢",
                "对特定框架支持有限",
                "API调用有速率限制"
            ],
            preferred_contexts=[
                "代码质量审查",
                "架构设计讨论",
                "复杂逻辑分析",
                "技术文档编写"
            ]
        )
        
        # Gemini CLI
        compatibility['gemini'] = CLICompatibility(
            cli_name='gemini',
            supported_as_source=[
                CollaborationType.TRANSLATION,
                CollaborationType.OPTIMIZATION,
                CollaborationType.ANALYSIS,
                CollaborationType.DOCUMENTATION
            ],
            supported_as_target=[
                CollaborationType.CODE_REVIEW,
                CollaborationType.DEBUGGING,
                CollaborationType.WORKFLOW
            ],
            strengths=[
                "多语言翻译能力强",
                "图像理解和处理",
                "快速响应和优化",
                "多模态处理能力"
            ],
            limitations=[
                "代码深度分析相对较弱",
                "专业领域知识有限",
                "复杂推理能力中等"
            ],
            preferred_contexts=[
                "代码翻译和本地化",
                "图像相关代码分析",
                "性能优化建议",
                "快速原型开发"
            ]
        )
        
        # QwenCode CLI
        compatibility['qwencode'] = CLICompatibility(
            cli_name='qwencode',
            supported_as_source=[
                CollaborationType.CODE_GENERATION,
                CollaborationType.TESTING,
                CollaborationType.DEBUGGING
            ],
            supported_as_target=[
                CollaborationType.CODE_REVIEW,
                CollaborationType.REFACTORING,
                CollaborationType.ANALYSIS
            ],
            strengths=[
                "中文编程支持优秀",
                "特定领域模型优化",
                "本地化代码生成",
                "中文技术文档处理"
            ],
            limitations=[
                "英文支持相对较弱",
                "非中文场景应用有限",
                "协作功能较新"
            ],
            preferred_contexts=[
                "中文代码生成",
                "本地化项目开发",
                "中文技术文档",
                "特定行业应用"
            ]
        )
        
        # iFlow CLI
        compatibility['iflow'] = CLICompatibility(
            cli_name='iflow',
            supported_as_source=[
                CollaborationType.WORKFLOW,
                CollaborationType.AUTOMATION,
                CollaborationType.INTEGRATION
            ],
            supported_as_target=[
                CollaborationType.CODE_GENERATION,
                CollaborationType.CONFIGURATION,
                CollaborationType.DEPLOYMENT
            ],
            strengths=[
                "工作流设计强大",
                "自动化流程管理",
                "集成能力优秀",
                "可视化流程控制"
            ],
            limitations=[
                "非工作流场景有限",
                "学习曲线较陡",
                "配置较复杂"
            ],
            preferred_contexts=[
                "CI/CD流程设计",
                "自动化工作流",
                "集成测试流程",
                "部署管道管理"
            ]
        )
        
        # Qoder CLI
        compatibility['qoder'] = CLICompatibility(
            cli_name='qoder',
            supported_as_source=[
                CollaborationType.CODE_GENERATION,
                CollaborationType.TEMPLATE_CREATION,
                CollaborationType.SNIPPET_GENERATION
            ],
            supported_as_target=[
                CollaborationType.CODE_REVIEW,
                CollaborationType.REFACTORING,
                CollaborationType.OPTIMIZATION
            ],
            strengths=[
                "代码片段生成优秀",
                "模板库丰富",
                "快速原型开发",
                "多语言支持"
            ],
            limitations=[
                "深度分析能力有限",
                "复杂逻辑处理较弱",
                "协作功能较基础"
            ],
            preferred_contexts=[
                "代码片段生成",
                "模板创建",
                "快速原型开发",
                "代码补全"
            ]
        )
        
        # CodeBuddy CLI
        compatibility['codebuddy'] = CLICompatibility(
            cli_name='codebuddy',
            supported_as_source=[
                CollaborationType.EDUCATION,
                CollaborationType.TUTORIAL,
                CollaborationType.EXPLANATION
            ],
            supported_as_target=[
                CollaborationType.CODE_GENERATION,
                CollaborationType.DEBUGGING,
                CollaborationType.TESTING
            ],
            strengths=[
                "教学和解释能力强",
                "循序渐进的指导",
                "适合初学者",
                "知识传授优秀"
            ],
            limitations=[
                "高级开发能力有限",
                "复杂项目处理较弱",
                "性能不是最优"
            ],
            preferred_contexts=[
                "编程学习",
                "技术教学",
                "代码解释",
                "最佳实践指导"
            ]
        )
        
        # Copilot CLI
        compatibility['copilot'] = CLICompatibility(
            cli_name='copilot',
            supported_as_source=[
                CollaborationType.PAIR_PROGRAMMING,
                CollaborationType.CODE_COMPLETION,
                CollaborationType.SUGGESTION
            ],
            supported_as_target=[
                CollaborationType.CODE_REVIEW,
                CollaborationType.REFACTORING,
                CollaborationType.OPTIMIZATION
            ],
            strengths=[
                "实时代码补全",
                "上下文理解强",
                "IDE集成优秀",
                "快速响应"
            ],
            limitations=[
                "独立使用能力有限",
                "深度分析相对较弱",
                "依赖编辑器环境"
            ],
            preferred_contexts=[
                "代码编写",
                "实时补全",
                "小范围重构",
                "代码建议"
            ]
        )
        
        # Codex CLI
        compatibility['codex'] = CLICompatibility(
            cli_name='codex',
            supported_as_source=[
                CollaborationType.CODE_ANALYSIS,
                CollaborationType.PATTERN_DETECTION,
                CollaborationType.OPTIMIZATION
            ],
            supported_as_target=[
                CollaborationType.CODE_GENERATION,
                CollaborationType.REFACTORING,
                CollaborationType.DOCUMENTATION
            ],
            strengths=[
                "代码模式识别强",
                "深层代码分析",
                "架构优化建议",
                "代码质量评估"
            ],
            limitations=[
                "生成代码较基础",
                "交互体验一般",
                "API费用较高"
            ],
            preferred_contexts=[
                "代码质量分析",
                "架构优化",
                "模式识别",
                "代码审查"
            ]
        )
        
        # Cline CLI
        compatibility['cline'] = CLICompatibility(
            cli_name='cline',
            supported_as_source=[
                CollaborationType.TASK_MANAGEMENT,
                CollaborationType.MULTI_AGENT,
                CollaborationType.WORKFLOW,
                CollaborationType.TOOL_EXECUTION
            ],
            supported_as_target=[
                CollaborationType.CODE_GENERATION,
                CollaborationType.DEBUGGING,
                CollaborationType.REFACTORING,
                CollaborationType.DOCUMENTATION,
                CollaborationType.TESTING
            ],
            strengths=[
                "任务生命周期管理",
                "多智能体编排能力",
                "Hook系统集成",
                "终端命令执行",
                "MCP工具支持",
                "跨CLI委托功能"
            ],
            limitations=[
                "Windows平台支持有限",
                "配置相对复杂",
                "学习曲线较陡",
                "依赖外部API服务"
            ],
            preferred_contexts=[
                "复杂任务管理",
                "多步骤工作流",
                "终端操作自动化",
                "跨CLI协作",
                "项目级开发任务"
            ]
        )
        
        return compatibility
    
    def _initialize_collaboration_patterns(self) -> Dict[str, CollaborationPattern]:
        """初始化协作模式"""
        patterns = {}
        
        # Claude -> Gemini 协作模式
        patterns['claude_to_gemini'] = CollaborationPattern(
            pattern_id='claude_to_gemini',
            source_cli='claude',
            target_cli='gemini',
            collaboration_type=CollaborationType.TRANSLATION,
            trigger_phrases=[
                '请用gemini帮我翻译',
                'use gemini to translate',
                '让gemini处理多语言',
                'gemini翻译这段'
            ],
            command_template='gemini --file {input_file} --prompt "{context}: {request}"',
            parameter_mappings=[
                ParameterMapping(
                    source_param='request',
                    target_param='prompt',
                    mapping_type=ParameterMappingType.DIRECT,
                    transform_function='',
                    default_value='',
                    required=True,
                    description='翻译请求内容'
                ),
                ParameterMapping(
                    source_param='input_file',
                    target_param='file',
                    mapping_type=ParameterMappingType.DIRECT,
                    transform_function='',
                    default_value=None,
                    required=False,
                    description='输入文件路径'
                )
            ],
            output_format='text',
            use_cases=[
                '代码国际化',
                '技术文档翻译',
                '多语言注释转换',
                '跨语言项目适配'
            ],
            best_practices=[
                '提供上下文信息以获得更好翻译',
                '明确目标语言和术语规范',
                '保持代码格式和结构',
                '验证翻译后的功能正确性'
            ]
        )
        
        # Gemini -> Claude 协作模式
        patterns['gemini_to_claude'] = CollaborationPattern(
            pattern_id='gemini_to_claude',
            source_cli='gemini',
            target_cli='claude',
            collaboration_type=CollaborationType.CODE_REVIEW,
            trigger_phrases=[
                '请用claude帮我审查',
                'use claude to review',
                '让claude分析这段代码',
                'claude审查代码质量'
            ],
            command_template='claude --file {input_file} --prompt "{context}: 深度审查: {request}"',
            parameter_mappings=[
                ParameterMapping(
                    source_param='request',
                    target_param='prompt',
                    mapping_type=ParameterMappingType.TRANSFORM,
                    transform_function='add_review_context',
                    default_value='',
                    required=True,
                    description='审查请求'
                ),
                ParameterMapping(
                    source_param='input_file',
                    target_param='file',
                    mapping_type=ParameterMappingType.DIRECT,
                    transform_function='',
                    default_value=None,
                    required=True,
                    description='待审查文件'
                )
            ],
            output_format='detailed_analysis',
            use_cases=[
                '代码质量审查',
                '安全性检查',
                '性能分析',
                '架构评估'
            ],
            best_practices=[
                '提供完整的代码上下文',
                '明确审查的重点和标准',
                '关注安全性和性能问题',
                '考虑维护性和可扩展性'
            ]
        )
        
        # QwenCode -> Claude 协作模式
        patterns['qwencode_to_claude'] = CollaborationPattern(
            pattern_id='qwencode_to_claude',
            source_cli='qwencode',
            target_cli='claude',
            collaboration_type=CollaborationType.DOCUMENTATION,
            trigger_phrases=[
                '请用claude帮我写文档',
                '用claude生成技术文档',
                'claude帮我完善注释',
                'claude编写API文档'
            ],
            command_template='claude --file {input_file} --prompt "基于以下代码生成详细的技术文档: {request}"',
            parameter_mappings=[
                ParameterMapping(
                    source_param='request',
                    target_param='prompt',
                    mapping_type=ParameterMappingType.TRANSFORM,
                    transform_function='add_documentation_context',
                    default_value='',
                    required=True,
                    description='文档生成请求'
                )
            ],
            output_format='markdown',
            use_cases=[
                'API文档生成',
                '代码注释完善',
                '技术手册编写',
                '用户指南创建'
            ],
            best_practices=[
                '遵循文档标准格式',
                '包含使用示例',
                '提供参数和返回值说明',
                '添加错误处理说明'
            ]
        )
        
        # iFlow -> Qoder 协作模式
        patterns['iflow_to_qoder'] = CollaborationPattern(
            pattern_id='iflow_to_qoder',
            source_cli='iflow',
            target_cli='qoder',
            collaboration_type=CollaborationType.CODE_GENERATION,
            trigger_phrases=[
                '请用qoder生成代码',
                '用qoder创建实现',
                'qoder帮我写组件',
                'qoder生成模板代码'
            ],
            command_template='qoder --template {template_name} --output {output_file} --context "{context}"',
            parameter_mappings=[
                ParameterMapping(
                    source_param='workflow_config',
                    target_param='template_name',
                    mapping_type=ParameterMappingType.TRANSFORM,
                    transform_function='extract_template_from_workflow',
                    default_value='default',
                    required=True,
                    description='工作流模板名'
                )
            ],
            output_format='code',
            use_cases=[
                '工作流实现代码',
                '自动化脚本生成',
                '配置文件生成',
                '集成代码模板'
            ],
            best_practices=[
                '遵循工作流规范',
                '确保代码可维护性',
                '添加错误处理',
                '包含配置验证'
            ]
        )
        
        # Copilot -> Codex 协作模式
        patterns['copilot_to_codex'] = CollaborationPattern(
            pattern_id='copilot_to_codex',
            source_cli='copilot',
            target_cli='codex',
            collaboration_type=CollaborationType.PATTERN_DETECTION,
            trigger_phrases=[
                '请用codex分析模式',
                'codex检测代码模式',
                'codex识别架构模式',
                'codex分析设计模式'
            ],
            command_template='codex --file {input_file} --analysis-type pattern --context "{context}"',
            parameter_mappings=[
                ParameterMapping(
                    source_param='context',
                    target_param='context',
                    mapping_type=ParameterMappingType.TRANSFORM,
                    transform_function='add_pattern_analysis_context',
                    default_value='',
                    required=False,
                    description='分析上下文'
                )
            ],
            output_format='analysis_report',
            use_cases=[
                '设计模式识别',
                '代码结构分析',
                '架构模式检测',
                '重构建议生成'
            ],
            best_practices=[
                '提供完整的代码库视图',
                '关注设计原则遵循',
                '识别反模式和问题',
                '提供改进建议'
            ]
        )
        
        # CodeBuddy -> Gemini 协作模式
        patterns['codebuddy_to_gemini'] = CollaborationPattern(
            pattern_id='codebuddy_to_gemini',
            source_cli='codebuddy',
            target_cli='gemini',
            collaboration_type=CollaborationType.OPTIMIZATION,
            trigger_phrases=[
                '请用gemini优化代码',
                'gemini帮我提升性能',
                'gemini优化这段算法',
                'gemini改进代码效率'
            ],
            command_template='gemini --file {input_file} --optimize --suggestions "{optimization_goals}"',
            parameter_mappings=[
                ParameterMapping(
                    source_param='learning_objectives',
                    target_param='optimization_goals',
                    mapping_type=ParameterMappingType.TRANSFORM,
                    transform_function='convert_learning_to_goals',
                    default_value='performance',
                    required=False,
                    description='优化目标'
                )
            ],
            output_format='suggestions',
            use_cases=[
                '性能优化',
                '内存使用优化',
                '算法改进',
                '代码效率提升'
            ],
            best_practices=[
                '明确优化目标',
                '保持代码可读性',
                '测试优化效果',
                '考虑安全性影响'
            ]
        )
        
        # 添加更多协作模式...
        
        # Cline协作模式
        
        # Claude -> Cline 协作模式 (任务委托)
        patterns['claude_to_cline'] = CollaborationPattern(
            pattern_id='claude_to_cline',
            source_cli='claude',
            target_cli='cline',
            collaboration_type=CollaborationType.TASK_DELEGATION,
            trigger_phrases=[
                '请用cline执行任务',
                'cline帮我执行',
                '让cline处理复杂任务',
                'cline执行终端操作',
                'use cline to execute',
                'delegate to cline'
            ],
            command_template='cline execute --task "{task_description}" --context "{execution_context}"',
            parameter_mappings=[
                ParameterMapping(
                    source_param='request',
                    target_param='task_description',
                    mapping_type=ParameterMappingType.TRANSFORM,
                    transform_function='extract_execution_task',
                    default_value='',
                    required=True,
                    description='执行任务的详细描述'
                ),
                ParameterMapping(
                    source_param='context',
                    target_param='execution_context',
                    mapping_type=ParameterMappingType.DIRECT,
                    transform_function='',
                    default_value='cross-cli delegation from Claude',
                    required=False,
                    description='执行上下文信息'
                )
            ],
            output_format='execution_result',
            use_cases=[
                '复杂多步骤任务执行',
                '终端命令自动化',
                '项目级开发任务',
                '跨工具工作流协调'
            ],
            best_practices=[
                '提供清晰的任务描述',
                '指定必要的执行上下文',
                '监控执行进度和结果',
                '处理可能的错误和异常'
            ]
        )
        
        # Cline -> Claude 协作模式 (分析反馈)
        patterns['cline_to_claude'] = CollaborationPattern(
            pattern_id='cline_to_claude',
            source_cli='cline',
            target_cli='claude',
            collaboration_type=CollaborationType.ANALYSIS_FEEDBACK,
            trigger_phrases=[
                '请claude分析执行结果',
                'claude帮我总结',
                '让claude解释执行输出',
                'claude分析任务结果',
                'use claude to analyze',
                'claude review execution'
            ],
            command_template='claude --analyze "{execution_output}" --context "{task_context}"',
            parameter_mappings=[
                ParameterMapping(
                    source_param='execution_result',
                    target_param='execution_output',
                    mapping_type=ParameterMappingType.DIRECT,
                    transform_function='',
                    default_value='',
                    required=True,
                    description='Cline执行结果'
                ),
                ParameterMapping(
                    source_param='task_description',
                    target_param='task_context',
                    mapping_type=ParameterMappingType.DIRECT,
                    transform_function='',
                    default_value='',
                    required=False,
                    description='原始任务上下文'
                )
            ],
            output_format='analysis_report',
            use_cases=[
                '执行结果分析',
                '任务总结报告',
                '错误原因分析',
                '性能评估反馈'
            ],
            best_practices=[
                '提供完整的执行输出',
                '包含原始任务信息',
                '关注关键指标和异常',
                '提出改进建议'
            ]
        )
        
        # Multi-CLI -> Cline 协作模式 (任务编排)
        patterns['multi_to_cline_orchestration'] = CollaborationPattern(
            pattern_id='multi_to_cline_orchestration',
            source_cli='multi',
            target_cli='cline',
            collaboration_type=CollaborationType.ORCHESTRATION,
            trigger_phrases=[
                '协调多个CLI工具',
                'cline编排任务',
                '多工具协作管理',
                'cline协调执行',
                'orchestrate with cline',
                'coordinate multi-cli'
            ],
            command_template='cline orchestrate --workflow "{workflow_definition}" --tools "{available_tools}"',
            parameter_mappings=[
                ParameterMapping(
                    source_param='workflow_request',
                    target_param='workflow_definition',
                    mapping_type=ParameterMappingType.TRANSFORM,
                    transform_function='create_workflow_definition',
                    default_value='',
                    required=True,
                    description='工作流定义'
                ),
                ParameterMapping(
                    source_param='available_clis',
                    target_param='available_tools',
                    mapping_type=ParameterMappingType.DIRECT,
                    transform_function='',
                    default_value='claude,gemini,qwen',
                    required=False,
                    description='可用CLI工具列表'
                )
            ],
            output_format='orchestration_result',
            use_cases=[
                '多CLI工具协调',
                '复杂工作流管理',
                '任务依赖处理',
                '执行状态监控'
            ],
            best_practices=[
                '定义清晰的工作流步骤',
                '设置适当的依赖关系',
                '监控执行状态和进度',
                '处理错误和重试机制'
            ]
        )
        
        return patterns
    
    def _initialize_parameter_transformers(self) -> Dict[str, str]:
        """初始化参数转换器"""
        return {
            'add_review_context': '''
def add_review_context(request, source_info):
    """为代码审查添加上下文"""
    return f"""
请对以下代码进行深度审查：
1. 安全性分析：检查潜在安全漏洞
2. 性能评估：识别性能瓶颈和优化机会
3. 代码质量：评估可读性、维护性和规范性
4. 架构设计：评估结构合理性和扩展性
5. 最佳实践：检查是否遵循编程最佳实践

用户请求：{request}

请提供详细的审查报告，包括问题发现、风险评估和改进建议。
"""
            ''',
            
            'add_documentation_context': '''
def add_documentation_context(request, source_info):
    """为文档生成添加上下文"""
    return f"""
基于以下代码生成专业的技术文档：

文档要求：
1. 结构清晰，层次分明
2. 包含完整的API文档
3. 提供使用示例和场景
4. 添加错误处理说明
5. 遵循Markdown格式规范

用户请求：{request}

请生成包含以下部分的技术文档：
- 功能概述
- API参考
- 使用示例
- 配置说明
- 故障排除
"""
            ''',
            
            'extract_template_from_workflow': '''
def extract_template_from_workflow(workflow_config):
    """从工作流配置提取模板信息"""
    if isinstance(workflow_config, dict):
        return workflow_config.get('template', 'default')
    elif isinstance(workflow_config, str):
        return workflow_config.split('/')[-1] if '/' in workflow_config else 'default'
    else:
        return 'default'
            ''',
            
            'add_pattern_analysis_context': '''
def add_pattern_analysis_context(context):
    """为模式分析添加上下文"""
    return f"""
请对代码进行设计模式和架构模式分析：

分析重点：
1. 识别使用的设计模式
2. 评估模式实现的正确性
3. 检查是否遵循SOLID原则
4. 识别代码异味和反模式
5. 提供重构建议

上下文信息：{context}

请提供详细的模式分析报告。
"""
            ''',
            
            'convert_learning_to_goals': '''
def convert_learning_to_goals(learning_objectives):
    """将学习目标转换为优化目标"""
    if not learning_objectives:
        return "性能优化、可读性改进、错误处理增强"
    
    goal_mapping = {
        "理解代码结构": "代码结构优化",
        "学习最佳实践": "应用最佳实践",
        "掌握算法": "算法优化",
        "提高编程技巧": "代码质量提升"
    }
    
    goals = []
    for objective in str(learning_objectives).split(','):
        goal = goal_mapping.get(objective.strip(), objective.strip())
        goals.append(goal)
    
    return ", ".join(goals)
            '''
        }
    
    def find_collaboration_pattern(self, source_cli: str, target_cli: str, 
                                collaboration_type: CollaborationType) -> Optional[CollaborationPattern]:
        """查找协作模式"""
        pattern_key = f"{source_cli}_to_{target_cli}"
        return self.collaboration_patterns.get(pattern_key)
    
    def get_cli_compatibility(self, cli_name: str) -> Optional[CLICompatibility]:
        """获取CLI兼容性信息"""
        return self.cli_compatibility.get(cli_name)
    
    def suggest_optimal_collaboration(self, task_description: str, 
                                    available_clis: List[str]) -> List[Tuple[str, str, float]]:
        """建议最优协作方案"""
        suggestions = []
        
        # 简单的关键词匹配逻辑
        task_keywords = task_description.lower()
        
        for source_cli in available_clis:
            source_compat = self.cli_compatibility.get(source_cli)
            if not source_compat:
                continue
                
            for target_cli in available_clis:
                if target_cli == source_cli:
                    continue
                    
                target_compat = self.cli_compatibility.get(target_cli)
                if not target_compat:
                    continue
                
                # 计算匹配分数
                score = self._calculate_collaboration_score(
                    task_keywords, source_compat, target_compat
                )
                
                if score > 0.3:  # 阈值
                    suggestions.append((source_cli, target_cli, score))
        
        # 按分数排序
        suggestions.sort(key=lambda x: x[2], reverse=True)
        return suggestions[:5]  # 返回前5个建议
    
    def _calculate_collaboration_score(self, task_keywords: str, 
                                   source_compat: CLICompatibility, 
                                   target_compat: CLICompatibility) -> float:
        """计算协作分数"""
        score = 0.0
        
        # 基于强项和任务关键词匹配
        for strength in source_compat.strengths:
            if any(keyword in strength.lower() for keyword in task_keywords.split()):
                score += 0.3
        
        for strength in target_compat.strengths:
            if any(keyword in strength.lower() for keyword in task_keywords.split()):
                score += 0.3
        
        # 基于偏好上下文匹配
        for context in source_compat.preferred_contexts:
            if any(keyword in context.lower() for keyword in task_keywords.split()):
                score += 0.2
        
        # 基于兼容性匹配
        if any("审查" in strength for strength in target_compat.strengths):
            if "审查" in task_keywords or "分析" in task_keywords:
                score += 0.2
        
        return min(score, 1.0)  # 最大分数为1.0
    
    def transform_parameters(self, pattern: CollaborationPattern, 
                          source_params: Dict[str, Any]) -> Dict[str, Any]:
        """转换参数"""
        target_params = {}
        
        for mapping in pattern.parameter_mappings:
            source_value = source_params.get(mapping.source_param)
            
            if source_value is None and mapping.default_value is not None:
                source_value = mapping.default_value
            
            if mapping.required and source_value is None:
                raise ValueError(f"必需参数 {mapping.source_param} 未提供")
            
            if source_value is not None:
                if mapping.mapping_type == ParameterMappingType.DIRECT:
                    target_params[mapping.target_param] = source_value
                elif mapping.mapping_type == ParameterMappingType.TRANSFORM:
                    if mapping.transform_function:
                        # 执行转换函数
                        transform_func = self.parameter_transformers.get(mapping.transform_function)
                        if transform_func:
                            exec(transform_func, globals())
                            target_value = locals().get(mapping.transform_function)(source_value, {})
                            target_params[mapping.target_param] = target_value
                        else:
                            target_params[mapping.target_param] = source_value
                elif mapping.mapping_type == ParameterMappingType.IGNORE:
                    continue
                elif mapping.mapping_type == ParameterMappingType.CUSTOM:
                    # 自定义转换逻辑
                    target_params[mapping.target_param] = self._custom_transform(
                        source_value, mapping.source_param, mapping.target_param
                    )
        
        return target_params
    
    def _custom_transform(self, value: Any, source_param: str, target_param: str) -> Any:
        """自定义参数转换"""
        # 这里可以实现各种自定义转换逻辑
        if isinstance(value, str):
            # 字符串转换
            if "file" in target_param.lower():
                return str(value) if value else None
            elif "prompt" in target_param.lower():
                return value if value else ""
        
        return value
    
    def generate_cross_cli_command(self, source_cli: str, target_cli: str, 
                                 task_description: str, 
                                 parameters: Dict[str, Any]) -> Optional[str]:
        """生成交叉CLI命令"""
        # 查找协作模式
        pattern = self.find_collaboration_pattern(source_cli, target_cli, CollaborationType.CODE_GENERATION)
        if not pattern:
            # 尝试找到最相关的协作模式
            for collab_type in CollaborationType:
                pattern = self.find_collaboration_pattern(source_cli, target_cli, collab_type)
                if pattern:
                    break
        
        if not pattern:
            return None
        
        # 转换参数
        try:
            transformed_params = self.transform_parameters(pattern, parameters)
        except ValueError as e:
            return f"参数转换失败: {e}"
        
        # 生成命令
        try:
            command = pattern.command_template.format(**transformed_params)
            return command
        except KeyError as e:
            return f"缺少必需参数: {e}"
    
    def export_mapping_table(self, output_file: str) -> bool:
        """导出映射表"""
        try:
            export_data = {
                'cli_compatibility': {},
                'collaboration_patterns': {},
                'parameter_transformers': self.parameter_transformers,
                'export_timestamp': datetime.now().isoformat(),
                'version': '1.0.0'
            }
            
            # 导出CLI兼容性
            for cli_name, compat in self.cli_compatibility.items():
                export_data['cli_compatibility'][cli_name] = {
                    'supported_as_source': [ct.value for ct in compat.supported_as_source],
                    'supported_as_target': [ct.value for ct in compat.supported_as_target],
                    'strengths': compat.strengths,
                    'limitations': compat.limitations,
                    'preferred_contexts': compat.preferred_contexts
                }
            
            # 导出协作模式
            for pattern_id, pattern in self.collaboration_patterns.items():
                export_data['collaboration_patterns'][pattern_id] = {
                    'source_cli': pattern.source_cli,
                    'target_cli': pattern.target_cli,
                    'collaboration_type': pattern.collaboration_type.value,
                    'trigger_phrases': pattern.trigger_phrases,
                    'command_template': pattern.command_template,
                    'parameter_mappings': [
                        {
                            'source_param': pm.source_param,
                            'target_param': pm.target_param,
                            'mapping_type': pm.mapping_type.value,
                            'transform_function': pm.transform_function,
                            'default_value': pm.default_value,
                            'required': pm.required,
                            'description': pm.description
                        }
                        for pm in pattern.parameter_mappings
                    ],
                    'output_format': pattern.output_format,
                    'use_cases': pattern.use_cases,
                    'best_practices': pattern.best_practices
                }
            
            # 写入文件
            output_path = Path(output_file)
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            
            return True
            
        except Exception as e:
            print(f"导出映射表失败: {e}")
            return False

def main():
    """主函数"""
    from datetime import datetime
    
    print("🔗 跨CLI协作映射表生成器")
    print("=" * 50)
    
    # 创建映射器
    mapper = CrossCLIMapper()
    
    # 导出映射表
    print("📋 导出协作映射表...")
    output_files = [
        'global_memory/cross_cli_mapping.json',
        'global_memory/cross_cli_mapping.md'
    ]
    
    # 导出JSON格式
    if mapper.export_mapping_table(output_files[0]):
        print(f"   ✅ JSON映射表已导出: {output_files[0]}")
    else:
        print(f"   ❌ JSON映射表导出失败")
    
    # 生成协作建议示例
    print("\n💡 协作建议示例:")
    
    sample_tasks = [
        "请帮我审查这段Python代码的安全性",
        "我想优化这个算法的性能",
        "帮我为这个项目生成技术文档",
        "设计一个自动化的CI/CD工作流"
    ]
    
    available_clis = list(mapper.cli_compatibility.keys())
    
    for task in sample_tasks:
        suggestions = mapper.suggest_optimal_collaboration(task, available_clis)
        print(f"\n📝 任务: {task}")
        if suggestions:
            print("   💡 推荐协作:")
            for source, target, score in suggestions[:3]:
                compat = mapper.get_cli_compatibility(target)
                if compat:
                    primary_strength = compat.strengths[0] if compat.strengths else "综合能力"
                    print(f"      {source} → {target} (匹配度: {score:.2f}) - {primary_strength}")
        else:
            print("   ⚠️ 暂无合适协作建议")
    
    print(f"\n📁 映射表文件已保存到: global_memory/")
    print("🎯 跨CLI协作系统就绪！")
    
    return 0

if __name__ == "__main__":
    import sys
    sys.exit(main())