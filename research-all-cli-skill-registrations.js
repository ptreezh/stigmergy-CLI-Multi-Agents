/**
 * 系统研究每个CLI的skill注册机制
 * 检查：
 * 1. CLI的.md文档中的skills列表格式
 * 2. 是否有合并冲突
 * 3. skills列表的位置和格式
 * 4. 如何注册新skill
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const os = require('os');

class CLISkillRegistrationResearcher {
  constructor() {
    this.cliList = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'copilot', 'codex'];
    this.results = {};
  }

  /**
   * 读取CLI的.md文档
   */
  async readCLIDoc(cliName) {
    const docPaths = [
      path.join(process.cwd(), `${cliName}.md`),
      path.join(os.homedir(), `.${cliName}`, `${cliName}.md`),
      path.join(os.homedir(), `.${cliName}`, `${cliName.toUpperCase()}.md`)
    ];

    for (const docPath of docPaths) {
      try {
        const content = await fs.readFile(docPath, 'utf8');
        return { path: docPath, content };
      } catch (error) {
        // Continue to next path
      }
    }

    return null;
  }

  /**
   * 分析.md文档中的skills部分
   */
  analyzeSkillsSection(content, cliName) {
    const result = {
      hasSkillsSection: false,
      hasMergeConflicts: false,
      skillsFormat: 'unknown',
      skillsCount: 0,
      skillsStartLine: -1,
      skillsEndLine: -1,
      sampleSkills: [],
      registrationMethod: 'unknown'
    };

    const lines = content.split('\n');

    // 查找SKILLS_START标记
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 检测skills部分开始
      if (line.includes('SKILLS_START') || line.includes('<!-- SKILLS_START -->')) {
        result.hasSkillsSection = true;
        result.skillsStartLine = i + 1;
      }

      // 检测合并冲突
      if (line.includes('<<<<<<<') || line.includes('>>>>>>>')) {
        result.hasMergeConflicts = true;
      }

      // 统计skills数量
      if (line.includes('<skill>') || line.includes('<name>')) {
        result.skillsCount++;
      }

      // 检测格式
      if (line.includes('<available_skills>')) {
        result.skillsFormat = 'xml';
      } else if (line.includes('## Skills') || line.includes('### Skills')) {
        result.skillsFormat = 'markdown';
      }

      // 收集sample skills
      if (line.match(/<name>(.*?)<\/name>/)) {
        const match = line.match(/<name>(.*?)<\/name>/);
        if (match && result.sampleSkills.length < 3) {
          result.sampleSkills.push(match[1]);
        }
      }

      // 检测skills部分结束
      if (line.includes('SKILLS_END') || line.includes('<!-- SKILLS_END -->')) {
        result.skillsEndLine = i + 1;
        break;
      }
    }

    // 判断注册方法
    if (result.skillsFormat === 'xml') {
      result.registrationMethod = 'xml-injection';
    } else if (result.skillsFormat === 'markdown') {
      result.registrationMethod = 'markdown-list';
    } else if (result.hasSkillsSection) {
      result.registrationMethod = 'custom';
    }

    return result;
  }

  /**
   * 研究单个CLI
   */
  async researchCLI(cliName) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔍 研究: ${cliName}`);
    console.log('='.repeat(70));

    const result = {
      cliName,
      hasDoc: false,
      docPath: null,
      docExists: false,
      hasSkillsSection: false,
      hasMergeConflicts: false,
      skillsFormat: 'unknown',
      skillsCount: 0,
      sampleSkills: [],
      registrationMethod: 'unknown',
      recommendation: ''
    };

    // 1. 检查.md文档
    console.log('\n1️⃣  检查.md文档...');
    const doc = await this.readCLIDoc(cliName);

    if (!doc) {
      console.log(`   ❌ 未找到 ${cliName}.md`);
      result.recommendation = '需要创建.md文档并添加skills部分';
      return result;
    }

    console.log(`   ✓ 找到文档: ${doc.path}`);
    result.hasDoc = true;
    result.docPath = doc.path;
    result.docExists = true;

    // 2. 分析skills部分
    console.log('\n2️⃣  分析skills部分...');
    const analysis = this.analyzeSkillsSection(doc.content, cliName);

    result.hasSkillsSection = analysis.hasSkillsSection;
    result.hasMergeConflicts = analysis.hasMergeConflicts;
    result.skillsFormat = analysis.skillsFormat;
    result.skillsCount = analysis.skillsCount;
    result.sampleSkills = analysis.sampleSkills;
    result.registrationMethod = analysis.registrationMethod;

    console.log(`   Skills部分: ${analysis.hasSkillsSection ? '✓' : '✗'}`);
    console.log(`   合并冲突: ${analysis.hasMergeConflicts ? '⚠️  是' : '✓ 否'}`);
    console.log(`   格式: ${analysis.skillsFormat}`);
    console.log(`   Skills数量: ${analysis.skillsCount}`);
    console.log(`   注册方法: ${analysis.registrationMethod}`);

    if (analysis.sampleSkills.length > 0) {
      console.log(`   示例skills: ${analysis.sampleSkills.slice(0, 3).join(', ')}`);
    }

    // 3. 生成建议
    console.log('\n3️⃣  生成建议...');
    result.recommendation = this.generateRecommendation(cliName, analysis);

    console.log(`   建议: ${result.recommendation}`);

    return result;
  }

  /**
   * 生成建议
   */
  generateRecommendation(cliName, analysis) {
    if (!analysis.hasSkillsSection) {
      return `需要创建skills部分，使用XML格式注入`;
    }

    if (analysis.hasMergeConflicts) {
      return `需要先解决合并冲突，然后才能注册新skills`;
    }

    if (analysis.skillsFormat === 'xml') {
      return `使用XML格式注册：在<available_skills>中添加<skill>条目`;
    }

    if (analysis.skillsFormat === 'markdown') {
      return `使用Markdown格式注册：在skills列表中添加条目`;
    }

    return '需要进一步研究其格式';
  }

  /**
   * 运行完整研究
   */
  async runFullResearch() {
    console.log('='.repeat(70));
    console.log('🔍 所有CLI的Skill注册机制研究');
    console.log('='.repeat(70));
    console.log(`研究时间: ${new Date().toISOString()}`);
    console.log(`目标CLI: ${this.cliList.join(', ')}`);
    console.log('='.repeat(70));

    for (const cliName of this.cliList) {
      const result = await this.researchCLI(cliName);
      this.results[cliName] = result;
    }

    // 打印汇总
    this.printSummary();

    // 生成详细报告
    await this.generateReport();
  }

  /**
   * 打印汇总
   */
  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('📊 研究结果汇总');
    console.log('='.repeat(70));

    console.log('\n┌─────────────┬──────────┬─────────────┬─────────────┬──────────────┬─────────────┐');
    console.log('│ CLI         │ 有.md    │ Skills部分   │ 合并冲突    │ 格式         │ 注册方法    │');
    console.log('├─────────────┼──────────┼─────────────┼─────────────┼──────────────┼─────────────┤');

    for (const cliName of this.cliList) {
      const result = this.results[cliName];
      const hasDoc = result.hasDoc ? '✓' : '✗';
      const hasSkills = result.hasSkillsSection ? '✓' : '✗';
      const hasConflicts = result.hasMergeConflicts ? '⚠️  ' : '✓';
      const format = result.skillsFormat === 'unknown' ? '?' : result.skillsFormat.substring(0, 10);
      const method = result.registrationMethod === 'unknown' ? '?' : result.registrationMethod.substring(0, 10);

      console.log(`│ ${cliName.padEnd(11)} │ ${hasDoc.padEnd(8)} │ ${hasSkills.padEnd(11)} │ ${hasConflicts.padEnd(11)} │ ${format.padEnd(12)} │ ${method.padEnd(11)} │`);
    }

    console.log('└─────────────┴──────────┴─────────────┴─────────────┴──────────────┴─────────────┘');

    console.log('\n' + '='.repeat(70));
    console.log('💡 关键发现');
    console.log('='.repeat(70));

    const withSkills = Object.values(this.results).filter(r => r.hasSkillsSection).length;
    const withConflicts = Object.values(this.results).filter(r => r.hasMergeConflicts).length;
    const xmlFormat = Object.values(this.results).filter(r => r.skillsFormat === 'xml').length;

    console.log(`\n有Skills部分的CLI: ${withSkills}/${this.cliList.length}`);
    console.log(`有合并冲突的CLI: ${withConflicts}/${this.cliList.length}`);
    console.log(`使用XML格式的CLI: ${xmlFormat}/${this.cliList.length}`);

    if (withConflicts > 0) {
      console.log('\n⚠️  警告: 存在合并冲突，需要先解决！');
    }

    console.log('\n' + '='.repeat(70));
  }

  /**
   * 生成详细报告
   */
  async generateReport() {
    const reportPath = path.join(process.cwd(), 'docs', 'CLI_SKILL_REGISTRATION_RESEARCH.md');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });

    let report = '# 所有CLI的Skill注册机制研究\n\n';
    report += `**研究时间**: ${new Date().toISOString()}\n`;
    report += `**研究范围**: ${this.cliList.join(', ')}\n\n`;
    report += '---\n\n';

    for (const cliName of this.cliList) {
      const result = this.results[cliName];

      report += `## ${cliName}\n\n`;
      report += `- **文档路径**: ${result.docPath || '不存在'}\n`;
      report += `- **Skills部分**: ${result.hasSkillsSection ? '✓ 有' : '✗ 无'}\n`;
      report += `- **合并冲突**: ${result.hasMergeConflicts ? '⚠️ 有' : '✓ 无'}\n`;
      report += `- **Skills格式**: ${result.skillsFormat}\n`;
      report += `- **Skills数量**: ${result.skillsCount}\n`;
      report += `- **注册方法**: ${result.registrationMethod}\n\n`;

      if (result.sampleSkills.length > 0) {
        report += `**示例Skills**:\n`;
        for (const skill of result.sampleSkills) {
          report += `- ${skill}\n`;
        }
        report += '\n';
      }

      report += `**建议**: ${result.recommendation}\n\n`;
      report += '---\n\n';
    }

    await fs.writeFile(reportPath, report, 'utf8');
    console.log(`\n✓ 详细报告已生成: ${reportPath}`);
  }
}

// 主函数
async function main() {
  const researcher = new CLISkillRegistrationResearcher();
  await researcher.runFullResearch();
}

if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = CLISkillRegistrationResearcher;
