#!/usr/bin/env node

/**
 * 包大小分析工具
 * 分析哪些文件占用了最多的空间
 */

const fs = require('fs');
const path = require('path');

function getDirectorySize(dirPath, extensions = null) {
  let totalSize = 0;
  const files = [];

  function traverse(currentPath) {
    const items = fs.readdirSync(currentPath);

    for (const item of items) {
      const fullPath = path.join(currentPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // 跳过 node_modules 和 .git
        if (item !== 'node_modules' && item !== '.git' && item !== 'dist' && item !== '.stigmergy-project') {
          traverse(fullPath);
        }
      } else if (stat.isFile()) {
        // 检查文件扩展名
        if (!extensions || extensions.some(ext => item.endsWith(ext))) {
          const size = stat.size;
          totalSize += size;
          files.push({
            path: fullPath,
            name: item,
            size: size,
            relativePath: path.relative(process.cwd(), fullPath)
          });
        }
      }
    }
  }

  traverse(dirPath);
  return { totalSize, files };
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

console.log('📦 Stigmergy 包大小分析\n');
console.log('='.repeat(80));

// 分析将要发布的文件
console.log('\n📊 分析将要发布的文件（根据 package.json files 字段）\n');

const filesToPublish = [
  'src/**/*.js',
  'dist/orchestration/**/*.js',
  'config/**/*.json',
  'bin/**/*',
  'package.json',
  'README.md',
  'LICENSE',
  'STIGMERGY.md'
];

let totalPublishSize = 0;
const publishFiles = [];

// 收集 src/**/*.js
const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  function collectSrcFiles(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        collectSrcFiles(fullPath);
      } else if (item.endsWith('.js')) {
        const size = stat.size;
        totalPublishSize += size;
        publishFiles.push({
          path: path.relative(process.cwd(), fullPath),
          size: size
        });
      }
    }
  }
  collectSrcFiles(srcDir);
}

// 收集 dist/orchestration/**/*.js
const distDir = path.join(process.cwd(), 'dist/orchestration');
if (fs.existsSync(distDir)) {
  function collectDistFiles(dir) {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        collectDistFiles(fullPath);
      } else if (item.endsWith('.js')) {
        const size = stat.size;
        totalPublishSize += size;
        publishFiles.push({
          path: path.relative(process.cwd(), fullPath),
          size: size
        });
      }
    }
  }
  collectDistFiles(distDir);
}

// 收集 config/**/*.json
const configDir = path.join(process.cwd(), 'config');
if (fs.existsSync(configDir)) {
  const configFiles = fs.readdirSync(configDir);
  for (const file of configFiles) {
    if (file.endsWith('.json')) {
      const fullPath = path.join(configDir, file);
      const stat = fs.statSync(fullPath);
      totalPublishSize += stat.size;
      publishFiles.push({
        path: path.join('config', file),
        size: stat.size
      });
    }
  }
}

// 收集 bin/**
const binDir = path.join(process.cwd(), 'bin');
if (fs.existsSync(binDir)) {
  const binFiles = fs.readdirSync(binDir);
  for (const file of binFiles) {
    const fullPath = path.join(binDir, file);
    const stat = fs.statSync(fullPath);
    totalPublishSize += stat.size;
    publishFiles.push({
      path: path.join('bin', file),
      size: stat.size
    });
  }
}

// 收集根目录文件
const rootFiles = ['package.json', 'README.md', 'LICENSE', 'STIGMERGY.md'];
for (const file of rootFiles) {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const stat = fs.statSync(fullPath);
    totalPublishSize += stat.size;
    publishFiles.push({
      path: file,
      size: stat.size
    });
  }
}

// 按大小排序
publishFiles.sort((a, b) => b.size - a.size);

console.log(`总大小: ${formatSize(totalPublishSize)} (${totalPublishSize} bytes)\n`);
console.log(`文件总数: ${publishFiles.length}\n`);

console.log('📋 最大的 20 个文件:\n');
console.log('文件路径'.padEnd(60) + '大小');
console.log('-'.repeat(80));

publishFiles.slice(0, 20).forEach(file => {
  console.log(file.path.padEnd(60) + formatSize(file.size).padStart(10));
});

console.log('\n' + '='.repeat(80));

// 分析各目录占用
console.log('\n📂 各目录占用情况:\n');

const dirStats = {};
publishFiles.forEach(file => {
  const dir = path.dirname(file.path);
  if (!dirStats[dir]) {
    dirStats[dir] = { size: 0, count: 0 };
  }
  dirStats[dir].size += file.size;
  dirStats[dir].count++;
});

Object.keys(dirStats)
  .sort((a, b) => dirStats[b].size - dirStats[a].size)
  .forEach(dir => {
    const stats = dirStats[dir];
    const percentage = ((stats.size / totalPublishSize) * 100).toFixed(1);
    console.log(`${dir.padEnd(40)} ${formatSize(stats.size).padStart(10)} (${percentage}%) - ${stats.count} 个文件`);
  });

console.log('\n' + '='.repeat(80));

// 检查是否有不应该发布的大文件
console.log('\n⚠️  检查可能的问题:\n');

const largeFiles = publishFiles.filter(f => f.size > 100 * 1024); // 大于 100KB
if (largeFiles.length > 0) {
  console.log('发现大文件 (>100KB):\n');
  largeFiles.forEach(file => {
    console.log(`  ${file.path} - ${formatSize(file.size)}`);
  });
  console.log('\n提示: 考虑是否这些文件应该被发布，或者可以优化\n');
} else {
  console.log('✓ 没有发现异常大的文件\n');
}

// 检查是否有测试文件
const testFiles = publishFiles.filter(f =>
  f.path.includes('test') || f.path.includes('spec') || f.path.includes('__tests__')
);
if (testFiles.length > 0) {
  console.log(`⚠️  发现 ${testFiles.length} 个测试文件将被发布:\n`);
  testFiles.slice(0, 5).forEach(file => {
    console.log(`  ${file.path}`);
  });
  if (testFiles.length > 5) {
    console.log(`  ... 还有 ${testFiles.length - 5} 个`);
  }
  console.log('\n建议: 在 .npmignore 中添加 **/*test*.js 和 **/*spec*.js\n');
}

// 估算压缩后大小
const estimatedCompressedSize = Math.floor(totalPublishSize * 0.4); // 假设压缩率 60%
console.log('📦 压缩后估算:\n');
console.log(`  未压缩大小: ${formatSize(totalPublishSize)}`);
console.log(`  估算压缩后: ${formatSize(estimatedCompressedSize)}`);
console.log(`  压缩率: ~60%\n`);

console.log('='.repeat(80));
console.log('✓ 分析完成\n');
