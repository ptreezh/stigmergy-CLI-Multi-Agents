#!/usr/bin/env node

/**
 * Integrated CLI Deployment System
 * 集成CLI部署系统 - 整合所有功能的npm包部署工具
 */

const path = require('path');
const os = require('os');
const fs = require('fs').promises;

// 导入各个模块
const CLIAutoScanner = require('./cli_auto_scanner');
const CLIInstallManager = require('./cli_install_manager');
const PluginExtensionCopier = require('./plugin_extension_copier');
// const SmartAdapterDetector = require('./smart_adapter_detector');

class IntegratedCLIDeployment {
    constructor() {
        this.scanner = new CLIAutoScanner();
        this.installManager = new CLIInstallManager();
        this.pluginCopier = new PluginExtensionCopier();
        // this.adapterDetector = new SmartAdapterDetector();
        
        this.deploymentConfig = {
            globalConfigDir: path.join(os.homedir(), '.stigmergy-cli'),
            logFile: path.join(os.homedir(), '.stigmergy-cli', 'deployment.log'),
            deploymentMode: 'full', // full, scan-only, install-only, plugin-only
            autoInstall: false,
            forceReinstall: false,
            skipVerification: false
        };
        
        this.deploymentResults = {
            scan: { success: false, data: null, errors: [] },
            install: { success: false, data: null, errors: [] },
            plugins: { success: false, data: null, errors: [] },
            adapters: { success: false, data: null, errors: [] }
        };
    }

    /**
     * 初始化部署环境
     */
    async initializeDeployment() {
        console.log('🚀 初始化Stigmergy CLI部署环境...');
        
        try {
            // 创建全局配置目录
            await fs.mkdir(this.deploymentConfig.globalConfigDir, { recursive: true });
            
            // 初始化日志文件
            const logHeader = `# Stigmergy CLI部署日志\n# 开始时间: ${new Date().toISOString()}\n\n`;
            await fs.writeFile(this.deploymentConfig.logFile, logHeader, 'utf8');
            
            console.log('✅ 部署环境初始化完成');
            return true;
            
        } catch (error) {
            console.error('❌ 部署环境初始化失败:', error.message);
            return false;
        }
    }

