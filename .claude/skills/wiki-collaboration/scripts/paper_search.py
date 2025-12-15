#!/usr/bin/env python3
"""
论文搜索和下载系统 - 为Wiki创建提供学术资源支持
"""

import requests
import json
import re
import time
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import os
from urllib.parse import quote

@dataclass
class Paper:
    """论文信息"""
    title: str
    authors: List[str]
    abstract: str
    year: int
    venue: str
    url: str
    doi: Optional[str] = None
    citations: int = 0
    pdf_url: Optional[str] = None
    keywords: List[str] = None
    
    def __post_init__(self):
        if self.keywords is None:
            self.keywords = []

class AcademicSearchEngine:
    """学术搜索引擎"""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        self.arxiv_base_url = "http://export.arxiv.org/api/query"
        self.semantic_scholar_url = "https://api.semanticscholar.org/graph/v1/paper/search"
    
    def search_papers(self, query: str, max_results: int = 10, 
                     year_range: Optional[Tuple[int, int]] = None) -> List[Paper]:
        """搜索论文"""
        print(f"🔍 正在搜索论文: {query}")
        
        all_papers = []
        
        # 从arXiv搜索
        arxiv_papers = self._search_arxiv(query, max_results // 2, year_range)
        all_papers.extend(arxiv_papers)
        
        # 从Semantic Scholar搜索
        ss_papers = self._search_semantic_scholar(query, max_results - len(arxiv_papers), year_range)
        all_papers.extend(ss_papers)
        
        # 去重并排序
        unique_papers = self._deduplicate_papers(all_papers)
        sorted_papers = sorted(unique_papers, key=lambda p: p.citations, reverse=True)
        
        print(f"✅ 找到 {len(sorted_papers)} 篇相关论文")
        return sorted_papers[:max_results]
    
    def _search_arxiv(self, query: str, max_results: int, 
                      year_range: Optional[Tuple[int, int]]) -> List[Paper]:
        """从arXiv搜索"""
        try:
            params = {
                'search_query': f'all:{query}',
                'start': 0,
                'max_results': max_results,
                'sortBy': 'relevance',
                'sortOrder': 'descending'
            }
            
            response = self.session.get(self.arxiv_base_url, params=params, timeout=10)
            response.raise_for_status()
            
            papers = self._parse_arxiv_response(response.text)
            
            # 年份过滤
            if year_range:
                papers = [p for p in papers if year_range[0] <= p.year <= year_range[1]]
            
            return papers
            
        except Exception as e:
            print(f"⚠️ arXiv搜索失败: {e}")
            return []
    
    def _parse_arxiv_response(self, xml_text: str) -> List[Paper]:
        """解析arXiv响应"""
        import xml.etree.ElementTree as ET
        
        papers = []
        root = ET.fromstring(xml_text)
        
        # 定义命名空间
        namespaces = {
            'atom': 'http://www.w3.org/2005/Atom',
            'arxiv': 'http://arxiv.org/schemas/atom'
        }
        
        for entry in root.findall('atom:entry', namespaces):
            try:
                title = entry.find('atom:title', namespaces).text.strip()
                
                # 提取作者
                authors = []
                for author in entry.findall('atom:author', namespaces):
                    name = author.find('atom:name', namespaces).text
                    authors.append(name)
                
                # 提取摘要
                abstract = entry.find('atom:summary', namespaces).text.strip()
                
                # 提取年份
                published = entry.find('atom:published', namespaces).text
                year = int(published.split('-')[0])
                
                # 提取链接
                url = entry.find('atom:id', namespaces).text
                
                # 提取PDF链接
                pdf_link = entry.find('atom:link[@title="pdf"]', namespaces)
                pdf_url = pdf_link.get('href') if pdf_link is not None else None
                
                # 提取arXiv ID作为DOI
                arxiv_id = url.split('/')[-1]
                doi = f"arXiv:{arxiv_id}"
                
                # 提取类别作为关键词
                categories = []
                for category in entry.findall('arxiv:primary_category', namespaces):
                    categories.append(category.get('term'))
                
                paper = Paper(
                    title=title,
                    authors=authors,
                    abstract=abstract,
                    year=year,
                    venue="arXiv",
                    url=url,
                    doi=doi,
                    pdf_url=pdf_url,
                    keywords=categories
                )
                
                papers.append(paper)
                
            except Exception as e:
                print(f"⚠️ 解析论文失败: {e}")
                continue
        
        return papers
    
    def _search_semantic_scholar(self, query: str, max_results: int, 
                                year_range: Optional[Tuple[int, int]]) -> List[Paper]:
        """从Semantic Scholar搜索"""
        try:
            params = {
                'query': query,
                'limit': min(max_results, 100),  # API限制
                'fields': 'title,authors,abstract,year,venue,citationCount,url,doi,paperId'
            }
            
            response = self.session.get(self.semantic_scholar_url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            papers = []
            
            for item in data.get('data', []):
                try:
                    # 提取作者
                    authors = []
                    for author in item.get('authors', []):
                        authors.append(author.get('name', ''))
                    
                    # 提取关键词（从标题中）
                    keywords = self._extract_keywords_from_title(item.get('title', ''))
                    
                    paper = Paper(
                        title=item.get('title', ''),
                        authors=authors,
                        abstract=item.get('abstract', ''),
                        year=item.get('year', 0),
                        venue=item.get('venue', ''),
                        url=item.get('url', ''),
                        doi=item.get('doi', ''),
                        citations=item.get('citationCount', 0),
                        keywords=keywords
                    )
                    
                    # 年份过滤
                    if year_range:
                        if year_range[0] <= paper.year <= year_range[1]:
                            papers.append(paper)
                    else:
                        papers.append(paper)
                
                except Exception as e:
                    print(f"⚠️ 解析Semantic Scholar论文失败: {e}")
                    continue
            
            return papers
            
        except Exception as e:
            print(f"⚠️ Semantic Scholar搜索失败: {e}")
            return []
    
    def _extract_keywords_from_title(self, title: str) -> List[str]:
        """从标题中提取关键词"""
        # 简单的关键词提取
        keywords = []
        
        # 常见的技术术语
        tech_terms = [
            'Machine Learning', 'Deep Learning', 'Neural Network', 'Algorithm',
            'Artificial Intelligence', 'Data Science', 'Computer Vision',
            'Natural Language Processing', 'Reinforcement Learning',
            '机器学习', '深度学习', '神经网络', '算法', '人工智能',
            '数据科学', '计算机视觉', '自然语言处理', '强化学习'
        ]
        
        for term in tech_terms:
            if term.lower() in title.lower():
                keywords.append(term)
        
        return keywords
    
    def _deduplicate_papers(self, papers: List[Paper]) -> List[Paper]:
        """去重论文"""
        seen = set()
        unique_papers = []
        
        for paper in papers:
            # 使用标题和年份作为去重标识
            identifier = (paper.title.lower(), paper.year)
            if identifier not in seen:
                seen.add(identifier)
                unique_papers.append(paper)
        
        return unique_papers
    
    def download_paper(self, paper: Paper, download_dir: str = "downloads") -> Optional[str]:
        """下载论文PDF"""
        if not paper.pdf_url:
            print(f"⚠️ 论文 {paper.title} 没有PDF链接")
            return None
        
        try:
            # 创建下载目录
            os.makedirs(download_dir, exist_ok=True)
            
            # 生成文件名
            safe_title = re.sub(r'[^\w\s-]', '', paper.title)[:50]
            filename = f"{safe_title}_{paper.year}.pdf"
            filepath = os.path.join(download_dir, filename)
            
            # 检查文件是否已存在
            if os.path.exists(filepath):
                print(f"📄 论文已存在: {filename}")
                return filepath
            
            # 下载文件
            print(f"📥 正在下载: {paper.title}")
            response = self.session.get(paper.pdf_url, stream=True, timeout=30)
            response.raise_for_status()
            
            # 保存文件
            with open(filepath, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            print(f"✅ 下载完成: {filename}")
            return filepath
            
        except Exception as e:
            print(f"⚠️ 下载失败: {e}")
            return None

class PaperAnalyzer:
    """论文分析器"""
    
    def __init__(self):
        self.stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            '的', '了', '和', '是', '在', '有', '我', '你', '他', '她', '它', '们', '这', '那'
        }
    
    def analyze_paper(self, paper: Paper) -> Dict[str, Any]:
        """分析论文内容"""
        analysis = {
            "paper_id": paper.doi or paper.url,
            "title": paper.title,
            "key_contributions": self._extract_key_contributions(paper.abstract),
            "methodology": self._extract_methodology(paper.abstract),
            "findings": self._extract_findings(paper.abstract),
            "limitations": self._identify_limitations(paper.abstract),
            "future_work": self._extract_future_work(paper.abstract),
            "relevance_score": self._calculate_relevance_score(paper),
            "quality_indicators": self._assess_quality(paper)
        }
        
        return analysis
    
    def _extract_key_contributions(self, abstract: str) -> List[str]:
        """提取关键贡献"""
        contributions = []
        
        # 寻找贡献相关的句子
        contribution_patterns = [
            r'(?:we|this paper|our work) (?:propose|present|introduce|develop) (.+?)(?:\.|$)',
            r'(?:contribution|contribute|novelty) (.+?)(?:\.|$)',
            r'(?:main contribution|key contribution) (.+?)(?:\.|$)'
        ]
        
        for pattern in contribution_patterns:
            matches = re.findall(pattern, abstract, re.IGNORECASE)
            for match in matches:
                contributions.append(match.strip())
        
        return contributions[:3]  # 返回最多3个贡献
    
    def _extract_methodology(self, abstract: str) -> List[str]:
        """提取方法论"""
        methodology = []
        
        # 寻找方法相关的词汇
        method_patterns = [
            r'(?:method|approach|technique|algorithm) (.+?)(?:\.|$)',
            r'(?:using|by|through) (.+?)(?:\.|$)',
            r'(?:we use|we employ|we apply) (.+?)(?:\.|$)'
        ]
        
        for pattern in method_patterns:
            matches = re.findall(pattern, abstract, re.IGNORECASE)
            for match in matches:
                methodology.append(match.strip())
        
        return methodology[:3]
    
    def _extract_findings(self, abstract: str) -> List[str]:
        """提取发现"""
        findings = []
        
        # 寻找结果相关的句子
        finding_patterns = [
            r'(?:result|finding|show|demonstrate|indicate) (.+?)(?:\.|$)',
            r'(?:we find|we show|we demonstrate) (.+?)(?:\.|$)',
            r'(?:experiment|evaluation) (.+?)(?:\.|$)'
        ]
        
        for pattern in finding_patterns:
            matches = re.findall(pattern, abstract, re.IGNORECASE)
            for match in matches:
                findings.append(match.strip())
        
        return findings[:3]
    
    def _identify_limitations(self, abstract: str) -> List[str]:
        """识别局限性"""
        limitations = []
        
        # 寻找限制相关的词汇
        limitation_patterns = [
            r'(?:limitation|limit|challenge) (.+?)(?:\.|$)',
            r'(?:however|but|although) (.+?)(?:\.|$)',
            r'(?:future work|future direction) (.+?)(?:\.|$)'
        ]
        
        for pattern in limitation_patterns:
            matches = re.findall(pattern, abstract, re.IGNORECASE)
            for match in matches:
                limitations.append(match.strip())
        
        return limitations[:2]
    
    def _extract_future_work(self, abstract: str) -> List[str]:
        """提取未来工作"""
        future_work = []
        
        # 寻找未来工作相关的句子
        future_patterns = [
            r'(?:future work|future direction|future research) (.+?)(?:\.|$)',
            r'(?:in the future|next steps) (.+?)(?:\.|$)',
            r'(?:plan to|will) (.+?)(?:\.|$)'
        ]
        
        for pattern in future_patterns:
            matches = re.findall(pattern, abstract, re.IGNORECASE)
            for match in matches:
                future_work.append(match.strip())
        
        return future_work[:2]
    
    def _calculate_relevance_score(self, paper: Paper) -> float:
        """计算相关性评分"""
        score = 0.5  # 基础分数
        
        # 基于引用数
        if paper.citations > 100:
            score += 0.2
        elif paper.citations > 10:
            score += 0.1
        
        # 基于年份（较新的论文更有价值）
        current_year = datetime.now().year
        if current_year - paper.year <= 2:
            score += 0.2
        elif current_year - paper.year <= 5:
            score += 0.1
        
        # 基于期刊/会议质量
        high_quality_venues = [
            'Nature', 'Science', 'Cell', 'NeurIPS', 'ICML', 'ICLR', 'AAAI',
            'IJCAI', 'CVPR', 'ICCV', 'ECCV', 'ACL', 'EMNLP'
        ]
        if any(venue in paper.venue for venue in high_quality_venues):
            score += 0.1
        
        return min(score, 1.0)
    
    def _assess_quality(self, paper: Paper) -> Dict[str, Any]:
        """评估论文质量"""
        quality = {
            "citation_impact": "high" if paper.citations > 100 else "medium" if paper.citations > 10 else "low",
            "recency": "recent" if datetime.now().year - paper.year <= 2 else "moderate",
            "venue_quality": "high" if any(q in paper.venue for q in ['Nature', 'Science', 'NeurIPS']) else "medium",
            "author_count": "adequate" if 2 <= len(paper.authors) <= 6 else "needs_review"
        }
        
        return quality

def main():
    """主函数"""
    import sys
    
    if len(sys.argv) < 2:
        print("用法: python paper_search.py <搜索关键词> [最大结果数]")
        print("示例: python paper_search.py 机器学习 5")
        return
    
    query = sys.argv[1]
    max_results = int(sys.argv[2]) if len(sys.argv) > 2 else 10
    
    # 创建搜索引擎
    search_engine = AcademicSearchEngine()
    
    # 搜索论文
    papers = search_engine.search_papers(query, max_results)
    
    if not papers:
        print(f"❌ 未找到关于'{query}'的论文")
        return
    
    print(f"\n📚 找到 {len(papers)} 篇论文:")
    print("=" * 60)
    
    # 分析论文
    analyzer = PaperAnalyzer()
    
    for i, paper in enumerate(papers, 1):
        print(f"\n{i}. {paper.title}")
        print(f"   作者: {', '.join(paper.authors[:3])}{'...' if len(paper.authors) > 3 else ''}")
        print(f"   年份: {paper.year} | 引用: {paper.citations}")
        print(f"   期刊: {paper.venue}")
        print(f"   摘要: {paper.abstract[:150]}...")
        
        # 分析论文
        analysis = analyzer.analyze_paper(paper)
        print(f"   相关性: {analysis['relevance_score']:.2f}")
        print(f"   关键贡献: {len(analysis['key_contributions'])} 项")
        
        # 下载选项
        if paper.pdf_url:
            print(f"   PDF: {paper.pdf_url}")
    
    # 保存结果
    result = {
        "query": query,
        "timestamp": datetime.now().isoformat(),
        "papers": [
            {
                "title": p.title,
                "authors": p.authors,
                "year": p.year,
                "venue": p.venue,
                "abstract": p.abstract,
                "citations": p.citations,
                "url": p.url,
                "doi": p.doi,
                "pdf_url": p.pdf_url,
                "keywords": p.keywords
            }
            for p in papers
        ]
    }
    
    output_file = f"papers_{query}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 搜索结果已保存到: {output_file}")

if __name__ == "__main__":
    main()
