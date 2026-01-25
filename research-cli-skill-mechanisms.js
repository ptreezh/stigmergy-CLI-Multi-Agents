/**
 * 深入研究失败CLI的skill机制
 * 目标: claude, qodercli, copilot, codex
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

class CLISkillMechanismResearcher {
  constructor() {
    this.cliTools = ['claude', 'qodercli', 'copilot', 'codex'];
    this.researchResults = {};
  }

  /**
   * 研究单个CLI的skill机制
   */
  async researchSingleCLI(cliName) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`研究 ${cliName.toUpperCase()} 的skill机制`);
    console.log('='.repeat(80));

    const result = {
      cli: cliName,
      config: {},
      directories: {},
      hooks: [],
      plugins: [],
      skills: [],
      documentation: {},
      mechanism: 'unknown'
    };

    // 1. 检查配置目录结构
    console.log('\n步骤1: 检查配置目录结构...');
    result.directories = await this.checkDirectoryStructure(cliName);

    // 2. 查找配置文件
    console.log('\n步骤2: 查找配置文件...');
    result.config = await this.findConfigFiles(cliName);

    // 3. 检查hooks和插件
    console.log('\n步骤3: 检查hooks和插件...');
    const hooksData = await this.checkHooksAndPlugins(cliName);
    result.hooks = hooksData.hooks;
    result.plugins = hooksData.plugins;

    // 4. 查找已存在的skills
    console.log('\n步骤4: 查找已存在的skills...');
    result.skills = await this.findExistingSkills(cliName);

    // 5. 分析.md文档
    console.log('\n步骤5: 分析.md文档...');
    result.documentation = await this.analyzeCLIDocumentation(cliName);

    // 6. 推断skill机制
    console.log('\n步骤6: 推断skill机制...');
    result.mechanism = await this.inferSkillMechanism(cliName, result);

    // 7. 测试不同的部署方式
    console.log('\n步骤7: 测试部署方式...');
    result.deploymentTests = await this.testDeploymentMethods(cliName);

    this.researchResults[cliName] = result;

    return result;
  }

  /**
   * 检查CLI的目录结构
   */
  async checkDirectoryStructure(cliName) {
    const directories = {};
    const basePath = path.join(os.homedir(), `.${cliName}`);

    const dirsToCheck = [
      'skills',
      'agents',
      'hooks',
      'plugins',
      'extensions',
      'config',
      '.config',
      'slash_commands',
      'mcp',
      'node_modules'
    ];

    for (const dir of dirsToCheck) {
      const dirPath = path.join(basePath, dir);
      try {
        const stats = await fs.stat(dirPath);
        directories[dir] = {
          exists: true,
          isDirectory: stats.isDirectory(),
          path: dirPath
        };

        // 列出目录内容
        if (stats.isDirectory()) {
          const files = await fs.readdir(dirPath);
          directories[dir].fileCount = files.length;
          directories[dir].files = files.slice(0, 10); // 只显示前10个
        }
      } catch (error) {
        directories[dir] = {
          exists: false,
          path: dirPath
        };
      }
    }

    // 打印发现的目录
    const foundDirs = Object.entries(directories)
      .filter(([_, info]) => info.exists)
      .map(([name, _]) => name);

    if (foundDirs.length > 0) {
      console.log(`   发现目录: ${foundDirs.join(', ')}`);
    } else {
      console.log(`   未发现任何子目录`);
    }

    return directories;
  }

  /**
   * 查找配置文件
   */
  async findConfigFiles(cliName) {
    const configs = {};
    const basePath = path.join(os.homedir(), `.${cliName}`);

    const configFiles = [
      'config.json',
      'settings.json',
      'package.json',
      '.hooks.json',
      'hooks.json',
      'ssci-skills-config.json',
      'ssci-agents-config.json',
      'plugins.json',
      'extensions.json'
    ];

    for (const file of configFiles) {
      const filePath = path.join(basePath, file);
      try {
        const content = await fs.readFile(filePath, 'utf8');
        configs[file] = {
          exists: true,
          path: filePath,
          size: content.length,
          type: this.detectConfigType(content)
        };

        console.log(`   ✓ ${file} (${configs[file].type})`);
      } catch (error) {
        configs[file] = { exists: false, path: filePath };
      }
    }

    return configs;
  }

  /**
   * 检测配置文件类型
   */
  detectConfigType(content) {
    try {
      JSON.parse(content);
      return 'JSON';
    } catch (error) {
      return 'unknown';
    }
  }

  /**
   * 检查hooks和插件
   */
  async checkHooksAndPlugins(cliName) {
    const result = {
      hooks: [],
      plugins: []
    };

    const basePath = path.join(os.homedir(), `.${cliName}`);

    // 检查多个可能的位置
    const hookPaths = [
      path.join(basePath, 'hooks'),
      path.join(basePath, 'extensions'),
      path.join(basePath, 'plugins'),
      path.join(basePath, 'slash_commands'),
      path.join(basePath, 'mcp')
    ];

    for (const hookPath of hookPaths) {
      try {
        const files = await fs.readdir(hookPath);

        for (const file of files) {
          const filePath = path.join(hookPath, file);
          const stats = await fs.stat(filePath);

          const item = {
            name: file,
            path: filePath,
            type: stats.isDirectory() ? 'directory' : 'file'
          };

          if (file.endsWith('.js') || file.endsWith('.json')) {
            result.hooks.push(item);
          } else if (stats.isDirectory()) {
            result.plugins.push(item);
          }
        }

        if (result.hooks.length > 0 || result.plugins.length > 0) {
          console.log(`   ${path.basename(hookPath)}: ${result.hooks.length} hooks, ${result.plugins.length} plugins`);
        }
      } catch (error) {
        // 目录不存在，跳过
      }
    }

    return result;
  }

  /**
   * 查找已存在的skills
   */
  async findExistingSkills(cliName) {
    const skills = [];
    const basePath = path.join(os.homedir(), `.${cliName}`);

    // 搜索skills目录
    const skillPaths = [
      path.join(basePath, 'skills'),
      path.join(basePath, 'agents'),
      path.join(basePath, 'extensions'),
      path.join(basePath, 'plugins')
    ];

    for (const skillPath of skillPaths) {
      try {
        await fs.access(skillPath);
        await this.searchDirectoryForSkills(skillPath, skills);
      } catch (error) {
        // 目录不存在
      }
    }

    if (skills.length > 0) {
      console.log(`   发现 ${skills.length} 个skills`);
    } else {
      console.log(`   未发现任何skills`);
    }

    return skills;
  }

  /**
   * 递归搜索目录中的skills
   */
  async searchDirectoryForSkills(dirPath, skills) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.searchDirectoryForSkills(fullPath, skills);
        } else if (entry.name === 'skill.md' || entry.name === 'agent.md') {
          skills.push({
            name: path.basename(path.dirname(fullPath)),
            path: fullPath,
            type: entry.name
          });
        }
      }
    } catch (error) {
      // 忽略错误
    }
  }

  /**
   * 分析CLI的.md文档
   */
  async analyzeCLIDocumentation(cliName) {
    const docPath = path.join(process.cwd(), `${cliName}.md`);

    try {
      const content = await fs.readFile(docPath, 'utf8');

      const analysis = {
        exists: true,
        hasSkillsSection: content.includes('<available_skills>'),
        skillCount: (content.match(/<skill>/g) || []).length,
        usesXMLFormat: content.includes('<skills_system>'),
        hasUsageInstructions: content.includes('<usage>')
      };

      console.log(`   ✓ ${cliName}.md 存在`);
      console.log(`     - skill section: ${analysis.hasSkillsSection}`);
      console.log(`     - skill数量: ${analysis.skillCount}`);
      console.log(`     - XML格式: ${analysis.usesXMLFormat}`);

      return analysis;
    } catch (error) {
      console.log(`   ✗ ${cliName}.md 不存在`);
      return { exists: false };
    }
  }

  /**
   * 推断skill机制
   */
  async inferSkillMechanism(cliName, researchData) {
    console.log(`\n   分析数据...`);

    const mechanism = {
      type: 'unknown',
      confidence: 'low',
      evidence: [],
      recommendations: []
    };

    // 检查是否有skills目录
    if (researchData.directories.skills?.exists) {
      mechanism.evidence.push('发现skills目录');
      mechanism.type = 'directory-based';
      mechanism.confidence = 'medium';
      mechanism.recommendations.push('尝试将skill文件部署到skills目录');
    }

    // 检查是否有hooks
    if (researchData.hooks.length > 0) {
      mechanism.evidence.push(`发现${researchData.hooks.length}个hooks`);
      mechanism.recommendations.push('可能使用hooks机制');
    }

    // 检查.md文档
    if (researchData.documentation.hasSkillsSection) {
      mechanism.evidence.push('有skills section');
      if (researchData.documentation.skillCount > 0) {
        mechanism.recommendations.push('.md文档可能需要skill文件配合');
      }
    }

    // 检查配置文件
    const configFiles = Object.entries(researchData.config)
      .filter(([_, info]) => info.exists)
      .map(([name, _]) => name);

    if (configFiles.length > 0) {
      mechanism.evidence.push(`发现配置文件: ${configFiles.join(', ')}`);
      mechanism.recommendations.push('检查配置文件中的skill路径设置');
    }

    // 推断类型
    if (researchData.skills.length > 0) {
      mechanism.type = 'file-based';
      mechanism.confidence = 'high';
      mechanism.evidence.push(`发现${researchData.skills.length}个已存在的skills`);
    } else if (researchData.directories.skills?.exists) {
      mechanism.type = 'directory-based';
    } else if (researchData.hooks.length > 0) {
      mechanism.type = 'hooks-based';
    }

    console.log(`   推断类型: ${mechanism.type}`);
    console.log(`   置信度: ${mechanism.confidence}`);
    console.log(`   证据数量: ${mechanism.evidence.length}`);

    return mechanism;
  }

  /**
   * 测试不同的部署方法
   */
  async testDeploymentMethods(cliName) {
    const tests = [];
    const testSkillName = `test-${cliName}-skill`;

    // 方法1: 部署到skills目录
    console.log(`\n   测试1: 部署到skills目录...`);
    const test1 = await this.deployToSkillsDirectory(cliName, testSkillName);
    tests.push({ method: 'skills-directory', ...test1 });

    // 方法2: 部署到.md文档
    console.log(`   测试2: 部署到.md文档...`);
    const test2 = await this.deployToMarkdownDoc(cliName, testSkillName);
    tests.push({ method: 'markdown-registration', ...test2 });

    // 方法3: 两者都部署
    console.log(`   测试3: 部署到两者...`);
    const test3 = await this.deployToBoth(cliName, testSkillName);
    tests.push({ method: 'both', ...test3 });

    // 清理
    console.log(`\n   清理测试数据...`);
    await this.cleanupTestDeployment(cliName, testSkillName);

    return tests;
  }

  /**
   * 部署到skills目录
   */
  async deployToSkillsDirectory(cliName, skillName) {
    const skillDir = path.join(os.homedir(), `.${cliName}`, 'skills', skillName);
    const skillFile = path.join(skillDir, 'skill.md');

    try {
      await fs.mkdir(skillDir, { recursive: true });
      await fs.writeFile(skillFile, `# ${skillName}\n\nTest skill.`, 'utf8');
      console.log(`     ✓ 已部署到 ${skillDir}`);

      // 测试CLI是否能识别
      const recognized = await this.testCLIRecognition(cliName, skillName);

      return {
        deployed: true,
        path: skillDir,
        recognized
      };
    } catch (error) {
      console.log(`     ✗ 部署失败: ${error.message}`);
      return { deployed: false, error: error.message };
    }
  }

  /**
   * 部署到.md文档
   */
  async deployToMarkdownDoc(cliName, skillName) {
    const docPath = path.join(process.cwd(), `${cliName}.md`);

    try {
      const content = await fs.readFile(docPath, 'utf8');

      if (content.includes(`<name>${skillName}</name>`)) {
        console.log(`     已注册，跳过`);
        return { deployed: true, alreadyExists: true };
      }

      const skillEntry = `
<skill>
<name>${skillName}</name>
<description>Test skill for ${cliName}</description>
<location>stigmergy</location>
</skill>`;

      const endIndex = content.indexOf('</available_skills>');
      if (endIndex === -1) {
        console.log(`     ✗ 未找到</available_skills>标签`);
        return { deployed: false, error: 'No skills section' };
      }

      const newContent = content.slice(0, endIndex) + skillEntry + content.slice(endIndex);
      await fs.writeFile(docPath, newContent, 'utf8');
      console.log(`     ✓ 已注册到 ${docPath}`);

      const recognized = await this.testCLIRecognition(cliName, skillName);

      return {
        deployed: true,
        path: docPath,
        recognized
      };
    } catch (error) {
      console.log(`     ✗ 注册失败: ${error.message}`);
      return { deployed: false, error: error.message };
    }
  }

  /**
   * 部署到两者
   */
  async deployToBoth(cliName, skillName) {
    const result1 = await this.deployToSkillsDirectory(cliName, skillName);
    // 如果第一个失败，返回
    if (!result1.deployed) {
      return result1;
    }

    const result2 = await this.deployToMarkdownDoc(cliName, skillName);

    const recognized = await this.testCLIRecognition(cliName, skillName);

    return {
      deployed: result1.deployed && result2.deployed,
      recognized
    };
  }

  /**
   * 测试CLI是否识别skill
   */
  async testCLIRecognition(cliName, skillName) {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve({ recognized: false, reason: 'timeout' });
      }, 15000); // 15秒超时

      const childProcess = spawn(cliName, [`请使用${skillName}技能`, '-y'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';

      childProcess.stdout.on('data', (data) => {
        output += data.toString();
        if (output.toLowerCase().includes(skillName.toLowerCase())) {
          clearTimeout(timeout);
          childProcess.kill();
          resolve({ recognized: true });
        }
      });

      childProcess.on('close', () => {
        clearTimeout(timeout);
        resolve({ recognized: false, reason: 'not-detected', outputLength: output.length });
      });
    });
  }

  /**
   * 清理测试部署
   */
  async cleanupTestDeployment(cliName, skillName) {
    // 删除skills目录中的测试skill
    const skillDir = path.join(os.homedir(), `.${cliName}`, 'skills', skillName);
    try {
      await fs.rm(skillDir, { recursive: true, force: true });
    } catch (error) {
      // 忽略
    }

    // 从.md文档移除
    const docPath = path.join(process.cwd(), `${cliName}.md`);
    try {
      const content = await fs.readFile(docPath, 'utf8');
      const regex = new RegExp(`<skill>[\\s\\S]*?<name>${skillName}<\\/name>[\\s\\S]*?<\\/skill>`, 'g');
      const cleaned = content.replace(regex, '');
      if (cleaned !== content) {
        await fs.writeFile(docPath, cleaned, 'utf8');
      }
    } catch (error) {
      // 忽略
    }

    console.log(`     ✓ 清理完成`);
  }

  /**
   * 生成研究报告
   */
  generateReport() {
    console.log('\n\n' + '='.repeat(80));
    console.log('研究总结报告');
    console.log('='.repeat(80) + '\n');

    for (const [cliName, result] of Object.entries(this.researchResults)) {
      console.log(`${cliName.toUpperCase()}`);
      console.log('-'.repeat(80));

      // 目录结构
      console.log('\n目录结构:');
      const foundDirs = Object.entries(result.directories)
        .filter(([_, info]) => info.exists)
        .map(([name, info]) => `  - ${name}/ (${info.fileCount || 0} files)`);
      if (foundDirs.length > 0) {
        foundDirs.forEach(line => console.log(line));
      } else {
        console.log('  (无)');
      }

      // Skill机制
      console.log('\nSkill机制:');
      console.log(`  类型: ${result.mechanism.type}`);
      console.log(`  置信度: ${result.mechanism.confidence}`);
      if (result.mechanism.evidence.length > 0) {
        console.log('  证据:');
        result.mechanism.evidence.forEach(e => console.log(`    - ${e}`));
      }
      if (result.mechanism.recommendations.length > 0) {
        console.log('  建议:');
        result.mechanism.recommendations.forEach(r => console.log(`    - ${r}`));
      }

      // 部署测试结果
      console.log('\n部署测试:');
      for (const test of result.deploymentTests) {
        const icon = test.recognized?.recognized ? '✅' : (test.deployed ? '⚠' : '❌');
        const status = test.recognized?.recognized ? '成功' :
                      (test.recognized?.reason === 'timeout' ? '超时' : '未识别');
        console.log(`  ${icon} ${test.method}: ${status}`);
      }

      console.log('\n');
    }

    console.log('='.repeat(80));
  }

  /**
   * 运行完整研究
   */
  async run() {
    console.log('🔍 深入研究失败CLI的skill机制');
    console.log('目标: claude, qodercli, copilot, codex\n');

    for (const cliName of this.cliTools) {
      await this.researchSingleCLI(cliName);
    }

    this.generateReport();
  }
}

// 运行研究
const researcher = new CLISkillMechanismResearcher();
researcher.run().catch(error => {
  console.error('\n❌ 研究过程中出错:', error);
  process.exit(1);
});
