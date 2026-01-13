// validate-constraints.js
// 文档约束验证器（Node.js 版本）

const fs = require('fs');
const path = require('path');

class DocumentConstraintValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  validateAll() {
    console.log('开始验证文档约束...');
    console.log('');
    
    this.validateDocumentRelationships();
    this.validateCrossReferences();
    this.validateTraceabilityMatrices();
    this.validateLogicConsistency();
    this.validateSpeckitCompliance();
    
    this.reportResults();
  }

  validateDocumentRelationships() {
    console.log('验证文档关系约束...');
    
    const docs = this.getMarkdownFiles('refractdoc');
    
    for (const doc of docs) {
      const content = fs.readFileSync(`refractdoc/${doc}`, 'utf8');
      
      if (!content.includes('## 文档层次结构')) {
        this.errors.push(`${doc} 缺少'文档层次结构'章节`);
      }
      
      if (!content.includes('### 依赖关系')) {
        this.errors.push(`${doc} 缺少'依赖关系'章节`);
      }
      
      if (!content.includes('### 文档用途')) {
        this.errors.push(`${doc} 缺少'文档用途'章节`);
      }
    }
    
    console.log(`  - 发现 ${this.errors.filter(e => e.includes('文档层次结构') || e.includes('依赖关系') || e.includes('文档用途')).length} 个错误`);
  }

  validateCrossReferences() {
    console.log('验证交叉引用约束...');
    
    const docs = this.getMarkdownFiles('refractdoc');
    
    for (const doc of docs) {
      const content = fs.readFileSync(`refractdoc/${doc}`, 'utf8');
      
      if (!content.includes('## 相关文档')) {
        this.errors.push(`${doc} 缺少'相关文档'章节`);
      }
      
      // 检查引用格式
      const links = content.match(/\[.*\]\(\.\/.*\.md\)/g) || [];
      for (const link of links) {
        const match = link.match(/\(\.\/(.*\.md)\)/);
        if (match) {
          const referencedDoc = match[1];
          if (!fs.existsSync(`refractdoc/${referencedDoc}`)) {
            this.warnings.push(`${doc} 可能引用了不存在的文档 ${referencedDoc}`);
          }
        }
      }
    }
    
    console.log(`  - 发现 ${this.errors.filter(e => e.includes('相关文档')).length} 个错误`);
    console.log(`  - 发现 ${this.warnings.filter(w => w.includes('引用了不存在的文档')).length} 个警告`);
  }

  validateTraceabilityMatrices() {
    console.log('验证追溯矩阵约束...');
    
    const requirementDoc = 'refractdoc/REQUIREMENTS.md';
    if (fs.existsSync(requirementDoc)) {
      const content = fs.readFileSync(requirementDoc, 'utf8');
      
      if (!content.includes('## 追溯矩阵')) {
        this.errors.push("REQUIREMENTS.md 缺少'追溯矩阵'章节");
      }
      
      if (!content.includes('### 需求到设计的追溯')) {
        this.errors.push("REQUIREMENTS.md 缺少'需求到设计的追溯'章节");
      }
    }
    
    const designDoc = 'refractdoc/DESIGN.md';
    if (fs.existsSync(designDoc)) {
      const content = fs.readFileSync(designDoc, 'utf8');
      
      if (!content.includes('### 设计到实施的追溯')) {
        this.errors.push("DESIGN.md 缺少'设计到实施的追溯'章节");
      }
    }
    
    const implementationDoc = 'refractdoc/IMPLEMENTATION.md';
    if (fs.existsSync(implementationDoc)) {
      const content = fs.readFileSync(implementationDoc, 'utf8');
      
      if (!content.includes('### 需求到测试的追溯')) {
        this.errors.push("IMPLEMENTATION.md 缺少'需求到测试的追溯'章节");
      }
    }
    
    console.log(`  - 发现 ${this.errors.filter(e => e.includes('追溯矩阵') || e.includes('追溯')).length} 个错误`);
  }

  validateLogicConsistency() {
    console.log('验证逻辑一致性约束...');
    
    const requirementDoc = 'refractdoc/REQUIREMENTS.md';
    if (fs.existsSync(requirementDoc)) {
      const content = fs.readFileSync(requirementDoc, 'utf8');
      
      const match = content.match(/^#### FR-/gm);
      const funcReqCount = match ? match.length : 0;
      
      if (funcReqCount !== 22) {
        this.errors.push(`功能需求数量不一致: 期望 22, 实际 ${funcReqCount}`);
      }
    }
    
    console.log(`  - 发现 ${this.errors.filter(e => e.includes('数量不一致')).length} 个错误`);
  }

  validateSpeckitCompliance() {
    console.log('验证 Speckit 规范约束...');
    
    const docs = this.getMarkdownFiles('refractdoc');
    
    for (const doc of docs) {
      const content = fs.readFileSync(`refractdoc/${doc}`, 'utf8');
      
      if (!content.match(/^## 1\. 概述/m)) {
        this.errors.push(`${doc} 缺少'概述'章节`);
      }
      
      if (!content.includes('## 变更历史')) {
        this.warnings.push(`${doc} 缺少'变更历史'章节`);
      }
    }
    
    console.log(`  - 发现 ${this.errors.filter(e => e.includes('概述')).length} 个错误`);
    console.log(`  - 发现 ${this.warnings.filter(w => w.includes('变更历史')).length} 个警告`);
  }

  getMarkdownFiles(dir) {
    if (!fs.existsSync(dir)) {
      return [];
    }
    
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.md'))
      .filter(f => !f.startsWith('.'));
  }

  reportResults() {
    console.log('');
    console.log('=========================================');
    console.log('  验证结果');
    console.log('=========================================');
    console.log('');
    
    if (this.errors.length > 0) {
      console.log('❌ 错误:');
      this.errors.forEach(error => console.log(`  - ${error}`));
      console.log('');
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️ 警告:');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log('');
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ 所有约束验证通过！');
      console.log('');
      process.exit(0);
    } else if (this.errors.length > 0) {
      console.log(`❌ 发现 ${this.errors.length} 个错误，${this.warnings.length} 个警告`);
      console.log('');
      process.exit(1);
    } else {
      console.log(`⚠️ 发现 ${this.warnings.length} 个警告`);
      console.log('');
      process.exit(0);
    }
  }
}

// 运行验证
try {
  const validator = new DocumentConstraintValidator();
  validator.validateAll();
} catch (error) {
  console.error('验证过程中发生错误:', error);
  process.exit(1);
}