    /**
     * 记录部署日志
     */
    async logDeployment(message, level = 'INFO') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level}] ${message}\n`;
        
        try {
            await fs.appendFile(this.deploymentConfig.logFile, logEntry, 'utf8');
        } catch (error) {
            console.error('❌ 写入日志失败:', error.message);
        }
        
        // 控制台输出
        switch (level) {
            case 'ERROR':
                console.error(`❌ ${message}`);
                break;
            case 'WARN':
                console.warn(`⚠️  ${message}`);
                break;
            case 'SUCCESS':
                console.log(`✅ ${message}`);
                break;
            default:
                console.log(`ℹ️  ${message}`);
        }
    }

    /**
     * 步骤1: 扫描本地CLI工具
     */
    async step1_ScanLocalCLI() {
        await this.logDeployment('开始步骤1: 扫描本地CLI工具');
        
        try {
            const scanResults = await this.scanner.scanLocalCLI();
            
            this.deploymentResults.scan = {
                success: true,
                data: scanResults,
                errors: []
            };
            
            await this.logDeployment(`扫描完成: ${scanResults.size} 个CLI工具已检查`);
            return scanResults;
            
        } catch (error) {
            this.deploymentResults.scan.errors.push(error.message);
            await this.logDeployment(`扫描失败: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    /**
     * 步骤2: 安装缺失的CLI工具
     */
    async step2_InstallMissingCLI(scanResults) {
        await this.logDeployment('开始步骤2: 安装缺失的CLI工具');
        
        try {
            // 提取未安装的CLI
            const missingCLIs = [];
            for (const [name, info] of scanResults) {
                if (!info.installed) {
                    missingCLIs.push(info);
                }
            }
            
            if (missingCLIs.length === 0) {
                await this.logDeployment('没有缺失的CLI工具');
                this.deploymentResults.install = {
                    success: true,
                    data: { success: [], failed: [] },
                    errors: []
                };
                return { success: [], failed: [] };
            }
            
            // 运行安装流程
            const installResults = await this.installManager.runInstallationFlow(
                missingCLIs, 
                this.deploymentConfig.autoInstall
            );
            
            this.deploymentResults.install = {
                success: true,
                data: installResults,
                errors: []
            };
            
            await this.logDeployment(`安装完成: 成功 ${installResults.success.length} 个，失败 ${installResults.failed.length} 个`);
            return installResults;
            
        } catch (error) {
            this.deploymentResults.install.errors.push(error.message);
            await this.logDeployment(`安装失败: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    /**
     * 步骤3: 重新扫描CLI工具
     */
    async step3_RescanCLI() {
        await this.logDeployment('开始步骤3: 重新扫描CLI工具');
        
        try {
            const scanResults = await this.scanner.rescanLocalCLI();
            
            await this.logDeployment(`重新扫描完成: ${scanResults.size} 个CLI工具已检查`);
            return scanResults;
            
        } catch (error) {
            await this.logDeployment(`重新扫描失败: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    /**
     * 步骤4: 复制插件扩展
     */
    async step4_CopyPluginExtensions(scanResults) {
        await this.logDeployment('开始步骤4: 复制插件扩展');
        
        try {
            const pluginResults = await this.pluginCopier.runFullPluginCopy(scanResults);
            
            this.deploymentResults.plugins = {
                success: true,
                data: pluginResults,
                errors: []
            };
            
            await this.logDeployment(`插件复制完成: 成功 ${pluginResults.success.length} 个，失败 ${pluginResults.failed.length} 个`);
            return pluginResults;
            
        } catch (error) {
            this.deploymentResults.plugins.errors.push(error.message);
            await this.logDeployment(`插件复制失败: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    /**
     * 步骤5: 初始化智能适配器
     */
    async step5_InitializeAdapters(scanResults) {
        await this.logDeployment('开始步骤5: 初始化智能适配器');
        
        try {
            // 简化的适配器配置（暂时不依赖智能检测器）
            const adapterConfig = {
                python: false, // 暂时设为false
                nodejs: true, // Node.js总是可用（当前运行环境）
                preferredMode: 'nodejs-only',
                availableCLIs: []
            };
            
            // 收集已安装的CLI信息
            for (const [name, info] of scanResults) {
                if (info.installed) {
                    adapterConfig.availableCLIs.push({
                        name: name,
                        type: info.type,
                        path: info.path,
                        version: info.version
                    });
                }
            }
            
            // 保存适配器配置
            const configPath = path.join(this.deploymentConfig.globalConfigDir, 'adapter-config.json');
            await fs.writeFile(configPath, JSON.stringify(adapterConfig, null, 2), 'utf8');
            
            this.deploymentResults.adapters = {
                success: true,
                data: adapterConfig,
                errors: []
            };
            
            await this.logDeployment(`适配器初始化完成: ${adapterConfig.availableCLIs.length} 个CLI可用`);
            return adapterConfig;
            
        } catch (error) {
            this.deploymentResults.adapters.errors.push(error.message);
            await this.logDeployment(`适配器初始化失败: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    /**
     * 步骤6: 生成全局记忆文档
     */
    async step6_GenerateGlobalMemory() {
        await this.logDeployment('开始步骤6: 生成全局记忆文档');
        
        try {
            await this.scanner.generateGlobalMemoryFiles();
            
            await this.logDeployment('全局记忆文档生成完成');
            return true;
            
        } catch (error) {
            await this.logDeployment(`全局记忆文档生成失败: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    /**
     * 步骤7: 验证部署结果
     */
    async step7_VerifyDeployment() {
        await this.logDeployment('开始步骤7: 验证部署结果');
        
        try {
            const verificationResults = {
                scan: this.deploymentResults.scan.success,
                install: this.deploymentResults.install.success,
                plugins: this.deploymentResults.plugins.success,
                adapters: this.deploymentResults.adapters.success,
                overall: false
            };
            
            verificationResults.overall = Object.values(verificationResults).every(v => v === true);
            
            if (verificationResults.overall) {
                await this.logDeployment('部署验证成功: 所有步骤都已完成');
            } else {
                await this.logDeployment('部署验证失败: 部分步骤未完成', 'WARN');
            }
            
            return verificationResults;
            
        } catch (error) {
            await this.logDeployment(`部署验证失败: ${error.message}`, 'ERROR');
            throw error;
        }
    }

    /**
     * 生成部署报告
     */
    async generateDeploymentReport() {
        const reportPath = path.join(this.deploymentConfig.globalConfigDir, 'deployment-report.md');
        
        let report = `# Stigmergy CLI部署报告\n\n`;
        report += `> 生成时间: ${new Date().toISOString()}\n\n`;
        
        report += `## 部署概览\n\n`;
        report += `- **部署模式**: ${this.deploymentConfig.deploymentMode}\n`;
        report += `- **自动安装**: ${this.deploymentConfig.autoInstall ? '是' : '否'}\n`;
        report += `- **强制重装**: ${this.deploymentConfig.forceReinstall ? '是' : '否'}\n\n`;
        
        report += `## 部署结果\n\n`;
        
        // 扫描结果
        if (this.deploymentResults.scan.success) {
            const scanData = this.deploymentResults.scan.data;
            const installedCount = Array.from(scanData.values()).filter(info => info.installed).length;
            report += `### CLI工具扫描 ✅\n\n`;
            report += `- 已安装: ${installedCount}/${scanData.size} 个\n`;
            
            for (const [name, info] of scanData) {
                const status = info.installed ? '✅' : '❌';
                report += `  - ${status} ${name}\n`;
            }
            report += `\n`;
        }
        
        // 安装结果
        if (this.deploymentResults.install.success) {
            const installData = this.deploymentResults.install.data;
            report += `### CLI工具安装 ✅\n\n`;
            report += `- 成功安装: ${installData.success.length} 个\n`;
            report += `- 安装失败: ${installData.failed.length} 个\n\n`;
            
            if (installData.success.length > 0) {
                report += `**成功安装的工具**:\n`;
                for (const item of installData.success) {
                    report += `  - ${item.displayName}\n`;
                }
                report += `\n`;
            }
            
            if (installData.failed.length > 0) {
                report += `**安装失败的工具**:\n`;
                for (const item of installData.failed) {
                    report += `  - ${item.displayName}\n`;
                }
                report += `\n`;
            }
        }
        
        // 插件复制结果
        if (this.deploymentResults.plugins.success) {
            const pluginData = this.deploymentResults.plugins.data;
            report += `### 插件扩展复制 ✅\n\n`;
            report += `- 成功复制: ${pluginData.success.length} 个CLI\n`;
            report += `- 复制失败: ${pluginData.failed.length} 个CLI\n\n`;
        }
        
        // 适配器初始化结果
        if (this.deploymentResults.adapters.success) {
            const adapterData = this.deploymentResults.adapters.data;
            report += `### 智能适配器初始化 ✅\n\n`;
            report += `- Python可用: ${adapterData.python ? '是' : '否'}\n`;
            report += `- Node.js可用: ${adapterData.nodejs ? '是' : '否'}\n`;
            report += `- 推荐模式: ${adapterData.preferredMode}\n`;
            report += `- 可用CLI数量: ${adapterData.availableCLIs.length}\n\n`;
        }
        
        // 错误信息
        const allErrors = [
            ...this.deploymentResults.scan.errors,
            ...this.deploymentResults.install.errors,
            ...this.deploymentResults.plugins.errors,
            ...this.deploymentResults.adapters.errors
        ];
        
        if (allErrors.length > 0) {
            report += `## 错误信息\n\n`;
            for (const error of allErrors) {
                report += `- ${error}\n`;
            }
            report += `\n`;
        }
        
        // 使用指南
        report += `## 使用指南\n\n`;
        report += `### 启动CLI协作系统\n\n`;
        report += `\`\`\`bash\n# 使用智能适配器\nnode src/core/smart_adapter_integration.js --mode hybrid\n\n# 或使用环境信号系统\nnode src/core/environment_stigmergy_system.js\n\`\`\`\n\n`;
        
        report += `### 检查系统状态\n\n`;
        report += `\`\`\`bash\nnode src/core/cli_adapter_manager.js status\n\n# 或\nnode src/core/smart_adapter_demo.js --check\n\`\`\`\n\n`;
        
        await fs.writeFile(reportPath, report, 'utf8');
        await this.logDeployment(`部署报告已生成: ${reportPath}`);
        
        return reportPath;
    }

    /**
     * 运行完整部署流程
     */
    async runFullDeployment() {
        console.log('🚀 启动Stigmergy CLI完整部署流程\n');
        
        try {
            // 初始化部署环境
            await this.initializeDeployment();
            
            // 步骤1: 扫描本地CLI工具
            const scanResults = await this.step1_ScanLocalCLI();
            
            // 步骤2: 安装缺失的CLI工具
            await this.step2_InstallMissingCLI(scanResults);
            
            // 步骤3: 重新扫描CLI工具
            const updatedScanResults = await this.step3_RescanCLI();
            
            // 步骤4: 复制插件扩展
            await this.step4_CopyPluginExtensions(updatedScanResults);
            
            // 步骤5: 初始化智能适配器
            await this.step5_InitializeAdapters(updatedScanResults);
            
            // 步骤6: 生成全局记忆文档
            await this.step6_GenerateGlobalMemory();
            
            // 步骤7: 验证部署结果
            const verificationResults = await this.step7_VerifyDeployment();
            
            // 生成部署报告
            const reportPath = await this.generateDeploymentReport();
            
            console.log('\n🎉 Stigmergy CLI部署流程完成！');
            console.log('\n📋 部署摘要:');
            console.log(`✅ CLI工具扫描: ${this.deploymentResults.scan.success ? '成功' : '失败'}`);
            console.log(`✅ CLI工具安装: ${this.deploymentResults.install.success ? '成功' : '失败'}`);
            console.log(`✅ 插件扩展复制: ${this.deploymentResults.plugins.success ? '成功' : '失败'}`);
            console.log(`✅ 智能适配器: ${this.deploymentResults.adapters.success ? '成功' : '失败'}`);
            console.log(`📄 部署报告: ${reportPath}`);
            console.log(`📊 部署日志: ${this.deploymentConfig.logFile}`);
            
            if (verificationResults.overall) {
                console.log('\n🎊 部署完全成功！可以开始使用CLI协作系统');
                console.log('\n🚀 快速启动:');
                console.log('node src/core/smart_adapter_integration.js --demo');
            } else {
                console.log('\n⚠️  部署部分完成，请检查报告和日志');
            }
            
            return verificationResults;
            
        } catch (error) {
            await this.logDeployment(`完整部署流程失败: ${error.message}`, 'ERROR');
            console.error('\n❌ 部署流程失败:', error.message);
            throw error;
        }
    }

    /**
     * 运行指定模式的部署
     */
    async runDeployment(mode = 'full') {
        this.deploymentConfig.deploymentMode = mode;
        
        switch (mode) {
            case 'scan-only':
                return await this.step1_ScanLocalCLI();
                
            case 'install-only':
                const scanResults = await this.step1_ScanLocalCLI();
                return await this.step2_InstallMissingCLI(scanResults);
                
            case 'plugin-only':
                const existingScanResults = await this.step1_ScanLocalCLI();
                return await this.step4_CopyPluginExtensions(existingScanResults);
                
            case 'full':
            default:
                return await this.runFullDeployment();
        }
    }
}

// 主执行函数
async function main() {
    const deployment = new IntegratedCLIDeployment();
    
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
Integrated CLI Deployment System
集成CLI部署系统 - 整合所有功能的npm包部署工具

用法:
  node integrated_cli_deployment.js [模式] [选项]

模式:
  full              完整部署流程 (默认)
  scan-only         仅扫描CLI工具
  install-only      仅安装缺失的CLI
  plugin-only       仅复制插件扩展

选项:
  --help, -h        显示帮助信息
  --auto-install     自动安装所有缺失的CLI (跳过询问)
  --force-reinstall  强制重新安装已存在的CLI
  --skip-verification 跳过安装验证步骤
        `);
        return;
    }
    
    // 设置部署选项
    if (args.includes('--auto-install')) {
        deployment.deploymentConfig.autoInstall = true;
    }
    
    if (args.includes('--force-reinstall')) {
        deployment.deploymentConfig.forceReinstall = true;
    }
    
    if (args.includes('--skip-verification')) {
        deployment.deploymentConfig.skipVerification = true;
    }
    
    // 确定部署模式
    let mode = 'full';
    if (args.includes('scan-only')) mode = 'scan-only';
    else if (args.includes('install-only')) mode = 'install-only';
    else if (args.includes('plugin-only')) mode = 'plugin-only';
    
    try {
        await deployment.runDeployment(mode);
    } catch (error) {
        console.error('\n❌ 部署失败:', error.message);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = IntegratedCLIDeployment;