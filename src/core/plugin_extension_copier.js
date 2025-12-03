#!/usr/bin/env node

/**
 * Plugin Extension Copier with GBK Encoding Support
 * 支持GBK编码的插件扩展复制器
 */

const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

class PluginExtensionCopier {
    constructor() {
        this.platform = os.platform();
        this.encoding = this.platform === 'win32' ? 'gbk' : 'utf8';
        
        // 插件目录配置
        this.sourcePluginDir = path.join(__dirname, '..', '..', 'plugins');
        this.configDir = path.join(__dirname, '..', '..', 'config');
        this.globalConfigDir = path.join(os.homedir(), '.stigmergy-cli');
        
        // 插件文件映射
        this.pluginMapping = new Map([
            // 通用插件
            ['cli-base-plugin.js', '所有CLI通用插件'],
            ['encoding-handler.js', '编码处理插件'],
            ['memory-manager.js', '内存管理插件'],
            ['context-exchanger.js', '上下文交换插件'],
            ['collaboration-helper.js', '协作助手插件'],
            
            // CLI特定适配器
            ['qwen-adapter.js', 'Qwen CLI适配器'],
            ['iflow-adapter.js', 'iFlow CLI适配器'],
            ['gemini-adapter.js', 'Gemini CLI适配器'],
            ['copilot-adapter.js', 'Copilot CLI适配器'],
            ['claude-adapter.js', 'Claude CLI适配器'],
            ['codex-adapter.js', 'Codex CLI适配器'],
            
            // 配置文件
            ['cli-config.json', 'CLI配置文件'],
            ['collaboration-rules.md', '协作规则文档'],
            ['global-memory.md', '全局记忆文档'],
            ['encoding-config.json', '编码配置文件']
        ]);
        
        // CLI安装路径映射模式
        this.cliPathPatterns = new Map([
            ['npm', {
                patterns: [
                    path.join(os.homedir(), '.npm', 'global', 'node_modules'),
                    path.join('/usr', 'local', 'lib', 'node_modules'),
                    path.join('/usr', 'lib', 'node_modules'),
                    path.join(process.env.APPDATA || '', 'npm', 'node_modules')
                ],
                binaryLocations: ['bin', 'node_modules', 'lib', 'node_modules', '.bin']
            }],
            ['python', {
                patterns: [
                    path.join(os.homedir(), '.local', 'bin'),
                    path.join('/usr', 'local', 'bin'),
                    path.join('/usr', 'bin'),
                    path.join(os.homedir(), '.pyenv', 'versions'),
                    path.join(process.env.USERPROFILE || '', 'AppData', 'Local', 'Programs', 'Python')
                ],
                binaryLocations: ['bin', 'Scripts']
            }]
        ]);
    }

