#!/usr/bin/env node

/**
 * 验证发布的包是否包含所有必要的功能文件
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 验证发布的包内容完整性\n');
console.log('='.repeat(80));

// 1. 下载并检查已发布的包
console.log('\n📦 下载已发布的包并检查内容...\n');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const version = pkg.version;

try {
  // 创建临时目录
  const tempDir = path.join(__dirname, '..', 'temp-package-check');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  // 下载已发布的包
  console.log(`下载 stigmergy@${version}...\n`);
  execSync(`cd ${tempDir} && npm pack stigmergy@${version}`, {
    stdio: 'inherit'
  });

  // 解压并检查内容
  const tgzFile = path.join(tempDir, `stigmergy-${version}.tgz`);
  if (fs.existsSync(tgzFile)) {
    console.log('\n✅ 包下载成功\n');

    // 解压
    const extractDir = path.join(tempDir, 'extracted');
    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    try {
      execSync(`tar -xzf "${tgzFile}" -C "${extractDir}"`, {
        stdio: 'pipe'
      });

      console.log('✅ 包解压成功\n');

      // 列出所有文件
      const packageDir = path.join(extractDir, 'package');
      const files = [];
      function listFiles(dir) {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            listFiles(fullPath);
          } else {
            files.push(path.relative(packageDir, fullPath));
          }
        }
      }
      listFiles(packageDir);

      console.log(`📊 包中文件总数: ${files.length}\n`);

      // 2. 检查关键文件是否存在
      console.log('🔍 检查关键文件...\n');

      const criticalFiles = {
        '主入口': 'src/index.js',
        'CLI 启动器': 'bin/stigmergy',
        'Router': 'src/cli/router-beta.js',
        '核心工具': 'src/core/cli_tools.js',
        '路径检测': 'src/core/cli_path_detector.js',
        '安装器': 'src/core/installer.js',
        '智能路由': 'src/core/smart_router.js',
        'Orchestration 核心': 'dist/orchestration/core/CentralOrchestrator.js',
        'EventBus': 'dist/orchestration/events/EventBus.js',
        'HookSystem': 'dist/orchestration/hooks/HookSystem.js',
        'Claude 适配器': 'src/adapters/claude/install_claude_integration.js',
        'Gemini 适配器': 'src/adapters/gemini/install_gemini_integration.js',
        'Qwen 适配器': 'src/adapters/qwen/install_qwen_integration.js',
        'iFlow 适配器': 'src/adapters/iflow/install_iflow_integration.js',
        '配置文件': 'config/enhanced-cli-config.json',
        'README': 'README.md',
        'LICENSE': 'LICENSE',
        'STIGMERGY.md': 'STIGMERGY.md'
      };

      let missingFiles = [];
      for (const [name, filePath] of Object.entries(criticalFiles)) {
        const exists = files.includes(filePath);
        if (exists) {
          console.log(`  ✅ ${name}: ${filePath}`);
        } else {
          console.log(`  ❌ ${name}: ${filePath} (缺失!)`);
          missingFiles.push({ name, path: filePath });
        }
      }

      // 3. 检查不应该包含的文件
      console.log('\n🚫 检查不应该包含的文件...\n');

      const shouldNotInclude = [
        'test',
        'spec',
        '__tests__',
        'comprehensive-e2e-test.js',
        'regression-test.js',
        'e2e-test.js',
        'integration-test.js',
        'SkillInstaller.test.js',
        'test-runner.js',
        'run-all-tests.js',
        'cli-command-test.js',
        '.eslintrc.js',
        'jest.config.js',
        'tsconfig.json'
      ];

      let foundExcluded = [];
      for (const pattern of shouldNotInclude) {
        const found = files.filter(f => f.includes(pattern));
        if (found.length > 0) {
          console.log(`  ⚠️  发现应该排除的文件 (${pattern}): ${found.length} 个`);
          foundExcluded.push(...found.slice(0, 3)); // 只显示前3个
        }
      }

      if (foundExcluded.length === 0) {
        console.log('  ✅ 没有发现不应该包含的文件\n');
      }

      // 4. 功能完整性检查
      console.log('\n🎯 功能模块完整性检查...\n');

      const modules = {
        '适配器': files.filter(f => f.startsWith('src/adapters/')).length,
        'CLI 命令': files.filter(f => f.startsWith('src/cli/commands/')).length,
        '核心组件': files.filter(f => f.startsWith('src/core/')).length,
        'Orchestration': files.filter(f => f.startsWith('dist/orchestration/')).length,
        '配置文件': files.filter(f => f.startsWith('config/')).length,
      };

      for (const [name, count] of Object.entries(modules)) {
        console.log(`  ${name}: ${count} 个文件`);
      }

      // 5. 总结
      console.log('\n' + '='.repeat(80));
      console.log('📊 验证总结\n');

      if (missingFiles.length === 0) {
        console.log('✅ 所有关键文件都已包含！\n');
      } else {
        console.log(`❌ 缺失 ${missingFiles.length} 个关键文件:\n`);
        missingFiles.forEach(f => {
          console.log(`  - ${f.name}: ${f.path}`);
        });
        console.log();
      }

      if (foundExcluded.length === 0) {
        console.log('✅ 测试文件和开发文件已正确排除！\n');
      } else {
        console.log(`⚠️  发现 ${foundExcluded.length} 个不应该包含的文件\n`);
      }

      if (missingFiles.length === 0 && foundExcluded.length === 0) {
        console.log('🎉 包内容完整，可以正常使用！\n');
        console.log('📦 用户安装后将获得完整功能\n');
      } else {
        console.log('⚠️  包内容存在问题，建议修复后重新发布\n');
      }

    } catch (tarError) {
      console.log('❌ 解压失败（Windows 可能需要其他工具）');
      console.log('   尝试使用 npm pack --dry-run 验证...\n');
    }

    // 清理
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }

  } else {
    console.log('❌ 包下载失败\n');
  }

} catch (error) {
  console.log('❌ 验证失败:', error.message);
}

console.log('='.repeat(80));
