#!/usr/bin/env python3
"""
论文下载器 - 下载学术论文到本地并解析内容
"""

import os
import requests
import json
from typing import List, Dict, Any
from datetime import datetime
import PyPDF2
from io import BytesIO

class PaperDownloader:
    """论文下载器"""
    
    def __init__(self, download_dir: str = "papers"):
        self.download_dir = download_dir
        os.makedirs(download_dir, exist_ok=True)
    
    def download_papers(self, search_results: List[Dict[str, Any]], topic: str) -> List[Dict[str, Any]]:
        """下载论文到本地"""
        print(f"      📥 开始下载论文到本地...")
        
        downloaded_papers = []
        
        for i, result in enumerate(search_results[:5], 1):  # 下载前5篇
            paper_info = self._download_single_paper(result, topic, i)
            if paper_info:
                downloaded_papers.append(paper_info)
                print(f"         ✓ 下载完成: {paper_info['title']}")
        
        print(f"      📊 成功下载 {len(downloaded_papers)} 篇论文")
        return downloaded_papers
    
    def _download_single_paper(self, result: Dict[str, Any], topic: str, index: int) -> Dict[str, Any]:
        """下载单篇论文"""
        try:
            title = result.get('title', f'paper_{index}')
            url = result.get('url', '')
            
            if not url:
                return None
            
            # 清理标题作为文件名
            safe_title = self._sanitize_filename(title)
            
            # 尝试下载PDF
            pdf_url = self._get_pdf_url(url)
            if not pdf_url:
                print(f"         ⚠️ 未找到PDF链接: {title}")
                return None
            
            # 下载PDF文件
            response = requests.get(pdf_url, timeout=30)
            response.raise_for_status()
            
            # 保存PDF文件
            pdf_filename = f"{index:02d}_{safe_title}.pdf"
            pdf_path = os.path.join(self.download_dir, pdf_filename)
            
            with open(pdf_path, 'wb') as f:
                f.write(response.content)
            
            # 解析PDF内容
            content = self._extract_pdf_content(response.content)
            
            # 保存解析的文本
            txt_filename = f"{index:02d}_{safe_title}.txt"
            txt_path = os.path.join(self.download_dir, txt_filename)
            
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            paper_info = {
                'index': index,
                'title': title,
                'authors': result.get('authors', []),
                'published': result.get('published', ''),
                'source': result.get('source', ''),
                'url': url,
                'pdf_url': pdf_url,
                'pdf_path': pdf_path,
                'txt_path': txt_path,
                'content': content,
                'download_time': datetime.now().isoformat(),
                'word_count': len(content)
            }
            
            return paper_info
            
        except Exception as e:
            print(f"         ❌ 下载失败: {title} - {e}")
            return None
    
    def _get_pdf_url(self, arxiv_url: str) -> str:
        """获取PDF下载链接"""
        if 'arxiv.org/abs/' in arxiv_url:
            # 将 abs/ 替换为 pdf/
            pdf_url = arxiv_url.replace('/abs/', '/pdf/') + '.pdf'
            return pdf_url
        return None
    
    def _extract_pdf_content(self, pdf_data: bytes) -> str:
        """从PDF中提取文本内容"""
        try:
            pdf_file = BytesIO(pdf_data)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            content = ""
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text.strip():
                        content += f"\n--- 第{page_num + 1}页 ---\n"
                        content += page_text + "\n"
                except Exception as e:
                    print(f"         ⚠️ 页面 {page_num + 1} 解析失败: {e}")
                    continue
            
            return content.strip()
            
        except Exception as e:
            print(f"         ❌ PDF解析失败: {e}")
            return ""
    
    def _sanitize_filename(self, filename: str) -> str:
        """清理文件名中的非法字符"""
        # 移除或替换非法字符
        illegal_chars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*']
        for char in illegal_chars:
            filename = filename.replace(char, '_')
        
        # 限制长度
        if len(filename) > 100:
            filename = filename[:100]
        
        return filename.strip()
    
    def analyze_downloaded_papers(self, downloaded_papers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """分析下载的论文"""
        print(f"      🧠 开始学习和消化论文内容...")
        
        analysis = {
            'total_papers': len(downloaded_papers),
            'total_words': sum(p['word_count'] for p in downloaded_papers),
            'papers': [],
            'key_concepts': [],
            'research_methods': [],
            'findings': [],
            'future_directions': []
        }
        
        for paper in downloaded_papers:
            paper_analysis = self._analyze_single_paper(paper)
            analysis['papers'].append(paper_analysis)
            
            # 提取关键概念
            analysis['key_concepts'].extend(paper_analysis['key_concepts'])
            analysis['research_methods'].extend(paper_analysis['research_methods'])
            analysis['findings'].extend(paper_analysis['findings'])
            analysis['future_directions'].extend(paper_analysis['future_directions'])
        
        # 去重和整理
        analysis['key_concepts'] = list(set(analysis['key_concepts']))
        analysis['research_methods'] = list(set(analysis['research_methods']))
        analysis['findings'] = list(set(analysis['findings']))
        analysis['future_directions'] = list(set(analysis['future_directions']))
        
        print(f"      📚 学习完成，提取了 {len(analysis['key_concepts'])} 个关键概念")
        
        return analysis
    
    def _analyze_single_paper(self, paper: Dict[str, Any]) -> Dict[str, Any]:
        """分析单篇论文"""
        content = paper.get('content', '')
        
        # 简单的内容分析（实际应用中可以使用更复杂的NLP技术）
        analysis = {
            'title': paper['title'],
            'authors': paper['authors'],
            'key_concepts': self._extract_key_concepts(content),
            'research_methods': self._extract_research_methods(content),
            'findings': self._extract_findings(content),
            'future_directions': self._extract_future_directions(content),
            'summary': self._generate_summary(content)
        }
        
        return analysis
    
    def _extract_key_concepts(self, content: str) -> List[str]:
        """提取关键概念"""
        # 简单的关键词提取（基于常见学术术语）
        common_concepts = [
            'machine learning', 'deep learning', 'neural network', 'algorithm',
            'model', 'training', 'optimization', 'classification', 'regression',
            'clustering', 'feature extraction', 'data analysis', 'prediction',
            'supervised learning', 'unsupervised learning', 'reinforcement learning'
        ]
        
        concepts = []
        content_lower = content.lower()
        
        for concept in common_concepts:
            if concept in content_lower:
                concepts.append(concept)
        
        return concepts[:10]  # 返回前10个
    
    def _extract_research_methods(self, content: str) -> List[str]:
        """提取研究方法"""
        method_keywords = [
            'experiment', 'analysis', 'evaluation', 'comparison', 'benchmark',
            'simulation', 'case study', 'survey', 'review', 'empirical study',
            'theoretical analysis', 'statistical analysis', 'quantitative analysis'
        ]
        
        methods = []
        content_lower = content.lower()
        
        for method in method_keywords:
            if method in content_lower:
                methods.append(method)
        
        return methods[:5]
    
    def _extract_findings(self, content: str) -> List[str]:
        """提取研究发现"""
        findings = []
        
        # 查找包含"find", "result", "conclusion"等关键词的句子
        sentences = content.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in ['find', 'result', 'conclusion', 'show', 'demonstrate']):
                if len(sentence.strip()) > 20:  # 过滤短句子
                    findings.append(sentence.strip())
        
        return findings[:5]
    
    def _extract_future_directions(self, content: str) -> List[str]:
        """提取未来方向"""
        directions = []
        
        # 查找包含"future", "direction", "next", "potential"等关键词的句子
        sentences = content.split('.')
        for sentence in sentences:
            sentence_lower = sentence.lower()
            if any(keyword in sentence_lower for keyword in ['future', 'direction', 'next', 'potential', 'opportunity']):
                if len(sentence.strip()) > 20:
                    directions.append(sentence.strip())
        
        return directions[:3]
    
    def _generate_summary(self, content: str) -> str:
        """生成论文摘要"""
        # 简单的摘要生成（取前几句话）
        sentences = content.split('.')
        summary_sentences = []
        
        for sentence in sentences[:5]:  # 取前5句话
            sentence = sentence.strip()
            if len(sentence) > 10:
                summary_sentences.append(sentence)
        
        return '. '.join(summary_sentences) + '.' if summary_sentences else "摘要生成失败"

def main():
    """测试函数"""
    # 测试数据
    test_results = [
        {
            'title': 'Test Paper on Machine Learning',
            'url': 'http://arxiv.org/abs/1806.02690v2',
            'authors': ['Test Author'],
            'published': '2023-01-01'
        }
    ]
    
    downloader = PaperDownloader()
    papers = downloader.download_papers(test_results, "machine learning")
    
    if papers:
        analysis = downloader.analyze_downloaded_papers(papers)
        print(f"分析结果: {json.dumps(analysis, indent=2, ensure_ascii=False)}")

if __name__ == "__main__":
    main()