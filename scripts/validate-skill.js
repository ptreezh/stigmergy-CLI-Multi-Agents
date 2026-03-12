#!/usr/bin/env node
/**
 * 技能验证工具
 * 
 * 验证技能的格式、内容和可用性
 */

const fs = require('fs');
const path = require('path');

// 技能验证规则
const VALIDATION_RULES = {
  // 必需的前置元数据
  requiredFrontmatter: ['name', 'description', 'version'],
  
  // 必需的内容部分
  requiredSections: ['#', '##'],  // 至少有一个标题
  
  // 最小内容长度
  minContentLength: 100,
  
  // 最大内容长度
  maxContentLength: 50000,
  
  // 禁止的内容
  forbiddenPatterns: [
    /<script[^>]*>[\s\S]*?<\/script>/gi,  // 禁止 script 标签
    /eval\s*\(/gi,  // 禁止 eval
    /require\s*\(\s*['"]child_process['"]\s*\)/gi  // 禁止 child_process
  ],
  
  // 推荐的内容
  recommendedPatterns: [
    /```[\s\S]*```/g,  // 代码块
    /`[^`]+`/g,  // 行内代码
    /\[([^\]]+)\]\(([^)]+)\)/g  // 链接
  ]
};

/**
 * 验证技能文件
 */
function validateSkill(skillPath) {
  const result = {
    path: skillPath,
    valid: true,
    errors: [],
    warnings: [],
    score: 100
  };
  
  // 检查文件是否存在
  if (!fs.existsSync(skillPath)) {
    result.valid = false;
    result.errors.push(`文件不存在：${skillPath}`);
    return result;
  }
  
  // 读取文件内容
  let content;
  try {
    content = fs.readFileSync(skillPath, 'utf8');
  } catch (error) {
    result.valid = false;
    result.errors.push(`读取文件失败：${error.message}`);
    return result;
  }
  
  // 1. 验证前置元数据（支持 Windows 和 Unix 换行符）
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/m);
  if (!frontmatterMatch) {
    result.valid = false;
    result.errors.push('缺少前置元数据（--- 包裹的 YAML）');
    result.score -= 30;
  } else {
    const frontmatter = frontmatterMatch[1];
    for (const field of VALIDATION_RULES.requiredFrontmatter) {
      if (!frontmatter.includes(`${field}:`)) {
        result.valid = false;
        result.errors.push(`缺少必需的元数据字段：${field}`);
        result.score -= 10;
      }
    }
  }
  
  // 2. 验证内容长度
  const contentLength = content.length;
  if (contentLength < VALIDATION_RULES.minContentLength) {
    result.valid = false;
    result.errors.push(`内容太短：${contentLength} 字节（最小 ${VALIDATION_RULES.minContentLength}）`);
    result.score -= 20;
  }
  if (contentLength > VALIDATION_RULES.maxContentLength) {
    result.warnings.push(`内容太长：${contentLength} 字节（最大 ${VALIDATION_RULES.maxContentLength}）`);
    result.score -= 5;
  }
  
  // 3. 验证标题结构
  const headings = content.match(/^#{1,6}\s+.+/gm) || [];
  if (headings.length === 0) {
    result.valid = false;
    result.errors.push('缺少标题结构');
    result.score -= 15;
  }
  
  // 4. 检查禁止的内容
  for (const pattern of VALIDATION_RULES.forbiddenPatterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 0) {
      result.valid = false;
      result.errors.push(`包含禁止的内容：${pattern.source}`);
      result.score -= 20;
    }
  }
  
  // 5. 检查推荐的内容（警告）
  let hasRecommendedContent = false;
  for (const pattern of VALIDATION_RULES.recommendedPatterns) {
    if (pattern.test(content)) {
      hasRecommendedContent = true;
      break;
    }
  }
  if (!hasRecommendedContent) {
    result.warnings.push('缺少推荐的内容（代码块、链接等）');
    result.score -= 5;
  }
  
  // 6. 验证技能名称
  const nameMatch = frontmatterMatch ? frontmatterMatch[1].match(/name:\s*([^\n]+)/) : null;
  if (nameMatch) {
    const skillName = nameMatch[1].trim();
    if (!/^[a-z0-9-]+$/.test(skillName)) {
      result.warnings.push(`技能名称格式不规范：${skillName}（建议使用小写字母、数字和连字符）`);
      result.score -= 5;
    }
  }
  
  // 确保分数不低于 0
  result.score = Math.max(0, result.score);
  
  return result;
}

/**
 * 批量验证技能目录
 */
function validateSkillDirectory(dirPath) {
  const results = {
    total: 0,
    valid: 0,
    invalid: 0,
    skills: []
  };
  
  if (!fs.existsSync(dirPath)) {
    console.error(`目录不存在：${dirPath}`);
    return results;
  }
  
  // 扫描技能目录
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      // 尝试不同的大小写组合
      const skillFiles = ['SKILL.md', 'skill.md', 'Skill.md'];
      let skillMd = null;
      
      for (const fileName of skillFiles) {
        const testPath = path.join(dirPath, entry.name, fileName);
        if (fs.existsSync(testPath)) {
          skillMd = testPath;
          break;
        }
      }
      
      if (skillMd) {
        results.total++;
        const result = validateSkill(skillMd);
        results.skills.push(result);
        
        if (result.valid) {
          results.valid++;
        } else {
          results.invalid++;
        }
      }
    }
  }
  
  return results;
}

/**
 * 格式化输出验证结果
 */
function formatResults(results) {
  let output = '';
  
  if (results.skills) {
    // 批量验证结果
    output += `技能验证报告\n`;
    output += `═`.repeat(70) + '\n\n';
    output += `总计：${results.total} 个技能\n`;
    output += `有效：${results.valid} 个\n`;
    output += `无效：${results.invalid} 个\n\n`;
    
    output += `详细信息:\n`;
    output += `─`.repeat(70) + '\n';
    
    for (const skill of results.skills) {
      output += `\n${skill.valid ? '✅' : '❌'} ${path.basename(path.dirname(skill.path))}\n`;
      output += `   分数：${skill.score}/100\n`;
      
      if (skill.errors.length > 0) {
        output += `   错误:\n`;
        skill.errors.forEach(err => output += `     - ${err}\n`);
      }
      
      if (skill.warnings.length > 0) {
        output += `   警告:\n`;
        skill.warnings.forEach(warn => output += `     - ${warn}\n`);
      }
    }
  } else {
    // 单个技能验证结果
    output += `技能验证结果\n`;
    output += `═`.repeat(70) + '\n\n';
    output += `路径：${results.path}\n`;
    output += `状态：${results.valid ? '✅ 有效' : '❌ 无效'}\n`;
    output += `分数：${results.score}/100\n\n`;
    
    if (results.errors.length > 0) {
      output += `错误:\n`;
      results.errors.forEach(err => output += `  - ${err}\n`);
      output += '\n';
    }
    
    if (results.warnings.length > 0) {
      output += `警告:\n`;
      results.warnings.forEach(warn => output += `  - ${warn}\n`);
      output += '\n';
    }
  }
  
  return output;
}

// CLI 入口
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
技能验证工具

使用方式:
  node scripts/validate-skill.js <skill-path>
  node scripts/validate-skill.js <skill-directory>

示例:
  node scripts/validate-skill.js skills/brainstorming/SKILL.md
  node scripts/validate-skill.js skills/
`);
    process.exit(0);
  }
  
  const targetPath = path.resolve(args[0]);
  
  if (fs.statSync(targetPath).isDirectory()) {
    // 验证目录
    const results = validateSkillDirectory(targetPath);
    console.log(formatResults(results));
    
    // 如果有无效的技能，退出码为 1
    process.exit(results.invalid > 0 ? 1 : 0);
  } else {
    // 验证单个文件
    const result = validateSkill(targetPath);
    console.log(formatResults(result));
    process.exit(result.valid ? 0 : 1);
  }
}

// 导出
module.exports = {
  validateSkill,
  validateSkillDirectory,
  formatResults,
  VALIDATION_RULES
};