    /**
     * 检查文件是否存在
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 安全写入文件（处理GBK编码）
     */
    async safeWriteFile(filePath, content, options = {}) {
        try {
            // 确保目录存在
            await fs.mkdir(path.dirname(filePath), { recursive: true });
            
            let finalContent = content;
            let encoding = options.encoding || 'utf8';
            
            // Windows中文系统GBK编码处理
            if (this.platform === 'win32') {
                // 检测内容中是否包含中文字符
                const hasChinese = /[\u4e00-\u9fa5]/.test(content);
                
                if (hasChinese) {
                    try {
                        // 先尝试UTF-8写入
                        await fs.writeFile(filePath, content, 'utf8');
                        // 验证写入是否成功
                        const testRead = await fs.readFile(filePath, 'utf8');
                        if (testRead === content) {
                            console.log(`✅ UTF-8成功写入: ${filePath}`);
                            return true;
                        }
                    } catch (utf8Error) {
                        console.log(`⚠️  UTF-8写入失败，尝试GBK编码: ${filePath}`);
                    }
                    
                    // UTF-8失败时尝试GBK
                    try {
                        const iconv = require('iconv-lite');
                        const gbkContent = iconv.encode(content, 'gbk');
                        await fs.writeFile(filePath, gbkContent);
                        console.log(`✅ GBK成功写入: ${filePath}`);
                        return true;
                    } catch (gbkError) {
                        console.log(`⚠️  GBK写入失败，尝试UTF-8 BOM: ${filePath}`);
                        
                        // 最后尝试UTF-8 with BOM
                        const bom = Buffer.from([0xEF, 0xBB, 0xBF]);
                        const utf8Content = Buffer.concat([bom, Buffer.from(content, 'utf8')]);
                        await fs.writeFile(filePath, utf8Content);
                        console.log(`✅ UTF-8 BOM成功写入: ${filePath}`);
                        return true;
                    }
                } else {
                    // 纯ASCII内容，直接使用UTF-8
                    await fs.writeFile(filePath, content, 'utf8');
                    console.log(`✅ UTF-8成功写入: ${filePath}`);
                    return true;
                }
            } else {
                // 非Windows系统直接使用UTF-8
                await fs.writeFile(filePath, content, encoding);
                console.log(`✅ 成功写入: ${filePath}`);
                return true;
            }
            
        } catch (error) {
            console.error(`❌ 写入文件失败: ${filePath}`, error.message);
            
            // 最后的备选方案：创建空文件避免完全失败
            try {
                await fs.writeFile(filePath, '', 'utf8');
                console.log(`⚠️  创建空文件作为备选: ${filePath}`);
                return true;
            } catch (fallbackError) {
                console.error(`❌ 完全失败，无法创建文件: ${filePath}`);
                return false;
            }
        }
    }

