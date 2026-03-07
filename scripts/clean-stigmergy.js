#!/usr/bin/env node
/**
 * STIGMERGY.md 清理工具
 * 清理重复的低质量经验，保留有价值的内容
 */

const fs = require('fs');
const path = require('path');

function cleanStigmergy() {
  const stigmergyPath = path.join(__dirname, '..', 'STIGMERGY.md');
  const backupPath = path.join(__dirname, '..', 'STIGMERGY.md.backup');

  console.log('🧹 清理 STIGMERGY.md\n');
  console.log('='.repeat(60));

  // 1. 备份原文件
  console.log('\n📦 步骤 1/5: 备份原文件...');
  const content = fs.readFileSync(stigmergyPath, 'utf-8');
  fs.writeFileSync(backupPath, content, 'utf-8');
  console.log(`   ✅ 已备份到: ${backupPath}`);

  // 2. 分析内容
  console.log('\n📊 步骤 2/5: 分析内容...');

  const lines = content.split('\n');
  let totalExperiences = 0;
  let duplicateExperiences = 0;
  let highQualityExperiences = 0;

  // 查找所有经验层级1
  const experienceIndices = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('# 经验层级 1：快速概览')) {
      totalExperiences++;
      experienceIndices.push(i);

      // 检查经验类型
      if (i + 1 < lines.length) {
        const overview = lines[i + 1].trim();
        if (overview === '遇到并处理了问题') {
          duplicateExperiences++;
        } else if (overview.includes('Promise.all()') || overview.length > 20) {
          highQualityExperiences++;
        }
      }
    }
  }

  console.log(`   📖 总经验数: ${totalExperiences}`);
  console.log(`   ⭐ 高质量: ${highQualityExperiences}`);
  console.log(`   ⚠️  重复低质量: ${duplicateExperiences}`);

  // 3. 清理重复内容
  console.log('\n🧹 步骤 3/5: 清理重复内容...');

  if (duplicateExperiences <= 1) {
    console.log('   ℹ️  没有需要清理的重复内容');
    return;
  }

  // 策略：保留1条"遇到并处理了问题"作为示例，删除其他重复的
  let keptDuplicates = 0;
  const cleanedLines = [];
  let skipNext = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检查是否是重复的经验开始
    if (line.includes('# 经验层级 1：快速概览') && i + 1 < lines.length) {
      const nextLine = lines[i + 1].trim();

      if (nextLine === '遇到并处理了问题') {
        if (keptDuplicates === 0) {
          // 保留第一条作为示例
          keptDuplicates++;
          cleanedLines.push(line);
        } else {
          // 跳过这条重复经验
          skipNext = true;
          console.log(`   🗑️  删除重复经验 #${keptDuplicates + 1} (行 ${i + 1})`);
          keptDuplicates++;
          continue;
        }
      } else {
        // 保留高质量经验
        cleanedLines.push(line);
      }
    } else if (skipNext) {
      // 跳过重复经验的后续内容
      if (line.startsWith('## 并发任务') || line.startsWith('## 🎯')) {
        skipNext = false;
        cleanedLines.push(line);
      }
      // 继续跳过
    } else {
      cleanedLines.push(line);
    }
  }

  console.log(`   ✅ 删除了 ${duplicateExperiences - 1} 条重复经验`);
  console.log(`   ✅ 保留了 1 条基础分析示例`);
  console.log(`   ✅ 保留了 ${highQualityExperiences} 条高质量经验`);

  // 4. 写入清理后的内容
  console.log('\n💾 步骤 4/5: 写入清理后的内容...');
  const cleanedContent = cleanedLines.join('\n');
  fs.writeFileSync(stigmergyPath, cleanedContent, 'utf-8');
  console.log(`   ✅ 已更新: ${stigmergyPath}`);

  // 5. 显示统计
  console.log('\n📊 步骤 5/5: 清理统计');
  console.log('='.repeat(60));
  console.log(`\n原始行数: ${lines.length}`);
  console.log(`清理后行数: ${cleanedLines.length}`);
  console.log(`减少行数: ${lines.length - cleanedLines.length}`);
  console.log(`原始经验数: ${totalExperiences}`);
  console.log(`清理后经验数: ${totalExperiences - (duplicateExperiences - 1)}`);
  console.log(`删除重复经验: ${duplicateExperiences - 1}`);

  console.log('\n✨ 清理完成！');
  console.log(`\n💾 备份文件: ${backupPath}`);
  console.log(`如需恢复: cp ${backupPath} ${stigmergyPath}`);
  console.log('');
}

// 主函数
if (require.main === module) {
  try {
    cleanStigmergy();
  } catch (error) {
    console.error('\n❌ 清理失败:', error.message);
    console.error('\n请确保：');
    console.error('1. STIGMERGY.md 文件存在');
    console.error('2. 有写入权限');
    console.error('3. 文件未被其他程序占用');
    process.exit(1);
  }
}

module.exports = { cleanStigmergy };
