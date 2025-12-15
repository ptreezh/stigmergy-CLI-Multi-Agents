#!/usr/bin/env python3
"""
Wiki内容生成器
基于模板和分析结果生成结构化的Wiki内容
"""

import json
import re
import sys
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from pathlib import Path
from datetime import datetime

@dataclass
class ContentSection:
    """内容章节数据结构"""
    title: str
    content: str
    subsections: List['ContentSection']
    metadata: Dict[str, Any]

class ContentGenerator:
    """内容生成器主类"""
    
    def __init__(self):
        self.templates = {
            'technical': self._load_technical_template(),
            'academic': self._load_academic_template(),
            'practical': self._load_practical_template(),
            'conceptual': self._load_conceptual_template()
        }
        
        self.content_generators = {
            'overview': self._generate_overview,
            'definition': self._generate_definition,
            'principles': self._generate_principles,
            'implementation': self._generate_implementation,
            'examples': self._generate_examples,
            'resources': self._generate_resources
        }
    
    def generate_content(self, topic_name: str, topic_type: str, analysis: Dict[str, Any]) -> str:
        """生成完整的Wiki内容"""
        # 获取模板
        template = self.templates.get(topic_type, self.templates['technical'])
        
        # 生成各部分内容
        content_sections = []
        
        for section_title in template['structure']:
            section_content = self._generate_section_content(
                section_title, topic_name, topic_type, analysis
            )
            content_sections.append(section_content)
        
        # 组装完整内容
        full_content = self._assemble_content(topic_name, content_sections, template)
        
        return full_content
    
    def _generate_section_content(self, section_title: str, topic_name: str, 
                                topic_type: str, analysis: Dict[str, Any]) -> ContentSection:
        """生成章节内容"""
        # 根据章节类型选择生成器
        generator_key = self._map_section_to_generator(section_title)
        generator = self.content_generators.get(generator_key, self._generate_generic_section)
        
        # 生成内容
        content = generator(section_title, topic_name, topic_type, analysis)
        
        return ContentSection(
            title=section_title,
            content=content,
            subsections=[],
            metadata={
                'generated_at': datetime.now().isoformat(),
                'topic_type': topic_type,
                'word_count': len(content)
            }
        )
    
    def _map_section_to_generator(self, section_title: str) -> str:
        """将章节标题映射到生成器"""
        mapping = {
            '概述': 'overview',
            '介绍': 'overview',
            '定义': 'definition',
            '概念': 'definition',
            '原理': 'principles',
            '理论基础': 'principles',
            '实现': 'implementation',
            '方法': 'implementation',
            '案例': 'examples',
            '实例': 'examples',
            '资源': 'resources',
            '参考资料': 'resources'
        }
        
        return mapping.get(section_title, 'generic')
    
    def _generate_overview(self, section_title: str, topic_name: str, 
                          topic_type: str, analysis: Dict[str, Any]) -> str:
        """生成概述内容"""
        key_concepts = analysis.get('key_concepts', [])
        audience = analysis.get('audience', '学习者')
        
        content = f"""{section_title}

{topic_name}是{'、'.join(key_concepts[:3])}相关的重要{'领域' if topic_type == 'academic' else '技术' if topic_type == 'technical' else '主题'}。

本文档面向{audience}，旨在提供全面而深入的{topic_name}知识体系。通过系统性的介绍，帮助读者理解{topic_name}的核心概念、掌握基本方法，并了解其实际应用。

## 主要特点

- **系统性**: 从基础概念到高级应用的完整覆盖
- **实用性**: 理论与实践相结合，注重实际应用
- **前沿性**: 包含最新的发展趋势和研究进展
- **易用性**: 结构清晰，便于查阅和学习

## 学习目标

通过本文档的学习，读者将能够：

1. 理解{topic_name}的基本概念和核心原理
2. 掌握相关的{'研究方法' if topic_type == 'academic' else '技术实现' if topic_type == 'technical' else '操作方法'}
3. 了解实际应用场景和典型案例
4. 获得进一步学习和实践的指导

"""
        return content
    
    def _generate_definition(self, section_title: str, topic_name: str, 
                           topic_type: str, analysis: Dict[str, Any]) -> str:
        """生成定义内容"""
        key_concepts = analysis.get('key_concepts', [])
        
        content = f"""{section_title}

## 核心定义

{topic_name}是指{'基于' + key_concepts[0] if key_concepts else '特定'}的{'理论体系' if topic_type == 'academic' else '技术框架' if topic_type == 'technical' else '方法论'}。

## 基本特征

{topic_name}具有以下基本特征：

### 1. {'理论性' if topic_type == 'academic' else '技术性' if topic_type == 'technical' else '实践性'}
{'以理论为基础，强调科学性和严谨性' if topic_type == 'academic' else '以技术为核心，强调实现和性能' if topic_type == 'technical' else '以实践为导向，强调可操作性'}

### 2. {'系统性' if topic_type in ['academic', 'technical'] else '实用性'}
{'具有完整的理论体系和逻辑结构' if topic_type in ['academic', 'technical'] else '注重实际效果和应用价值'}

### 3. {'创新性' if topic_type == 'academic' else '先进性' if topic_type == 'technical' else '适用性'}
{'推动学科发展和理论创新' if topic_type == 'academic' else '采用先进技术和方法' if topic_type == 'technical' else '适用于多种场景和需求'}

### 4. {'指导性' if topic_type == 'academic' else '可扩展性' if topic_type == 'technical' else '灵活性'}
{'为相关研究和实践提供理论指导' if topic_type == 'academic' else '支持扩展和定制开发' if topic_type == 'technical' else '支持灵活应用和调整'}

## 相关概念

"""
        
        # 添加相关概念
        for concept in key_concepts[1:4]:
            content += f"- **{concept}**: 与{topic_name}密切相关的{'理论概念' if topic_type == 'academic' else '技术概念' if topic_type == 'technical' else '实践概念'}\n"
        
        content += "\n"
        return content
    
    def _generate_principles(self, section_title: str, topic_name: str, 
                           topic_type: str, analysis: Dict[str, Any]) -> str:
        """生成原理内容"""
        content = f"""{section_title}

## 基础原理

{topic_name}的基础原理建立在{'多学科交叉融合' if topic_type == 'academic' else '技术创新和工程实践' if topic_type == 'technical' else '经验总结和最佳实践'}之上。

## 核心机制

### 1. {'理论机制' if topic_type == 'academic' else '技术机制' if topic_type == 'technical' else '操作机制'}

{'基于科学理论构建的系统性框架' if topic_type == 'academic' else '通过技术创新实现的核心功能' if topic_type == 'technical' else '通过标准化操作实现的预期效果'}

### 2. {'方法论' if topic_type == 'academic' else '实现方法' if topic_type == 'technical' else '实施方法'}

{'采用科学的研究方法和分析工具' if topic_type == 'academic' else '运用先进的开发工具和技术手段' if topic_type == 'technical' else '遵循规范的操作流程和标准'}

### 3. {'验证机制' if topic_type == 'academic' else '测试机制' if topic_type == 'technical' else '评估机制'}

{'通过实证研究和理论验证确保有效性' if topic_type == 'academic' else '通过系统测试和质量保证确保可靠性' if topic_type == 'technical' else '通过效果评估和反馈改进确保实用性'}

## 关键要素

"""
        
        # 根据主题类型添加关键要素
        if topic_type == 'academic':
            content += """- **理论假设**: 构建理论体系的基础假设
- **研究方法**: 采用的科学研究方法
- **数据支撑**: 支持理论的经验数据
- **逻辑推理**: 理论推导的逻辑过程
"""
        elif topic_type == 'technical':
            content += """- **架构设计**: 系统的整体架构和组件关系
- **算法选择**: 核心算法的选择和优化
- **性能指标**: 关键性能指标和评估标准
- **安全考虑**: 安全性设计和防护措施
"""
        else:
            content += """- **操作流程**: 标准化的操作步骤和流程
- **质量标准**: 质量控制和评估标准
- **资源配置**: 必要的资源投入和配置
- **风险控制**: 风险识别和控制措施
"""
        
        return content
    
    def _generate_implementation(self, section_title: str, topic_name: str, 
                              topic_type: str, analysis: Dict[str, Any]) -> str:
        """生成实现内容"""
        content = f"""{section_title}

## {'研究' if topic_type == 'academic' else '开发' if topic_type == 'technical' else '实施'}环境

{'研究环境要求：' if topic_type == 'academic' else '开发环境要求：' if topic_type == 'technical' else '实施环境要求：'}

"""
        
        if topic_type == 'academic':
            content += """- **理论基础**: 扎实的相关学科理论基础
- **研究工具**: 专业的研究工具和软件
- **数据资源**: 充足的数据资源和文献支持
- **合作网络**: 学术交流和合作平台
"""
        elif topic_type == 'technical':
            content += """- **开发工具**: 集成开发环境(IDE)和版本控制
- **运行环境**: 符合要求的硬件和软件环境
- **依赖库**: 必要的第三方库和框架
- **测试环境**: 完善的测试和调试环境
"""
        else:
            content += """- **基础条件**: 必要的基础设施和条件
- **人员配置**: 合适的人员配置和分工
- **工具设备**: 必要的工具和设备支持
- **管理制度**: 规范的管理制度和流程
"""
        
        content += f"""
## {'研究' if topic_type == 'academic' else '开发' if topic_type == 'technical' else '实施'}步骤

### 第一阶段：准备阶段
1. {'文献调研和理论准备' if topic_type == 'academic' else '需求分析和技术选型' if topic_type == 'technical' else '需求分析和方案设计'}
2. {'研究方案设计' if topic_type == 'academic' else '系统设计和技术架构' if topic_type == 'technical' else '计划制定和资源准备'}
3. {'资源收集和工具准备' if topic_type == 'academic' else '环境搭建和工具配置' if topic_type == 'technical' else '团队组建和培训'}

### 第二阶段：{'研究' if topic_type == 'academic' else '开发' if topic_type == 'technical' else '实施'}阶段
1. {'理论构建和假设验证' if topic_type == 'academic' else '核心功能开发和实现' if topic_type == 'technical' else '方案执行和过程控制'}
2. {'数据收集和分析' if topic_type == 'academic' else '模块集成和系统测试' if topic_type == 'technical' else '质量监控和问题处理'}
3. {'结果分析和理论完善' if topic_type == 'academic' else '性能优化和功能完善' if topic_type == 'technical' else '效果评估和持续改进'}

### 第三阶段：验证阶段
1. {'理论验证和同行评议' if topic_type == 'academic' else '系统测试和用户验收' if topic_type == 'technical' else '成果验收和效果评估'}
2. {'成果总结和论文发表' if topic_type == 'academic' else '文档编写和部署上线' if topic_type == 'technical' else '经验总结和标准化'}
3. {'后续研究和应用推广' if topic_type == 'academic' else '维护升级和技术支持' if topic_type == 'technical' else '推广应用和持续优化'}

"""
        return content
    
    def _generate_examples(self, section_title: str, topic_name: str, 
                         topic_type: str, analysis: Dict[str, Any]) -> str:
        """生成案例内容"""
        content = f"""{section_title}

## {'研究' if topic_type == 'academic' else '应用' if topic_type == 'technical' else '实践'}案例

### 案例1：{'基础' if topic_type == 'academic' else '入门' if topic_type == 'technical' else '简单'}{'研究' if topic_type == 'academic' else '应用' if topic_type == 'technical' else '实践'}

**背景**: 
{'针对特定理论问题的基础性研究' if topic_type == 'academic' else '解决实际问题的入门级应用' if topic_type == 'technical' else '日常工作中常见的简单实践'}

**过程**:
"""
        
        if topic_type == 'academic':
            content += """1. 提出研究假设和理论框架
2. 设计实验方案和数据收集方法
3. 实施研究并收集相关数据
4. 分析数据并验证理论假设
5. 形成研究结论和理论贡献

"""
        elif topic_type == 'technical':
            content += """1. 分析需求和技术可行性
2. 选择合适的技术方案和工具
3. 实现核心功能和关键特性
4. 进行测试验证和性能优化
5. 部署应用并提供技术支持

"""
        else:
            content += """1. 明确目标和预期效果
2. 制定详细的实施计划
3. 按计划执行并监控进度
4. 及时处理问题和调整方案
5. 评估效果并总结经验

"""
        
        content += f"""**结果**: 
{'验证了理论假设的有效性，为后续研究奠定了基础' if topic_type == 'academic' else '成功解决了实际问题，提供了可复用的技术方案' if topic_type == 'technical' else '达到了预期目标，积累了宝贵的实践经验'}

**启示**: 
{'理论研究需要与实践相结合，注重实证验证' if topic_type == 'academic' else '技术应用需要考虑实际需求，注重用户体验' if topic_type == 'technical' else '实践工作需要标准化流程，注重持续改进'}

### 案例2：{'深入' if topic_type == 'academic' else '高级' if topic_type == 'technical' else '复杂'}{'研究' if topic_type == 'academic' else '应用' if topic_type == 'technical' else '实践'}

**背景**: 
{'探索前沿理论和复杂问题的深入研究' if topic_type == 'academic' else '处理复杂业务场景的高级应用' if topic_type == 'technical' else '应对复杂环境的专业实践'}

**关键挑战**:
"""
        
        if topic_type == 'academic':
            content += """- 理论复杂性和多学科交叉
- 研究方法的创新和改进
- 数据获取和分析的难度
- 理论验证的复杂性

"""
        elif topic_type == 'technical':
            content += """- 技术难度和性能要求
- 系统复杂性和集成挑战
- 资源限制和成本控制
- 安全性和可靠性要求

"""
        else:
            content += """- 环境复杂性和不确定性
- 资源限制和协调难度
- 质量要求和标准控制
- 时间压力和风险管理

"""
        
        content += f"""**解决方案**:
{'采用创新的研究方法和理论框架，结合多学科知识进行综合分析' if topic_type == 'academic' else '运用先进的技术架构和优化策略，确保系统性能和可靠性' if topic_type == 'technical' else '建立完善的管理体系和协调机制，确保项目顺利实施'}

**成果**: 
{'在理论和方法上取得了重要突破，发表了高质量的研究成果' if topic_type == 'academic' else '成功实现了复杂业务需求，获得了用户的高度认可' if topic_type == 'technical' else '圆满完成了各项任务目标，建立了可复制的最佳实践'}

"""
        return content
    
    def _generate_resources(self, section_title: str, topic_name: str, 
                          topic_type: str, analysis: Dict[str, Any]) -> str:
        """生成资源内容"""
        content = f"""{section_title}

## {'学习' if topic_type == 'academic' else '开发' if topic_type == 'technical' else '实践'}资源

### {'文献' if topic_type == 'academic' else '文档' if topic_type == 'technical' else '资料'}推荐

"""
        
        if topic_type == 'academic':
            content += """#### 经典文献
1. **基础理论文献**: 提供理论基础和核心概念
2. **研究方法文献**: 介绍研究方法和分析工具
3. **实证研究文献**: 提供实证研究和案例分析
4. **前沿研究文献**: 展示最新研究进展和趋势

#### 学术期刊
- 相关领域的顶级期刊
- 专业学会会刊
- 开放获取期刊

#### 学术会议
- 国际顶级会议
- 专业学术会议
- 研讨会和workshop

"""
        elif topic_type == 'technical':
            content += """#### 官方文档
1. **技术规范和标准**: 官方技术规范文档
2. **API文档**: 详细的接口文档和使用指南
3. **开发指南**: 开发环境搭建和配置指南
4. **最佳实践**: 官方推荐的最佳实践

#### 技术社区
- 开源项目社区
- 技术论坛和讨论组
- 开发者交流平台

#### 学习资源
- 在线教程和课程
- 技术博客和文章
- 视频教程和演示

"""
        else:
            content += """#### 指南手册
1. **操作手册**: 详细的操作步骤和流程
2. **检查清单**: 标准化的检查和验证清单
3. **模板工具**: 实用的模板和工具
4. **案例集**: 典型案例和经验分享

#### 培训资源
- 专业培训课程
- 认证考试资料
- 技能提升资源

#### 参考资料
- 行业标准和规范
- 法律法规文件
- 专业词典和术语

"""
        
        content += f"""### 工具和{'软件' if topic_type in ['academic', 'technical'] else '设备'}

"""
        
        if topic_type == 'academic':
            content += """#### 研究工具
- 统计分析软件
- 文献管理工具
- 数据可视化工具
- 协作研究平台

#### 数据资源
- 公共数据库
- 研究数据集
- 调查数据
- 实验数据

"""
        elif topic_type == 'technical':
            content += """#### 开发工具
- 集成开发环境(IDE)
- 版本控制系统
- 调试和测试工具
- 性能分析工具

#### 在线服务
- 云服务平台
- API测试工具
- 代码托管平台
- 持续集成服务

"""
        else:
            content += """#### 实用工具
- 项目管理工具
- 沟通协作平台
- 文档管理工具
- 质量检查工具

#### 设备资源
- 硬件设备清单
- 软件系统要求
- 网络环境配置
- 安全防护措施

"""
        
        return content
    
    def _generate_generic_section(self, section_title: str, topic_name: str, 
                                topic_type: str, analysis: Dict[str, Any]) -> str:
        """生成通用章节内容"""
        content = f"""{section_title}

本章节将详细介绍{topic_name}相关的{section_title}内容。

## 主要内容

1. **基本概念**: 介绍相关的核心概念和定义
2. **关键要点**: 分析重点和难点问题
3. **实践指导**: 提供实用的操作指导
4. **注意事项**: 说明需要注意的事项

## 深入分析

基于{topic_name}的特点，我们需要从多个角度来理解{section_title}：

- **理论角度**: 分析理论基础和学术观点
- **实践角度**: 探讨实际应用和操作方法
- **发展角度**: 展望未来发展趋势和方向

## 总结

{section_title}是{topic_name}的重要组成部分，需要系统学习和深入理解。

"""
        return content
    
    def _assemble_content(self, topic_name: str, sections: List[ContentSection], 
                         template: Dict[str, Any]) -> str:
        """组装完整内容"""
        content_parts = []
        
        # 添加标题
        content_parts.append(f"# {topic_name}\n")
        
        # 添加目录
        content_parts.append("## 目录\n")
        for i, section in enumerate(sections, 1):
            content_parts.append(f"{i}. [{section.title}](#{section.title.lower().replace(' ', '-')})")
        content_parts.append("\n")
        
        # 添加各章节内容
        for section in sections:
            content_parts.append(f"## {section.title}\n")
            content_parts.append(section.content)
        
        # 添加元数据
        content_parts.append("---\n")
        content_parts.append(f"*本文档由Wiki主题创建技能自动生成*")
        content_parts.append(f"*生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*")
        content_parts.append(f"*主题类型: {template.get('type', 'unknown')}*")
        
        return "\n".join(content_parts)
    
    def _load_technical_template(self) -> Dict[str, Any]:
        """加载技术型模板"""
        return {
            'type': 'technical',
            'structure': ['概述', '定义', '技术原理', '实现方法', '应用案例', '工具资源']
        }
    
    def _load_academic_template(self) -> Dict[str, Any]:
        """加载学术型模板"""
        return {
            'type': 'academic',
            'structure': ['概述', '核心概念', '理论基础', '研究方法', '案例分析', '参考文献']
        }
    
    def _load_practical_template(self) -> Dict[str, Any]:
        """加载实践型模板"""
        return {
            'type': 'practical',
            'structure': ['概述', '操作准备', '实施步骤', '实践案例', '问题处理', '参考资料']
        }
    
    def _load_conceptual_template(self) -> Dict[str, Any]:
        """加载概念型模板"""
        return {
            'type': 'conceptual',
            'structure': ['概述', '概念定义', '理论框架', '关系分析', '应用场景', '相关文献']
        }

