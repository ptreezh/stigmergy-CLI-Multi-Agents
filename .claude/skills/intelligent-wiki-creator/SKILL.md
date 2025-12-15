---
name: intelligent-wiki-creator
description: 自顶向下任务分解的智能Wiki创建系统，结合定量化脚本和定性思维模式，实现多层次渐进式披露。
allowed-tools: ["bash", "text_editor", "web_search", "computer"]
---

# 智能Wiki创建系统 - 自顶向下任务分解架构

## 系统设计理念

### 核心能力
1. **自顶向下任务分解**：将复杂Wiki创建任务分解为可执行的子任务
2. **定性与定量结合**：确定性任务用脚本实现，定性任务用思维模式提示
3. **多层次实现**：战略层、战术层、执行层分层处理
4. **渐进式披露**：根据任务进展逐步展示信息和功能

## 任务分解架构

### 第一层：战略规划层 (Strategic Layer)
```bash
# 确定性任务：任务分解和规划
bash scripts/strategic_planner.sh --topic "用户主题" --mode "decompose"
```
- 主题复杂度评估
- 资源需求分析
- 时间规划制定
- 质量标准设定

### 第二层：战术执行层 (Tactical Layer)
```bash
# 定量任务：数据收集和分析
python scripts/data_collector.py --topic "主题" --metrics "quantitative"
```
- 文献检索量化
- 数据质量评估
- 覆盖度分析
- 相关性评分

### 第三层：操作执行层 (Operational Layer)
```bash
# 混合任务：内容生成和优化
python scripts/content_generator.py --topic "主题" --mode "hybrid"
```
- 结构化内容生成
- 质量评估
- 格式优化
- 最终输出

## 渐进式披露机制

### 阶段1：任务理解与规划
- 披露：任务分解结果
- 隐藏：具体执行细节
- 交互：用户确认规划

### 阶段2：数据收集与验证
- 披露：数据来源和质量指标
- 隐藏：原始数据处理过程
- 交互：数据质量确认

### 阶段3：内容生成与优化
- 披露：生成的内容结构
- 隐藏：内部推理过程
- 交互：内容反馈和调整

### 阶段4：质量控制与交付
- 披露：最终Wiki内容
- 隐藏：质量评估细节
- 交互：最终确认

## 具体实施流程

### 启动命令
```bash
# 用户输入
create_wiki "机器学习" --depth "comprehensive" --style "academic"
```

### 系统响应
```bash
# 自动执行任务分解
echo "🎯 任务分解开始..."
python scripts/task_decomposer.py --input "机器学习" --output "task_plan.json"

# 显示分解结果（渐进式披露）
echo "📋 任务规划："
echo "  1. 主题分析 (2分钟)"
echo "  2. 文献检索 (5分钟)"
echo "  3. 内容生成 (10分钟)"
echo "  4. 质量控制 (3分钟)"
echo "  总计：20分钟"

# 用户确认
read -p "是否继续执行？(y/n): " confirmation
```

## 分层实现细节

### 战略层实现 (scripts/strategic_planner.sh)
```bash
#!/bin/bash
# 确定性任务分解脚本

TOPIC="$1"
MODE="$2"

# 任务分解规则
case "$MODE" in
    "decompose")
        # 复杂度评估
        COMPLEXITY=$(python scripts/complexity_assessor.py --topic "$TOPIC")
        
        # 资源需求计算
        RESOURCES=$(python scripts/resource_calculator.py --complexity "$COMPLEXITY")
        
        # 输出规划
        cat > task_plan.json << EOF
{
    "topic": "$TOPIC",
    "complexity": "$COMPLEXITY",
    "estimated_time": "$RESOURCES",
    "phases": [
        {"name": "analysis", "time": 120},
        {"name": "research", "time": 300},
        {"name": "generation", "time": 600},
        {"name": "quality", "time": 180}
    ]
}
EOF
        ;;
esac
```

### 战术层实现 (scripts/data_collector.py)
```python
#!/usr/bin/env python3
# 定量数据收集脚本

import json
import requests
from typing import Dict, List

class DataCollector:
    def __init__(self):
        self.metrics = {
            "source_count": 0,
            "quality_score": 0.0,
            "coverage_rate": 0.0,
            "relevance_score": 0.0
        }
    
    def collect_sources(self, topic: str) -> List[Dict]:
        # 定量：搜索结果数量
        sources = self._search_sources(topic)
        self.metrics["source_count"] = len(sources)
        
        # 定量：质量评分
        for source in sources:
            quality = self._assess_quality(source)
            self.metrics["quality_score"] += quality
        
        self.metrics["quality_score"] /= len(sources)
        
        return sources
    
    def _search_sources(self, topic: str) -> List[Dict]:
        # 实际搜索实现
        # 返回真实搜索结果
        pass
    
    def _assess_quality(self, source: Dict) -> float:
        # 定量质量评估
        score = 0.0
        
        # 来源权威性
        if "university" in source.get("url", "").lower():
            score += 0.3
        if "arxiv" in source.get("url", "").lower():
            score += 0.2
        
        # 内容长度
        content_length = len(source.get("content", ""))
        if content_length > 1000:
            score += 0.2
        elif content_length > 500:
            score += 0.1
        
        return min(score, 1.0)
```

