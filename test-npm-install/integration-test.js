const fs = require('fs');
const path = require('path');

// 测试集成脚本
console.log('🔍 Testing ResumeSession Integration...');

// 检查包是否正确安装
try {
  const pkg = require('@stigmergy/resume/package.json');
  console.log(`✅ Package version: ${pkg.version}`);
  console.log(`✅ Package name: ${pkg.name}`);
} catch (e) {
  console.log('❌ Could not load package.json');
  console.log(e.message);
}

// 检查CodeGenerator是否包含Kode方法
try {
  const { CodeGenerator } = require('@stigmergy/resume');
  const generator = new CodeGenerator();
  
  // 检查是否存在generateKodeTemplate方法
  if (typeof generator.generateKodeTemplate === 'function') {
    console.log('✅ generateKodeTemplate method exists');
  } else {
    console.log('❌ generateKodeTemplate method does not exist');
  }
  
  // 检查其他CLI方法
  const cliMethods = ['generateClaudeTemplate', 'generateGeminiTemplate', 'generateQwenTemplate', 
                      'generateIFlowTemplate', 'generateCodeBuddyTemplate', 'generateQoderCLITemplate', 
                      'generateCodexTemplate'];
  
  cliMethods.forEach(method => {
    if (typeof generator[method] === 'function') {
      console.log(`✅ ${method} method exists`);
    } else {
      console.log(`❌ ${method} method does not exist`);
    }
  });
} catch (e) {
  console.log('❌ Could not load CodeGenerator from installed package');
  console.log(e.message);
}

// 检查模板文件是否存在
const templatesPath = path.join(__dirname, 'node_modules', '@stigmergy', 'resume', 'templates');
if (fs.existsSync(templatesPath)) {
  console.log(`✅ Templates directory exists: ${templatesPath}`);
  const templateFiles = fs.readdirSync(templatesPath);
  console.log(`📄 Template files:`, templateFiles);
  
  // 检查是否有kode模板
  const hasKodeTemplate = templateFiles.some(file => file.includes('kode'));
  console.log(hasKodeTemplate ? '✅ Kode template exists' : '❌ Kode template does not exist');
} else {
  console.log('❌ Templates directory does not exist');
}

// 检查dist目录结构
const distPath = path.join(__dirname, 'node_modules', '@stigmergy', 'resume', 'dist');
if (fs.existsSync(distPath)) {
  console.log(`✅ Dist directory exists: ${distPath}`);
  
  // 递归检查dist目录内容
  function checkDir(dir, depth = 0) {
    const indent = '  '.repeat(depth);
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const isDir = fs.statSync(itemPath).isDirectory();
      console.log(`${indent}${isDir ? '📁' : '📄'} ${item}`);
      if (isDir && depth < 3) { // 避免过度深入
        checkDir(itemPath, depth + 1);
      }
    }
  }
  
  checkDir(distPath);
} else {
  console.log('❌ Dist directory does not exist');
}

console.log('\n🔍 Integration testing complete');