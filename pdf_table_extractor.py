#!/usr/bin/env python3
import os
import sys
import pandas as pd
import json
from pathlib import Path

try:
    import tabula
    HAS_TABULA = True
except ImportError:
    HAS_TABULA = False
    print('需要安装 tabula-py: pip install tabula-py')

class PDFTableExtractor:
    def __init__(self, pdf_path):
        self.pdf_path = pdf_path
        self.tables = []
        
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f'PDF文件不存在: {pdf_path}')
    
    def extract_tables(self, pages='all'):
        if not HAS_TABULA:
            print('Tabula不可用，请先安装相关依赖')
            return []
            
        print(f'正在提取页面 {pages} 的表格...')
        try:
            tables = tabula.read_pdf(
                self.pdf_path,
                pages=pages,
                multiple_tables=True,
                pandas_options={'header': 0}
            )
            self.tables = tables
            print(f'成功提取到 {len(tables)} 个表格')
            return tables
        except Exception as e:
            print(f'提取失败: {e}')
            return []
    
    def export_to_excel(self, output_path):
        if not self.tables:
            print('没有表格数据可导出')
            return
            
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            for i, table in enumerate(self.tables):
                table.to_excel(writer, sheet_name=f'Table_{i+1}', index=False)
        print(f'表格已导出到: {output_path}')
    
    def print_summary(self):
        if not self.tables:
            print('未找到表格数据')
            return
            
        print(f'
找到 {len(self.tables)} 个表格:')
        for i, table in enumerate(self.tables):
            print(f'表格 {i+1}: {table.shape[0]}行 x {table.shape[1]}列')

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print('用法: python pdf_table_extractor.py <PDF文件路径>')
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    extractor = PDFTableExtractor(pdf_path)
    extractor.extract_tables()
    extractor.print_summary()
    
    # 自动导出到Excel
    if extractor.tables:
        output_name = Path(pdf_path).stem + '_tables.xlsx'
        extractor.export_to_excel(output_name)
