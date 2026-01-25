/**
 * 打包 iflow 的 agents 和 skills 到 stigmergy 包中
 * 用于在 npm install 时自动部署
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');

async function bundleIflowResources() {
  console.log('📦 开始打包 iflow 资源...\n');

  const iflowConfigPath = path.join(os.homedir(), '.iflow');
  const bundleDir = path.join(__dirname, '..', 'config', 'bundle', 'iflow-bundle');

  // 检查 iflow 配置是否存在
  try {
    await fs.access(iflowConfigPath);
  } catch (error) {
    console.error('❌ iflow 配置目录不存在:', iflowConfigPath);
    console.log('💡 请先安装并配置 iflow: npm install -g @iflow-ai/iflow-cli');
    process.exit(1);
  }

  // 创建 bundle 目录
  await fs.mkdir(bundleDir, { recursive: true });

  // 读取 agents
  console.log('📂 读取 agents...');
  const agentsDir = path.join(iflowConfigPath, 'agents');
  const agents = [];

  try {
    const agentFiles = await fs.readdir(agentsDir);

    for (const file of agentFiles) {
      if (file.endsWith('.md')) {
        const filePath = path.join(agentsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        agents.push({
          path: `agents/${file}`,
          content: content
        });
        console.log(`  ✓ ${file}`);
      }
    }
  } catch (error) {
    console.log('  ⚠  无法读取 agents:', error.message);
  }

  // 读取 skills
  console.log('\n📂 读取 skills...');
  const skillsDir = path.join(iflowConfigPath, 'skills');
  const skills = [];

  try {
    const skillDirs = await fs.readdir(skillsDir);

    for (const skillDir of skillDirs) {
      const skillPath = path.join(skillsDir, skillDir);
      const stat = await fs.stat(skillPath);

      if (stat.isDirectory()) {
        // 查找 skill.md 或 SKILL.md
        let skillFile = path.join(skillPath, 'skill.md');
        try {
          await fs.access(skillFile);
        } catch {
          skillFile = path.join(skillPath, 'SKILL.md');
        }

        try {
          const content = await fs.readFile(skillFile, 'utf8');
          skills.push({
            path: `skills/${skillDir}/skill.md`,
            content: content
          });
          console.log(`  ✓ ${skillDir}`);
        } catch (error) {
          console.log(`  ⚠  ${skillDir}: 无 skill.md 文件`);
        }
      }
    }
  } catch (error) {
    console.log('  ⚠  无法读取 skills:', error.message);
  }

  // 创建 config-bundle.json
  console.log('\n📝 创建 config-bundle.json...');
  const configBundle = {
    sourceCLI: 'iflow',
    targetCLIs: ['qwen', 'codebuddy', 'claude', 'qodercli', 'gemini', 'copilot', 'codex'],
    generatedAt: new Date().toISOString(),
    platform: os.platform(),
    summary: {
      totalItems: agents.length + skills.length,
      agentsCount: agents.length,
      skillsCount: skills.length
    },
    configs: {
      iflow: {
        agents: {
          items: agents
        },
        skills: {
          items: skills
        },
        markdown: {
          exists: false
        }
      }
    }
  };

  await fs.writeFile(
    path.join(bundleDir, 'config-bundle.json'),
    JSON.stringify(configBundle, null, 2),
    'utf8'
  );

  // 创建 deployment-manifest.json
  console.log('📝 创建 deployment-manifest.json...');

  // 读取 package.json 获取版本
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

  const manifest = {
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    sourceCLI: 'iflow',
    bundleType: 'iflow-resources',
    deployments: []
  };

  await fs.writeFile(
    path.join(bundleDir, 'deployment-manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8'
  );

  console.log('\n✅ 打包完成！');
  console.log(`📁 Bundle 位置: ${bundleDir}`);
  console.log(`📊 统计: ${agents.length} agents, ${skills.length} skills`);
}

// 运行
bundleIflowResources().catch(error => {
  console.error('\n❌ 打包失败:', error);
  process.exit(1);
});
