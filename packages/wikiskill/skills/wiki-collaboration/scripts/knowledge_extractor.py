#!/usr/bin/env python3
"""
Wiki知识提取器
从搜索结果和文档中提取结构化知识
"""

import json
import re
import sys
from typing import Dict, List, Any
from dataclasses import dataclass
from pathlib import Path

@dataclass
class KnowledgePoint:
    """知识点数据结构"""
    title: str
    content: str
    source: str
    confidence: float
    category: str
    keywords: List[str]

class KnowledgeExtractor:
    """知识提取器主类"""
    
    def __init__(self):
        self.knowledge_points = []
        self.categories = ["概念", "技术", "应用", "案例", "原理", "历史", "趋势"]
    
    def extract_from_text(self, text: str, source: str = "unknown") -> List[KnowledgePoint]:
        """从文本中提取知识点"""
        knowledge_points = []
        
        # 按段落分割文本
        paragraphs = text.split('\n\n')
        
        for paragraph in paragraphs:
            if len(paragraph.strip()) < 20:  # 跳过过短的段落
                continue
                
            # 提取标题
            title = self._extract_title(paragraph)
            
            # 分类
            category = self._classify_content(paragraph)
            
            # 提取关键词
            keywords = self._extract_keywords(paragraph)
            
            # 计算置信度
            confidence = self._calculate_confidence(paragraph)
            
            knowledge_point = KnowledgePoint(
                title=title,
                content=paragraph.strip(),
                source=source,
                confidence=confidence,
                category=category,
                keywords=keywords
            )
            
            knowledge_points.append(knowledge_point)
        
        return knowledge_points
    
    def _extract_title(self, text: str) -> str:
        """提取标题"""
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            # 查找可能的标题行
            if line and (line[0].isupper() or line.startswith('#') or len(line) < 100):
                return line[:50] + "..." if len(line) > 50 else line
        
        # 如果没有找到明确的标题，使用前50个字符
        return text[:50] + "..." if len(text) > 50 else text
    
    def _classify_content(self, text: str) -> str:
        """内容分类"""
        text_lower = text.lower()
        
        category_keywords = {
            "概念": ["定义", "概念", "含义", "是指", "所谓"],
            "技术": ["技术", "方法", "算法", "实现", "工具"],
            "应用": ["应用", "使用", "场景", "案例", "实践"],
            "案例": ["案例", "例子", "实例", "示范", "示例"],
            "原理": ["原理", "机制", "工作原理", "基础", "理论"],
            "历史": ["历史", "发展", "起源", "演变", "背景"],
            "趋势": ["趋势", "未来", "发展", "前景", "方向"]
        }
        
        scores = {}
        for category, keywords in category_keywords.items():
            score = sum(1 for keyword in keywords if keyword in text_lower)
            scores[category] = score
        
        # 返回得分最高的分类
        if max(scores.values()) == 0:
            return "其他"
        
        return max(scores, key=scores.get)
    
    def _extract_keywords(self, text: str) -> List[str]:
        """提取关键词"""
        # 简单的关键词提取（可以替换为更复杂的NLP方法）
        words = re.findall(r'\b\w{3,}\b', text.lower())
        
        # 过滤常见词
        stop_words = {'的', '是', '在', '了', '和', '与', '或', '但', '而', '就', '都', '要', '可以', '这个', '那个'}
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
        
        # 统计词频并返回前5个
        word_freq = {}
        for word in keywords:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        return sorted(word_freq.keys(), key=lambda x: word_freq[x], reverse=True)[:5]
    
    def _calculate_confidence(self, text: str) -> float:
        """计算置信度"""
        # 基于多个因素计算置信度
        factors = {
            'length': min(len(text) / 500, 1.0),  # 文本长度
            'structure': 1.0 if '。' in text or '.' in text else 0.5,  # 句子结构
            'references': 0.2 * text.count('http'),  # 参考链接
            'technical': 0.1 * len(re.findall(r'[A-Z]{2,}', text))  # 技术术语
        }
        
        confidence = sum(factors.values()) / len(factors)
        return min(confidence, 1.0)
    
    def build_knowledge_graph(self, knowledge_points: List[KnowledgePoint]) -> Dict[str, Any]:
        """构建知识图谱"""
        graph = {
            'nodes': [],
            'edges': []
        }
        
        # 添加节点
        for i, kp in enumerate(knowledge_points):
            node = {
                'id': i,
                'title': kp.title,
                'category': kp.category,
                'confidence': kp.confidence,
                'keywords': kp.keywords
            }
            graph['nodes'].append(node)
        
        # 添加边（基于关键词相似性）
        for i in range(len(knowledge_points)):
            for j in range(i + 1, len(knowledge_points)):
                similarity = self._calculate_similarity(
                    knowledge_points[i].keywords,
                    knowledge_points[j].keywords
                )
                if similarity > 0.3:  # 相似度阈值
                    edge = {
                        'source': i,
                        'target': j,
                        'weight': similarity
                    }
                    graph['edges'].append(edge)
        
        return graph
    
    def _calculate_similarity(self, keywords1: List[str], keywords2: List[str]) -> float:
        """计算关键词相似度"""
        set1, set2 = set(keywords1), set(keywords2)
        intersection = set1.intersection(set2)
        union = set1.union(set2)
        
        if not union:
            return 0.0
        
        return len(intersection) / len(union)
    
    def export_to_json(self, knowledge_points: List[KnowledgePoint], filename: str):
        """导出为JSON格式"""
        data = []
        for kp in knowledge_points:
            data.append({
                'title': kp.title,
                'content': kp.content,
                'source': kp.source,
                'confidence': kp.confidence,
                'category': kp.category,
                'keywords': kp.keywords
            })
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("使用方法: python knowledge_extractor.py --query '搜索查询'")
        print("       python knowledge_extractor.py --file '文本文件'")
        sys.exit(1)
    
    extractor = KnowledgeExtractor()
    
    if sys.argv[1] == "--query":
        query = sys.argv[2]
        # 这里可以集成实际的搜索功能
        print(f"模拟搜索: {query}")
        sample_text = f"关于{query}的知识内容。这是一个示例文本，包含了相关的概念、技术和应用。"
        
    elif sys.argv[1] == "--file":
        filename = sys.argv[2]
        with open(filename, 'r', encoding='utf-8') as f:
            sample_text = f.read()
    
    # 提取知识点
    knowledge_points = extractor.extract_from_text(sample_text)
    
    # 构建知识图谱
    graph = extractor.build_knowledge_graph(knowledge_points)
    
    # 输出结果
    print(f"提取了 {len(knowledge_points)} 个知识点")
    print(f"构建了 {len(graph['edges'])} 个关联")
    
    # 导出结果
    extractor.export_to_json(knowledge_points, "knowledge_points.json")
    
    # 输出知识图谱
    with open("knowledge_graph.json", 'w', encoding='utf-8') as f:
        json.dump(graph, f, ensure_ascii=False, indent=2)
    
    print("结果已保存到 knowledge_points.json 和 knowledge_graph.json")

if __name__ == "__main__":
    main()