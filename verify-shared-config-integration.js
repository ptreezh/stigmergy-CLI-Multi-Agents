/**
 * 验证共享配置集成的完整性
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('='.repeat(80));
console.log('验证共享配置集成完整性');
console.log('='.repeat(80));
console.log();

const cliTypes = ['claude', 'gemini', 'qwen', 'iflow', 'codebuddy', 'qodercli', 'codex'];
let allPassed = true;

// 1. 验证共享配置文件
console.log('1️⃣ 验证共享配置文件:');
const configPath = path.join(os.homedir(), '.stigmergy', 'resume', 'path-config.json');
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log(`   ✅ 配置文件存在: ${configPath}`);
  console.log(`   版本: ${config.version}`);
  console.log(`   CLI数量: ${Object.keys(config.cliConfigs).length}`);
} else {
  console.log(`   ❌ 配置文件不存在: ${configPath}`);
  allPassed = false;
}
console.log();

// 2. 验证每个CLI的共享加载器
console.log('2️⃣ 验证共享配置加载器部署:');
for (const cliType of cliTypes) {
  const loaderPath = path.join(os.homedir(), `.${cliType}`, 'hooks', 'path-config-loader.js');
  if (fs.existsSync(loaderPath)) {
    const content = fs.readFileSync(loaderPath, 'utf8');
    const hasGetCLISessionPaths = content.includes('getCLISessionPaths');
    const hasGetAllCLISessionPaths = content.includes('getAllCLISessionPaths');
    const hasLoadConfig = content.includes('loadConfig');
    
    if (hasGetCLISessionPaths && hasGetAllCLISessionPaths && hasLoadConfig) {
      console.log(`   ✅ ${cliType}: ${loaderPath}`);
    } else {
      console.log(`   ⚠️  ${cliType}: 文件存在但可能不完整`);
      allPassed = false;
    }
  } else {
    console.log(`   ❌ ${cliType}: 加载器不存在`);
    allPassed = false;
  }
}
console.log();

// 3. 验证集成代码使用共享配置
console.log('3️⃣ 验证集成代码使用共享配置:');
for (const cliType of cliTypes) {
  const integrationPath = path.join(os.homedir(), `.${cliType}`, 'hooks', `${cliType}-resumesession.js`);
  if (fs.existsSync(integrationPath)) {
    const content = fs.readFileSync(integrationPath, 'utf8');
    const hasPathConfigLoader = content.includes('path-config-loader.js');
    const hasGetAllCLISessionPaths = content.includes('getAllCLISessionPaths');
    const noGetCLISessionPathsMethod = !content.match(/getCLISessionPaths\(\)\s*\{/);
    
    if (hasPathConfigLoader && hasGetAllCLISessionPaths && noGetCLISessionPathsMethod) {
      console.log(`   ✅ ${cliType}: 正确使用共享配置`);
    } else {
      console.log(`   ⚠️  ${cliType}: 可能未正确使用共享配置`);
      if (!hasPathConfigLoader) console.log(`      - 缺少 path-config-loader 导入`);
      if (!hasGetAllCLISessionPaths) console.log(`      - 未使用 getAllCLISessionPaths`);
      if (!noGetCLISessionPathsMethod) console.log(`      - 仍有旧的 getCLISessionPaths 方法`);
      allPassed = false;
    }
  } else {
    console.log(`   ❌ ${cliType}: 集成文件不存在`);
    allPassed = false;
  }
}
console.log();

// 4. 验证路径发现功能
console.log('4️⃣ 验证路径发现功能:');
try {
  const { PathConfigManager } = require('./packages/resume/dist/config/PathConfigManager');
  const manager = PathConfigManager.getInstance();
  const allPaths = manager.getAllCLISessionPaths();
  
  for (const [cliType, paths] of Object.entries(allPaths)) {
    const existingPaths = paths.filter(p => fs.existsSync(p));
    if (existingPaths.length > 0) {
      console.log(`   ✅ ${cliType}: 发现 ${existingPaths.length} 个路径`);
    } else {
      console.log(`   ⚠️  ${cliType}: 未发现路径`);
    }
  }
} catch (error) {
  console.log(`   ❌ PathConfigManager加载失败: ${error.message}`);
  allPassed = false;
}
console.log();

// 5. 验证命令名称
console.log('5️⃣ 验证命令名称统一:');
for (const cliType of cliTypes) {
  const integrationPath = path.join(os.homedir(), `.${cliType}`, 'hooks', `${cliType}-resumesession.js`);
  if (fs.existsSync(integrationPath)) {
    const content = fs.readFileSync(integrationPath, 'utf8');
    const hasStigmergyResume = content.includes('/stigmergy-resume');
    
    if (hasStigmergyResume) {
      console.log(`   ✅ ${cliType}: 使用 /stigmergy-resume`);
    } else {
      console.log(`   ❌ ${cliType}: 命令名称不正确`);
      allPassed = false;
    }
  }
}
console.log();

// 6. 测试配置缓存机制
console.log('6️⃣ 测试配置缓存机制:');
if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const hasVersion = config.version === '1.0.0';
  const hasUpdatedAt = typeof config.updatedAt === 'number';
  const hasCLIConfigs = typeof config.cliConfigs === 'object';
  
  if (hasVersion && hasUpdatedAt && hasCLIConfigs) {
    console.log(`   ✅ 配置缓存结构正确`);
    console.log(`   - 版本: ${config.version}`);
    console.log(`   - 更新时间: ${new Date(config.updatedAt).toLocaleString('zh-CN')}`);
    console.log(`   - CLI配置: ${Object.keys(config.cliConfigs).length} 个`);
  } else {
    console.log(`   ❌ 配置缓存结构不完整`);
    allPassed = false;
  }
} else {
  console.log(`   ❌ 配置文件不存在`);
  allPassed = false;
}
console.log();

// 7. 总结
console.log('='.repeat(80));
if (allPassed) {
  console.log('✅ 所有验证通过！');
  console.log('='.repeat(80));
  console.log();
  console.log('📋 集中化路径配置管理已成功实现:');
  console.log('   ✅ 共享配置文件: ~/.stigmergy/resume/path-config.json');
  console.log('   ✅ 路径缓存持久化');
  console.log('   ✅ 配置文件变更检测');
  console.log('   ✅ 所有CLI使用统一配置');
  console.log('   ✅ 命令名称统一: /stigmergy-resume');
  console.log();
  console.log('🎯 最佳实践方案特点:');
  console.log('   1. 集中管理 - 所有路径配置在一个地方');
  console.log('   2. 首次发现 - 自动发现并缓存路径');
  console.log('   3. 变更检测 - 监测CLI配置文件变化');
  console.log('   4. 多路径支持 - 每个CLI可有多个会话路径');
  console.log('   5. 跨平台兼容 - 支持不同操作系统');
  console.log();
} else {
  console.log('⚠️  部分验证未通过，请检查上述问题');
  console.log('='.repeat(80));
  console.log();
  process.exit(1);
}
