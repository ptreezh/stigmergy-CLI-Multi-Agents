/**
 * 自动修复跨平台兼容性问题
 */

const fs = require('fs');
const path = require('path');

/**
 * 修复技能文件的文件系统操作错误处理
 */
function fixFileSystemOperations(content) {
  let fixed = content;
  let fixCount = 0;

  // 1. 在文件顶部添加跨平台工具导入（如果没有）
  if (!fixed.includes('CrossPlatformUtils') && fixed.includes('fs.')) {
    // 找到第一个 require 语句
    const requireMatch = fixed.match(/const \w+ = require\(['"][^'"]+['"]\);/);
    if (requireMatch) {
      const importStatement = "const CrossPlatformUtils = require('../../src/utils/cross-platform-utils');";
      fixed = fixed.replace(requireMatch[0], requireMatch[0] + '\n' + importStatement);
      fixCount++;
      console.log('  ✓ 添加 CrossPlatformUtils 导入');
    }
  }

  // 2. 替换 fs.readFileSync 为安全版本
  fixed = fixed.replace(
    /fs\.readFileSync\(([^,]+),\s*['"]utf-8['"]\)/g,
    (match, filePath) => {
      const varName = `fileResult_${Math.random().toString(36).substr(2, 5)}`;
      return `CrossPlatformUtils.safeReadFile(${filePath}).content || ''`;
    }
  );

  // 3. 替换 fs.writeFileSync 为安全版本
  fixed = fixed.replace(
    /fs\.writeFileSync\(([^,]+),\s*([^,]+),\s*['"]utf-8['"]\)/g,
    (match, filePath, content) => {
      return `CrossPlatformUtils.safeWriteFile(${filePath}, ${content})`;
    }
  );

  // 4. 替换 fs.mkdirSync 为安全版本
  fixed = fixed.replace(
    /fs\.mkdirSync\(([^,]+),\s*\{\s*recursive:\s*true\s*\}\)/g,
    (match, dirPath) => {
      return `CrossPlatformUtils.safeMkdir(${dirPath})`;
    }
  );

  // 5. 替换 fs.readdirSync 为安全版本
  fixed = fixed.replace(
    /fs\.readdirSync\(([^)]+)\)/g,
    (match, dirPath) => {
      return `CrossPlatformUtils.safeReaddir(${dirPath}).files || []`;
    }
  );

  // 6. 替换 fs.existsSync 为安全版本
  fixed = fixed.replace(
    /fs\.existsSync\(([^)]+)\)/g,
    (match, filePath) => {
      return `CrossPlatformUtils.fileExists(${filePath})`;
    }
  );

  // 7. 替换 path.join 为 CrossPlatformUtils.buildPath
  if (fixed.includes('CrossPlatformUtils')) {
    fixed = fixed.replace(
      /path\.join\(/g,
      'CrossPlatformUtils.buildPath('
    );
  }

  // 8. 替换 os.homedir() 为 CrossPlatformUtils.getUserHome()
  if (fixed.includes('CrossPlatformUtils')) {
    fixed = fixed.replace(
      /os\.homedir\(\)/g,
      'CrossPlatformUtils.getUserHome()'
    );
  }

  return { fixed, fixCount };
}

/**
 * 处理单个技能文件
 */
function processSkillFile(filePath) {
  console.log(`\n处理: ${path.basename(filePath)}`);

  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalContent = content;

    // 应用修复
    const { fixed, fixCount } = fixFileSystemOperations(content);

    if (fixed !== originalContent) {
      // 备份原文件
      const backupPath = filePath + '.backup';
      fs.writeFileSync(backupPath, originalContent, 'utf-8');

      // 写入修复后的内容
      fs.writeFileSync(filePath, fixed, 'utf-8');

      console.log(`  ✅ 应用了 ${fixCount} 个修复`);
      console.log(`  📝 备份保存到: ${backupPath}`);
      return { success: true, fixes: fixCount };
    } else {
      console.log('  ℹ️ 无需修复');
      return { success: true, fixes: 0 };
    }

  } catch (error) {
    console.error(`  ❌ 修复失败: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🔧 跨平台兼容性自动修复工具');
  console.log('=============================\n');

  const skillsDir = './skills';

  if (!fs.existsSync(skillsDir)) {
    console.error(`❌ 技能目录不存在: ${skillsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(skillsDir);
  const skillFiles = files
    .filter(f => f.endsWith('.js'))
    .map(f => path.join(skillsDir, f));

  console.log(`找到 ${skillFiles.length} 个技能文件\n`);

  let totalFixes = 0;
  let successCount = 0;

  for (const file of skillFiles) {
    const result = processSkillFile(file);
    if (result.success) {
      successCount++;
      if (result.fixes > 0) {
        totalFixes += result.fixes;
      }
    }
  }

  console.log('\n📊 修复统计:');
  console.log(`  ✅ 成功处理: ${successCount}/${skillFiles.length}`);
  console.log(`  🔧 总修复数: ${totalFixes}`);
  console.log(`  📁 备份文件: ${totalFixes > 0 ? '已创建' : '无需'}`);

  if (totalFixes > 0) {
    console.log('\n💡 提示: 可以通过添加 .backup 后缀的文件恢复原始代码');
  }
}

// 运行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixFileSystemOperations, processSkillFile };
