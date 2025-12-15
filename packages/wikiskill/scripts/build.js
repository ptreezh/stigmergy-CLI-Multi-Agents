const fs = require('fs-extra');
const path = require('path');

/**
 * 构建脚本
 */
async function build() {
  console.log('开始构建 WikiSkill 包...');
  
  try {
    // 确保目录存在
    await ensureDirectories();
    
    // 复制模板文件
    await copyTemplates();
    
    // 生成版本信息
    await generateVersionInfo();
    
    // 验证包结构
    await validatePackage();
    
    console.log('✅ WikiSkill 包构建完成！');
    
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

/**
 * 确保目录存在
 */
async function ensureDirectories() {
  const directories = [
    'dist',
    'dist/templates',
    'dist/assets',
    'dist/assets/tiddlywiki'
  ];
  
  for (const dir of directories) {
    await fs.ensureDir(dir);
  }
}

/**
 * 复制模板文件
 */
async function copyTemplates() {
  const templateDir = path.join(__dirname, '../templates');
  const distDir = path.join(__dirname, '../dist/templates');
  
  // 复制所有模板文件
  const files = await fs.readdir(templateDir);
  
  for (const file of files) {
    const srcPath = path.join(templateDir, file);
    const destPath = path.join(distDir, file);
    
    await fs.copy(srcPath, destPath);
    console.log(`📄 复制模板: ${file}`);
  }
}

/**
 * 生成版本信息
 */
async function generateVersionInfo() {
  const packageJson = await fs.readJson(path.join(__dirname, '../package.json'));
  
  const versionInfo = {
    name: packageJson.name,
    version: packageJson.version,
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform
  };
  
  await fs.writeJson(
    path.join(__dirname, '../dist/version.json'),
    versionInfo,
    { spaces: 2 }
  );
  
  console.log(`📦 生成版本信息: ${packageJson.name}@${packageJson.version}`);
}

/**
 * 验证包结构
 */
async function validatePackage() {
  const requiredFiles = [
    'src/index.js',
    'src/core/WikiCollaborativeSkill.js',
    'src/core/MultiTopicWikiManager.js',
    'src/core/IntelligentTopicSelector.js',
    'src/core/FeedbackProcessor.js',
    'src/integrators/CLIToolIntegrator.js',
    'src/utils/WikiInitializer.js',
    'src/utils/WikiViewer.js',
    'src/utils/WikiPathResolver.js',
    'templates/topic-template.html',
    'templates/tiddlywiki.js'
  ];
  
  const missing = [];
  
  for (const file of requiredFiles) {
    const filePath = path.join(__dirname, '..', file);
    if (!await fs.pathExists(filePath)) {
      missing.push(file);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`缺少必需文件: ${missing.join(', ')}`);
  }
  
  console.log('✅ 包结构验证通过');
}

/**
 * 清理构建目录
 */
async function clean() {
  const distDir = path.join(__dirname, '../dist');
  
  if (await fs.pathExists(distDir)) {
    await fs.remove(distDir);
    console.log('🧹 清理构建目录');
  }
}

/**
 * 开发模式监听
 */
async function watch() {
  const chokidar = require('chokidar');
  
  console.log('👀 开始监听文件变化...');
  
  // 监听源文件变化
  const watcher = chokidar.watch([
    'src/**/*.js',
    'templates/**/*'
  ], {
    cwd: path.join(__dirname, '..'),
    ignored: /node_modules/
  });
  
  watcher.on('change', async (filePath) => {
    console.log(`📝 文件变化: ${filePath}`);
    await build();
  });
  
  // 初始构建
  await build();
}

// 命令行处理
const command = process.argv[2];

switch (command) {
  case 'build':
    build();
    break;
  case 'clean':
    clean();
    break;
  case 'watch':
    watch();
    break;
  default:
    console.log('可用命令:');
    console.log('  build  - 构建包');
    console.log('  clean  - 清理构建目录');
    console.log('  watch  - 监听文件变化并自动构建');
    break;
}

module.exports = {
  build,
  clean,
  watch
};