def main():
    """主函数"""
    if len(sys.argv) < 4:
        print("使用方法: python content_generator.py --topic '主题名称' --template '模板类型'")
        print("       python content_generator.py --analysis '分析文件.json'")
        sys.exit(1)
    
    generator = ContentGenerator()
    
    # 解析参数
    if sys.argv[1] == "--topic" and sys.argv[3] == "--template":
        topic_name = sys.argv[2]
        template_type = sys.argv[4]
        
        # 创建模拟分析数据
        analysis = {
            'key_concepts': topic_name.split('、'),
            'audience': '学习者',
            'complexity': 'intermediate'
        }
        
        # 生成内容
        content = generator.generate_content(topic_name, template_type, analysis)
        
        # 保存内容
        filename = f"{topic_name.replace(' ', '_')}_wiki.md"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"Wiki内容已生成并保存到 {filename}")
    
    elif sys.argv[1] == "--analysis":
        analysis_file = sys.argv[2]
        
        # 读取分析数据
        with open(analysis_file, 'r', encoding='utf-8') as f:
            analysis = json.load(f)
        
        # 生成内容
        content = generator.generate_content(
            analysis['name'], 
            analysis['type'], 
            analysis
        )
        
        # 保存内容
        filename = f"{analysis['name'].replace(' ', '_')}_wiki.md"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"基于分析数据的Wiki内容已生成并保存到 {filename}")
    
    else:
        print("参数错误")
        sys.exit(1)

if __name__ == "__main__":
    main()