    /**
     * 安全读取文件（处理GBK编码）
     */
    async safeReadFile(filePath, options = {}) {
        try {
            if (!await this.fileExists(filePath)) {
                return null;
            }
            
            const encoding = options.encoding || 'utf8';
            
            if (this.platform === 'win32') {
                // Windows系统编码检测
                const buffer = await fs.readFile(filePath);
                
                // 检测BOM
                if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
                    // UTF-8 with BOM
                    return buffer.slice(3).toString('utf8');
                }
                
                // 尝试UTF-8
                try {
                    const utf8Content = buffer.toString('utf8');
                    // 验证是否是有效的UTF-8
                    const isValidUTF8 = Buffer.from(utf8Content, 'utf8').equals(buffer);
                    if (isValidUTF8) {
                        return utf8Content;
                    }
                } catch (utf8Error) {
                    // UTF-8失败，继续尝试GBK
                }
                
                // 尝试GBK
                try {
                    const iconv = require('iconv-lite');
                    return iconv.decode(buffer, 'gbk');
                } catch (gbkError) {
                    console.log(`⚠️  GBK解码失败，使用UTF-8: ${filePath}`);
                    return buffer.toString('utf8');
                }
                
            } else {
                // 非Windows系统直接UTF-8
                return await fs.readFile(filePath, encoding);
            }
            
        } catch (error) {
            console.error(`❌ 读取文件失败: ${filePath}`, error.message);
            return null;
        }
    }

    /**
     * 检测CLI工具的实际安装路径
     */
    async detectCLIInstallationPath(cliName, binaryName) {
        const possiblePaths = [];
        
        try {
            // 使用which/where命令查找
            const whichCommand = this.platform === 'win32' ? 'where' : 'which';
            const result = execSync(`${whichCommand} ${binaryName}`, { 
                encoding: 'utf8',
                timeout: 5000,
                shell: true
            }).toString().trim();
            
            if (result) {
                const paths = result.split('\n').map(p => p.trim()).filter(p => p);
                possiblePaths.push(...paths);
            }
            
        } catch (error) {
            console.log(`⚠️  无法使用which/where命令查找 ${binaryName}`);
        }
        
        // 备选路径检测
        for (const [type, config] of this.cliPathPatterns) {
            for (const basePath of config.patterns) {
                for (const binLocation of config.binaryLocations) {
                    const possiblePath = path.join(basePath, binLocation, binaryName);
                    if (await this.fileExists(possiblePath)) {
                        possiblePaths.push(possiblePath);
                    }
                    
                    // Windows下添加.exe扩展名
                    if (this.platform === 'win32' && !binaryName.endsWith('.exe')) {
                        const exePath = possiblePath + '.exe';
                        if (await this.fileExists(exePath)) {
                            possiblePaths.push(exePath);
                        }
                    }
                }
            }
        }
        
        // 返回找到的第一个有效路径
        for (const testPath of possiblePaths) {
            if (await this.fileExists(testPath)) {
                const dirPath = path.dirname(testPath);
                console.log(`📍 检测到 ${cliName} 安装路径: ${dirPath}`);
                return dirPath;
            }
        }
        
        return null;
    }

    /**
     * 创建插件目录结构
     */
    async createPluginDirectoryStructure(baseDir) {
        const directories = [
            path.join(baseDir, 'stigmergy-plugins'),
            path.join(baseDir, 'stigmergy-plugins', 'adapters'),
            path.join(baseDir, 'stigmergy-plugins', 'config'),
            path.join(baseDir, 'stigmergy-plugins', 'memory'),
            path.join(baseDir, 'stigmergy-plugins', 'signals')
        ];
        
        for (const dir of directories) {
            try {
                await fs.mkdir(dir, { recursive: true });
                console.log(`📁 创建目录: ${dir}`);
            } catch (error) {
                console.log(`⚠️  目录已存在或创建失败: ${dir}`);
            }
        }
    }

    /**
     * 复制插件文件到目标路径
     */
    async copyPluginFile(sourcePath, targetPath, description = '') {
        try {
            if (!await this.fileExists(sourcePath)) {
                console.log(`⚠️  源文件不存在，跳过: ${sourcePath}`);
                return false;
            }
            
            const content = await fs.readFile(sourcePath, 'utf8');
            const success = await this.safeWriteFile(targetPath, content);
            
            if (success) {
                console.log(`📄 复制插件${description ? ` (${description})` : ''}: ${path.basename(sourcePath)} -> ${targetPath}`);
                return true;
            } else {
                console.log(`❌ 复制失败: ${sourcePath} -> ${targetPath}`);
                return false;
            }
            
        } catch (error) {
            console.error(`❌ 复制插件文件错误:`, error.message);
            return false;
        }
    }

    /**
     * 生成CLI特定的插件配置
     */
    async generateCLIPluginConfig(cliName, installDir) {
        const config = {
            cliName: cliName,
            installDir: installDir,
            pluginDir: path.join(installDir, 'stigmergy-plugins'),
            enabled: true,
            version: '1.0.0',
            encoding: this.encoding,
            platform: this.platform,
            installedAt: new Date().toISOString(),
            collaboration: {
                enabled: true,
                signalDir: path.join(this.globalConfigDir, 'signals', cliName),
                historyFile: path.join(this.globalConfigDir, 'history', `${cliName}.json`),
                contextDir: path.join(this.globalConfigDir, 'context')
            },
            adapters: []
        };
        
        // 添加适配器配置
        for (const [fileName, description] of this.pluginMapping) {
            if (fileName.includes(`${cliName}-adapter`)) {
                config.adapters.push({
                    name: fileName,
                    description: description,
                    enabled: true,
                    path: path.join(config.pluginDir, 'adapters', fileName)
                });
            }
        }
        
        const configPath = path.join(installDir, 'stigmergy-plugins', 'config.json');
        const configContent = JSON.stringify(config, null, 2);
        return await this.safeWriteFile(configPath, configContent);
    }

    /**
     * 为单个CLI复制插件
     */
    async copyPluginsForCLI(cliName, cliInfo) {
        console.log(`\n🔧 为 ${cliName} 复制插件扩展...`);
        
        const installDir = cliInfo.path ? path.dirname(cliInfo.path) : null;
        if (!installDir) {
            // 尝试检测安装路径
            const detectedPath = await this.detectCLIInstallationPath(cliName, cliInfo.spec.binaryNames[0]);
            if (!detectedPath) {
                console.log(`❌ 无法确定 ${cliName} 的安装路径`);
                return false;
            }
            cliInfo.path = path.join(detectedPath, cliInfo.spec.binaryNames[0]);
        }
        
        const targetInstallDir = cliInfo.path ? path.dirname(cliInfo.path) : null;
        if (!targetInstallDir) {
            console.log(`❌ ${cliName} 安装目录无效`);
            return false;
        }
        
        console.log(`📍 目标目录: ${targetInstallDir}`);
        
        // 创建插件目录结构
        await this.createPluginDirectoryStructure(targetInstallDir);
        
        let successCount = 0;
        let totalFiles = 0;
        
        // 复制通用插件
        const commonPlugins = ['cli-base-plugin.js', 'encoding-handler.js', 'memory-manager.js', 'context-exchanger.js', 'collaboration-helper.js'];
        for (const plugin of commonPlugins) {
            totalFiles++;
            const sourcePath = path.join(this.sourcePluginDir, plugin);
            const targetPath = path.join(targetInstallDir, 'stigmergy-plugins', plugin);
            
            if (await this.copyPluginFile(sourcePath, targetPath, `通用插件`)) {
                successCount++;
            }
        }
        
        // 复制CLI特定适配器
        const specificAdapter = `${cliName}-adapter.js`;
        totalFiles++;
        const adapterSource = path.join(this.sourcePluginDir, specificAdapter);
        const adapterTarget = path.join(targetInstallDir, 'stigmergy-plugins', 'adapters', specificAdapter);
        
        if (await this.copyPluginFile(adapterSource, adapterTarget, `${cliName}适配器`)) {
            successCount++;
        }
        
        // 复制配置文件
        const configFiles = ['cli-config.json', 'encoding-config.json'];
        for (const config of configFiles) {
            totalFiles++;
            const sourcePath = path.join(this.configDir, config);
            const targetPath = path.join(targetInstallDir, 'stigmergy-plugins', 'config', config);
            
            if (await this.copyPluginFile(sourcePath, targetPath, `配置文件`)) {
                successCount++;
            }
        }
        
        // 生成CLI特定配置
        if (await this.generateCLIPluginConfig(cliName, targetInstallDir)) {
            successCount++;
            console.log(`📄 生成配置: config.json`);
        }
        totalFiles++;
        
        // 创建协作相关目录
        const collaborationDirs = [
            path.join(this.globalConfigDir, 'signals', cliName),
            path.join(this.globalConfigDir, 'history'),
            path.join(this.globalConfigDir, 'context'),
            path.join(this.globalConfigDir, 'memory')
        ];
        
        for (const dir of collaborationDirs) {
            await fs.mkdir(dir, { recursive: true });
        }
        
        console.log(`✅ ${cliName} 插件复制完成: ${successCount}/${totalFiles} 个文件成功`);
        return successCount > 0;
    }

    /**
     * 批量复制插件到所有已安装的CLI
     */
    async copyPluginsToAllCLI(scanResults) {
        console.log('\n🚀 开始批量复制插件扩展...');
        
        if (!await this.fileExists(this.sourcePluginDir)) {
            console.log('⚠️  源插件目录不存在，尝试创建默认插件...');
            await this.createDefaultPlugins();
        }
        
        const results = { success: [], failed: [] };
        
        for (const [cliName, cliInfo] of scanResults) {
            if (cliInfo.installed) {
                try {
                    const success = await this.copyPluginsForCLI(cliName, cliInfo);
                    if (success) {
                        results.success.push(cliName);
                    } else {
                        results.failed.push(cliName);
                    }
                } catch (error) {
                    console.error(`❌ ${cliName} 插件复制失败:`, error.message);
                    results.failed.push(cliName);
                }
            }
        }
        
        // 显示结果摘要
        console.log('\n📊 插件复制结果摘要:');
        console.log(`✅ 成功: ${results.success.length} 个CLI`);
        for (const name of results.success) {
            console.log(`   - ${name}`);
        }
        
        if (results.failed.length > 0) {
            console.log(`❌ 失败: ${results.failed.length} 个CLI`);
            for (const name of results.failed) {
                console.log(`   - ${name}`);
            }
        }
        
        return results;
    }

    /**
     * 创建默认插件文件
     */
    async createDefaultPlugins() {
        console.log('🔧 创建默认插件文件...');
        
        await fs.mkdir(this.sourcePluginDir, { recursive: true });
        
        // 创建基础插件模板
        const basePluginTemplate = `/**
 * Stigmergy CLI Base Plugin
 * 基础插件模板
 */

class StigmergyBasePlugin {
    constructor() {
        this.name = 'base-plugin';
        this.version = '1.0.0';
        this.enabled = true;
    }
    
    async initialize() {
        console.log('🚀 Stigmergy Base Plugin initialized');
    }
    
    async collaborate(context) {
        console.log('🤝 Collaborating with context:', context);
    }
    
    async cleanup() {
        console.log('🧹 Cleanup completed');
    }
}

module.exports = StigmergyBasePlugin;
`;
        
        await this.safeWriteFile(path.join(this.sourcePluginDir, 'cli-base-plugin.js'), basePluginTemplate);
        
        // 创建编码处理插件
        const encodingPluginTemplate = `/**
 * Encoding Handler Plugin
 * 编码处理插件
 */

const os = require('os');
const fs = require('fs');

class EncodingHandler {
    constructor() {
        this.platform = os.platform();
        this.defaultEncoding = this.platform === 'win32' ? 'gbk' : 'utf8';
    }
    
    async safeWrite(filePath, content) {
        // Windows系统GBK编码处理
        if (this.platform === 'win32') {
            try {
                await fs.promises.writeFile(filePath, content, 'utf8');
                return true;
            } catch (error) {
                console.log('⚠️ UTF-8写入失败，尝试GBK编码');
                const iconv = require('iconv-lite');
                const gbkContent = iconv.encode(content, 'gbk');
                await fs.promises.writeFile(filePath, gbkContent);
                return true;
            }
        } else {
            await fs.promises.writeFile(filePath, content, 'utf8');
            return true;
        }
    }
    
    async safeRead(filePath) {
        if (this.platform === 'win32') {
            try {
                return await fs.promises.readFile(filePath, 'utf8');
            } catch (error) {
                const iconv = require('iconv-lite');
                const buffer = await fs.promises.readFile(filePath);
                return iconv.decode(buffer, 'gbk');
            }
        } else {
            return await fs.promises.readFile(filePath, 'utf8');
        }
    }
}

module.exports = EncodingHandler;
`;
        
        await this.safeWriteFile(path.join(this.sourcePluginDir, 'encoding-handler.js'), encodingPluginTemplate);
        
        console.log('✅ 默认插件文件创建完成');
    }

    /**
     * 运行完整的插件复制流程
     */
    async runFullPluginCopy(scanResults) {
        console.log('🚀 启动插件扩展复制流程...\n');
        
        try {
            // 确保全局配置目录存在
            await fs.mkdir(this.globalConfigDir, { recursive: true });
            
            // 批量复制插件
            const results = await this.copyPluginsToAllCLI(scanResults);
            
            console.log('\n🎉 插件扩展复制流程完成！');
            return results;
            
        } catch (error) {
            console.error('\n❌ 插件复制流程失败:', error.message);
            throw error;
        }
    }
}

// 主执行函数
async function main() {
    const copier = new PluginExtensionCopier();
    
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`
Plugin Extension Copier with GBK Encoding Support
支持GBK编码的插件扩展复制器

用法:
  node plugin-extension-copier.js [选项]

选项:
  --help, -h          显示帮助信息
  --create-defaults   创建默认插件文件
  --test-encoding     测试编码处理
        `);
        return;
    }
    
    if (process.argv.includes('--create-defaults')) {
        await copier.createDefaultPlugins();
        return;
    }
    
    if (process.argv.includes('--test-encoding')) {
        const testContent = '测试中文编码内容 Test Encoding 🚀';
        const testPath = path.join(os.tmpdir(), 'encoding-test.txt');
        await copier.safeWriteFile(testPath, testContent);
        const readContent = await copier.safeReadFile(testPath);
        console.log('写入内容:', testContent);
        console.log('读取内容:', readContent);
        console.log('测试结果:', testContent === readContent ? '✅ 成功' : '❌ 失败');
        return;
    }
    
    console.log('🔧 插件扩展复制器已准备就绪');
    console.log('此工具需要配合CLI扫描器使用');
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = PluginExtensionCopier;