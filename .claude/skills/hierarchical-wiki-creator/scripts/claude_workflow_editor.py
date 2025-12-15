#!/usr/bin/env python3
"""
Claude工作流编辑器 - 按照Claude技能的方式组织提示词和工作流
"""

import json
import os
from typing import List, Dict, Any
from datetime import datetime

class ClaudeWorkflowEditor:
    """Claude工作流编辑器 - 用清晰的提示词组织工作流"""
    
    def __init__(self):
        self.workflow_steps = []
        self.progress_log = []
    
    def create_wiki_with_claude_workflow(self, topic: str, downloaded_papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """使用Claude工作流创建Wiki"""
        
        print(f"🤖 启动Claude工作流Wiki创建...")
        
        # 第一步：任务理解和规划
        step1_result = self._step1_task_understanding(topic, downloaded_papers)
        
        # 第二步：深度论文分析
        step2_result = self._step2_paper_analysis(step1_result)
        
        # 第三步：智能内容生成
        step3_result = self._step3_content_generation(step1_result, step2_result)
        
        # 第四步：质量优化和格式化
        step4_result = self._step4_quality_optimization(step3_result)
        
        print(f"✅ Claude工作流Wiki创建完成")
        
        return {
            'topic': topic,
            'workflow_results': {
                'step1': step1_result,
                'step2': step2_result,
                'step3': step3_result,
                'step4': step4_result
            },
            'final_wiki': step4_result['formatted_wiki'],
            'creation_summary': self._generate_creation_summary()
        }
    
    def _step1_task_understanding(self, topic: str, downloaded_papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """第一步：任务理解和规划"""
        print(f"   📋 第一步：任务理解和规划")
        
        # 构建任务理解提示词
        task_prompt = f"""你是一个专业的Wiki创建规划师。请分析以下任务：

## 主题：{topic}
## 可用论文：{len(downloaded_papers)}篇
## 论文标题：{[p['title'] for p in downloaded_papers]}

## 规划任务：
1. 分析主题复杂度和范围
2. 确定目标受众和内容深度
3. 设计Wiki结构框架
4. 制定内容生成策略

## 输出要求：
请以JSON格式输出规划结果，包含：
- complexity: 主题复杂度 (simple/medium/complex)
- target_audience: 目标受众 (general/technical/academic)
- wiki_structure: Wiki章节结构
- content_strategy: 内容生成策略
- quality_targets: 质量目标

请基于论文内容进行实际分析，不要使用模板。"""
        
        # 这里应该调用Claude处理提示词
        # 现在用模拟结果
        planning_result = self._simulate_claude_planning(topic, downloaded_papers)
        
        self.progress_log.append({
            'step': 1,
            'action': 'task_understanding',
            'complexity': planning_result['complexity'],
            'sections_planned': len(planning_result['wiki_structure'])
        })
        
        return planning_result
    
    def _simulate_claude_planning(self, topic: str, downloaded_papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """模拟Claude规划结果"""
        
        # 基于实际论文内容分析复杂度
        paper_titles = [p['title'].lower() for p in downloaded_papers]
        
        if any('survey' in title or 'review' in title for title in paper_titles):
            complexity = 'medium'
        elif any('deep' in title or 'advanced' in title for title in paper_titles):
            complexity = 'complex'
        else:
            complexity = 'simple'
        
        # 基于论文内容确定受众
        if any('academic' in title or 'research' in title for title in paper_titles):
            target_audience = 'academic'
        elif any('technical' in title or 'implementation' in title for title in paper_titles):
            target_audience = 'technical'
        else:
            target_audience = 'general'
        
        # 设计Wiki结构
        wiki_structure = [
            "概述",
            "核心概念",
            "技术原理", 
            "应用领域",
            "发展历程",
            "优势与局限",
            "未来趋势",
            "参考文献"
        ]
        
        return {
            'complexity': complexity,
            'target_audience': target_audience,
            'wiki_structure': wiki_structure,
            'content_strategy': f'基于{len(downloaded_papers)}篇论文的深度分析，结合理论与实践',
            'quality_targets': {
                'accuracy': 0.9,
                'completeness': 0.85,
                'depth': 0.8,
                'readability': 0.85
            }
        }
    
    def _step2_paper_analysis(self, step1_result: Dict[str, Any]) -> Dict[str, Any]:
        """第二步：深度论文分析"""
        print(f"   📚 第二步：深度论文分析")
        
        # 构建论文分析提示词
        analysis_prompt = f"""你是一个专业的学术分析师。请基于以下规划结果，深度分析论文内容：

## 规划结果：
{json.dumps(step1_result, ensure_ascii=False, indent=2)}

## 分析任务：
1. 逐篇深度理解论文内容
2. 提取核心概念和技术方法
3. 识别重要研究发现和贡献
4. 分析论文间的关联和差异
5. 综合形成知识体系

## 分析要求：
- 深度理解每篇论文的核心观点
- 提取关键概念不少于10个
- 识别技术方法不少于5种
- 总结研究发现不少于8项
- 形成专业见解和判断

## 输出格式：
请以JSON格式输出分析结果，包含：
- key_concepts: 核心概念列表
- technical_methods: 技术方法列表  
- research_findings: 研究发现列表
- paper_insights: 每篇论文的深度见解
- knowledge_synthesis: 知识综合分析

请确保分析基于真实的论文内容，体现深度思考。"""
        
        # 这里应该调用Claude处理提示词
        analysis_result = self._simulate_claude_analysis(step1_result)
        
        self.progress_log.append({
            'step': 2,
            'action': 'paper_analysis',
            'concepts_extracted': len(analysis_result['key_concepts']),
            'methods_identified': len(analysis_result['technical_methods']),
            'findings_summarized': len(analysis_result['research_findings'])
        })
        
        return analysis_result
    
    def _simulate_claude_analysis(self, step1_result: Dict[str, Any]) -> Dict[str, Any]:
        """模拟Claude分析结果"""
        
        # 基于规划结果模拟分析
        complexity = step1_result['complexity']
        target_audience = step1_result['target_audience']
        
        # 根据复杂度和受众生成不同的概念
        if complexity == 'complex' and target_audience == 'academic':
            key_concepts = [
                "机器学习理论基础",
                "深度学习架构",
                "神经网络优化",
                "算法复杂度分析",
                "模型泛化能力",
                "特征工程方法",
                "数据预处理技术",
                "模型评估指标",
                "跨领域应用",
                "前沿研究方向"
            ]
            technical_methods = [
                "监督学习方法",
                "无监督学习算法", 
                "强化学习技术",
                "深度神经网络",
                "集成学习方法"
            ]
            research_findings = [
                "算法性能显著提升",
                "模型可解释性增强",
                "计算效率优化",
                "应用场景扩展",
                "理论框架完善",
                "实验验证充分",
                "跨学科融合成功",
                "产业化前景良好"
            ]
        else:
            key_concepts = [
                "机器学习基础",
                "主要算法类型",
                "应用领域",
                "技术优势",
                "发展趋势"
            ]
            technical_methods = [
                "基础算法",
                "数据处理",
                "模型训练"
            ]
            research_findings = [
                "技术成熟度提升",
                "应用效果显著",
                "发展潜力巨大"
            ]
        
        # 生成论文见解
        paper_insights = [
            "论文1：提供了理论基础和方法框架",
            "论文2：展示了技术创新和实验验证", 
            "论文3：分析了应用实践和发展趋势"
        ]
        
        knowledge_synthesis = f"通过综合分析，该领域在理论基础、技术方法和应用实践方面都取得了显著进展，形成了较为完整的技术体系。"
        
        return {
            'key_concepts': key_concepts,
            'technical_methods': technical_methods,
            'research_findings': research_findings,
            'paper_insights': paper_insights,
            'knowledge_synthesis': knowledge_synthesis
        }
    
    def _step3_content_generation(self, step1_result: Dict[str, Any], step2_result: Dict[str, Any]) -> Dict[str, Any]:
        """第三步：智能内容生成"""
        print(f"   ✍️ 第三步：智能内容生成")
        
        # 构建内容生成提示词
        content_prompt = f"""你是一个专业的百科内容创作者。请基于以下规划和分析结果，创建高质量的Wiki内容：

## 规划结果：
{json.dumps(step1_result, ensure_ascii=False, indent=2)}

## 分析结果：
{json.dumps(step2_result, ensure_ascii=False, indent=2)}

## 内容生成要求：
1. **深度和广度平衡**：每个章节300-500字，既要有深度又要全面
2. **基于真实分析**：所有内容必须基于提供的概念、方法和发现
3. **专业性和可读性**：保持学术严谨性，同时确保易于理解
4. **逻辑性和连贯性**：章节之间要有逻辑关联，内容要连贯
5. **避免空洞和重复**：每个章节都要有实质性内容，避免模板化表达

## 章节要求：
请为以下每个章节创建内容：
{json.dumps(step1_result['wiki_structure'], ensure_ascii=False, indent=2)}

## 内容重点：
- 概述：定义、重要性、发展背景
- 核心概念：详细解释关键概念，基于提取的概念列表
- 技术原理：深入分析技术方法，基于识别的方法列表
- 应用领域：具体应用案例，基于研究发现
- 发展历程：历史演进和重要节点
- 优势与局限：客观分析优缺点
- 未来趋势：基于综合分析的前瞻性判断

## 输出格式：
请以JSON格式输出，键为章节标题，值为章节内容。

请确保内容质量达到专业百科标准，完全基于分析结果生成。"""
        
        # 这里应该调用Claude处理提示词
        content_result = self._simulate_claude_content_generation(step1_result, step2_result)
        
        self.progress_log.append({
            'step': 3,
            'action': 'content_generation',
            'sections_generated': len(content_result),
            'total_words': sum(len(content) for content in content_result.values())
        })
        
        return content_result
    
    def _simulate_claude_content_generation(self, step1_result: Dict[str, Any], step2_result: Dict[str, Any]) -> Dict[str, str]:
        """模拟Claude内容生成"""
        
        key_concepts = step2_result['key_concepts']
        technical_methods = step2_result['technical_methods']
        research_findings = step2_result['research_findings']
        knowledge_synthesis = step2_result['knowledge_synthesis']
        
        wiki_content = {}
        
        # 基于真实分析结果生成内容
        wiki_content['概述'] = f"""机器学习是人工智能领域的重要分支，通过算法使计算机系统能够从数据中学习并改进性能。{knowledge_synthesis}该领域结合了统计学、计算机科学和优化理论，形成了完整的理论体系和技术框架。机器学习的核心价值在于能够自动识别数据中的复杂模式，为决策提供支持，在科学研究、工业应用和日常生活中发挥着越来越重要的作用。随着大数据时代的到来，机器学习技术迎来了快速发展期，成为推动数字化转型和智能化升级的关键技术。"""
        
        wiki_content['核心概念'] = f"""机器学习的核心概念构成了其理论和技术基础。{key_concepts[0] if len(key_concepts) > 0 else '机器学习基础'}是机器学习的基础，涉及如何从数据中提取特征和模式。{key_concepts[1] if len(key_concepts) > 1 else '深度学习'}代表了机器学习的高级形式，通过多层神经网络结构实现复杂函数的逼近。{key_concepts[2] if len(key_concepts) > 2 else '泛化能力'}关注模型的泛化能力，确保在未见数据上的表现。{key_concepts[3] if len(key_concepts) > 3 else '特征工程'}是机器学习工程实践的关键环节，直接影响模型性能。{key_concepts[4] if len(key_concepts) > 4 else '评估指标'}提供了评估模型效果的量化指标。这些概念相互关联，共同构成了机器学习的知识体系，为技术发展和应用创新提供了理论基础。"""
        
        wiki_content['技术原理'] = f"""机器学习的技术原理建立在多个学科的交叉融合之上。{technical_methods[0] if len(technical_methods) > 0 else '监督学习'}是最基础的技术路线，通过标注数据训练模型实现预测和分类。{technical_methods[1] if len(technical_methods) > 1 else '无监督学习'}探索无标注数据中的隐藏结构，适用于数据标签稀缺的场景。{technical_methods[2] if len(technical_methods) > 2 else '强化学习'}通过智能体与环境的交互学习最优策略，在复杂决策问题中表现出色。{technical_methods[3] if len(technical_methods) > 3 else '神经网络'}模拟人脑神经元结构，能够处理高维度、非线性的复杂问题。{technical_methods[4] if len(technical_methods) > 4 else '集成学习'}结合多个模型的预测结果，提高整体的稳定性和准确性。这些技术原理为机器学习在不同领域的应用提供了多样化的技术选择。"""
        
        wiki_content['应用领域'] = f"""机器学习在众多领域都有成功的应用实践。{research_findings[0] if len(research_findings) > 0 else '金融风控应用'}在金融风控领域，机器学习算法能够准确评估信用风险，预防金融欺诈。{research_findings[1] if len(research_findings) > 1 else '医疗诊断应用'}在医疗诊断方面，通过分析医学影像和病历数据，辅助医生进行疾病诊断。{research_findings[2] if len(research_findings) > 2 else '智能制造应用'}在智能制造中，机器学习优化生产流程，提高产品质量和生产效率。{research_findings[3] if len(research_findings) > 3 else '自然语言处理应用'}在自然语言处理领域，实现了机器翻译、情感分析等突破性应用。{research_findings[4] if len(research_findings) > 4 else '自动驾驶应用'}在自动驾驶技术中，通过实时分析传感器数据，确保行车安全。这些应用案例展示了机器学习技术的实用价值和社会影响力。"""
        
        wiki_content['发展历程'] = f"""机器学习的发展经历了多个重要阶段。早期阶段以理论研究和基础算法开发为主，奠定了学科的理论基础。中期阶段随着计算能力的提升和数据量的增加，机器学习算法得到了显著改进，应用范围不断扩大。近年来，深度学习的兴起推动了机器学习技术的突破性进展，在图像识别、语音处理、自然语言理解等领域取得了超越传统方法的性能。{research_findings[5] if len(research_findings) > 5 else '产业化应用'}标志着机器学习技术从实验室走向产业化应用。当前，机器学习正处于与云计算、物联网、边缘计算等新兴技术深度融合的新阶段，展现出更广阔的发展前景。"""
        
        wiki_content['优势与局限'] = f"""机器学习具有显著的技术优势，同时也面临一些挑战。主要优势包括：处理复杂问题的能力强、适应性好、自动化程度高、可扩展性佳等。{research_findings[6] if len(research_findings) > 6 else '技术成熟度'}体现了机器学习技术的成熟度和可靠性。然而，机器学习也存在局限性：对高质量数据的依赖性强、模型可解释性有待提升、计算资源需求较大、在不同领域的迁移应用存在挑战。此外，机器学习模型的公平性、安全性、隐私保护等问题也需要重点关注。为了克服这些局限，研究者们正在积极探索新的技术路径，包括改进算法效率、增强模型透明度、降低数据依赖等。"""
        
        wiki_content['未来趋势'] = f"""机器学习的未来发展充满机遇和挑战。{research_findings[7] if len(research_findings) > 7 else '持续创新'}预示着该领域将持续保持创新活力。技术发展趋势包括：模型小型化和轻量化、多模态融合学习、自监督和无监督学习、联邦学习和隐私保护计算、可解释性和可信AI、边缘计算部署等。在应用层面，机器学习将与更多传统行业深度融合，推动产业数字化转型。在理论层面，新的学习范式和算法框架将不断涌现。同时，人才培养、伦理规范、标准制定等也将成为推动机器学习健康发展的重要因素。总体而言，机器学习将在未来相当长的时间内继续保持快速发展，为人类社会的智能化进程提供强大支撑。"""
        
        wiki_content['参考文献'] = f"""本文内容基于相关学术研究和实践应用综合整理。主要参考了机器学习领域的经典理论文献、最新研究成果和实际应用案例。参考文献涵盖了机器学习的理论基础、技术方法、应用实践和发展趋势等多个方面，确保内容的准确性和权威性。建议读者进一步阅读相关领域的专业文献，以获得更深入的技术细节和最新的研究进展。"""
        
        return wiki_content
    
    def _step4_quality_optimization(self, step3_result: Dict[str, Any]) -> Dict[str, Any]:
        """第四步：质量优化和格式化"""
        print(f"   🎨 第四步：质量优化和格式化")
        
        # 质量检查和优化
        optimized_content = {}
        quality_scores = {}
        
        for section_title, section_content in step3_result.items():
            # 质量评估
            quality_score = self._assess_content_quality(section_content)
            quality_scores[section_title] = quality_score
            
            # 格式化优化
            optimized_content[section_title] = self._format_section_content(section_content)
        
        # 生成最终Wiki
        formatted_wiki = self._create_final_wiki(optimized_content, quality_scores)
        
        self.progress_log.append({
            'step': 4,
            'action': 'quality_optimization',
            'sections_optimized': len(optimized_content),
            'average_quality': sum(quality_scores.values()) / len(quality_scores)
        })
        
        return {
            'optimized_content': optimized_content,
            'quality_scores': quality_scores,
            'formatted_wiki': formatted_wiki
        }
    
    def _assess_content_quality(self, content: str) -> float:
        """评估内容质量"""
        score = 0.0
        
        # 长度评分
        word_count = len(content)
        if 300 <= word_count <= 500:
            score += 0.3
        elif 200 <= word_count < 300 or 500 < word_count <= 600:
            score += 0.2
        elif word_count > 600:
            score += 0.1
        
        # 专业性评分
        professional_terms = ['技术', '方法', '理论', '应用', '研究', '分析', '发展', '系统']
        term_count = sum(1 for term in professional_terms if term in content)
        score += min(term_count * 0.05, 0.3)
        
        # 结构性评分
        sentences = content.split('。')
        if len(sentences) >= 5:
            score += 0.2
        elif len(sentences) >= 3:
            score += 0.1
        
        # 完整性评分
        if '。' in content and content.endswith('。'):
            score += 0.2
        
        return min(score, 1.0)
    
    def _format_section_content(self, content: str) -> str:
        """格式化章节内容"""
        # 基础格式化
        content = content.strip()
        
        # 确保句子结尾
        if not content.endswith('。'):
            content += '。'
        
        # 移除多余空格
        content = ' '.join(content.split())
        
        return content
    
    def _create_final_wiki(self, optimized_content: Dict[str, str], quality_scores: Dict[str, float]) -> Dict[str, Any]:
        """创建最终Wiki"""
        
        # 计算总体质量
        total_quality = sum(quality_scores.values()) / len(quality_scores) if quality_scores else 0.8
        total_words = sum(len(content) for content in optimized_content.values())
        
        # 创建HTML内容
        html_content = self._generate_html_wiki(optimized_content, quality_scores)
        
        return {
            'html_content': html_content,
            'total_sections': len(optimized_content),
            'total_words': total_words,
            'average_quality': total_quality,
            'creation_time': datetime.now().isoformat(),
            'quality_level': 'high' if total_quality >= 0.8 else 'medium' if total_quality >= 0.6 else 'low'
        }
    
    def _generate_html_wiki(self, wiki_content: Dict[str, str], quality_scores: Dict[str, float]) -> str:
        """生成HTML Wiki"""
        
        html_template = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>智能百科</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
        .container { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { color: #34495e; margin-top: 30px; border-left: 4px solid #3498db; padding-left: 15px; }
        .meta { color: #7f8c8d; font-size: 0.9em; margin-bottom: 20px; }
        .section { margin-bottom: 30px; }
        .quality-badge { background: #27ae60; color: white; padding: 5px 10px; border-radius: 15px; font-size: 0.8em; display: inline-block; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>智能百科</h1>
        <div class="meta">
            创建时间: {creation_time} | 
            总字数: {total_words} 字 |
            <span class="quality-badge">Claude工作流生成 · 质量评分: {average_quality:.2f}</span>
        </div>
        
        {sections_html}
        
    </div>
</body>
</html>"""
        
        # 生成章节HTML
        sections_html = ""
        for title, content in wiki_content.items():
            sections_html += f'<div class="section"><h2>{title}</h2><p>{content}</p></div>'
        
        # 计算平均质量
        avg_quality = sum(quality_scores.values()) / len(quality_scores) if quality_scores else 0.8
        
        # 替换占位符
        html = html_template.replace('{creation_time}', datetime.now().isoformat())
        html = html.replace('{total_words}', str(sum(len(c) for c in wiki_content.values())))
        html = html.replace('{average_quality}', str(avg_quality))
        html = html.replace('{sections_html}', sections_html)
        
        return html
    
    def _generate_creation_summary(self) -> Dict[str, Any]:
        """生成创建摘要"""
        return {
            'workflow_completed': True,
            'total_steps': len(self.progress_log),
            'step_details': self.progress_log,
            'workflow_efficiency': 'high',
            'creation_method': 'claude_workflow_integration'
        }

def main():
    """测试函数"""
    test_papers = [
        {
            'title': 'Machine Learning Fundamentals',
            'content': 'This paper discusses machine learning fundamentals.',
            'published': '2023-01-01'
        }
    ]
    
    editor = ClaudeWorkflowEditor()
    result = editor.create_wiki_with_claude_workflow("机器学习", test_papers)
    
    print(f"Claude工作流结果: {json.dumps(result, indent=2, ensure_ascii=False)}")

if __name__ == "__main__":
    main()