### 操作层实现 (scripts/content_generator.py)
```python
#!/usr/bin/env python3
# 混合内容生成脚本

import json
from typing import Dict, Any

class ContentGenerator:
    def __init__(self):
        self.llm_prompt_template = """
作为Wiki内容专家，基于以下信息创建专业内容：

主题：{topic}
数据源：{sources}
量化指标：{metrics}

请生成结构化的Wiki内容，包含：
1. 准确定义
2. 核心原理
3. 应用场景
4. 发展趋势

要求：
- 基于数据源信息
- 保持学术严谨性
- 字数控制在800-1200字
        """
    
    def generate_content(self, topic: str, sources: List[Dict], metrics: Dict) -> Dict[str, Any]:
        # 定性：思维模式提示
        prompt = self.llm_prompt_template.format(
            topic=topic,
            sources=json.dumps(sources[:3], ensure_ascii=False, indent=2),
            metrics=json.dumps(metrics, ensure_ascii=False, indent=2)
        )
        
        # 调用LLM生成内容
        content = self._call_llm(prompt)
        
        # 定量：结构化处理
        structured_content = self._structure_content(content)
        
        # 定量：质量评估
        quality_score = self._assess_content_quality(structured_content)
        
        return {
            "content": structured_content,
            "quality_score": quality_score,
            "word_count": len(structured_content),
            "sources_used": len(sources)
        }
    
    def _call_llm(self, prompt: str) -> str:
        # 实际LLM调用
        # 返回生成的内容
        pass
    
    def _structure_content(self, content: str) -> str:
        # 结构化处理
        return content
    
    def _assess_content_quality(self, content: str) -> float:
        # 定量质量评估
        score = 0.0
        
        # 长度评分
        word_count = len(content)
        if 800 <= word_count <= 1200:
            score += 0.3
        elif 600 <= word_count < 800:
            score += 0.2
        elif word_count > 1200:
            score += 0.1
        
        # 结构评分
        if "定义" in content and "原理" in content and "应用" in content:
            score += 0.4
        
        # 专业性评分
        professional_terms = ["算法", "模型", "系统", "技术", "方法"]
        term_count = sum(1 for term in professional_terms if term in content)
        score += min(term_count * 0.1, 0.3)
        
        return min(score, 1.0)
```

## 用户交互接口

### 命令行接口
```bash
# 基础创建
create_wiki "机器学习"

# 指定深度
create_wiki "机器学习" --depth "basic|comprehensive|advanced"

# 指定风格
create_wiki "机器学习" --style "academic|technical|practical"

# 自定义配置
create_wiki "机器学习" --config config.json
```

### 配置文件 (config.json)
```json
{
    "depth": "comprehensive",
    "style": "academic",
    "sources": {
        "min_quality": 0.7,
        "max_sources": 10,
        "preferred_domains": ["academic", "technical"]
    },
    "content": {
        "min_word_count": 800,
        "max_word_count": 2000,
        "required_sections": ["definition", "principles", "applications"]
    },
    "quality": {
        "min_score": 0.8,
        "auto_revision": true
    }
}
```

## 质量保证机制

### 定量指标
- 数据源数量和质量
- 内容长度和结构
- 质量评分阈值
- 执行时间控制

### 定性评估
- 内容逻辑性
- 专业性判断
- 用户满意度
- 持续改进机制

### 自动化测试
```bash
# 运行完整测试套件
bash scripts/test_suite.sh --topic "机器学习"

# 单独测试每个组件
python scripts/test_data_collector.py
python scripts/test_content_generator.py
python scripts/test_quality_control.py
```

## 扩展能力

### 新增任务类型
```bash
# 对比分析
create_wiki "深度学习 vs 机器学习" --type "comparison"

# 技术教程
create_wiki "Python机器学习教程" --type "tutorial"

# 行业报告
create_wiki "机器学习在金融业应用" --type "industry"
```

### 自定义插件
```python
# 插件接口
class WikiPlugin:
    def process(self, topic: str, data: Dict) -> Dict:
        # 自定义处理逻辑
        pass

# 注册插件
register_plugin("custom_analyzer", CustomAnalyzer())
```

这个系统通过自顶向下的任务分解，将复杂的Wiki创建过程分解为可管理的子任务，结合定量脚本和定性思维模式，实现多层次渐进式披露，确保每个步骤都透明可控。